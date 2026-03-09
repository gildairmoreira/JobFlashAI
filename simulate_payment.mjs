import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const secret = "11814b7a-698b-478e-a48b-8548f0ff4474";

async function run() {
    console.log("Buscando currículo no banco para achar seu User ID...");
    const resumes = await prisma.resume.findMany({});

    if (resumes.length === 0) {
        console.log("Você ainda não criou nenhum currículo no Localhost. Crie 1 rascunho clicando em '+ Currículo' pra gente achar seu ID e ligar o plano!");
        return;
    }

    // Pegar o dono do primeiro currículo (que é o único logado)
    const user = { userId: resumes[0].userId };
    console.log(`Usuário/ClerkID encontrado: ${user.userId}`);

    const payload = {
        event: "payment.approved",
        data: {
            transaction: { id: "test_txn_123456" },
            customer: { email: "teste@jobflash.com" },
            product: { id: "5733b416-3b66-46ae-8832-ad18482f459d" }, // Pro
            metadata: { clerk_user_id: user.userId }
        }
    };

    const strBody = JSON.stringify(payload);
    const signature = crypto.createHmac("sha256", secret).update(strBody).digest("hex");

    console.log("\nSimulando envio de Webhook para http://localhost:3000/api/cakto/webhook...");

    try {
        const res = await fetch("http://localhost:3000/api/cakto/webhook", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-cakto-signature": signature
            },
            body: strBody
        });

        console.log(`Resposta do Servidor: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`Corpo: ${text}`);

        if (res.status === 200) {
            console.log("\n✅ SUCESSO! Pagamento aprovado via Webhook!");
            console.log("Vá até o localhost:3000 e verifique se as ferramentas premium foram desbloqueadas.");
        }
    } catch (e) {
        console.error("Erro ao enviar requisição. O pnpm dev está rodando?", e);
    }
}

run();
