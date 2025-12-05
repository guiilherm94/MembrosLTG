import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const Plyr = dynamic(() => import('plyr-react'), { ssr: false })

interface Lesson {
  id: string
  name: string
  order_index: number
  video_url: string
  video_type: string
  description: string
  files: any[]
  duration: string
  completed?: boolean
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
  description: string
  modules: Module[]
}

export default function CoursePage() {
  const router = useRouter()
  const { id } = router.query

  const [product, setProduct] = useState<Product | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'files'>('description')
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!id) return

    const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    loadProduct(id as string)
  }, [id, router])

  const loadProduct = async (productId: string) => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (!userData) return

    const user = JSON.parse(userData)

    const { data } = await supabase
      .from('products')
      .select(`
        *,
        modules (
          *,
          lessons (*)
        )
      `)
      .eq('id', productId)
      .single()

    if (data) {
      const allLessonIds = data.modules.flatMap((m: Module) => m.lessons.map((l: Lesson) => l.id))

      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('lesson_id', allLessonIds)

      const completedIds = new Set(completedLessons?.map(cl => cl.lesson_id) || [])

      const sortedModules = data.modules
        .sort((a: Module, b: Module) => a.order_index - b.order_index)
        .map((module: Module) => ({
          ...module,
          lessons: module.lessons
            .sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
            .map((lesson: Lesson) => ({
              ...lesson,
              completed: completedIds.has(lesson.id)
            }))
        }))

      const productData = { ...data, modules: sortedModules }
      setProduct(productData)

      if (sortedModules[0]?.lessons[0]) {
        setCurrentLesson(sortedModules[0].lessons[0])
        setExpandedModules(new Set([sortedModules[0].id]))
      }
    }

    setLoading(false)
  }

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const markAsCompleted = async (lessonId: string) => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (!userData) return

    const user = JSON.parse(userData)

    await supabase
      .from('lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString()
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary text-xl">Carregando...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Curso não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-primary/10 text-primary border border-primary rounded text-sm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Curso Completo
            </button>
            <Link href="/home" className="text-white hover:text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 flex flex-col">
          {currentLesson && (
            <>
              <div className="bg-black aspect-video">
                {currentLesson.video_type === 'youtube' && currentLesson.video_url && (
                  <iframe
                    src={currentLesson.video_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {currentLesson.video_type === 'drive-video' && currentLesson.video_url && (
                  <iframe
                    src={currentLesson.video_url}
                    className="w-full h-full"
                    allow="autoplay"
                    allowFullScreen
                  />
                )}
                {!currentLesson.video_url && (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                    <div className="text-center">
                      <svg className="w-24 h-24 text-zinc-700 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-500">Sem vídeo disponível</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-zinc-950 overflow-auto">
                <div className="max-w-4xl mx-auto p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-4 border-b border-zinc-800">
                      <button
                        onClick={() => setActiveTab('description')}
                        className={`px-4 py-2 font-semibold transition ${
                          activeTab === 'description'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Descrição
                      </button>
                      <button
                        onClick={() => setActiveTab('files')}
                        className={`px-4 py-2 font-semibold transition ${
                          activeTab === 'files'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Arquivos
                      </button>
                    </div>
                  </div>

                  {activeTab === 'description' && (
                    <div className="prose prose-invert max-w-none">
                      {currentLesson.description ? (
                        <div dangerouslySetInnerHTML={{ __html: currentLesson.description }} />
                      ) : (
                        <p className="text-gray-400">Sem descrição disponível</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'files' && (
                    <div className="space-y-3">
                      {currentLesson.files && currentLesson.files.length > 0 ? (
                        currentLesson.files.map((file: any, index: number) => (
                          <a
                            key={index}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded hover:border-primary transition group"
                          >
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold group-hover:text-primary">{file.name || 'Download'}</span>
                          </a>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-8">Nenhum arquivo disponível</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="w-96 bg-zinc-900 border-l border-zinc-800 overflow-auto">
          <div className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
            <h3 className="font-bold text-sm uppercase text-gray-400">FASE-1</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">7/7</span>
              <button className="text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="divide-y divide-zinc-800">
            {product.modules.map((module) => (
              <div key={module.id}>
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800 transition"
                >
                  <span className="font-semibold text-sm">{module.name}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedModules.has(module.id) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedModules.has(module.id) && (
                  <div className="bg-zinc-950">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentLesson(lesson)
                          markAsCompleted(lesson.id)
                        }}
                        className={`w-full px-6 py-3 text-left hover:bg-zinc-800 transition border-l-2 ${
                          currentLesson?.id === lesson.id
                            ? 'border-primary bg-zinc-800'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">{lesson.name}</p>
                            <p className="text-xs text-gray-500">{lesson.duration || '00:00'}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
