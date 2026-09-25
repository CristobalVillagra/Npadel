import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Gallery } from '@/components/gallery'
import { Location } from '@/components/location'
import { Footer } from '@/components/footer'
import { WhatsappFloat } from '@/components/whatsapp-float'
import { site } from '@/lib/site'

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: 'N Padel',
    description:
      'Club de Pádel en Macul. Reserva tu cancha de pádel y ven a jugar.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ramón Toro Ibáñez 5931',
      addressLocality: 'Macul',
      addressRegion: 'Santiago',
      addressCountry: 'CL',
    },
    telephone: '+56935164791',
    sameAs: [site.instagramUrl],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '22:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '09:00',
        closes: '22:30',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <Gallery />
        <Location />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  )
}
