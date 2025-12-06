import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useSettings } from '@/hooks/useSettings'
import { getDriveDirectView } from '@/lib/media-converter'

export default function Perfil() {
  const router = useRouter()
  const { settings } = useSettings()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const user = JSON.parse(userData)
    setFormData({
      email: user.email || '',
      full_name: user.full_name || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    })
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (!userData) return

    const user = JSON.parse(userData)

    // Validação de senha
    if (formData.new_password) {
      if (!formData.current_password) {
        setMessage({ type: 'error', text: 'Informe sua senha atual para alterar a senha' })
        setSaving(false)
        return
      }
      if (formData.new_password !== formData.confirm_password) {
        setMessage({ type: 'error', text: 'As senhas não coincidem' })
        setSaving(false)
        return
      }
      if (formData.new_password.length < 6) {
        setMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres' })
        setSaving(false)
        return
      }
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: formData.email,
          full_name: formData.full_name,
          current_password: formData.current_password,
          new_password: formData.new_password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar perfil' })
        setSaving(false)
        return
      }

      // Atualizar cache do usuário
      const updatedUser = { ...user, email: formData.email, full_name: formData.full_name }
      sessionStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })

      // Limpar campos de senha
      setFormData({
        ...formData,
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' })
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Menu lateral */}
      <div className={`fixed inset-0 z-50 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-72 bg-zinc-900 border-r border-zinc-800 transform transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-bold">{settings?.system_name || 'LowzinGO - Membros'}</h2>
            <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="p-4">
            <Link href="/home" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-zinc-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-semibold">Home</span>
            </Link>
            <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 rounded bg-zinc-800">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-semibold text-primary">Meu Perfil</span>
            </Link>
            <Link href="/suporte" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-zinc-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-semibold">Suporte</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-zinc-800 transition text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold">Sair</span>
            </button>
          </nav>
        </div>
      </div>

      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => setMenuOpen(true)} className="text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {settings?.logo_url ? (
              <img
                src={settings.logo_url.includes('drive.google.com') ? getDriveDirectView(settings.logo_url) : settings.logo_url}
                alt="Logo"
                className="h-10 w-auto object-contain max-w-[200px]"
              />
            ) : (
              <h1 className="text-2xl font-black text-primary">{settings?.system_name || 'LowzinGO - Membros'}</h1>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/home" className="text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            <button onClick={handleLogout} className="text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-gray-400">Atualize suas informações pessoais</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded border ${
            message.type === 'success'
              ? 'bg-green-900/20 border-green-500 text-green-500'
              : 'bg-red-900/20 border-red-500 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Informações Pessoais</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
            <p className="text-sm text-gray-400 mb-4">Deixe em branco se não quiser alterar a senha</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Senha Atual</label>
                <input
                  type="password"
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Nova Senha</label>
                <input
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary text-black font-bold rounded hover:bg-primary/90 transition disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <Link
              href="/home"
              className="px-8 py-3 bg-zinc-800 text-white font-bold rounded hover:bg-zinc-700 transition text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
