import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Send, Check } from 'lucide-react'

const EMAILJS_SERVICE_ID  = 'service_06d6y58'
const EMAILJS_TEMPLATE_ID = 'template_kfcibfh'
const EMAILJS_PUBLIC_KEY  = 'HgsszHkvHyhtMtI--'
const CONTACT_EMAIL       = 'hello@rabid.co.in'

const SERVICES = [
  'Web Development',
  'UI / UX Design',
  'Custom Keyboard Build',
  'E-commerce & Stores',
  'Other / Not sure',
]

export function ContactPage() {
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
      <div className="max-w-2xl mx-auto px-6 sm:px-8 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-4">Get in touch</p>
          <h1 className="font-heading text-[clamp(3rem,9vw,6rem)] leading-none text-white mb-4">
            Start a<br />Project
          </h1>
          <p className="font-mono text-sm text-white/40 leading-relaxed">
            Tell us what you're building. We'll get back within 24 hours.
          </p>
          <p className="font-mono text-xs text-white/25 mt-2">{CONTACT_EMAIL}</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-mono text-[9px] tracking-widest uppercase text-white/40 mb-2 block">Your Name</Label>
              <Input value={form.name} onChange={set('name')} placeholder="Arjun Sharma" required className="h-12" />
            </div>
            <div>
              <Label className="font-mono text-[9px] tracking-widest uppercase text-white/40 mb-2 block">Email</Label>
              <Input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className="h-12" />
            </div>
          </div>

          <div>
            <Label className="font-mono text-[9px] tracking-widest uppercase text-white/40 mb-2 block">Service</Label>
            <select value={form.service} onChange={set('service') as any} required
              className="w-full h-12 bg-transparent border border-white/15 px-4 font-mono text-sm text-white/70 focus:outline-none focus:border-white/40 transition-colors">
              <option value="" disabled className="bg-[#111]">Select a service…</option>
              {SERVICES.map(s => <option key={s} value={s} className="bg-[#111]">{s}</option>)}
            </select>
          </div>

          <div>
            <Label className="font-mono text-[9px] tracking-widest uppercase text-white/40 mb-2 block">What are you building?</Label>
            <textarea value={form.message} onChange={set('message') as any} required rows={6}
              placeholder="Describe your project, timeline, and budget…"
              className="w-full bg-transparent border border-white/15 px-4 py-3 font-mono text-sm text-white/70 resize-none focus:outline-none focus:border-white/40 transition-colors leading-relaxed" />
          </div>

          {status === 'error' && (
            <p className="font-mono text-xs text-red-400/80 border border-red-500/20 bg-red-900/10 px-4 py-3">
              Something went wrong — email us at {CONTACT_EMAIL}
            </p>
          )}

          {status === 'sent' ? (
            <div className="flex items-center gap-3 font-mono text-sm tracking-widest uppercase text-white/65 border border-white/20 px-5 py-4">
              <Check className="w-4 h-4" /> Message sent — we'll reply within 24 hours.
            </div>
          ) : (
            <Button type="submit" size="lg" className="w-full h-14 text-base gap-3" disabled={status === 'sending'}>
              <Send className="w-4 h-4" />
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </Button>
          )}

          <p className="font-mono text-[10px] text-white/25 leading-relaxed">
            By submitting you agree to our{' '}
            <a href="/privacy" className="underline underline-offset-2 hover:text-white/50 transition-colors">Privacy Policy</a>.
          </p>
        </motion.form>
      </div>
    </PageLayout>
  )
}
