export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value}%`;
}
