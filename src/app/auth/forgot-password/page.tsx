'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthBackdrop>
      <Card className="w-full max-w-[420px] border border-white/10 bg-zinc-900/85 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/25">
            <KeyRound className="h-6 w-6 text-amber-400" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
              Redefinir senha
            </CardTitle>
            <CardDescription className="text-base text-zinc-400">
              Enviamos um link para o seu e-mail se existir uma conta associada.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-sm text-zinc-300">
              <p>
                Se o endereço estiver cadastrado, você receberá um e-mail com instruções para criar uma
                nova senha. Verifique também a pasta de spam.
              </p>
              <Link
                href="/admin/login"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'h-11 w-full bg-amber-500 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400'
                )}
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
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
                {loading ? 'Enviando…' : 'Enviar link'}
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
          )}
        </CardContent>
      </Card>
    </AuthBackdrop>
  );
}
