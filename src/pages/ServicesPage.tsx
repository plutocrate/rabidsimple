import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Code, Zap, Cpu, Box, Send, Check } from 'lucide-react'

const EMAILJS_SERVICE_ID  = 'service_06d6y58'
const EMAILJS_TEMPLATE_ID = 'template_kfcibfh'
const EMAILJS_PUBLIC_KEY  = 'HgsszHkvHyhtMtI--'

const SERVICES = [
  {
    icon: Code, title: 'Web Development', price: 'From ₹25,000',
    desc: 'Production-grade React, Next.js, and Three.js applications — fast, accessible, unforgettable.',
    bullets: ['React / Next.js / Vite', 'Three.js & WebGL 3D', 'Full-stack', 'Performance-first'],
  },
  {
    icon: Zap, title: 'UI / UX Design', price: 'From ₹15,000',
    desc: 'Distinctive interfaces with real character. No templates, no generic aesthetics.',
    bullets: ['Figma design systems', 'Motion & micro-interactions', 'Mobile-first responsive', 'Brand identity'],
  },
  {
    icon: Cpu, title: 'Custom Keyboard Build', price: 'From ₹12,000',
    desc: 'Your layout, switches, colors. Fully handwired, QMK/ZMK flashed, tested, and shipped.',
    bullets: ['Any layout / form factor', 'Switch selection & lube', 'Hotswap or soldered', 'Custom firmware'],
  },
  {
    icon: Box, title: 'E-commerce & Stores', price: 'From ₹40,000',
    desc: 'Full-stack online stores with 3D product viewers, custom checkout, and admin dashboards.',
    bullets: ['Product configurators', 'Real-time pricing', 'Admin dashboard', 'Payment integration'],
  },
]

const CONTACT_EMAIL = 'hello@rabid.co.in'

export function ServicesPage() {
  const [form, setForm]     = useState({ name: '', email: '', service: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:    form.name,
          from_email:   form.email,
          service_type: form.service,
          message:      form.message,
          reply_to:     form.email,
        },
        EMAILJS_PUBLIC_KEY
      )
      setStatus('sent')
      setForm({ name: '', email: '', service: '', message: '' })
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-14 sm:mb-20">
          <p className="font-mono text-sm tracking-widest uppercase text-white/40 mb-4">What we do</p>
          <h1 className="font-heading text-[clamp(3.5rem,9vw,7rem)] leading-none text-white mb-5">
            Creative<br />Services
          </h1>
          <p className="font-display text-xl sm:text-2xl italic text-white/50 max-w-xl leading-relaxed">
            Beyond keyboards, RABID builds high-value digital experiences for founders, studios, and brands.
          </p>
        </motion.div>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/8 mb-20 sm:mb-28">
          {SERVICES.map((svc, i) => (
            <motion.div key={svc.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="bg-background p-7 sm:p-10 group hover:bg-white/[0.03] transition-colors flex flex-col">
              {/* Title row — heading left, icon right */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-sans font-semibold text-2xl sm:text-3xl text-white leading-tight">{svc.title}</h3>
                <svc.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white/25 group-hover:text-white/60 transition-colors flex-shrink-0 mt-0.5" />
              </div>
              <p className="font-sans text-sm sm:text-base text-white/65 leading-relaxed mb-5">{svc.desc}</p>
              <ul className="space-y-2 mb-6">
                {svc.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2.5 font-mono text-xs sm:text-sm text-white/35">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
              <span className="mt-auto font-mono text-xs sm:text-sm tracking-widest text-white/40 border border-white/15 px-3 py-1.5 self-start">{svc.price}</span>
            </motion.div>
          ))}
        </div>

        <Separator className="mb-20 sm:mb-28 opacity-15" />

        {/* Contact form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="font-mono text-sm tracking-widest uppercase text-white/40 mb-4">Get in touch</p>
            <h2 className="font-heading text-5xl sm:text-6xl text-white mb-5">Start a project</h2>
            <p className="font-mono text-base text-white/40 leading-relaxed max-w-sm mb-8">
              Tell us what you're building. We'll get back within 24 hours with a rough scope and quote.
            </p>
            <div className="space-y-2">
              <p className="font-mono text-sm text-white/30 tracking-widest">Based in India · Working globally</p>
              <p className="font-mono text-sm text-white/30 tracking-widest">{CONTACT_EMAIL}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2 block">Your Name</Label>
                <Input value={form.name} onChange={set('name')} placeholder="Arjun Sharma" required className="h-12 text-base" />
              </div>
              <div>
                <Label className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2 block">Email</Label>
                <Input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className="h-12 text-base" />
              </div>
            </div>

            <div>
              <Label className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2 block">Service</Label>
              <select value={form.service} onChange={set('service') as any} required
                className="w-full h-12 bg-transparent border border-white/15 px-4 font-mono text-base text-white/70 focus:outline-none focus:border-white/40 transition-colors">
                <option value="" disabled className="bg-[#111]">Select a service…</option>
                {SERVICES.map(s => <option key={s.title} value={s.title} className="bg-[#111]">{s.title}</option>)}
                <option value="Other" className="bg-[#111]">Other / Not sure</option>
              </select>
            </div>

            <div>
              <Label className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2 block">What are you building?</Label>
              <textarea value={form.message} onChange={set('message') as any} required rows={6}
                placeholder="Describe your project, timeline, and budget…"
                className="w-full bg-transparent border border-white/15 px-4 py-3 font-mono text-base text-white/70 resize-none focus:outline-none focus:border-white/40 transition-colors leading-relaxed" />
            </div>

            {status === 'error' && (
              <p className="font-mono text-sm text-red-400/80 border border-red-500/20 bg-red-900/10 px-4 py-3">
                Something went wrong — email us directly at {CONTACT_EMAIL}
              </p>
            )}

            {status === 'sent' ? (
              <div className="flex items-center gap-3 font-mono text-sm tracking-widest uppercase text-white/65 border border-white/20 px-5 py-4">
                <Check className="w-4 h-4" /> Message sent — we'll reply within 24 hours.
              </div>
            ) : (
              <Button type="submit" size="lg" className="w-full h-14 text-base gap-3" disabled={status === 'sending'}>
                <Send className="w-4 h-4" />
                {status === 'sending' ? 'Sending…' : 'Send Enquiry'}
              </Button>
            )}

            <p className="font-mono text-xs text-white/25 leading-relaxed">
              By submitting you agree to our{' '}
              <a href="/privacy" className="underline underline-offset-2 hover:text-white/50 transition-colors">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}
