import { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductViewerProps {
  modelPath?: string
  partColors?: Record<string, string>
}

// ─── Metallic palette ─────────────────────────────────────────────────────────

const METALLIC_COLORS = [
  '#ffffff', // pure white
  '#f5f5f5', // soft white
  '#e8e8e8', // chrome
  '#f0f0f0', // bright white
  '#dcdcdc', // gainsboro
  '#c8c8c8', // light silver
  '#ffffff', // weighted towards white
  '#efefef', // near white
  '#f8f8f8', // almost white
  '#e0e0e0', // light grey silver
]

function randomMetalColor() {
  return METALLIC_COLORS[Math.floor(Math.random() * METALLIC_COLORS.length)]
}

// ─── Single ink droplet ───────────────────────────────────────────────────────

interface Droplet {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  color: string
  scale: number
  life: number        // 0–1, decreasing
  maxLife: number
  splat: boolean      // has it hit the floor?
  splatScale: number
  splatRotation: number
  turbulence: THREE.Vector3
}

function makeSplash(origin?: [number, number, number]): Droplet[] {
  const cx = origin ? origin[0] : (Math.random() - 0.5) * 4
  const cy = origin ? origin[1] : 2.5 + Math.random() * 1.5
  const cz = origin ? origin[2] : (Math.random() - 0.5) * 3
  const color = randomMetalColor()
  const count = 18 + Math.floor(Math.random() * 22)

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
    const speed = 0.8 + Math.random() * 2.2
    const spread = 0.4 + Math.random() * 0.6
    return {
      id: Math.random(),
      position: new THREE.Vector3(cx, cy, cz),
      velocity: new THREE.Vector3(
        Math.cos(angle) * spread * speed,
        (1.2 + Math.random() * 2.5) * speed * 0.4,
        Math.sin(angle) * spread * speed * 0.5,
      ),
      color: Math.random() > 0.3 ? color : randomMetalColor(),
      scale: 0.03 + Math.random() * 0.12,
      life: 1,
      maxLife: 0.8 + Math.random() * 1.4,
      splat: false,
      splatScale: 0.08 + Math.random() * 0.25,
      splatRotation: Math.random() * Math.PI * 2,
      turbulence: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        0,
        (Math.random() - 0.5) * 0.3,
      ),
    }
  })
}

// ─── Ink particle mesh ───────────────────────────────────────────────────────

function InkParticle({ droplet }: { droplet: Droplet }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef  = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(() => {
    if (!meshRef.current || !matRef.current) return
    const m = meshRef.current
    m.position.copy(droplet.position)
    const t = 1 - droplet.life / droplet.maxLife  // 0→1 as it ages
    const opacity = droplet.splat
      ? Math.max(0, droplet.life / droplet.maxLife - 0.2) * 1.2
      : droplet.life / droplet.maxLife

    matRef.current.opacity = Math.min(1, opacity)

    if (droplet.splat) {
      // Flatten into splat disc
      const s = droplet.splatScale * (1 + t * 1.8)
      m.scale.set(s, 0.004, s)
      m.rotation.y = droplet.splatRotation
    } else {
      const s = droplet.scale * (0.6 + t * 0.4)
      m.scale.set(s, s * (0.8 + Math.random() * 0.4), s)
    }
  })

  return (
    <mesh ref={meshRef} castShadow>
      {droplet.splat
        ? <cylinderGeometry args={[1, 1, 0.1, 8]} />
        : <sphereGeometry args={[1, 6, 6]} />
      }
      <meshStandardMaterial
        ref={matRef}
        color={droplet.color}
        metalness={0.3}
        roughness={0.05}
        transparent
        opacity={1}
        envMapIntensity={1}
        emissive="#ffffff"
        emissiveIntensity={0.35}
      />
    </mesh>
  )
}

// ─── Splash system controller ─────────────────────────────────────────────────

const GRAVITY = -4.5
const FLOOR_Y = -1.1

function SplashSystem({ triggerRef }: { triggerRef: React.MutableRefObject<(() => void) | null> }) {
  const [droplets, setDroplets] = useState<Droplet[]>([])

  // Expose trigger to parent
  useEffect(() => {
    triggerRef.current = () => {
      setDroplets(prev => {
        // Keep alive splats (they look nice layered), add new burst
        const alive = prev.filter(d => d.splat && d.life > 0.1).slice(-60)
        return [...alive, ...makeSplash()]
      })
    }
  }, [triggerRef])

  useFrame((_, delta) => {
    setDroplets(prev => {
      let any = false
      const next = prev.map(d => {
        if (d.life <= 0) return d
        any = true
        const dt = Math.min(delta, 0.05)

        if (!d.splat) {
          // Physics
          d.velocity.y += GRAVITY * dt
          d.position.x += (d.velocity.x + d.turbulence.x) * dt
          d.position.y += d.velocity.y * dt
          d.position.z += (d.velocity.z + d.turbulence.z) * dt

          if (d.position.y <= FLOOR_Y) {
            d.position.y = FLOOR_Y
            d.splat = true
          }
        }

        d.life -= dt / (d.splat ? d.maxLife * 2.5 : d.maxLife)
        return { ...d }
      })
      return any ? next : prev
    })
  })

  return (
    <>
      {droplets.filter(d => d.life > 0).map(d => (
        <InkParticle key={d.id} droplet={d} />
      ))}
    </>
  )
}

// ─── Metallic ground plane ────────────────────────────────────────────────────

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
      <planeGeometry args={[14, 10]} />
      <meshStandardMaterial
        color="#080808"
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  )
}

// ─── Floating 3D text ─────────────────────────────────────────────────────────

function BuildingText() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.25) * 0.15
  })

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, 0.6, 0]}>
        <Text
          fontSize={0.38}
          letterSpacing={0.04}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          position={[0, 0.22, 0]}
          maxWidth={6}
          textAlign="center"
          fillOpacity={0.7}
        >
          Building this
        </Text>

        <Text
          fontSize={0.46}
          letterSpacing={0.12}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          position={[0, -0.28, 0]}
          maxWidth={6}
          textAlign="center"
          fillOpacity={1}
        >
          FEATURE
        </Text>

        {/* Underline */}
        <mesh position={[0, -0.62, 0]}>
          <boxGeometry args={[2.4, 0.012, 0.012]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  )
}

// ─── Click-to-splash handler — invisible mesh filling the camera view ────────

function ClickPlane({ onSplash }: { onSplash: () => void }) {
  return (
    <mesh
      position={[0, 0, 2]}
      onPointerDown={(e) => { e.stopPropagation(); onSplash() }}
    >
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

// ─── Environment light setup ──────────────────────────────────────────────────

function MetallicLights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 8, 2]} intensity={2.5} castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.1} shadow-camera-far={20}
        shadow-camera-left={-5} shadow-camera-right={5}
        shadow-camera-top={5} shadow-camera-bottom={-5}
        color="#ffe8cc"
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.8} color="#aaccff" />
      <pointLight position={[0, 3, 3]} intensity={1.2} color="#ffffff" distance={10} />
      <pointLight position={[2, 0.5, 1]} intensity={0.6} color="#ffcc66" distance={6} />
      <pointLight position={[-2, 1, -1]} intensity={0.4} color="#88aaff" distance={5} />
    </>
  )
}

// ─── Main scene ───────────────────────────────────────────────────────────────

function Scene() {
  const triggerRef = useRef<(() => void) | null>(null)

  return (
    <>
      <MetallicLights />
      <ClickPlane onSplash={() => triggerRef.current?.()} />
      <Ground />
      <SplashSystem triggerRef={triggerRef} />
      <BuildingText />
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0008, 0.0008)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  )
}

// ─── Exported component ───────────────────────────────────────────────────────

export function ProductViewer({ modelPath, partColors = {} }: ProductViewerProps) {
  return (
    <div className="relative w-full h-full bg-[#050505] cursor-crosshair select-none">
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 5.5], fov: 42 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
          alpha: false,
        }}
        style={{ background: '#050505' }}
      >
        <color attach="background" args={['#050505']} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>


    </div>
  )
}
