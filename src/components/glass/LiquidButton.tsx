import React, { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import {
  getLiquidButtonClasses,
  type LiquidButtonVariant,
  type LiquidButtonSize,
} from './liquidButtonStyles'

export interface LiquidButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: LiquidButtonVariant
  size?: LiquidButtonSize
  active?: boolean
  glint?: boolean
  children?: React.ReactNode
}

/**
 * LiquidButton
 * Concentric Liquid Glass interactive button designed to contrast against solid physical surfaces.
 * Features:
 * - Dynamic specular edge gradient and surface tension
 * - Mouse-tracking interactive glint
 * - Tactile micro-spring press (active scale)
 * - Backdrop blur refraction
 */
export const LiquidButton: React.FC<LiquidButtonProps> = ({
  variant = 'glass',
  size = 'md',
  active = false,
  glint = true,
  disabled = false,
  className = '',
  children,
  onMouseMove,
  onMouseLeave,
  style,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (glint && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        btnRef.current.style.setProperty('--btn-mouse-x', `${x}px`)
        btnRef.current.style.setProperty('--btn-mouse-y', `${y}px`)
      }
      onMouseMove?.(e)
    },
    [glint, onMouseMove]
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (glint && btnRef.current) {
        btnRef.current.style.setProperty('--btn-mouse-x', '50%')
        btnRef.current.style.setProperty('--btn-mouse-y', '50%')
      }
      onMouseLeave?.(e)
    },
    [glint, onMouseLeave]
  )

  const classNames = getLiquidButtonClasses({
    variant,
    size,
    active,
    disabled,
    className,
  })

  return (
    <motion.button
      ref={btnRef}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${classNames} group`}
      style={style}
      {...props}
    >
      {/* Specular Glint Highlight */}
      <span className="liquid-btn-glint pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden" />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-inherit w-full h-full">
        {children}
      </span>
    </motion.button>
  )
}
