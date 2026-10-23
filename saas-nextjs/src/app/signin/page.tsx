'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg('Credenciais inválidas. Verifique seu e-mail corporativo e senha.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 bg-zinc-950 relative overflow-hidden">
      {/* Glow sutil estilo Linear / Vercel */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full" />

      <div className="w-full max-w-md bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow">
            DA
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Dashboards Automatizados
            </h1>
            <p className="text-xs text-zinc-400">app.dashboardmagico.com</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-zinc-100 mb-1">Acesso à Plataforma</h2>
        <p className="text-xs text-zinc-400 mb-6">
          Entre com sua conta corporativa para gerenciar seus Dashboards Automatizados.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              E-mail Corporativo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com.br"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-semibold text-white transition shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Autenticando com segurança...' : 'Entrar em Dashboards Automatizados'}
          </button>
        </form>

        <p className="text-xs text-zinc-400 text-center mt-6">
          Ainda não possui acesso?{' '}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Criar conta corporativa
          </Link>
        </p>
      </div>
    </main>
  )
}
