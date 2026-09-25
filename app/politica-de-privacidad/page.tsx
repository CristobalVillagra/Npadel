import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const sections = [
  ['Datos personales', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. N Padel podrá recopilar los datos que entregues voluntariamente al solicitar información, realizar una reserva o utilizar los canales de contacto disponibles.'],
  ['Finalidad del tratamiento', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Los datos podrán utilizarse para gestionar reservas, procesar pagos, responder consultas, enviar comunicaciones relacionadas con el servicio y cumplir obligaciones legales.'],
  ['Reservas y pagos', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Para completar una reserva pueden intervenir proveedores tecnológicos de pago y gestión. Cada proveedor tratará la información conforme a sus propias políticas y medidas de seguridad.'],
  ['Uso del servicio', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Podemos utilizar información técnica y de navegación para mantener la seguridad, mejorar el sitio y comprender cómo se utilizan sus funcionalidades.'],
  ['Conservación y seguridad', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Conservaremos la información durante el tiempo necesario para cumplir las finalidades descritas y aplicaremos medidas razonables para protegerla frente a accesos no autorizados.'],
  ['Contacto', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Si tienes preguntas sobre esta política o sobre el tratamiento de tus datos personales, puedes contactar a N Padel mediante los canales oficiales indicados en este sitio.'],
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-24 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">N Padel</p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">Política de privacidad</h1>
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
