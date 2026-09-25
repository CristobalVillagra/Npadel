import { Clock } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { site } from '@/lib/site'

const cards = [
  { title: 'Lunes a Viernes', time: '07:00 — 22:30' },
  { title: 'Sábados, Domingos y Festivos', time: '09:00 — 22:30' },
]

export function Schedule() {
  return (
    <section id="horarios" className="scroll-mt-16 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Atención
          </span>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-balance sm:text-5xl">
            Horarios
          </h2>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal
              as="article"
              key={c.title}
              delay={i * 100}
              className="group rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Clock className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-balance">
                {c.title}
              </h3>
              <p className="mt-2 font-display text-3xl font-black text-primary">
                {c.time}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">hrs.</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#reservar"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-bold uppercase tracking-wide text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_12px_32px_-10px] hover:shadow-primary/70"
          >
            Reservar cancha
          </a>
        </div>
      </div>
    </section>
  )
}
