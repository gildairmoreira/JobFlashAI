import { env } from '@/env';
import mercadopago from 'mercadopago';
import prisma from '@/lib/prisma'; // Changed to default import
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-signature') as string;
  const requestId = request.headers.get('x-request-id') as string;
  const dataId = JSON.parse(body).data.id; // Assuming data.id is in body

  // Manual verification
  const parts = signature.split(',');
  let ts = '';
  let hash = '';
  parts.forEach(part => {
    const [key, value] = part.split('=');
    if (key.trim() === 'ts') ts = value.trim();
    if (key.trim() === 'v1') hash = value.trim();
  });

  const manifest = `id:${dataId},timestamp:${ts},request-id:${requestId}`;
  const expectedHash = crypto.createHmac('sha256', env.MERCADO_PAGO_WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex');

  if (hash !== expectedHash) {
    console.error('Webhook verification failed');
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const client = new mercadopago.MercadoPagoConfig({ accessToken: env.MERCADO_PAGO_ACCESS_TOKEN });
  const preapproval = new mercadopago.PreApproval(client);

  // Fetch preapproval details if needed
  const eventData = JSON.parse(body);

  if (eventData.type === 'subscription_preapproval') {
    const data = eventData.data;
    const userId = data.external_reference;
    if (!userId) return NextResponse.json({ success: false }, { status: 400 });

    await prisma.userSubscription.upsert({
      where: { userId },
      update: {
        mercadoPagoPreapprovalId: data.id,
        mercadoPagoPlanId: data.preapproval_plan_id,
        currentPeriodEnd: new Date(data.next_payment_date),
        cancelAtPeriodEnd: data.status === 'cancelled',
      },
      create: {
        userId,
        mercadoPagoPreapprovalId: data.id,
        mercadoPagoPlanId: data.preapproval_plan_id,
        currentPeriodEnd: new Date(data.next_payment_date),
        cancelAtPeriodEnd: false,
      },
    });
  }

  return NextResponse.json({ success: true });
}