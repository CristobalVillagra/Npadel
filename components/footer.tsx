import Image from 'next/image'
import { MapPin, MessageCircle } from 'lucide-react'
import { InstagramIcon } from '@/components/instagram-icon'
import { site } from '@/lib/site'

const nav = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Canchas', href: '#canchas' },
  { label: 'Reservar', href: '/reservar' },
  { label: 'Ubicación', href: '#ubicacion' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src="/images/n-padel-logo.jpg"
              alt="Logo de N Padel"
              width={44}
              height={44}
              className="h-11 w-11 rounded-md object-cover"
            />
            <span className="font-display text-lg font-extrabold tracking-tight">
              N&nbsp;<span className="text-primary">Padel</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{site.category}</p>
          <div className="mt-6 flex flex-col gap-2 text-sm">
            <a href="/terminos-y-condiciones" className="text-muted-foreground transition-colors hover:text-primary">Términos y condiciones</a>
            <a href="/politica-de-privacidad" className="text-muted-foreground transition-colors hover:text-primary">Política de privacidad</a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide">
            Dirección
          </h3>
          <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {site.addressShort}
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide">
            Navegación
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <InstagramIcon className="h-4 w-4" />
                {site.instagram}
              </a>
            </li>
            <li>
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" />
                {site.whatsappNumber}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          © 2026 N Padel — Desarrollado por aintegration.cl
        </div>
      </div>
    </footer>
  )
}
