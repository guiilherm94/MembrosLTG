import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase, supabaseAuth } from '@/lib/supabase'

interface PushNotification {
  id: string
  title: string
  body: string
  icon: string
  badge: string
  url: string
  sent_at: string
  recipients_count: number
  success_count: number
  failure_count: number
  status: 'pending' | 'sending' | 'completed' | 'failed'
}

export default function AdminNotifications() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [subscribersCount, setSubscribersCount] = useState(0)

  // Form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/home')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    const { data: { session } } = await supabaseAuth.auth.getSession()
    if (!session) {
      router.push('/admin/login')
      return
    }
    loadData()
  }

  const loadData = async () => {
    // Carregar contagem de inscritos
    const { count } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true })

    setSubscribersCount(count || 0)

    // Carregar histórico de notificações
    const { data } = await supabase
      .from('push_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setNotifications(data)
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !body.trim()) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    if (subscribersCount === 0) {
      alert('Não há usuários inscritos para receber notificações')
      return
    }

    const confirmSend = confirm(
      `Deseja enviar esta notificação para ${subscribersCount} usuário(s)?`
    )

    if (!confirmSend) return

    setSending(true)

    try {
      // Criar registro da notificação
      const { data: notification, error: createError } = await supabase
        .from('push_notifications')
        .insert({
          title,
          body,
          url,
          status: 'sending'
        })
        .select()
        .single()

      if (createError) throw createError

      // Enviar notificação
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body,
          url,
          notificationId: notification.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar notificações')
      }

      // Limpar formulário
      setTitle('')
      setBody('')
      setUrl('/home')

      // Mostrar mensagem de sucesso
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)

      // Recarregar dados
      await loadData()
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error)
      alert('Erro ao enviar notificação: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold">Notificações Push</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">Inscritos: </span>
              <span className="font-semibold text-primary">{subscribersCount}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {showSuccess && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-lg flex items-center gap-3">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-primary font-semibold">Notificação enviada com sucesso!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de envio */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Enviar Nova Notificação</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-zinc-800 rounded focus:border-primary focus:outline-none"
                  placeholder="Ex: Novo conteúdo disponível!"
                  maxLength={50}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/50 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-zinc-800 rounded focus:border-primary focus:outline-none resize-none"
                  placeholder="Ex: Acabamos de adicionar uma nova aula ao curso..."
                  rows={4}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{body.length}/200 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  URL (Opcional)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-zinc-800 rounded focus:border-primary focus:outline-none"
                  placeholder="/home"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Para onde o usuário será redirecionado ao clicar
                </p>
              </div>

              {/* Preview */}
              {title && body && (
                <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-950">
                  <p className="text-xs text-gray-400 mb-2">Preview:</p>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{title}</p>
                      <p className="text-xs text-gray-400 mt-1">{body}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={sending || subscribersCount === 0}
                className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? 'Enviando...' : `Enviar para ${subscribersCount} usuário(s)`}
              </button>

              {subscribersCount === 0 && (
                <p className="text-sm text-yellow-500 text-center">
                  ⚠️ Nenhum usuário inscrito para receber notificações
                </p>
              )}
            </form>
          </div>

          {/* Histórico */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Histórico de Envios</h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Nenhuma notificação enviada ainda
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-gray-400 mt-1">{notification.body}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          notification.status === 'completed'
                            ? 'bg-primary/10 text-primary'
                            : notification.status === 'failed'
                            ? 'bg-red-500/10 text-red-500'
                            : notification.status === 'sending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {notification.status === 'completed'
                          ? 'Enviado'
                          : notification.status === 'failed'
                          ? 'Falhou'
                          : notification.status === 'sending'
                          ? 'Enviando'
                          : 'Pendente'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(notification.sent_at)}</span>
                      {notification.recipients_count > 0 && (
                        <span>
                          {notification.success_count}/{notification.recipients_count} enviados
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">ℹ️ Como funciona</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>
              • Os usuários precisam aceitar receber notificações ao acessar o sistema
            </p>
            <p>
              • As notificações serão enviadas apenas para usuários que instalaram o PWA ou
              aceitaram permissões
            </p>
            <p>
              • As mensagens aparecem mesmo quando o navegador está fechado (em dispositivos
              que suportam)
            </p>
            <p>
              • Mantenha as mensagens curtas e relevantes para melhor engajamento
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
