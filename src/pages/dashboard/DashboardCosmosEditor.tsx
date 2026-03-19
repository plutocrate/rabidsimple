import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { CosmosViewer } from '@/components/3d/CosmosViewer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cosmosService, siteSettingsService } from '@/lib/firestore'
import { Plus, Trash2, Pencil, Globe, Package, ExternalLink, ArrowLeft } from 'lucide-react'
import type { CosmosConfig } from '@/lib/firestore'

const EMPTY: Omit<CosmosConfig, 'id' | 'createdAt'> = {
  name: '', description: '', iframeUrl: 'https://ryanis.cool/cosmos/', productSlug: null,
}

export function DashboardCosmosEditor() {
  const [configs, setConfigs]           = useState<CosmosConfig[]>([])
  const [isLoading, setIsLoading]       = useState(true)
  const [heroConfigId, setHeroConfigId] = useState<string | null>(null)
  const [previewId, setPreviewId]       = useState<string | null>(null)
  const [edit, setEdit]                 = useState<Partial<CosmosConfig> | null>(null)
  const [isNew, setIsNew]               = useState(false)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => {
    Promise.all([cosmosService.getAll(), siteSettingsService.get()])
      .then(([cfgs, settings]) => { setConfigs(cfgs); setHeroConfigId(settings.cosmosConfigId) })
      .catch(() => {}).finally(() => setIsLoading(false))
  }, [])

  function openNew() { setEdit({ ...EMPTY }); setIsNew(true); setError('') }
  function openEdit(cfg: CosmosConfig) { setEdit({ ...cfg }); setIsNew(false); setError('') }
  function closeDialog() { setEdit(null); setError('') }

  async function handleSave() {
    if (!edit) return
    if (!edit.name || !edit.iframeUrl) { setError('Name and URL are required.'); return }
    setSaving(true)
    try {
      const payload = { name: edit.name!, description: edit.description ?? '', iframeUrl: edit.iframeUrl!, productSlug: edit.productSlug ?? null }
      if (isNew) {
        const created = await cosmosService.create(payload)
        setConfigs(prev => [created, ...prev])
      } else {
        await cosmosService.update(edit.id!, payload)
        setConfigs(prev => prev.map(c => c.id === edit.id ? { ...c, ...payload } : c))
      }
      closeDialog()
    } catch (e: any) { setError(e?.message ?? 'Save failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(cfg: CosmosConfig) {
    if (!confirm(`Delete config "${cfg.name}"?`)) return
    await cosmosService.delete(cfg.id!)
    setConfigs(prev => prev.filter(c => c.id !== cfg.id))
    if (heroConfigId === cfg.id) { await siteSettingsService.update({ cosmosConfigId: null }); setHeroConfigId(null) }
  }

  async function setAsHero(cfg: CosmosConfig) {
    const newId = heroConfigId === cfg.id ? null : cfg.id!
    await siteSettingsService.update({ cosmosConfigId: newId })
    setHeroConfigId(newId)
  }

  const previewCfg = configs.find(c => c.id === previewId)

  return (
    <DashboardLayout>
      {/* Mobile: show list or preview depending on selection */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] md:h-screen">

        {/* List panel — full width on mobile when no preview, side panel on desktop */}
        <div className={`${previewId ? 'hidden md:flex' : 'flex'} md:flex w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-white/8 flex-col`}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/6">
            <div>
              <p className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-1">Cosmos</p>
              <h1 className="font-heading text-3xl text-white">Keyboard Models</h1>
            </div>
            <Button size="sm" className="gap-1.5 shrink-0" onClick={openNew}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="font-mono text-[11px] text-white/20 animate-pulse px-6 py-4">Loading…</p>
            ) : configs.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="font-sans text-sm text-white/25">No configs yet.</p>
                <p className="font-mono text-[9px] text-white/15 mt-2">Click + to add a Cosmos share URL.</p>
              </div>
            ) : configs.map(cfg => (
              <div key={cfg.id} onClick={() => setPreviewId(cfg.id!)}
                className={`px-4 sm:px-6 py-4 border-b border-white/5 cursor-pointer transition-colors group ${previewId === cfg.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] text-white/80 truncate">{cfg.name}</p>
                    {cfg.description && <p className="font-mono text-[9px] text-white/30 truncate mt-0.5">{cfg.description}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {heroConfigId === cfg.id && (
                        <span className="font-mono text-[8px] tracking-widest uppercase border border-white/30 text-white/50 px-1.5 py-0.5 flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" /> Hero
                        </span>
                      )}
                      {cfg.productSlug && (
                        <span className="font-mono text-[8px] tracking-widest uppercase border border-white/15 text-white/30 px-1.5 py-0.5 flex items-center gap-1">
                          <Package className="w-2.5 h-2.5" /> {cfg.productSlug}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button onClick={e => { e.stopPropagation(); openEdit(cfg) }} className="text-white/30 hover:text-white transition-colors"><Pencil className="w-3 h-3" /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(cfg) }} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview panel */}
        <div className={`${previewId ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
          {previewCfg ? (
            <>
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/6 shrink-0 gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <button onClick={() => setPreviewId(null)} className="md:hidden text-white/30 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <p className="font-mono text-[11px] text-white/50 truncate">{previewCfg.name}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant={heroConfigId === previewCfg.id ? 'default' : 'outline'} className="gap-1.5 text-[10px]" onClick={() => setAsHero(previewCfg)}>
                    <Globe className="w-3 h-3" />
                    <span className="hidden sm:inline">{heroConfigId === previewCfg.id ? 'Remove from Hero' : 'Set as Hero'}</span>
                    <span className="sm:hidden">Hero</span>
                  </Button>
                  <a href={previewCfg.iframeUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 text-[10px]">
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">Open Cosmos</span>
                    </Button>
                  </a>
                </div>
              </div>
              <CosmosViewer url={previewCfg.iframeUrl} className="flex-1" />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <p className="font-sans text-base text-white/25 mb-2">Select a config to preview</p>
                <p className="font-mono text-[10px] text-white/15">Or create a new one with a Cosmos share URL</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!edit} onOpenChange={open => !open && closeDialog()}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-sans text-lg font-semibold">{isNew ? 'New Cosmos Config' : 'Edit Config'}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4 mt-2">
              <div>
                <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">Config Name *</Label>
                <Input value={edit.name ?? ''} onChange={e => setEdit(p => ({ ...p!, name: e.target.value }))} className="mt-1" placeholder="e.g. Dactyl Hero Config" />
              </div>
              <div>
                <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">Description</Label>
                <Input value={edit.description ?? ''} onChange={e => setEdit(p => ({ ...p!, description: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">Cosmos Share URL *</Label>
                <Input value={edit.iframeUrl ?? ''} onChange={e => setEdit(p => ({ ...p!, iframeUrl: e.target.value }))} className="mt-1" placeholder="https://ryanis.cool/cosmos/#..." />
                <p className="font-mono text-[8px] text-white/20 mt-1">Cosmos → Share → Copy link</p>
              </div>
              <div>
                <Label className="font-mono text-[9px] tracking-widest uppercase text-white/30">Link to Product Slug (optional)</Label>
                <Input value={edit.productSlug ?? ''} onChange={e => setEdit(p => ({ ...p!, productSlug: e.target.value || null }))} className="mt-1" placeholder="dactyl-manuball-pro" />
              </div>
              {error && <p className="font-mono text-[10px] text-red-400/70 border border-red-500/20 px-3 py-2">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={closeDialog}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : isNew ? 'Create' : 'Save'}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
