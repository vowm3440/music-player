import React, { useState, useRef } from 'react'
import { LiquidButton } from '../glass/LiquidButton'
import { LiquidBadge } from '../glass/LiquidBadge'
import { usePlayerStore } from '../../store/usePlayerStore'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Music2,
  Sliders,
  Maximize2,
} from 'lucide-react'

export const LiquidMediaPill: React.FC = () => {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const duration = usePlayerStore((state) => state.duration)
  const volume = usePlayerStore((state) => state.volume)
  const isMuted = usePlayerStore((state) => state.isMuted)
  const playMode = usePlayerStore((state) => state.playMode)

  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const nextTrack = usePlayerStore((state) => state.nextTrack)
  const prevTrack = usePlayerStore((state) => state.prevTrack)
  const seek = usePlayerStore((state) => state.seek)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const toggleMute = usePlayerStore((state) => state.toggleMute)
  const togglePlayMode = usePlayerStore((state) => state.togglePlayMode)
  const toggleFullscreenLyrics = usePlayerStore((state) => state.toggleFullscreenLyrics)
  const toggleEqualizer = usePlayerStore((state) => state.toggleEqualizer)

  const [isScrubbing, setIsScrubbing] = useState(false)
  const [scrubValue, setScrubValue] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const progressBarRef = useRef<HTMLDivElement>(null)

  const effectiveTime = isScrubbing ? scrubValue : currentTime
  const progressRatio = duration > 0 ? (effectiveTime / duration) * 100 : 0

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seek(clickRatio * duration)
  }

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScrubbing || !progressBarRef.current || duration <= 0) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setScrubValue(ratio * duration)
  }

  const getFormatBadgeText = () => {
    if (!currentTrack) return null
    const { format } = currentTrack
    if (format.sampleRate && format.bitsPerSample) {
      const khz = Math.round(format.sampleRate / 100) / 10
      return `${format.bitsPerSample}-bit / ${khz}kHz ${format.lossless ? 'Lossless' : format.codec || ''}`
    }
    if (format.lossless) return `${format.codec || 'Hi-Res'} Lossless`
    if (format.bitrate) return `${Math.round(format.bitrate / 1000)}kbps ${format.codec || ''}`
    return format.codec || 'Hi-Fi Audio'
  }

  const playModeIcon = {
    sequence: <Repeat className="w-4 h-4 opacity-50" />,
    'repeat-all': <Repeat className="w-4 h-4 text-pink-400" />,
    'repeat-one': <Repeat1 className="w-4 h-4 text-pink-400" />,
    shuffle: <Shuffle className="w-4 h-4 text-pink-400" />,
  }[playMode]

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-5xl"
    >
      <div
        className={`
          solid-dock rounded-[26px] flex flex-col gap-2 p-3 sm:p-4 transition-all duration-300 ease-out
          border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] relative
          ${isHovered ? 'scale-[1.01]' : 'scale-100'}
        `}
      >
        {/* Upper Row: Track Info + Main Controls + Quick Actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Album Cover + Song Title + Format Badge */}
          <div className="flex items-center gap-3.5 min-w-[200px] max-w-[320px]">
            {/* Album Cover Squircle (Level 3: 16px) */}
            <div
              onClick={toggleFullscreenLyrics}
              className="relative w-13 h-13 rounded-[16px] overflow-hidden bg-white/10 shrink-0 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.4)] group border border-white/20"
            >
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-pink-500/20 to-purple-500/20">
                  <Music2 className="w-6 h-6 text-white/50" />
                </div>
              )}
              {/* Expand to lyrics overlay icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Song Meta */}
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-white truncate drop-shadow-sm">
                {currentTrack?.title || '等待播放'}
              </span>
              <span className="text-xs text-white/60 truncate">
                {currentTrack?.artist || '选择曲目开启 Hi-Fi 视听'}
              </span>
              {currentTrack && (
                <div className="mt-1">
                  <LiquidBadge variant={currentTrack.format.lossless ? 'gold' : 'glass'}>
                    {getFormatBadgeText()}
                  </LiquidBadge>
                </div>
              )}
            </div>
          </div>

          {/* Center: Playback Buttons (All Liquid Glass Buttons!) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Play Mode Button */}
            <LiquidButton
              variant={playMode !== 'sequence' ? 'accent' : 'subtle'}
              size="icon-sm"
              onClick={togglePlayMode}
              title={`播放模式: ${playMode}`}
            >
              {playModeIcon}
            </LiquidButton>

            {/* Previous Track */}
            <LiquidButton
              variant="glass"
              size="icon-md"
              onClick={prevTrack}
              title="上一曲"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </LiquidButton>

            {/* Play/Pause Main Radiant Liquid Glass Capsule Button */}
            <LiquidButton
              variant="primary"
              size="icon-lg"
              onClick={togglePlay}
              title={isPlaying ? '暂停' : '播放'}
              className="shadow-[0_4px_24px_rgba(255,255,255,0.45)]"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current text-neutral-900" />
              ) : (
                <Play className="w-5 h-5 fill-current text-neutral-900 ml-0.5" />
              )}
            </LiquidButton>

            {/* Next Track */}
            <LiquidButton
              variant="glass"
              size="icon-md"
              onClick={nextTrack}
              title="下一曲"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </LiquidButton>

            {/* Equalizer Quick Toggle */}
            <LiquidButton
              variant="subtle"
              size="icon-sm"
              onClick={toggleEqualizer}
              title="10-Band 硬件级均衡器"
            >
              <Sliders className="w-3.5 h-3.5" />
            </LiquidButton>
          </div>

          {/* Right: Volume & Lyrics Button */}
          <div className="flex items-center gap-3 min-w-[200px] justify-end">
            <LiquidButton
              variant="subtle"
              size="icon-sm"
              onClick={toggleMute}
              title={isMuted ? '取消静音' : '静音'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </LiquidButton>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 sm:w-24 h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-pink-400"
            />

            <LiquidButton
              variant="subtle"
              size="icon-sm"
              onClick={toggleFullscreenLyrics}
              title="全屏沉浸歌词"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </LiquidButton>
          </div>
        </div>

        {/* Lower Row: High-Precision Scrubbing Track */}
        <div className="flex items-center gap-3 pt-1">
          <span className="font-mono text-[10px] text-white/50 w-10 text-right">
            {formatTime(effectiveTime)}
          </span>

          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            onMouseDown={() => setIsScrubbing(true)}
            onMouseUp={() => {
              if (isScrubbing) {
                seek(scrubValue)
                setIsScrubbing(false)
              }
            }}
            onMouseMove={handleProgressBarMouseMove}
            className="relative flex-1 h-3 flex items-center cursor-pointer group"
          >
            {/* Background Rail */}
            <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden transition-all duration-200 group-hover:h-1.5">
              {/* Active Progress */}
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                style={{ width: `${progressRatio}%` }}
              />
            </div>

            {/* Scrubbing Glass Capsule Thumb */}
            <div
              className={`
                absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white
                shadow-[0_0_10px_rgba(255,255,255,0.8)]
                transition-transform duration-150 pointer-events-none
                ${isScrubbing ? 'scale-125' : 'group-hover:scale-110 opacity-0 group-hover:opacity-100'}
              `}
              style={{ left: `${progressRatio}%` }}
            />
          </div>

          <span className="font-mono text-[10px] text-white/50 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
