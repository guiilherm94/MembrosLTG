import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase, supabaseAuth } from '@/lib/supabase'

export default function PWADebug() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    const { data: { session } } = await supabaseAuth.auth.getSession()
    if (!session) {
      router.push('/admin/login')
      return
    }
    loadDebugInfo()
  }

  const loadDebugInfo = async () => {
    const info: any = {
      browser: {},
      serviceWorker: {},
      notification: {},
      vapid: {},
      subscriptions: {}
    }

    // Informações do navegador
    info.browser.userAgent = navigator.userAgent
    info.browser.online = navigator.onLine
    info.browser.serviceWorkerSupported = 'serviceWorker' in navigator
    info.browser.notificationSupported = 'Notification' in window
    info.browser.pushSupported = 'PushManager' in window

    // Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        info.serviceWorker.registered = !!registration
        info.serviceWorker.active = !!registration?.active
        info.serviceWorker.scope = registration?.scope

        if (registration) {
          const subscription = await registration.pushManager.getSubscription()
          info.serviceWorker.hasSubscription = !!subscription
          if (subscription) {
            info.serviceWorker.endpoint = subscription.endpoint
          }
        }
      } catch (error: any) {
        info.serviceWorker.error = error.message
      }
    }

    // Notificações
    info.notification.permission = Notification.permission
    info.notification.permissionGranted = Notification.permission === 'granted'

    // VAPID Key (do cliente)
    info.vapid.publicKeyConfigured = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    info.vapid.publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.substring(0, 20) + '...'

    // Subscriptions no banco
    try {
      const { count } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })

      info.subscriptions.count = count || 0

      const { data } = await supabase
        .from('push_subscriptions')
        .select('*')
        .limit(5)

      info.subscriptions.recent = data?.map(s => ({
        endpoint: s.endpoint.substring(0, 50) + '...',
        created_at: s.created_at
      }))
    } catch (error: any) {
      info.subscriptions.error = error.message
    }

    setDebugInfo(info)
    setLoading(false)
  }

  const testNotification = async () => {
    if (Notification.permission !== 'granted') {
      alert('Permissão de notificação não concedida!')
      return
    }

    new Notification('Teste Local', {
      body: 'Esta é uma notificação de teste local (não via push)',
      icon: '/icons/icon-192.png'
    })
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
            <h1 className="text-2xl font-bold">PWA Debug</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Browser Support */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🌐 Navegador
            </h2>
            <div className="space-y-2 text-sm">
              <StatusRow label="Service Worker" value={debugInfo.browser.serviceWorkerSupported} />
              <StatusRow label="Notificações" value={debugInfo.browser.notificationSupported} />
              <StatusRow label="Push API" value={debugInfo.browser.pushSupported} />
              <StatusRow label="Online" value={debugInfo.browser.online} />
              <div className="pt-2 border-t border-zinc-800 mt-2">
                <p className="text-gray-500 text-xs break-all">{debugInfo.browser.userAgent}</p>
              </div>
            </div>
          </div>

          {/* Service Worker */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              ⚙️ Service Worker
            </h2>
            <div className="space-y-2 text-sm">
              <StatusRow label="Registrado" value={debugInfo.serviceWorker.registered} />
              <StatusRow label="Ativo" value={debugInfo.serviceWorker.active} />
              <StatusRow label="Push Subscription" value={debugInfo.serviceWorker.hasSubscription} />
              {debugInfo.serviceWorker.scope && (
                <div>
                  <span className="text-gray-400">Scope:</span>
                  <p className="text-xs text-gray-500">{debugInfo.serviceWorker.scope}</p>
                </div>
              )}
              {debugInfo.serviceWorker.endpoint && (
                <div>
                  <span className="text-gray-400">Endpoint:</span>
                  <p className="text-xs text-gray-500 break-all">{debugInfo.serviceWorker.endpoint}</p>
                </div>
              )}
              {debugInfo.serviceWorker.error && (
                <div className="text-red-500 text-xs">{debugInfo.serviceWorker.error}</div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🔔 Notificações
            </h2>
            <div className="space-y-2 text-sm">
              <StatusRow label="Permissão" value={debugInfo.notification.permissionGranted} />
              <div>
                <span className="text-gray-400">Status: </span>
                <span className={`font-semibold ${
                  debugInfo.notification.permission === 'granted' ? 'text-green-500' :
                  debugInfo.notification.permission === 'denied' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {debugInfo.notification.permission}
                </span>
              </div>
              <button
                onClick={testNotification}
                disabled={debugInfo.notification.permission !== 'granted'}
                className="w-full mt-4 px-4 py-2 bg-primary text-black rounded font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Testar Notificação Local
              </button>
            </div>
          </div>

          {/* VAPID */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🔑 VAPID Keys
            </h2>
            <div className="space-y-2 text-sm">
              <StatusRow label="Public Key Configurada" value={debugInfo.vapid.publicKeyConfigured} />
              {debugInfo.vapid.publicKey && (
                <div>
                  <span className="text-gray-400">Chave (preview):</span>
                  <p className="text-xs text-gray-500 font-mono">{debugInfo.vapid.publicKey}</p>
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions no Banco */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              💾 Subscriptions no Banco de Dados
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Total de Inscritos: </span>
                <span className="font-semibold text-primary text-lg">{debugInfo.subscriptions.count}</span>
              </div>

              {debugInfo.subscriptions.recent && debugInfo.subscriptions.recent.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-400 mb-2">Últimas subscriptions:</p>
                  <div className="space-y-2">
                    {debugInfo.subscriptions.recent.map((sub: any, i: number) => (
                      <div key={i} className="bg-zinc-950 p-3 rounded border border-zinc-800">
                        <p className="text-xs font-mono text-gray-500 break-all">{sub.endpoint}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(sub.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debugInfo.subscriptions.error && (
                <div className="text-red-500 text-xs">{debugInfo.subscriptions.error}</div>
              )}
            </div>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">🔍 Diagnóstico</h2>
          <div className="space-y-2 text-sm">
            {!debugInfo.browser.serviceWorkerSupported && (
              <Alert type="error">Service Worker não suportado neste navegador</Alert>
            )}
            {!debugInfo.browser.notificationSupported && (
              <Alert type="error">Notificações não suportadas neste navegador</Alert>
            )}
            {!debugInfo.browser.pushSupported && (
              <Alert type="error">Push API não suportada neste navegador</Alert>
            )}
            {!debugInfo.vapid.publicKeyConfigured && (
              <Alert type="error">VAPID Public Key não configurada nas variáveis de ambiente</Alert>
            )}
            {!debugInfo.serviceWorker.registered && debugInfo.browser.serviceWorkerSupported && (
              <Alert type="warning">Service Worker não registrado. Recarregue a página.</Alert>
            )}
            {debugInfo.notification.permission === 'denied' && (
              <Alert type="error">Permissão de notificação negada. Limpe as configurações do site.</Alert>
            )}
            {debugInfo.notification.permission === 'default' && (
              <Alert type="warning">Permissão de notificação não solicitada ainda.</Alert>
            )}
            {!debugInfo.serviceWorker.hasSubscription && debugInfo.notification.permission === 'granted' && (
              <Alert type="warning">Permissão concedida mas sem push subscription ativa.</Alert>
            )}
            {debugInfo.subscriptions.count === 0 && (
              <Alert type="warning">Nenhum usuário inscrito para receber notificações.</Alert>
            )}
            {debugInfo.subscriptions.count > 0 && debugInfo.serviceWorker.hasSubscription && debugInfo.notification.permissionGranted && (
              <Alert type="success">Tudo configurado corretamente! Você pode receber notificações.</Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className={value ? 'text-green-500' : 'text-red-500'}>
        {value ? '✓ Sim' : '✗ Não'}
      </span>
    </div>
  )
}

function Alert({ type, children }: { type: 'success' | 'warning' | 'error'; children: React.ReactNode }) {
  const colors = {
    success: 'bg-green-500/10 border-green-500 text-green-500',
    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-500',
    error: 'bg-red-500/10 border-red-500 text-red-500'
  }

  return (
    <div className={`p-3 rounded border ${colors[type]}`}>
      {children}
    </div>
  )
}
