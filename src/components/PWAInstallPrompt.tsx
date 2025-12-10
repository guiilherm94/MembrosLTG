import { useState, useEffect } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export default function PWAInstallPrompt() {
  const [dismissed, setDismissed] = useState(false)
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall()

  useEffect(() => {
    // Verificar se o usuário já dispensou o prompt
    const isDismissed = localStorage.getItem('pwa-install-dismissed')
    if (isDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleInstall = async () => {
    const accepted = await promptInstall()
    if (accepted) {
      setDismissed(true)
    }
  }

  // Não mostrar se:
  // - Já foi dispensado
  // - Não é instalável
  // - Já está instalado
  if (dismissed || !isInstallable || isInstalled) {
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
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">
              Instalar Aplicativo
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Instale nosso app para acesso rápido, modo offline e uma experiência completa.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded transition"
              >
                Instalar
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
