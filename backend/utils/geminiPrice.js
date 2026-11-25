const { categories } = require('./pricing');

const GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

/**
 * Calls Google Gemini API to estimate the real-world retail price (in INR)
 * for a given item name and category.
 * Tries multiple Flash models in case of temporary 503/404 responses.
 */
async function lookupRealWorldPrice(itemName, category) {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback = categories[category]?.base || 1000;

  if (!apiKey || !itemName || itemName.trim().length < 2) {
    return { originalPrice: fallback, source: 'fallback', note: 'Category baseline price' };
  }

  const prompt = `You are a campus marketplace pricing assistant in India.
What is the approximate real-world new retail price in Indian Rupees (INR) for this item:
Item: "${itemName.trim()}"
Category: "${category || 'General'}"

Respond ONLY with valid JSON in this exact format, no markdown or extra text:
{"retailPriceINR": <integer>, "reason": "<short 6-10 word note about the product>"}`;

  for (const model of GEMINI_MODELS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Gemini (${model}) error:`, response.status, errText);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = rawText.replace(/^```json\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const price = Number(parsed?.retailPriceINR);

      if (Number.isFinite(price) && price >= 50 && price <= 500000) {
        return {
          originalPrice: Math.round(price / 10) * 10,
          source: 'gemini',
          note: String(parsed.reason || 'Real-world retail price via Gemini AI'),
        };
      }
    } catch (err) {
      console.error(`Gemini (${model}) failed:`, err.message);
    }
  }

  return { originalPrice: fallback, source: 'fallback', note: 'Category baseline price' };
}

module.exports = { lookupRealWorldPrice };
