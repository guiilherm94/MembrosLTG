import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, product_ids, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { email, password, fullName, phone, productIds } = req.body

    const passwordHash = await hashPassword(password)

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          full_name: fullName,
          phone,
          product_ids: productIds || [],
        },
      ])
      .select('id, email, full_name, phone, product_ids, created_at')
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json(data)
  }

  if (req.method === 'PUT') {
    const { id, email, password, fullName, phone, productIds } = req.body

    const updateData: any = {
      email,
      full_name: fullName,
      phone,
      product_ids: productIds,
      updated_at: new Date().toISOString(),
    }

    if (password) {
      updateData.password_hash = await hashPassword(password)
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, full_name, phone, product_ids, created_at')
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Usuário deletado' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
