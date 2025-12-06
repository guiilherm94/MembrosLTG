import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface PushNotificationState {
  permission: NotificationPermission
  subscription: PushSubscription | null
  isSupported: boolean
  isLoading: boolean
  error: string | null
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    permission: 'default',
    subscription: null,
    isSupported: false,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    checkSupport()
  }, [])

  const checkSupport = async () => {
    const isSupported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    if (!isSupported) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        isLoading: false,
        error: 'Push notifications não são suportadas neste navegador'
      }))
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      setState(prev => ({
        ...prev,
        isSupported: true,
        permission: Notification.permission,
        subscription,
        isLoading: false
      }))
    } catch (error) {
      console.error('Erro ao verificar suporte:', error)
      setState(prev => ({
        ...prev,
        isSupported: true,
        isLoading: false,
        error: 'Erro ao verificar permissões'
      }))
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications não suportadas' }))
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission }))

      if (permission === 'granted') {
        await subscribeToPush()
        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      setState(prev => ({ ...prev, error: 'Erro ao solicitar permissão' }))
      return false
    }
  }

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    try {
      const registration = await navigator.serviceWorker.ready

      // VAPID public key - você precisa gerar essa chave
      // Use: npx web-push generate-vapid-keys
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        console.error('VAPID public key não configurada')
        setState(prev => ({ ...prev, error: 'Configuração de push incompleta' }))
        return null
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // Salvar subscription no banco de dados
      await saveSubscription(subscription)

      setState(prev => ({ ...prev, subscription }))
      return subscription
    } catch (error) {
      console.error('Erro ao se inscrever em push:', error)
      setState(prev => ({ ...prev, error: 'Erro ao ativar notificações' }))
      return null
    }
  }

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!state.subscription) return false

    try {
      await state.subscription.unsubscribe()
      await removeSubscription(state.subscription)
      setState(prev => ({ ...prev, subscription: null }))
      return true
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error)
      setState(prev => ({ ...prev, error: 'Erro ao desativar notificações' }))
      return false
    }
  }

  const saveSubscription = async (subscription: PushSubscription) => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (!userData) return

    const user = JSON.parse(userData)

    try {
      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        subscription: subscription.toJSON(),
        endpoint: subscription.endpoint,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,endpoint'
      })
    } catch (error) {
      console.error('Erro ao salvar subscription:', error)
    }
  }

  const removeSubscription = async (subscription: PushSubscription) => {
    try {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint)
    } catch (error) {
      console.error('Erro ao remover subscription:', error)
    }
  }

  return {
    ...state,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    reload: checkSupport
  }
}

// Função auxiliar para converter VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
