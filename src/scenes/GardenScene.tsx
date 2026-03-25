import { Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkyGradient } from './SkyGradient'
import { Lake } from './Lake'
import { Particles } from './Particles'
import { GardenObjects } from './GardenObjects'

export type SceneVariant = 'dashboard' | 'catalog' | 'test' | 'result' | 'history'

export interface HistoryItem {
  testId: string
}

interface GardenSceneProps {
  variant: SceneVariant
  historyItems: HistoryItem[]
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#3d4a3e" roughness={0.95} metalness={0} />
    </mesh>
  )
}

function SceneContent({ variant, historyItems }: GardenSceneProps) {
  const isMinimal = variant === 'test'
  const showGarden = variant === 'dashboard' || variant === 'catalog' || variant === 'history'

  return (
    <>
      <color attach="background" args={['#c9b8e8']} />
      <fog attach="fog" args={['#c9b8e8', 8, 25]} />
      <ambientLight intensity={0.4} color="#fff8f0" />
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.8}
        color="#fff4e0"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <pointLight position={[0, 3, 2]} intensity={0.6} color="#7dd3c0" distance={12} />

      <SkyGradient />
      <Ground />

      {!isMinimal && (
        <>
          <Lake />
          <Particles />
        </>
      )}
      {showGarden && historyItems.length > 0 && <GardenObjects items={historyItems} />}
    </>
  )
}

function CameraAnim() {
  useFrame((state) => {
    const cam = state.camera as THREE.PerspectiveCamera
    if (cam.position.z > 8) {
      cam.position.set(0, 2, 8)
      cam.lookAt(0, 0, 0)
    }
    const t = state.clock.elapsedTime
    cam.position.y = 2 + Math.sin(t * 0.3) * 0.02
    cam.lookAt(0, 0, 0)
  })
  return null
}

export function GardenScene({ variant, historyItems }: GardenSceneProps) {
  return (
    <>
      <CameraAnim />
      <Suspense fallback={null}>
        <SceneContent variant={variant} historyItems={historyItems} />
      </Suspense>
    </>
  )
}
