const sharp = require('sharp');
const path = require('path');

const sizes = [16, 32, 48];
const inputSvg = path.join(__dirname, '../docs/public/logo.svg');
const outputDir = path.join(__dirname, '../docs/public');

async function generateFavicons() {
  try {
    // 生成PNG文件
    for (const size of sizes) {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}.png`));
      console.log(`Generated icon-${size}.png`);
    }
    
    // 生成ICO文件（使用32x32作为基础）
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));
    
    console.log('Generated favicon.ico');
    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();