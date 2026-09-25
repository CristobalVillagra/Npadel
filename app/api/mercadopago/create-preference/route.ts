import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { reservationId, amount } = await request.json()
  if (!reservationId || typeof reservationId !== 'string' || ![40000, 55000].includes(amount)) {
    return NextResponse.json({ error: 'reservationId is required' }, { status: 400 })
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ error: 'Mercado Pago is not configured' }, { status: 503 })
  }

  const origin = new URL(request.url).origin
  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      external_reference: reservationId,
      items: [{ id: reservationId, title: 'Reserva de cancha N Padel', quantity: 1, currency_id: 'CLP', unit_price: amount }],
      back_urls: {
        success: `${origin}/reservar?reserva=${reservationId}`,
        pending: `${origin}/reservar?reserva=${reservationId}`,
        failure: `${origin}/reservar?reserva=${reservationId}`,
      },
      auto_return: 'approved',
      notification_url: `${origin}/api/mercadopago/webhook`,
    }),
  })
  const data = await response.json()
  if (!response.ok) return NextResponse.json({ error: 'Unable to create payment' }, { status: 502 })
  return NextResponse.json({ initPoint: data.init_point })
}
