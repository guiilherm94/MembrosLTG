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
    console.log('[PUSH] Verificando VAPID keys...')
    console.log('[PUSH] Public key presente:', !!vapidPublicKey)
    console.log('[PUSH] Private key presente:', !!vapidPrivateKey)

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('[PUSH] VAPID keys não configuradas!')
      return res.status(500).json({
        error: 'VAPID keys não configuradas. Execute: npx web-push generate-vapid-keys',
        debug: {
          hasPublicKey: !!vapidPublicKey,
          hasPrivateKey: !!vapidPrivateKey
        }
      })
    }

    const { title, body, icon, badge, url, notificationId } = req.body

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' })
    }

    console.log('[PUSH] Buscando subscriptions...')

    // Buscar todas as subscriptions ativas
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (fetchError) {
      console.error('[PUSH] Erro ao buscar subscriptions:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch subscriptions' })
    }

    console.log('[PUSH] Subscriptions encontradas:', subscriptions?.length || 0)

    if (!subscriptions || subscriptions.length === 0) {
      console.warn('[PUSH] Nenhuma subscription encontrada')
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

    console.log('[PUSH] Enviando notificações...')
    console.log('[PUSH] Payload:', payload)

    // Enviar notificação para cada subscription
    const sendPromises = subscriptions.map(async (sub, index) => {
      try {
        const subscription = sub.subscription as any
        console.log(`[PUSH] Enviando para subscription ${index + 1}/${subscriptions.length}...`)

        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys
          },
          JSON.stringify(payload)
        )

        console.log(`[PUSH] ✓ Enviado com sucesso para ${index + 1}`)
        successCount++
      } catch (error: any) {
        console.error(`[PUSH] ✗ Erro ao enviar para subscription ${index + 1}:`, error.message)
        console.error('[PUSH] Detalhes do erro:', error)
        failureCount++
        failedEndpoints.push(sub.endpoint)

        // Se a subscription expirou (410), remove do banco
        if (error.statusCode === 410) {
          console.log('[PUSH] Removendo subscription expirada...')
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
      }
    })

    await Promise.all(sendPromises)

    console.log('[PUSH] Resumo:', { total: subscriptions.length, sucesso: successCount, falhas: failureCount })

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
