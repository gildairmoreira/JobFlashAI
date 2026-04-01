"use client";

import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/resumes",
      });
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Erro ao entrar com Google. Tente novamente.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Erro ao fazer login. Verifique suas credenciais.");
        setIsLoading(false);
        return;
      }

      toast.success("Login realizado com sucesso!");
      router.push("/resumes");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4 w-full max-w-sm mx-auto"
    >
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Bem-vindo de volta!
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-xs xl:text-sm">
          Acesse sua conta e continue criando currículos vencedores.
        </p>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-3 pt-1">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <Input
              id="email"
              placeholder="seu@email.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              className="pl-9 h-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <Input
              id="password"
              type="password"
              placeholder="Sua senha secreta"
              autoComplete="current-password"
              disabled={isLoading || isGoogleLoading}
              className="pl-9 h-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full h-10 font-semibold"
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-stone-200 dark:border-stone-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-stone-50 dark:bg-stone-950 px-2 text-stone-500">
            Ou continue com
          </span>
        </div>
      </div>

      <Button
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
        variant="outline"
        className="w-full h-10 bg-white hover:bg-stone-50 text-stone-900 border-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-stone-100 dark:border-stone-800"
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        Google
      </Button>

      <div className="text-center text-xs xl:text-sm">
        <span className="text-stone-500 dark:text-stone-400">Não tem uma conta? </span>
        <Link href="/register" className="font-semibold text-primary hover:underline transition-all">
          Crie grátis.
        </Link>
      </div>

      <p className="text-center text-[10px] text-stone-400 dark:text-stone-500 px-4 mt-2">
        Ao continuar, você concorda com nossos{" "}
        <a href="/terms" className="underline hover:text-stone-900 dark:hover:text-stone-100 transition-colors">Termos</a> e{" "}
        <a href="/privacy" className="underline hover:text-stone-900 dark:hover:text-stone-100 transition-colors">Privacidade</a>.
      </p>
    </motion.div>
  );
}
