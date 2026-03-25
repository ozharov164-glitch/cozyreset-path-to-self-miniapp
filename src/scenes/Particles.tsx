import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 22
const COLORS = [0xc9b8e8, 0xe8b4b8]

export function Particles() {
  const pointsRef = useRef<THREE.Points>(null)
  const frameRef = useRef(0)
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const c = new THREE.Color()
    for (let i = 0; i < COUNT; i++) {
      const r = 0.4 + Math.random() * 0.8
      const theta = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(theta) * r
      positions[i * 3 + 1] = 0.8 + Math.random() * 1.2
      positions[i * 3 + 2] = Math.sin(theta) * r
      c.setHex(COLORS[i % COLORS.length])
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }, [])

  useFrame((state) => {
    frameRef.current += 1
    if (frameRef.current % 2 !== 0 || !pointsRef.current) return
    const t = state.clock.elapsedTime
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      pos[i3 + 1] += Math.sin(t + i * 0.2) * 0.002
      pos[i3] += Math.cos(t * 0.7 + i * 0.1) * 0.001
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
