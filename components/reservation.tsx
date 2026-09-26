'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

type Court = { id: string; nombre: string; tipo: 'exterior' | 'techada' }
type Tariff = { dia_tipo: 'semana' | 'fin_semana'; hora_inicio: string; hora_fin: string; monto: number }

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
  return isWeekend
    ? ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00']
    : ['07:00', '08:30', '10:00', '11:30', '13:00', '15:30', '17:00', '18:30', '20:00', '21:30']
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.slice(0, 5).split(':').map(Number)
  return hours * 60 + minutes
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
  const [court, setCourt] = useState<Court | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [courtsError, setCourtsError] = useState<string | null>(null)
  const [loadingCourts, setLoadingCourts] = useState(true)
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
  const [attemptedNext, setAttemptedNext] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const nameInput = useRef<HTMLInputElement>(null)
  const phoneInput = useRef<HTMLInputElement>(null)
  const partnerNameInput = useRef<HTMLInputElement>(null)
  const partnerPhoneInput = useRef<HTMLInputElement>(null)

  const days = useMemo(() => buildDays(anchorDate, 14), [anchorDate])

  useEffect(() => {
    let active = true
    const loadBookingData = async () => {
      const supabase = getSupabaseClient()
      const [courtsResult, tariffsResult] = await Promise.all([
        supabase.from('canchas').select('id, nombre, tipo').eq('activa', true).order('nombre'),
        supabase.from('tarifas').select('dia_tipo, hora_inicio, hora_fin, monto'),
      ])
      if (!active) return
      if (courtsResult.error) {
        setCourtsError('No pudimos cargar las canchas. Intenta nuevamente.')
      } else {
        setCourts(courtsResult.data as Court[])
        if (courtsResult.data.length === 1) setCourt(courtsResult.data[0] as Court)
      }
      if (!tariffsResult.error) setTariffs(tariffsResult.data as Tariff[])
      setLoadingCourts(false)
    }
    loadBookingData()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (initialReservationId) {
      setReservationId(initialReservationId)
      setPaymentState('confirming')
    }
  }, [initialReservationId])
  const slots = useMemo(() => (date ? buildSlots(date) : []), [date])
  const dayType = date && (date.getUTCDay() === 0 || date.getUTCDay() === 6) ? 'fin_semana' : 'semana'
  const tariffFor = (slot: string) => tariffs.find((tariff) =>
    tariff.dia_tipo === dayType && timeToMinutes(slot) >= timeToMinutes(tariff.hora_inicio) && timeToMinutes(slot) < timeToMinutes(tariff.hora_fin),
  )
  const fieldErrors = {
    name: name.trim().length > 1 ? '' : 'Campo obligatorio',
    phone: phone.trim().length >= 8 ? '' : 'Campo obligatorio',
    partnerName: !hasPartner || partnerName.trim().length > 1 ? '' : 'Campo obligatorio',
    partnerPhone: !hasPartner || partnerPhone.trim().length >= 8 ? '' : 'Campo obligatorio',
  }

  useEffect(() => {
    if (!reservationId || paymentState !== 'confirming') return
    let active = true
    const checkStatus = async () => {
      const { data } = await (getSupabaseClient() as any)
        .from('estado_reserva')
        .select('estado')
        .eq('id', reservationId)
        .maybeSingle()
      if (!active || !data) return
      if (data.estado === 'confirmada') setPaymentState('confirmed')
      if (data.estado === 'cancelada') setPaymentState('cancelled')
    }
    checkStatus()
    const interval = window.setInterval(checkStatus, 2500)
    return () => { active = false; window.clearInterval(interval) }
  }, [reservationId, paymentState])

  const canNext =
    (step === 0 && !!date) ||
    (step === 1 && !!time) ||
    (step === 2 && !!court) ||
    (step === 3 && !Object.values(fieldErrors).some(Boolean))

  async function submitReservation() {
    if (!date || !time || !court || !name.trim() || !phone.trim()) return
    setProcessing(true)
    const supabase = getSupabaseClient() as any
    const [hours, minutes] = time.split(':').map(Number)
    const start = new Date(date)
    start.setUTCHours(hours, minutes, 0, 0)
    const end = new Date(start.getTime() + 90 * 60 * 1000)
    const tariff = tariffFor(time)
    const newReservationId = crypto.randomUUID()
    const { error } = await supabase.from('reservas').insert({
      id: newReservationId,
      cancha_id: court.id,
      rango_horario: `[${start.toISOString()},${end.toISOString()})`,
      duracion_minutos: 90,
      cliente_nombre: name.trim(),
      cliente_telefono: phone.trim(),
      cliente_email: email.trim() || null,
      cantidad_jugadores: players ? Number(players) : null,
      partner_nombre: hasPartner ? partnerName.trim() : null,
      partner_telefono: hasPartner ? partnerPhone.trim() : null,
      estado: 'pendiente',
      monto: tariff?.monto ?? 0,
    })
    if (error) {
      setProcessing(false)
      setStep(1)
      setTime(null)
      return
    }
    const checkout = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: newReservationId, amount: tariff?.monto ?? 0 }),
    })
    const checkoutData = await checkout.json().catch(() => ({}))
    setProcessing(false)
    if (!checkout.ok || !checkoutData.initPoint) {
      setPaymentState('error')
      setReservationId(newReservationId)
      return
    }
    setReservationId(newReservationId)
    setPaymentState('confirming')
    window.location.assign(checkoutData.initPoint)
  }

  function reset() {
    setStep(0)
    setDate(null)
    setTime(null)
    setCourt(courts.length === 1 ? courts[0] : null)
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
    setAttemptedNext(false)
    setTouched({})
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
                      <span>{court ? `${court.nombre} — ${court.tipo === 'exterior' ? 'Exterior' : 'Techada'}` : '—'}</span>
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
                    <p className="mb-5 text-sm text-muted-foreground">Todos los turnos duran 90 minutos.</p>
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
                        const tariff = tariffFor(s)
                        const highTariff = tariff && timeToMinutes(tariff.hora_inicio) >= 17 * 60
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
                            <span className="block">{s}</span>
                            {tariff && <span className="mt-1 block text-xs font-medium">${tariff.monto.toLocaleString('es-CL')}</span>}
                            {highTariff && <span className="mt-1 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">Tarifa alta</span>}
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
                    {loadingCourts ? (
                      <p className="text-sm text-muted-foreground">Cargando canchas…</p>
                    ) : courtsError ? (
                      <p role="alert" className="text-sm text-destructive">{courtsError}</p>
                    ) : courts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay canchas disponibles por el momento.</p>
                    ) : <div className="grid gap-3 sm:grid-cols-2">
                      {courts.map((c) => {
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
                                <span className="block font-bold">{c.nombre} — {c.tipo === 'exterior' ? 'Exterior' : 'Techada'}</span>
                              </span>
                            </span>
                            {selected && <Check className="h-5 w-5 text-primary" />}
                          </button>
                        )
                      })}
                    </div>}
                  </div>
                )}

                {/* Paso 4: Datos */}
                {step === 3 && (
                  <div>
                    <h3 className="mb-4 font-display text-xl font-bold">Tus datos</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Nombre" required error={(attemptedNext || touched.name) ? fieldErrors.name : ''}>
                        <input
                          ref={nameInput}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                          aria-invalid={Boolean((attemptedNext || touched.name) && fieldErrors.name)}
                          placeholder="Tu nombre"
                          className={cn('w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary', (attemptedNext || touched.name) && fieldErrors.name ? 'border-destructive' : 'border-border')}
                        />
                      </Field>
                      <Field label="Teléfono / WhatsApp" required error={(attemptedNext || touched.phone) ? fieldErrors.phone : ''}>
                        <input
                          ref={phoneInput}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                          aria-invalid={Boolean((attemptedNext || touched.phone) && fieldErrors.phone)}
                          inputMode="tel"
                          placeholder="+56 9 ..."
                          className={cn('w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary', (attemptedNext || touched.phone) && fieldErrors.phone ? 'border-destructive' : 'border-border')}
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
                            <Field label="Nombre del partner" required error={(attemptedNext || touched.partnerName) ? fieldErrors.partnerName : ''}>
                              <input ref={partnerNameInput} value={partnerName} onChange={(e) => setPartnerName(e.target.value)} onBlur={() => setTouched((current) => ({ ...current, partnerName: true }))} aria-invalid={Boolean((attemptedNext || touched.partnerName) && fieldErrors.partnerName)} placeholder="Nombre del partner" className={cn('w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary', (attemptedNext || touched.partnerName) && fieldErrors.partnerName ? 'border-destructive' : 'border-border')} />
                            </Field>
                            <Field label="Teléfono del partner" required error={(attemptedNext || touched.partnerPhone) ? fieldErrors.partnerPhone : ''}>
                              <input ref={partnerPhoneInput} value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} onBlur={() => setTouched((current) => ({ ...current, partnerPhone: true }))} aria-invalid={Boolean((attemptedNext || touched.partnerPhone) && fieldErrors.partnerPhone)} inputMode="tel" placeholder="+56 9 ..." className={cn('w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary', (attemptedNext || touched.partnerPhone) && fieldErrors.partnerPhone ? 'border-destructive' : 'border-border')} />
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
                  disabled={processing}
                  onClick={() => {
                    setAttemptedNext(true)
                    if (fieldErrors.name) return nameInput.current?.focus()
                    if (fieldErrors.phone) return phoneInput.current?.focus()
                    if (fieldErrors.partnerName) return partnerNameInput.current?.focus()
                    if (fieldErrors.partnerPhone) return partnerPhoneInput.current?.focus()
                    submitReservation()
                  }}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all',
                        processing ? 'cursor-not-allowed opacity-40' : 'hover:brightness-110',
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
  error,
}: {
  label: string
  required?: boolean
  help?: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </span>
      {children}
      {error && <span role="alert" className="mt-1.5 block text-xs text-destructive">{error}</span>}
      {help && <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">{help}</span>}
    </label>
  )
}
