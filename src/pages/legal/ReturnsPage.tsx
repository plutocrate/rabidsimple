import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageContent, Label, Display, Body, ContentSection } from '@/components/ui/typography'

export function ReturnsPage() {
  return (
    <PageLayout>
      <PageContent>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Label className="mb-4">Legal</Label>
          <Display className="mb-2">Returns & Repairs</Display>
          <Label className="mb-14">Last updated: January 2025</Label>

          <div className="space-y-12">
            <ContentSection title="Our policy, simply">
              <Body>Every RABID keyboard is built by hand to order. Because each build is custom, we do not accept returns for change of mind. However, we stand fully behind our workmanship.</Body>
            </ContentSection>

            <ContentSection title="Defects & Workmanship">
              <Body>If your keyboard arrives with a defect caused by our build — a cold solder joint, firmware issue, or damaged component — we will repair or replace it at no cost within 90 days of delivery.</Body>
              <Body>To initiate a warranty claim, email <a href="mailto:hello@rabid.co.in" className="text-white underline underline-offset-4 hover:text-white/80 transition-colors">hello@rabid.co.in</a> with photos and your order number.</Body>
            </ContentSection>

            <ContentSection title="Custom Orders (Non-refundable)">
              <Body>Custom builds (specific layouts, exotic switches, custom cases) are non-refundable once production has started. We confirm all build specifications via email before beginning.</Body>
            </ContentSection>

            <ContentSection title="Shipping Damage">
              <Body>If your order arrives damaged in transit, contact us within 7 days of delivery with photos. We will work with you to resolve it.</Body>
            </ContentSection>

            <ContentSection title="Repairs & Upgrades">
              <Body>Out of warranty? We still repair RABID keyboards at a reasonable service rate. We also offer upgrades — new switches, different MCUs, wireless conversion. Email us to discuss.</Body>
            </ContentSection>
          </div>
        </motion.div>
      </PageContent>
    </PageLayout>
  )
}
