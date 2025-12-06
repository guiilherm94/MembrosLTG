import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Componente Sortável para Módulos
function SortableModuleItem({ module, onEdit, onDelete, onNewLesson, children }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-primary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <div>
            <h3 className="font-bold text-lg">{module.name}</h3>
            <p className="text-sm text-gray-400">{module.lessons.length} aulas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNewLesson(module.id)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            + Aula
          </button>
          <button
            onClick={() => onEdit(module)}
            className="px-3 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(module.id)}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Deletar
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

// Componente Sortável para Aulas
function SortableLessonItem({ lesson, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="px-6 py-3 flex items-center justify-between hover:bg-zinc-800/50">
      <div className="flex items-center gap-3 flex-1">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-primary">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="font-semibold">{lesson.name}</p>
          <div className="flex gap-4 text-xs text-gray-400 mt-1">
            {lesson.video_url && <span>Vídeo</span>}
            {lesson.files?.length > 0 && <span>• {lesson.files.length} arquivos</span>}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(lesson)}
          className="px-3 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(lesson.id)}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Deletar
        </button>
      </div>
    </div>
  )
}

interface Lesson {
  id: string
  name: string
  order_index: number
  video_url: string
  description: string
  files: any[]
  duration: string
}

interface Module {
  id: string
  name: string
  order_index: number
  lessons: Lesson[]
}

interface Product {
  id: string
  name: string
  modules: Module[]
  webhook_secret?: string
  enabled_platforms?: string[]
  enable_access_removal?: boolean
}

export default function ProductManagement() {
  const router = useRouter()
  const { id } = router.query

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  const [moduleForm, setModuleForm] = useState({
    name: ''
  })

  const [lessonForm, setLessonForm] = useState({
    name: '',
    videoUrl: '',
    description: '',
    files: ''
  })

  const [filesList, setFilesList] = useState<Array<{ name: string; url: string }>>([])
  const [newFileName, setNewFileName] = useState('')
  const [newFileUrl, setNewFileUrl] = useState('')

  const [webhookConfig, setWebhookConfig] = useState({
    enabledPlatforms: [] as string[],
    enableAccessRemoval: false
  })
  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => {
    if (id) loadProduct()
  }, [id])

  const loadProduct = async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        modules (
          *,
          lessons (*)
        )
      `)
      .eq('id', id)
      .single()

    if (data) {
      const sortedModules = data.modules
        .sort((a: Module, b: Module) => a.order_index - b.order_index)
        .map((module: Module) => ({
          ...module,
          lessons: module.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
        }))

      setProduct({ ...data, modules: sortedModules })

      // Carregar configurações de webhook
      setWebhookConfig({
        enabledPlatforms: data.enabled_platforms || [],
        enableAccessRemoval: data.enable_access_removal || false
      })

      // Gerar URL do webhook
      if (data.webhook_secret) {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        setWebhookUrl(`${baseUrl}/api/webhook/${data.webhook_secret}`)
      }
    }
    setLoading(false)
  }

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingModule) {
      await fetch('/api/admin/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingModule.id,
          name: moduleForm.name,
          orderIndex: editingModule.order_index // Mantém a ordem existente
        })
      })
    } else {
      await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          name: moduleForm.name,
          orderIndex: product?.modules.length || 0 // Adiciona ao final
        })
      })
    }

    setShowModuleModal(false)
    setEditingModule(null)
    setModuleForm({ name: '' })
    loadProduct()
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Deseja deletar este módulo e todas as aulas dele?')) return
    await fetch(`/api/admin/modules?id=${moduleId}`, { method: 'DELETE' })
    loadProduct()
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingLesson) {
      await fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLesson.id,
          name: lessonForm.name,
          orderIndex: editingLesson.order_index, // Mantém a ordem existente
          videoUrl: lessonForm.videoUrl,
          description: lessonForm.description,
          files: filesList
        })
      })
    } else {
      const module = product?.modules.find(m => m.id === selectedModuleId)
      await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          name: lessonForm.name,
          orderIndex: module?.lessons.length || 0, // Adiciona ao final
          videoUrl: lessonForm.videoUrl,
          description: lessonForm.description,
          files: filesList
        })
      })
    }

    setShowLessonModal(false)
    setEditingLesson(null)
    setLessonForm({ name: '', videoUrl: '', description: '', files: '' })
    setFilesList([])
    setNewFileName('')
    setNewFileUrl('')
    loadProduct()
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Deseja deletar esta aula?')) return
    await fetch(`/api/admin/lessons?id=${lessonId}`, { method: 'DELETE' })
    loadProduct()
  }

  const openEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleForm({
      name: module.name
    })
    setShowModuleModal(true)
  }

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFilesList(lesson.files || [])
    setLessonForm({
      name: lesson.name,
      videoUrl: lesson.video_url || '',
      description: lesson.description || '',
      files: ''
    })
    setShowLessonModal(true)
  }

  const openNewLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId)
    setEditingLesson(null)
    setFilesList([])
    setNewFileName('')
    setNewFileUrl('')
    setLessonForm({
      name: '',
      videoUrl: '',
      description: '',
      files: ''
    })
    setShowLessonModal(true)
  }

  const handleAddFile = () => {
    if (newFileName.trim() && newFileUrl.trim()) {
      setFilesList([...filesList, { name: newFileName.trim(), url: newFileUrl.trim() }])
      setNewFileName('')
      setNewFileUrl('')
    }
  }

  const handleRemoveFile = (index: number) => {
    setFilesList(filesList.filter((_, i) => i !== index))
  }

  const togglePlatform = (platform: string) => {
    setWebhookConfig(prev => {
      const newPlatforms = prev.enabledPlatforms.includes(platform)
        ? prev.enabledPlatforms.filter(p => p !== platform)
        : [...prev.enabledPlatforms, platform]
      return { ...prev, enabledPlatforms: newPlatforms }
    })
  }

  const handleSaveWebhookConfig = async () => {
    if (!product) return

    await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        description: '',
        bannerUrl: '',
        saleUrl: '',
        enabledPlatforms: webhookConfig.enabledPlatforms,
        enableAccessRemoval: webhookConfig.enableAccessRemoval
      })
    })

    alert('Configurações de webhook salvas!')
    loadProduct()
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    alert('URL do webhook copiada!')
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEndModules = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && product) {
      const oldIndex = product.modules.findIndex((m) => m.id === active.id)
      const newIndex = product.modules.findIndex((m) => m.id === over.id)

      const newModules = arrayMove(product.modules, oldIndex, newIndex)

      // Atualizar order_index de cada módulo
      for (let i = 0; i < newModules.length; i++) {
        await fetch('/api/admin/modules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newModules[i].id,
            name: newModules[i].name,
            orderIndex: i
          })
        })
      }

      loadProduct()
    }
  }

  const handleDragEndLessons = async (moduleId: string, event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && product) {
      const module = product.modules.find(m => m.id === moduleId)
      if (!module) return

      const oldIndex = module.lessons.findIndex((l) => l.id === active.id)
      const newIndex = module.lessons.findIndex((l) => l.id === over.id)

      const newLessons = arrayMove(module.lessons, oldIndex, newIndex)

      // Atualizar order_index de cada aula
      for (let i = 0; i < newLessons.length; i++) {
        await fetch('/api/admin/lessons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newLessons[i].id,
            name: newLessons[i].name,
            orderIndex: i,
            videoUrl: newLessons[i].video_url,
            description: newLessons[i].description,
            files: newLessons[i].files
          })
        })
      }

      loadProduct()
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary text-xl">Carregando...</div></div>
  }

  if (!product) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white text-xl">Produto não encontrado</div></div>
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-primary">{product.name}</h1>
            <p className="text-sm text-gray-400">Gerenciar Módulos e Aulas</p>
          </div>
          <button onClick={() => router.push('/admin')} className="text-white hover:text-primary">
            Voltar
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Seção de Webhook */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Configuração de Webhook</h2>

          <div className="space-y-4">
            {/* URL do Webhook */}
            <div>
              <label className="block text-sm font-semibold mb-2">URL do Webhook</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-gray-400"
                  placeholder="Carregando..."
                />
                <button
                  onClick={copyWebhookUrl}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded font-semibold transition"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use esta URL para configurar webhooks nas plataformas habilitadas abaixo
              </p>
            </div>

            {/* Plataformas Habilitadas */}
            <div>
              <label className="block text-sm font-semibold mb-2">Plataformas Habilitadas</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['cartpanda', 'hotmart', 'yampi', 'kiwify'].map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`p-3 rounded-lg border-2 transition ${
                      webhookConfig.enabledPlatforms.includes(platform)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${
                        webhookConfig.enabledPlatforms.includes(platform)
                          ? 'bg-primary'
                          : 'bg-zinc-700'
                      }`} />
                      <span className="font-semibold capitalize">{platform}</span>
                    </div>
                    {platform === 'cartpanda' && (
                      <p className="text-xs text-gray-500 mt-1">100% Funcional</p>
                    )}
                    {platform !== 'cartpanda' && (
                      <p className="text-xs text-gray-500 mt-1">Em desenvolvimento</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Remoção de Acesso */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookConfig.enableAccessRemoval}
                  onChange={(e) => setWebhookConfig({ ...webhookConfig, enableAccessRemoval: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <span className="text-sm font-semibold">Habilitar Remoção de Acesso</span>
                  <p className="text-xs text-gray-500">
                    Remove automaticamente o acesso do usuário ao receber webhooks de cancelamento/reembolso
                  </p>
                </div>
              </label>
            </div>

            {/* Botão Salvar */}
            <button
              onClick={handleSaveWebhookConfig}
              className="px-6 py-2 bg-primary text-black rounded font-semibold hover:bg-primary-dark transition"
            >
              Salvar Configurações de Webhook
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Módulos e Aulas</h2>
          <button
            onClick={() => {
              setEditingModule(null)
              setModuleForm({ name: '' })
              setShowModuleModal(true)
            }}
            className="px-4 py-2 bg-primary text-black rounded font-semibold hover:bg-primary-dark transition"
          >
            + Novo Módulo
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndModules}
        >
          <SortableContext
            items={product.modules.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {product.modules.map((module) => (
                <SortableModuleItem
                  key={module.id}
                  module={module}
                  onEdit={openEditModule}
                  onDelete={handleDeleteModule}
                  onNewLesson={openNewLesson}
                >
                  {module.lessons.length > 0 && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEndLessons(module.id, event)}
                    >
                      <SortableContext
                        items={module.lessons.map(l => l.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="divide-y divide-zinc-800">
                          {module.lessons.map((lesson) => (
                            <SortableLessonItem
                              key={lesson.id}
                              lesson={lesson}
                              onEdit={openEditLesson}
                              onDelete={handleDeleteLesson}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </SortableModuleItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {showModuleModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">{editingModule ? 'Editar Módulo' : 'Novo Módulo'}</h3>
            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome do Módulo</label>
                <input
                  type="text"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
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

      {showLessonModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full p-6 my-8">
            <h3 className="text-xl font-bold mb-4">{editingLesson ? 'Editar Aula' : 'Nova Aula'}</h3>
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome da Aula</label>
                <input
                  type="text"
                  value={lessonForm.name}
                  onChange={(e) => setLessonForm({ ...lessonForm, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Link do Vídeo (YouTube ou Google Drive)</label>
                <input
                  type="url"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                  placeholder="https://youtube.com/... ou https://drive.google.com/..."
                />
                <p className="text-xs text-gray-500 mt-1">Cole o link de compartilhamento. O sistema converterá automaticamente.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Descrição (HTML permitido)</label>
                <textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 h-32"
                  placeholder="<p>Descrição da aula...</p>"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Arquivos para Download</label>

                {/* Lista de arquivos adicionados */}
                {filesList.length > 0 && (
                  <div className="mb-3 space-y-2 max-h-48 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded p-3">
                    {filesList.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-zinc-900 p-2 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{file.name}</p>
                          <p className="text-xs text-gray-500 truncate">{file.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="flex-shrink-0 p-1 text-red-500 hover:bg-red-500/20 rounded"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulário para adicionar novo arquivo */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFile())}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                      placeholder="Nome do arquivo"
                    />
                    <input
                      type="url"
                      value={newFileUrl}
                      onChange={(e) => setNewFileUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFile())}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFile}
                    disabled={!newFileName.trim() || !newFileUrl.trim()}
                    className="w-full px-3 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-gray-600 rounded text-sm font-semibold transition"
                  >
                    + Adicionar Arquivo
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Links do Google Drive serão convertidos automaticamente para download direto
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
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
