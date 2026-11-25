const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

/**
 * Thin fetch wrapper.
 * - Automatically prefixes NEXT_PUBLIC_API_URL if configured (e.g. Render backend URL on Netlify).
 * - Automatically attaches Bearer token from localStorage (client-side only).
 * - Safely parses JSON; falls back to the raw text on parse failure.
 * - Throws a readable Error on non-2xx responses.
 */
export async function api(url, options = {}) {
  const headers = { ...options.headers };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('greenToken') : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const targetUrl = url.startsWith('/') && API_BASE ? `${API_BASE}${url}` : url;
  const response = await fetch(targetUrl, { ...options, headers });

  // Safely parse — backend might return plain text on unexpected crashes
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Not JSON — surface the raw message so the UI shows something useful
    if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
    throw new Error('Unexpected non-JSON response from server.');
  }

  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  return data;
}
