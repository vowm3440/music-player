import { describe, it, expect } from 'vitest'
import { parseLrc, findActiveLyricIndex } from './lrcParser'
import type { LyricLine } from '../../types'

describe('LRC Parser', () => {
  it('parses standard [mm:ss.xx] timestamps accurately', () => {
    const raw = `
      [00:05.50]First line
      [01:12.75]Second line
    `
    const parsed = parseLrc(raw)
    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toEqual({ time: 5.5, text: 'First line' })
    expect(parsed[1]).toEqual({ time: 72.75, text: 'Second line' })
  })

  it('handles millisecond [mm:ss.xxx] timestamps', () => {
    const raw = '[00:03.250]Precise millisecond line'
    const parsed = parseLrc(raw)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].time).toBeCloseTo(3.25, 3)
    expect(parsed[0].text).toBe('Precise millisecond line')
  })

  it('handles multiple timestamps on a single line', () => {
    const raw = '[00:10.00][00:25.00]Repeated chorus line'
    const parsed = parseLrc(raw)
    expect(parsed).toHaveLength(2)
    expect(parsed[0].time).toBe(10)
    expect(parsed[0].text).toBe('Repeated chorus line')
    expect(parsed[1].time).toBe(25)
    expect(parsed[1].text).toBe('Repeated chorus line')
  })

  it('applies [offset:+/-ms] tag to all lines correctly', () => {
    const raw = `
      [offset:500]
      [00:02.00]Delayed line
    `
    const parsed = parseLrc(raw)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].time).toBe(2.5) // 2.0s + 0.5s offset
  })

  it('sorts lines chronologically regardless of input order', () => {
    const raw = `
      [01:00.00]Later line
      [00:10.00]Earlier line
    `
    const parsed = parseLrc(raw)
    expect(parsed[0].text).toBe('Earlier line')
    expect(parsed[1].text).toBe('Later line')
  })

  it('ignores metadata headers and blank lines safely', () => {
    const raw = `
      [ti:Liquid Glass Title]
      [ar:Apple Tahoe Lab]
      [al:macOS Tahoe]
      [by:Antigravity]
      
      [00:05.00]Actual lyric line
    `
    const parsed = parseLrc(raw)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].text).toBe('Actual lyric line')
  })

  it('gracefully handles empty and null inputs', () => {
    expect(parseLrc('')).toEqual([])
    expect(parseLrc(null as unknown as string)).toEqual([])
  })
})

describe('findActiveLyricIndex', () => {
  const lyrics: LyricLine[] = [
    { time: 10, text: 'First' },
    { time: 20, text: 'Second' },
    { time: 30, text: 'Third' },
  ]

  it('returns -1 if time is before the first lyric line', () => {
    expect(findActiveLyricIndex(lyrics, 5)).toBe(-1)
  })

  it('returns exact match index', () => {
    expect(findActiveLyricIndex(lyrics, 10)).toBe(0)
    expect(findActiveLyricIndex(lyrics, 20)).toBe(1)
  })

  it('returns the preceding lyric index when between timestamps', () => {
    expect(findActiveLyricIndex(lyrics, 15)).toBe(0)
    expect(findActiveLyricIndex(lyrics, 25)).toBe(1)
  })

  it('returns the last lyric index when past the end', () => {
    expect(findActiveLyricIndex(lyrics, 50)).toBe(2)
  })

  it('returns -1 for empty lyrics list', () => {
    expect(findActiveLyricIndex([], 10)).toBe(-1)
  })
})
