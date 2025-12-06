import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { productId, name, orderIndex, unlockAfterDays } = req.body

    const { data, error } = await supabaseAdmin
      .from('modules')
      .insert([
        {
          product_id: productId,
          name,
          order_index: orderIndex,
          unlock_after_days: unlockAfterDays || 0,
        },
      ])
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json(data)
  }

  if (req.method === 'PUT') {
    const { id, name, orderIndex, unlockAfterDays } = req.body

    const updateData: any = {
      name,
      order_index: orderIndex,
      updated_at: new Date().toISOString(),
    }

    if (unlockAfterDays !== undefined) updateData.unlock_after_days = unlockAfterDays

    const { data, error } = await supabaseAdmin
      .from('modules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query

    const { error } = await supabaseAdmin
      .from('modules')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Módulo deletado' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
