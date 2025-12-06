import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, supabaseAdmin } from '@/lib/supabase'

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
    const { systemName, logoUrl, bannerUrl, colorScheme, defaultTheme, whatsappUrl, instagramUrl, youtubeUrl, supportPageContent } = req.body

    const { data: existing } = await supabaseAdmin
      .from('site_settings')
      .select('id')
      .single()

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (systemName !== undefined) updateData.system_name = systemName
    if (logoUrl !== undefined) updateData.logo_url = logoUrl
    if (bannerUrl !== undefined) updateData.banner_url = bannerUrl
    if (colorScheme !== undefined) updateData.color_scheme = colorScheme
    if (defaultTheme !== undefined) updateData.default_theme = defaultTheme
    if (whatsappUrl !== undefined) updateData.whatsapp_url = whatsappUrl
    if (instagramUrl !== undefined) updateData.instagram_url = instagramUrl
    if (youtubeUrl !== undefined) updateData.youtube_url = youtubeUrl
    if (supportPageContent !== undefined) updateData.support_page_content = supportPageContent

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return res.status(400).json({ error: error.message })
      }

      return res.status(200).json(data)
    } else {
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .insert([
          {
            system_name: systemName || 'LowzinGO - Membros',
            logo_url: logoUrl,
            banner_url: bannerUrl,
            color_scheme: colorScheme || 'green',
            whatsapp_url: whatsappUrl,
            instagram_url: instagramUrl,
            youtube_url: youtubeUrl,
            support_page_content: supportPageContent,
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
