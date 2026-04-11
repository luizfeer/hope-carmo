import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-center">
      <h1 className="text-lg font-semibold text-zinc-100">Não foi possível concluir o login</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        O link pode ter expirado ou já foi usado. Peça um novo e-mail de confirmação ou tente entrar de
        novo.
      </p>
      <Link
        href="/admin/login"
        className="mt-6 text-sm font-medium text-amber-400 underline-offset-4 hover:underline"
      >
        Voltar ao painel
      </Link>
    </div>
  );
}
