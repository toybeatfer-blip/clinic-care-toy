import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const nodeModulesBin = path.join(rootDir, 'node_modules', '.bin');
const serveBinTarget = path.join(nodeModulesBin, 'serve');
const servePkgMain = path.join(rootDir, 'node_modules', 'serve', 'build', 'main.js');

const shimCode = `#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const target = path.resolve(process.cwd(), 'bin', 'serve.js');
await import(pathToFileURL(target).href);
`;

try {
  if (!fs.existsSync(nodeModulesBin)) {
    fs.mkdirSync(nodeModulesBin, { recursive: true });
  }

  fs.writeFileSync(serveBinTarget, shimCode, { encoding: 'utf8', mode: 0o777 });
  try {
    fs.chmodSync(serveBinTarget, 0o777);
  } catch (e) {}

  if (fs.existsSync(path.dirname(servePkgMain))) {
    fs.writeFileSync(servePkgMain, shimCode, { encoding: 'utf8', mode: 0o777 });
  }

  console.log('==> [setup-bin] node_modules/.bin/serve shim installed successfully');
} catch (err) {
  console.warn('==> [setup-bin] Notice:', err.message);
}
