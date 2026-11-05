import {readFile,writeFile,mkdir,readdir,unlink} from 'node:fs/promises';
import path from 'node:path';
// Keep only the import closure used by this game, rather than all Three examples.
const src=path.resolve('node_modules/three/examples/jsm'),dest=path.resolve('dist/vendor/addons'),keep=new Set();
async function visit(relative){relative=relative.replaceAll('\\','/');if(keep.has(relative))return;const absolute=path.resolve(src,relative);if(!absolute.startsWith(src+path.sep))throw Error('Import outside source');keep.add(relative);const text=await readFile(absolute,'utf8');await mkdir(path.dirname(path.resolve(dest,relative)),{recursive:true});await writeFile(path.resolve(dest,relative),text);for(const match of text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){if(match[1].startsWith('.'))await visit(path.join(path.dirname(relative),match[1]));}}
for(const root of ['loaders/GLTFLoader.js','utils/SkeletonUtils.js','postprocessing/EffectComposer.js','postprocessing/RenderPass.js','postprocessing/UnrealBloomPass.js','postprocessing/SSAOPass.js','postprocessing/OutputPass.js','environments/RoomEnvironment.js'])await visit(root);
async function prune(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.resolve(dir,entry.name);if(!file.startsWith(dest+path.sep))throw Error('Invalid vendor path');if(entry.isDirectory())await prune(file);else if(!keep.has(path.relative(dest,file).replaceAll('\\','/')))await unlink(file);}}
await prune(dest);console.log(`Vendored ${keep.size} Three.js addon modules.`);
