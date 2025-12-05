import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { productId, name, orderIndex } = req.body

    const { data, error } = await supabase
      .from('modules')
      .insert([
        {
          product_id: productId,
          name,
          order_index: orderIndex,
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
    const { id, name, orderIndex } = req.body

    const { data, error } = await supabase
      .from('modules')
      .update({
        name,
        order_index: orderIndex,
        updated_at: new Date().toISOString(),
      })
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

    const { error } = await supabase
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
