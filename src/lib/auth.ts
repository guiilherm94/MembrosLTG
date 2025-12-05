import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function loginUser(email: string, password: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return { error: 'Credenciais inválidas' }
  }

  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    return { error: 'Credenciais inválidas' }
  }

  const { password_hash, ...userWithoutPassword } = user

  return { user: userWithoutPassword }
}

export async function registerUser(email: string, password: string, fullName: string, phone?: string) {
  const existingUser = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser.data) {
    return { error: 'Email já cadastrado' }
  }

  const passwordHash = await hashPassword(password)

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone,
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar usuário' }
  }

  const { password_hash, ...userWithoutPassword } = data

  return { user: userWithoutPassword }
}

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  const { password_hash, ...userWithoutPassword } = data
  return userWithoutPassword
}
