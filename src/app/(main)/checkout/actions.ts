'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { getGlobalSettings } from '@/app/(main)/billing/actions';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import prisma from "@/lib/prisma";

export async function createPixPayment(planType: "pro" | "monthly") {
  const { userId } = await auth();
  if (!userId) throw new Error('Usuário não autenticado');

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error('Email não encontrado');
  
  const settings = await getGlobalSettings();
  const amount = planType === 'pro' ? settings.proPrice : settings.monthlyPrice;
  const description = planType === 'pro' ? 'JobFlashAI - Plano Pro' : 'JobFlashAI - Plano Mensal';

  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const payment = new Payment(client);

  const body = {
    transaction_amount: amount,
    description: description,
    payment_method_id: 'pix',
    payer: {
      email: email,
    },
    external_reference: `${userId}_${planType}`, // Crucial para validar no webhook
  };

  try {
    const result = await payment.create({
      body,
      requestOptions: {
        idempotencyKey: crypto.randomUUID()
      }
    });

    // Registra a criação do PIX no funil para o Dashboard Admin
    if (result.id) {
        await (prisma as any).analyticEvent.create({
            data: {
                userId: userId,
                event: "pix_gerado",
                metadata: { amount, plan: planType, id: result.id.toString() }
            }
        });
    }

    return {
      success: true,
      qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      qrCode: result.point_of_interaction?.transaction_data?.qr_code,
      paymentId: result.id
    };
  } catch (err) {
    console.error("Erro MP API Pix:", err);
    throw new Error('Falha ao gerar PIX');
  }
}

export async function createCardPayment(formData: any, planType: "pro" | "monthly") {
  const { userId } = await auth();
  if (!userId) throw new Error('Usuário não autenticado');

  const user = await currentUser();
  const currentEmail = user?.emailAddresses[0]?.emailAddress;
  const finalEmail = currentEmail || formData.payer?.email;

  const settings = await getGlobalSettings();
  const amount = planType === 'pro' ? settings.proPrice : settings.monthlyPrice;
  const description = planType === 'pro' ? 'JobFlashAI - Plano Pro' : 'JobFlashAI - Plano Mensal';

  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const payment = new Payment(client);

  try {
    const result = await payment.create({
      body: {
        transaction_amount: amount, // Sempre enforce backend pricing for security
        token: formData.token,
        description: description,
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
          email: finalEmail,
          identification: formData.payer?.identification
        },
        external_reference: `${userId}_${planType}`,
      },
      requestOptions: {
        idempotencyKey: crypto.randomUUID()
      }
    });

    if (result.status === 'rejected') {
        console.error("Cartão Recusado pelo MP -> Motivo:", result.status_detail);
    }

    return { success: true, status: result.status, paymentId: result.id };
  } catch (err) {
    console.error("Erro MP API Cartão:", err);
    return { success: false, error: 'Falha ao processar pagamento com cartão' };
  }
}
