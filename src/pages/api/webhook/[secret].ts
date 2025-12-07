import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdminAdmin } from '@/lib/supabaseAdmin'
import bcrypt from 'bcryptjs'

// Estrutura de webhook suportando múltiplas plataformas
interface WebhookPayload {
  // CartPanda / Formato genérico
  customer_email?: string
  customer_name?: string
  customer_phone?: string
  status?: string
  event_type?: string

  // Hotmart
  data?: {
    buyer?: {
      email?: string
      name?: string
      phone?: string
    }
    product?: {
      id?: string
      name?: string
    }
    purchase?: {
      status?: string
    }
  }
  event?: string

  // Yampi / Kiwify
  email?: string
  name?: string
  phone?: string
  product_name?: string
  transaction_status?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { secret } = req.query

    if (!secret || typeof secret !== 'string') {
      return res.status(400).json({ error: 'Webhook secret is required' })
    }

    // Buscar produto pelo webhook_secret
    const { data: product, error: productError } = await supabaseAdminAdmin
      .from('products')
      .select('id, name, enabled_platforms, enable_access_removal')
      .eq('webhook_secret', secret)
      .single()

    if (productError || !product) {
      console.error('Produto não encontrado para secret:', secret)
      return res.status(404).json({ error: 'Invalid webhook secret' })
    }

    const payload: WebhookPayload = req.body
    console.log(`Webhook recebido para produto ${product.name}:`, JSON.stringify(payload, null, 2))

    // Detectar plataforma e extrair dados
    let email: string | undefined
    let fullName: string | undefined
    let phone: string | undefined
    let eventType: string | undefined
    let platform: string | undefined

    // CartPanda
    if (payload.customer_email) {
      platform = 'cartpanda'
      email = payload.customer_email
      fullName = payload.customer_name
      phone = payload.customer_phone
      eventType = payload.event_type || payload.status
    }
    // Hotmart
    else if (payload.data?.buyer) {
      platform = 'hotmart'
      email = payload.data.buyer.email
      fullName = payload.data.buyer.name
      phone = payload.data.buyer.phone
      eventType = payload.event
    }
    // Yampi / Kiwify
    else if (payload.email) {
      platform = 'yampi' // ou kiwify, tratado de forma similar
      email = payload.email
      fullName = payload.name
      phone = payload.phone
      eventType = payload.transaction_status
    }

    // Verificar se a plataforma está habilitada para este produto
    const enabledPlatforms = product.enabled_platforms as string[]
    if (!enabledPlatforms || !enabledPlatforms.includes(platform || '')) {
      return res.status(403).json({
        error: `Platform ${platform} is not enabled for this product`,
        enabled_platforms: enabledPlatforms
      })
    }

    // Normalizar email
    if (email) email = email.toLowerCase().trim()

    // Validações
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório no webhook' })
    }

    if (!fullName) {
      return res.status(400).json({ error: 'Nome é obrigatório no webhook' })
    }

    // Determinar ação (criar/adicionar acesso ou remover acesso)
    const isRemovalEvent = eventType &&
      ['cancelled', 'refunded', 'chargeback', 'canceled', 'refund'].some(
        term => eventType.toLowerCase().includes(term)
      )

    if (isRemovalEvent && product.enable_access_removal) {
      // Remover acesso ao produto
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        const currentProductIds = existingUser.product_ids || []
        const updatedProductIds = currentProductIds.filter((id: string) => id !== product.id)

        await supabaseAdmin
          .from('users')
          .update({
            product_ids: updatedProductIds,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)

        console.log(`Acesso ao produto ${product.name} removido do usuário ${email}`)

        return res.status(200).json({
          success: true,
          action: 'access_removed',
          message: 'Acesso ao produto removido',
          user_email: email,
          product: product.name
        })
      } else {
        return res.status(404).json({
          error: 'Usuário não encontrado para remover acesso'
        })
      }
    }

    // Validar status da transação (para eventos de aprovação)
    const validStatuses = ['approved', 'paid', 'complete', 'completed', 'success', 'active']
    if (eventType && !validStatuses.some(s => eventType.toLowerCase().includes(s))) {
      return res.status(200).json({
        message: 'Webhook recebido mas transação não aprovada',
        status: eventType
      })
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Usuário existe, adicionar produto se ainda não tiver
      const currentProductIds = existingUser.product_ids || []

      if (!currentProductIds.includes(product.id)) {
        const updatedProductIds = [...currentProductIds, product.id]

        await supabaseAdmin
          .from('users')
          .update({
            product_ids: updatedProductIds,
            phone: phone || existingUser.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)

        console.log(`Produto ${product.name} adicionado ao usuário ${email}`)

        return res.status(200).json({
          success: true,
          action: 'access_granted',
          message: 'Produto adicionado ao usuário existente',
          user_email: email,
          product_added: product.name
        })
      } else {
        console.log(`Usuário ${email} já possui o produto ${product.name}`)

        return res.status(200).json({
          success: true,
          action: 'already_has_access',
          message: 'Usuário já possui acesso a este produto',
          user_email: email
        })
      }
    }

    // Criar novo usuário
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          full_name: fullName,
          phone: phone || null,
          password_hash: hashedPassword,
          product_ids: [product.id]
        }
      ])
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar usuário:', createError)
      return res.status(500).json({
        error: 'Erro ao criar usuário',
        details: createError.message
      })
    }

    console.log(`Novo usuário criado: ${email} com produto ${product.name}`)

    // Em produção, aqui você enviaria um email com as credenciais
    return res.status(201).json({
      success: true,
      action: 'user_created',
      message: 'Usuário criado com sucesso',
      user_email: email,
      product: product.name,
      // REMOVER EM PRODUÇÃO - apenas para testes
      temp_password: tempPassword
    })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
