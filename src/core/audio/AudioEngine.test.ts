import { describe, it, expect } from 'vitest'
import { EQ_FREQUENCIES, DEFAULT_EQ_PRESETS } from './AudioEngine'

describe('AudioEngine Configuration', () => {
  it('defines 10 distinct standard Hi-Fi frequency bands', () => {
    expect(EQ_FREQUENCIES).toHaveLength(10)
    expect(EQ_FREQUENCIES[0]).toBe(31)
    expect(EQ_FREQUENCIES[9]).toBe(16000)
    // Verify sorted ascending
    for (let i = 1; i < EQ_FREQUENCIES.length; i++) {
      expect(EQ_FREQUENCIES[i]).toBeGreaterThan(EQ_FREQUENCIES[i - 1])
    }
  })

  it('provides all 8 required standard EQ presets with 10 gains each', () => {
    expect(DEFAULT_EQ_PRESETS.length).toBeGreaterThanOrEqual(8)
    for (const preset of DEFAULT_EQ_PRESETS) {
      expect(preset.gains).toHaveLength(10)
      for (const gain of preset.gains) {
        expect(gain).toBeGreaterThanOrEqual(-12)
        expect(gain).toBeLessThanOrEqual(12)
      }
    }
  })

  it('includes the Flat baseline preset with all 0 dB gains', () => {
    const flat = DEFAULT_EQ_PRESETS.find((p) => p.id === 'flat')
    expect(flat).toBeDefined()
    expect(flat?.gains.every((g) => g === 0)).toBe(true)
  })
})
