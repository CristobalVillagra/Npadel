import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const sections = [
  ['Aceptación de términos', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Al utilizar este sitio web y sus servicios, aceptas estos términos y condiciones, así como cualquier actualización que se publique posteriormente.'],
  ['Uso del servicio', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. El sitio debe utilizarse de manera lícita, responsable y respetuosa. No está permitido interferir con su funcionamiento ni utilizarlo para fines no autorizados.'],
  ['Reservas y pagos', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Las reservas quedan sujetas a la disponibilidad informada en el flujo de reserva y a la confirmación del pago mediante el medio habilitado. La información ingresada debe ser exacta y estar actualizada.'],
  ['Cancelaciones', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Las condiciones y eventuales solicitudes de modificación o cancelación se regirán por las políticas vigentes comunicadas al momento de reservar.'],
  ['Datos personales', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. La información proporcionada podrá utilizarse para gestionar reservas, pagos, comunicaciones operativas y mejorar la experiencia del servicio, conforme a la política de privacidad.'],
  ['Contacto', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Para consultas relacionadas con estos términos, puedes comunicarte con N Padel a través de los canales oficiales publicados en este sitio.'],
]

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-24 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">N Padel</p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">Términos y condiciones</h1>
          <p className="mt-5 text-muted-foreground">Última actualización: 2026</p>
          <div className="mt-12 space-y-10">
            {sections.map(([title, text]) => (
              <section key={title}>
                <h2 className="font-display text-2xl font-bold">{title}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
