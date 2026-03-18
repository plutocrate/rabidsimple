import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14 sm:py-18">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <p className="font-heading text-5xl tracking-wider mb-4">RABID</p>
            <p className="font-display text-base text-white/40 italic leading-relaxed">
              Handwired split keyboards. Built obsessively in India.
            </p>
          </div>
          {[
            { title: 'Shop', links: [{ href: '/shop', label: 'Full Builds' }, { href: '/shop', label: 'Barebones' }, { href: '/shop', label: 'Accessories' }] },
            { title: 'Services', links: [{ href: '/services', label: 'Web Development' }, { href: '/services', label: 'UI/UX Design' }, { href: '/services', label: 'Custom Builds' }] },
            { title: 'Legal', links: [{ href: '/privacy', label: 'Privacy Policy' }, { href: '/terms', label: 'Terms' }, { href: '/returns', label: 'Returns' }] },
          ].map(col => (
            <div key={col.title}>
              <p className="font-mono text-sm tracking-widest uppercase text-white/35 mb-4 font-semibold">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.href} className="font-display text-base text-white/50 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="opacity-15" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <p className="font-mono text-sm tracking-widest text-white/25 uppercase">© {year} RABID — All rights reserved</p>
          <p className="font-mono text-sm tracking-widest text-white/18 uppercase">Made with obsession · India</p>
        </div>
      </div>
    </footer>
  )
}
