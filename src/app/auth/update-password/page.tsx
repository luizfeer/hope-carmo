'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { AuthBackdrop } from '@/components/auth/AuthBackdrop';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const inputClass =
  'h-11 border-zinc-600/80 bg-zinc-950/90 text-zinc-100 shadow-inner placeholder:text-zinc-500 focus-visible:border-amber-500/60 focus-visible:ring-amber-500/35 dark:bg-zinc-950/90';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setInvalid(true);
        setReady(true);
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setMessage('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  if (!ready) {
    return (
      <AuthBackdrop>
        <p className="text-sm font-medium text-zinc-400">Carregando…</p>
      </AuthBackdrop>
    );
  }

  if (invalid) {
    return (
      <AuthBackdrop>
        <Card className="w-full max-w-[420px] border border-white/10 bg-zinc-900/85 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-50">Link inválido ou expirado</CardTitle>
            <CardDescription className="text-zinc-400">
              Peça um novo e-mail de redefinição de senha e tente novamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/auth/forgot-password"
              className={cn(
                buttonVariants({ variant: 'default' }),
                'flex h-11 w-full items-center justify-center bg-amber-500 font-semibold text-zinc-950 hover:bg-amber-400'
              )}
            >
              Solicitar novo link
            </Link>
          </CardContent>
        </Card>
      </AuthBackdrop>
    );
  }

  return (
    <AuthBackdrop>
      <Card className="w-full max-w-[420px] border border-white/10 bg-zinc-900/85 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/25">
            <ShieldCheck className="h-6 w-6 text-amber-400" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
              Nova senha
            </CardTitle>
            <CardDescription className="text-base text-zinc-400">
              Escolha uma senha forte para a sua conta de administrador.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-200">
                Nova senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-zinc-200">
                Confirmar senha
              </Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className={inputClass}
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
              {loading ? 'Salvando…' : 'Salvar senha'}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              <Link
                href="/admin/login"
                className="font-medium text-zinc-400 underline-offset-4 transition hover:text-amber-400 hover:underline"
              >
                Voltar ao login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthBackdrop>
  );
}
