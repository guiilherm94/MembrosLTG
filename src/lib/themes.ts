export const themes = {
  green: {
    name: 'Verde Limão',
    primary: '#a3e635',
    primaryDark: '#84cc16',
    primaryLight: '#bef264',
    gradient: 'from-lime-400 to-green-500',
  },
  blue: {
    name: 'Azul Elétrico',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',
    gradient: 'from-blue-400 to-blue-600',
  },
  purple: {
    name: 'Roxo Neon',
    primary: '#a855f7',
    primaryDark: '#9333ea',
    primaryLight: '#c084fc',
    gradient: 'from-purple-400 to-purple-600',
  },
  orange: {
    name: 'Laranja Vibrante',
    primary: '#f97316',
    primaryDark: '#ea580c',
    primaryLight: '#fb923c',
    gradient: 'from-orange-400 to-orange-600',
  },
  pink: {
    name: 'Rosa Cyberpunk',
    primary: '#ec4899',
    primaryDark: '#db2777',
    primaryLight: '#f472b6',
    gradient: 'from-pink-400 to-pink-600',
  },
}

export type ThemeKey = keyof typeof themes
