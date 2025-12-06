import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, email, full_name, current_password, new_password } = req.body

  if (!userId || !email || !full_name) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando' })
  }

  try {
    // Buscar usuário atual
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Preparar dados para atualização
    const updateData: any = {
      email,
      full_name,
      updated_at: new Date().toISOString()
    }

    // Se estiver alterando senha
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Senha atual é necessária' })
      }

      // Verificar senha atual
      const isPasswordValid = await bcrypt.compare(current_password, user.password_hash)
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha atual incorreta' })
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(new_password, 10)
      updateData.password_hash = hashedPassword
    }

    // Atualizar usuário
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      return res.status(400).json({ error: updateError.message })
    }

    return res.status(200).json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        product_ids: updatedUser.product_ids
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
