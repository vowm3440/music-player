import { describe, it, expect } from 'vitest'
import { getLiquidButtonClasses } from './liquidButtonStyles'

describe('getLiquidButtonClasses', () => {
  it('returns default glass variant and md size classes', () => {
    const classes = getLiquidButtonClasses({})
    expect(classes).toContain('liquid-glass-btn')
    expect(classes).toContain('liquid-btn-glass')
    expect(classes).toContain('px-4')
  })

  it('correctly applies accent variant', () => {
    const classes = getLiquidButtonClasses({ variant: 'accent' })
    expect(classes).toContain('liquid-glass-btn')
    expect(classes).toContain('liquid-btn-accent')
  })

  it('correctly applies gold variant', () => {
    const classes = getLiquidButtonClasses({ variant: 'gold' })
    expect(classes).toContain('liquid-glass-btn')
    expect(classes).toContain('liquid-btn-gold')
  })

  it('correctly applies primary variant', () => {
    const classes = getLiquidButtonClasses({ variant: 'primary' })
    expect(classes).toContain('liquid-btn-primary')
  })

  it('handles icon sizes with equal aspect ratio and circular squircle', () => {
    const iconSm = getLiquidButtonClasses({ size: 'icon-sm' })
    expect(iconSm).toContain('w-8')
    expect(iconSm).toContain('h-8')

    const iconMd = getLiquidButtonClasses({ size: 'icon-md' })
    expect(iconMd).toContain('w-10')
    expect(iconMd).toContain('h-10')

    const iconLg = getLiquidButtonClasses({ size: 'icon-lg' })
    expect(iconLg).toContain('w-12')
    expect(iconLg).toContain('h-12')
  })

  it('applies active state classes when active is true', () => {
    const activeGlass = getLiquidButtonClasses({ variant: 'glass', active: true })
    expect(activeGlass).toContain('liquid-btn-active')
  })

  it('applies disabled state classes when disabled is true', () => {
    const disabledBtn = getLiquidButtonClasses({ disabled: true })
    expect(disabledBtn).toContain('opacity-40')
    expect(disabledBtn).toContain('pointer-events-none')
  })

  it('merges custom className without collision', () => {
    const custom = getLiquidButtonClasses({ className: 'my-custom-class' })
    expect(custom).toContain('my-custom-class')
  })
})
