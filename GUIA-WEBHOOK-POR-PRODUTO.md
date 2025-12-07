# 🎯 Guia: Webhook por Produto (CartPanda)

## ✨ Como Funciona

Cada produto tem sua **própria URL de webhook exclusiva**. Quando o CartPanda faz uma venda, ele envia o webhook para a URL específica do produto, e o sistema automaticamente:

1. ✅ Identifica o produto pela URL
2. ✅ Cria o usuário (ou atualiza se já existir)
3. ✅ Libera acesso ao produto específico
4. ✅ Gera senha temporária
5. ✅ (Opcional) Remove acesso em caso de cancelamento/reembolso

---

## 🔧 Passo a Passo: Configurar Webhook do Produto

### 1️⃣ Acesse o Gerenciamento do Produto

1. Vá para: **http://localhost:3000/admin**
2. Faça login
3. Clique em **"Produtos"**
4. Clique no produto que deseja configurar

### 2️⃣ Gere a URL do Webhook

Na página do produto, você verá a seção **"Configuração de Webhook"**:

- Se ainda não tem URL: Clique em **"Gerar URL"**
- Se já tem URL: Use o botão **"Copiar"** para copiar a URL

**Exemplo de URL gerada:**
```
http://localhost:3000/api/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

Em produção seria algo como:
```
https://seu-dominio.com/api/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### 3️⃣ Configure as Plataformas

Ainda na página do produto, habilite as plataformas que deseja usar:

- ✅ **CartPanda** (100% funcional)
- 🔨 Hotmart (em desenvolvimento)
- 🔨 Yampi (em desenvolvimento)
- 🔨 Kiwify (em desenvolvimento)

**Marque apenas as plataformas que você vai usar!**

### 4️⃣ (Opcional) Habilite Remoção de Acesso

Se quiser que o sistema remova automaticamente o acesso do usuário quando receber webhooks de:
- Cancelamento
- Reembolso
- Chargeback

Marque a opção: **"Habilitar Remoção de Acesso"**

### 5️⃣ Salve as Configurações

Clique em **"Salvar Configurações de Webhook"**

---

## 🧪 Testando o Webhook do Produto

### Opção 1: Hoppscotch (Online)

1. Acesse: **https://hoppscotch.io/**
2. Configure:
   - **Method**: `POST`
   - **URL**: `COLE_A_URL_DO_WEBHOOK_DO_PRODUTO` (a que você copiou)
3. Headers:
   - `Content-Type: application/json`
4. Body (Raw JSON):
```json
{
  "customer_email": "teste@email.com",
  "customer_name": "João Teste",
  "customer_phone": "+5511999999999",
  "status": "approved"
}
```

5. Clique em **Send**

**Importante:** Note que você **NÃO precisa** enviar o `membership_product_id`! O sistema identifica automaticamente o produto pela URL do webhook!

### Opção 2: Script Automatizado

Use o script que criei, mas com a URL específica do produto:

```bash
# Sintaxe:
curl -X POST "URL_DO_WEBHOOK_DO_PRODUTO" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "teste@email.com",
    "customer_name": "João Teste",
    "status": "approved"
  }'
```

**Exemplo real:**
```bash
curl -X POST "http://localhost:3000/api/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "teste@email.com",
    "customer_name": "João Teste",
    "customer_phone": "+5511999999999",
    "status": "approved"
  }'
```

---

## ✅ Respostas Esperadas

### ✅ Sucesso - Novo Usuário Criado (201)
```json
{
  "success": true,
  "action": "user_created",
  "message": "Usuário criado com sucesso",
  "user_email": "teste@email.com",
  "product": "Nome do Produto",
  "temp_password": "abc123XY"
}
```

### ✅ Sucesso - Produto Adicionado ao Usuário (200)
```json
{
  "success": true,
  "action": "access_granted",
  "message": "Produto adicionado ao usuário existente",
  "user_email": "teste@email.com",
  "product_added": "Nome do Produto"
}
```

### ✅ Usuário Já Tem Acesso (200)
```json
{
  "success": true,
  "action": "already_has_access",
  "message": "Usuário já possui acesso a este produto",
  "user_email": "teste@email.com"
}
```

### ✅ Acesso Removido (200)
```json
{
  "success": true,
  "action": "access_removed",
  "message": "Acesso ao produto removido",
  "user_email": "teste@email.com",
  "product": "Nome do Produto"
}
```

---

## 🔍 Estrutura do Payload CartPanda

O webhook do CartPanda deve enviar os seguintes campos:

### Campos Obrigatórios:
- `customer_email` - Email do cliente
- `customer_name` - Nome completo do cliente

### Campos Opcionais:
- `customer_phone` - Telefone do cliente
- `status` ou `event_type` - Status da transação
  - Valores válidos para **APROVAR**: `approved`, `paid`, `complete`, `completed`, `success`, `active`
  - Valores que **REMOVEM ACESSO**: `cancelled`, `refunded`, `chargeback`, `canceled`, `refund`

### Exemplo Completo:
```json
{
  "customer_email": "cliente@email.com",
  "customer_name": "Maria da Silva",
  "customer_phone": "+5511987654321",
  "status": "approved"
}
```

---

## 🌐 Configurando no CartPanda (Produção)

### 1. No painel do CartPanda:

1. Acesse as configurações do produto
2. Procure por "Webhook" ou "Integração"
3. Cole a URL do webhook do produto
4. Configure para enviar nos eventos:
   - ✅ Compra aprovada
   - ✅ (Opcional) Cancelamento
   - ✅ (Opcional) Reembolso

### 2. Para testes locais com ngrok:

Se quiser testar webhooks reais do CartPanda na sua máquina local:

```bash
# Instale ngrok: https://ngrok.com/
ngrok http 3000
```

Isso gera uma URL pública tipo:
```
https://abc123.ngrok.io
```

Use essa URL no CartPanda:
```
https://abc123.ngrok.io/api/webhook/SEU_WEBHOOK_SECRET
```

---

## 🎯 Múltiplos Produtos

Você pode ter **vários produtos**, cada um com sua própria URL:

**Produto A (Curso de Python):**
```
https://seu-dominio.com/api/webhook/produto-a-secret-123
```

**Produto B (Mentoria Premium):**
```
https://seu-dominio.com/api/webhook/produto-b-secret-456
```

**Produto C (Ebook):**
```
https://seu-dominio.com/api/webhook/produto-c-secret-789
```

Cada webhook identifica automaticamente o produto e libera o acesso correto!

---

## 🔒 Segurança

- ✅ Cada produto tem um **secret único** (UUID v4)
- ✅ Impossível adivinhar a URL de outro produto
- ✅ Apenas plataformas habilitadas são aceitas
- ✅ Validação de status da transação

---

## 🚨 Troubleshooting

### "Invalid webhook secret"
- O secret na URL está incorreto
- Gere uma nova URL no painel do produto

### "Platform not enabled for this product"
- Você esqueceu de habilitar a plataforma (ex: CartPanda)
- Vá na página do produto e marque a plataforma
- Salve as configurações

### "Email é obrigatório"
- O CartPanda não está enviando o campo `customer_email`
- Verifique a configuração do webhook no painel do CartPanda

### "Nome é obrigatório"
- O CartPanda não está enviando o campo `customer_name`
- Verifique a configuração do webhook no painel do CartPanda

---

## 📊 Monitoramento

Para ver os logs do webhook:

1. No terminal onde o servidor está rodando (`npm run dev`)
2. Procure por mensagens tipo:
```
Webhook recebido para produto Nome do Produto: { ... }
Produto Nome do Produto adicionado ao usuário email@example.com
```

---

**Tudo pronto! Agora você pode:**
1. ✅ Criar quantos produtos quiser
2. ✅ Cada um com sua URL única de webhook
3. ✅ Configurar no CartPanda
4. ✅ Testar antes de colocar em produção
5. ✅ Controlar remoção automática de acesso
