import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { whatsappLink, defaultWhatsappMessage } from '@/lib/site'

export function CtaFinal() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/n-padel-tournament.jpg"
        alt="Ambiente de comunidad en un torneo de N Padel"
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-background/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/60" />

      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <Reveal>
          <h2 className="font-display text-5xl font-black tracking-tight text-balance sm:text-6xl">
            ¿Jugamos?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground text-pretty">
            Reserva tu cancha y ven a disfrutar del pádel en N Padel.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/reservar"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-bold uppercase tracking-wide text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_12px_32px_-10px] hover:shadow-primary/70 sm:w-auto"
            >
              Reservar cancha
            </a>
            <a
              href={whatsappLink(defaultWhatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/40 px-8 py-3.5 text-base font-bold uppercase tracking-wide backdrop-blur-sm transition-colors hover:border-primary/60 hover:text-primary sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
