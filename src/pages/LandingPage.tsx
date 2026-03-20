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
  const heroSubtitle = settings.heroSubtitle || 'Premium split keyboards for those who refuse to compromise.'

  return (
    <PageLayout>
      {/* ── Mobile / Tablet layout: canvas on top, content below ── */}
      <section className="flex flex-col lg:hidden bg-[#080808]">
        {/* 3D canvas — 35vh on mobile, 45vh on tablet */}
        <div className="w-full flex-shrink-0 h-[35vh] md:h-[45vh]">
          <LandingViewer modelPath={MODEL_PATH} />
        </div>

        {/* Content */}
        <div className="flex flex-col px-7 sm:px-10 pt-6 pb-10 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4"
          >
            <h1 className="font-heading text-[clamp(3rem,16vw,6rem)] leading-[0.85] tracking-wider text-white mb-3">
              {heroTitle}
            </h1>
            <p className="font-display text-base italic text-white/55 leading-relaxed max-w-sm">
              {heroSubtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-row gap-3"
          >
            <Link to="/shop">
              <Button size="lg" className="text-sm px-5 h-11 gap-2 font-bold">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="lg" className="text-sm px-5 h-11 font-bold">
                Services
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Desktop layout: side-by-side ── */}
      <section className="hidden lg:flex min-h-screen">
        {/* Viewer — 55% sticky */}
        <div className="w-[55%] bg-[#0a0a0a] sticky top-0 h-screen flex-shrink-0">
          <LandingViewer modelPath={MODEL_PATH} />
        </div>

        {/* Right panel */}
        <div className="w-[45%] flex flex-col justify-center px-12 lg:px-16 py-14 min-h-screen bg-black">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <h1 className="font-heading text-[clamp(5rem,12vw,9rem)] leading-[0.85] tracking-wider text-white mb-6">
              {heroTitle}
            </h1>
            <p className="font-display text-2xl italic text-white/60 leading-relaxed max-w-md">
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
