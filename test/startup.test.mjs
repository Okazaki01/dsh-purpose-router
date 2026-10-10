import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Context} from '@deepseek-ai/cordis';
import {SystemPrompt} from '@deepseek-ai/dsh-system-prompt';
import {ToolRuntime} from '@deepseek-ai/dsh-tools';
import {FixtureWebServer,fixtureConnection} from './web-server-fixture.mjs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const plugin = await import(process.env.DSH_TEST_BUNDLE
  ? pathToFileURL(join(process.env.DSH_TEST_BUNDLE,'index.js')).href
  : '../index.js');

async function fixture() {
  const ctx=new Context(),routes=new Map();
  await ctx.plugin(SystemPrompt,{includeRuntimeContext:false});
  await ctx.plugin(ToolRuntime,{mode:'native'});
  ctx.provide('fs');ctx.set('fs',{});
  await ctx.plugin(FixtureWebServer,{routes});
  await ctx.plugin(fixtureConnection,{isAuthenticated:()=>true});
  return {ctx,routes};
}

test('复现旧版桌面启动失败：通用 RPC 注册报 webServer without inject',async()=>{
  const {ctx,routes}=await fixture();
  try {
    const old={inject:plugin.inject,apply(owner){owner.effect(()=>owner.connection.rpc.handle('/purpose-router-rpc',async()=>({ok:true,value:{}})));}};
    await assert.rejects(async()=>{await ctx.plugin(old,{});},/cannot get property "webServer" without inject/);
    assert.equal(routes.size,0);
    assert.equal(ctx.tools.schemas().filter(x=>x.name.startsWith('model_router_')).length,0);
  } finally {await ctx.fiber.dispose();}
});

test('修复版按桌面依赖隔离启动、停用、再次启用：端点与三个工具完整注册/清理',async()=>{
  const {ctx,routes}=await fixture();
  try {
    const fiber=await ctx.plugin(plugin,{});
    assert.equal(fiber.error,undefined);
    const status=async()=> (await ctx.connection.createSharedFetchHandler('/api').fetch(new Request('http://localhost/api/purpose-router/test',{method:'POST',body:'{}'}))).status;
    assert.equal(await status(),400);
    assert.equal(ctx.tools.schemas().filter(x=>x.name.startsWith('model_router_')).length,3);
    await ctx.registry.delete(plugin);
    assert.equal(await status(),404);
    assert.equal(ctx.tools.schemas().filter(x=>x.name.startsWith('model_router_')).length,0);
    const again=await ctx.plugin(plugin,{});
    assert.equal(again.error,undefined);
    assert.equal(await status(),400);
    assert.equal(ctx.tools.schemas().filter(x=>x.name.startsWith('model_router_')).length,3);
  } finally {await ctx.fiber.dispose();}
});
