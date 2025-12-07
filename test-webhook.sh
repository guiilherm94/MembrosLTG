#!/bin/bash

# Script de teste do webhook CartPanda
# Como usar: ./test-webhook.sh SEU_PRODUCT_ID

PRODUCT_ID=$1

if [ -z "$PRODUCT_ID" ]; then
  echo "❌ Erro: Informe o ID do produto"
  echo "Uso: ./test-webhook.sh SEU_PRODUCT_ID"
  echo ""
  echo "Para descobrir o ID do produto:"
  echo "1. Acesse http://localhost:3000/admin"
  echo "2. Vá em Produtos"
  echo "3. Copie o ID do produto"
  exit 1
fi

echo "🚀 Testando webhook do CartPanda..."
echo "📦 Produto ID: $PRODUCT_ID"
echo ""

# Gerar email aleatório para cada teste
RANDOM_EMAIL="teste$(date +%s)@email.com"

echo "📧 Email de teste: $RANDOM_EMAIL"
echo ""

# Enviar requisição
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/webhook/cartpanda \
  -H "Content-Type: application/json" \
  -d "{
    \"customer_email\": \"$RANDOM_EMAIL\",
    \"customer_name\": \"João Teste Webhook\",
    \"customer_phone\": \"+5511999999999\",
    \"membership_product_id\": \"$PRODUCT_ID\",
    \"status\": \"approved\"
  }")

# Separar body e status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo "📊 Status HTTP: $HTTP_CODE"
echo "📄 Resposta:"
echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
echo ""

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Sucesso! Usuário criado/atualizado"

  # Extrair senha temporária se existir
  TEMP_PASSWORD=$(echo "$HTTP_BODY" | jq -r '.temp_password // empty' 2>/dev/null)

  if [ -n "$TEMP_PASSWORD" ]; then
    echo ""
    echo "🔑 Credenciais de Login:"
    echo "   Email: $RANDOM_EMAIL"
    echo "   Senha: $TEMP_PASSWORD"
    echo ""
    echo "🌐 Teste o login em: http://localhost:3000/login"
  fi
else
  echo "❌ Erro no webhook!"
fi
