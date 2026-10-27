import type { PaletteColors } from '../../types'

const DEFAULT_PALETTE: PaletteColors = {
  primary: 'rgb(80, 24, 88)',
  secondary: 'rgb(24, 45, 95)',
  tertiary: 'rgb(120, 30, 80)',
  quaternary: 'rgb(35, 15, 60)',
  rawRgb: [
    [80, 24, 88],
    [24, 45, 95],
    [120, 30, 80],
    [35, 15, 60],
  ],
}

/**
 * Extracts 4 harmonious dominant colors from an image URL or Blob URL using canvas quantization.
 */
export async function extractPaletteFromImage(imageUrl?: string): Promise<PaletteColors> {
  if (!imageUrl) return DEFAULT_PALETTE

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          resolve(DEFAULT_PALETTE)
          return
        }

        const size = 64
        canvas.width = size
        canvas.height = size
        ctx.drawImage(img, 0, 0, size, size)

        const imageData = ctx.getImageData(0, 0, size, size).data
        const colorBuckets: { r: number; g: number; b: number; count: number; sat: number }[] = []

        // Sample every 4th pixel for speed
        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i]
          const g = imageData[i + 1]
          const b = imageData[i + 2]
          const a = imageData[i + 3]

          if (a < 128) continue

          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const lightness = (max + min) / 2
          const delta = max - min
          const sat = lightness > 0 && lightness < 255 ? delta / (1 - Math.abs((2 * lightness) / 255 - 1)) : 0

          // Filter out dull greys, extreme blacks, and washed out whites
          if (lightness < 25 || lightness > 235 || sat < 0.15) continue

          // Find close bucket
          let found = false
          for (const bucket of colorBuckets) {
            const dist = Math.hypot(bucket.r - r, bucket.g - g, bucket.b - b)
            if (dist < 45) {
              bucket.r = Math.round((bucket.r * bucket.count + r) / (bucket.count + 1))
              bucket.g = Math.round((bucket.g * bucket.count + g) / (bucket.count + 1))
              bucket.b = Math.round((bucket.b * bucket.count + b) / (bucket.count + 1))
              bucket.count++
              found = true
              break
            }
          }

          if (!found && colorBuckets.length < 32) {
            colorBuckets.push({ r, g, b, count: 1, sat })
          }
        }

        // Sort by vibrant popularity: count * (1 + sat)
        colorBuckets.sort((a, b) => b.count * (1 + b.sat) - a.count * (1 + a.sat))

        if (colorBuckets.length === 0) {
          resolve(DEFAULT_PALETTE)
          return
        }

        // Pick 4 distinct colors
        const chosen: [number, number, number][] = []
        for (const bucket of colorBuckets) {
          const isTooClose = chosen.some(([cr, cg, cb]) => Math.hypot(cr - bucket.r, cg - bucket.g, cb - bucket.b) < 55)
          if (!isTooClose) {
            chosen.push([bucket.r, bucket.g, bucket.b])
            if (chosen.length === 4) break
          }
        }

        // Fill up to 4 if less were found
        while (chosen.length < 4) {
          const base = chosen[0] || [90, 40, 110]
          // generate complimentary/split shift
          const shift = chosen.length * 35
          chosen.push([
            Math.min(255, (base[0] + shift) % 255),
            Math.min(255, (base[1] + shift * 2) % 255),
            Math.min(255, (base[2] + shift * 3) % 255),
          ])
        }

        resolve({
          primary: `rgb(${chosen[0][0]}, ${chosen[0][1]}, ${chosen[0][2]})`,
          secondary: `rgb(${chosen[1][0]}, ${chosen[1][1]}, ${chosen[1][2]})`,
          tertiary: `rgb(${chosen[2][0]}, ${chosen[2][1]}, ${chosen[2][2]})`,
          quaternary: `rgb(${chosen[3][0]}, ${chosen[3][1]}, ${chosen[3][2]})`,
          rawRgb: chosen,
        })
      } catch (err) {
        console.warn('Failed to extract color palette:', err)
        resolve(DEFAULT_PALETTE)
      }
    }

    img.onerror = () => {
      resolve(DEFAULT_PALETTE)
    }

    img.src = imageUrl
  })
}
