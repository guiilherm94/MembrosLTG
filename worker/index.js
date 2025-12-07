// Service Worker customizado para PWA com Push Notifications
// Este arquivo é usado como template pelo next-pwa

// Importar o workbox gerado pelo next-pwa
importScripts('workbox-sw.js');

// Event listener para notificações push
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event)

  let notificationData = {
    title: 'Nova Notificação',
    body: 'Você recebeu uma nova mensagem',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    url: '/home'
  }

  if (event.data) {
    try {
      notificationData = event.data.json()
    } catch (error) {
      console.error('[SW] Error parsing notification data:', error)
      notificationData.body = event.data.text()
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icons/icon-192.png',
    badge: notificationData.badge || '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: notificationData.url || '/home',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ],
    tag: 'lowzingo-notification',
    requireInteraction: false,
    renotify: true
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  )
})

// Event listener para cliques na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/home'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Verificar se já existe uma janela aberta
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }

      // Se não existir, abrir uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Event listener quando a notificação é fechada
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event)
})
