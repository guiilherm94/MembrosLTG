import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    // Buscar a aula original
    const { data: originalLesson, error: fetchError } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !originalLesson) {
      return res.status(404).json({ error: 'Aula não encontrada' })
    }

    // Buscar o maior order_index do módulo para adicionar a cópia no final
    const { data: lessons } = await supabaseAdmin
      .from('lessons')
      .select('order_index')
      .eq('module_id', originalLesson.module_id)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrderIndex = lessons && lessons.length > 0 ? lessons[0].order_index : 0

    // Criar a cópia da aula
    const { data: newLesson, error: insertError } = await supabaseAdmin
      .from('lessons')
      .insert({
        module_id: originalLesson.module_id,
        name: `${originalLesson.name} (Cópia)`,
        order_index: maxOrderIndex + 1,
        video_url: originalLesson.video_url,
        video_type: originalLesson.video_type,
        description: originalLesson.description,
        files: originalLesson.files || []
      })
      .select()
      .single()

    if (insertError) {
      return res.status(400).json({ error: insertError.message })
    }

    return res.status(201).json(newLesson)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao duplicar aula' })
  }
}
