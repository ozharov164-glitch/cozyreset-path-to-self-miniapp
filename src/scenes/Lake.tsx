import { useRef } from 'react'
import * as THREE from 'three'

const GLOW_TEAL = '#7dd3c0'

export function Lake() {
  const meshRef = useRef<THREE.Mesh>(null)
  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshPhysicalMaterial
          color={GLOW_TEAL}
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0}
          transmission={0.85}
          thickness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial color="#5ab8a8" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  )
}
