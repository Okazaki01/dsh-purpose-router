import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateConfig,route,callModel,catalog } from '../src/router.mjs';
const root=new URL('../',import.meta.url);
const example=JSON.parse(await readFile(new URL('config.example.json',root),'utf8'));
function config(){const c=structuredClone(example);for(const m of c.models){m.enabled=true;m.url='http://127.0.0.1:9999/v1/chat/completions';m.model=m.id;m.apiKeyEnv='';}return validateConfig(c);}
const response=answer=>new Response(JSON.stringify({choices:[{message:{content:answer},finish_reason:'stop'}]}),{status:200});
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6aK0AAAAASUVORK5CYII=','base64');
test('自定义用途/能力/URL/model/参数无需修改代码',async()=>{
 const c=config();c.models.push({...c.models[0],id:'editor',model:'new-custom-model',capabilities:['text','editing'],requestParams:{temperature:0.2,max_tokens:123}});
 c.purposes.push({id:'proofread',label:'小说校对',description:'校对小说文字',keywords:['校对'],priority:60,requires:['editing'],modelIds:['editor'],allowFallback:false,systemPrompt:'只做校对'});
 validateConfig(c);assert.equal(route(c,{task:'请校对这段'}).modelId,'editor');
 let req;const result=await callModel(c,{purpose:'proofread',task:'校对原文'},{fetchImpl:async(url,opts)=>{req={url,...opts};return response('已校对');}});
 const body=JSON.parse(req.body);assert.equal(body.model,'new-custom-model');assert.equal(body.temperature,0.2);assert.equal(body.max_tokens,123);assert.equal(body.messages[0].content,'只做校对');assert.equal(result.answer,'已校对');
});
test('识图发送真实图片，文字用途拒绝图片',async()=>{
 const c=config();let wire;
 const r=await callModel(c,{purpose:'auto',task:'这张图有什么',imagePaths:['参考.png']},{readImage:async(p,max)=>{assert.equal(p,'参考.png');assert.equal(max,c.limits.maxImageBytes);return png;},fetchImpl:async(_url,o)=>{wire=JSON.parse(o.body);return response('一个白点');}});
 assert.equal(r.modelId,'vision-model');assert.ok(wire.messages.at(-1).content[1].image_url.url.endsWith(png.toString('base64')));
 await assert.rejects(callModel(c,{purpose:'general',task:'看图',imagePaths:['a.png']}),/vision/);
});
test('能力不匹配、重复或未知 ID、损坏配置不能加载',()=>{
 for(const change of [c=>c.purposes[0].modelIds=['text-model'],c=>c.models[1].id=c.models[0].id,c=>c.defaultPurpose='missing',c=>delete c.models[0].id,c=>c.version=2,c=>c.models[0].apiKey='bad\nkey',c=>c.models[0].requestParams.messages=[]]){
  const c=config();change(c);assert.throws(()=>validateConfig(c));
 }
 assert.throws(()=>route(validateConfig(example),{task:'普通问题'}),/没有启用/);
});
test('同优先级冲突要求明确用途，不假装语义分类',()=>{
 const c=config();c.purposes[1].priority=30;c.purposes[1].keywords=['bug'];assert.throws(()=>route(c,{task:'bug'}),/明确 purpose/);
 assert.equal(route(c,{purpose:'coding',task:'bug'}).purposeId,'coding');
});
test('没有授权备用时只请求一次；显式开启后记录真正执行模型',async()=>{
 const c=config();c.purposes[3].modelIds=['text-model','reasoning-model'];let calls=0;
 await assert.rejects(callModel(c,{task:'你好'},{fetchImpl:async()=>{calls++;return new Response('SECRET',{status:503});}}),/HTTP 503/);assert.equal(calls,1);
 c.purposes[3].allowFallback=true;calls=0;const result=await callModel(c,{task:'你好'},{fetchImpl:async()=>++calls===1?new Response('',{status:503}):response('success')});
 assert.equal(calls,2);assert.equal(result.modelId,'reasoning-model');assert.deepEqual(result.attemptedModelIds,['text-model','reasoning-model']);
});
test('兼容旧密钥配置，重定向禁用，错误不反射上游密钥',async()=>{
 const c=config();c.models[0].apiKeyEnv='KEY';
 await assert.rejects(callModel(c,{task:'你好'},{env:{}}),/密钥尚未配置/);
 await assert.rejects(callModel(c,{task:'你好'},{env:{KEY:'private'},fetchImpl:async(_u,o)=>{assert.equal(o.headers.Authorization,'Bearer private');assert.equal(o.redirect,'error');throw new Error('private');}}),e=>!e.message.includes('private'));
 assert.ok(!JSON.stringify(catalog(c)).includes('KEY'));
});
test('取消与超时终止请求；不会因取消调用备用',async()=>{
 const c=config();c.purposes[3].allowFallback=true;c.purposes[3].modelIds=['text-model','reasoning-model'];let calls=0;
 const blocked=async(_u,o)=>{calls++;return new Promise((_,reject)=>{o.signal.addEventListener('abort',()=>reject(o.signal.reason),{once:true});});};
 const controller=new AbortController();const waiting=callModel(c,{task:'你好'},{signal:controller.signal,fetchImpl:blocked});setTimeout(()=>controller.abort(),15);
 await assert.rejects(waiting,/取消/);assert.equal(calls,1);
 c.purposes[3].allowFallback=false;c.models[0].timeoutMs=100;
 const keepAlive=setTimeout(()=>{},300);try{await assert.rejects(callModel(c,{task:'你好'},{fetchImpl:blocked}),/超时/);}finally{clearTimeout(keepAlive);}
});
test('上限、损坏响应、截断结果和无效图片不冒充成功',async()=>{
 const c=config();c.limits.maxResponseBytes=100;
 await assert.rejects(callModel(c,{task:'你好'},{fetchImpl:async()=>response('x'.repeat(200))}),/响应超过/);
 await assert.rejects(callModel(config(),{task:'你好'},{fetchImpl:async()=>new Response('invalid')}),/协议错误/);
 await assert.rejects(callModel(config(),{task:'你好'},{fetchImpl:async()=>new Response(JSON.stringify({choices:[{message:{content:'cut'},finish_reason:'length'}]}))}),/token 上限/);
 await assert.rejects(callModel(config(),{task:'图片',imagePaths:['a']},{readImage:async()=>Buffer.from('not-image')}),/图片内容/);
});
