import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {runInNewContext} from 'node:vm';
import {Context,resolveConfig} from '@deepseek-ai/cordis';
import * as host from '../index.js';
import * as client from '../src/client.mjs';
const require=createRequire(join(process.env.DSH_TEST_RUNTIME,'package.json'));
const sample=JSON.parse(await readFile(new URL('../config.example.json',import.meta.url),'utf8'));

test('桌面 Host schema：正确目录可用，损坏目录拒绝，字段可实时读取',()=>{
 const value=resolveConfig(host,{catalogJson:JSON.stringify(sample)});
 assert.equal(value.catalogJson.get(),JSON.stringify(sample));
 assert.throws(()=>host.validateCatalogJson('{bad'));
 const wrong=structuredClone(sample);wrong.purposes[0].modelIds=['unknown'];
 assert.throws(()=>host.validateCatalogJson(JSON.stringify(wrong)));
 assert.equal(resolveConfig(host,{}).catalogJson.get(),'');
});
test('桌面保存：仅写本插件字段、带读取版本、拒绝/只读保留配置',async()=>{
 let calls=0;const form={state:{status:'ready',writable:true,revision:7,value:{catalogJson:''}},async mutate(ops,revision){calls++;assert.equal(revision,7);assert.equal(ops.length,1);assert.deepEqual(ops[0].path,['catalogJson']);assert.equal(JSON.parse(ops[0].value).version,1);return true;}};
 assert.equal(client.readDesktopConfig(form).models.every(m=>!m.enabled),true);
 await client.saveDesktopConfig(sample,form,7);assert.equal(calls,1);
 await assert.rejects(client.saveDesktopConfig(sample,{...form,state:{...form.state,writable:false}},7));assert.equal(calls,1);
 await assert.rejects(client.saveDesktopConfig(sample,{...form,mutate:async()=>false},7),/原配置保留/);
 const wrong=structuredClone(sample);wrong.models[0].apiKeyEnv='actual-secret-with-dashes';
 await assert.rejects(client.saveDesktopConfig(wrong,form,7));assert.equal(calls,1);
});
test('原生桌面浏览器 bundle 与真实 SlotRegistry 注册/卸载',async()=>{
 function loadBundle(code){let registered;const window={__ModuleLoader__:{load(spec){registered=spec;}}};runInNewContext(code,{window,console,structuredClone,TextEncoder,setTimeout,clearTimeout,URL});assert.ok(registered);return registered;}
 const built=loadBundle(await readFile(new URL('../client.js',import.meta.url),'utf8'));
 assert.equal(built.id,'dsh-purpose-router');const browser=built.factory(require);assert.equal(browser.CONFIG_KEY,client.CONFIG_KEY);
 const renderer=loadBundle(await readFile(join(process.env.DSH_TEST_RUNTIME,'node_modules/@deepseek-ai/dsh-client-ui-renderer/lib/client.js'),'utf8')).factory(require);
 const ctx=new Context();const slots=new renderer.SlotRegistry(ctx);
 ctx.provide('connection');ctx.set('connection',{rpc:{call:async()=>({ok:true,value:{}})}});
 ctx.provide('configForms');ctx.set('configForms',{get:()=>({})});
 const disposeParent=slots.register({name:'root',children:{'plugins.row.config':{kind:'keyed',scope:'root'},'settings.section':{kind:'list',scope:'root'}}},()=>null);
 const fiber=await ctx.plugin(browser);
 assert.equal(slots.entries('plugins.row.config').length,1);
 assert.equal(slots.entries('plugins.row.config')[0].options.key,client.CONFIG_KEY);
 assert.equal(slots.entries('settings.section').length,1);
 assert.equal(slots.entries('settings.section')[0].options.id,'purpose-model-router');
 await fiber.dispose();assert.equal(slots.entries('plugins.row.config').length,0);assert.equal(slots.entries('settings.section').length,0);disposeParent();
});
test('设置开关：只写 enabled，版本保护、只读/拒绝处理',async()=>{
 let writes=0;
 const form={getSnapshot:()=>({status:'ready',writable:true,revision:3}),async mutate(ops,revision){writes++;assert.equal(revision,3);assert.deepEqual(ops,[{op:'set',path:['enabled'],value:false}]);return true;}};
 await client.setRouterEnabled(form,false);assert.equal(writes,1);
 await assert.rejects(client.setRouterEnabled({...form,getSnapshot:()=>({status:'unavailable'})},false));assert.equal(writes,1);
 await assert.rejects(client.setRouterEnabled({...form,mutate:async()=>false},false),/原配置保留/);
});
