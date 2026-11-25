/** Clean geometric SVG icons matching the Green Second Life Figma design */

export function BookIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="10" y="6" width="26" height="36" rx="4" fill="#1f4e37" />
      <rect x="14" y="10" width="24" height="32" rx="3" fill="#f3e9dc" />
      <line x1="19" y1="18" x2="33" y2="18" stroke="#1f4e37" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="19" y1="24" x2="31" y2="24" stroke="#1f4e37" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="19" y1="30" x2="27" y2="30" stroke="#1f4e37" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function CalculatorIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="11" y="5" width="26" height="38" rx="5" fill="#1f4e37" />
      <rect x="15" y="9" width="18" height="9" rx="2" fill="#e6ede6" />
      <rect x="15" y="22" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="22" y="22" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="29" y="22" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="15" y="29" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="22" y="29" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="29" y="29" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="15" y="36" width="11" height="4" rx="1" fill="#ffffff" />
      <rect x="29" y="36" width="4" height="4" rx="1" fill="#c4e37d" />
    </svg>
  );
}

export function CycleIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 48" fill="none" aria-hidden="true">
      <circle cx="14" cy="32" r="9" stroke="#1f4e37" strokeWidth="3.2" />
      <circle cx="42" cy="32" r="9" stroke="#1f4e37" strokeWidth="3.2" />
      <path d="M14 32L24 18H36L42 32M24 18L28 32H14M34 14H39" stroke="#1f4e37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ElectronicsIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="7" y="10" width="34" height="23" rx="3" fill="#1f4e37" />
      <rect x="11" y="14" width="26" height="15" rx="1.5" fill="#e6ede6" />
      <path d="M4 36H44" stroke="#1f4e37" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function HostelIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M18 14L28 8L34 16L24 22L18 14Z" fill="#1f4e37" />
      <path d="M23 19L16 32H30" stroke="#1f4e37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="12" y="35" width="24" height="4" rx="2" fill="#1f4e37" />
    </svg>
  );
}

export function CategoryIcon({ category, size = 44 }) {
  if (category === 'Books') return <BookIcon size={size} />;
  if (category === 'Calculators') return <CalculatorIcon size={size} />;
  if (category === 'Cycles') return <CycleIcon size={size} />;
  if (category === 'Electronics') return <ElectronicsIcon size={size} />;
  return <HostelIcon size={size} />;
}
