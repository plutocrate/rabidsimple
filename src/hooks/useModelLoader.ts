import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

export interface LoadedPart {
  key: string
  geometry: THREE.BufferGeometry
  instanceMatrices?: THREE.Matrix4[]
  isInstanced?: boolean
}

interface MeshData {
  vertices: number[]
  indices: number[]
}

interface ModelData {
  [partKey: string]: MeshData | number[][]
}

export function useModelLoader(modelPath: string) {
  const [parts, setParts] = useState<LoadedPart[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cache = useRef<Map<string, LoadedPart[]>>(new Map())

  useEffect(() => {
    if (!modelPath) return
    if (cache.current.has(modelPath)) {
      setParts(cache.current.get(modelPath)!)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    fetch(modelPath)
      .then(res => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`)
        return res.json() as Promise<ModelData>
      })
      .then(data => {
        const loaded: LoadedPart[] = []

        // Check for dactyl-style instanced keycap data
        const keycapGeomData = data['keycap_geometry'] as MeshData | undefined
        const transformsLeft  = data['keycap_transforms_left']  as number[][] | undefined
        const transformsRight = data['keycap_transforms_right'] as number[][] | undefined

        let keycapGeom: THREE.BufferGeometry | null = null
        if (keycapGeomData && 'vertices' in keycapGeomData) {
          keycapGeom = new THREE.BufferGeometry()
          keycapGeom.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(keycapGeomData.vertices), 3))
          keycapGeom.setIndex(keycapGeomData.indices)
          keycapGeom.computeVertexNormals()
        }

        const skipKeys = new Set(['keycap_geometry', 'keycap_transforms_left', 'keycap_transforms_right'])

        for (const [partKey, meshData] of Object.entries(data)) {
          if (skipKeys.has(partKey)) continue
          const mesh = meshData as MeshData
          if (!mesh.vertices || !mesh.indices) continue

          const geometry = new THREE.BufferGeometry()
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(mesh.vertices), 3))
          geometry.setIndex(mesh.indices)
          geometry.computeVertexNormals()
          loaded.push({ key: partKey, geometry })
        }

        // Add instanced keycaps if present (dactyl model)
        if (keycapGeom) {
          if (transformsLeft) {
            const matrices = transformsLeft.map(flat => { const m = new THREE.Matrix4(); m.fromArray(flat); return m })
            loaded.push({ key: 'keycaps_left', geometry: keycapGeom.clone(), instanceMatrices: matrices, isInstanced: true })
          }
          if (transformsRight) {
            const matrices = transformsRight.map(flat => { const m = new THREE.Matrix4(); m.fromArray(flat); return m })
            loaded.push({ key: 'keycaps_right', geometry: keycapGeom.clone(), instanceMatrices: matrices, isInstanced: true })
          }
        }

        cache.current.set(modelPath, loaded)
        setParts(loaded)
      })
      .catch(err => { setError(err.message); console.error('Model error:', err) })
      .finally(() => setIsLoading(false))
  }, [modelPath])

  return { parts, isLoading, error }
}
