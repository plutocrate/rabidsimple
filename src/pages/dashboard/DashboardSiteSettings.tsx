import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { siteSettingsService, defaultSiteSettings } from '@/lib/firestore'
import type { SiteSettings } from '@/lib/firestore'
import { Save, Check, Upload, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardSiteSettings() {
  const [settings, setSettings]           = useState<SiteSettings>(defaultSiteSettings)
  const [isLoading, setIsLoading]         = useState(true)
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [error, setError]                 = useState('')

  useEffect(() => {
    siteSettingsService.get()
      .then(s => setSettings(s))
      .catch(() => {}).finally(() => setIsLoading(false))
  }, [])

  function update(patch: Partial<SiteSettings>) { setSettings(s => ({ ...s, ...patch })) }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      await siteSettingsService.update(settings)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e: any) { setError(e?.message ?? 'Save failed') }
    finally { setSaving(false) }
  }

  if (isLoading) return <DashboardLayout><div className="p-8"><p className="font-mono text-[11px] text-white/20 animate-pulse">Loading…</p></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-2">Admin</p>
            <h1 className="font-display text-2xl sm:text-3xl italic text-white">Site Settings</h1>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 shrink-0">
            {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            <span className="hidden sm:inline">{saved ? 'Saved' : saving ? 'Saving…' : 'Save Changes'}</span>
          </Button>
        </div>

        <section className="mb-8">
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-white/20 inline-block" /> Hero Section
          </p>
          {import.meta.env.VITE_COSMOS_LOCAL_URL && (
            <div className="flex items-center gap-2 mb-4 border border-green-500/20 bg-green-900/10 px-3 py-2">
              <Wifi className="w-3 h-3 text-green-400/60 shrink-0" />
              <p className="font-mono text-[10px] text-green-400/60">Local Cosmos running at {import.meta.env.VITE_COSMOS_LOCAL_URL}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">Hero Title</Label>
              <Input value={settings.heroTitle} onChange={e => update({ heroTitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">Hero Subtitle</Label>
              <textarea value={settings.heroSubtitle} onChange={e => update({ heroSubtitle: e.target.value })} rows={2}
                className="mt-1 w-full bg-transparent border border-white/10 px-3 py-2 font-mono text-sm text-white/70 resize-none focus:outline-none focus:border-white/30" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">CTA Label</Label>
                <Input value={settings.heroCtaLabel} onChange={e => update({ heroCtaLabel: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">CTA Href</Label>
                <Input value={settings.heroCtaHref} onChange={e => update({ heroCtaHref: e.target.value })} className="mt-1" placeholder="/shop" />
              </div>
            </div>
            <div>
              <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">Hero 3D Model</Label>
              <select
                value={(settings as any).heroModelPath ?? ''}
                onChange={e => update({ heroModelPath: e.target.value || undefined } as any)}
                className="mt-1 w-full bg-[#0a0a0a] border border-white/10 px-3 py-2 font-mono text-sm text-white/70 focus:outline-none"
              >
                <option value="">— corne_hero.json (default) —</option>
                <option value="/heroMedia/corne_hero.json">heroMedia/corne_hero.json</option>
              </select>
              <p className="font-mono text-[10px] text-white/25 mt-1">
                Add models to <span className="text-white/40">public/heroMedia/</span> via <span className="text-white/40">bash scripts/convert-model.sh</span>
              </p>
            </div>
          </div>
        </section>

        <Separator className="mb-8 opacity-10" />

        {/* Shop Closed */}
        <section className="mb-8 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-sm tracking-widest uppercase text-white/70 font-semibold">Shop Status</p>
              <p className="font-mono text-[10px] text-white/30 mt-1">When closed, visitors see a "coming soon" page instead of products</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="font-mono text-xs tracking-widest uppercase text-white/40">
                {settings.shopClosed ? 'CLOSED' : 'OPEN'}
              </span>
              <div
                onClick={() => update({ shopClosed: !settings.shopClosed })}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors cursor-pointer',
                  settings.shopClosed ? 'bg-red-500/60' : 'bg-green-500/50'
                )}
              >
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                  settings.shopClosed ? 'right-1' : 'left-1'
                )} />
              </div>
            </label>
          </div>
          {settings.shopClosed && (
            <div>
              <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-1.5 block">
                Closed Message
              </Label>
              <Input
                value={settings.shopClosedMessage ?? ''}
                onChange={e => update({ shopClosedMessage: e.target.value })}
                placeholder="Shop will open soon."
              />
            </div>
          )}
        </section>

        <section className="mb-8">
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-white/20 inline-block" /> Announcement Banner
          </p>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settings.announcementEnabled} onChange={e => update({ announcementEnabled: e.target.checked })} className="accent-white" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-white/40">Show banner</span>
            </label>
            <div>
              <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">Banner Text</Label>
              <Input value={settings.announcementBanner} onChange={e => update({ announcementBanner: e.target.value })} className="mt-1" placeholder="Free shipping on orders over ₹5,000" disabled={!settings.announcementEnabled} />
            </div>
          </div>
        </section>

        <Separator className="mb-8 opacity-10" />

        <section className="mb-8">
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-white/20 inline-block" /> Footer
          </p>
          <div>
            <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">Footer Tagline</Label>
            <Input value={settings.footerTagline} onChange={e => update({ footerTagline: e.target.value })} className="mt-1" />
          </div>
        </section>

        {error && <p className="font-mono text-[10px] text-red-400/70 border border-red-500/20 px-3 py-2 mb-4">{error}</p>}

        <Button onClick={handleSave} disabled={saving} className="gap-1.5 w-full sm:w-auto">
          {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
          {saved ? 'Saved' : saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </DashboardLayout>
  )
}
