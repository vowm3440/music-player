export interface TrackFormat {
  sampleRate?: number
  bitsPerSample?: number
  bitrate?: number
  lossless?: boolean
  codec?: string
  channels?: number
}

export interface LyricLine {
  time: number // in seconds
  text: string
}

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  year?: number
  genre?: string
  duration: number // in seconds
  url: string // Object URL
  file?: File
  coverUrl?: string
  lyrics?: string
  parsedLyrics?: LyricLine[]
  format: TrackFormat
  dateAdded: number
  isFavorite: boolean
  size: number
  fileName: string
}

export type PlayMode = 'sequence' | 'repeat-all' | 'repeat-one' | 'shuffle'

export type ViewMode = 'songs' | 'albums' | 'artists' | 'favorites'

export interface EQBandConfig {
  frequency: number
  gain: number // -12 to 12 dB
}

export interface EQPreset {
  id: string
  name: string
  gains: number[] // 10 bands
}

export interface PaletteColors {
  primary: string
  secondary: string
  tertiary: string
  quaternary: string
  rawRgb: [number, number, number][]
}

export interface UserPreferences {
  glassOpacity: number // 0.06 - 0.55
  volume: number // 0 - 1
  isMuted: boolean
  playMode: PlayMode
  eqEnabled: boolean
  eqPresetId: string
  customEqGains: number[]
  sidebarCollapsed: boolean
  visualizerMode: 'bars' | 'wave' | 'fluid'
}
