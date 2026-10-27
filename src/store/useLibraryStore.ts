import { create } from 'zustand'
import type { Track, ViewMode, UserPreferences } from '../types'
import {
  parseAudioFile,
  isAudioFile,
  isLrcFile,
  getBaseFileName,
} from '../core/metadata/metadataParser'
import {
  loadFavorites,
  saveFavorites,
  loadUserPreferences,
  saveUserPreferences,
  DEFAULT_PREFERENCES,
} from '../core/storage/idbStorage'
import { audioEngine, DEFAULT_EQ_PRESETS } from '../core/audio/AudioEngine'

interface LibraryState {
  tracks: Track[]
  currentView: ViewMode
  searchQuery: string
  isScanning: boolean
  scanProgress: { current: number; total: number }
  favorites: Set<string>
  preferences: UserPreferences
  isInitialized: boolean

  // Actions
  initLibrary: () => Promise<void>
  setCurrentView: (view: ViewMode) => void
  setSearchQuery: (q: string) => void
  toggleFavorite: (trackId: string) => Promise<void>
  addTracks: (newTracks: Track[]) => void
  removeTrack: (trackId: string) => void
  clearLibrary: () => void
  updatePreferences: (partial: Partial<UserPreferences>) => Promise<void>
  mountDirectory: () => Promise<void>
  importFiles: (fileList: FileList | File[]) => Promise<void>
}

// Built-in synthetic Hi-Fi demo audio generator for initial test out-of-the-box
function createHiFiDemoTracks(): Track[] {
  // We generate gentle synthesized Web Audio music as demo tracks so the user can hear audio immediately
  return [
    {
      id: 'demo-ambient-voyage',
      title: 'Voyage in Liquid Glass (液态玻璃之夜)',
      artist: 'Tahoe Audio Lab',
      album: 'macOS Tahoe Soundscapes',
      year: 2026,
      genre: 'Hi-Res Ambient / Electronic',
      duration: 184,
      url: createSyntheticTrackUrl(432),
      lyrics: `[00:00.00]Voyage in Liquid Glass - Tahoe Audio Lab
[00:08.50]Light refracts through crystalline waves
[00:18.20]Concentric arcs of pure liquid reflection
[00:28.00]R_outer = R_inner + Padding
[00:38.40]Sub-pixel caustics dance in the dark
[00:48.00]Deep sub-bass echoing at 31 Hertz
[00:58.20]High frequencies crystal clear at 96 Kilohertz
[01:08.50]Feel the surface tension glow
[01:18.00]Specular rim catches the studio light
[01:28.50]Floating seamlessly between sound and glass
[01:40.00]A timeless acoustic voyage across Apple Silicon
[01:52.00]Fading gently into ambient silence...`,
      format: {
        codec: 'FLAC',
        sampleRate: 96000,
        bitsPerSample: 24,
        bitrate: 4608000,
        lossless: true,
        channels: 2,
      },
      dateAdded: Date.now(),
      isFavorite: true,
      size: 52428800,
      fileName: 'Voyage_in_Liquid_Glass.flac',
      parsedLyrics: [
        { time: 0, text: 'Voyage in Liquid Glass - Tahoe Audio Lab' },
        { time: 8.5, text: 'Light refracts through crystalline waves' },
        { time: 18.2, text: 'Concentric arcs of pure liquid reflection' },
        { time: 28.0, text: 'R_outer = R_inner + Padding' },
        { time: 38.4, text: 'Sub-pixel caustics dance in the dark' },
        { time: 48.0, text: 'Deep sub-bass echoing at 31 Hertz' },
        { time: 58.2, text: 'High frequencies crystal clear at 96 Kilohertz' },
        { time: 68.5, text: 'Feel the surface tension glow' },
        { time: 78.0, text: 'Specular rim catches the studio light' },
        { time: 88.5, text: 'Floating seamlessly between sound and glass' },
        { time: 100.0, text: 'A timeless acoustic voyage across Apple Silicon' },
        { time: 112.0, text: 'Fading gently into ambient silence...' },
      ],
    },
    {
      id: 'demo-neo-tokyo',
      title: 'Aurora Borealis (极光脉冲)',
      artist: 'Komorebi Sound Ensemble',
      album: 'Optical Refraction',
      year: 2026,
      genre: 'Hi-Fi Synthwave / Neo-Classical',
      duration: 156,
      url: createSyntheticTrackUrl(528),
      lyrics: `[00:00.00]Aurora Borealis - Komorebi Sound Ensemble
[00:07.00]Pulse of the northern lights
[00:15.50]Waves of luminescence sweeping the horizon
[00:24.00]Harmonics vibrating at 528 Hz miracle tone
[00:34.20]Pure dynamic range in 24-bit depth
[00:44.00]Listen to the warmth of vacuum tube emulation
[00:54.50]Fluid mesh gradients glowing softly
[01:05.00]Infinite spatial resonance
[01:16.20]The music breathes with you
[01:28.00]Eternal serenity`,
      format: {
        codec: 'WAV',
        sampleRate: 192000,
        bitsPerSample: 32,
        bitrate: 12288000,
        lossless: true,
        channels: 2,
      },
      dateAdded: Date.now() - 3600000,
      isFavorite: false,
      size: 78643200,
      fileName: 'Aurora_Borealis.wav',
      parsedLyrics: [
        { time: 0, text: 'Aurora Borealis - Komorebi Sound Ensemble' },
        { time: 7.0, text: 'Pulse of the northern lights' },
        { time: 15.5, text: 'Waves of luminescence sweeping the horizon' },
        { time: 24.0, text: 'Harmonics vibrating at 528 Hz miracle tone' },
        { time: 34.2, text: 'Pure dynamic range in 24-bit depth' },
        { time: 44.0, text: 'Listen to the warmth of vacuum tube emulation' },
        { time: 54.5, text: 'Fluid mesh gradients glowing softly' },
        { time: 65.0, text: 'Infinite spatial resonance' },
        { time: 76.2, text: 'The music breathes with you' },
        { time: 88.0, text: 'Eternal serenity' },
      ],
    },
  ]
}

// Generate real acoustic audio WAV data into a Blob URL
function createSyntheticTrackUrl(fundamentalFreq: number): string {
  const sampleRate = 44100
  const duration = 180 // 3 minutes
  const totalSamples = sampleRate * duration
  const buffer = new ArrayBuffer(44 + totalSamples * 2)
  const view = new DataView(buffer)

  // Write WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + totalSamples * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // PCM chunk size
  view.setUint16(20, 1, true) // AudioFormat 1 = PCM
  view.setUint16(22, 1, true) // Mono
  view.setUint32(24, sampleRate, true) // SampleRate
  view.setUint32(28, sampleRate * 2, true) // ByteRate
  view.setUint16(32, 2, true) // BlockAlign
  view.setUint16(34, 16, true) // BitsPerSample
  writeString(36, 'data')
  view.setUint32(40, totalSamples * 2, true)

  // Generate soothing ambient harmonics chords
  const baseFreq = fundamentalFreq
  const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.875]

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate
    const envelope = Math.min(1, t / 4) * Math.min(1, (duration - t) / 4)
    const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.15 * t)
    const subBass = Math.sin(2 * Math.PI * (baseFreq / 4) * t) * 0.35

    let sampleVal = 0
    chord.forEach((freq, idx) => {
      const slowTremolo = 0.8 + 0.2 * Math.sin(2 * Math.PI * (0.2 + idx * 0.08) * t)
      sampleVal += Math.sin(2 * Math.PI * freq * t) * (0.16 / (idx + 1)) * slowTremolo
    })

    sampleVal = (sampleVal * lfo + subBass) * envelope * 0.75
    const clamped = Math.max(-1, Math.min(1, sampleVal))
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
  }

  const blob = new Blob([buffer], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  tracks: [],
  currentView: 'songs',
  searchQuery: '',
  isScanning: false,
  scanProgress: { current: 0, total: 0 },
  favorites: new Set<string>(),
  preferences: DEFAULT_PREFERENCES,
  isInitialized: false,

  initLibrary: async () => {
    if (get().isInitialized) return

    const [savedFavs, savedPrefs] = await Promise.all([
      loadFavorites(),
      loadUserPreferences(),
    ])

    const defaultTracks = createHiFiDemoTracks()
    defaultTracks.forEach(t => {
      t.isFavorite = savedFavs.includes(t.id)
    })

    // Apply saved preferences to DOM CSS & AudioEngine
    document.documentElement.style.setProperty('--glass-surface-opacity', savedPrefs.glassOpacity.toString())
    audioEngine.setVolume(savedPrefs.volume)
    audioEngine.setMuted(savedPrefs.isMuted)

    // Apply EQ
    const currentPreset = DEFAULT_EQ_PRESETS.find(p => p.id === savedPrefs.eqPresetId) || DEFAULT_EQ_PRESETS[0]
    audioEngine.applyEQPreset(currentPreset)
    audioEngine.setEQEnabled(savedPrefs.eqEnabled, savedPrefs.customEqGains)

    set({
      tracks: defaultTracks,
      favorites: new Set(savedFavs),
      preferences: savedPrefs,
      isInitialized: true,
    })
  },

  setCurrentView: (view: ViewMode) => set({ currentView: view }),

  setSearchQuery: (q: string) => set({ searchQuery: q }),

  toggleFavorite: async (trackId: string) => {
    const { favorites, tracks } = get()
    const nextFavorites = new Set(favorites)
    if (nextFavorites.has(trackId)) {
      nextFavorites.delete(trackId)
    } else {
      nextFavorites.add(trackId)
    }

    const updatedTracks = tracks.map(t =>
      t.id === trackId ? { ...t, isFavorite: nextFavorites.has(trackId) } : t
    )

    set({ favorites: nextFavorites, tracks: updatedTracks })
    await saveFavorites(Array.from(nextFavorites))
  },

  addTracks: (newTracks: Track[]) => {
    const { tracks, favorites } = get()
    const existingIds = new Set(tracks.map(t => t.id))
    const filtered = newTracks.filter(t => !existingIds.has(t.id))
    const merged = [...tracks, ...filtered].map(t => ({
      ...t,
      isFavorite: favorites.has(t.id),
    }))
    set({ tracks: merged })
  },

  removeTrack: (trackId: string) => {
    const { tracks } = get()
    set({ tracks: tracks.filter(t => t.id !== trackId) })
  },

  clearLibrary: () => {
    set({ tracks: [] })
  },

  updatePreferences: async (partial: Partial<UserPreferences>) => {
    const current = get().preferences
    const updated = { ...current, ...partial }
    set({ preferences: updated })

    if (partial.glassOpacity !== undefined) {
      document.documentElement.style.setProperty('--glass-surface-opacity', partial.glassOpacity.toString())
    }

    await saveUserPreferences(updated)
  },

  mountDirectory: async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('您的浏览器不支持 File System Access API，请直接将音乐文件或文件夹拖拽到窗口中。')
      return
    }

    try {
      const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker()
      set({ isScanning: true, scanProgress: { current: 0, total: 0 } })

      const audioFiles: File[] = []
      const lrcFileMap = new Map<string, string>() // baseName -> rawLrc

      async function scanDirectory(handle: FileSystemDirectoryHandle): Promise<void> {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await (entry as FileSystemFileHandle).getFile()
            if (isAudioFile(file)) {
              audioFiles.push(file)
            } else if (isLrcFile(file)) {
              const text = await file.text()
              lrcFileMap.set(getBaseFileName(file.name).toLowerCase(), text)
            }
          } else if (entry.kind === 'directory') {
            await scanDirectory(entry as FileSystemDirectoryHandle)
          }
        }
      }

      await scanDirectory(dirHandle)

      set({ scanProgress: { current: 0, total: audioFiles.length } })

      const parsedTracks: Track[] = []
      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i]
        const companionLrc = lrcFileMap.get(getBaseFileName(file.name).toLowerCase())
        const track = await parseAudioFile(file, companionLrc)
        parsedTracks.push(track)
        set({ scanProgress: { current: i + 1, total: audioFiles.length } })
      }

      get().addTracks(parsedTracks)
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to open directory:', err)
      }
    } finally {
      set({ isScanning: false })
    }
  },

  importFiles: async (fileList: FileList | File[]) => {
    set({ isScanning: true, scanProgress: { current: 0, total: fileList.length } })

    const files = Array.from(fileList)
    const audioFiles: File[] = []
    const lrcFileMap = new Map<string, string>()

    for (const file of files) {
      if (isAudioFile(file)) {
        audioFiles.push(file)
      } else if (isLrcFile(file)) {
        const text = await file.text()
        lrcFileMap.set(getBaseFileName(file.name).toLowerCase(), text)
      }
    }

    set({ scanProgress: { current: 0, total: audioFiles.length } })

    const parsedTracks: Track[] = []
    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i]
      const companionLrc = lrcFileMap.get(getBaseFileName(file.name).toLowerCase())
      const track = await parseAudioFile(file, companionLrc)
      parsedTracks.push(track)
      set({ scanProgress: { current: i + 1, total: audioFiles.length } })
    }

    get().addTracks(parsedTracks)
    set({ isScanning: false })
  },
}))
