
export function formatUSD(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
