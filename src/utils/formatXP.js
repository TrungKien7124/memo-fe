export function formatXP(xp) {
  if (xp == null) return '0'
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`
  return String(xp)
}
