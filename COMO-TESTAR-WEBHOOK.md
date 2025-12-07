# 🧪 Como Testar o Webhook CartPanda - GUIA RÁPIDO

## ⚡ Passo 1: Pegar o ID do Produto

1. Acesse: http://localhost:3000/admin
2. Faça login
3. Clique em "Produtos"
4. **Copie o ID de qualquer produto** (será um UUID tipo: `a1b2c3d4-e5f6-...`)

---

## 🚀 Passo 2: Escolha UMA das formas abaixo para testar

### **OPÇÃO 1: Hoppscotch (100% Online - RECOMENDADO)**

1. Abra: **https://hoppscotch.io/**

2. Configure assim:
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/api/webhook/cartpanda`

3. Clique em "Headers" e adicione:
   - **Key**: `Content-Type`
   - **Value**: `application/json`

4. Clique em "Body" → Selecione "Raw"

5. Cole este JSON (SUBSTITUA O ID DO PRODUTO):
```json
{
  "customer_email": "teste@email.com",
  "customer_name": "João Teste Webhook",
  "customer_phone": "+5511999999999",
  "membership_product_id": "COLE_AQUI_O_ID_DO_PRODUTO",
  "status": "approved"
}
```

6. Clique em **Send**

7. ✅ Se funcionou, você verá uma resposta tipo:
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user_email": "teste@email.com",
  "product": "Nome do Produto",
  "temp_password": "abc123XY"
}
```

---

### **OPÇÃO 2: Postman (Desktop ou Web)**

Se você já usa Postman:

1. Abra o Postman
2. Crie uma nova Request (POST)
3. URL: `http://localhost:3000/api/webhook/cartpanda`
4. Headers: `Content-Type: application/json`
5. Body → Raw → JSON:
```json
{
  "customer_email": "teste2@email.com",
  "customer_name": "Maria Teste",
  "membership_product_id": "ID_DO_PRODUTO",
  "status": "approved"
}
```
6. Send

---

### **OPÇÃO 3: cURL (Terminal/Linha de Comando)**

Se você prefere usar o terminal:

```bash
curl -X POST http://localhost:3000/api/webhook/cartpanda \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "teste3@email.com",
    "customer_name": "Pedro Teste",
    "customer_phone": "+5511988888888",
    "membership_product_id": "COLE_AQUI_O_ID",
    "status": "approved"
  }'
```

**Ou usando o arquivo JSON:**

1. Edite o arquivo `test-payload-cartpanda.json`
2. Substitua o ID do produto
3. Execute:
```bash
curl -X POST http://localhost:3000/api/webhook/cartpanda \
  -H "Content-Type: application/json" \
  -d @test-payload-cartpanda.json
```

---

## ✅ Como Verificar se Funcionou

### 1. Olhe a Resposta do Webhook
Se retornar algo assim, funcionou:
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "temp_password": "xyz789AB"
}
```

### 2. Verifique no Admin
1. Acesse: http://localhost:3000/admin/users
2. Procure pelo email que você usou no teste
3. Deve aparecer o usuário criado com o produto associado

### 3. Teste o Login
1. Vá em: http://localhost:3000/login
2. Use o email do teste
3. Use a senha temporária que foi retornada
4. Deve conseguir fazer login!

---

## 🌐 Testando com o CartPanda Real

Quando estiver tudo funcionando localmente, você pode usar **ngrok** para testar com o CartPanda de verdade:

```bash
# Instale ngrok: https://ngrok.com/download
ngrok http 3000
```

Isso vai gerar uma URL pública tipo: `https://abc123.ngrok.io`

Use essa URL no painel do CartPanda:
```
https://abc123.ngrok.io/api/webhook/cartpanda
```

---

## 🐛 Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Connection refused" | Certifique-se que `npm run dev` está rodando |
| "Produto não encontrado" | Verifique se o ID do produto está correto |
| "Email é obrigatório" | Verifique se o JSON está bem formatado |
| "Method not allowed" | Use POST, não GET |

---

## 📋 Checklist Rápido

- [ ] Servidor rodando (`npm run dev`)
- [ ] ID do produto copiado do painel admin
- [ ] Ferramenta de teste escolhida (Hoppscotch recomendado)
- [ ] JSON montado com os dados de teste
- [ ] Webhook enviado
- [ ] Resposta recebida com sucesso
- [ ] Usuário aparece no painel `/admin/users`
- [ ] Login funciona com a senha temporária

---

**💡 Dica Final**: Use emails diferentes em cada teste para simular usuários novos. Se usar o mesmo email, o sistema vai adicionar o produto ao usuário existente (o que também é esperado!).
