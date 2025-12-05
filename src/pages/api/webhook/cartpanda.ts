import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customer_email, product_id, status } = req.body

    if (status !== 'approved' && status !== 'paid') {
      return res.status(200).json({ message: 'Status não processado' })
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', customer_email)
      .single()

    if (user) {
      const currentProducts = user.product_ids || []
      if (!currentProducts.includes(product_id)) {
        await supabase
          .from('users')
          .update({
            product_ids: [...currentProducts, product_id]
          })
          .eq('id', user.id)
      }
    }

    return res.status(200).json({ message: 'Webhook processado' })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return res.status(500).json({ error: 'Erro ao processar webhook' })
  }
}
