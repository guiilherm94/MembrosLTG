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

# PWA Push Notifications (gere com: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_publica_vapid
VAPID_PRIVATE_KEY=sua_chave_privada_vapid
VAPID_SUBJECT=mailto:seu_email@exemplo.com
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
- `/admin/notifications` - Painel de notificações push
- `/api/webhook/cartpanda` - Webhook para integração Cartpanda

## PWA (Progressive Web App)

Este sistema é um PWA completo com suporte a:
- Instalação no dispositivo
- Funcionamento offline
- Notificações push

### Configurando Notificações Push

1. **Gerar chaves VAPID:**
```bash
npx web-push generate-vapid-keys
```

2. **Adicionar as chaves ao arquivo `.env`:**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
VAPID_SUBJECT=mailto:seuemail@exemplo.com
```

3. **Executar as migrations do banco:**
Execute o arquivo `migration-add-push-subscriptions.sql` no SQL Editor do Supabase.

4. **Enviar notificações:**
- Acesse `/admin/notifications` no painel admin
- Escreva o título e mensagem
- Clique em "Enviar" para disparar para todos os usuários inscritos

### Como Trocar os Ícones do PWA

O sistema vem com um ícone SVG padrão. Para usar seus próprios ícones:

#### Opção 1: Usar SVG Personalizado

1. Substitua o arquivo `public/icons/icon.svg` pelo seu ícone SVG
2. Gere as versões PNG usando um dos métodos abaixo

#### Opção 2: Gerar PNGs Online (Recomendado)

1. Acesse [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Faça upload do arquivo `public/icons/icon.svg`
3. Configure para **192x192** pixels e baixe como `icon-192.png`
4. Repita o processo configurando para **512x512** pixels e baixe como `icon-512.png`
5. Coloque ambos os arquivos em `public/icons/`

#### Opção 3: Gerar PNGs com Node.js

1. Instale a dependência sharp:
```bash
npm install sharp
```

2. Execute o script de geração:
```bash
node scripts/generate-icons.js
```

#### Opção 4: Usar PNGs Diretamente

Se você já tem arquivos PNG prontos:

1. Coloque seus ícones em `public/icons/`:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)
2. Opcionalmente, mantenha o `icon.svg` para navegadores que suportam SVG

**Nota:** Os ícones devem ter fundo transparente ou fundo sólido dependendo do design do seu app.

### Testando o PWA

1. **Em desenvolvimento:**
   - O PWA está desabilitado em modo dev
   - Para testar, faça build e rode em produção:
   ```bash
   npm run build
   npm start
   ```

2. **Em produção (Vercel):**
   - Após o deploy, acesse o site em um dispositivo móvel
   - Chrome/Edge mostrará um banner "Adicionar à tela inicial"
   - Safari (iOS): clique em "Compartilhar" → "Adicionar à Tela de Início"

3. **Testar notificações:**
   - Abra o app instalado ou no navegador
   - Aceite as permissões de notificação quando solicitado
   - Vá para `/admin/notifications` e envie uma notificação teste
   - A notificação deve aparecer mesmo com o app fechado

### Arquivos do PWA

- `public/manifest.json` - Configurações do PWA
- `public/icons/` - Ícones do app
- `public/sw.js` - Service Worker customizado
- `next.config.js` - Configuração do next-pwa
- `src/hooks/usePushNotifications.ts` - Hook de notificações
- `src/components/PushNotificationPrompt.tsx` - Componente de permissão