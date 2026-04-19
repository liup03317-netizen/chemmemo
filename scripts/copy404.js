import { copyFile } from 'fs/promises';
import { join } from 'path';

async function main() {
  const distDir = join(process.cwd(), 'dist');
  await copyFile(join(distDir, 'index.html'), join(distDir, '404.html'));
  console.log('404.html copied successfully');
}

main().catch(console.error);
