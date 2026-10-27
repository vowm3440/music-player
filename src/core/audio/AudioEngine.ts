import type { EQPreset } from '../../types'

export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

export const DEFAULT_EQ_PRESETS: EQPreset[] = [
  { id: 'flat', name: '平直 (Flat)', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'bass-boost', name: '重低音 (Bass Boost)', gains: [5.5, 4.5, 3.5, 2, 0, 0, 0, 0, 0, 0] },
  { id: 'vocal', name: '人声优化 (Vocal Presence)', gains: [-2, -1, 0, 2, 4.5, 4, 3, 1.5, 0, -1] },
  { id: 'electronic', name: '电子乐 (Electronic)', gains: [4.5, 4, 1.5, 0, -2, 2, 1, 1.5, 3.5, 4] },
  { id: 'rock', name: '摇滚 (Rock)', gains: [4, 3, 2, 0.5, -0.5, 0, 1.5, 3, 3.5, 4] },
  { id: 'jazz', name: '爵士 (Jazz Club)', gains: [3, 2, 1, 1.5, -1.5, -1.5, 0, 1.5, 2.5, 3] },
  { id: 'acoustic', name: '原声民谣 (Acoustic)', gains: [3, 2, 1, 0.5, 1, 1.5, 2.5, 3, 3, 2] },
  { id: 'treble-boost', name: '高音增强 (Treble Air)', gains: [-1, -1, -0.5, 0, 0, 1, 2.5, 4, 5, 6] },
]

type AudioEventCallback = () => void
type TimeUpdateCallback = (currentTime: number, duration: number) => void

export class AudioEngine {
  private static instance: AudioEngine | null = null

  private audioCtx: AudioContext | null = null
  private audioElement: HTMLAudioElement
  private mediaSource: MediaElementAudioSourceNode | null = null
  private eqFilters: BiquadFilterNode[] = []
  private gainNode: GainNode | null = null
  private analyserNode: AnalyserNode | null = null

  private isInitialized = false
  private isEqEnabled = true
  private currentVolume = 0.8
  private isMuted = false

  // Listener sets
  private playListeners = new Set<AudioEventCallback>()
  private pauseListeners = new Set<AudioEventCallback>()
  private endedListeners = new Set<AudioEventCallback>()
  private timeUpdateListeners = new Set<TimeUpdateCallback>()
  private errorListeners = new Set<(e: ErrorEvent | Event) => void>()

  private constructor() {
    if (typeof Audio !== 'undefined') {
      this.audioElement = new Audio()
      this.audioElement.crossOrigin = 'anonymous'
      this.audioElement.preload = 'auto'
      this.setupAudioElementListeners()
    } else {
      // Mock for SSR / Node test environment
      this.audioElement = {
        addEventListener: () => {},
        removeEventListener: () => {},
        play: async () => {},
        pause: () => {},
        load: () => {},
        currentTime: 0,
        duration: 0,
        paused: true,
      } as unknown as HTMLAudioElement
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  /**
   * Initializes AudioContext upon user gesture
   */
  public async ensureContext(): Promise<AudioContext> {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioCtx = new AudioContextClass({
        latencyHint: 'playback',
      })
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume()
    }

    if (!this.isInitialized) {
      this.buildAudioGraph()
      this.isInitialized = true
    }

    return this.audioCtx
  }

  private buildAudioGraph(): void {
    if (!this.audioCtx) return

    // 1. Source from AudioElement
    this.mediaSource = this.audioCtx.createMediaElementSource(this.audioElement)

    // 2. 10-Band EQ filters
    this.eqFilters = EQ_FREQUENCIES.map((freq, index) => {
      const filter = this.audioCtx!.createBiquadFilter()
      if (index === 0) {
        filter.type = 'lowshelf'
      } else if (index === EQ_FREQUENCIES.length - 1) {
        filter.type = 'highshelf'
      } else {
        filter.type = 'peaking'
        filter.Q.value = 1.414 // 1 octave bandwidth
      }
      filter.frequency.value = freq
      filter.gain.value = 0
      return filter
    })

    // 3. GainNode for anti-pop volume control and crossfade
    this.gainNode = this.audioCtx.createGain()
    this.gainNode.gain.value = this.currentVolume

    // 4. AnalyserNode for liquid audio visualization
    this.analyserNode = this.audioCtx.createAnalyser()
    this.analyserNode.fftSize = 2048
    this.analyserNode.smoothingTimeConstant = 0.82
    this.analyserNode.minDecibels = -85
    this.analyserNode.maxDecibels = -15

    // Connect node chain:
    // Source -> Filter 0 -> Filter 1 -> ... -> Filter 9 -> GainNode -> AnalyserNode -> Destination
    let previousNode: AudioNode = this.mediaSource
    for (const filter of this.eqFilters) {
      previousNode.connect(filter)
      previousNode = filter
    }

    previousNode.connect(this.gainNode)
    this.gainNode.connect(this.analyserNode)
    this.analyserNode.connect(this.audioCtx.destination)
  }

  private setupAudioElementListeners(): void {
    this.audioElement.addEventListener('play', () => {
      this.playListeners.forEach(cb => cb())
    })

    this.audioElement.addEventListener('pause', () => {
      this.pauseListeners.forEach(cb => cb())
    })

    this.audioElement.addEventListener('ended', () => {
      this.endedListeners.forEach(cb => cb())
    })

    this.audioElement.addEventListener('timeupdate', () => {
      const current = this.audioElement.currentTime || 0
      const duration = this.audioElement.duration || 0
      this.timeUpdateListeners.forEach(cb => cb(current, duration))
    })

    this.audioElement.addEventListener('error', (e) => {
      this.errorListeners.forEach(cb => cb(e))
    })
  }

  // Playback Controls
  public async load(url: string, autoPlay = true): Promise<void> {
    await this.ensureContext()

    // Smooth fade out current track before switching
    if (this.gainNode && this.audioCtx && !this.audioElement.paused) {
      this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime)
      this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.03)
      await new Promise(res => setTimeout(res, 40))
    }

    this.audioElement.src = url
    this.audioElement.load()

    if (autoPlay) {
      await this.play()
    }
  }

  public async play(): Promise<void> {
    await this.ensureContext()

    // Smooth fade in
    if (this.gainNode && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : this.currentVolume
      this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime)
      this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime)
      this.gainNode.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.04)
    }

    try {
      await this.audioElement.play()
    } catch (err) {
      console.warn('Audio play request interrupted or prevented:', err)
    }
  }

  public pause(): void {
    if (this.gainNode && this.audioCtx && !this.audioElement.paused) {
      this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime)
      this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.03)
      setTimeout(() => {
        this.audioElement.pause()
      }, 35)
    } else {
      this.audioElement.pause()
    }
  }

  public seek(seconds: number): void {
    if (Number.isFinite(seconds)) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.audioElement.duration || 0))
    }
  }

  public setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume))
    if (!this.isMuted && this.gainNode && this.audioCtx) {
      this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime)
      this.gainNode.gain.setTargetAtTime(this.currentVolume, this.audioCtx.currentTime, 0.03)
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted
    if (this.gainNode && this.audioCtx) {
      const targetGain = muted ? 0 : this.currentVolume
      this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime)
      this.gainNode.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.03)
    }
  }

  // Equalizer API
  public setEQBandGain(bandIndex: number, gainDb: number): void {
    if (bandIndex >= 0 && bandIndex < this.eqFilters.length) {
      const clampedGain = Math.max(-12, Math.min(12, gainDb))
      if (this.isEqEnabled && this.audioCtx) {
        this.eqFilters[bandIndex].gain.setTargetAtTime(clampedGain, this.audioCtx.currentTime, 0.05)
      }
    }
  }

  public applyEQPreset(preset: EQPreset): void {
    preset.gains.forEach((gain, index) => {
      this.setEQBandGain(index, gain)
    })
  }

  public setEQEnabled(enabled: boolean, currentGains: number[]): void {
    this.isEqEnabled = enabled
    if (!this.audioCtx) return

    this.eqFilters.forEach((filter, index) => {
      const targetGain = enabled ? (currentGains[index] ?? 0) : 0
      filter.gain.setTargetAtTime(targetGain, this.audioCtx!.currentTime, 0.05)
    })
  }

  // Visualization Data Getters
  public getFrequencyData(outputArray: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(outputArray as unknown as Uint8Array<ArrayBuffer>)
    } else {
      outputArray.fill(0)
    }
  }

  public getTimeDomainData(outputArray: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(outputArray as unknown as Uint8Array<ArrayBuffer>)
    } else {
      outputArray.fill(128)
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode
  }

  public getCurrentTime(): number {
    return this.audioElement.currentTime || 0
  }

  public getDuration(): number {
    return this.audioElement.duration || 0
  }

  public isPlaying(): boolean {
    return !this.audioElement.paused
  }

  // Event Subscription
  public onPlay(cb: AudioEventCallback): () => void {
    this.playListeners.add(cb)
    return () => this.playListeners.delete(cb)
  }

  public onPause(cb: AudioEventCallback): () => void {
    this.pauseListeners.add(cb)
    return () => this.pauseListeners.delete(cb)
  }

  public onEnded(cb: AudioEventCallback): () => void {
    this.endedListeners.add(cb)
    return () => this.endedListeners.delete(cb)
  }

  public onTimeUpdate(cb: TimeUpdateCallback): () => void {
    this.timeUpdateListeners.add(cb)
    return () => this.timeUpdateListeners.delete(cb)
  }

  public onError(cb: (e: ErrorEvent | Event) => void): () => void {
    this.errorListeners.add(cb)
    return () => this.errorListeners.delete(cb)
  }
}

export const audioEngine = AudioEngine.getInstance()
