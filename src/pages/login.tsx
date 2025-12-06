import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSettings } from '@/hooks/useSettings'

export default function Login() {
  const router = useRouter()
  const { settings } = useSettings()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }

      if (remember) {
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        sessionStorage.setItem('user', JSON.stringify(data.user))
      }

      router.push('/home')
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-primary mb-2">{settings?.system_name || 'Área de Membros'}</h1>
            <h2 className="text-xl font-semibold mb-1">Acesse sua conta</h2>
            <p className="text-gray-400 text-sm">Preencha seus dados de acesso à plataforma</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="molivesutter@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                required
              />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                Lembre de mim
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-3 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ACESSANDO...' : 'ACESSAR'}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-400">Perdeu sua senha? | </span>
              <Link href="/register" className="text-primary hover:underline">
                Registro
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Seus dados estão seguros
          </div>
        </div>
      </div>
    </div>
  )
}
