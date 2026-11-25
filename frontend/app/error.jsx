'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f7f5ef',
          fontFamily: "'DM Sans', sans-serif",
          textAlign: 'center',
          padding: '20px',
          margin: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 40, color: '#a14331', marginBottom: 16 }}>✳</div>
          <h2 style={{ fontSize: 22, margin: '0 0 8px' }}>Something went wrong</h2>
          <p style={{ color: '#77796f', fontSize: 13, marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '12px 20px',
              background: '#21583e',
              color: 'white',
              border: 0,
              borderRadius: 5,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Try again ↗
          </button>
        </div>
      </body>
    </html>
  );
}
