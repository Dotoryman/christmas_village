import sharp from 'sharp';
import { stat } from 'node:fs/promises';
// Optional light-off PNG inputs are local ImageGen exports. Existing WebP plates
// are committed, so contributors can build without regenerating the artwork.
const files = [
  ['.local/artwork/outside-mobile.png', 'src/assets/outside.webp'],
  ['.local/artwork/inside-mobile.png', 'src/assets/inside.webp'],
  ['.local/artwork/outside-off.png', 'src/assets/outside-off.webp'],
  ['.local/artwork/inside-off.png', 'src/assets/inside-off.webp'],
];
for (const [source, target] of files) {
  try {
    await stat(source);
  } catch {
    console.log(`Keeping committed plate ${target}; optional ${source} is absent.`);
    continue;
  }
  await sharp(source).webp({ quality: 88, effort: 6 }).toFile(target);
  console.log(`${target}: ${Math.round((await stat(target)).size / 1024)} KB`);
}
