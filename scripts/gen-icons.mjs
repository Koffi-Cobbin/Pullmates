import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, 'public', 'logo.png');
const appDir = path.join(root, 'app');
const publicDir = path.join(root, 'public');

const icoSizes = [16, 32, 48];

async function main() {
  // Temp PNGs for multi-size ICO
  const tmpDir = path.join(root, '.tmp-icons');
  await fs.mkdir(tmpDir, { recursive: true });
  const tmpFiles = [];
  for (const size of icoSizes) {
    const file = path.join(tmpDir, `icon-${size}.png`);
    await sharp(src)
      .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
      .png()
      .toFile(file);
    tmpFiles.push(file);
  }

  const icoBuf = await pngToIco(tmpFiles);
  await fs.writeFile(path.join(appDir, 'favicon.ico'), icoBuf);

  // Next.js App Router icons
  await sharp(src)
    .resize(512, 512, { fit: 'cover', kernel: 'lanczos3' })
    .png()
    .toFile(path.join(appDir, 'icon.png'));

  await sharp(src)
    .resize(180, 180, { fit: 'cover', kernel: 'lanczos3' })
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));

  // Public icons for manifest / general use
  for (const size of [192, 512]) {
    await sharp(src)
      .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
      .png()
      .toFile(path.join(publicDir, `icon-${size}.png`));
  }

  await fs.rm(tmpDir, { recursive: true, force: true });

  const icoStat = await fs.stat(path.join(appDir, 'favicon.ico'));
  console.log(
    `OK favicon.ico=${icoStat.size}B sizes=[${icoSizes.join(',')}] icon.png apple-icon.png icon-192.png icon-512.png`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
