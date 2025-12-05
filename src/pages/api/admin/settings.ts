import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data)
  }

  if (req.method === 'PUT') {
    const { logoUrl, bannerUrl, colorScheme } = req.body

    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('site_settings')
        .update({
          logo_url: logoUrl,
          banner_url: bannerUrl,
          color_scheme: colorScheme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return res.status(400).json({ error: error.message })
      }

      return res.status(200).json(data)
    } else {
      const { data, error } = await supabase
        .from('site_settings')
        .insert([
          {
            logo_url: logoUrl,
            banner_url: bannerUrl,
            color_scheme: colorScheme,
          },
        ])
        .select()
        .single()

      if (error) {
        return res.status(400).json({ error: error.message })
      }

      return res.status(201).json(data)
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
