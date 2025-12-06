/**
 * Verifica se um conteúdo está liberado baseado na liberação progressiva (drip content)
 */

interface UnlockStatus {
  isUnlocked: boolean
  unlockDate: Date | null
  daysRemaining: number
}

/**
 * Calcula se o conteúdo está liberado
 * @param grantedAt Data que o usuário ganhou acesso ao produto
 * @param unlockAfterDays Número de dias após a compra para liberar
 * @returns Status de liberação do conteúdo
 */
export function calculateUnlockStatus(
  grantedAt: string | Date | null,
  unlockAfterDays: number = 0
): UnlockStatus {
  // Se não há unlock_after_days ou é 0, libera imediatamente
  if (!unlockAfterDays || unlockAfterDays === 0) {
    return {
      isUnlocked: true,
      unlockDate: null,
      daysRemaining: 0
    }
  }

  // Se não tem data de acesso, não libera
  if (!grantedAt) {
    return {
      isUnlocked: false,
      unlockDate: null,
      daysRemaining: unlockAfterDays
    }
  }

  const grantedDate = new Date(grantedAt)
  const unlockDate = new Date(grantedDate)
  unlockDate.setDate(unlockDate.getDate() + unlockAfterDays)

  const now = new Date()
  const isUnlocked = now >= unlockDate

  // Calcula dias restantes
  const diffTime = unlockDate.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return {
    isUnlocked,
    unlockDate,
    daysRemaining: Math.max(0, daysRemaining)
  }
}

/**
 * Formata a data de liberação para exibição
 */
export function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
