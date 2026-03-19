/**
 * CosmosViewer — embeds the Cosmos Keyboards configurator.
 * Automatically uses local Cosmos (VITE_COSMOS_LOCAL_URL) if set,
 * otherwise falls back to the live ryanis.cool/cosmos instance.
 *
 * Setup local Cosmos: bash scripts/setup-cosmos.sh
 */

import { useState, useRef } from 'react'
import { ExternalLink, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CosmosViewerProps {
  url?: string
  editable?: boolean
  className?: string
  onUrlChange?: (url: string) => void
}

// Use local Cosmos if available (set via setup-cosmos.sh), else live
const LOCAL_COSMOS  = import.meta.env.VITE_COSMOS_LOCAL_URL as string | undefined
const COSMOS_BASE   = LOCAL_COSMOS || 'https://ryanis.cool/cosmos/'
const IS_LOCAL      = !!LOCAL_COSMOS

export function CosmosViewer({ url, editable = false, className, onUrlChange }: CosmosViewerProps) {
  const [inputUrl, setInputUrl]   = useState(url || COSMOS_BASE)
  const [activeUrl, setActiveUrl] = useState(url || COSMOS_BASE)
  const [loading, setLoading]     = useState(true)
  const [localDown, setLocalDown] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  function handleLoad() {
    setLoading(false)
    setLocalDown(false)
  }

  function handleError() {
    if (IS_LOCAL) {
      setLocalDown(true)
      // Fallback to live Cosmos
      const fallback = activeUrl.replace(LOCAL_COSMOS!, 'https://ryanis.cool/cosmos/')
      setActiveUrl(fallback)
    }
    setLoading(false)
  }

  function handleApplyUrl() {
    const clean = inputUrl.trim() || COSMOS_BASE
    setActiveUrl(clean)
    setLoading(true)
    onUrlChange?.(clean)
  }

  function handleRefresh() {
    if (iframeRef.current) {
      setLoading(true)
      iframeRef.current.src = activeUrl
    }
  }

  return (
    <div className={cn('flex flex-col bg-black', className)}>
      {editable && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8 bg-[#0a0a0a]">
          {/* Local/live indicator */}
          <div title={IS_LOCAL && !localDown ? 'Using local Cosmos' : 'Using live Cosmos'}>
            {IS_LOCAL && !localDown
              ? <Wifi className="w-3 h-3 text-green-400/60" />
              : <WifiOff className="w-3 h-3 text-white/20" />
            }
          </div>
          <span className="font-mono text-[9px] text-white/30 tracking-widest uppercase shrink-0">URL</span>
          <input
            type="text"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleApplyUrl()}
            placeholder={COSMOS_BASE}
            className="flex-1 bg-transparent font-mono text-[11px] text-white/60 outline-none placeholder:text-white/20 min-w-0"
          />
          <button
            onClick={handleApplyUrl}
            className="font-mono text-[9px] tracking-widest uppercase text-white/40 hover:text-white/80 transition-colors border border-white/10 px-2 py-1 hover:border-white/30"
          >
            Apply
          </button>
          <button onClick={handleRefresh} className="text-white/30 hover:text-white/60 transition-colors">
            <RefreshCw className="w-3 h-3" />
          </button>
          <a href={activeUrl} target="_blank" rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 transition-colors">
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {localDown && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/20 border-b border-yellow-500/20">
          <WifiOff className="w-3 h-3 text-yellow-400/60 shrink-0" />
          <p className="font-mono text-[9px] text-yellow-400/60 tracking-wide">
            Local Cosmos not running — using live ryanis.cool. Run: cd cosmos-keyboards && npm run dev
          </p>
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
              <p className="font-mono text-[9px] tracking-widest uppercase text-white/30">
                {IS_LOCAL && !localDown ? 'Loading Local Cosmos' : 'Loading Cosmos'}
              </p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={activeUrl}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-full border-0"
          title="Cosmos Keyboards Configurator"
          allow="fullscreen"
        />
      </div>

      {!editable && (
        <div className="flex justify-end px-3 py-2 border-t border-white/6">
          <a href={activeUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors">
            <ExternalLink className="w-2.5 h-2.5" />
            Open in Cosmos
          </a>
        </div>
      )}
    </div>
  )
}
