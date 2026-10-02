import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
async function output(file, content) {
  const target = path.join(root, file);
  if (check) {
    const existing = await readFile(target, 'utf8').catch(() => null);
    if (existing !== content) throw new Error(`Stale generated file: ${file}. Run npm run build and commit its output.`);
  } else {
    await mkdir(path.dirname(target), {recursive:true});
    await writeFile(target, content);
  }
}
const source = await readFile(path.join(root, 'frame/director/base.html'), 'utf8');
const core = source.match(/<script>([\s\S]*?)<\/script>/);
if (!core) throw new Error('Missing core script');
const modules = [
  'cut-geometry.js', 'crop-geometry.js', 'photo-colors.js', 'photo-store.js', 'photo-import-controller.js', 'photo-location.js', 'face-geometry.js', 'photo-analysis.js',
  'interaction-v1.js', 'speed-v1.js',
  'ux-rescue-v1.js', 'template-style.js', 'template-layouts.js', 'design-settings.js', 'template-engine.js', 'template-journey.js', 'storyboard-v1.js', 'photo-editor-v2.js', 'album-workspace.js', 'mobile-workflow.js', 'premium-workspace.js'
];
const scripts = await Promise.all(modules.map(name => readFile(path.join(root, 'frame', name), 'utf8')));
// A single content-addressed file keeps core, listeners and UI on the same revision.
// No document.write(), eight-part HTML reconstruction, or mutable ?v=NN dependency chain.
const catalog = JSON.parse(await readFile(path.join(root, 'frame/template-catalog.json'), 'utf8'));
const cities = JSON.parse(await readFile(path.join(root, 'node_modules/cities.json/cities.json'), 'utf8'));
const locations = JSON.stringify(cities.map(c=>[c.name,c.country,Number(c.lat),Number(c.lng)]));
const locationFile = `cities.${createHash('sha256').update(locations).digest('hex').slice(0,16)}.json`;
await output('assets/locations/'+locationFile,locations);
const exifr = await readFile(path.join(root,'node_modules/exifr/dist/lite.umd.js'),'utf8');
const infrastructure = await Promise.all(['formats.js','project-state.js','lifecycle.js','finish.js','export-source.js','export-delivery.js','project-file.js','narrative.js'].map(name => readFile(path.join(root,'frame',name),'utf8')));
const bundle = [exifr,...infrastructure,core[1], `window.FRAME_TEMPLATE_CATALOG=${JSON.stringify(catalog)};window.FRAME_LOCATION_DATA_FILE=${JSON.stringify(locationFile)};`, ...scripts].join('\n;\n');
const hash = createHash('sha256').update(bundle).digest('hex').slice(0, 16);
const filename = `frame.${hash}.js`;
await output('assets/runtime/'+filename,bundle);
for (const [file, prefix] of [['index.html', './'], ['frame/index.html', '../']]) {
  const metadata = `<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="FRAME"><link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png"><link rel="manifest" href="${prefix}manifest.webmanifest">`;
  const html = source.replace(core[0], `<script src="${prefix}assets/runtime/${filename}"></script>`)
    .replace('<title>FRAME Director</title>', '<title>FRAME</title>')
    .replace('</head>', `${metadata}</head>`);
  await output(file, html);
}
console.log(`${check?'Verified':'Built'} ${filename}`);
