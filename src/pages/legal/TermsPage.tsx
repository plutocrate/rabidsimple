import { PageLayout } from '@/components/layout/PageLayout'
import { motion } from 'framer-motion'

export function TermsPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-32">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4">Legal</p>
          <h1 className="font-display text-4xl italic text-white mb-3">Terms of Service</h1>
          <p className="font-mono text-[10px] text-white/25 mb-12">Last updated: January 2025</p>

          <div className="space-y-10 font-display text-base text-white/55 leading-[1.8]">
            {[
              { title: '1. Acceptance', body: 'By accessing rabid.co.in or placing an order, you agree to these terms. If you do not agree, please do not use our site.' },
              { title: '2. Products', body: 'All RABID keyboards are handmade to order. Lead times are specified on each product page and are estimates — not guarantees. We reserve the right to refuse any order at our discretion.' },
              { title: '3. Pricing', body: 'All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We reserve the right to update pricing without notice, but any price change will not affect confirmed orders.' },
              { title: '4. Custom Orders', body: 'Custom configurations (color, switch, MCU) are non-refundable once production has begun. If there is a defect in workmanship, we will repair or replace at no cost. See our Returns Policy for details.' },
              { title: '5. Intellectual Property', body: 'All content on rabid.co.in — including the RABID name, logo, 3D models, and copy — is the property of RABID and may not be reproduced without written permission.' },
              { title: '6. Limitation of Liability', body: 'RABID is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability is limited to the amount paid for the relevant order.' },
              { title: '7. Governing Law', body: 'These terms are governed by the laws of India. Any disputes shall be resolved in the courts of India.' },
              { title: '8. Changes', body: 'We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.' },
            ].map(s => (
              <section key={s.title}>
                <h2 className="font-display text-xl text-white mb-3 not-italic">{s.title}</h2>
                <p>{s.body}</p>
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
