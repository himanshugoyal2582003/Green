export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--paper)',
        color: 'var(--muted)',
        fontFamily: 'var(--sans)',
        fontSize: 13,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✳</div>
        <p>Finding good things…</p>
      </div>
    </div>
  );
}
