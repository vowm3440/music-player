import React, { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

export interface LiquidGlassProps extends HTMLMotionProps<'div'> {
  level?: 1 | 2 | 3 | 4
  interactiveGlint?: boolean
  elevated?: boolean
  highlightOnHover?: boolean
  tintColor?: string // e.g. "rgba(255,255,255,0.08)"
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * LiquidGlassContainer
 * Apple iOS 27 / macOS Tahoe concentric optical glass component.
 * Features:
 * - Concentric squircle curvature (Level 1: 36px, Level 2: 24px, Level 3: 16px, Level 4: 9999px)
 * - 1px specular gradient perimeter highlight with mask exclusion
 * - Dual-layer inner surface tension glow + ambient deep drop shadow
 * - Optical backdrop blur & color saturation boost
 * - Real-time mouse tracking for interactive specular sheen
 */
export const LiquidGlassContainer: React.FC<LiquidGlassProps> = ({
  level = 2,
  interactiveGlint = true,
  elevated = true,
  highlightOnHover = true,
  tintColor,
  children,
  className = '',
  style,
  onMouseMove,
  onMouseLeave,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (interactiveGlint && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        containerRef.current.style.setProperty('--mouse-x', `${x}px`)
        containerRef.current.style.setProperty('--mouse-y', `${y}px`)
      }
      onMouseMove?.(e)
    },
    [interactiveGlint, onMouseMove]
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (interactiveGlint && containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', '50%')
        containerRef.current.style.setProperty('--mouse-y', '50%')
      }
      onMouseLeave?.(e)
    },
    [interactiveGlint, onMouseLeave]
  )

  // Map concentric radius and padding levels
  const levelStyles = {
    1: 'rounded-[36px] p-3',
    2: 'rounded-[24px] p-2',
    3: 'rounded-[16px] p-1.5',
    4: 'rounded-full p-1',
  }[level]

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative
        backdrop-blur-[28px]
        specular-border
        ${interactiveGlint ? 'glass-glint' : ''}
        ${elevated ? 'surface-tension' : ''}
        ${levelStyles}
        transition-colors duration-300 ease-out
        ${highlightOnHover ? 'hover:bg-white/[0.14]' : ''}
        ${className}
      `}
      style={{
        backgroundColor: tintColor || `rgba(255, 255, 255, var(--glass-surface-opacity, 0.16))`,
        WebkitBackdropFilter: 'blur(28px) saturate(190%) brightness(1.06)',
        backdropFilter: 'blur(28px) saturate(190%) brightness(1.06)',
        ...style,
      }}
      {...rest}
    >
      {/* Content wrapper with natural z-index above border highlights */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  )
}
