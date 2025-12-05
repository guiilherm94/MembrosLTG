import type { NextApiRequest, NextApiResponse } from 'next'
import { registerUser } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, fullName, phone } = req.body

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, senha e nome completo são obrigatórios' })
  }

  const result = await registerUser(email, password, fullName, phone)

  if (result.error) {
    return res.status(400).json({ error: result.error })
  }

  return res.status(201).json({ user: result.user })
}
