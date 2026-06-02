'use client'

import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'

type DitherProps = {
  waveColor?: [number, number, number]
  waveSpeed?: number
  waveFrequency?: number
  waveAmplitude?: number
  colorNum?: number
  pixelSize?: number
  disableAnimation?: boolean
  enableMouseInteraction?: boolean
  mouseRadius?: number
}

export default function DitherBackground() {
  const [DitherComp, setDitherComp] = useState<ComponentType<DitherProps> | null>(null)

  useEffect(() => {
    import('@/components/Dither').then(mod => {
      setDitherComp(() => mod.default)
    })
  }, [])

  if (!DitherComp) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <DitherComp
        waveColor={[0.9921568627450981, 0.9764705882352941, 0.9333333333333333]}
        waveSpeed={0.06}
        waveFrequency={4}
        waveAmplitude={0.1}
        colorNum={7.2}
        pixelSize={2}
        enableMouseInteraction={true}
        mouseRadius={0.3}
      />
    </div>
  )
}
