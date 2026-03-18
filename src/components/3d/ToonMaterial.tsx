import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * RabidToonMaterial — cel-shaded with metallic specular highlight.
 * metalness: 0 = pure toon diffuse, 1 = full metallic mirror-like highlight
 * specularPower: sharpness of the metallic highlight
 * shimmer: animated time-based shimmer intensity (set via useFrame)
 */
export const RabidToonMaterial = shaderMaterial(
  {
    color:           new THREE.Color('#c8a882'),
    rimColor:        new THREE.Color('#ffffff'),
    rimStrength:     0.35,
    steps:           3.0,
    lightDir:        new THREE.Vector3(0.5, 1.0, 0.8).normalize(),
    ambientStrength: 0.45,
    metalness:       0.6,
    specularPower:   32.0,
    shimmer:         0.0,
    time:            0.0,
  },
  /* vertex */
  `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      vNormal = normalize(normalMatrix * normal);
      vec3 camPos = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
      vViewDir = normalize(camPos - worldPos.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* fragment */
  `
    uniform vec3  color;
    uniform vec3  rimColor;
    uniform float rimStrength;
    uniform float steps;
    uniform vec3  lightDir;
    uniform float ambientStrength;
    uniform float metalness;
    uniform float specularPower;
    uniform float shimmer;
    uniform float time;

    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 L = normalize(lightDir);
      vec3 V = normalize(vViewDir);
      vec3 H = normalize(L + V);  // half-vector for specular

      // Stepped toon diffuse
      float NdL  = max(dot(N, L), 0.0);
      float toon = floor(NdL * steps) / steps;
      float diff = clamp(toon + ambientStrength, 0.0, 1.0);

      // Metallic specular — hard toon step for that cel-shaded metal look
      float spec    = pow(max(dot(N, H), 0.0), specularPower);
      float specToon = step(0.75, spec);  // hard threshold = toon glint
      // Animated shimmer — small moving highlight
      float shimmerNoise = sin(vWorldPos.x * 8.0 + time * 1.4) *
                           cos(vWorldPos.y * 6.0 + time * 0.9) * 0.5 + 0.5;
      float shimmerGlint = step(0.88, shimmerNoise) * shimmer * 0.4;

      // Rim light — fresnel edge glow
      float rim = 1.0 - max(dot(N, V), 0.0);
      rim = pow(rim, 2.8) * rimStrength;

      // Compose: diffuse base + metallic spec glint + shimmer + rim
      vec3 diffuseColor  = color * diff;
      vec3 specColor     = mix(rimColor, color * 1.8, 0.4) * specToon * metalness;
      vec3 shimmerColor  = rimColor * shimmerGlint;
      vec3 rimContrib    = rimColor * rim * 0.3;

      vec3 finalColor = diffuseColor + specColor + shimmerColor + rimContrib;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

extend({ RabidToonMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    rabidToonMaterial: React.PropsWithChildren<{
      color?: THREE.Color | string
      rimColor?: THREE.Color | string
      rimStrength?: number
      steps?: number
      lightDir?: THREE.Vector3
      ambientStrength?: number
      metalness?: number
      specularPower?: number
      shimmer?: number
      time?: number
      attach?: string
      ref?: any
    }>
  }
}
