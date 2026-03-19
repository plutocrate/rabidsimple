import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageContent, Label, Display, Body, ContentSection } from '@/components/ui/typography'

export function PrivacyPage() {
  return (
    <PageLayout>
      <PageContent>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Label className="mb-4">Legal</Label>
          <Display className="mb-2">Privacy Policy</Display>
          <Label className="mb-14">Last updated: January 2025</Label>

          <div className="space-y-12">
            <ContentSection title="1. Information We Collect">
              <Body>When you place an order or create an account on RABID, we collect your name, email address, shipping address, and payment information (processed securely via our payment provider — we never store raw card data). When you contact us via our services enquiry form, we collect your name, email, and message content.</Body>
              <Body>We also collect anonymous usage data (pages visited, session duration) via privacy-respecting analytics to improve our store.</Body>
            </ContentSection>

            <ContentSection title="2. How We Use Your Information">
              <ul className="space-y-3">
                {['Fulfil and ship your orders', 'Send order confirmations and shipping updates', 'Respond to service enquiries', 'Improve our products and website', 'Comply with legal obligations'].map(item => (
                  <li key={item} className="flex gap-3">
                    <span className="font-mono text-white/25 shrink-0 mt-1">—</span>
                    <Body className="mt-0">{item}</Body>
                  </li>
                ))}
              </ul>
              <Body>We do not sell, rent, or trade your personal data to third parties. Ever.</Body>
            </ContentSection>

            <ContentSection title="3. Data Storage & Security">
              <Body>Your data is stored on secure servers in India. We use industry-standard encryption (TLS) for all data in transit. Passwords are hashed and never stored in plain text.</Body>
            </ContentSection>

            <ContentSection title="4. Cookies">
              <Body>We use essential cookies for authentication and cart persistence. We do not use advertising or tracking cookies. You can disable cookies in your browser, though this may affect checkout functionality.</Body>
            </ContentSection>

            <ContentSection title="5. Your Rights">
              <Body>You may request access to, correction of, or deletion of your personal data at any time by emailing <a href="mailto:hello@rabid.co.in" className="text-white underline underline-offset-4 hover:text-white/80 transition-colors">hello@rabid.co.in</a>. We will respond within 30 days.</Body>
            </ContentSection>

            <ContentSection title="6. Contact">
              <Body>For privacy-related queries, contact us at <a href="mailto:hello@rabid.co.in" className="text-white underline underline-offset-4 hover:text-white/80 transition-colors">hello@rabid.co.in</a>.</Body>
            </ContentSection>
          </div>
        </motion.div>
      </PageContent>
    </PageLayout>
  )
}
