// Quality checks that run before tests in CI. No dependencies needed.
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const problems = [];
const fail = (msg) => problems.push(msg);

// 1. Every JavaScript file must parse.
const jsFiles = ['src', 'scripts', 'tests'].flatMap((dir) =>
  readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => `${dir}/${f}`),
);
for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    fail(`${file} has a syntax error:\n${err.stderr}`);
  }
}

// 2. No leftover debugging in site code.
for (const file of jsFiles.filter((f) => f.startsWith('src/'))) {
  if (/console\.log|debugger/.test(readFileSync(file, 'utf8'))) fail(`${file} contains console.log or debugger`);
}

// 3. Accessibility and structure basics in index.html.
const html = readFileSync('index.html', 'utf8');
if (!/<html[^>]*\blang="/.test(html)) fail('index.html: <html> needs a lang attribute');
if (!/<title>[^<]+<\/title>/.test(html)) fail('index.html: missing <title>');
if (!/name="viewport"/.test(html)) fail('index.html: missing viewport meta tag');
if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail('index.html: needs exactly one <h1>');
for (const img of html.match(/<img\b[^>]*>/g) || []) {
  if (!/\balt=/.test(img)) fail(`index.html: image without alt text: ${img}`);
}

// 4. In-page links must point at ids that exist.
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(target)) fail(`index.html: link to #${target} but no element has that id`);
}

// 5. Local files referenced by the page must exist.
for (const [, ref] of html.matchAll(/(?:src|href)="(?!https?:|mailto:|#|data:)([^"]+)"/g)) {
  try {
    readFileSync(ref);
  } catch {
    fail(`index.html references missing file: ${ref}`);
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} quality problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`✓ Quality checks passed (${jsFiles.length} JS files, index.html)`);
