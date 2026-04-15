const PRODUCTS = [
  'Milk 1L', 'Eggs (12)', 'Bread', 'Butter 500g', 'Curd 500g',
  'Tomatoes 1kg', 'Onions 1kg', 'Chicken 500g', 'Rice 1kg', 'Dal 500g',
  'Chips (Large)', 'Cold Drink 2L', 'Juice 1L', 'Noodles (Pack)', 'Biscuits',
  'Shampoo 200ml', 'Soap (x3)', 'Toothpaste', 'Face Wash', 'Hand Sanitizer',
];

const ZONES = ['Zone A', 'Zone B', 'Zone C'];

let orderCounter = 1000;

export function generateOrder() {
  const id = `ORD-${++orderCounter}`;
  const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  const quantity = Math.floor(Math.random() * 4) + 1;
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
  const delayed = Math.random() < 0.15;
  const status = 'pending';

  return {
    id,
    product,
    quantity,
    zone,
    status,
    timestamp: Date.now(),
    delayed,
  };
}

export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
