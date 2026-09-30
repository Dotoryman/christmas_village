import { copyFile, mkdir } from 'node:fs/promises';
const destination = new URL('../ios/ChristmasVillage/Web/', import.meta.url);
await mkdir(destination, { recursive: true });
await copyFile(new URL('../dist-ios/index.html', import.meta.url), new URL('index.html', destination));
console.log('Updated ios/ChristmasVillage/Web/index.html');
