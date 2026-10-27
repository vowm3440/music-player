import type { LyricLine } from '../../types'

/**
 * Parses raw LRC string into a sorted array of LyricLine objects.
 * Supports standard `[mm:ss.xx]`, millisecond `[mm:ss.xxx]`, multiple timestamps per line,
 * and handles time offsets `[offset:+/-ms]`.
 */
export function parseLrc(rawLrc: string): LyricLine[] {
  if (!rawLrc || typeof rawLrc !== 'string') return []

  const lines = rawLrc.split(/\r?\n/)
  const parsed: LyricLine[] = []
  let offsetMs = 0

  // Standard timestamp pattern: [01:23.45] or [01:23.456] or [01:23]
  const timeExp = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g
  const offsetExp = /\[offset:\s*([+-]?\d+)\s*\]/i

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Check for offset header
    const offsetMatch = trimmed.match(offsetExp)
    if (offsetMatch) {
      offsetMs = parseInt(offsetMatch[1], 10) || 0
      continue
    }

    // Ignore metadata headers like [ti:...], [ar:...]
    if (/^\[[a-z]{2,}:.*\]$/i.test(trimmed)) {
      continue
    }

    const matches: number[] = []
    let match: RegExpExecArray | null

    timeExp.lastIndex = 0
    while ((match = timeExp.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10)
      const seconds = parseInt(match[2], 10)
      const rawSubSeconds = match[3] || '0'
      const fraction = rawSubSeconds.length === 3 
        ? parseInt(rawSubSeconds, 10) / 1000 
        : parseInt(rawSubSeconds, 10) / 100

      const totalSeconds = minutes * 60 + seconds + fraction
      matches.push(totalSeconds)
    }

    if (matches.length > 0) {
      // Remove all timestamps from the line to extract text
      const text = trimmed.replace(timeExp, '').trim()
      if (text) {
        for (const time of matches) {
          const finalTime = Math.max(0, time + offsetMs / 1000)
          parsed.push({ time: finalTime, text })
        }
      }
    }
  }

  // Sort chronologically
  parsed.sort((a, b) => a.time - b.time)
  return parsed
}

/**
 * Finds the currently active lyric index for a given playback time using binary search.
 */
export function findActiveLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics || lyrics.length === 0) return -1
  if (currentTime < lyrics[0].time) return -1

  let low = 0
  let high = lyrics.length - 1
  let result = 0

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (lyrics[mid].time <= currentTime) {
      result = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return result
}
