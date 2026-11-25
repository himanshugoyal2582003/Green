/** Format a number as Indian Rupee */
export const currency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

/** Safely stringify any value */
export const escapeText = (value) => String(value ?? '');

/** Categories used throughout the app */
export const CATEGORIES = [
  '',
  'Books',
  'Calculators',
  'Cycles',
  'Electronics',
  'Hostel essentials',
];

export const CONDITIONS = ['Like new', 'Good', 'Fair'];
