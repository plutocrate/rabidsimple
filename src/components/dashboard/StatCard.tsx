import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  change?: number
  icon: LucideIcon
  className?: string
}

export function StatCard({ label, value, change, icon: Icon, className }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0

  return (
    <div className={cn('border border-white/8 bg-white/[0.02] p-5 hover:bg-white/[0.035] transition-colors', className)}>
      <div className="flex items-start justify-between mb-4">
        <p className="font-mono text-[10px] tracking-widest uppercase text-white/30">{label}</p>
        <Icon className="w-4 h-4 text-white/15" />
      </div>
      <p className="price-display text-2xl text-white mb-1">{value}</p>
      {change !== undefined && (
        <p className={cn('font-mono text-[10px] tracking-wide', isPositive ? 'text-white/40' : 'text-red-400/60')}>
          {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs last month
        </p>
      )}
    </div>
  )
}
