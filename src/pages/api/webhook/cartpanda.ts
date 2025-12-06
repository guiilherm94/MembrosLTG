import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// Estrutura de webhook suportando múltiplas plataformas
interface WebhookPayload {
  // CartPanda / Formato genérico
  customer_email?: string
  customer_name?: string
  customer_phone?: string
  product_id?: string
  status?: string

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

  // Yampi / Kiwify
  email?: string
  name?: string
  phone?: string
  product_name?: string
  transaction_status?: string

  // Campo para mapear produto da plataforma -> produto do sistema
  membership_product_id?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload: WebhookPayload = req.body

    // Logs para debug
    console.log('Webhook recebido:', JSON.stringify(payload, null, 2))

    // Extrair dados do cliente (suporta diferentes formatos)
    let email = payload.customer_email || payload.email || payload.data?.buyer?.email
    let fullName = payload.customer_name || payload.name || payload.data?.buyer?.name
    let phone = payload.customer_phone || payload.phone || payload.data?.buyer?.phone
    let status = payload.status || payload.transaction_status || payload.data?.purchase?.status
    let membershipProductId = payload.membership_product_id || payload.product_id

    // Normalizar email
    if (email) email = email.toLowerCase().trim()

    // Validações
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório no webhook' })
    }

    if (!fullName) {
      return res.status(400).json({ error: 'Nome é obrigatório no webhook' })
    }

    if (!membershipProductId) {
      return res.status(400).json({
        error: 'membership_product_id ou product_id não informado'
      })
    }

    // Validar status da transação
    const validStatuses = ['approved', 'paid', 'complete', 'completed', 'success', 'active']
    if (status && !validStatuses.includes(status.toLowerCase())) {
      return res.status(200).json({
        message: 'Webhook recebido mas transação não aprovada',
        status: status
      })
    }

    // Verificar se o produto existe
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name')
      .eq('id', membershipProductId)
      .single()

    if (productError || !product) {
      return res.status(404).json({
        error: `Produto com ID ${membershipProductId} não encontrado`,
        details: productError?.message
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

      if (!currentProductIds.includes(membershipProductId)) {
        const updatedProductIds = [...currentProductIds, membershipProductId]

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
          message: 'Produto adicionado ao usuário existente',
          user_email: email,
          product_added: product.name
        })
      } else {
        console.log(`Usuário ${email} já possui o produto ${product.name}`)

        return res.status(200).json({
          success: true,
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
          product_ids: [membershipProductId]
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
    // Por enquanto, apenas retornar (para testes você pode ver a senha temporária)
    return res.status(201).json({
      success: true,
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
