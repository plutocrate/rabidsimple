/**
 * ModelViewer — renders a RABID JSON keyboard model with the same
 * auto-lerping metallic palettes as the hero LandingViewer.
 * Used on product pages instead of the Cosmos iframe or ink-splash placeholder.
 */
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { KeyboardModel } from './KeyboardModel'

interface ModelViewerProps {
  modelPath: string
  className?: string
}

// ─── Same palettes as LandingViewer ──────────────────────────────────────────
const PALETTES = [
  { case: '#e2ddd8', display: '#1a1a1a', bottom: '#0e0e0e', accent: '#2a2828' }, // GHOST
  { case: '#141414', display: '#080808', bottom: '#050505', accent: '#111111' }, // ONYX
  { case: '#f2ece0', display: '#241c10', bottom: '#181208', accent: '#3a2c18' }, // BONE
  { case: '#ccd4dc', display: '#18202c', bottom: '#101620', accent: '#283040' }, // CHROME
  { case: '#1e3a5f', display: '#0a1828', bottom: '#080f1a', accent: '#14304e' }, // COBALT
  { case: '#5c1a1a', display: '#200808', bottom: '#180606', accent: '#3a1010' }, // CRIMSON
  { case: '#1a3a1e', display: '#0a1a0c', bottom: '#081008', accent: '#142e18' }, // FOREST
  { case: '#3a3e44', display: '#181c20', bottom: '#101418', accent: '#242830' }, // SLATE
  { case: '#6b4226', display: '#2a1808', bottom: '#1e1008', accent: '#4a2c14' }, // BRONZE
  { case: '#080808', display: '#040404', bottom: '#020202', accent: '#0a0a0a' }, // VOID
]

function paletteToColors(p: typeof PALETTES[0]) {
  return {
    case_left: p.case,   case_right: p.case,
    display_left: p.display, display_right: p.display,
    bottom_left: p.bottom,   bottom_right: p.bottom,
    switch_left: p.accent,   switch_right: p.accent,
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  return [r, g, b]
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar,ag,ab] = hexToRgb(a)
  const [br,bg,bb] = hexToRgb(b)
  const r = Math.round((ar + (br-ar)*t) * 255)
  const g = Math.round((ag + (bg-ag)*t) * 255)
  const bl = Math.round((ab + (bb-ab)*t) * 255)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`
}

function lerpColors(a: Record<string,string>, b: Record<string,string>, t: number) {
  const out: Record<string,string> = {}
  for (const k of Object.keys(a)) out[k] = lerpHex(a[k], b[k] ?? a[k], t)
  return out
}

function easeInOut(t: number) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2
}

function useAutoLerp() {
  const [colors, setColors] = useState(paletteToColors(PALETTES[0]))
  const [active, setActive] = useState(0)
  const fromRef = useRef(paletteToColors(PALETTES[0]))
  const toRef   = useRef(paletteToColors(PALETTES[1]))
  const tRef    = useRef(0)

  useEffect(() => {
    let raf: number
    let last = performance.now()
    function tick(now: number) {
      const dt = (now - last) / 1000; last = now
      tRef.current = Math.min(tRef.current + dt * 0.32, 1)
      setColors(lerpColors(fromRef.current, toRef.current, easeInOut(tRef.current)))
      if (tRef.current >= 1) {
        const next = (active + 1) % PALETTES.length
        fromRef.current = toRef.current
        toRef.current = paletteToColors(PALETTES[(next + 1) % PALETTES.length])
        tRef.current = 0
        setActive(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return colors
}

export function ModelViewer({ modelPath, className }: ModelViewerProps) {
  const colors = useAutoLerp()

  return (
    <div className={className ?? 'w-full h-full'}>
      <Canvas
        shadows
        camera={{ position: [0, 4.5, 1.0], fov: 42 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        style={{ background: '#060606' }}
      >
        <color attach="background" args={['#060606']} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.12} />
          <directionalLight position={[2, 8, 3]} intensity={3.2} castShadow color="#fffaf0"
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.1} shadow-camera-far={22}
            shadow-camera-left={-5} shadow-camera-right={5}
            shadow-camera-top={5}   shadow-camera-bottom={-5}
          />
          <directionalLight position={[-4, 3, -1]} intensity={0.6} color="#aaccff" />
          <directionalLight position={[0, 1, -4]}  intensity={0.4} color="#8899cc" />
          <pointLight position={[0, -1, 1]} intensity={0.3} color="#ff9944" distance={6} />
          <pointLight position={[1.5, 2, 2]} intensity={1.2} color="#ffffff" distance={8} />

          <KeyboardModel
            modelPath={modelPath}
            partColors={colors}
            autoRotate
            rotateSpeed={0.0005}
            toon={false}
            trackball={null}
          />

          <ContactShadows position={[0, 0, 0]} opacity={0.7} scale={6} blur={2.5} far={0.6} color="#000" />
          <OrbitControls
            enablePan={false} enableZoom={true}
            minDistance={2.5} maxDistance={9}
            minPolarAngle={Math.PI / 10} maxPolarAngle={Math.PI / 2.2}
            target={[0, 0.04, 0]}
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
