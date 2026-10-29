#!/usr/bin/env node
/**
 * Bundle budget check.
 *
 * Reads the production build output and fails when a chunk grows beyond the
 * agreed budget. The report is printed as a table (raw + gzip) so regressions
 * are visible in the CI logs.
 *
 * Usage: node scripts/check-bundle-size.mjs [distDir]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const distDir = process.argv[2] ?? 'dist';
const assetsDir = join(distDir, 'assets');

/** Budget per chunk in bytes (gzipped size is what the user actually downloads). */
const BUDGETS = {
  entry: 140 * 1024,
  default: 300 * 1024,
};

/**
 * Chunks that are known to be heavy but are only fetched on demand.
 * They get their own (larger) budget so a regression is still visible.
 */
const VENDOR_BUDGETS = {
  'vendor-mapbox': 600 * 1024,
  'vendor-web3': 200 * 1024,
  'vendor-animation': 100 * 1024,
  'vendor-react': 120 * 1024,
};

const budgetFor = file => {
  const vendorKey = Object.keys(VENDOR_BUDGETS).find(key => file.startsWith(key));
  if (vendorKey) return VENDOR_BUDGETS[vendorKey];
  return null;
};

const formatKb = bytes => `${(bytes / 1024).toFixed(1)} kB`;

const readChunkSize = filePath => {
  const content = readFileSync(filePath);
  return { raw: content.length, gzip: gzipSync(content).length };
};

const isChunkFile = name => extname(name) === '.js' || extname(name) === '.css';

let files;
try {
  files = readdirSync(assetsDir).filter(isChunkFile);
} catch {
  console.error(`[bundle-budget] No build output found at "${assetsDir}". Run "npm run build" first.`);
  process.exit(1);
}

if (files.length === 0) {
  console.error(`[bundle-budget] No chunks found in "${assetsDir}".`);
  process.exit(1);
}

const entries = new Set();
const indexHtmlPath = join(distDir, 'index.html');
try {
  const html = readFileSync(indexHtmlPath, 'utf8');
  for (const match of html.matchAll(/(?:src|href)="\.\/assets\/([^"]+)"/g)) {
    entries.add(match[1]);
  }
} catch {
  console.warn('[bundle-budget] index.html not found - treating every chunk as a non entry chunk.');
}

const rows = files
  .map(file => {
    const { raw, gzip } = readChunkSize(join(assetsDir, file));
    return { file, raw, gzip, isEntry: entries.has(file) };
  })
  .sort((a, b) => b.gzip - a.gzip);

console.log('\n[bundle-budget] Production chunk report');
console.log('─'.repeat(78));
console.log(`${'chunk'.padEnd(46)}${'raw'.padStart(12)}${'gzip'.padStart(12)}`);
console.log('─'.repeat(78));
for (const row of rows) {
  const label = row.isEntry ? `★ ${row.file}` : `  ${row.file}`;
  console.log(`${label.slice(0, 45).padEnd(46)}${formatKb(row.raw).padStart(12)}${formatKb(row.gzip).padStart(12)}`);
}
console.log('─'.repeat(78));

const totalGzip = rows.reduce((sum, row) => sum + row.gzip, 0);
console.log(`Total (gzipped): ${formatKb(totalGzip)}`);

const violations = rows.filter(row => {
  const vendorBudget = budgetFor(row.file);
  const budget = vendorBudget ?? (row.isEntry ? BUDGETS.entry : BUDGETS.default);
  return row.gzip > budget;
});

if (violations.length > 0) {
  console.error('\n[bundle-budget] Budget exceeded:');
  for (const violation of violations) {
    const vendorBudget = budgetFor(violation.file);
    const budget = vendorBudget ?? (violation.isEntry ? BUDGETS.entry : BUDGETS.default);
    console.error(`  ${violation.file}: ${formatKb(violation.gzip)} gzipped > ${formatKb(budget)} allowed`);
  }
  process.exit(1);
}

console.log('[bundle-budget] All chunks are within budget.\n');
