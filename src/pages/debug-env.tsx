export default function EnvCheck() {
  const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Verificação de Variáveis de Ambiente</h1>

      <div className="space-y-4">
        <div className="bg-zinc-900 p-4 rounded">
          <p className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL:</p>
          <p className="text-sm font-mono break-all">
            {env.supabaseUrl ? (
              <span className="text-green-500">✅ {env.supabaseUrl}</span>
            ) : (
              <span className="text-red-500">❌ NÃO CONFIGURADA</span>
            )}
          </p>
        </div>

        <div className="bg-zinc-900 p-4 rounded">
          <p className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY:</p>
          <p className="text-sm font-mono break-all">
            {env.supabaseKey ? (
              <span className="text-green-500">✅ Configurada ({env.supabaseKey.substring(0, 20)}...)</span>
            ) : (
              <span className="text-red-500">❌ NÃO CONFIGURADA</span>
            )}
          </p>
        </div>

        <div className="bg-zinc-900 p-4 rounded">
          <p className="font-semibold mb-2">SUPABASE_SERVICE_ROLE_KEY:</p>
          <p className="text-sm font-mono break-all">
            {env.serviceRole ? (
              <span className="text-green-500">✅ Configurada (server-side)</span>
            ) : (
              <span className="text-red-500">❌ NÃO CONFIGURADA</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-blue-900/20 border border-blue-500 p-4 rounded">
        <h2 className="font-bold mb-2">📝 Checklist:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Adicione as 3 variáveis na Vercel (Settings → Environment Variables)</li>
          <li>Marque Production, Preview E Development para cada uma</li>
          <li>Force novo deploy (Deployments → Redeploy)</li>
          <li>Aguarde build completar</li>
          <li>Acesse esta página novamente para verificar</li>
        </ol>
      </div>
    </div>
  )
}
