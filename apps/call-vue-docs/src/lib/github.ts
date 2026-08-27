const REPO = 'retronew/ui-kit'
const FALLBACK_STARS = 0

let cached: Promise<number> | undefined

export function getStarCount(): Promise<number> {
  cached ??= fetch(`https://api.github.com/repos/${REPO}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`GitHub API ${response.status}`)
      return response.json() as Promise<{ stargazers_count: number }>
    })
    .then((data) => data.stargazers_count)
    .catch(() => FALLBACK_STARS)

  return cached
}

export function formatStarCount(count: number): string {
  if (count < 1000) return String(count)
  return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`
}
