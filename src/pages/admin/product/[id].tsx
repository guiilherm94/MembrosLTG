import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

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
    name: '',
    orderIndex: 0
  })

  const [lessonForm, setLessonForm] = useState({
    name: '',
    orderIndex: 0,
    videoUrl: '',
    description: '',
    files: '',
    duration: ''
  })

  const [filesList, setFilesList] = useState<Array<{ name: string; url: string }>>([])
  const [newFileName, setNewFileName] = useState('')
  const [newFileUrl, setNewFileUrl] = useState('')

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
          ...moduleForm
        })
      })
    } else {
      await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          ...moduleForm
        })
      })
    }

    setShowModuleModal(false)
    setEditingModule(null)
    setModuleForm({ name: '', orderIndex: 0 })
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
          orderIndex: lessonForm.orderIndex,
          videoUrl: lessonForm.videoUrl,
          description: lessonForm.description,
          files: filesList,
          duration: lessonForm.duration
        })
      })
    } else {
      await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          name: lessonForm.name,
          orderIndex: lessonForm.orderIndex,
          videoUrl: lessonForm.videoUrl,
          description: lessonForm.description,
          files: filesList,
          duration: lessonForm.duration
        })
      })
    }

    setShowLessonModal(false)
    setEditingLesson(null)
    setLessonForm({ name: '', orderIndex: 0, videoUrl: '', description: '', files: '', duration: '' })
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
      name: module.name,
      orderIndex: module.order_index
    })
    setShowModuleModal(true)
  }

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFilesList(lesson.files || [])
    setLessonForm({
      name: lesson.name,
      orderIndex: lesson.order_index,
      videoUrl: lesson.video_url || '',
      description: lesson.description || '',
      files: '',
      duration: lesson.duration || ''
    })
    setShowLessonModal(true)
  }

  const openNewLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId)
    setEditingLesson(null)
    setFilesList([])
    setNewFileName('')
    setNewFileUrl('')
    const module = product?.modules.find(m => m.id === moduleId)
    setLessonForm({
      name: '',
      orderIndex: module?.lessons.length || 0,
      videoUrl: '',
      description: '',
      files: '',
      duration: ''
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Módulos e Aulas</h2>
          <button
            onClick={() => {
              setEditingModule(null)
              setModuleForm({ name: '', orderIndex: product.modules.length })
              setShowModuleModal(true)
            }}
            className="px-4 py-2 bg-primary text-black rounded font-semibold hover:bg-primary-dark transition"
          >
            + Novo Módulo
          </button>
        </div>

        <div className="space-y-4">
          {product.modules.map((module) => (
            <div key={module.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{module.name}</h3>
                  <p className="text-sm text-gray-400">{module.lessons.length} aulas</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openNewLesson(module.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    + Aula
                  </button>
                  <button
                    onClick={() => openEditModule(module)}
                    className="px-3 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Deletar
                  </button>
                </div>
              </div>

              {module.lessons.length > 0 && (
                <div className="divide-y divide-zinc-800">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="px-6 py-3 flex items-center justify-between hover:bg-zinc-800/50">
                      <div className="flex-1">
                        <p className="font-semibold">{lesson.name}</p>
                        <div className="flex gap-4 text-xs text-gray-400 mt-1">
                          <span>{lesson.duration || '00:00'}</span>
                          {lesson.video_url && <span>• Vídeo</span>}
                          {lesson.files?.length > 0 && <span>• {lesson.files.length} arquivos</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditLesson(lesson)}
                          className="px-3 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
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
              <div>
                <label className="block text-sm font-semibold mb-2">Ordem</label>
                <input
                  type="number"
                  value={moduleForm.orderIndex}
                  onChange={(e) => setModuleForm({ ...moduleForm, orderIndex: parseInt(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                  min="0"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Ordem</label>
                  <input
                    type="number"
                    value={lessonForm.orderIndex}
                    onChange={(e) => setLessonForm({ ...lessonForm, orderIndex: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Duração (ex: 05:30)</label>
                  <input
                    type="text"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
                    placeholder="00:00"
                  />
                </div>
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
