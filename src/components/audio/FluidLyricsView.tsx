import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../../store/usePlayerStore'
import { FileText } from 'lucide-react'

interface RippleEffect {
  x: number
  y: number
  id: number
}

interface FluidLyricsViewProps {
  className?: string
  interactive?: boolean
}

export const FluidLyricsView: React.FC<FluidLyricsViewProps> = ({
  className = '',
  interactive = true,
}) => {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const activeLyricIndex = usePlayerStore((state) => state.activeLyricIndex)
  const seek = usePlayerStore((state) => state.seek)

  const activeLineRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<RippleEffect[]>([])

  const lyrics = currentTrack?.parsedLyrics || []

  // Auto scroll smoothly to keep active lyric centered
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeLyricIndex])

  const handleLineClick = useCallback(
    (time: number, e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const rippleId = Date.now() + Math.random()
      setRipples((prev) => [...prev, { x, y, id: rippleId }])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId))
      }, 700)

      seek(time)
    },
    [interactive, seek]
  )

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center text-white/50 h-full ${className}`}>
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 backdrop-blur-md">
          <FileText className="w-8 h-8 text-white/40" />
        </div>
        <p className="text-lg font-medium text-white/80">暂无滚动歌词</p>
        <p className="text-xs text-white/40 mt-1 max-w-xs">
          将同名 <span className="text-white/70 font-mono">.lrc</span> 歌词文件放入歌曲目录或导入，即可开启 Apple Music 级动态流体歌词
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full overflow-y-auto px-4 py-24 select-none scroll-smooth ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        {lyrics.map((line, index) => {
          const isActive = index === activeLyricIndex
          const distance = Math.abs(index - (activeLyricIndex === -1 ? 0 : activeLyricIndex))

          // Calculate stepped blur and opacity decay
          let blurAmount = 0
          let opacity = 1
          let scale = 1

          if (isActive) {
            scale = 1.05
            opacity = 1
            blurAmount = 0
          } else if (distance === 1) {
            blurAmount = 1.2
            opacity = 0.65
            scale = 0.98
          } else if (distance === 2) {
            blurAmount = 2.4
            opacity = 0.38
            scale = 0.96
          } else {
            blurAmount = Math.min(5, 3.2 + (distance - 3) * 0.5)
            opacity = Math.max(0.15, 0.25 - (distance - 3) * 0.03)
            scale = 0.94
          }

          return (
            <motion.div
              key={`${line.time}-${index}`}
              ref={isActive ? activeLineRef : null}
              onClick={(e) => handleLineClick(line.time, e)}
              animate={{
                scale,
                opacity,
                filter: `blur(${blurAmount}px)`,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 24,
              }}
              className={`
                relative group cursor-pointer py-2.5 px-4 rounded-2xl
                transition-all duration-300 ease-out origin-left
                ${isActive ? 'bg-white/10 font-bold' : 'hover:opacity-80 hover:bg-white/5 font-medium'}
              `}
            >
              {/* Liquid Ripple on click */}
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.65 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                    className="absolute pointer-events-none rounded-full bg-white/30 backdrop-blur-md"
                    style={{
                      left: ripple.x - 20,
                      top: ripple.y - 20,
                      width: 40,
                      height: 40,
                    }}
                  />
                ))}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                {isActive && (
                  <motion.div
                    layoutId="active-lyric-indicator"
                    className="w-1.5 h-6 rounded-full bg-gradient-to-b from-pink-400 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                  />
                )}
                <p
                  className={`
                    text-xl sm:text-2xl md:text-3xl tracking-tight leading-relaxed transition-colors duration-300
                    ${
                      isActive
                        ? 'text-white drop-shadow-[0_2px_16px_rgba(255,255,255,0.6)]'
                        : 'text-white/90'
                    }
                  `}
                >
                  {line.text}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
