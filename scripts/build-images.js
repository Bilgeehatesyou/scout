const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const CONFIG = [
  { dir: 'img/home/slider', maxW: 1440, quality: 80 },
  { dir: 'img/home/carousel', maxW: 720, quality: 80 },
  { dir: 'img/home/gallery', maxW: 960, quality: 80 },
  { dir: 'img/events', maxW: 1440, quality: 80 },
  { dir: 'img/history', maxW: 1440, quality: 80 },
  { dir: 'img/program', maxW: 960, quality: 80 },
];

const SINGLE = [
  { file: 'img/home/homescreen.jpg', maxW: 1920, quality: 80 },
  { file: 'img/home/landscape_break.jpg', maxW: 1920, quality: 80 },
  { file: 'img/home/30jil_jamboree.jpg', maxW: 1920, quality: 80 },
  { file: 'img/home/oluulaa_gadaa_alhah.jpg', maxW: 1440, quality: 80 },
  { file: 'img/home/oluulaa_alhaj_bna.jpg', maxW: 800, quality: 80 },
  { file: 'img/home/temdegt.jpg', maxW: 800, quality: 80 },
  { file: 'img/home/gadaa_jagssan.jpg', maxW: 800, quality: 80 },
  { file: 'img/home/udirdagch_surgalt.jpg', maxW: 800, quality: 80 },
];

async function processFile(inputPath, maxW, quality) {
  const outputPath = inputPath.replace(/\.(jpg|jpeg)$/i, '.webp');
  const meta = await sharp(inputPath).metadata();
  const targetW = Math.min(meta.width, maxW);
  const beforeSize = fs.statSync(inputPath).size;
  await sharp(inputPath)
    .resize(targetW, null, { withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
  const afterSize = fs.statSync(outputPath).size;
  return { file: path.basename(inputPath), before: beforeSize, after: afterSize, saved: beforeSize - afterSize, targetW };
}

async function main() {
  let totalSaved = 0;
  let totalProcessed = 0;

  for (const { dir, maxW, quality } of CONFIG) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.match(/\.jpg$/i));

    for (const file of files) {
      const inputPath = path.join(dir, file);
      try {
        const result = await processFile(inputPath, maxW, quality);
        totalSaved += result.saved;
        totalProcessed++;
        const savedPct = result.saved > 0 ? `-${Math.round(result.saved / result.before * 100)}%` : `+${Math.round(Math.abs(result.saved) / result.before * 100)}%`;
        console.log(`${result.file}: ${Math.round(result.before / 1024)}KB → ${Math.round(result.after / 1024)}KB (${savedPct}, resized to ${result.targetW}w)`);
      } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
      }
    }
  }

  for (const { file, maxW, quality } of SINGLE) {
    if (!fs.existsSync(file)) continue;
    try {
      const result = await processFile(file, maxW, quality);
      totalSaved += result.saved;
      totalProcessed++;
      const savedPct = result.saved > 0 ? `-${Math.round(result.saved / result.before * 100)}%` : `+${Math.round(Math.abs(result.saved) / result.before * 100)}%`;
      console.log(`${result.file}: ${Math.round(result.before / 1024)}KB → ${Math.round(result.after / 1024)}KB (${savedPct}, resized to ${result.targetW}w)`);
    } catch (e) {
      console.error(`Error processing ${file}: ${e.message}`);
    }
  }

  console.log(`\nTotal: ${totalProcessed} images, saved ${Math.round(totalSaved / 1024)}KB (${Math.round(totalSaved / 1024 / 1024 * 100) / 100}MB)`);
}

main().catch(console.error);
