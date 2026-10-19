import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_PRODUCTS, MOCK_USERS } from '../src/data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, '../public/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outDir, 'products.json'),
  JSON.stringify(INITIAL_PRODUCTS, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(outDir, 'users.json'),
  JSON.stringify(MOCK_USERS, null, 2),
  'utf-8'
);

console.log('Successfully exported ' + INITIAL_PRODUCTS.length + ' products and ' + MOCK_USERS.length + ' users to ' + outDir);
