# KRONOS - Sistema de Área de Membros

Sistema completo de área de membros com painel administrativo.

## Configuração

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente (.env):
```
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
SUPABASE_SERVICE_ROLE_KEY=sua_service_key
```

3. Executar schema SQL no Supabase:
```bash
Execute o arquivo supabase-schema.sql no SQL Editor do Supabase
```

4. Rodar projeto:
```bash
npm run dev
```

## Deploy Vercel

```bash
vercel
```

Configure as variáveis de ambiente no painel da Vercel.

## Estrutura

- `/login` - Login de alunos
- `/register` - Registro de alunos
- `/home` - Área do aluno (lista de cursos)
- `/course/[id]` - Visualização de curso com player
- `/admin` - Painel administrativo (gestão de produtos e usuários)
- `/admin/product/[id]` - Gestão de módulos e aulas
- `/api/webhook/cartpanda` - Webhook para integração Cartpanda