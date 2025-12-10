import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Capturar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir o mini-infobar padrão do Chrome
      e.preventDefault()

      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
    }

    // Detectar quando o app foi instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    // Mostrar o prompt de instalação
    await deferredPrompt.prompt()

    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice

    // Limpar o prompt após o uso
    setDeferredPrompt(null)
    setIsInstallable(false)

    return outcome === 'accepted'
  }

  return {
    isInstallable,
    isInstalled,
    promptInstall
  }
}
