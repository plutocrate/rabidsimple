/**
 * Firestore data layer — all collections: products, orders, siteSettings, cosmosConfigs
 * Storage path convention:
 *   - Product images: productMedia/<slug>/images/<timestamp>-<filename>
 *   - Hero media:     heroMedia/<filename>
 */

import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, Timestamp
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL, deleteObject, listAll
} from 'firebase/storage'
import { db, storage } from './firebase'
import type { Product, Order } from '@/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDate(ts: any): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

function stripUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

// ── Products ─────────────────────────────────────────────────────────────────

export const productsService = {
  async getAll(): Promise<Product[]> {
    const snap = await getDocs(collection(db, 'products'))
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as Product))
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getById(id: string): Promise<Product | null> {
    const snap = await getDoc(doc(db, 'products', id))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data(), createdAt: toDate((snap.data() as any).createdAt) } as Product
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const q = query(collection(db, 'products'), where('slug', '==', slug))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const d = snap.docs[0]
    return { id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as Product
  },

  async getByCategory(category: string): Promise<Product[]> {
    const q = query(collection(db, 'products'), where('category', '==', category))
    const snap = await getDocs(q)
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as Product))
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async create(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const payload = { ...stripUndefined(data as any), createdAt: serverTimestamp() }
    console.log('[Firestore] Creating product:', JSON.stringify(payload, null, 2))
    const docRef = await addDoc(collection(db, 'products'), payload)
    return { ...data, id: docRef.id, createdAt: new Date().toISOString() } as Product
  },

  async update(id: string, data: Partial<Product>): Promise<void> {
    if (!id || id === 'new') throw new Error(`Invalid product ID for update: "${id}"`)
    console.log('[Firestore] Updating product id:', id)
    await updateDoc(doc(db, 'products', id), stripUndefined(data as any))
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'products', id))
  },
}

// ── Orders ───────────────────────────────────────────────────────────────────

export const ordersService = {
  async getAll(): Promise<Order[]> {
    const snap = await getDocs(collection(db, 'orders'))
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as Order))
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getById(id: string): Promise<Order | null> {
    const snap = await getDoc(doc(db, 'orders', id))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data(), createdAt: toDate((snap.data() as any).createdAt) } as Order
  },

  async getByUserId(userId: string): Promise<Order[]> {
    const q = query(collection(db, 'orders'), where('userId', '==', userId))
    const snap = await getDocs(q)
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as Order))
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async create(data: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...stripUndefined(data as any),
      createdAt: serverTimestamp(),
    })
    return { ...data, id: docRef.id, createdAt: new Date().toISOString() } as Order
  },

  async updateStatus(id: string, status: Order['status']): Promise<void> {
    await updateDoc(doc(db, 'orders', id), { status })
  },
}

// ── Site Settings ─────────────────────────────────────────────────────────────

export interface SiteSettings {
  heroTitle: string
  heroSubtitle: string
  heroCtaLabel: string
  heroCtaHref: string
  cosmosConfigId: string | null
  announcementBanner: string
  announcementEnabled: boolean
  footerTagline: string
  shopClosed: boolean
  shopClosedMessage: string
  heroModelPath?: string   // path to JSON model in /public, e.g. /heroMedia/corne_hero.json
}

export const defaultSiteSettings: SiteSettings = {
  heroTitle: 'RABID',
  heroSubtitle: 'Premium split keyboards men.',
  heroCtaLabel: 'Shop Keyboards',
  heroCtaHref: '/shop',
  cosmosConfigId: null,
  announcementBanner: '',
  announcementEnabled: false,
  footerTagline: 'Crafted by hand. Flashed with intent.',
  shopClosed: false,
  shopClosedMessage: 'Shop will open soon.',
  heroModelPath: undefined,
}

export const siteSettingsService = {
  async get(): Promise<SiteSettings> {
    const snap = await getDoc(doc(db, 'site', 'settings'))
    if (!snap.exists()) return defaultSiteSettings
    return { ...defaultSiteSettings, ...snap.data() } as SiteSettings
  },

  async update(data: Partial<SiteSettings>): Promise<void> {
    await setDoc(doc(db, 'site', 'settings'), stripUndefined(data as any), { merge: true })
  },
}

// ── Cosmos Configs ────────────────────────────────────────────────────────────

export interface CosmosConfig {
  id?: string
  name: string
  description: string
  iframeUrl: string
  productSlug: string | null
  createdAt?: string
}

export const cosmosService = {
  async getAll(): Promise<CosmosConfig[]> {
    const snap = await getDocs(collection(db, 'cosmosConfigs'))
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as CosmosConfig))
    return docs.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
  },

  async getById(id: string): Promise<CosmosConfig | null> {
    const snap = await getDoc(doc(db, 'cosmosConfigs', id))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as CosmosConfig
  },

  async create(data: Omit<CosmosConfig, 'id' | 'createdAt'>): Promise<CosmosConfig> {
    const docRef = await addDoc(collection(db, 'cosmosConfigs'), {
      ...data,
      createdAt: serverTimestamp(),
    })
    return { ...data, id: docRef.id, createdAt: new Date().toISOString() }
  },

  async update(id: string, data: Partial<CosmosConfig>): Promise<void> {
    await updateDoc(doc(db, 'cosmosConfigs', id), stripUndefined(data as any))
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'cosmosConfigs', id))
  },
}

// ── Storage ───────────────────────────────────────────────────────────────────
// Convention:
//   Product images  → productMedia/<slug>/images/<timestamp>-<name>
//   Hero media      → heroMedia/<name>

export async function uploadProductImage(file: File, productSlug: string): Promise<string> {
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const path = `productMedia/${productSlug}/images/${filename}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function uploadProductModel(file: File, productSlug: string): Promise<string> {
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const path = `productMedia/${productSlug}/models/${filename}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function uploadHeroMedia(file: File): Promise<string> {
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const path = `heroMedia/${filename}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function listProductImages(productSlug: string): Promise<string[]> {
  try {
    const listRef = ref(storage, `productMedia/${productSlug}/images`)
    const res = await listAll(listRef)
    return Promise.all(res.items.map(item => getDownloadURL(item)))
  } catch {
    return []
  }
}

export async function deleteStorageFile(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
  } catch {
    // ignore not-found
  }
}
