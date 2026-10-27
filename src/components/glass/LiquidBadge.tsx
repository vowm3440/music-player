import React from 'react'

interface LiquidBadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'neon' | 'glass' | 'accent'
  className?: string
  icon?: React.ReactNode
}

export const LiquidBadge: React.FC<LiquidBadgeProps> = ({
  children,
  variant = 'glass',
  className = '',
  icon,
}) => {
  const variantStyles = {
    glass: 'bg-white/10 text-white/90 border-white/20 shadow-[0_2px_10px_rgba(255,255,255,0.06)]',
    gold: 'bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-amber-200 border-amber-400/30 shadow-[0_2px_12px_rgba(245,158,11,0.2)]',
    neon: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-400/30 shadow-[0_2px_12px_rgba(6,182,212,0.2)]',
    accent: 'bg-gradient-to-r from-pink-500/25 to-rose-400/25 text-pink-200 border-pink-400/35 shadow-[0_2px_12px_rgba(244,63,94,0.25)]',
  }[variant]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        rounded-full text-[11px] font-semibold tracking-wide
        border backdrop-blur-md transition-all duration-200
        ${variantStyles}
        ${className}
      `}
    >
      {icon}
      <span>{children}</span>
    </span>
  )
}
