import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(resolve(root,process.env.DSH_BUILD_RUNTIME?'qa/runtime/package.json':'package.json'));
const {build}=require('esbuild');
const result=await build({entryPoints:[resolve(root,'src/client.mjs')],bundle:true,format:'cjs',platform:'browser',target:'es2022',external:['react'],write:false});
await writeFile(resolve(root,'client.js'),`// DeepSeek Harness browser module registry, matching the official 0.2.0-rc.2 client bundle format.\nwindow.__ModuleLoader__.load({id:'dsh-purpose-router',factory:(require)=>{const module={exports:{}};const exports=module.exports;\n${result.outputFiles[0].text}\nreturn module.exports;}});\n`);
