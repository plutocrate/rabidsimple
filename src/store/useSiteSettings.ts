/**
 * useSiteSettings — fetches site settings from Firestore once and caches in memory.
 * Used by banner, shop closed overlay, etc.
 */
import { create } from 'zustand'
import { siteSettingsService, defaultSiteSettings } from '@/lib/firestore'
import type { SiteSettings } from '@/lib/firestore'

interface SiteSettingsStore {
  settings: SiteSettings
  loaded: boolean
  fetch: () => Promise<void>
}

export const useSiteSettings = create<SiteSettingsStore>((set, get) => ({
  settings: defaultSiteSettings,
  loaded: false,

  fetch: async () => {
    try {
      const s = await siteSettingsService.get()
      set({ settings: s, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },
}))
