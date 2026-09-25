'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Inicio', href: '/' },
  { label: 'Canchas', href: '#canchas' },
  { label: 'Reservar', href: '/reservar' },
  { label: 'Ubicación', href: '#ubicacion' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border bg-background/85 backdrop-blur-md'
          : 'border-b border-transparent bg-gradient-to-b from-background/70 to-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2" aria-label="N Padel — inicio">
          <Image
            src="/images/n-padel-logo.jpg"
            alt="Logo de N Padel"
            width={40}
            height={40}
            className="h-10 w-10 rounded-md object-cover"
            priority
          />
          <span className="font-display text-lg font-extrabold tracking-tight">
            N&nbsp;<span className="text-primary">Padel</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="/reservar"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[0_0_0_0_theme(colors.primary)] transition-all hover:brightness-110 hover:shadow-[0_8px_24px_-8px] hover:shadow-primary/60"
          >
            Reservar cancha
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur-md transition-[max-height,opacity] duration-300',
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <ul className="flex flex-col px-4 py-2">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block border-b border-border/60 py-3 text-base font-medium text-foreground/90 last:border-none"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
