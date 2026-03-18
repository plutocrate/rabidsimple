import { PageLayout } from '@/components/layout/PageLayout'
import { motion } from 'framer-motion'

export function PrivacyPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-32">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4">Legal</p>
          <h1 className="font-display text-4xl italic text-white mb-3">Privacy Policy</h1>
          <p className="font-mono text-[10px] text-white/25 mb-12">Last updated: January 2025</p>

          <div className="space-y-10 font-display text-base text-white/55 leading-[1.8]">
            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">1. Information We Collect</h2>
              <p>When you place an order or create an account on RABID, we collect your name, email address, shipping address, and payment information (processed securely via our payment provider — we never store raw card data). When you contact us via our services enquiry form, we collect your name, email, and message content.</p>
              <p className="mt-3">We also collect anonymous usage data (pages visited, session duration) via privacy-respecting analytics to improve our store.</p>
            </section>

            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">2. How We Use Your Information</h2>
              <ul className="space-y-2 ml-4">
                {['Fulfil and ship your orders', 'Send order confirmations and shipping updates', 'Respond to service enquiries', 'Improve our products and website', 'Comply with legal obligations'].map(item => (
                  <li key={item} className="flex gap-2"><span className="text-white/25 mt-1">—</span>{item}</li>
                ))}
              </ul>
              <p className="mt-3">We do not sell, rent, or trade your personal data to third parties. Ever.</p>
            </section>

            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">3. Data Storage & Security</h2>
              <p>Your data is stored on secure servers in India. We use industry-standard encryption (TLS) for all data in transit. Passwords are hashed using bcrypt and never stored in plain text.</p>
            </section>

            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">4. Cookies</h2>
              <p>We use essential cookies for authentication and cart persistence. We do not use advertising or tracking cookies. You can disable cookies in your browser, though this may affect checkout functionality.</p>
            </section>

            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">5. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data at any time by emailing <a href="mailto:hello@rabid.co.in" className="text-white/70 underline underline-offset-2">hello@rabid.co.in</a>. We will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="font-display text-xl text-white mb-3 not-italic">6. Contact</h2>
              <p>For any privacy-related queries, contact us at <a href="mailto:hello@rabid.co.in" className="text-white/70 underline underline-offset-2">hello@rabid.co.in</a> or write to RABID, India.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
