import Image from 'next/image'
import { Reveal } from '@/components/reveal'

const tags = ['Comunidad', 'Competencia', 'Diversión', 'Ambiente deportivo']

export function Experience() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal className="relative order-2 overflow-hidden rounded-2xl border border-border lg:order-1">
          <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src="/images/n-padel-tournament.jpg"
              alt="Jugadores en el podio de un torneo de N Padel en Macul"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/10" />
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            El club
          </span>
          <h2 className="mt-3 font-display text-4xl font-black leading-[1.05] tracking-tight text-balance sm:text-5xl">
            Mucho más que{' '}
            <span className="text-primary">una cancha.</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
            Ven a jugar, competir y disfrutar del pádel en Macul.
          </p>

          <ul className="mt-8 flex flex-wrap gap-3">
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm font-semibold text-foreground/90"
              >
                {t}
              </li>
            ))}
          </ul>

          <a
            href="/reservar"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-7 py-3.5 text-base font-bold uppercase tracking-wide text-primary-foreground transition-all hover:brightness-110"
          >
            Reservar cancha
          </a>
        </Reveal>
      </div>
    </section>
  )
}
