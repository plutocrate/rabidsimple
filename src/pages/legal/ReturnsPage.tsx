import { PageLayout } from '@/components/layout/PageLayout'
import { motion } from 'framer-motion'

export function ReturnsPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-32">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4">Legal</p>
          <h1 className="font-display text-4xl italic text-white mb-3">Returns & Repairs</h1>
          <p className="font-mono text-[10px] text-white/25 mb-12">Last updated: January 2025</p>

          <div className="space-y-10 font-display text-base text-white/55 leading-[1.8]">
            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">Our policy, simply</h2>
              <p>Every RABID keyboard is built by hand and tested before it ships. If something is wrong, we'll make it right — no runaround, no hidden clauses.</p>
            </section>
            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">Defects & Workmanship</h2>
              <p>If your keyboard arrives with a defect in workmanship (bad solder joint, broken case, non-functional switch), email us within 14 days of delivery with photos. We will repair, replace the affected part, or issue a full refund — your choice.</p>
            </section>
            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">Custom Orders (Non-refundable)</h2>
              <p>Custom-configured keyboards (specific colors, switches, MCUs) are made to your specification and are non-refundable once production has started, unless there is a defect. We confirm all configurations by email before beginning any build — please review carefully.</p>
            </section>
            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">Accessories & Standard Items</h2>
              <p>Unopened accessories (MCUs, soldering kits, etc.) may be returned within 14 days of delivery for a full refund minus shipping. Items must be in original, unopened packaging.</p>
            </section>
            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">Shipping Damage</h2>
              <p>If your package arrives visibly damaged, photograph the packaging before opening and email us within 48 hours. We will file a claim with the courier and send a replacement at no cost to you.</p>
            </section>
            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">How to start a return or repair</h2>
              <p>Email <a href="mailto:hello@rabid.co.in" className="text-white/70 underline underline-offset-2">hello@rabid.co.in</a> with your order number, a description of the issue, and photos. We respond within 24 hours on working days.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
