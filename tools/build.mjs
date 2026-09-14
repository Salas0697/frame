import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = await readFile(path.join(root, 'frame/director/base.html'), 'utf8');
const core = source.match(/<script>([\s\S]*?)<\/script>/);
if (!core) throw new Error('Missing core script');
const modules = [
  'crop-geometry.js', 'photo-store.js', 'photo-import-controller.js', 'photo-analysis.js',
  'director-enhancements.js', 'interaction-v1.js', 'speed-v1.js',
  'ux-rescue-v1.js', 'template-engine.js', 'storyboard-v1.js', 'photo-editor-v2.js'
];
const scripts = await Promise.all(modules.map(name => readFile(path.join(root, 'frame', name), 'utf8')));
// A single content-addressed file keeps core, listeners and UI on the same revision.
// No document.write(), eight-part HTML reconstruction, or mutable ?v=NN dependency chain.
const catalog = JSON.parse(await readFile(path.join(root, 'frame/template-catalog.json'), 'utf8'));
const bundle = [core[1], `window.FRAME_TEMPLATE_CATALOG=${JSON.stringify(catalog)};`, ...scripts].join('\n;\n');
const hash = createHash('sha256').update(bundle).digest('hex').slice(0, 16);
const filename = `frame.${hash}.js`;
await mkdir(path.join(root, 'assets/runtime'), {recursive:true});
await writeFile(path.join(root, 'assets/runtime', filename), bundle);
for (const [file, prefix] of [['index.html', './'], ['frame/index.html', '../']]) {
  const metadata = `<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="FRAME"><link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png"><link rel="manifest" href="${prefix}manifest.webmanifest">`;
  const html = source.replace(core[0], `<script src="${prefix}assets/runtime/${filename}"></script>`)
    .replace('<title>FRAME Director</title>', '<title>FRAME</title>')
    .replace('</head>', `${metadata}</head>`);
  await writeFile(path.join(root, file), html);
}
console.log(`Built ${filename}`);
