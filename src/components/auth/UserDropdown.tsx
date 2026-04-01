"use client";

import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { User, LogOut, Settings, CreditCard, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ManageAccountModal } from "./ManageAccountModal";

export function UserDropdown() {
    const { data: session, isPending } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [imageError, setImageError] = useState(false);

    if (isPending) return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
    if (!session) return null;

    const user = session.user;
    const showImage = user.image && !imageError;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-stone-200 dark:border-stone-800 p-0 overflow-hidden hover:opacity-80 transition-opacity bg-stone-100 dark:bg-stone-900">
                        {showImage ? (
                            <img 
                                src={user.image!} 
                                alt={user.name || "User"} 
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground italic truncate">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/resumes" className="cursor-pointer flex items-center w-full">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Meus Currículos</span>
                        </Link>
                    </DropdownMenuItem>
                    
                    {/* Botão Admin apenas para MASTER */}
                    {user.email === "gildair457@gmail.com" && (
                        <DropdownMenuItem asChild>
                            <Link href="/billing" className="cursor-pointer flex items-center w-full text-indigo-500 focus:text-indigo-600 focus:bg-indigo-50/50">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span className="font-semibold">Painel Admin</span>
                            </Link>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onSelect={() => setIsModalOpen(true)} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Gerenciar Conta</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onSelect={() => signOut({
                            fetchOptions: {
                                onSuccess: () => {
                                    window.location.href = "/";
                                }
                            }
                        })} 
                        className="text-red-500 focus:text-red-500 cursor-pointer"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ManageAccountModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
}
