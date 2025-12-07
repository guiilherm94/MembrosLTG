#!/bin/bash

# Script de teste do webhook por produto (URL única)
# Como usar: ./test-webhook-produto.sh "URL_DO_WEBHOOK"

WEBHOOK_URL=$1

if [ -z "$WEBHOOK_URL" ]; then
  echo "❌ Erro: Informe a URL do webhook do produto"
  echo ""
  echo "Uso: ./test-webhook-produto.sh \"URL_DO_WEBHOOK\""
  echo ""
  echo "📍 Como pegar a URL do webhook:"
  echo "1. Acesse http://localhost:3000/admin"
  echo "2. Clique no produto"
  echo "3. Na seção 'Configuração de Webhook', clique em 'Copiar'"
  echo "4. Cole a URL aqui"
  echo ""
  echo "Exemplo:"
  echo "./test-webhook-produto.sh \"http://localhost:3000/api/webhook/abc-123-def\""
  exit 1
fi

echo "🚀 Testando webhook do produto..."
echo "📍 URL: $WEBHOOK_URL"
echo ""

# Gerar email aleatório para cada teste
RANDOM_EMAIL="teste$(date +%s)@email.com"

echo "📧 Email de teste: $RANDOM_EMAIL"
echo ""

# Enviar requisição
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"customer_email\": \"$RANDOM_EMAIL\",
    \"customer_name\": \"João Teste Webhook\",
    \"customer_phone\": \"+5511999999999\",
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
  echo "✅ Sucesso! Webhook processado"

  # Extrair informações
  ACTION=$(echo "$HTTP_BODY" | jq -r '.action // empty' 2>/dev/null)
  PRODUCT_NAME=$(echo "$HTTP_BODY" | jq -r '.product // empty' 2>/dev/null)
  TEMP_PASSWORD=$(echo "$HTTP_BODY" | jq -r '.temp_password // empty' 2>/dev/null)

  echo ""
  echo "🎯 Ação: $ACTION"

  if [ -n "$PRODUCT_NAME" ]; then
    echo "📦 Produto: $PRODUCT_NAME"
  fi

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

  # Mostrar dicas baseadas no erro
  if [ "$HTTP_CODE" -eq 404 ]; then
    echo ""
    echo "💡 Dica: URL do webhook inválida ou produto não encontrado"
    echo "   Verifique se você copiou a URL correta do painel admin"
  elif [ "$HTTP_CODE" -eq 403 ]; then
    echo ""
    echo "💡 Dica: Plataforma não habilitada"
    echo "   Vá na página do produto e habilite 'CartPanda'"
    echo "   Depois clique em 'Salvar Configurações de Webhook'"
  elif [ "$HTTP_CODE" -eq 400 ]; then
    echo ""
    echo "💡 Dica: Campos obrigatórios faltando no payload"
  fi
fi
