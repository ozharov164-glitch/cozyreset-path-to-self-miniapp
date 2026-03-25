const GLOW_TEAL = '#7dd3c0'

export function Lake() {
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.8, 24]} />
        <meshStandardMaterial
          color={GLOW_TEAL}
          transparent
          opacity={0.52}
          roughness={0.35}
          metalness={0.05}
          emissive={GLOW_TEAL}
          emissiveIntensity={0.12}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[1.8, 24]} />
        <meshBasicMaterial color="#5ab8a8" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  )
}
