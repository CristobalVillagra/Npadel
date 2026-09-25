import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

// Estructura preparada para agregar fácilmente distintos tipos de cancha.
const courts = [
  { title: 'Cancha techada', subtitle: 'Partidas bajo techo', image: '/images/n-padel-indoor-training.png', alt: 'Cancha techada de N Padel con jugadoras en entrenamiento' },
  { title: 'Cancha techada', subtitle: 'Reserva tu horario', image: '/images/n-padel-indoor-match.png', alt: 'Cancha techada de N Padel vista desde el acceso' },
  { title: 'Cancha techada', subtitle: 'Ven a jugar', image: '/images/n-padel-group-match.png', alt: 'Partido de pádel en una cancha techada de N Padel' },
  { title: 'Cancha exterior', subtitle: 'Juega al atardecer', image: '/images/n-padel-sunset.png', alt: 'Cancha exterior de N Padel durante el atardecer' },
]

export function Courts() {
  return (
    <section id="canchas" className="scroll-mt-16 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Instalaciones
          </span>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-balance sm:text-5xl">
            Conoce nuestras canchas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Disfruta de tu partido en N Padel.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courts.map((c, i) => (
            <Reveal
              as="article"
              key={c.image}
              delay={i * 80}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={c.image || '/placeholder.svg'}
                  alt={c.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-bold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
                <a
                  href="/reservar"
                  className="mt-4 inline-flex items-center gap-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 hover:gap-2"
                >
                  Reservar
                  <ChevronRight className="h-4 w-4 transition-all" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
