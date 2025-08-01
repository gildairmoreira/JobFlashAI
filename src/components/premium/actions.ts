'use server';

import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { env } from '@/env';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function createCheckoutSession(planType: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Usuário não autenticado');

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error('Email do usuário não encontrado');

  const client = new MercadoPagoConfig({ accessToken: env.MERCADO_PAGO_ACCESS_TOKEN });
  const preapproval = new PreApproval(client);

  let amount = 29.90; // Valor padrão para Pro
  let reason = 'Assinatura Pro Mensal';
  if (planType === 'pro-plus') {
    amount = 49.90;
    reason = 'Assinatura Pro Plus Mensal';
  }

  const preapprovalData = {
    reason: reason,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: amount,
      currency_id: 'BRL',
    },
    back_urls: {
      success: `${env.NEXT_PUBLIC_BASE_URL}/billing/success`,
      failure: `${env.NEXT_PUBLIC_BASE_URL}/billing/cancel`,
      pending: `${env.NEXT_PUBLIC_BASE_URL}/billing/pending`,
    },
    payer_email: email,
    payment_methods_allowed: {
      payment_types: [{ id: 'pix' }, { id: 'credit_card' }, { id: 'debit_card' }, { id: 'boleto' }],
    },
  };

  const response = await preapproval.create({ body: preapprovalData });
  return response.init_point;
}