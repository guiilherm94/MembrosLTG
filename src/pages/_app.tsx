import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { themes } from '@/lib/themes'

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState('green')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.color_scheme) {
          setTheme(data.color_scheme)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const currentTheme = themes[theme as keyof typeof themes]
    if (currentTheme) {
      document.documentElement.style.setProperty('--color-primary', currentTheme.primary)
      document.documentElement.style.setProperty('--color-primary-dark', currentTheme.primaryDark)
      document.documentElement.style.setProperty('--color-primary-light', currentTheme.primaryLight)
    }
  }, [theme])

  return <Component {...pageProps} />
}
