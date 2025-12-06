import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useSettings } from '@/hooks/useSettings'
import { getDriveDirectView } from '@/lib/media-converter'
import ThemeToggle from '@/components/ThemeToggle'

interface Product {
  id: string
  name: string
  description: string
  banner_url: string
  sale_url: string
  modules: any[]
}

interface User {
  id: string
  email: string
  full_name: string
  product_ids: string[]
}

export default function Home() {
  const router = useRouter()
  const { settings } = useSettings()
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    // Buscar dados atualizados do usuário do banco
    loadUserFromDatabase(parsedUser.id)
  }, [router])

  const loadUserFromDatabase = async (userId: string) => {
    // Buscar dados atualizados do usuário
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, full_name, product_ids')
      .eq('id', userId)
      .single()

    if (error || !userData) {
      // Se houver erro, usar dados do cache
      const cachedUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}')
      setUser(cachedUser)
      loadProducts(cachedUser.product_ids || [], cachedUser.id)
      return
    }

    // Atualizar usuário com dados frescos do banco
    setUser(userData)

    // Atualizar cache com dados novos
    const updatedUserData = JSON.stringify(userData)
    sessionStorage.setItem('user', updatedUserData)
    localStorage.setItem('user', updatedUserData)

    loadProducts(userData.product_ids || [], userData.id)
  }

  const loadProducts = async (userProductIds: string[], userId: string) => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        modules (
          id,
          name,
          order_index,
          lessons (
            id,
            name
          )
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (data) {
      setProducts(data)
      await calculateAllProgress(data, userId)
    }
    setLoading(false)
  }

  const calculateAllProgress = async (productsData: Product[], userId: string) => {
    const progressMap: Record<string, number> = {}

    for (const product of productsData) {
      const totalLessons = product.modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0)

      if (totalLessons === 0) {
        progressMap[product.id] = 0
        continue
      }

      const allLessonIds = product.modules.flatMap(module =>
        module.lessons?.map((lesson: any) => lesson.id) || []
      )

      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true)
        .in('lesson_id', allLessonIds)

      const completedCount = completedLessons?.length || 0
      progressMap[product.id] = Math.round((completedCount / totalLessons) * 100)
    }

    setProgress(progressMap)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getProgress = (productId: string) => {
    return progress[productId] || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary text-xl">Carregando...</div>
      </div>
    )
  }

  const userProducts = products.filter(p => user?.product_ids?.includes(p.id))
  const lockedProducts = products.filter(p => !user?.product_ids?.includes(p.id))

  return (
    <div className="min-h-screen bg-black">
      {/* Menu lateral */}
      <div className={`fixed inset-0 z-50 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-72 bg-zinc-900 border-r border-zinc-800 transform transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-bold">{settings?.system_name || 'LowzinGO - Membros'}</h2>
            <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="p-4">
            <Link href="/home" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-zinc-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-semibold">Home</span>
            </Link>
            <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-zinc-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-semibold">Meu Perfil</span>
            </Link>
            <Link href="/suporte" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-zinc-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-semibold">Suporte</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-zinc-800 transition text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold">Sair</span>
            </button>
          </nav>
        </div>
      </div>

      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => setMenuOpen(true)} className="text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {settings?.logo_url ? (
              <img
                src={settings.logo_url.includes('drive.google.com') ? getDriveDirectView(settings.logo_url) : settings.logo_url}
                alt="Logo"
                className="h-10 w-auto object-contain max-w-[200px]"
              />
            ) : (
              <h1 className="text-2xl font-black text-primary">{settings?.system_name || 'LowzinGO - Membros'}</h1>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/home" className="text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            <button onClick={handleLogout} className="text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {settings?.banner_url && (
          <div className="mb-12 rounded-lg overflow-hidden">
            <img
              src={settings.banner_url.includes('drive.google.com') ? getDriveDirectView(settings.banner_url) : settings.banner_url}
              alt="Banner"
              className="w-full h-auto max-h-[400px] object-cover"
            />
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-semibold">{settings?.system_name || 'LowzinGO - Membros'} ®</h2>
          </div>
          <p className="text-sm text-gray-400">Área de Membros Premium</p>
        </div>

        {userProducts.length > 0 && (
          <section className="mb-16">
            <h3 className="text-2xl font-bold mb-6">Meus Cursos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userProducts.map((product) => {
                const productProgress = getProgress(product.id)
                return (
                  <Link
                    key={product.id}
                    href={`/course/${product.id}`}
                    className="group block bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-primary transition"
                  >
                    {product.banner_url ? (
                      <div className="aspect-video bg-zinc-800 overflow-hidden">
                        <img
                          src={product.banner_url.includes('drive.google.com') ? getDriveDirectView(product.banner_url) : product.banner_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-zinc-800 flex items-center justify-center text-6xl font-black text-zinc-700">
                        {product.name.charAt(0)}
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-bold text-sm mb-2 line-clamp-2">{product.name}</h4>
                      <div className="mb-2">
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${productProgress}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{productProgress}%</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {lockedProducts.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold mb-6">Cursos Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lockedProducts.map((product) => (
                <div key={product.id} className="relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 opacity-60 group">
                  {product.banner_url ? (
                    <div className="aspect-video bg-zinc-800 overflow-hidden">
                      <img
                        src={product.banner_url.includes('drive.google.com') ? getDriveDirectView(product.banner_url) : product.banner_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-zinc-800 flex items-center justify-center text-6xl font-black text-zinc-700">
                      {product.name.charAt(0)}
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-sm mb-2 line-clamp-2">{product.name}</h4>
                    <div className="mb-2">
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-700" style={{ width: '0%' }} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">0%</p>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 group-hover:bg-black/80 transition">
                    <svg className="w-12 h-12 text-gray-500 mb-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    {product.sale_url && (
                      <a
                        href={product.sale_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-primary text-black font-bold rounded hover:bg-primary-dark transition"
                      >
                        Adquirir Acesso
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span>{settings?.system_name || 'LowzinGO - Membros'} ® 2025 Todos direitos reservados</span>
          </div>
          {(settings?.instagram_url || settings?.whatsapp_url || settings?.youtube_url) && (
            <div className="mt-2 flex items-center justify-center gap-4">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {settings?.whatsapp_url && (
                <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </footer>
      </main>
    </div>
  )
}
