import { useRef } from 'react'
import * as THREE from 'three'

export function SkyGradient() {
  const meshRef = useRef<THREE.Mesh>(null)
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
  if (canvas) {
    canvas.width = 2
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 256)
      g.addColorStop(0, '#f8d7da')
      g.addColorStop(0.4, '#f4d4a6')
      g.addColorStop(1, '#c9b8e8')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 2, 256)
    }
  }
  const texture = canvas ? new THREE.CanvasTexture(canvas) : null
  if (texture) texture.flipY = false

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}
