import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { COPY_FILES, copyDirectories } from './static-site.mjs';

const root = process.cwd();
const pub = path.join(root, 'public');

rmSync(pub, { recursive: true, force: true });
mkdirSync(pub, { recursive: true });

for (const dir of copyDirectories(root)) {
  const from = path.join(root, dir);
  if (existsSync(from)) cpSync(from, path.join(pub, dir), { recursive: true });
}

for (const file of COPY_FILES) {
  const from = path.join(root, file);
  if (existsSync(from)) cpSync(from, path.join(pub, file));
}
