// Copies the site into dist/, which is what gets deployed to GitHub Pages.
import { rmSync, mkdirSync, cpSync, writeFileSync } from 'node:fs';

const files = ['index.html', 'styles.css', 'src'];

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const file of files) cpSync(file, `dist/${file}`, { recursive: true });
// Tell GitHub Pages not to run Jekyll on the output.
writeFileSync('dist/.nojekyll', '');

console.log(`✓ Built dist/ with ${files.join(', ')}`);
