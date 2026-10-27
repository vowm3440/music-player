import React, { useRef, useEffect } from 'react'
import { audioEngine } from '../../core/audio/AudioEngine'
import { usePlayerStore } from '../../store/usePlayerStore'

interface LiquidVisualizerProps {
  mode?: 'fluid' | 'bars' | 'wave'
  height?: number
  className?: string
  color?: string
}

export const LiquidVisualizer: React.FC<LiquidVisualizerProps> = ({
  mode = 'fluid',
  height = 90,
  className = '',
  color,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const palette = usePlayerStore((state) => state.palette)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const bufferLength = 64
    const dataArray = new Uint8Array(bufferLength)
    const waveArray = new Uint8Array(256)

    let smoothData = new Float32Array(bufferLength).fill(0)

    const render = () => {
      animationId = requestAnimationFrame(render)

      const width = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, width, h)

      if (isPlaying) {
        audioEngine.getFrequencyData(dataArray)
        audioEngine.getTimeDomainData(waveArray)
      } else {
        // Idle gentle breathing
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(0, dataArray[i] * 0.95)
        }
      }

      // Smooth lerp data
      for (let i = 0; i < bufferLength; i++) {
        smoothData[i] += (dataArray[i] - smoothData[i]) * 0.2
      }

      const accentColor = color || palette.primary || '#ec4899'

      if (mode === 'bars') {
        const barCount = 36
        const totalSpacing = width / barCount
        const barWidth = Math.max(3, totalSpacing * 0.65)

        for (let i = 0; i < barCount; i++) {
          // Logarithmic distribution to emphasize bass and mids
          const dataIdx = Math.floor(Math.pow(i / barCount, 1.4) * (bufferLength - 1))
          const val = smoothData[dataIdx] / 255
          const barHeight = Math.max(4, val * (h - 8))
          const x = i * totalSpacing + (totalSpacing - barWidth) / 2
          const y = h - barHeight

          const grad = ctx.createLinearGradient(0, y, 0, h)
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
          grad.addColorStop(0.3, accentColor)
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.15)')

          ctx.fillStyle = grad
          ctx.beginPath()
          const radius = barWidth / 2
          ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 2, 2])
          ctx.fill()

          // Specular cap reflection
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.beginPath()
          ctx.ellipse(x + barWidth / 2, y + 2, barWidth * 0.35, 1.5, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (mode === 'wave') {
        ctx.beginPath()
        ctx.lineWidth = 2.5
        ctx.strokeStyle = accentColor

        const sliceWidth = width / waveArray.length
        let x = 0

        for (let i = 0; i < waveArray.length; i++) {
          const v = waveArray[i] / 128.0
          const y = (v * h) / 2

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
          x += sliceWidth
        }

        ctx.shadowColor = accentColor
        ctx.shadowBlur = 12
        ctx.stroke()
        ctx.shadowBlur = 0
      } else {
        // 'fluid' organic liquid ribbon curve
        const pointsCount = 48
        const step = width / (pointsCount - 1)
        const points: { x: number; y: number }[] = []

        for (let i = 0; i < pointsCount; i++) {
          const dataIdx = Math.floor((i / pointsCount) * (bufferLength * 0.75))
          const amp = (smoothData[dataIdx] / 255) * (h * 0.75)
          const baseline = h * 0.8
          const y = baseline - amp
          points.push({ x: i * step, y })
        }

        // Draw smooth bezier ribbon
        ctx.beginPath()
        ctx.moveTo(0, h)
        ctx.lineTo(points[0].x, points[0].y)

        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2
          const yc = (points[i].y + points[i + 1].y) / 2
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
        }

        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
        ctx.lineTo(width, h)
        ctx.closePath()

        const grad = ctx.createLinearGradient(0, 0, 0, h)
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)')
        grad.addColorStop(0.35, accentColor)
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.02)')

        ctx.fillStyle = grad
        ctx.fill()

        // Surface highlight rim
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2
          const yc = (points[i].y + points[i + 1].y) / 2
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
        }
        ctx.lineWidth = 1.8
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.stroke()
      }
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isPlaying, mode, color, palette])

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={480}
        height={height}
        className="w-full h-full block"
      />
    </div>
  )
}
