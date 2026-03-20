import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1 mb-2">
            <p className="font-heading text-3xl tracking-wider mb-2">RABID</p>
            <p className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-2">Est. 2026 · India</p>
            <p className="font-display text-sm italic text-white/55 leading-relaxed">
              Handwired split keyboards. Built obsessively in India.
            </p>
          </div>
          {[
            { title: 'Shop', links: [{ href: '/shop', label: 'Full Builds' }, { href: '/shop', label: 'Barebones' }, { href: '/shop', label: 'Accessories' }] },
            { title: 'Services', links: [{ href: '/services', label: 'Web Development' }, { href: '/services', label: 'UI/UX Design' }, { href: '/services', label: 'Custom Builds' }] },
            { title: 'Legal', links: [{ href: '/privacy', label: 'Privacy Policy' }, { href: '/terms', label: 'Terms' }, { href: '/returns', label: 'Returns' }, { href: '/contact', label: 'Contact' }] },
          ].map(col => (
            <div key={col.title}>
              <p className="font-mono text-[9px] tracking-widest uppercase text-white/35 mb-3 font-semibold">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.href} className="font-sans text-xs text-white/55 hover:text-white transition-colors whitespace-nowrap">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="opacity-15" />
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1 mt-5">
          <p className="font-mono text-[9px] tracking-widest text-white/18 uppercase whitespace-nowrap">Made with obsession · India</p>
          <p className="font-mono text-[9px] tracking-widest text-white/25 uppercase whitespace-nowrap">© {year} RABID — All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}
