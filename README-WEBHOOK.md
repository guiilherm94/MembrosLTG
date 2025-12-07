# 📘 Sistema de Webhooks - Documentação Completa

## 🎯 Visão Geral

Este sistema permite que plataformas de pagamento (CartPanda, Hotmart, etc.) criem automaticamente usuários e liberem acesso a produtos específicos através de webhooks.

**Principais características:**
- ✅ Cada produto tem sua própria URL de webhook exclusiva
- ✅ Suporte para múltiplas plataformas (CartPanda, Hotmart, Yampi, Kiwify)
- ✅ Criação automática de usuários
- ✅ Liberação automática de acesso ao produto
- ✅ Remoção automática de acesso (opcional)
- ✅ Segurança através de UUID secreto único por produto

---

## 📚 Documentação Disponível

### 1. **GUIA-WEBHOOK-POR-PRODUTO.md** 📖
Guia completo passo a passo explicando:
- Como o sistema funciona
- Como gerar a URL do webhook de cada produto
- Como configurar plataformas habilitadas
- Como testar o webhook
- Como configurar no CartPanda
- Troubleshooting completo

**Comece por aqui!** 👈

### 2. **COMO-TESTAR-WEBHOOK.md** 🧪
Guia focado em testes, com:
- 3 formas diferentes de testar (Hoppscotch, Postman, cURL)
- Exemplos de payloads
- Respostas esperadas
- Como verificar se funcionou
- Ngrok para testes com CartPanda real

### 3. **webhook-test-examples.md** 📝
Documentação técnica detalhada com:
- Exemplos de payloads para diferentes cenários
- Todos os formatos suportados
- Troubleshooting avançado
- Múltiplas formas de teste

---

## 🚀 Quick Start

### Para Testar Rapidamente:

#### Método 1: Interface Web (Mais Fácil)

1. Acesse: **http://localhost:3000/admin**
2. Clique no produto que deseja configurar
3. Na seção "Configuração de Webhook":
   - Clique em **"Gerar URL"** (se ainda não tiver)
   - Clique em **"Copiar"** para copiar a URL
   - Habilite **"CartPanda"**
   - Clique em **"Salvar Configurações"**
4. Vá para: **https://hoppscotch.io/**
5. Configure:
   - Method: `POST`
   - URL: Cole a URL que você copiou
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "customer_email": "teste@email.com",
     "customer_name": "João Teste",
     "status": "approved"
   }
   ```
6. Clique em **Send**

#### Método 2: Script Automatizado (Terminal)

```bash
# 1. Copie a URL do webhook do produto no admin
# 2. Execute:
./test-webhook-produto.sh "http://localhost:3000/api/webhook/SEU-SECRET-AQUI"
```

---

## 🔧 Arquivos de Teste

### Scripts Shell:

- **`test-webhook-produto.sh`** - Script para testar com URL específica do produto
- **`test-webhook.sh`** - Script antigo (deprecated, use o acima)

### Payloads de Exemplo:

- **`test-payload-cartpanda.json`** - Payload de exemplo para CartPanda

### Utilitários:

- **`get-product-id.js`** - Script para listar produtos e IDs (útil para debugging)

---

## 📍 Endpoints de Webhook

### 1. Webhook por Produto (RECOMENDADO) ✅

```
POST /api/webhook/{webhook_secret}
```

**Como funciona:**
- Cada produto tem um `webhook_secret` único (UUID)
- O produto é identificado automaticamente pela URL
- Não precisa enviar `product_id` no payload

**Exemplo:**
```bash
POST http://localhost:3000/api/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Payload:**
```json
{
  "customer_email": "cliente@email.com",
  "customer_name": "João Silva",
  "status": "approved"
}
```

### 2. Webhook CartPanda (Alternativo)

```
POST /api/webhook/cartpanda
```

**Requer `membership_product_id` no payload:**
```json
{
  "customer_email": "cliente@email.com",
  "customer_name": "João Silva",
  "membership_product_id": "UUID_DO_PRODUTO",
  "status": "approved"
}
```

---

## 🎯 Fluxo Completo

```
CartPanda Venda
     ↓
Envia Webhook para URL do Produto
     ↓
Sistema recebe webhook
     ↓
Valida plataforma habilitada
     ↓
Valida status da transação
     ↓
Verifica se usuário existe
     ↓
┌─────────────────┬─────────────────┐
│ Usuário Novo    │ Usuário Existe  │
├─────────────────┼─────────────────┤
│ Cria usuário    │ Adiciona produto│
│ Gera senha temp │ ao usuário      │
│ Associa produto │                 │
└─────────────────┴─────────────────┘
     ↓
Retorna resposta com credenciais
     ↓
(Opcional) Envia email com credenciais
```

---

## ✅ Status de Transação

### Status que LIBERAM acesso:
- `approved`
- `paid`
- `complete`
- `completed`
- `success`
- `active`

### Status que REMOVEM acesso (se habilitado):
- `cancelled`
- `canceled`
- `refunded`
- `refund`
- `chargeback`

---

## 🔒 Segurança

1. **Webhook Secret Único:** Cada produto tem um UUID v4 único
2. **Validação de Plataforma:** Apenas plataformas habilitadas são aceitas
3. **Validação de Status:** Apenas status válidos processam ações
4. **Remoção Opcional:** Remoção de acesso é opt-in, não automática

---

## 🌐 Ambiente de Produção

### Configuração do CartPanda:

1. No painel do CartPanda, configure o webhook do produto
2. Use a URL gerada no painel admin:
   ```
   https://seu-dominio.com/api/webhook/{webhook_secret}
   ```
3. Configure para enviar em:
   - ✅ Compra aprovada
   - ✅ Cancelamento (se quiser remoção automática)
   - ✅ Reembolso (se quiser remoção automática)

### Variáveis de Ambiente:

Certifique-se de configurar no servidor de produção:
```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Invalid webhook secret" | Verifique se a URL está correta, gere nova URL se necessário |
| "Platform not enabled" | Habilite a plataforma na página do produto |
| "Email é obrigatório" | CartPanda não está enviando o campo `customer_email` |
| "Nome é obrigatório" | CartPanda não está enviando o campo `customer_name` |
| Connection refused | Verifique se `npm run dev` está rodando |
| 404 Not Found | URL do webhook está incorreta |

---

## 📊 Logs e Monitoramento

Os logs aparecem no terminal onde o servidor está rodando:

```
Webhook recebido para produto Curso de Python: { ... }
Novo usuário criado: teste@email.com com produto Curso de Python
```

ou

```
Produto Curso de Python adicionado ao usuário teste@email.com
```

---

## 🔄 Próximos Passos

Após configurar e testar:

1. ✅ Configure o webhook no painel do CartPanda
2. ✅ Implemente envio de email com credenciais
3. ✅ Configure logs mais robustos (ex: Sentry)
4. ✅ (Opcional) Adicione mais plataformas (Hotmart, etc.)

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Leia primeiro: **GUIA-WEBHOOK-POR-PRODUTO.md**
2. Consulte a seção de Troubleshooting
3. Verifique os logs do servidor

---

**Boa sorte! 🚀**
