// Read-only resolution into a user-specified installed DSH, only for native QA.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
export async function resolve(specifier,context,nextResolve){
 if((specifier.startsWith('@deepseek-ai/') || ['react','react-dom/client','react-dom','jsdom'].includes(specifier)) && process.env.DSH_TEST_RUNTIME){
  const require=createRequire(join(process.env.DSH_TEST_RUNTIME,'package.json'));
  return {url:pathToFileURL(require.resolve(specifier)).href,shortCircuit:true};
 }
 return nextResolve(specifier,context);
}
