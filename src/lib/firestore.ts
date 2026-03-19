/**
 * Firestore data layer — all collections: products, orders, siteSettings, cosmosConfigs
 * Storage path convention:
 *   - Product images: productMedia/<slug>/images/<timestamp>-<filename>
 *   - Hero media:     heroMedia/<filename>
 */

import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, Timestamp
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
    const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as Product))
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
    const q = query(collection(db, 'products'), where('category', '==', category), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as Product))
  },

  async create(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const docRef = await addDoc(collection(db, 'products'), {
      ...stripUndefined(data as any),
      createdAt: serverTimestamp(),
    })
    return { ...data, id: docRef.id, createdAt: new Date().toISOString() } as Product
  },

  async update(id: string, data: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, 'products', id), stripUndefined(data as any))
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'products', id))
  },
}

// ── Orders ───────────────────────────────────────────────────────────────────

export const ordersService = {
  async getAll(): Promise<Order[]> {
    const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as Order))
  },

  async getById(id: string): Promise<Order | null> {
    const snap = await getDoc(doc(db, 'orders', id))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data(), createdAt: toDate((snap.data() as any).createdAt) } as Order
  },

  async getByUserId(userId: string): Promise<Order[]> {
    const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as Order))
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
}

export const defaultSiteSettings: SiteSettings = {
  heroTitle: 'RABID',
  heroSubtitle: 'Premium split keyboards for those who refuse to compromise on how they work.',
  heroCtaLabel: 'Shop Keyboards',
  heroCtaHref: '/shop',
  cosmosConfigId: null,
  announcementBanner: '',
  announcementEnabled: false,
  footerTagline: 'Crafted by hand. Flashed with intent.',
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
    const snap = await getDocs(query(collection(db, 'cosmosConfigs'), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate((d.data() as any).createdAt) } as CosmosConfig))
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
