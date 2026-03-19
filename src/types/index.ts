// ─────────────────────────────────────────────
// Product & Catalog Types
// ─────────────────────────────────────────────

export type ProductCategory = 'keyboard' | 'barebone' | 'accessory'
export type KeyboardSize = 'split' | 'small' | 'medium' | 'full'

export interface ProductTag {
  id: string
  label: string
  value: string
  category: 'size' | 'layout' | 'connectivity' | 'switch' | 'custom'
}

export interface ProductVariant {
  id: string
  name: string
  type: 'color' | 'switch' | 'keycap' | 'addon'
  options: {
    id: string
    label: string
    value: string
    priceModifier: number
    hexColor?: string  // for color variants
    available: boolean
  }[]
  required: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  subtitle: string
  description: string
  longDescription: string
  category: ProductCategory
  basePrice: number
  images: string[]
  modelPath?: string
  modelParts?: ModelPart[]
  tags: ProductTag[]
  variants: ProductVariant[]
  specs: Record<string, string>
  inStock: boolean
  stockCount?: number   // undefined = unlimited
  featured: boolean
  createdAt: string
}

export interface ModelPart {
  name: string
  meshName: string
  defaultColor: string
  colorOptions: { label: string; hex: string }[]
}

// ─────────────────────────────────────────────
// Cart & Order Types
// ─────────────────────────────────────────────

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedVariants: Record<string, string>
  calculatedPrice: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  shippingAddress: Address
}

export interface Address {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
  notes?: string
}

// ─────────────────────────────────────────────
// User Types
// ─────────────────────────────────────────────

export type UserRole = 'customer' | 'team' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

// ─────────────────────────────────────────────
// Dashboard / Analytics Types
// ─────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  revenueGrowth: number
  ordersGrowth: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
}

// ─────────────────────────────────────────────
// 3D Model Types
// ─────────────────────────────────────────────

export interface ModelPartConfig {
  partKey: string
  displayName: string
  color: string
  roughness: number
  metalness: number
}

export const KEYBOARD_PART_COLORS: ModelPartConfig[] = [
  { partKey: 'case_left',      displayName: 'Case Left',       color: '#dedad4', roughness: 0.38, metalness: 0.08 },
  { partKey: 'case_right',     displayName: 'Case Right',      color: '#dedad4', roughness: 0.38, metalness: 0.08 },
  { partKey: 'base_left',      displayName: 'Base Left',       color: '#111111', roughness: 0.65, metalness: 0.04 },
  { partKey: 'base_right',     displayName: 'Base Right',      color: '#111111', roughness: 0.65, metalness: 0.04 },
  { partKey: 'plate_left',     displayName: 'Plate Left',      color: '#222222', roughness: 0.5,  metalness: 0.1  },
  { partKey: 'plate_right',    displayName: 'Plate Right',     color: '#222222', roughness: 0.5,  metalness: 0.1  },
  { partKey: 'mcu_left',       displayName: 'MCU Left',        color: '#1a3a1a', roughness: 0.4,  metalness: 0.15 },
  { partKey: 'mcu_right',      displayName: 'MCU Right',       color: '#1a3a1a', roughness: 0.4,  metalness: 0.15 },
  { partKey: 'ball_left',      displayName: 'Ball Left',       color: '#1a1a1a', roughness: 0.15, metalness: 0.5  },
  { partKey: 'ball_right',     displayName: 'Ball Right',      color: '#1a1a1a', roughness: 0.15, metalness: 0.5  },
  { partKey: 'keycaps_left',   displayName: 'Keycaps Left',   color: '#d0cdc8', roughness: 0.5,  metalness: 0.0  },
  { partKey: 'keycaps_right',  displayName: 'Keycaps Right',  color: '#d0cdc8', roughness: 0.5,  metalness: 0.0  },
  { partKey: 'switches_left',  displayName: 'Switches Left',  color: '#444444', roughness: 0.6,  metalness: 0.05 },
  { partKey: 'switches_right', displayName: 'Switches Right', color: '#444444', roughness: 0.6,  metalness: 0.05 },
]

export const COLOR_PRESETS = [
  {
    label: 'GHOST',
    colors: {
      case_left: '#e0ddd8', case_right: '#e0ddd8',
      base_left: '#111',    base_right: '#111',
      plate_left: '#1a1a1a', plate_right: '#1a1a1a',
      mcu_left: '#1a3a1a',  mcu_right: '#1a3a1a',
      ball_left: '#222',    ball_right: '#222',
      keycaps_left: '#d8d4ce', keycaps_right: '#d8d4ce',
      switches_left: '#3a3a3a', switches_right: '#3a3a3a',
    },
  },
  {
    label: 'ONYX',
    colors: {
      case_left: '#1c1c1c', case_right: '#1c1c1c',
      base_left: '#080808', base_right: '#080808',
      plate_left: '#111', plate_right: '#111',
      mcu_left: '#0a2010', mcu_right: '#0a2010',
      ball_left: '#333',    ball_right: '#333',
      keycaps_left: '#2a2a2a', keycaps_right: '#2a2a2a',
      switches_left: '#222', switches_right: '#222',
    },
  },
  {
    label: 'BONE',
    colors: {
      case_left: '#f0ebe0', case_right: '#f0ebe0',
      base_left: '#1a1510', base_right: '#1a1510',
      plate_left: '#2a2018', plate_right: '#2a2018',
      mcu_left: '#1a3010', mcu_right: '#1a3010',
      ball_left: '#0d0d0d', ball_right: '#0d0d0d',
      keycaps_left: '#e8e0d0', keycaps_right: '#e8e0d0',
      switches_left: '#4a3828', switches_right: '#4a3828',
    },
  },
  {
    label: 'CHROME',
    colors: {
      case_left: '#c8d0d8', case_right: '#c8d0d8',
      base_left: '#141820', base_right: '#141820',
      plate_left: '#1c2230', plate_right: '#1c2230',
      mcu_left: '#102010',  mcu_right: '#102010',
      ball_left: '#202830', ball_right: '#202830',
      keycaps_left: '#b8c0c8', keycaps_right: '#b8c0c8',
      switches_left: '#303840', switches_right: '#303840',
    },
  },
  {
    label: 'VOID',
    colors: {
      case_left: '#0a0a0a', case_right: '#0a0a0a',
      base_left: '#040404', base_right: '#040404',
      plate_left: '#060606', plate_right: '#060606',
      mcu_left: '#040e04',  mcu_right: '#040e04',
      ball_left: '#181818', ball_right: '#181818',
      keycaps_left: '#141414', keycaps_right: '#141414',
      switches_left: '#0e0e0e', switches_right: '#0e0e0e',
    },
  },
]

// ─────────────────────────────────────────────
// Color swatches — real FDM filament colors available from common brands
// (Bambu Lab, eSUN, Polymaker, Hatchbox, Prusament)
// ─────────────────────────────────────────────
export const PART_COLOR_SWATCHES = [
  // Whites & Neutrals
  { label: 'Pure White',      hex: '#f5f5f5' },
  { label: 'Matte White',     hex: '#e8e8e0' },
  { label: 'Ivory',           hex: '#e8e0cc' },
  { label: 'Light Grey',      hex: '#c0c0c0' },
  { label: 'Mid Grey',        hex: '#808080' },
  { label: 'Charcoal',        hex: '#404040' },
  { label: 'Matte Black',     hex: '#1a1a1a' },
  // Browns & Earthy
  { label: 'Tan / Skin',      hex: '#c4a882' },
  { label: 'Warm Brown',      hex: '#7a4e30' },
  { label: 'Coffee',          hex: '#4a2e1a' },
  // Greens
  { label: 'Olive Green',     hex: '#5a5e2a' },
  { label: 'Forest Green',    hex: '#2a4a2a' },
  { label: 'Army Green',      hex: '#4a5a30' },
  // Blues
  { label: 'Navy Blue',       hex: '#1a2a5a' },
  { label: 'Cobalt Blue',     hex: '#2a4aaa' },
  { label: 'Sky Blue',        hex: '#6090cc' },
  { label: 'Ice Blue',        hex: '#b0d0e8' },
  // Reds & Pinks
  { label: 'Deep Red',        hex: '#6a1a1a' },
  { label: 'Brick Red',       hex: '#9a3030' },
  { label: 'Blush Pink',      hex: '#e8b0a0' },
  // Purples
  { label: 'Deep Purple',     hex: '#3a1a5a' },
  { label: 'Lavender',        hex: '#9080c0' },
  // Yellows & Oranges
  { label: 'Bright Yellow',   hex: '#e8d020' },
  { label: 'Amber',           hex: '#d08020' },
  { label: 'Orange',          hex: '#d06020' },
  // Specialty / PCB Colors
  { label: 'PCB Green',       hex: '#1a4a1a' },
  { label: 'PCB Black',       hex: '#0a0a0a' },
]
