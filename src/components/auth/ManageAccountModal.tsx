"use client";

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, CreditCard, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { SubscriptionTab } from "./SubscriptionTab";

interface ManageAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ManageAccountModal({ isOpen, onClose }: ManageAccountModalProps) {
    const { data: session } = useSession();

    if (!session) return null;

    const user = session.user;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 overflow-hidden shadow-2xl border-border/50">
                <DialogHeader className="p-6 pb-2 border-b border-border/10 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-semibold tracking-tight">Gerenciar Conta</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-1">
                                Ajuste suas preferências de perfil e assinatura.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-center border-b border-border/10 bg-muted/5 p-4">
                        <TabsList className="h-auto bg-muted/50 p-1 rounded-xl border border-border/20 grid grid-cols-3 w-full max-w-[400px]">
                            <TabsTrigger 
                                value="profile" 
                                className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary py-2.5 rounded-lg transition-all"
                            >
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">Perfil</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="security" 
                                className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary py-2.5 rounded-lg transition-all"
                            >
                                <Shield className="h-4 w-4" />
                                <span className="text-sm font-medium">Segurança</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="subscription" 
                                className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary py-2.5 rounded-lg transition-all"
                            >
                                <CreditCard className="h-4 w-4" />
                                <span className="text-sm font-medium">Assinatura</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-background/50">
                        <TabsContent value="profile" className="mt-0 space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/10">
                                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted">
                                            <User className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <section className="space-y-4">
                                <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Informações Pessoais</h4>
                                <div className="grid gap-4">
                                    <div className="grid gap-1">
                                        <label className="text-xs font-medium text-muted-foreground">Nome Completo</label>
                                        <div className="p-2 rounded-md bg-muted/5 border border-border/40 text-sm font-medium">{user.name}</div>
                                    </div>
                                    <div className="grid gap-1">
                                        <label className="text-xs font-medium text-muted-foreground">Email</label>
                                        <div className="p-2 rounded-md bg-muted/5 border border-border/40 text-sm font-medium">{user.email}</div>
                                    </div>
                                </div>
                            </section>
                        </TabsContent>

                        <TabsContent value="security" className="mt-0 space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-indigo-500" />
                                    Segurança e Acesso
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Sua conta está vinculada ao Google. Todas as sessões são protegidas pela infraestrutura do Google.
                                </p>
                            </div>
                            
                            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 transition-all hover:bg-indigo-500/10 active:scale-[0.99]">
                                <div className="flex items-center gap-3">
                                    <img src="https://www.google.com/favicon.ico" className="h-5 w-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
                                    <div>
                                        <p className="text-sm font-medium">Conectado com Google</p>
                                        <p className="text-xs text-muted-foreground">Acesso rápido e seguro habilitado</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="subscription" className="mt-0 h-full">
                            <SubscriptionTab />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
