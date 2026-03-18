/**
 * useModelConfigStore
 *
 * Stores per-model 3D display settings that the team can tweak via the
 * /dashboard/3d-editor page. Settings are persisted to localStorage so they
 * survive page refreshes without needing a backend round-trip.
 *
 * The storefront viewers (LandingViewer, ProductViewer) read from this store
 * instead of having hard-coded values — so any change the team makes is
 * instantly visible on the user-facing pages.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TrackballConfig {
  /** Position in MODEL space (before lift is applied) */
  positions: [number, number, number][]
  radius: number
  colorToon: string   // CSS hex — toon hero
  colorPBR: string    // CSS hex — PBR product page
}

export interface ModelDisplayConfig {
  /** Unique key — matches the last segment of modelPath, e.g. "keyboard_model.json" */
  modelKey: string

  // ── Lift ──────────────────────────────────────────────────────────────────
  /** Y-offset so the model base sits at world y=0 */
  liftY: number

  // ── Outer group orientation ───────────────────────────────────────────────
  /** Euler angles [x, y, z] in radians applied to the outer (non-rotating) group */
  rotation: [number, number, number]

  // ── Camera ────────────────────────────────────────────────────────────────
  cameraPosition: [number, number, number]
  cameraFov: number
  orbitTarget: [number, number, number]
  minDistance: number
  maxDistance: number

  // ── Auto-rotate ───────────────────────────────────────────────────────────
  rotateSpeed: number

  // ── Trackballs ────────────────────────────────────────────────────────────
  trackball: TrackballConfig | null
}

// Sensible defaults for each model
export const DEFAULT_CONFIGS: Record<string, ModelDisplayConfig> = {
  'keyboard_model.json': {
    modelKey: 'keyboard_model.json',
    liftY: 0.252,
    rotation: [-0.10, Math.PI, 0],
    cameraPosition: [0, 2.6, 4.2],
    cameraFov: 42,
    orbitTarget: [0, 0.252, 0],
    minDistance: 2.0,
    maxDistance: 6.5,
    rotateSpeed: 0.0009,
    trackball: {
      positions: [
        [-0.3306, -0.0884, 0.5389],
        [ 0.3306, -0.0884, 0.5389],
      ],
      radius: 0.155,
      colorToon: '#f0c040',
      colorPBR:  '#e8b84b',
    },
  },
  'corne_model.json': {
    modelKey: 'corne_model.json',
    liftY: 0,
    rotation: [0, 0, 0],
    cameraPosition: [0, 3.0, 1.4],
    cameraFov: 40,
    orbitTarget: [0, 0, 0],
    minDistance: 1.5,
    maxDistance: 6.0,
    rotateSpeed: 0.0012,
    trackball: null,
  },
  'corne_hero.json': {
    modelKey: 'corne_hero.json',
    liftY: 0,
    rotation: [0, 0, 0],
    // Zoomed out top-down — full keyboard visible, slight forward tilt
    cameraPosition: [0, 5.5, 1.2],
    cameraFov: 42,
    orbitTarget: [0, 0.04, 0],
    minDistance: 3.5,
    maxDistance: 10.0,
    rotateSpeed: 0.0005,
    trackball: null,
  },
}

interface ModelConfigState {
  configs: Record<string, ModelDisplayConfig>
  getConfig: (modelKey: string) => ModelDisplayConfig
  setConfig: (modelKey: string, config: ModelDisplayConfig) => void
  resetConfig: (modelKey: string) => void
  exportJSON: () => string
  importJSON: (json: string) => void
}

export const useModelConfigStore = create<ModelConfigState>()(
  persist(
    (set, get) => ({
      configs: { ...DEFAULT_CONFIGS },

      getConfig: (modelKey) => {
        return get().configs[modelKey] ?? DEFAULT_CONFIGS[modelKey] ?? DEFAULT_CONFIGS['keyboard_model.json']
      },

      setConfig: (modelKey, config) => {
        set(s => ({ configs: { ...s.configs, [modelKey]: config } }))
      },

      resetConfig: (modelKey) => {
        const def = DEFAULT_CONFIGS[modelKey]
        if (def) set(s => ({ configs: { ...s.configs, [modelKey]: { ...def } } }))
      },

      exportJSON: () => {
        return JSON.stringify(get().configs, null, 2)
      },

      importJSON: (json) => {
        try {
          const parsed = JSON.parse(json)
          set({ configs: { ...DEFAULT_CONFIGS, ...parsed } })
        } catch (e) {
          console.error('Invalid config JSON', e)
        }
      },
    }),
    { name: 'rabid-model-display-configs' }
  )
)
