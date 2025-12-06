import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabaseAuth } from '@/lib/supabase'

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
  modules?: any[]
}

export default function AdminPanel() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'settings'>('products')
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [settings, setSettings] = useState({
    systemName: 'LowzinGO - Membros',
    logoUrl: '',
    bannerUrl: '',
    colorScheme: 'green',
    whatsappUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    supportPageContent: ''
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
    saleUrl: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

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
    await Promise.all([loadUsers(), loadProducts(), loadSettings()])
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
        whatsappUrl: data.whatsapp_url || '',
        instagramUrl: data.instagram_url || '',
        youtubeUrl: data.youtube_url || '',
        supportPageContent: data.support_page_content || ''
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
    setProductForm({ name: '', description: '', bannerUrl: '', saleUrl: '' })
    loadProducts()
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente deletar este produto?')) return
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
    loadProducts()
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
      saleUrl: product.sale_url || ''
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
                  setProductForm({ name: '', description: '', bannerUrl: '', saleUrl: '' })
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

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Configurações do Site</h2>

            <form onSubmit={handleSaveSettings} className="max-w-2xl">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">URL do Logo</label>
                  <input
                    type="url"
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Logo exibido no topo da área de membros</p>
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
                  <p className="text-xs text-gray-500 mt-1">Banner exibido na home</p>
                </div>

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

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-black rounded font-semibold hover:bg-primary-dark transition"
                >
                  Salvar Configurações
                </button>
              </div>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg w-full p-6">
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg w-full p-6">
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
