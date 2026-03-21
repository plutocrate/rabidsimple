import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { mailingListService } from '@/lib/firestore'
import { X, ArrowRight, Check } from 'lucide-react'

const SIGNED_UP_KEY = 'rabid_ml_signedup'

function useIsLight() {
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'))
  useEffect(() => {
    const obs = new MutationObserver(() => setLight(document.documentElement.classList.contains('light')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return light
}

function ScanLine({ isLight }: { isLight: boolean }) {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none z-0"
      style={{ background: `linear-gradient(to right, transparent, ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)'}, transparent)` }}
      animate={{ top: ['20%', '80%', '20%'] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

function Particle({ delay, isLight }: { delay: number; isLight: boolean }) {
  return (
    <motion.div
      className="absolute w-px h-px rounded-full"
      style={{
        left: `${10 + Math.random() * 80}%`,
        bottom: 0,
        backgroundColor: isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)',
      }}
      animate={{ y: [0, -120, -180], opacity: [0, 0.6, 0], x: [0, (Math.random() - 0.5) * 30] }}
      transition={{ duration: 3 + Math.random() * 2, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

export function MailingListPopup() {
  const isLight = useIsLight()
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [focused, setFocused] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')
  const cardRef = useRef<HTMLDivElement>(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useTransform(my, [-0.5, 0.5], [3, -3])
  const rotateY = useTransform(mx, [-0.5, 0.5], [-3, 3])

  // Colors derived from theme
  const fg      = isLight ? 'rgba(20,16,12,1)'    : 'rgba(255,255,255,1)'
  const fg60    = isLight ? 'rgba(20,16,12,0.60)' : 'rgba(255,255,255,0.60)'
  const fg50    = isLight ? 'rgba(20,16,12,0.50)' : 'rgba(255,255,255,0.50)'
  const fg40    = isLight ? 'rgba(20,16,12,0.40)' : 'rgba(255,255,255,0.40)'
  const fg30    = isLight ? 'rgba(20,16,12,0.30)' : 'rgba(255,255,255,0.30)'
  const fg20    = isLight ? 'rgba(20,16,12,0.20)' : 'rgba(255,255,255,0.20)'
  const fg10    = isLight ? 'rgba(20,16,12,0.10)' : 'rgba(255,255,255,0.10)'
  const fg08    = isLight ? 'rgba(20,16,12,0.08)' : 'rgba(255,255,255,0.08)'
  const cardBg  = isLight
    ? 'linear-gradient(145deg, #f5f3ef 0%, #f0ede8 55%, #f3f0ec 100%)'
    : 'linear-gradient(145deg, #0e0c12 0%, #0a090d 55%, #0c0b10 100%)'
  const cardShadow = isLight
    ? '0 0 0 1px rgba(0,0,0,0.04) inset, 0 40px 100px rgba(0,0,0,0.18)'
    : '0 0 0 1px rgba(160,140,200,0.05) inset, 0 40px 100px rgba(0,0,0,0.75)'

  useEffect(() => {
    if (localStorage.getItem(SIGNED_UP_KEY)) return
    const t = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() { mx.set(0); my.set(0) }
  function dismiss() { setVisible(false) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return
    setStatus('loading')
    try {
      const result = await mailingListService.subscribe(email)
      setStatus(result.duplicate ? 'duplicate' : 'success')
      if (!result.duplicate) {
        localStorage.setItem(SIGNED_UP_KEY, '1')
        setTimeout(() => dismiss(), 2200)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] backdrop-blur-[2px]"
            style={{ backgroundColor: isLight ? 'rgba(200,196,190,0.35)' : 'rgba(0,0,0,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={dismiss}
          />

          {/* Card */}
          <div className="fixed z-[61] pointer-events-none" style={{ top: '20px', left: '20px', right: '20px', bottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              ref={cardRef}
              className="pointer-events-auto w-full"
              style={{ rotateX, rotateY, transformPerspective: 1200, maxWidth: '480px' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="relative w-full overflow-hidden"
                style={{ background: cardBg, border: `1px solid ${fg10}`, boxShadow: cardShadow }}
              >
                {/* Corner marks */}
                {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map((cls, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-3 h-3 ${cls}`}
                    style={{ borderColor: fg40 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
                  />
                ))}

                {/* Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[0, 0.5, 1, 1.5, 2, 2.5].map((d, i) => <Particle key={i} delay={d} isLight={isLight} />)}
                </div>

                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: `1px solid ${fg08}` }}>
                  <motion.div className="flex items-center gap-2" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: fg60 }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    <span className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: fg50 }}>
                      RABID · PRE-LAUNCH
                    </span>
                  </motion.div>
                  <motion.button
                    onClick={dismiss}
                    className="p-0.5 transition-opacity hover:opacity-100"
                    style={{ color: fg30 }}
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Body */}
                <div className="px-5 sm:px-10 pt-6 sm:pt-10 pb-5 sm:pb-8">
                  <AnimatePresence mode="wait">
                    {status === 'success' ? (
                      <motion.div
                        key="success"
                        className="py-8 flex flex-col items-center text-center gap-5"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <motion.div
                          className="w-16 h-16 flex items-center justify-center"
                          style={{ border: `1px solid ${fg20}` }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Check className="w-6 h-6" style={{ color: fg60 }} />
                        </motion.div>
                        <div>
                          <p className="font-heading text-3xl tracking-wider mb-2" style={{ color: fg }}>YOU'RE IN</p>
                          <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: fg50 }}>
                            We'll reach out at launch
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase mb-3 sm:mb-4" style={{ color: fg50 }}>
                            First access
                          </p>
                          <h2 className="font-heading leading-none tracking-wider mb-3 text-4xl sm:text-6xl" style={{ color: fg }}>
                            GET EARLY<br />ACCESS
                          </h2>
                          <p className="font-display text-sm sm:text-base italic leading-relaxed mb-5 sm:mb-8" style={{ color: fg60 }}>
                            Join the waitlist. Be first when RABID ships.
                          </p>
                        </motion.div>

                        <motion.form
                          onSubmit={handleSubmit}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="relative mb-3">
                            <div
                              className="relative overflow-hidden"
                              style={{ border: `1px solid ${focused ? fg40 : (status === 'error' || status === 'duplicate') ? 'rgba(239,68,68,0.5)' : fg10}`, transition: 'border-color 0.2s' }}
                            >
                              {focused && <ScanLine isLight={isLight} />}
                              <input
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setStatus('idle') }}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                placeholder="your@email.com"
                                required
                                className="relative z-10 w-full bg-transparent px-4 sm:px-5 py-3 sm:py-4 font-mono text-sm focus:outline-none pr-12"
                                style={{ color: fg }}
                              />
                              <motion.button
                                type="submit"
                                disabled={status === 'loading'}
                                className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center transition-opacity hover:opacity-100"
                                style={{ color: fg30 }}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {status === 'loading' ? (
                                  <motion.div
                                    className="w-4 h-4 rounded-full"
                                    style={{ border: `1px solid ${fg20}`, borderTopColor: fg }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                  />
                                ) : (
                                  <ArrowRight className="w-4 h-4" />
                                )}
                              </motion.button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {(status === 'error' || status === 'duplicate') && (
                              <motion.p
                                className="font-mono text-[10px] tracking-widest uppercase text-red-500/70 mb-2"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                              >
                                {status === 'duplicate' ? 'Already on the list.' : 'Something went wrong. Try again.'}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: fg40 }}>
                            No spam. Ever.
                          </p>
                        </motion.form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom rule */}
                <motion.div
                  className="h-px mx-5 sm:mx-10 mb-4 sm:mb-6"
                  style={{ background: `linear-gradient(to right, transparent, ${fg20}, transparent)` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
