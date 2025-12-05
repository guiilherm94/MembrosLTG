import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabaseAuth } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/admin')
      }
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-primary mb-2">ADMIN</h1>
            <h2 className="text-xl font-semibold mb-1">Painel Administrativo</h2>
            <p className="text-gray-400 text-sm">Acesso restrito</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email do administrador"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-3 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
