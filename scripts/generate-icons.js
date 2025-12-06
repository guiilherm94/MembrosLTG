/**
 * Script para gerar ícones PNG a partir do SVG
 *
 * Uso online (sem instalação):
 * 1. Acesse https://cloudconvert.com/svg-to-png
 * 2. Faça upload do arquivo public/icons/icon.svg
 * 3. Configure para 192x192 e salve como icon-192.png
 * 4. Repita para 512x512 e salve como icon-512.png
 * 5. Coloque os arquivos em public/icons/
 *
 * Uso com Node.js (requer sharp):
 * npm install sharp
 * node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    const sharp = require('sharp');

    const svgPath = path.join(__dirname, '../public/icons/icon.svg');
    const svgBuffer = fs.readFileSync(svgPath);

    // Gerar ícone 192x192
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, '../public/icons/icon-192.png'));

    console.log('✓ Ícone 192x192 gerado com sucesso');

    // Gerar ícone 512x512
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, '../public/icons/icon-512.png'));

    console.log('✓ Ícone 512x512 gerado com sucesso');
    console.log('\nÍcones PNG gerados com sucesso!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n❌ Erro: O módulo "sharp" não está instalado.');
      console.log('\nPara gerar os ícones PNG, você tem 2 opções:\n');
      console.log('Opção 1 - Online (Recomendado):');
      console.log('  1. Acesse https://cloudconvert.com/svg-to-png');
      console.log('  2. Faça upload do arquivo public/icons/icon.svg');
      console.log('  3. Configure para 192x192 e salve como icon-192.png');
      console.log('  4. Repita para 512x512 e salve como icon-512.png');
      console.log('  5. Coloque os arquivos em public/icons/\n');
      console.log('Opção 2 - Com npm:');
      console.log('  1. Execute: npm install sharp');
      console.log('  2. Execute: node scripts/generate-icons.js\n');
    } else {
      console.error('Erro ao gerar ícones:', error.message);
    }
    process.exit(1);
  }
}

generateIcons();
