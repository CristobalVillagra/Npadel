import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const paymentId = payload?.data?.id
  if (!paymentId || !process.env.MP_ACCESS_TOKEN) return NextResponse.json({ received: true })

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })
  if (!paymentResponse.ok) return NextResponse.json({ received: true })
  const payment = await paymentResponse.json()
  const reservationId = payment.external_reference
  if (!reservationId) return NextResponse.json({ received: true })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await supabase.from('reservas').update({
    estado: payment.status === 'approved' ? 'confirmada' : payment.status === 'rejected' || payment.status === 'cancelled' ? 'cancelada' : 'pendiente',
    pago_id: String(payment.id),
  }).eq('id', reservationId)

  return NextResponse.json({ received: true })
}
