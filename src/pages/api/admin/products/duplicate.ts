import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    // Buscar o produto original com todos os módulos e aulas
    const { data: originalProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        modules (
          *,
          lessons (*)
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !originalProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    // Criar a cópia do produto
    const { data: newProduct, error: insertProductError } = await supabaseAdmin
      .from('products')
      .insert({
        name: `${originalProduct.name} (Cópia)`,
        description: originalProduct.description,
        banner_url: originalProduct.banner_url,
        sale_url: originalProduct.sale_url,
        is_active: false, // Deixar inativo por padrão
        webhook_secret: null, // Não copiar webhook secret
        enabled_platforms: originalProduct.enabled_platforms || [],
        enable_access_removal: originalProduct.enable_access_removal || false
      })
      .select()
      .single()

    if (insertProductError || !newProduct) {
      return res.status(400).json({ error: insertProductError?.message || 'Erro ao criar produto' })
    }

    // Duplicar todos os módulos e aulas
    if (originalProduct.modules && originalProduct.modules.length > 0) {
      for (const originalModule of originalProduct.modules) {
        // Criar cópia do módulo
        const { data: newModule, error: insertModuleError } = await supabaseAdmin
          .from('modules')
          .insert({
            product_id: newProduct.id,
            name: originalModule.name,
            order_index: originalModule.order_index
          })
          .select()
          .single()

        if (insertModuleError || !newModule) {
          // Se falhar, deletar o produto criado
          await supabaseAdmin.from('products').delete().eq('id', newProduct.id)
          return res.status(400).json({ error: 'Erro ao duplicar módulos' })
        }

        // Duplicar todas as aulas do módulo
        if (originalModule.lessons && originalModule.lessons.length > 0) {
          const lessonsToInsert = originalModule.lessons.map((lesson: any) => ({
            module_id: newModule.id,
            name: lesson.name,
            order_index: lesson.order_index,
            video_url: lesson.video_url,
            video_type: lesson.video_type,
            description: lesson.description,
            files: lesson.files || []
          }))

          const { error: insertLessonsError } = await supabaseAdmin
            .from('lessons')
            .insert(lessonsToInsert)

          if (insertLessonsError) {
            // Se falhar, deletar o produto criado
            await supabaseAdmin.from('products').delete().eq('id', newProduct.id)
            return res.status(400).json({ error: 'Erro ao duplicar aulas' })
          }
        }
      }
    }

    return res.status(201).json(newProduct)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao duplicar produto' })
  }
}
