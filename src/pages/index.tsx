import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const user = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (user) {
      router.push('/home')
    } else {
      router.push('/login')
    }
  }, [router])

  return null
}
