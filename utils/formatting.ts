// Format large numbers with suffixes (K, M, B, T, Q)
export function formatNumber(num: number): string {
  if (num === 0) return '0'
  if (isNaN(num)) return '0'
  if (!isFinite(num)) return '∞'

  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  if (abs < 1000) {
    return sign + abs.toFixed(2)
  } else if (abs < 1_000_000) {
    // Thousands
    return sign + (abs / 1_000).toFixed(2) + 'K'
  } else if (abs < 1_000_000_000) {
    // Millions
    return sign + (abs / 1_000_000).toFixed(2) + 'M'
  } else if (abs < 1_000_000_000_000) {
    // Billions
    return sign + (abs / 1_000_000_000).toFixed(2) + 'B'
  } else if (abs < 1_000_000_000_000_000) {
    // Trillions
    return sign + (abs / 1_000_000_000_000).toFixed(2) + 'T'
  } else {
    // Quadrillions and beyond
    return sign + (abs / 1_000_000_000_000_000).toFixed(2) + 'Q'
  }
}

// Format currency with $ sign
export function formatCurrency(num: number): string {
  return '$' + formatNumber(num)
}

// Calculate percentage of a base value
export function calculatePercentage(base: number, percentage: number): number {
  return (base * percentage) / 100
}
