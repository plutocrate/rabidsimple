import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { KeyboardModel } from './KeyboardModel'
import { useModelConfigStore } from '@/store/useModelConfigStore'
import { cn } from '@/lib/utils'

interface LandingViewerProps { modelPath: string }

function modelKey(p: string) { return p.split('/').pop() ?? p }

// ─── Metallic color palettes ────────────────────────────────────────────────
// Each palette has a premium material feel — case color drives the look
const PALETTES = [
  {
    label: 'GHOST',
    case:    '#e2ddd8',  // warm white PLA
    display: '#1a1a1a',
    bottom:  '#0e0e0e',
    accent:  '#2a2828',
  },
  {
    label: 'ONYX',
    case:    '#141414',  // matte black
    display: '#080808',
    bottom:  '#050505',
    accent:  '#111111',
  },
  {
    label: 'BONE',
    case:    '#f2ece0',  // creamy ivory
    display: '#241c10',
    bottom:  '#181208',
    accent:  '#3a2c18',
  },
  {
    label: 'CHROME',
    case:    '#ccd4dc',  // brushed aluminium
    display: '#18202c',
    bottom:  '#101620',
    accent:  '#283040',
  },
  {
    label: 'COBALT',
    case:    '#1e3a5f',  // deep cobalt blue
    display: '#0a1828',
    bottom:  '#080f1a',
    accent:  '#14304e',
  },
  {
    label: 'CRIMSON',
    case:    '#5c1a1a',  // deep blood red
    display: '#200808',
    bottom:  '#180606',
    accent:  '#3a1010',
  },
  {
    label: 'FOREST',
    case:    '#1a3a1e',  // deep forest green
    display: '#0a1a0c',
    bottom:  '#081008',
    accent:  '#142e18',
  },
  {
    label: 'SLATE',
    case:    '#3a3e44',  // cool dark slate
    display: '#181c20',
    bottom:  '#101418',
    accent:  '#242830',
  },
  {
    label: 'BRONZE',
    case:    '#6b4226',  // warm bronze
    display: '#2a1808',
    bottom:  '#1e1008',
    accent:  '#4a2c14',
  },
  {
    label: 'VOID',
    case:    '#080808',  // near-black
    display: '#040404',
    bottom:  '#020202',
    accent:  '#0a0a0a',
  },
]

// Fixed switch colors — never lerp
const SWITCH_FIXED: Record<string, string> = {
  sw_body_left:  '#141414',   // dark translucent housing
  sw_body_right: '#141414',
  sw_stem_left:  '#7a2e08',   // kailh choc brown tactile
  sw_stem_right: '#7a2e08',
}

function paletteToColors(p: typeof PALETTES[0]) {
  return {
    case_left:    p.case,    case_right:    p.case,
    display_left: p.display, display_right: p.display,
    bottom_left:  p.bottom,  bottom_right:  p.bottom,
    switch_left:  p.accent,  switch_right:  p.accent,
    ...SWITCH_FIXED,
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  return [r, g, b]
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar,ag,ab] = hexToRgb(a)
  const [br,bg,bb] = hexToRgb(b)
  const r = Math.round((ar + (br-ar)*t) * 255)
  const g = Math.round((ag + (bg-ag)*t) * 255)
  const bl2 = Math.round((ab + (bb-ab)*t) * 255)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl2.toString(16).padStart(2,'0')}`
}

const FIXED_KEYS = new Set(Object.keys(SWITCH_FIXED))

function lerpColors(
  a: Record<string,string>,
  b: Record<string,string>,
  t: number
): Record<string,string> {
  const out: Record<string,string> = { ...SWITCH_FIXED }
  for (const k of Object.keys(a)) {
    if (FIXED_KEYS.has(k)) continue  // never lerp switch colors
    out[k] = lerpColor(a[k], b[k] ?? a[k], t)
  }
  return out
}

// ─── Color lerp controller ──────────────────────────────────────────────────
function useAutoLerp() {
  const [colors, setColors] = useState<Record<string, string>>(paletteToColors(PALETTES[0]))
  const [active, setActive] = useState(0)
	const fromRef   = useRef<Record<string, string>>(paletteToColors(PALETTES[0]))
	const toRef     = useRef<Record<string, string>>(paletteToColors(PALETTES[1]))
  const tRef      = useRef(0)
  const pauseRef  = useRef(false)   // pause while hovering
  const manualRef = useRef<number | null>(null)

  useEffect(() => {
    let raf: number
    let lastTime = performance.now()

    function tick(now: number) {
      const dt = (now - lastTime) / 1000
      lastTime = now

      if (!pauseRef.current) {
        tRef.current = Math.min(tRef.current + dt * 0.32, 1) // ~3s per transition
        setColors(lerpColors(fromRef.current, toRef.current, easeInOut(tRef.current)))

        if (tRef.current >= 1) {
          // advance to next
          const next = (active + 1) % PALETTES.length
          fromRef.current = toRef.current
          toRef.current = paletteToColors(PALETTES[(next + 1) % PALETTES.length])
          tRef.current = 0
          setActive(next)
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  function easeInOut(t: number) {
    // Cubic ease in-out — smoother acceleration/deceleration
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2
  }

  function jumpTo(i: number) {
    fromRef.current = colors
    toRef.current = paletteToColors(PALETTES[i])
    tRef.current = 0
    setActive(i)
    manualRef.current = i
  }

  function setPause(v: boolean) { pauseRef.current = v }

  return { colors, active, jumpTo, setPause }
}

// ─── Main component ─────────────────────────────────────────────────────────

export function LandingViewer({ modelPath }: LandingViewerProps) {
  const { colors, active, jumpTo, setPause } = useAutoLerp()
  const cfg = useModelConfigStore(s => s.getConfig(modelKey(modelPath)))

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
    >
      <Canvas
        shadows
        camera={{ position: window.innerWidth >= 1024 ? [0, 4.2, 0.9] : [0, 6.5, 1.4], fov: window.innerWidth >= 1024 ? 40 : 46 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        style={{ background: '#060606' }}
      >
        <color attach="background" args={['#060606']} />
        <Suspense fallback={null}>
          {/* Metallic lighting rig */}
          <ambientLight intensity={0.12} />

          {/* Key light — warm top */}
          <directionalLight
            position={[2, 8, 3]} intensity={3.2} castShadow
            color="#fffaf0"
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.1} shadow-camera-far={22}
            shadow-camera-left={-5} shadow-camera-right={5}
            shadow-camera-top={5}   shadow-camera-bottom={-5}
          />
          {/* Cool fill from left */}
          <directionalLight position={[-4, 3, -1]} intensity={0.6} color="#aaccff" />
          {/* Rim light from behind */}
          <directionalLight position={[0, 1, -4]} intensity={0.4} color="#8899cc" />
          {/* Warm bounce underneath */}
          <pointLight position={[0, -1, 1]} intensity={0.3} color="#ff9944" distance={6} />
          {/* Sharp specular point */}
          <pointLight position={[1.5, 2, 2]} intensity={1.2} color="#ffffff" distance={8} />

          <group position={[0, cfg.liftY, 0]} rotation={cfg.rotation}>
            <KeyboardModel
              modelPath={modelPath}
              partColors={colors}
              autoRotate
              rotateSpeed={cfg.rotateSpeed}
              toon={false}
              trackball={null}
            />
          </group>

          <ContactShadows
            position={[0, 0, 0]} opacity={0.7} scale={6}
            blur={2.5} far={0.6} color="#000"
          />
          <OrbitControls
            enablePan={false} enableZoom={true}
            minDistance={cfg.minDistance} maxDistance={cfg.maxDistance}
            minPolarAngle={Math.PI / 10} maxPolarAngle={Math.PI / 2.2}
            target={cfg.orbitTarget}
          />
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.5} luminanceThreshold={0.5} luminanceSmoothing={0.85} mipmapBlur />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new THREE.Vector2(0.0006, 0.0006)}
              radialModulation={false}
              modulationOffset={0}
            />
            <Vignette eskil={false} offset={0.2} darkness={0.7} />
          </EffectComposer>
        </Suspense>
      </Canvas>


    </div>
  )
}
