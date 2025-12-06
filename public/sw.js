// Custom Service Worker para notificações push

// Importar o service worker gerado pelo next-pwa
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.')
  event.waitUntil(clients.claim())
})

// Escutar eventos de push notification
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)

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
      console.error('Error parsing notification data:', error)
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
        title: 'Abrir',
        icon: '/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-192.png'
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

// Escutar cliques na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/home'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Verificar se já existe uma janela aberta
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
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

// Escutar quando a notificação é fechada
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
})
