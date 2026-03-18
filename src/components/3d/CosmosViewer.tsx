/**
 * CosmosViewer — embeds the Cosmos Keyboards configurator.
 * In admin: shows an editable iframe with the Cosmos configurator.
 * In public hero/product: shows a read-only embed of the saved config URL.
 *
 * Cosmos Keyboards project: https://github.com/rianadon/Cosmos-Keyboards
 * Live app: https://ryanis.cool/cosmos/
 */

import { useState, useRef } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CosmosViewerProps {
  /** Full Cosmos share URL, e.g. https://ryanis.cool/cosmos/#...  */
  url?: string
  /** If true, show the full Cosmos configurator for building/editing */
  editable?: boolean
  className?: string
  onUrlChange?: (url: string) => void
}

const COSMOS_BASE = 'https://ryanis.cool/cosmos/'

export function CosmosViewer({ url, editable = false, className, onUrlChange }: CosmosViewerProps) {
  const [inputUrl, setInputUrl] = useState(url || COSMOS_BASE)
  const [activeUrl, setActiveUrl] = useState(url || COSMOS_BASE)
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  function handleLoad() {
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
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
              <p className="font-mono text-[9px] tracking-widest uppercase text-white/30">Loading Cosmos</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={activeUrl}
          onLoad={handleLoad}
          className="w-full h-full border-0"
          title="Cosmos Keyboards Configurator"
          allow="fullscreen"
        />
      </div>

      {!editable && (
        <div className="flex justify-end px-3 py-2 border-t border-white/6">
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors"
          >
            <ExternalLink className="w-2.5 h-2.5" />
            Open in Cosmos
          </a>
        </div>
      )}
    </div>
  )
}
