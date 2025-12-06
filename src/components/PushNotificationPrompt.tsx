import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function PushNotificationPrompt() {
  const [dismissed, setDismissed] = useState(false)
  const { permission, isSupported, requestPermission, isLoading } = usePushNotifications()

  useEffect(() => {
    // Verificar se o usuário já dispensou o prompt
    const isDismissed = localStorage.getItem('push-notification-dismissed')
    if (isDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('push-notification-dismissed', 'true')
  }

  const handleEnable = async () => {
    const granted = await requestPermission()
    if (granted) {
      setDismissed(true)
    }
  }

  // Não mostrar se:
  // - Estiver carregando
  // - Já foi dispensado
  // - Não é suportado
  // - Já tem permissão concedida
  if (isLoading || dismissed || !isSupported || permission === 'granted') {
    return null
  }

  // Se foi negado, não mostrar novamente
  if (permission === 'denied') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">
              Ativar Notificações
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Receba atualizações sobre novos conteúdos, avisos importantes e muito mais.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded transition"
              >
                Ativar
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Agora não
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-500 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
