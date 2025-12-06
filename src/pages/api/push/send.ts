import type { NextApiRequest, NextApiResponse } from 'next'
import webpush from 'web-push'
import { supabase } from '@/lib/supabase'

// Configure VAPID keys (você precisa gerar essas chaves)
// Use: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contato@lowzingo.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verificar se as VAPID keys estão configuradas
    if (!vapidPublicKey || !vapidPrivateKey) {
      return res.status(500).json({
        error: 'VAPID keys não configuradas. Execute: npx web-push generate-vapid-keys'
      })
    }

    const { title, body, icon, badge, url, notificationId } = req.body

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' })
    }

    // Buscar todas as subscriptions ativas
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (fetchError) {
      console.error('Erro ao buscar subscriptions:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch subscriptions' })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        message: 'No subscriptions found',
        sent: 0,
        failed: 0
      })
    }

    const payload: PushPayload = {
      title,
      body,
      icon: icon || '/icons/icon-192.png',
      badge: badge || '/icons/icon-192.png',
      url: url || '/home'
    }

    let successCount = 0
    let failureCount = 0
    const failedEndpoints: string[] = []

    // Enviar notificação para cada subscription
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const subscription = sub.subscription as any

        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys
          },
          JSON.stringify(payload)
        )

        successCount++
      } catch (error: any) {
        console.error('Erro ao enviar push para', sub.endpoint, error)
        failureCount++
        failedEndpoints.push(sub.endpoint)

        // Se a subscription expirou (410), remove do banco
        if (error.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
      }
    })

    await Promise.all(sendPromises)

    // Atualizar estatísticas da notificação
    if (notificationId) {
      await supabase
        .from('push_notifications')
        .update({
          recipients_count: subscriptions.length,
          success_count: successCount,
          failure_count: failureCount,
          status: failureCount === subscriptions.length ? 'failed' : 'completed',
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationId)
    }

    return res.status(200).json({
      message: 'Notifications sent',
      total: subscriptions.length,
      sent: successCount,
      failed: failureCount,
      failedEndpoints: failedEndpoints.length > 0 ? failedEndpoints : undefined
    })
  } catch (error: any) {
    console.error('Error sending push notifications:', error)
    return res.status(500).json({ error: error.message || 'Failed to send notifications' })
  }
}
