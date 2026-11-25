const categories = {
  Books: { names: ['Engineering Mathematics', 'Organic Chemistry', 'Data Structures', 'Microeconomics', 'Physics: Principles'], base: 650, age: .07 },
  Calculators: { names: ['Scientific calculator', 'Graphing calculator', 'Financial calculator'], base: 1450, age: .035 },
  Cycles: { names: ['City bicycle', 'Hybrid bicycle', 'Single-speed bicycle'], base: 7200, age: .09 },
  Electronics: { names: ['USB-C monitor', 'Wireless keyboard', 'Noise-cancelling headphones', 'Desk lamp'], base: 3200, age: .11 },
  'Hostel essentials': { names: ['Study chair', 'Desk fan', 'Table lamp', 'Storage shelf'], base: 1350, age: .08 }
};
const conditions = ['Like new', 'Good', 'Fair'];
const multipliers = { 'Like new': .88, Good: .72, Fair: .52 };

function generateHistorical() {
  const categoryNames = Object.keys(categories);
  return Array.from({ length: 200 }, (_, i) => {
    const category = categoryNames[i % categoryNames.length];
    const config = categories[category];
    const condition = conditions[(i * 7 + Math.floor(i / 3)) % 3];
    const age = 1 + ((i * 13) % 48) / 12;
    const originalPrice = Math.round((config.base * (.72 + ((i * 17) % 57) / 100)) / 10) * 10;
    const noise = .91 + ((i * 19) % 19) / 100;
    const soldPrice = Math.max(50, Math.round(originalPrice * multipliers[condition] * Math.max(.55, 1 - age * config.age) * noise / 10) * 10);
    return { item: config.names[(i * 3 + Math.floor(i / 5)) % config.names.length], category, condition, age, originalPrice, soldPrice, soldAt: new Date(Date.now() - (i + 3) * 86400000) };
  });
}

module.exports = { categories, conditions, generateHistorical };
