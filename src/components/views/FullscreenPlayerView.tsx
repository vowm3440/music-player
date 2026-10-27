import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiquidBadge } from '../glass/LiquidBadge'
import { LiquidButton } from '../glass/LiquidButton'
import { LiquidVisualizer } from '../audio/LiquidVisualizer'
import { FluidLyricsView } from '../audio/FluidLyricsView'
import { usePlayerStore } from '../../store/usePlayerStore'
import {
  X,
  Music,
  Sliders,
  Activity,
  Waves,
  BarChart3,
  Heart,
} from 'lucide-react'
import { useLibraryStore } from '../../store/useLibraryStore'

export const FullscreenPlayerView: React.FC = () => {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isFullscreenLyrics = usePlayerStore((state) => state.isFullscreenLyrics)
  const setFullscreenLyrics = usePlayerStore((state) => state.setFullscreenLyrics)
  const toggleEqualizer = usePlayerStore((state) => state.toggleEqualizer)
  const isPlaying = usePlayerStore((state) => state.isPlaying)

  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite)
  const favorites = useLibraryStore((state) => state.favorites)

  const [visMode, setVisMode] = useState<'fluid' | 'bars' | 'wave'>('fluid')

  if (!isFullscreenLyrics) return null

  const isFav = currentTrack ? favorites.has(currentTrack.id) : false

  const getFormatBadgeText = () => {
    if (!currentTrack) return null
    const { format } = currentTrack
    if (format.sampleRate && format.bitsPerSample) {
      const khz = Math.round(format.sampleRate / 100) / 10
      return `${format.bitsPerSample}-bit / ${khz}kHz Lossless Audio`
    }
    return 'Hi-Res Lossless Master'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex flex-col p-6 sm:p-8 backdrop-blur-3xl bg-black/45 select-none"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between z-10 mb-4">
          <div className="flex items-center gap-3">
            <LiquidBadge variant="gold">
              Apple Lossless Audio • iOS 27 Tahoe
            </LiquidBadge>

            {/* Visualizer Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/10 border border-white/15">
              <LiquidButton
                variant={visMode === 'fluid' ? 'accent' : 'subtle'}
                size="icon-sm"
                onClick={() => setVisMode('fluid')}
                title="流体波纹律动"
                className="!w-7 !h-7"
              >
                <Waves className="w-3.5 h-3.5" />
              </LiquidButton>
              <LiquidButton
                variant={visMode === 'bars' ? 'accent' : 'subtle'}
                size="icon-sm"
                onClick={() => setVisMode('bars')}
                title="光泽频谱柱"
                className="!w-7 !h-7"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </LiquidButton>
              <LiquidButton
                variant={visMode === 'wave' ? 'accent' : 'subtle'}
                size="icon-sm"
                onClick={() => setVisMode('wave')}
                title="示波器声波"
                className="!w-7 !h-7"
              >
                <Activity className="w-3.5 h-3.5" />
              </LiquidButton>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LiquidButton
              variant="glass"
              size="icon-sm"
              onClick={toggleEqualizer}
              title="10-Band 均衡器"
            >
              <Sliders className="w-4 h-4" />
            </LiquidButton>
            <LiquidButton
              variant="glass"
              size="icon-sm"
              onClick={() => setFullscreenLyrics(false)}
              title="退出沉浸视图"
            >
              <X className="w-4 h-4" />
            </LiquidButton>
          </div>
        </div>

        {/* Dual-Column Main Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full overflow-hidden">
          {/* Left Column: Album Art + Vinyl Reflection + Visualizer (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-6">
            <motion.div
              animate={{
                rotate: isPlaying ? [0, 360] : 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 25,
                ease: 'linear',
              }}
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-[36px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)] border border-white/20 group"
            >
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-pink-600/30 via-indigo-600/30 to-purple-800/30">
                  <Music className="w-20 h-20 text-white/40" />
                </div>
              )}

              {/* Surface Gloss Sheen Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/30 pointer-events-none" />
            </motion.div>

            {/* Song Meta + Hi-Res Info */}
            <div className="text-center space-y-2 max-w-sm">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {currentTrack?.title || '未在播放'}
                </h2>
                {currentTrack && (
                  <LiquidButton
                    variant={isFav ? 'accent' : 'subtle'}
                    size="icon-sm"
                    onClick={() => toggleFavorite(currentTrack.id)}
                    className="!w-8 !h-8 !p-0"
                    title={isFav ? '取消收藏' : '加入收藏'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? 'text-rose-400 fill-rose-400' : 'text-white/60'
                      }`}
                    />
                  </LiquidButton>
                )}
              </div>
              <p className="text-base text-white/70 font-medium">
                {currentTrack?.artist || '未知艺术家'}
              </p>
              <p className="text-xs text-white/40">
                {currentTrack?.album || '未知专辑'}
                {currentTrack?.year ? ` • ${currentTrack.year}` : ''}
              </p>

              {currentTrack && (
                <div className="pt-2 flex justify-center">
                  <LiquidBadge variant="gold">{getFormatBadgeText()}</LiquidBadge>
                </div>
              )}
            </div>

            {/* Realtime Liquid Visualizer under the cover */}
            <div className="w-full max-w-sm px-4">
              <LiquidVisualizer mode={visMode} height={60} />
            </div>
          </div>

          {/* Right Column: Fluid Spring Lyrics (7 cols) */}
          <div className="lg:col-span-7 h-[70vh] flex flex-col justify-center overflow-hidden">
            <FluidLyricsView className="h-full" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
