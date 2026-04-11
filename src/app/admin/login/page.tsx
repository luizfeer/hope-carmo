'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AuthBackdrop } from '@/components/auth/AuthBackdrop';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const err = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    err === 'forbidden' ? 'Conta sem permissão de admin.' : null
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <AuthBackdrop>
      <Card className="w-full max-w-[420px] border border-white/10 bg-zinc-900/85 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/25">
            <Lock className="h-6 w-6 text-amber-400" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
              Entrar no painel
            </CardTitle>
            <CardDescription className="text-base text-zinc-400">
              Hope Carmo — área restrita para administradores
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-200">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-zinc-600/80 bg-zinc-950/90 text-zinc-100 shadow-inner placeholder:text-zinc-500 focus-visible:border-amber-500/60 focus-visible:ring-amber-500/35 dark:bg-zinc-950/90"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password" className="text-zinc-200">
                  Senha
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-amber-400/90 underline-offset-4 hover:text-amber-300 hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-zinc-600/80 bg-zinc-950/90 text-zinc-100 shadow-inner placeholder:text-zinc-500 focus-visible:border-amber-500/60 focus-visible:ring-amber-500/35 dark:bg-zinc-950/90"
              />
            </div>
            {message && (
              <p className="rounded-lg border border-red-500/30 bg-red-950/50 px-3 py-2 text-sm text-red-200">
                {message}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-amber-500 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 focus-visible:ring-amber-400/50 disabled:opacity-60"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              <Link
                href="/"
                className="font-medium text-zinc-400 underline-offset-4 transition hover:text-amber-400 hover:underline"
              >
                Voltar ao site
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthBackdrop>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <AuthBackdrop>
          <p className="text-sm font-medium text-zinc-400">Carregando…</p>
        </AuthBackdrop>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
