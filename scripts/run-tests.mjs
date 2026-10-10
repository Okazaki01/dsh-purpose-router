import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const suites = ['router', 'response', 'native', 'desktop', 'settings-wire', 'ux-flow', 'startup', 'client-wire', 'multiple-models'];
const result = spawnSync(process.execPath, ['--loader', './test/runtime-loader.mjs', '--test', ...suites.map(name => `test/${name}.test.mjs`)], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, DSH_TEST_RUNTIME: process.env.DSH_TEST_RUNTIME || root },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
