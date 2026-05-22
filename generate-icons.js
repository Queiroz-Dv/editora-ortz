// generate-icons.js
// Gera os ícones PNG necessários para o PWA a partir da logo existente
// Execute com: node generate-icons.js
// Requer: npm install sharp

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE = path.join(__dirname, 'public/images/design-mode/Logo-W.png');
const OUTPUT_DIR = path.join(__dirname, 'public/icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
  console.log('Gerando ícones PWA...');
  for (const size of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 13, g: 13, b: 13, alpha: 1 }
      }
    })
    .composite([{
      input: await sharp(SOURCE)
        .resize(Math.round(size * 0.7), Math.round(size * 0.7), {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer(),
      gravity: 'centre'
    }])
    .png()
    .toFile(outputPath);
    console.log(`  ✓ icon-${size}x${size}.png`);
  }
  console.log('Concluído!');
}

generateIcons().catch(console.error);
