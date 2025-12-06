import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        modules (
          *,
          lessons (*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name, description, bannerUrl, saleUrl } = req.body

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([
        {
          name,
          description,
          banner_url: bannerUrl,
          sale_url: saleUrl,
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
    const { id, name, description, bannerUrl, saleUrl, isActive, enabledPlatforms, enableAccessRemoval } = req.body

    const updateData: any = {
      name,
      description,
      banner_url: bannerUrl,
      sale_url: saleUrl,
      updated_at: new Date().toISOString(),
    }

    if (isActive !== undefined) updateData.is_active = isActive
    if (enabledPlatforms !== undefined) updateData.enabled_platforms = enabledPlatforms
    if (enableAccessRemoval !== undefined) updateData.enable_access_removal = enableAccessRemoval

    const { data, error } = await supabaseAdmin
      .from('products')
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
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Produto deletado' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
