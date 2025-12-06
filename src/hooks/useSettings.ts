import { useEffect, useState } from 'react'

interface Settings {
  logo_url: string | null
  banner_url: string | null
  color_scheme: string
  system_name: string
  whatsapp_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  support_page_content: string | null
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  return { settings, loading }
}
