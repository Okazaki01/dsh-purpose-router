import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
import {Context} from '@deepseek-ai/cordis';
import {createHostFixture} from './host-fixture.mjs';

const runtime=process.env.DSH_TEST_RUNTIME;
const require=createRequire(join(runtime,'package.json'));
async function load(file){
  let registration;
  runInNewContext(await readFile(file,'utf8'),{window:{__ModuleLoader__:{load:r=>registration=r}},console,crypto:webcrypto,structuredClone,TextEncoder,TextDecoder,URL,setTimeout,clearTimeout,AbortController});
  return registration.factory(require);
}

test('真实桌面按钮 → 官方 Client RPC 地址校验/关联 ID → Host → HTTP 模型：成功、401、取消',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'router-client-wire-'));
  let fixture,root,requests=0,held=false,wireCalls=0;
  const upstream=createServer(async(req,res)=>{
    let raw='';for await(const b of req)raw+=b;
    const body=JSON.parse(raw);requests++;assert.equal(body.model,'qa-client-model');
    if(held)return;
    if(req.headers.authorization!=='Bearer qa-client-only'){res.writeHead(401);res.end('{}');return;}
    assert.equal(body.stream,true);
    res.setHeader('Content-Type','text/event-stream');
    res.end('data: '+JSON.stringify({choices:[{index:0,delta:{reasoning_content:'QA thinking'},finish_reason:null}]})+'\n\ndata: '+JSON.stringify({choices:[{index:0,delta:{content:'OK'},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n');
  });
  await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
  const browser=new Context();
  const {JSDOM}=require('jsdom'),React=require('react');
  const dom=new JSDOM('<div id="root"></div>');
  const globals=['window','document','navigator','IS_REACT_ACT_ENVIRONMENT'];
  const descriptors=Object.fromEntries(globals.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  Object.defineProperties(globalThis,{window:{value:dom.window,configurable:true},document:{value:dom.window.document,configurable:true},navigator:{value:dom.window.navigator,configurable:true},IS_REACT_ACT_ENVIRONMENT:{value:true,configurable:true}});
  try{
    fixture=await createHostFixture(dir);
    const connection=await load(join(runtime,'node_modules/@deepseek-ai/dsh-client-connection/lib/client.js'));
    connection.installConnection(browser,{transport:{fetch:async(input,init)=>{
      wireCalls++;
      assert.equal(String(input),'api/purpose-router/test');
      const body=JSON.parse(init.body);assert.equal(body.method,'purpose-router/test');
      assert.equal(typeof body.rpcId,'string');
      return fetch(new URL(input,fixture.origin+'/'),{...init,headers:{...init.headers,Authorization:'Bearer '+fixture.token}});
    }}});
    // Reproduce the reported 0.2.1 error using the real official caller.
    await assert.rejects(browser.connection.rpc.call('/api/purpose-router','test',{}),/invalid RPC target/);
    assert.equal(wireCalls,0,'bad target must fail before HTTP');
    const renderer=await load(join(runtime,'node_modules/@deepseek-ai/dsh-client-ui-renderer/lib/client.js'));
    const slots=new renderer.SlotRegistry(browser);
    browser.provide('configForms');browser.set('configForms',{get:()=>({})});
    slots.register({name:'root',children:{'plugins.row.config':{kind:'keyed',scope:'root'},'settings.section':{kind:'list',scope:'root'}}},()=>null);
    const client=await load(join(process.env.DSH_TEST_BUNDLE??process.cwd(),'client.js'));
    await browser.plugin(client);
    const nativeTest=slots.entries('settings.section')[0].inject().testConnection;
    const config=JSON.parse(await readFile('config.example.json','utf8'));
    config.models[0]={...config.models[0],enabled:true,model:'qa-client-model',apiKey:'qa-client-only',url:'http://127.0.0.1:'+upstream.address().port+'/v1/chat/completions'};
    const form={state:{status:'ready',writable:true,revision:0,value:{catalogJson:JSON.stringify(config)}},mutate:async()=>true};
    let completion;
    const tracked=(...args)=>{completion=nativeTest(...args);return completion;};
    root=require('react-dom/client').createRoot(dom.window.document.getElementById('root'));
    const render=async()=>React.act(async()=>root.render(React.createElement(client.RouterConfigPage,{key:requests,form,testConnection:tracked})));
    const click=async()=>React.act(async()=>{
      [...dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='测试连接').click();
      assert.ok(completion,'real button must invoke native wiring');
      await completion.catch(()=>{});
    });
    await render();await click();
    assert.match(dom.window.document.body.textContent,/连接成功/);assert.equal(requests,1);
    config.models[0].apiKey='qa-wrong';form.state.value.catalogJson=JSON.stringify(config);
    await render();await click();
    assert.match(dom.window.document.body.textContent,/认证失败.*401/);assert.equal(requests,2);
    held=true;config.models[0].apiKey='qa-client-only';form.state.value.catalogJson=JSON.stringify(config);
    await render();
    await React.act(async()=>{
      [...dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='测试连接').click();
      await new Promise(resolve=>setTimeout(resolve,50));
    });
    await React.act(async()=>{
      [...dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='取消测试').click();
      await completion.catch(()=>{});
    });
    assert.match(dom.window.document.body.textContent,/已取消连接测试/);
    assert.equal(wireCalls,3);
    console.log('PASS: compiled desktop button, official Client RPC and real Host/HTTP; bad old target reproduces locally; success, 401 and cancellation render correctly.');
  }finally{
    if(root)await React.act(async()=>root.unmount());
    await browser.fiber.dispose();await fixture?.close();upstream.closeAllConnections();await new Promise(resolve=>upstream.close(resolve));
    dom.window.close();for(const k of globals)if(descriptors[k])Object.defineProperty(globalThis,k,descriptors[k]);else delete globalThis[k];
    await rm(dir,{recursive:true,force:true});
  }
});

