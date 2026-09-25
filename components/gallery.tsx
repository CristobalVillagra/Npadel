'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { getSupabaseClient } from '@/lib/supabase/client'

const googleMapsUrl = 'https://maps.app.goo.gl/GsS2xsbNSVczPfce7'
type Review = { texto: string; autor: string; calificacion: number; fecha: string | null }
const fetchReviews = async () => {
  const { data, error } = await getSupabaseClient().from('resenas_google').select('texto, autor, calificacion, fecha').eq('visible', true).order('orden', { ascending: true })
  if (error) throw error
  return data as Review[]
}

export function Gallery() {
  const [index, setIndex] = useState(0)
  const { data: reviews = [], error } = useSWR('google-reviews', fetchReviews, { revalidateOnFocus: false })
  const review = reviews[index]
  const move = (delta: number) => setIndex((current) => (current + delta + reviews.length) % reviews.length)

  return (
    <section id="reseñas" className="scroll-mt-16 bg-secondary py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">El club en imágenes</span>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-balance sm:text-5xl">Lo que dicen de N Padel</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Consulta las reseñas reales del club directamente en Google Maps.</p>
        </Reveal>
        <Reveal className="relative mx-auto mt-12 max-w-3xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-14" delay={100}>
          {review ? (
            <>
              <div className="flex justify-center gap-1 text-primary" aria-label={`${review.calificacion} estrellas`}>
                {Array.from({ length: review.calificacion }).map((_, star) => <Star key={star} className="h-5 w-5 fill-current" />)}
              </div>
              <blockquote className="mx-auto mt-7 max-w-2xl font-display text-2xl font-bold leading-tight text-balance sm:text-3xl">&quot;{review.texto}&quot;</blockquote>
              <p className="mt-5 text-sm font-semibold text-muted-foreground">{review.autor}{review.fecha ? ` · ${review.fecha}` : ''}</p>
            </>
          ) : (
            <div className="py-8">
              <p className="font-display text-2xl font-bold">{error ? 'Las reseñas estarán disponibles pronto.' : 'Cargando reseñas reales de Google…'}</p>
              <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">Consulta mientras tanto las opiniones directamente en Google Maps.</p>
            </div>
          )}
          {reviews.length > 0 && <div className="mt-8 flex items-center justify-center gap-3">
            <button type="button" onClick={() => move(-1)} className="rounded-full border border-border p-3 transition-colors hover:border-primary hover:text-primary" aria-label="Reseña anterior"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex gap-2">{reviews.map((_, i) => <button key={i} type="button" onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'}`} aria-label={`Ver reseña ${i + 1}`} />)}</div>
            <button type="button" onClick={() => move(1)} className="rounded-full border border-border p-3 transition-colors hover:border-primary hover:text-primary" aria-label="Siguiente reseña"><ChevronRight className="h-5 w-5" /></button>
          </div>}
          <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mx-auto mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110">Ver reseñas en Google Maps <ExternalLink className="h-4 w-4" /></a>
        </Reveal>
      </div>
    </section>
  )
}
