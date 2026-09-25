import { Reservation } from '@/components/reservation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsappFloat } from '@/components/whatsapp-float'

export const metadata = {
  title: 'Reserva tu cancha | N Padel',
  description: 'Agenda tu próxima partida de pádel en N Padel Macul.',
}

export default async function ReservarPage({ searchParams }: { searchParams: Promise<{ reserva?: string }> }) {
  const { reserva } = await searchParams
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="border-b border-border bg-card px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">N Padel · Macul</p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-black tracking-tight text-balance sm:text-5xl">
              Organicemos tu próxima partida.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Te acompañamos paso a paso. Elige cuándo quieres jugar, cuéntanos un poco sobre tu partido y nosotros nos encargamos de confirmar todo contigo.
            </p>
          </div>
        </section>
        <Reservation anchorDate={new Date().toISOString().slice(0, 10)} initialReservationId={reserva} />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  )
}
