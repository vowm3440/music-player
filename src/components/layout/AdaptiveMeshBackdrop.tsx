import React, { useRef, useEffect } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'

interface BlobPoint {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseRadius: number
  colorIdx: number
}

/**
 * AdaptiveMeshBackdrop
 * Renders an organic, smooth, drifting fluid mesh gradient on HTML5 Canvas.
 * Dynamically reacts to the 4 dominant colors extracted from the current album cover.
 */
export const AdaptiveMeshBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const palette = usePlayerStore((state) => state.palette)

  // Keep target colors and current interpolated colors
  const currentRgbRef = useRef<[number, number, number][]>([
    [70, 25, 90],
    [25, 45, 95],
    [110, 30, 80],
    [30, 15, 60],
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Setup 5 drifting fluid mesh gradient centers
    const blobs: BlobPoint[] = [
      { x: width * 0.25, y: height * 0.3, vx: 0.45, vy: 0.35, radius: width * 0.45, baseRadius: width * 0.45, colorIdx: 0 },
      { x: width * 0.75, y: height * 0.25, vx: -0.38, vy: 0.42, radius: width * 0.5, baseRadius: width * 0.5, colorIdx: 1 },
      { x: width * 0.5, y: height * 0.8, vx: 0.4, vy: -0.35, radius: width * 0.55, baseRadius: width * 0.55, colorIdx: 2 },
      { x: width * 0.15, y: height * 0.75, vx: 0.3, vy: -0.28, radius: width * 0.42, baseRadius: width * 0.42, colorIdx: 3 },
      { x: width * 0.85, y: height * 0.7, vx: -0.32, vy: -0.38, radius: width * 0.46, baseRadius: width * 0.46, colorIdx: 0 },
    ]

    let time = 0

    const render = () => {
      time += 0.008

      // Smoothly interpolate RGB colors towards palette target (lerp factor 0.04)
      const targetRgb = palette.rawRgb
      const cur = currentRgbRef.current
      for (let i = 0; i < 4; i++) {
        const target = targetRgb[i] || [50, 50, 50]
        cur[i][0] += (target[0] - cur[i][0]) * 0.04
        cur[i][1] += (target[1] - cur[i][1]) * 0.04
        cur[i][2] += (target[2] - cur[i][2]) * 0.04
      }

      // Base deep background fill
      ctx.fillStyle = '#06070b'
      ctx.fillRect(0, 0, width, height)

      // Render each soft fluid gradient blob
      blobs.forEach((blob, i) => {
        // Natural Lissajous motion
        blob.x += blob.vx + Math.sin(time + i) * 0.6
        blob.y += blob.vy + Math.cos(time + i * 1.5) * 0.6

        // Bounce gently inside canvas bounds
        if (blob.x < -width * 0.1) blob.vx = Math.abs(blob.vx)
        if (blob.x > width * 1.1) blob.vx = -Math.abs(blob.vx)
        if (blob.y < -height * 0.1) blob.vy = Math.abs(blob.vy)
        if (blob.y > height * 1.1) blob.vy = -Math.abs(blob.vy)

        const rgb = cur[blob.colorIdx]
        const pulse = 1 + 0.08 * Math.sin(time * 2 + i)
        const currentRadius = blob.baseRadius * pulse

        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          currentRadius
        )

        gradient.addColorStop(0, `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, 0.55)`)
        gradient.addColorStop(0.45, `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, 0.25)`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      })

      // Add a fine ambient vignette
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.3,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      )
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, 'rgba(5,6,9,0.72)')

      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [palette])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  )
}
