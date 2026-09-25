import { MessageCircle } from 'lucide-react'
import { whatsappLink, defaultWhatsappMessage } from '@/lib/site'

export function WhatsappFloat() {
  return (
    <a
      href={whatsappLink(defaultWhatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar disponibilidad por WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3.5 font-bold text-primary-foreground shadow-[0_10px_30px_-8px] shadow-primary/60 transition-all hover:brightness-110 hover:shadow-primary/80 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden text-sm sm:inline">WhatsApp</span>
    </a>
  )
}
