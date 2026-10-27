import React from 'react'

/**
 * Global SVG Filter definition for iOS 27 Liquid Glass optical refraction.
 * Combines fine-grain fractal noise displacement with specular lighting to simulate
 * micro-refraction and caustic light transmission along glass bevels.
 */
export const LiquidGlassSvgFilter: React.FC = () => {
  return (
    <svg
      className="pointer-events-none fixed -top-[9999px] -left-[9999px] h-0 w-0 opacity-0"
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter
          id="ios27-liquid-glass"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          {/* Sub-pixel noise for glass molecular micro-distortions */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.035"
            numOctaves={3}
            result="noise"
          />
          {/* Edge displacement simulating optical index of refraction (n=1.52) */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={4}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {/* Micro-diffusion blur */}
          <feGaussianBlur
            in="displaced"
            stdDeviation={0.35}
            result="blurred"
          />
          {/* Directional caustic specular highlights simulating Apple studio lighting */}
          <feSpecularLighting
            in="blurred"
            surfaceScale={2.4}
            specularConstant={1.15}
            specularExponent={22}
            lightingColor="#ffffff"
            result="specLight"
          >
            <fePointLight x={120} y={-80} z={220} />
          </feSpecularLighting>
          {/* Mask specular highlights to graphic contours */}
          <feComposite
            in="specLight"
            in2="SourceAlpha"
            operator="in"
            result="specularReflected"
          />
          {/* Composite refraction and specular reflections */}
          <feMerge>
            <feMergeNode in="displaced" />
            <feMergeNode in="specularReflected" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}
