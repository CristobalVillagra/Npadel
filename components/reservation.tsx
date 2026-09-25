'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'

/**
 * Estructura preparada para recibir posteriormente la cantidad real
 * de canchas y sus nombres (o conectarse a un backend / Google Calendar).
 * No se inventan nombres como "Cancha 1", "Cancha 2".
 */
type Court = { id: string; label: string; type: 'exterior' | 'techada' }
const COURTS: Court[] = [
  { id: 'exterior', label: 'Cancha exterior', type: 'exterior' },
  { id: 'techada-1', label: 'Cancha techada 1', type: 'techada' },
  { id: 'techada-2', label: 'Cancha techada 2', type: 'techada' },
  { id: 'techada-3', label: 'Cancha techada 3', type: 'techada' },
]

const STEPS = ['Fecha', 'Horario', 'Cancha', 'Tus datos', 'Confirmación'] as const

function buildDays(anchorDate: string, count = 14) {
  const days: Date[] = []
  const base = new Date(`${anchorDate}T12:00:00.000Z`)
  for (let i = 0; i < count; i++) {
    const d = new Date(base)
    d.setUTCDate(base.getUTCDate() + i)
    days.push(d)
  }
  return days
}

// Bloques de 90 min según horario del club (real).
function buildSlots(date: Date) {
  const day = date.getUTCDay() // 0 dom, 6 sáb
  const isWeekend = day === 0 || day === 6
  const startHour = isWeekend ? 9 : 7
  const startMin = isWeekend ? 0 : 0
  const closeMinutes = 22 * 60 + 30 // 22:30
  const slots: string[] = []
  let t = startHour * 60 + startMin
  while (t + 90 <= closeMinutes) {
    const h = Math.floor(t / 60)
    const m = t % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    t += 90
  }
  return slots
}

const dateFormatOptions = { timeZone: 'UTC' } as const
const dayFmt = new Intl.DateTimeFormat('es-CL', { ...dateFormatOptions, weekday: 'short' })
const dateFmt = new Intl.DateTimeFormat('es-CL', {
  ...dateFormatOptions,
  day: '2-digit',
  month: 'short',
})
const fullDateFmt = new Intl.DateTimeFormat('es-CL', {
  ...dateFormatOptions,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function Reservation({ anchorDate, initialReservationId }: { anchorDate: string; initialReservationId?: string }) {
  const [step, setStep] = useState(0)
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [duration, setDuration] = useState<60 | 90>(60)
  const [court, setCourt] = useState<Court | null>(
    COURTS.length === 1 ? COURTS[0] : null,
  )
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [players, setPlayers] = useState('')
  const [hasPartner, setHasPartner] = useState(false)
  const [partnerName, setPartnerName] = useState('')
  const [partnerPhone, setPartnerPhone] = useState('')
  const [reservationId, setReservationId] = useState<string | null>(null)
  const [paymentState, setPaymentState] = useState<'idle' | 'confirming' | 'confirmed' | 'cancelled' | 'error'>('idle')
  const [processing, setProcessing] = useState(false)

  const days = useMemo(() => buildDays(anchorDate, 14), [anchorDate])

  useEffect(() => {
    if (initialReservationId) {
      setReservationId(initialReservationId)
      setPaymentState('confirming')
    }
  }, [initialReservationId])
  const slots = useMemo(() => (date ? buildSlots(date) : []), [date])

  useEffect(() => {
    if (!reservationId || paymentState !== 'confirming') return
    let active = true
    const checkStatus = async () => {
      const response = await fetch(`/api/reservas/${reservationId}/status`, { cache: 'no-store' })
      if (!response.ok || !active) return
      const result = await response.json()
      if (result.estado === 'confirmada') setPaymentState('confirmed')
      if (result.estado === 'cancelada') setPaymentState('cancelled')
    }
    checkStatus()
    const interval = window.setInterval(checkStatus, 2500)
    return () => { active = false; window.clearInterval(interval) }
  }, [reservationId, paymentState])

  const canNext =
    (step === 0 && !!date) ||
    (step === 1 && !!time) ||
    (step === 2 && !!court) ||
    (step === 3 && name.trim().length > 1 && phone.trim().length >= 8 &&
      (!hasPartner || (partnerName.trim().length > 1 && partnerPhone.trim().length >= 8)))

  async function submitReservation() {
    if (!date || !time || !court || !name.trim() || !phone.trim()) return
    setProcessing(true)
    const supabase = getSupabaseClient()
    const { data: courtRow } = await supabase.from('canchas').select('id').eq('nombre', court.label).maybeSingle()
    if (!courtRow) {
      setProcessing(false)
      setStep(2)
      return
    }
    const [hours, minutes] = time.split(':').map(Number)
    const start = new Date(date)
    start.setUTCHours(hours, minutes, 0, 0)
    const end = new Date(start.getTime() + duration * 60 * 1000)
    const { data: reservation, error } = await supabase.from('reservas').insert({
      cancha_id: courtRow.id,
      fecha: anchorDate,
      rango_horario: `[${start.toISOString()},${end.toISOString()})`,
      cliente_nombre: name.trim(),
      cliente_telefono: phone.trim(),
      cliente_email: email.trim() || null,
      cantidad_jugadores: players ? Number(players) : null,
      partner_nombre: hasPartner ? partnerName.trim() : null,
      partner_telefono: hasPartner ? partnerPhone.trim() : null,
      estado: 'pendiente',
      monto: duration === 60 ? 40000 : 55000,
    }).select('id').single()
    if (error || !reservation) {
      setProcessing(false)
      setStep(1)
      setTime(null)
      return
    }
    const checkout = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: reservation.id, amount: duration === 60 ? 40000 : 55000 }),
    })
    const checkoutData = await checkout.json().catch(() => ({}))
    setProcessing(false)
    if (!checkout.ok || !checkoutData.initPoint) {
      setPaymentState('error')
      setReservationId(reservation.id)
      return
    }
    setReservationId(reservation.id)
    setPaymentState('confirming')
    window.location.assign(checkoutData.initPoint)
  }

  function reset() {
    setStep(0)
    setDate(null)
    setTime(null)
    setCourt(COURTS.length === 1 ? COURTS[0] : null)
    setName('')
    setPhone('')
    setEmail('')
    setPlayers('')
    setHasPartner(false)
    setPartnerName('')
    setPartnerPhone('')
    setReservationId(null)
    setPaymentState('idle')
    setProcessing(false)
  }

  return (
    <section id="reservar" className="relative scroll-mt-16 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Reservas
          </span>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-balance sm:text-5xl">
            Reserva tu cancha
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-pretty">
            Cuéntanos cuándo te gustaría jugar y quiénes te acompañan. Revisaremos la disponibilidad y te confirmaremos todo por WhatsApp.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Stepper */}
          <div className="border-b border-border bg-secondary/40 px-4 py-4 sm:px-6">
            <ol className="flex items-center justify-between gap-1">
              {STEPS.map((label, i) => {
                const active = i === step
                const complete = i < step || paymentState === 'confirmed'
                return (
                  <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : complete
                              ? 'border-primary/50 bg-primary/15 text-primary'
                              : 'border-border bg-background text-muted-foreground',
                        )}
                      >
                        {complete ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <span
                        className={cn(
                          'hidden text-sm font-semibold sm:block',
                          active ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <span className="hidden h-px flex-1 bg-border sm:block" />
                    )}
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="p-5 sm:p-8">
            {/* Confirmación final */}
            {paymentState !== 'idle' ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                  {paymentState === 'confirmed' ? <Check className="h-8 w-8" /> : <Clock className="h-8 w-8 animate-pulse" />}
                </div>
                <h3 className="mt-5 font-display text-2xl font-black sm:text-3xl">
                  {paymentState === 'confirming' && 'Confirmando tu pago…'}
                  {paymentState === 'confirmed' && '¡Pago confirmado!'}
                  {paymentState === 'cancelled' && 'El pago no se completó'}
                  {paymentState === 'error' && 'Checkout no disponible'}
                </h3>
                <p className="mt-2 max-w-md text-muted-foreground">
                  {paymentState === 'confirming' && 'Estamos verificando el estado real de tu reserva. No cierres esta ventana.'}
                  {paymentState === 'confirmed' && 'Tu reserva quedó registrada y confirmada en N Padel.'}
                  {paymentState === 'cancelled' && 'Mercado Pago canceló o rechazó el pago. Puedes intentarlo nuevamente.'}
                  {paymentState === 'error' && 'El pago online aún no está configurado. Inténtalo nuevamente más tarde.'}
                </p>

                <div className="mt-6 w-full max-w-sm rounded-xl border border-border bg-background p-4 text-left text-sm">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>{date ? fullDateFmt.format(date) : '—'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{time} hrs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{court?.label}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {name}
                        {players ? ` · ${players} jugadores` : ''}
                      </span>
                    </li>
                  </ul>
                </div>

                {paymentState === 'cancelled' && (
                  <button type="button" onClick={reset} className="mt-6 inline-flex w-full max-w-sm items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground hover:brightness-110">
                    Reintentar pago
                  </button>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="mt-3 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Hacer otra reserva
                </button>
              </div>
            ) : (
              <>
                {/* Paso 1: Fecha */}
                {step === 0 && (
                  <div>
                    <h3 className="mb-4 font-display text-xl font-bold">
                      Selecciona una fecha
                    </h3>
                    <div className="mb-5 grid gap-3 sm:grid-cols-2">
                      {[{ value: 60 as const, label: '1 hora', price: '$40.000 CLP' }, { value: 90 as const, label: '1 hora 30 min', price: '$55.000 CLP' }].map((option) => (
                        <button key={option.value} type="button" onClick={() => setDuration(option.value)} className={cn('rounded-xl border px-4 py-3 text-left transition-all', duration === option.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}>
                          <span className="block font-bold">{option.label}</span><span className="text-sm text-muted-foreground">{option.price}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                      {days.map((d) => {
                        const selected =
                          date && d.toDateString() === date.toDateString()
                        return (
                          <button
                            key={d.toISOString()}
                            type="button"
                            onClick={() => {
                              setDate(d)
                              setTime(null)
                            }}
                            className={cn(
                              'flex flex-col items-center rounded-xl border px-2 py-3 transition-all',
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:border-primary/50',
                            )}
                          >
                            <span className="text-xs font-medium uppercase opacity-80">
                              {dayFmt.format(d).replace('.', '')}
                            </span>
                            <span className="mt-1 text-sm font-bold capitalize">
                              {dateFmt.format(d).replace('.', '')}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Paso 2: Horario */}
                {step === 1 && (
                  <div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-bold">
                        Selecciona un horario
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {date ? fullDateFmt.format(date) : ''}
                      </span>
                    </div>

                    {/* Leyenda de estados (preparada para backend) */}
                    <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-sm border border-border bg-background" />
                        Disponible
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-sm bg-primary" />
                        Seleccionada
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-sm bg-muted opacity-50" />
                        Ocupada
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                      {slots.map((s) => {
                        const selected = time === s
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setTime(s)}
                            className={cn(
                              'rounded-lg border py-2.5 text-sm font-bold transition-all',
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:border-primary/50',
                            )}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Disponibilidad sujeta a confirmación del club.
                    </p>
                  </div>
                )}

                {/* Paso 3: Cancha */}
                {step === 2 && (
                  <div>
                    <h3 className="mb-4 font-display text-xl font-bold">
                      Selecciona la cancha
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {COURTS.map((c) => {
                        const selected = court?.id === c.id
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCourt(c)}
                            className={cn(
                              'flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all',
                              selected
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-background hover:border-primary/50',
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'flex h-9 w-9 items-center justify-center rounded-lg',
                                  selected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground',
                                )}
                              >
                                <MapPin className="h-5 w-5" />
                              </span>
                              <span>
                                <span className="block font-bold">{c.label}</span>
                                <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.type}</span>
                              </span>
                            </span>
                            {selected && <Check className="h-5 w-5 text-primary" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Paso 4: Datos */}
                {step === 3 && (
                  <div>
                    <h3 className="mb-4 font-display text-xl font-bold">Tus datos</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Nombre" required>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                        />
                      </Field>
                      <Field label="Teléfono / WhatsApp" required>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          inputMode="tel"
                          placeholder="+56 9 ..."
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                        />
                      </Field>
                      <Field label="Correo electrónico (opcional)">
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          inputMode="email"
                          placeholder="tucorreo@ejemplo.com"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                        />
                      </Field>
                      <Field label="Cantidad de jugadores (opcional)" help="Solo para referencia, no necesitas identificar a cada jugador.">
                        <select
                          value={players}
                          onChange={(e) => setPlayers(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                        >
                          <option value="">Selecciona</option>
                          <option value="2">2 jugadores</option>
                          <option value="4">4 jugadores</option>
                        </select>
                      </Field>
                      <div className="sm:col-span-2 rounded-xl border border-border bg-secondary/30 p-4">
                        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
                          <input type="checkbox" checked={hasPartner} onChange={(e) => setHasPartner(e.target.checked)} className="h-4 w-4 accent-primary" />
                          Voy a jugar con un partner
                        </label>
                        {hasPartner && (
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <Field label="Nombre del partner" required>
                              <input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Nombre del partner" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                            </Field>
                            <Field label="Teléfono del partner" required>
                              <input value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} inputMode="tel" placeholder="+56 9 ..." className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                            </Field>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navegación */}
                <div className="mt-8 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors',
                      step === 0
                        ? 'cursor-not-allowed opacity-40'
                        : 'hover:border-primary/50 hover:text-primary',
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Atrás
                  </button>

                  {step < 3 ? (
                    <button
                      type="button"
                      disabled={!canNext}
                      onClick={() => setStep((s) => s + 1)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all',
                        canNext ? 'hover:brightness-110' : 'cursor-not-allowed opacity-40',
                      )}
                    >
                      Continuar
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                  disabled={!canNext || processing}
                  onClick={submitReservation}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all',
                        canNext ? 'hover:brightness-110' : 'cursor-not-allowed opacity-40',
                      )}
                    >
                      Confirmar reserva
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string
  required?: boolean
  help?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </span>
      {children}
      {help && <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">{help}</span>}
    </label>
  )
}
