export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--paper)',
        color: 'var(--ink)',
        fontFamily: 'var(--sans)',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div>
        <div style={{ fontSize: 40, color: '#91a951', marginBottom: 16 }}>✳</div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, margin: '0 0 8px' }}>
          Page not found
        </h1>
        <p style={{ color: '#77796f', fontSize: 13, marginBottom: 24 }}>
          Looks like this good thing has already found a home.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 20px',
            background: '#21583e',
            color: 'white',
            borderRadius: 5,
            fontWeight: 700,
            fontSize: 12,
            textDecoration: 'none',
          }}
        >
          Back to marketplace ↗
        </a>
      </div>
    </div>
  );
}
