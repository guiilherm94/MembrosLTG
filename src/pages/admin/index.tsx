import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, supabaseAuth } from '@/lib/supabase'

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  product_ids: string[]
  created_at: string
}

interface Product {
  id: string
  name: string
  description: string
  banner_url: string
  sale_url: string
  is_active: boolean
  is_hidden?: boolean
  unlock_after_days?: number
  modules?: any[]
}

interface PushNotification {
  id: string
  title: string
  body: string
  icon: string
  badge: string
  url: string
  sent_at: string
  recipients_count: number
  success_count: number
  failure_count: number
  status: 'pending' | 'sending' | 'completed' | 'failed'
}

export default function AdminPanel() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'settings' | 'notifications'>('products')
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Estados para Notificações
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [sending, setSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [notifTitle, setNotifTitle] = useState('')
  const [notifBody, setNotifBody] = useState('')
  const [notifUrl, setNotifUrl] = useState('/home')

  // Estados para submenus das configurações
  const [expandedSection, setExpandedSection] = useState<string | null>('general')

  const [settings, setSettings] = useState({
    systemName: 'LowzinGO - Membros',
    logoUrl: '',
    bannerUrl: '',
    colorScheme: 'green',
    defaultTheme: 'dark',
    whatsappUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    supportPageContent: '',
    passwordType: 'default',
    defaultPassword: 'senha123'
  })

  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    productIds: [] as string[]
  })

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    bannerUrl: '',
    saleUrl: '',
    isActive: true,
    isHidden: false,
    unlockAfterDays: 0
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotifications()
    }
  }, [activeTab])

  const checkAuth = async () => {
    const { data: { session } } = await supabaseAuth.auth.getSession()
    if (!session) {
      router.push('/admin/login')
      return
    }
    loadData()
  }

  const handleLogout = async () => {
    await supabaseAuth.auth.signOut()
    router.push('/admin/login')
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadUsers(), loadProducts(), loadSettings(), loadNotifications()])
    setLoading(false)
  }

  const loadSettings = async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    if (data) {
      setSettings({
        systemName: data.system_name || 'LowzinGO - Membros',
        logoUrl: data.logo_url || '',
        bannerUrl: data.banner_url || '',
        colorScheme: data.color_scheme || 'green',
        defaultTheme: data.default_theme || 'dark',
        whatsappUrl: data.whatsapp_url || '',
        instagramUrl: data.instagram_url || '',
        youtubeUrl: data.youtube_url || '',
        supportPageContent: data.support_page_content || '',
        passwordType: data.password_type || 'default',
        defaultPassword: data.default_password || 'senha123'
      })
    }
  }

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data)
  }

  const loadProducts = async () => {
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    setProducts(data)
  }

  const loadNotifications = async () => {
    try {
      // Buscar contagem de inscritos - usando query diferente
      const { data: subsData, count, error: countError } = await supabase
        .from('push_subscriptions')
        .select('id', { count: 'exact' })

      if (countError) {
        console.error('Erro ao buscar contagem de inscritos:', countError)
        setSubscribersCount(0)
      } else {
        console.log('Contagem de inscritos:', count)
        setSubscribersCount(count || 0)
      }

      // Buscar histórico de notificações
      const { data, error: dataError } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (dataError) {
        console.error('Erro ao buscar notificações:', dataError)
      } else if (data) {
        setNotifications(data)
      }
    } catch (error) {
      console.error('Erro geral ao carregar notificações:', error)
    }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUser) {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          ...userForm
        })
      })
    } else {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })
    }

    setShowUserModal(false)
    setEditingUser(null)
    setUserForm({ email: '', password: '', fullName: '', phone: '', productIds: [] })
    loadUsers()
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Deseja realmente deletar este usuário?')) return
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    loadUsers()
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingProduct) {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          ...productForm
        })
      })
    } else {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      })
    }

    setShowProductModal(false)
    setEditingProduct(null)
    setProductForm({ name: '', description: '', bannerUrl: '', saleUrl: '', isActive: true, isHidden: false, unlockAfterDays: 0 })
    loadProducts()
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente deletar este produto?')) return
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
    loadProducts()
  }

  const handleDuplicateProduct = async (id: string) => {
    if (!confirm('Deseja duplicar este produto com todos os módulos e aulas?')) return

    try {
      const response = await fetch(`/api/admin/products/duplicate?id=${id}`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Produto duplicado com sucesso!')
        loadProducts()
      } else {
        alert('Erro ao duplicar produto')
      }
    } catch (error) {
      alert('Erro ao duplicar produto')
    }
  }

  const openEditUser = (user: User) => {
    setEditingUser(user)
    setUserForm({
      email: user.email,
      password: '',
      fullName: user.full_name,
      phone: user.phone || '',
      productIds: user.product_ids || []
    })
    setShowUserModal(true)
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || '',
      bannerUrl: product.banner_url || '',
      saleUrl: product.sale_url || '',
      isActive: product.is_active !== undefined ? product.is_active : true,
      isHidden: product.is_hidden || false,
      unlockAfterDays: product.unlock_after_days || 0
    })
    setShowProductModal(true)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()

    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })

    alert('Configurações salvas! Recarregue a página para ver as mudanças.')
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!notifTitle.trim() || !notifBody.trim()) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    if (subscribersCount === 0) {
      alert('Não há usuários inscritos para receber notificações')
      return
    }

    const confirmSend = confirm(
      `Deseja enviar esta notificação para ${subscribersCount} usuário(s)?`
    )

    if (!confirmSend) return

    setSending(true)

    try {
      const { data: notification, error: createError } = await supabase
        .from('push_notifications')
        .insert({
          title: notifTitle,
          body: notifBody,
          url: notifUrl,
          status: 'sending'
        })
        .select()
        .single()

      if (createError) throw createError

      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: notifTitle,
          body: notifBody,
          url: notifUrl,
          notificationId: notification.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar notificações')
      }

      setNotifTitle('')
      setNotifBody('')
      setNotifUrl('/home')

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)

      await loadNotifications()
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error)
      alert('Erro ao enviar notificação: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-primary">ADMIN PANEL</h1>
          <div className="flex gap-4">
            <button onClick={() => router.push('/home')} className="text-gray-400 hover:text-primary">
              Ver Home
            </button>
            <button onClick={handleLogout} className="text-white hover:text-red-500">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded font-semibold transition ${
              activeTab === 'products'
                ? 'bg-primary text-black'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded font-semibold transition ${
              activeTab === 'users'
                ? 'bg-primary text-black'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 rounded font-semibold transition ${
              activeTab === 'notifications'
                ? 'bg-primary text-black'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            Notificações
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-primary text-black'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            Configurações
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Produtos</h2>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setProductForm({ name: '', description: '', bannerUrl: '', saleUrl: '', isActive: true, isHidden: false, unlockAfterDays: 0 })
                  setShowProductModal(true)
                }}
                className="px-4 py-2 bg-primary text-black rounded font-semibold hover:bg-primary-dark transition"
              >
                + Novo Produto
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Módulos</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-400 line-clamp-1">{product.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{product.modules?.length || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded ${product.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => router.push(`/admin/product/${product.id}`)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Gerenciar
                        </button>
                        <button
                          onClick={() => openEditProduct(product)}
                          className="px-3 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(product.id)}
                          className="p-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                          title="Duplicar produto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Notificações Push</h2>
              <div className="text-sm">
                <span className="text-gray-400">Inscritos: </span>
                <span className="font-semibold text-primary">{subscribersCount}</span>
              </div>
            </div>

            {showSuccess && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-lg flex items-center gap-3">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-primary font-semibold">Notificação enviada com sucesso!</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulário de envio */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Enviar Nova Notificação</h3>

                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded focus:border-primary focus:outline-none"
                      placeholder="Ex: Novo conteúdo disponível!"
                      maxLength={50}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{notifTitle.length}/50 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded focus:border-primary focus:outline-none resize-none"
                      placeholder="Ex: Acabamos de adicionar uma nova aula ao curso..."
                      rows={4}
                      maxLength={200}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{notifBody.length}/200 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      URL (Opcional)
                    </label>
                    <input
                      type="text"
                      value={notifUrl}
                      onChange={(e) => setNotifUrl(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded focus:border-primary focus:outline-none"
                      placeholder="/home"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Para onde o usuário será redirecionado ao clicar
                    </p>
                  </div>

                  {/* Preview */}
                  {notifTitle && notifBody && (
                    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-950">
                      <p className="text-xs text-gray-400 mb-2">Preview:</p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary rounded flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{notifTitle}</p>
                          <p className="text-xs text-gray-400 mt-1">{notifBody}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending || subscribersCount === 0}
                    className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {sending ? 'Enviando...' : `Enviar para ${subscribersCount} usuário(s)`}
                  </button>

                  {subscribersCount === 0 && (
                    <p className="text-sm text-yellow-500 text-center">
                      ⚠️ Nenhum usuário inscrito para receber notificações
                    </p>
                  )}
                </form>
              </div>

              {/* Histórico */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Últimos 10 Envios</h3>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      Nenhuma notificação enviada ainda
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold">{notification.title}</p>
                            <p className="text-sm text-gray-400 mt-1">{notification.body}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              notification.status === 'completed'
                                ? 'bg-primary/10 text-primary'
                                : notification.status === 'failed'
                                ? 'bg-red-500/10 text-red-500'
                                : notification.status === 'sending'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-gray-500/10 text-gray-500'
                            }`}
                          >
                            {notification.status === 'completed'
                              ? 'Enviado'
                              : notification.status === 'failed'
                              ? 'Falhou'
                              : notification.status === 'sending'
                              ? 'Enviando'
                              : 'Pendente'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(notification.sent_at)}</span>
                          {notification.recipients_count > 0 && (
                            <span>
                              {notification.success_count}/{notification.recipients_count} enviados
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Configurações do Site</h2>

            <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-4">
              {/* Seção: Geral */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'general' ? null : 'general')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎨</span>
                    <h3 className="text-lg font-bold">Identidade Visual</h3>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'general' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === 'general' && (
                  <div className="px-6 pb-6 space-y-4 border-t border-zinc-800 pt-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nome do Sistema</label>
                      <input
                        type="text"
                        value={settings.systemName}
                        onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                        placeholder="LowzinGO - Membros"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nome exibido no cabeçalho e título das páginas</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">URL do Logo</label>
                      <input
                        type="url"
                        value={settings.logoUrl}
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                        placeholder="https://..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Logo exibido no topo da área de membros. Recomendado: 1080 x 1350 px (4:5)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">URL do Banner</label>
                      <input
                        type="url"
                        value={settings.bannerUrl}
                        onChange={(e) => setSettings({ ...settings, bannerUrl: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                        placeholder="https://..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Banner exibido na home. Recomendado: 1080 x 1350 px (4:5)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Seção: Aparência */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'appearance' ? null : 'appearance')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌈</span>
                    <h3 className="text-lg font-bold">Cores e Tema</h3>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'appearance' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === 'appearance' && (
                  <div className="px-6 pb-6 space-y-6 border-t border-zinc-800 pt-4">
                    <div>
                      <label className="block text-sm font-semibold mb-3">Esquema de Cores</label>
                      <div className="grid grid-cols-5 gap-3">
                        {[
                          { key: 'green', name: 'Verde Limão', color: '#a3e635' },
                          { key: 'blue', name: 'Azul Elétrico', color: '#3b82f6' },
                          { key: 'purple', name: 'Roxo Neon', color: '#a855f7' },
                          { key: 'orange', name: 'Laranja Vibrante', color: '#f97316' },
                          { key: 'pink', name: 'Rosa Cyberpunk', color: '#ec4899' },
                        ].map((theme) => (
                          <button
                            key={theme.key}
                            type="button"
                            onClick={() => setSettings({ ...settings, colorScheme: theme.key })}
                            className={`p-4 rounded-lg border-2 transition ${
                              settings.colorScheme === theme.key
                                ? 'border-white'
                                : 'border-zinc-700 hover:border-zinc-500'
                            }`}
                          >
                            <div
                              className="w-full h-12 rounded mb-2"
                              style={{ backgroundColor: theme.color }}
                            />
                            <p className="text-xs font-semibold text-center">{theme.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Tema Padrão</label>
                      <p className="text-sm text-gray-400 mb-4">Escolha o tema que será exibido por padrão para novos visitantes</p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, defaultTheme: 'dark' })}
                          className={`flex-1 p-4 rounded-lg border-2 transition ${
                            settings.defaultTheme === 'dark'
                              ? 'border-white bg-zinc-800'
                              : 'border-zinc-700 hover:border-zinc-500'
                          }`}
                        >
                          <p className="text-sm font-semibold">🌙 Modo Escuro</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, defaultTheme: 'light' })}
                          className={`flex-1 p-4 rounded-lg border-2 transition ${
                            settings.defaultTheme === 'light'
                              ? 'border-white bg-zinc-800'
                              : 'border-zinc-700 hover:border-zinc-500'
                          }`}
                        >
                          <p className="text-sm font-semibold">☀️ Modo Claro</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Seção: Redes Sociais */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'social' ? null : 'social')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌐</span>
                    <h3 className="text-lg font-bold">Redes Sociais</h3>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'social' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === 'social' && (
                  <div className="px-6 pb-6 space-y-4 border-t border-zinc-800 pt-4">
                    <p className="text-sm text-gray-400">Links que aparecem no rodapé. Deixe vazio para não exibir.</p>

                    <div>
                      <label className="block text-sm font-semibold mb-2">WhatsApp</label>
                      <input
                        type="url"
                        value={settings.whatsappUrl}
                        onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                        placeholder="https://wa.me/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Instagram</label>
                      <input
                        type="url"
                        value={settings.instagramUrl}
                        onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                        placeholder="https://instagram.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">YouTube</label>
                      <input
                        type="url"
                        value={settings.youtubeUrl}
                        onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                        placeholder="https://youtube.com/@..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Seção: Página de Suporte */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'support' ? null : 'support')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <h3 className="text-lg font-bold">Página de Suporte</h3>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'support' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === 'support' && (
                  <div className="px-6 pb-6 space-y-4 border-t border-zinc-800 pt-4">
                    <p className="text-sm text-gray-400">Conteúdo HTML que será exibido na página de suporte para os usuários.</p>
                    <textarea
                      value={settings.supportPageContent}
                      onChange={(e) => setSettings({ ...settings, supportPageContent: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 h-48 font-mono text-sm"
                      placeholder="<h2>Como podemos ajudar?</h2>&#10;<p>Entre em contato através do WhatsApp...</p>"
                    />
                    <p className="text-xs text-gray-500">Use HTML para formatar o conteúdo. Tags suportadas: h1-h6, p, ul, ol, li, a, strong, em, br</p>
                  </div>
                )}
              </div>

              {/* Seção: Webhooks e Senhas */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'webhooks' ? null : 'webhooks')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔑</span>
                    <h3 className="text-lg font-bold">Webhooks e Senhas</h3>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'webhooks' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === 'webhooks' && (
                  <div className="px-6 pb-6 space-y-4 border-t border-zinc-800 pt-4">
                    <p className="text-sm text-gray-400">Configure como as senhas serão geradas para usuários criados via webhook (CartPanda, etc.)</p>

                    <div className="space-y-4">
                      <label className="block">
                        <div className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition hover:bg-zinc-800" onClick={() => setSettings({ ...settings, passwordType: 'default' })}>
                          <input
                            type="radio"
                            name="passwordType"
                            value="default"
                            checked={settings.passwordType === 'default'}
                            onChange={(e) => setSettings({ ...settings, passwordType: e.target.value })}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">Senha Padrão (Recomendado)</p>
                            <p className="text-xs text-gray-500">Todos os usuários recebem a mesma senha configurada abaixo</p>
                          </div>
                        </div>
                      </label>

                      {settings.passwordType === 'default' && (
                        <div className="ml-8">
                          <label className="block text-sm font-semibold mb-2">Senha Padrão</label>
                          <input
                            type="text"
                            value={settings.defaultPassword}
                            onChange={(e) => setSettings({ ...settings, defaultPassword: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                            placeholder="senha123"
                          />
                          <p className="text-xs text-gray-500 mt-1">Esta será a senha de todos os novos usuários criados via webhook</p>
                        </div>
                      )}

                      <label className="block">
                        <div className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition hover:bg-zinc-800" onClick={() => setSettings({ ...settings, passwordType: 'temporary' })}>
                          <input
                            type="radio"
                            name="passwordType"
                            value="temporary"
                            checked={settings.passwordType === 'temporary'}
                            onChange={(e) => setSettings({ ...settings, passwordType: e.target.value })}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">Senha Temporária Aleatória</p>
                            <p className="text-xs text-gray-500">Gera uma senha aleatória única para cada usuário (ex: w82zmgj1FZUM)</p>
                          </div>
                        </div>
                      </label>

                      <label className="block">
                        <div className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition hover:bg-zinc-800" onClick={() => setSettings({ ...settings, passwordType: 'email' })}>
                          <input
                            type="radio"
                            name="passwordType"
                            value="email"
                            checked={settings.passwordType === 'email'}
                            onChange={(e) => setSettings({ ...settings, passwordType: e.target.value })}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">Email como Senha</p>
                            <p className="text-xs text-gray-500">Usa o email do usuário como senha (tudo em minúsculo)</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-black rounded font-semibold hover:bg-primary-dark transition"
              >
                Salvar Configurações
              </button>
            </form>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Usuários</h2>
              <button
                onClick={() => {
                  setEditingUser(null)
                  setUserForm({ email: '', password: '', fullName: '', phone: '', productIds: [] })
                  setShowUserModal(true)
                }}
                className="px-4 py-2 bg-primary text-black rounded font-semibold hover:bg-primary-dark transition"
              >
                + Novo Usuário
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Produtos</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-gray-400">{user.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.product_ids?.length || 0}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditUser(user)}
                          className="px-3 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Senha {editingUser && '(deixe vazio para não alterar)'}</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Telefone</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Produtos</label>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded p-3">
                  {products.map((product) => (
                    <label key={product.id} className="flex items-center gap-3 cursor-pointer hover:bg-zinc-700 p-2 rounded transition">
                      <input
                        type="checkbox"
                        checked={userForm.productIds.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserForm({ ...userForm, productIds: [...userForm.productIds, product.id] })
                          } else {
                            setUserForm({ ...userForm, productIds: userForm.productIds.filter(id => id !== product.id) })
                          }
                        }}
                        className="w-4 h-4 text-primary bg-zinc-900 border-zinc-600 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm">{product.name}</span>
                    </label>
                  ))}
                  {products.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">Nenhum produto disponível</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Selecione os produtos que o usuário terá acesso</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-black rounded font-semibold hover:bg-primary-dark"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Descrição</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">URL do Banner</label>
                <input
                  type="url"
                  value={productForm.bannerUrl}
                  onChange={(e) => setProductForm({ ...productForm, bannerUrl: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Recomendado: 1080 x 1350 px (4:5)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">URL de Venda</label>
                <input
                  type="url"
                  value={productForm.saleUrl}
                  onChange={(e) => setProductForm({ ...productForm, saleUrl: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                />
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-semibold">✓ Produto Ativo</span>
                    <p className="text-xs text-gray-400">Produto ativo aparece para todos os usuários</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isHidden}
                    onChange={(e) => setProductForm({ ...productForm, isHidden: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-semibold">Ocultar produto da home</span>
                    <p className="text-xs text-gray-400">Produto só aparece para quem já comprou</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">⏱️ Liberação Progressiva</label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Liberar após</span>
                  <input
                    type="number"
                    min="0"
                    value={productForm.unlockAfterDays}
                    onChange={(e) => setProductForm({ ...productForm, unlockAfterDays: parseInt(e.target.value) || 0 })}
                    className="w-20 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-center"
                  />
                  <span className="text-sm text-gray-400">dias da compra</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">(0 = libera imediatamente)</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-black rounded font-semibold hover:bg-primary-dark"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
