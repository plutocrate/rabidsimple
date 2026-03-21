import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { LandingViewer } from '@/components/3d/LandingViewer'
import { useSiteSettings } from '@/store/useSiteSettings'
import { Button } from '@/components/ui/button'

const DEFAULT_MODEL = '/heroMedia/corne_hero.json'

export function LandingPage() {
  const { settings, fetch } = useSiteSettings()
  useEffect(() => { fetch() }, [])
  const MODEL_PATH = settings.heroModelPath || DEFAULT_MODEL
  const heroTitle    = settings.heroTitle    || 'RABID'
  const heroSubtitle = settings.heroSubtitle || 'Premium split keyboards for men.'

  return (
    <PageLayout>
      {/* ── Mobile + Tablet: stacked layout (up to 1280px) ── */}
      <section className="flex flex-col xl:hidden bg-[#080808]">
        <div className="w-full flex-shrink-0 h-[38vh] sm:h-[45vh] md:h-[55vh]">
          <LandingViewer modelPath={MODEL_PATH} />
        </div>
        <div className="flex flex-col px-7 sm:px-12 md:px-16 pt-8 md:pt-12 pb-12 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 md:mb-8"
          >
            <h1 className="font-heading text-[clamp(3.5rem,14vw,7rem)] leading-[0.85] tracking-wider text-white mb-3 md:mb-4">
              {heroTitle}
            </h1>
            <p className="font-display text-lg md:text-2xl italic text-white/55 leading-relaxed max-w-lg">
              {heroSubtitle}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-row gap-3 md:gap-5"
          >
            <Link to="/shop">
              <Button size="lg" className="text-sm md:text-base px-6 md:px-10 h-12 md:h-14 gap-2 font-bold">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="lg" className="text-sm md:text-base px-6 md:px-10 h-12 md:h-14 font-bold">
                Services
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Desktop only: side-by-side (1280px+) ── */}
      <section className="hidden xl:flex min-h-screen">
        <div className="w-[55%] bg-[#0a0a0a] sticky top-0 h-screen flex-shrink-0">
          <LandingViewer modelPath={MODEL_PATH} />
        </div>
        <div className="w-[45%] flex flex-col justify-center px-16 py-14 min-h-screen bg-background">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <h1 className="font-heading text-[clamp(5rem,10vw,9rem)] leading-[0.85] tracking-wider text-foreground mb-6">
              {heroTitle}
            </h1>
            <p className="font-display text-2xl italic text-foreground/60 leading-relaxed max-w-md">
              {heroSubtitle}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-5"
          >
            <Link to="/shop">
              <Button size="lg" className="text-base px-10 h-16 gap-3 font-bold">
                Shop Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="lg" className="text-base px-10 h-16 font-bold">
                Services
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}
