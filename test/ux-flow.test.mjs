import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHostFixture} from './host-fixture.mjs';
import {saveDesktopConfig,normalizeEndpoint} from '../src/client.mjs';
import {route} from '../src/router.mjs';

test('桌面配置闭环：直接 Key、中文用途、真实 Host 保存与 RPC、真实 HTTP 成功/拒绝、热更新、清除、卸载',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'router-ux-'));let fixture,requests=[];
  const upstream=createServer(async(req,res)=>{let raw='';for await(const b of req)raw+=b;const body=JSON.parse(raw);requests.push({body,authorized:req.headers.authorization==='Bearer qa-only-key'});res.setHeader('Content-Type','application/json');if(req.headers.authorization!=='Bearer qa-only-key'){res.writeHead(401);res.end('{"error":"secret upstream body must not echo"}');return;}res.end(JSON.stringify({choices:[{message:{content:'OK'},finish_reason:'stop'}]}));});
  await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
  try{
    fixture=await createHostFixture(dir);const {host}=fixture;
    let wire=host.settings.describe({redactSecrets:true}).find(r=>r.ns==='purpose-model-router');
    const config=JSON.parse(await readFile('config.example.json','utf8'));
    config.models[0]={...config.models[0],url:'http://127.0.0.1:'+upstream.address().port+'/v1/chat/completions',model:'qa-model',enabled:true,apiKey:'qa-only-key'};
    config.purposes[3].label='我的中文用途';config.purposes[3].description=config.purposes[3].systemPrompt='翻译成中文并保持原意';
    const form={state:{status:'ready',writable:true,revision:wire.revision,value:wire.value},async mutate(ops,revision){await host.settings.mutate('purpose-model-router',ops,revision);return true;}};
    const saved=await saveDesktopConfig(config,form,wire.revision);
    assert.equal(saved.models[0].apiKey,undefined);assert.equal(saved.models[0].apiKeyEnv,'');
    wire=host.settings.describe({redactSecrets:true}).find(r=>r.ns==='purpose-model-router');
    assert.ok(!JSON.stringify(wire).includes('qa-only-key'));assert.equal(wire.secrets.find(s=>s.path.join('/')==='apiKeys/text-model').set,true);
    assert.equal(route(saved,{purpose:'我的中文用途',task:'翻译'}).modelId,'text-model');
    const testResult=await fixture.rpc(saved.models[0]);assert.equal(testResult.status,200);assert.equal(testResult.result.ok,true);assert.equal(requests.length,1);assert.equal(requests[0].authorized,true);
    const run=()=>host.tools.execute({callId:'qa-call',name:'model_router_call',arguments:{task:'翻译你好',purpose:'我的中文用途'},signal:new AbortController().signal});
    assert.equal((await run()).isError,false);assert.equal(requests[1].body.model,'qa-model');assert.equal(requests[1].body.messages[0].content,'翻译成中文并保持原意');
    const bad=await fixture.rpc({...saved.models[0],apiKey:'qa-wrong-key'});assert.equal(bad.result.ok,false);assert.match(bad.result.error.message,/HTTP 401/);assert.ok(!JSON.stringify(bad).includes('secret upstream'));assert.equal(requests.length,3);
    assert.equal((await fixture.rpc(saved.models[0],{auth:false})).status,401);assert.equal(requests.length,3);
    const disk=await readFile(fixture.patchPath,'utf8');assert.ok(disk.includes('qa-only-key'),'QA key must persist locally');
    // Changing ordinary fields keeps the write-only key and changes the next real request.
    saved.models[0].model='qa-updated';
    await saveDesktopConfig(saved,{...form,state:{...form.state,revision:wire.revision,value:wire.value}},wire.revision);
    assert.equal((await run()).isError,false);assert.equal(requests.at(-1).body.model,'qa-updated');assert.equal(requests.at(-1).authorized,true);
    wire=host.settings.describe({redactSecrets:true}).find(r=>r.ns==='purpose-model-router');
    saved.models[0].apiKey='';await saveDesktopConfig(saved,{...form,state:{...form.state,value:wire.value}},wire.revision);
    assert.equal((await run()).isError,true);assert.equal(requests.at(-1).authorized,false);
    await host.settings.mutate('purpose-model-router',[{op:'set',path:['enabled'],value:false}],host.settings.describe().find(r=>r.ns==='purpose-model-router').revision);
    const count=requests.length;assert.equal((await fixture.rpc(saved.models[0])).result.ok,false);assert.equal(requests.length,count);
    assert.equal(normalizeEndpoint('https://api.deepseek.com/v1/'),'https://api.deepseek.com/v1/chat/completions');
    assert.equal(normalizeEndpoint('http://localhost:1234'),'http://localhost:1234/v1/chat/completions');
    assert.equal(normalizeEndpoint('https://example.org/custom/chat/completions'),'https://example.org/custom/chat/completions');
    console.log('PASS: direct key → redacted Host settings → real authenticated RPC → actual HTTP request; Chinese purpose, 401, retain/clear key, hot update, disabled gate.');
  }finally{await fixture?.close();upstream.closeAllConnections();await new Promise(resolve=>upstream.close(resolve));await rm(dir,{recursive:true,force:true});}
});

