import { create } from 'zustand'
import type { Track, PlayMode, PaletteColors } from '../types'
import { audioEngine } from '../core/audio/AudioEngine'
import { extractPaletteFromImage } from '../core/metadata/colorExtractor'
import { findActiveLyricIndex } from '../core/metadata/lrcParser'

interface PlayerState {
  currentTrack: Track | null
  queue: Track[]
  queueIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playMode: PlayMode
  palette: PaletteColors
  isFullscreenLyrics: boolean
  isEqualizerOpen: boolean
  activeLyricIndex: number

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>
  togglePlay: () => Promise<void>
  nextTrack: () => Promise<void>
  prevTrack: () => Promise<void>
  seek: (seconds: number) => void
  setVolume: (val: number) => void
  toggleMute: () => void
  setPlayMode: (mode: PlayMode) => void
  togglePlayMode: () => void
  setFullscreenLyrics: (val: boolean) => void
  toggleFullscreenLyrics: () => void
  setEqualizerOpen: (val: boolean) => void
  toggleEqualizer: () => void
  setQueue: (queue: Track[]) => void
  clearQueue: () => void
}

const DEFAULT_PALETTE: PaletteColors = {
  primary: 'rgb(80, 24, 88)',
  secondary: 'rgb(24, 45, 95)',
  tertiary: 'rgb(120, 30, 80)',
  quaternary: 'rgb(35, 15, 60)',
  rawRgb: [
    [80, 24, 88],
    [24, 45, 95],
    [120, 30, 80],
    [35, 15, 60],
  ],
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Sync AudioEngine events
  audioEngine.onPlay(() => set({ isPlaying: true }))
  audioEngine.onPause(() => set({ isPlaying: false }))
  audioEngine.onTimeUpdate((current, duration) => {
    const { currentTrack } = get()
    let activeLyric = -1
    if (currentTrack?.parsedLyrics && currentTrack.parsedLyrics.length > 0) {
      activeLyric = findActiveLyricIndex(currentTrack.parsedLyrics, current)
    }
    set({
      currentTime: current,
      duration: duration || currentTrack?.duration || 0,
      activeLyricIndex: activeLyric,
    })
  })

  audioEngine.onEnded(() => {
    const { playMode, currentTrack, nextTrack } = get()
    if (playMode === 'repeat-one' && currentTrack) {
      audioEngine.seek(0)
      audioEngine.play()
    } else {
      nextTrack()
    }
  })

  return {
    currentTrack: null,
    queue: [],
    queueIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.85,
    isMuted: false,
    playMode: 'sequence',
    palette: DEFAULT_PALETTE,
    isFullscreenLyrics: false,
    isEqualizerOpen: false,
    activeLyricIndex: -1,

    playTrack: async (track: Track, newQueue?: Track[]) => {
      let currentQueue = get().queue
      if (newQueue) {
        currentQueue = newQueue
        set({ queue: newQueue })
      } else if (!currentQueue.some(t => t.id === track.id)) {
        currentQueue = [...currentQueue, track]
        set({ queue: currentQueue })
      }

      const index = currentQueue.findIndex(t => t.id === track.id)
      set({
        currentTrack: track,
        queueIndex: index >= 0 ? index : 0,
        currentTime: 0,
        activeLyricIndex: -1,
      })

      // Extract colors for fluid mesh backdrop
      extractPaletteFromImage(track.coverUrl).then((pal) => {
        set({ palette: pal })
      })

      await audioEngine.load(track.url, true)
    },

    togglePlay: async () => {
      const { isPlaying, currentTrack, queue } = get()
      if (!currentTrack) {
        if (queue.length > 0) {
          await get().playTrack(queue[0])
        }
        return
      }

      if (isPlaying) {
        audioEngine.pause()
      } else {
        await audioEngine.play()
      }
    },

    nextTrack: async () => {
      const { queue, queueIndex, playMode } = get()
      if (queue.length === 0) return

      let nextIndex = queueIndex + 1

      if (playMode === 'shuffle') {
        if (queue.length > 1) {
          let rand = Math.floor(Math.random() * queue.length)
          while (rand === queueIndex) {
            rand = Math.floor(Math.random() * queue.length)
          }
          nextIndex = rand
        } else {
          nextIndex = 0
        }
      } else if (nextIndex >= queue.length) {
        if (playMode === 'repeat-all') {
          nextIndex = 0
        } else {
          audioEngine.pause()
          set({ isPlaying: false, currentTime: 0 })
          return
        }
      }

      const nextSong = queue[nextIndex]
      if (nextSong) {
        await get().playTrack(nextSong)
      }
    },

    prevTrack: async () => {
      const { queue, queueIndex, currentTime, playMode } = get()
      if (queue.length === 0) return

      // If more than 3 seconds in, seek to start of current song
      if (currentTime > 3) {
        audioEngine.seek(0)
        return
      }

      let prevIndex = queueIndex - 1
      if (playMode === 'shuffle') {
        prevIndex = Math.floor(Math.random() * queue.length)
      } else if (prevIndex < 0) {
        prevIndex = playMode === 'repeat-all' ? queue.length - 1 : 0
      }

      const prevSong = queue[prevIndex]
      if (prevSong) {
        await get().playTrack(prevSong)
      }
    },

    seek: (seconds: number) => {
      audioEngine.seek(seconds)
      set({ currentTime: seconds })
    },

    setVolume: (val: number) => {
      audioEngine.setVolume(val)
      set({ volume: val, isMuted: val === 0 })
    },

    toggleMute: () => {
      const newMuted = !get().isMuted
      audioEngine.setMuted(newMuted)
      set({ isMuted: newMuted })
    },

    setPlayMode: (mode: PlayMode) => {
      set({ playMode: mode })
    },

    togglePlayMode: () => {
      const modes: PlayMode[] = ['sequence', 'repeat-all', 'repeat-one', 'shuffle']
      const currentIndex = modes.indexOf(get().playMode)
      const nextMode = modes[(currentIndex + 1) % modes.length]
      set({ playMode: nextMode })
    },

    setFullscreenLyrics: (val: boolean) => set({ isFullscreenLyrics: val }),
    toggleFullscreenLyrics: () => set((state) => ({ isFullscreenLyrics: !state.isFullscreenLyrics })),

    setEqualizerOpen: (val: boolean) => set({ isEqualizerOpen: val }),
    toggleEqualizer: () => set((state) => ({ isEqualizerOpen: !state.isEqualizerOpen })),

    setQueue: (newQueue: Track[]) => set({ queue: newQueue }),
    clearQueue: () => {
      audioEngine.pause()
      set({ queue: [], currentTrack: null, queueIndex: -1, isPlaying: false })
    },
  }
})
