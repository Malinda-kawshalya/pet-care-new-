export function formatLKR(value) {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
  } catch (e) {
    return `LKR ${amount.toFixed(2)}`;
  }
}

export default formatLKR;
