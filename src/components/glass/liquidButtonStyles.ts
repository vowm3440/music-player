export type LiquidButtonVariant = 'glass' | 'accent' | 'gold' | 'primary' | 'subtle'
export type LiquidButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md' | 'icon-lg' | 'pill'

export interface LiquidButtonOptions {
  variant?: LiquidButtonVariant
  size?: LiquidButtonSize
  active?: boolean
  disabled?: boolean
  className?: string
}

export function getLiquidButtonClasses({
  variant = 'glass',
  size = 'md',
  active = false,
  disabled = false,
  className = '',
}: LiquidButtonOptions): string {
  const baseClasses = [
    'liquid-glass-btn',
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'select-none',
    'cursor-pointer',
    'transition-all',
    'duration-200',
    'outline-none',
  ]

  // Variant mappings
  const variantMap: Record<LiquidButtonVariant, string> = {
    glass: 'liquid-btn-glass text-white/90 hover:text-white',
    accent: 'liquid-btn-accent text-pink-100 hover:text-white',
    gold: 'liquid-btn-gold text-amber-100 hover:text-white',
    primary: 'liquid-btn-primary font-semibold',
    subtle: 'liquid-btn-subtle text-white/70 hover:text-white',
  }
  baseClasses.push(variantMap[variant] || variantMap.glass)

  // Size mappings
  const sizeMap: Record<LiquidButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-sm px-4 py-2 rounded-2xl gap-2',
    lg: 'text-base px-5 py-2.5 rounded-2xl gap-2.5',
    'icon-sm': 'w-8 h-8 rounded-full p-0 flex items-center justify-center shrink-0',
    'icon-md': 'w-10 h-10 rounded-full p-0 flex items-center justify-center shrink-0',
    'icon-lg': 'w-12 h-12 rounded-full p-0 flex items-center justify-center shrink-0',
    pill: 'text-xs px-4 py-2 rounded-full gap-2',
  }
  baseClasses.push(sizeMap[size] || sizeMap.md)

  // Active state
  if (active) {
    baseClasses.push('liquid-btn-active ring-1 ring-white/40')
  }

  // Disabled state
  if (disabled) {
    baseClasses.push('opacity-40 pointer-events-none cursor-not-allowed')
  }

  // User custom classes
  if (className) {
    baseClasses.push(className)
  }

  return baseClasses.join(' ')
}
