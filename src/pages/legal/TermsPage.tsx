import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageContent, Label, Display, Body, ContentSection } from '@/components/ui/typography'

const SECTIONS = [
  { title: '1. Acceptance', body: 'By accessing rabid.co.in or placing an order, you agree to these terms. If you do not agree, please do not use our site.' },
  { title: '2. Products', body: 'All RABID keyboards are handmade to order. Lead times are specified on each product page and are estimates — not guarantees. We reserve the right to refuse any order at our discretion.' },
  { title: '3. Pricing', body: 'All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We reserve the right to update pricing without notice, but any price change will not affect confirmed orders.' },
  { title: '4. Custom Orders', body: 'Custom configurations (color, switch, MCU) are non-refundable once production has begun. If there is a defect in workmanship, we will repair or replace at no cost. See our Returns Policy for details.' },
  { title: '5. Intellectual Property', body: 'All content on rabid.co.in — including the RABID name, logo, 3D models, and copy — is the property of RABID and may not be reproduced without written permission.' },
  { title: '6. Limitation of Liability', body: 'RABID is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability is limited to the amount paid for the relevant order.' },
  { title: '7. Governing Law', body: 'These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.' },
  { title: '8. Contact', body: 'Questions about these terms? Email hello@rabid.co.in.' },
]

export function TermsPage() {
  return (
    <PageLayout>
      <PageContent>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Label className="mb-4">Legal</Label>
          <Display className="mb-2">Terms of Service</Display>
          <Label className="mb-14">Last updated: January 2025</Label>

          <div className="space-y-12">
            {SECTIONS.map(s => (
              <ContentSection key={s.title} title={s.title}>
                <Body>{s.body}</Body>
              </ContentSection>
            ))}
          </div>
        </motion.div>
      </PageContent>
    </PageLayout>
  )
}
