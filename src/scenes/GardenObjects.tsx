import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WARM_BEIGE = '#f5e6d3'
const GLOW_TEAL = '#7dd3c0'
const LAVENDER = '#c9b8e8'
const SUNSET_ROSE = '#e8b4b8'
const FOREST_DARK = '#2d3e2e'

function Tree({ position, delay }: { position: [number, number, number]; delay: number }) {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (group.current) group.current.scale.setScalar(0.9 + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.05)
  })
  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.5, 6]} />
        <meshStandardMaterial color={WARM_BEIGE} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <coneGeometry args={[0.35, 0.5, 6]} />
        <meshStandardMaterial color={GLOW_TEAL} emissive={new THREE.Color(LAVENDER).multiplyScalar(0.2)} />
      </mesh>
    </group>
  )
}

function Crystal({ position, delay }: { position: [number, number, number]; delay: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (mesh.current) mesh.current.rotation.y = state.clock.elapsedTime * 0.3 + delay
  })
  return (
    <mesh ref={mesh} position={position}>
      <octahedronGeometry args={[0.2, 0]} />
      <meshPhysicalMaterial
        color={GLOW_TEAL}
        transparent
        opacity={0.9}
        roughness={0.1}
        metalness={0.2}
        emissive={GLOW_TEAL}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

function PathSegment({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.4, 0.25]} />
      <meshStandardMaterial color={WARM_BEIGE} />
    </mesh>
  )
}

function Path({ basePosition }: { basePosition: [number, number, number] }) {
  return (
    <group position={basePosition}>
      <PathSegment position={[0, 0, 0]} />
      <PathSegment position={[0.35, 0, 0.1]} />
      <PathSegment position={[0.7, 0, 0]} />
    </group>
  )
}

function Flower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={SUNSET_ROSE} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#f8d7da" />
      </mesh>
    </group>
  )
}

function Stone({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0, Math.random() * Math.PI, 0]}>
      <dodecahedronGeometry args={[0.12, 0]} />
      <meshStandardMaterial color={FOREST_DARK} roughness={0.9} />
    </mesh>
  )
}

function Lantern({ position, delay }: { position: [number, number, number]; delay: number }) {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (group.current) group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.02
  })
  return (
    <group ref={group} position={position}>
      <mesh>
        <boxGeometry args={[0.12, 0.15, 0.08]} />
        <meshStandardMaterial color={WARM_BEIGE} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <coneGeometry args={[0.08, 0.06, 4]} />
        <meshStandardMaterial color={SUNSET_ROSE} emissive={SUNSET_ROSE} emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

const SLOT_RADIUS = 2.4
const SLOT_COUNT = 7
function getSlotPosition(index: number): [number, number, number] {
  const angle = (index / SLOT_COUNT) * Math.PI * 2 - Math.PI / 2
  return [Math.cos(angle) * SLOT_RADIUS, 0, Math.sin(angle) * SLOT_RADIUS]
}

const TEST_ID_TO_OBJECT: Record<string, 'tree' | 'crystal' | 'path' | 'flower' | 'stone' | 'lantern'> = {
  anxiety: 'flower',
  'mood-energy': 'tree',
  'self-esteem': 'crystal',
  burnout: 'stone',
  boundaries: 'lantern',
  meaning: 'path',
  progress: 'lantern',
}

export interface HistoryItem {
  testId: string
}

export function GardenObjects({ items }: { items: HistoryItem[] }) {
  const uniqueByTestId = Array.from(new Map(items.map((item) => [item.testId, item])).values())

  return (
    <>
      {uniqueByTestId.map((item, i) => {
        const slotIndex = i % SLOT_COUNT
        const pos = getSlotPosition(slotIndex)
        const type = TEST_ID_TO_OBJECT[item.testId] ?? 'flower'
        const key = `${item.testId}-${slotIndex}`
        if (type === 'tree') return <Tree key={key} position={pos} delay={i * 0.5} />
        if (type === 'crystal') return <Crystal key={key} position={pos} delay={i * 0.3} />
        if (type === 'path') return <Path key={key} basePosition={pos} />
        if (type === 'flower') return <Flower key={key} position={pos} />
        if (type === 'stone') return <Stone key={key} position={pos} />
        return <Lantern key={key} position={pos} delay={i * 0.4} />
      })}
    </>
  )
}
