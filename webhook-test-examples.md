# 🧪 Guia de Testes - Webhook CartPanda

## 📍 URLs dos Endpoints

### Desenvolvimento (Local)
```
http://localhost:3000/api/webhook/cartpanda
```

### Produção
```
https://seu-dominio.com/api/webhook/cartpanda
```

---

## 🔑 Como Descobrir o ID do Produto

1. Acesse o painel admin: `/admin`
2. Vá em "Produtos"
3. Edite um produto existente
4. O ID aparece na URL ou nos detalhes do produto
5. Copie o ID (formato UUID, ex: `550e8400-e29b-41d4-a716-446655440000`)

---

## 📦 Payload de Exemplo - CartPanda

### Cenário 1: Nova Compra Aprovada
```json
{
  "customer_email": "joao.teste@email.com",
  "customer_name": "João da Silva Teste",
  "customer_phone": "+5511987654321",
  "membership_product_id": "COLE_AQUI_O_ID_DO_PRODUTO",
  "status": "approved"
}
```

### Cenário 2: Compra com Status Diferente
```json
{
  "customer_email": "maria.teste@email.com",
  "customer_name": "Maria Santos Teste",
  "customer_phone": "+5511912345678",
  "membership_product_id": "COLE_AQUI_O_ID_DO_PRODUTO",
  "status": "paid"
}
```

### Cenário 3: Cliente Sem Telefone
```json
{
  "customer_email": "cliente.semtelefone@email.com",
  "customer_name": "Cliente Sem Telefone",
  "membership_product_id": "COLE_AQUI_O_ID_DO_PRODUTO",
  "status": "completed"
}
```

---

## 🛠️ Testando com Ferramentas Online

### Opção 1: Hoppscotch (Mais Fácil)

1. Acesse: https://hoppscotch.io/
2. Configure:
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/api/webhook/cartpanda` (ou sua URL de produção)
   - **Headers**:
     - Adicione: `Content-Type: application/json`
   - **Body**:
     - Selecione "Raw"
     - Cole um dos payloads de exemplo acima (substituindo o ID do produto)
3. Clique em **Send**
4. Veja a resposta no painel inferior

### Opção 2: Reqbin

1. Acesse: https://reqbin.com/
2. Configure:
   - Selecione `POST`
   - Cole a URL do webhook
   - Em "Content", selecione "JSON"
   - Cole o payload
3. Clique em "Send"

### Opção 3: Postman Web

1. Acesse: https://web.postman.co/ (precisa criar conta grátis)
2. Crie uma nova Request
3. Configure método como POST
4. Cole a URL
5. Em "Body", selecione "raw" e "JSON"
6. Cole o payload
7. Clique em "Send"

---

## 💻 Testando com cURL (Terminal)

### Teste Básico
```bash
curl -X POST http://localhost:3000/api/webhook/cartpanda \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "teste@email.com",
    "customer_name": "Teste Webhook",
    "customer_phone": "+5511999999999",
    "membership_product_id": "COLE_AQUI_O_ID_DO_PRODUTO",
    "status": "approved"
  }'
```

### Teste com Arquivo JSON
```bash
# Crie um arquivo test-payload.json com o payload
# Depois execute:
curl -X POST http://localhost:3000/api/webhook/cartpanda \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

## ✅ Respostas Esperadas

### ✅ Sucesso - Novo Usuário Criado (Status 201)
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user_email": "teste@email.com",
  "product": "Nome do Produto",
  "temp_password": "abc123XY"
}
```

### ✅ Sucesso - Produto Adicionado a Usuário Existente (Status 200)
```json
{
  "success": true,
  "message": "Produto adicionado ao usuário existente",
  "user_email": "teste@email.com",
  "product_added": "Nome do Produto"
}
```

### ✅ Usuário Já Tem Acesso (Status 200)
```json
{
  "success": true,
  "message": "Usuário já possui acesso a este produto",
  "user_email": "teste@email.com"
}
```

### ❌ Erro - Produto Não Encontrado (Status 404)
```json
{
  "error": "Produto com ID abc123 não encontrado",
  "details": "..."
}
```

### ❌ Erro - Campos Obrigatórios Faltando (Status 400)
```json
{
  "error": "Email é obrigatório no webhook"
}
```

---

## 🔍 Como Verificar se Funcionou

### 1. Verifique os Logs do Servidor
No terminal onde o servidor está rodando, você verá:
```
Webhook recebido: {
  "customer_email": "teste@email.com",
  ...
}
Novo usuário criado: teste@email.com com produto Nome do Produto
```

### 2. Verifique no Banco de Dados (Admin Panel)
1. Acesse `/admin/users`
2. Procure pelo email do teste
3. Verifique se o usuário foi criado
4. Verifique se o produto está associado

### 3. Teste o Login
1. Vá para a página de login
2. Use o email do teste
3. Use a senha temporária que foi retornada no JSON de resposta
4. Deve conseguir logar e ver o produto

---

## 🚨 Troubleshooting

### Problema: "Produto não encontrado"
- ✅ Verifique se você colou o ID correto do produto
- ✅ Verifique se o produto existe no banco (painel admin)

### Problema: "Method not allowed"
- ✅ Certifique-se de usar POST, não GET

### Problema: Connection refused / Timeout
- ✅ Verifique se o servidor está rodando (`npm run dev`)
- ✅ Verifique se a URL está correta (porta 3000 para local)

### Problema: "Email é obrigatório"
- ✅ Verifique se o JSON está bem formatado
- ✅ Verifique se o campo `customer_email` está presente

---

## 🌐 Testando Localmente com Túnel (Ngrok)

Se quiser que o CartPanda envie webhooks reais para sua máquina local:

```bash
# Instale ngrok: https://ngrok.com/
ngrok http 3000
```

Isso irá gerar uma URL pública (ex: `https://abc123.ngrok.io`) que você pode usar no painel do CartPanda.

---

## 📝 Próximos Passos

Após testar e confirmar que funciona:

1. ✅ Configure o webhook real no painel do CartPanda
2. ✅ Implemente envio de email com credenciais (linha 170 do código)
3. ✅ Remova o `temp_password` da resposta em produção (linha 178)
4. ✅ Configure logs mais robustos
5. ✅ Adicione tratamento de erros mais específicos

---

**Dica**: Comece testando com Hoppscotch ou cURL localmente antes de configurar o webhook real no CartPanda!
