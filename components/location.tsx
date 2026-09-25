import { MapPin, MessageCircle } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { site, whatsappLink, defaultWhatsappMessage } from '@/lib/site'

export function Location() {
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
    site.mapsQuery,
  )}&output=embed`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    site.mapsQuery,
  )}`

  return (
    <section id="ubicacion" className="scroll-mt-16 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <Reveal className="flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Ubicación
            </span>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-balance sm:text-5xl">
              Encuéntranos en Macul
            </h2>

            <div className="mt-6 flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-lg leading-relaxed text-foreground/90">
                Ramón Toro Ibáñez 5931
                <br />
                Macul, Santiago, Chile
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground transition-all hover:brightness-110"
              >
                <MapPin className="h-5 w-5" />
                Cómo llegar
              </a>
              <a
                href={whatsappLink(defaultWhatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3.5 text-base font-bold transition-colors hover:border-primary/60 hover:text-primary"
              >
                <MessageCircle className="h-5 w-5" />
                Hablar por WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal
            delay={100}
            className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border lg:min-h-[420px]"
          >
            <iframe
              title="Mapa de N Padel en Macul, Santiago"
              src={mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full"
              style={{ border: 0, filter: 'grayscale(0.2) contrast(1.05)' }}
              allowFullScreen
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
