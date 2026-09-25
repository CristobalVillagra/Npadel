// Datos reales del club. No agregar información no proporcionada.
export const site = {
  name: 'N Padel',
  category: 'Club de Pádel Macul',
  address: 'Ramón Toro Ibáñez 5931, Macul, Santiago, Chile',
  addressShort: 'Ramón Toro Ibáñez 5931, Macul, Santiago',
  instagram: '@npadelchile',
  instagramUrl: 'https://instagram.com/npadelchile',
  whatsappNumber: '+56 9 3516 4791',
  whatsappUrl: 'https://wa.me/56935164791',
  mapsQuery: 'Ramón Toro Ibáñez 5931, Macul, Santiago, Chile',
  hours: {
    weekdays: { label: 'Lunes a Viernes', time: '07:00 — 22:30' },
    weekends: {
      label: 'Sábados, Domingos y Festivos',
      time: '09:00 — 22:30',
    },
  },
} as const

export function whatsappLink(message: string) {
  return `${site.whatsappUrl}?text=${encodeURIComponent(message)}`
}

export const defaultWhatsappMessage =
  'Hola N Padel, quiero consultar por disponibilidad de una cancha.'
