import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { useModelLoader } from '@/hooks/useModelLoader'
import { TrackballConfig } from '@/store/useModelConfigStore'
import './ToonMaterial'

interface KeyboardModelProps {
  modelPath: string
  partColors?: Record<string, string>
  autoRotate?: boolean
  rotateSpeed?: number
  toon?: boolean
  /** Trackball config from useModelConfigStore — renders spheres inside the rotating group */
  trackball?: TrackballConfig | null
}

const PART_CONFIG: Record<string, { steps: number; rimStrength: number; ambientStrength: number }> = {
  case_left:           { steps: 5, rimStrength: 0.55, ambientStrength: 0.28 },
  case_right:          { steps: 5, rimStrength: 0.55, ambientStrength: 0.28 },
  base_left:           { steps: 3, rimStrength: 0.25, ambientStrength: 0.22 },
  base_right:          { steps: 3, rimStrength: 0.25, ambientStrength: 0.22 },
  plate_left:          { steps: 3, rimStrength: 0.22, ambientStrength: 0.22 },
  plate_right:         { steps: 3, rimStrength: 0.22, ambientStrength: 0.22 },
  mcu_left:            { steps: 4, rimStrength: 0.35, ambientStrength: 0.25 },
  mcu_right:           { steps: 4, rimStrength: 0.35, ambientStrength: 0.25 },
  ball_left:           { steps: 6, rimStrength: 0.80, ambientStrength: 0.15 },
  ball_right:          { steps: 6, rimStrength: 0.80, ambientStrength: 0.15 },
  keycaps_left:        { steps: 4, rimStrength: 0.40, ambientStrength: 0.25 },
  keycaps_right:       { steps: 4, rimStrength: 0.40, ambientStrength: 0.25 },
  switches_left:       { steps: 3, rimStrength: 0.30, ambientStrength: 0.20 },
  switches_right:      { steps: 3, rimStrength: 0.30, ambientStrength: 0.20 },
  // Corne hero model parts (old keys kept for compatibility)
  case_left_left:      { steps: 5, rimStrength: 0.55, ambientStrength: 0.28 },
  case_left_right:     { steps: 5, rimStrength: 0.55, ambientStrength: 0.28 },
  display_top_left:    { steps: 4, rimStrength: 0.45, ambientStrength: 0.22 },
  display_top_right:   { steps: 4, rimStrength: 0.45, ambientStrength: 0.22 },
  bottom_plate_left:   { steps: 3, rimStrength: 0.25, ambientStrength: 0.20 },
  bottom_plate_right:  { steps: 3, rimStrength: 0.25, ambientStrength: 0.20 },
  power_switch_left:   { steps: 3, rimStrength: 0.30, ambientStrength: 0.22 },
  power_switch_right:  { steps: 3, rimStrength: 0.30, ambientStrength: 0.22 },
  // Corne hero v2 keys
  case_left:           { steps: 5, rimStrength: 0.55, ambientStrength: 0.28 },
  case_right:          { steps: 5, rimStrength: 0.55, ambientStrength: 0.28 },
  display_left:        { steps: 4, rimStrength: 0.45, ambientStrength: 0.22 },
  display_right:       { steps: 4, rimStrength: 0.45, ambientStrength: 0.22 },
  bottom_left:         { steps: 3, rimStrength: 0.25, ambientStrength: 0.20 },
  bottom_right:        { steps: 3, rimStrength: 0.25, ambientStrength: 0.20 },
  switch_left:         { steps: 3, rimStrength: 0.30, ambientStrength: 0.22 },
  switch_right:        { steps: 3, rimStrength: 0.30, ambientStrength: 0.22 },
  mcu_left:            { steps: 4, rimStrength: 0.35, ambientStrength: 0.25 },
  mcu_right:           { steps: 4, rimStrength: 0.35, ambientStrength: 0.25 },
  switches_body_left:  { steps: 3, rimStrength: 0.20, ambientStrength: 0.30 },
  switches_body_right: { steps: 3, rimStrength: 0.20, ambientStrength: 0.30 },
  switch_stems_left:   { steps: 4, rimStrength: 0.45, ambientStrength: 0.25 },
  switch_stems_right:  { steps: 4, rimStrength: 0.45, ambientStrength: 0.25 },
  sw_body_left:        { steps: 3, rimStrength: 0.20, ambientStrength: 0.30 },
  sw_body_right:       { steps: 3, rimStrength: 0.20, ambientStrength: 0.30 },
  sw_stem_left:        { steps: 5, rimStrength: 0.50, ambientStrength: 0.22 },
  sw_stem_right:       { steps: 5, rimStrength: 0.50, ambientStrength: 0.22 },
}

const PBR_CONFIG: Record<string, { roughness: number; metalness: number }> = {
  case_left:           { roughness: 0.22, metalness: 0.35 },
  case_right:          { roughness: 0.22, metalness: 0.35 },
  base_left:           { roughness: 0.65, metalness: 0.04 },
  base_right:          { roughness: 0.65, metalness: 0.04 },
  plate_left:          { roughness: 0.50, metalness: 0.10 },
  plate_right:         { roughness: 0.50, metalness: 0.10 },
  mcu_left:            { roughness: 0.40, metalness: 0.15 },
  mcu_right:           { roughness: 0.40, metalness: 0.15 },
  ball_left:           { roughness: 0.15, metalness: 0.50 },
  ball_right:          { roughness: 0.15, metalness: 0.50 },
  keycaps_left:        { roughness: 0.50, metalness: 0.00 },
  keycaps_right:       { roughness: 0.50, metalness: 0.00 },
  switches_left:       { roughness: 0.60, metalness: 0.05 },
  switches_right:      { roughness: 0.60, metalness: 0.05 },
  // Corne hero model parts (old keys)
  case_left_left:      { roughness: 0.35, metalness: 0.10 },
  case_left_right:     { roughness: 0.35, metalness: 0.10 },
  display_top_left:    { roughness: 0.25, metalness: 0.20 },
  display_top_right:   { roughness: 0.25, metalness: 0.20 },
  bottom_plate_left:   { roughness: 0.60, metalness: 0.05 },
  bottom_plate_right:  { roughness: 0.60, metalness: 0.05 },
  power_switch_left:   { roughness: 0.45, metalness: 0.15 },
  power_switch_right:  { roughness: 0.45, metalness: 0.15 },
  // Corne hero v2 keys
  case_left:           { roughness: 0.22, metalness: 0.35 },
  case_right:          { roughness: 0.22, metalness: 0.35 },
  display_left:        { roughness: 0.15, metalness: 0.45 },
  display_right:       { roughness: 0.15, metalness: 0.45 },
  bottom_left:         { roughness: 0.30, metalness: 0.25 },
  bottom_right:        { roughness: 0.30, metalness: 0.25 },
  switch_left:         { roughness: 0.45, metalness: 0.15 },
  switch_right:        { roughness: 0.45, metalness: 0.15 },
  mcu_left:            { roughness: 0.18, metalness: 0.35 },
  mcu_right:           { roughness: 0.18, metalness: 0.35 },
  switches_body_left:  { roughness: 0.12, metalness: 0.05 },
  switches_body_right: { roughness: 0.12, metalness: 0.05 },
  switch_stems_left:   { roughness: 0.35, metalness: 0.08 },
  switch_stems_right:  { roughness: 0.35, metalness: 0.08 },
  sw_body_left:        { roughness: 0.10, metalness: 0.05 },
  sw_body_right:       { roughness: 0.10, metalness: 0.05 },
  sw_stem_left:        { roughness: 0.28, metalness: 0.06 },
  sw_stem_right:       { roughness: 0.28, metalness: 0.06 },
}

const DEFAULT_COLORS: Record<string, string> = {
  case_left:      '#dedad4', case_right:     '#dedad4',
  base_left:      '#111111', base_right:     '#111111',
  plate_left:     '#222222', plate_right:    '#222222',
  mcu_left:       '#1a3a1a', mcu_right:      '#1a3a1a',
  ball_left:      '#1a1a1a', ball_right:     '#1a1a1a',
  keycaps_left:   '#d0cdc8', keycaps_right:  '#d0cdc8',
  switches_left:  '#444444', switches_right: '#444444',
}

const LIGHT_DIR = new THREE.Vector3(0.3, 1.0, 0.5).normalize()

// Corne MCU correction — shifts MCU board inward toward the split gap
const MCU_X_OFFSET_LEFT  = +0.585
const MCU_X_OFFSET_RIGHT = -0.585

export function KeyboardModel({
  modelPath,
  partColors = {},
  autoRotate = true,
  rotateSpeed = 0.0012,
  toon = false,
  trackball = null,
}: KeyboardModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { parts, isLoading } = useModelLoader(modelPath)
  // Merge defaults + passed colors. For any part key not in either,
  // fall back to a neutral grey so new models don't render black.
  const resolvedColors = { ...DEFAULT_COLORS, ...partColors }
  const isDactyl = modelPath.includes('keyboard_model')

  // Apply MCU X-offset correction for Corne model only
  const processedParts = isDactyl
    ? parts
    : parts.map(part => {
        if (part.key !== 'mcu_left' && part.key !== 'mcu_right') return part
        const dx = part.key === 'mcu_left' ? MCU_X_OFFSET_LEFT : MCU_X_OFFSET_RIGHT
        const src = part.geometry.attributes.position as THREE.BufferAttribute
        const arr = src.array.slice() as Float32Array
        for (let i = 0; i < arr.length; i += 3) arr[i] += dx
        const geo = part.geometry.clone()
        geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
        geo.computeVertexNormals()
        return { ...part, geometry: geo }
      })

  useFrame(() => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += rotateSpeed
    }
  })

  if (isLoading || processedParts.length === 0) return null

  return (
    <group ref={groupRef}>
      {processedParts.map(part => {
        const cfg = PART_CONFIG[part.key] ?? { steps: 4, rimStrength: 0.4, ambientStrength: 0.25 }
        const pbr = PBR_CONFIG[part.key]  ?? { roughness: 0.5, metalness: 0.05 }

        // Instanced keycaps — always use keycaps_left color for BOTH halves so they match
        if (part.isInstanced && part.instanceMatrices) {
          const color = resolvedColors['keycaps_left'] ?? '#d0cdc8'
          return (
            <instancedMesh
              key={part.key}
              args={[part.geometry, undefined, part.instanceMatrices.length]}
              castShadow receiveShadow
              onUpdate={mesh => {
                part.instanceMatrices!.forEach((mat, i) => mesh.setMatrixAt(i, mat))
                mesh.instanceMatrix.needsUpdate = true
              }}
            >
              {toon
                ? <rabidToonMaterial color={color} rimColor="#ffffff" rimStrength={cfg.rimStrength}
                    steps={cfg.steps} lightDir={LIGHT_DIR} ambientStrength={cfg.ambientStrength} />
                : <meshStandardMaterial color={color} roughness={pbr.roughness} metalness={pbr.metalness} />
              }
            </instancedMesh>
          )
        }

        // Regular mesh
        const color = resolvedColors[part.key] ?? partColors[part.key] ?? '#c8c8c8'
        return (
          <mesh key={part.key} geometry={part.geometry} castShadow receiveShadow>
            {toon
              ? <rabidToonMaterial color={color} rimColor="#ffffff" rimStrength={cfg.rimStrength}
                  steps={cfg.steps} lightDir={LIGHT_DIR} ambientStrength={cfg.ambientStrength} />
              : <meshStandardMaterial color={color} roughness={pbr.roughness} metalness={pbr.metalness} />
            }
          </mesh>
        )
      })}

      {/* Trackball spheres inside the rotating group — stay locked in socket */}
      {trackball && trackball.positions.map((pos, i) => (
        <Sphere key={`tb${i}`} args={[trackball.radius, 64, 64]} position={pos} castShadow>
          {toon
            ? <rabidToonMaterial color={trackball.colorToon} rimColor="#fff8cc"
                rimStrength={1.1} steps={8}
                lightDir={new THREE.Vector3(0.2, 1.0, 0.8).normalize()}
                ambientStrength={0.25} />
            : <meshStandardMaterial color={trackball.colorPBR}
                metalness={0.95} roughness={0.05} envMapIntensity={2.0} />
          }
        </Sphere>
      ))}
    </group>
  )
}
