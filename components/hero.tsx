import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { site } from '@/lib/site'

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <Image
        src="/images/n-padel-court.jpg"
        alt="Cancha de pádel de N Padel en Macul"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
      <div className="absolute inset-0 bg-background/40" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl animate-[fade-up_0.8s_cubic-bezier(0.22,1,0.36,1)_both]">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Club de Pádel Macul
          </span>

          <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Tu próxima partida{' '}
            <span className="text-primary">empieza aquí.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Canchas de pádel en Macul. Reserva tu horario y ven a jugar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/reservar"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-7 py-3.5 text-base font-bold uppercase tracking-wide text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_12px_32px_-10px] hover:shadow-primary/70"
            >
              Reservar cancha
            </a>
            <a
              href="#ubicacion"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background/40 px-7 py-3.5 text-base font-bold uppercase tracking-wide text-foreground backdrop-blur-sm transition-colors hover:border-primary/60 hover:text-primary"
            >
              Ver ubicación
            </a>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Lun–Vie 07:00–22:30</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Sáb–Dom y festivos 09:00–22:30</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{site.category.replace('Club de Pádel ', '')}</span>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
