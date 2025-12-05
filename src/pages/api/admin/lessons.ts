import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { convertMediaUrl } from '@/lib/media-converter'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { moduleId, name, orderIndex, videoUrl, description, files, duration } = req.body

    let videoType = null
    let processedVideoUrl = videoUrl

    if (videoUrl) {
      const converted = convertMediaUrl(videoUrl)
      videoType = converted.type
      processedVideoUrl = converted.embedUrl || videoUrl
    }

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .insert([
        {
          module_id: moduleId,
          name,
          order_index: orderIndex,
          video_url: processedVideoUrl,
          video_type: videoType,
          description,
          files: files || [],
          duration,
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
    const { id, name, orderIndex, videoUrl, description, files, duration } = req.body

    let videoType = null
    let processedVideoUrl = videoUrl

    if (videoUrl) {
      const converted = convertMediaUrl(videoUrl)
      videoType = converted.type
      processedVideoUrl = converted.embedUrl || videoUrl
    }

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .update({
        name,
        order_index: orderIndex,
        video_url: processedVideoUrl,
        video_type: videoType,
        description,
        files,
        duration,
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

    const { error } = await supabaseAdmin
      .from('lessons')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Aula deletada' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
