import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    // Buscar o módulo original com todas as aulas
    const { data: originalModule, error: fetchError } = await supabaseAdmin
      .from('modules')
      .select(`
        *,
        lessons (*)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !originalModule) {
      return res.status(404).json({ error: 'Módulo não encontrado' })
    }

    // Buscar o maior order_index do produto para adicionar a cópia no final
    const { data: modules } = await supabaseAdmin
      .from('modules')
      .select('order_index')
      .eq('product_id', originalModule.product_id)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrderIndex = modules && modules.length > 0 ? modules[0].order_index : 0

    // Criar a cópia do módulo
    const { data: newModule, error: insertModuleError } = await supabaseAdmin
      .from('modules')
      .insert({
        product_id: originalModule.product_id,
        name: `${originalModule.name} (Cópia)`,
        order_index: maxOrderIndex + 1
      })
      .select()
      .single()

    if (insertModuleError || !newModule) {
      return res.status(400).json({ error: insertModuleError?.message || 'Erro ao criar módulo' })
    }

    // Duplicar todas as aulas do módulo original
    if (originalModule.lessons && originalModule.lessons.length > 0) {
      const lessonsToInsert = originalModule.lessons.map((lesson: any, index: number) => ({
        module_id: newModule.id,
        name: lesson.name,
        order_index: index,
        video_url: lesson.video_url,
        video_type: lesson.video_type,
        description: lesson.description,
        files: lesson.files || []
      }))

      const { error: insertLessonsError } = await supabaseAdmin
        .from('lessons')
        .insert(lessonsToInsert)

      if (insertLessonsError) {
        // Se falhar ao criar aulas, deletar o módulo criado
        await supabaseAdmin.from('modules').delete().eq('id', newModule.id)
        return res.status(400).json({ error: 'Erro ao duplicar aulas do módulo' })
      }
    }

    return res.status(201).json(newModule)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao duplicar módulo' })
  }
}
