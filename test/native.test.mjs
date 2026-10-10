import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { ToolRuntime } from '@deepseek-ai/dsh-tools';
import * as plugin from '../index.js';
import {FixtureWebServer,fixtureConnection} from './web-server-fixture.mjs';
test('真实 Cordis + DSH ToolRuntime：注册、校验、路由、调用、保护门禁、卸载',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'dsh-native-router-'));const path=join(dir,'config.json');
 const config=JSON.parse(await readFile(new URL('../config.example.json',import.meta.url),'utf8'));
 const ctx=new Context();await ctx.plugin(SystemPrompt,{includeRuntimeContext:false});await ctx.plugin(ToolRuntime,{mode:'native'});
 // File capability is needed only for image calls; text QA must not access it.
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6aK0AAAAASUVORK5CYII=','base64');
 let imageReads=0;
 await ctx.plugin(FixtureWebServer);
 await ctx.plugin(fixtureConnection,{isAuthenticated:()=>true});
 ctx.provide('fs');ctx.set('fs',{async resolve(p,options){assert.equal(p,'qa.png');assert.ok(options.signal);return {displayPath:p};},async stat(){return {type:'file',size:png.length};},async readBytes(_target,signal,max){assert.ok(signal);assert.ok(max>=png.length);imageReads++;return png;}});
 const originalFetch=globalThis.fetch;
 try{
  for(const m of config.models){m.enabled=true;m.url='http://127.0.0.1:9999/v1/chat/completions';m.model=m.id;m.apiKeyEnv='';}
  await writeFile(path,JSON.stringify(config));const fiber=await ctx.plugin(plugin,{configPath:path});
  const run=(name,arguments_)=>ctx.tools.execute({callId:'qa-'+name,name,arguments:arguments_,signal:new AbortController().signal});
  assert.equal(ctx.tools.schemas().filter(x=>x.name.startsWith('model_router_')).length,3);
  assert.equal((await run('model_router_catalog',{})).isError,false);
  assert.equal((await run('model_router_route',{task:'分析代码',purpose:'coding'})).isError,false);
  assert.equal((await run('model_router_route',{task:123})).isError,true);
  globalThis.fetch=async(_url,options)=>{assert.equal(JSON.parse(options.body).stream,true);return new Response('data: '+JSON.stringify({choices:[{index:0,delta:{content:'native helper result'},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}});};
  const result=await run('model_router_call',{task:'普通总结',purpose:'general'});assert.equal(result.isError,false);assert.ok(JSON.stringify(result).includes('native helper result'));
  globalThis.fetch=async(_url,options)=>{const body=JSON.parse(options.body);assert.equal(body.model,'vision-model');assert.ok(body.messages.at(-1).content[1].image_url.url.endsWith(png.toString('base64')));return new Response(JSON.stringify({choices:[{message:{content:'native vision result'},finish_reason:'stop'}]}));};
  assert.equal((await run('model_router_call',{task:'识图',purpose:'vision',imagePaths:['qa.png']})).isError,false);assert.equal(imageReads,1);
  const lift=ctx.tools.guard(exec=>exec.name==='model_router_call'?'QA policy denied':undefined);
  assert.equal((await run('model_router_call',{task:'普通总结'})).isError,true);lift();
  let markStarted;const started=new Promise(resolve=>markStarted=resolve);
  let bodyCanceled=false;
  globalThis.fetch=async()=>{markStarted();return new Response(new ReadableStream({start(stream){stream.enqueue(new TextEncoder().encode('data: '+JSON.stringify({choices:[{index:0,delta:{reasoning_content:'QA thinking'}}]})+'\n\n'));},cancel(){bodyCanceled=true;}}),{headers:{'content-type':'text/event-stream'}});};
  const pending=run('model_router_call',{task:'等待结果',purpose:'general'});await started;
  const unloadAt=performance.now();
  await fiber.dispose();
  const cancelled=await Promise.race([pending,new Promise((_,reject)=>setTimeout(()=>reject(new Error('卸载未及时取消模型请求')),1000).unref())]);
  assert.equal(cancelled.isError,true);assert.ok(performance.now()-unloadAt<1000);
  assert.equal(bodyCanceled,true,'plugin disposal cancels an already-open body reader');
  assert.equal(ctx.tools.schemas().filter(x=>x.name.startsWith('model_router_')).length,0);
  await ctx.registry.delete(plugin);
  const paused=await ctx.plugin(plugin,{configPath:path,enabled:false});
  let requestsWhenDisabled=0;globalThis.fetch=async()=>{requestsWhenDisabled++;throw Error('禁止发请求');};
  assert.equal((await run('model_router_catalog',{})).isError,false);
  const blocked=await run('model_router_call',{task:'暂停的调用',purpose:'general'});
  assert.equal(blocked.isError,true);assert.ok(JSON.stringify(blocked).includes('已关闭'));assert.equal(requestsWhenDisabled,0);
  await paused.dispose();
 }finally{globalThis.fetch=originalFetch;await ctx.registry.delete(plugin);await rm(dir,{recursive:true,force:true});}
});
