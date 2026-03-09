"use client";

import usePremiumModal from "@/hooks/usePremiumModal";
import { Button } from "../ui/button";

export default function RenewButton() {
    const premiumModal = usePremiumModal();

    return (
        <Button
            onClick={() => premiumModal.setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded-full text-lg w-full sm:w-auto shadow-lg transition-transform hover:scale-105"
        >
            Ver Planos e Renovar
        </Button>
    );
}
