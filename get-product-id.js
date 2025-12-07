const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name')
    .limit(3);

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log('\n📦 Produtos disponíveis:\n');
  data.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   ID: ${p.id}\n`);
  });
}

getProducts();
