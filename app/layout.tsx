import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Archivo } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
})

const siteUrl = 'https://npadel.cl'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'N Padel | Club de Pádel en Macul',
  description:
    'Reserva tu cancha de pádel en N Padel, Macul. Consulta horarios y agenda tu partido.',
  keywords: [
    'N Padel',
    'N Padel Macul',
    'pádel Macul',
    'canchas de pádel Macul',
    'pádel Santiago',
    'cancha de pádel Santiago',
  ],
  generator: 'v0.app',
  applicationName: 'N Padel',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/images/n-padel-logo.jpg' }],
    apple: [{ url: '/images/n-padel-logo.jpg' }],
    shortcut: ['/images/n-padel-logo.jpg'],
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: siteUrl,
    siteName: 'N Padel',
    title: 'N Padel | Club de Pádel en Macul',
    description:
      'Reserva tu cancha de pádel en N Padel, Macul. Consulta horarios y agenda tu partido.',
    images: [
      {
        url: '/images/n-padel-court.jpg',
        width: 1080,
        height: 620,
        alt: 'Cancha de pádel de N Padel en Macul',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'N Padel | Club de Pádel en Macul',
    description:
      'Reserva tu cancha de pádel en N Padel, Macul. Consulta horarios y agenda tu partido.',
    images: ['/images/n-padel-court.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#131413',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${archivo.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
