import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createModelConfig,validateConfig,MAX_MODELS} from '../src/catalog.mjs';
import {createHostFixture} from './host-fixture.mjs';
const sample=JSON.parse(await readFile(new URL('../config.example.json',import.meta.url),'utf8'));
const require=createRequire(join(process.env.DSH_TEST_RUNTIME,'package.json'));
test('任意新增模型共用等待默认，显式自定义保留，100 个模型通过而 101 个被拒绝',()=>{
 const c=structuredClone(sample);for(let i=3;i<MAX_MODELS;i++)c.models.push(createModelConfig('custom-'+i));
 assert.equal(validateConfig(c).models.length,100);const fourth=c.models[3],fifth=c.models[4];assert.equal(fourth.timeoutMs,600000);assert.equal(fifth.responseMode,'stream');
 fourth.timeoutMs=234000;delete fifth.timeoutMs;delete fifth.responseMode;
 const validated=validateConfig(c);assert.equal(validated.models[3].timeoutMs,234000);assert.equal(validated.models[4].timeoutMs,600000);assert.equal(validated.models[4].responseMode,'stream');
 c.models.push(createModelConfig('custom-extra'));assert.throws(()=>validateConfig(c),/最多 100/);
});
test('编译后真实表单添加第四/第五模型、独立等待设置、保存重读、工具实际路由新增模型',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'router-multiple-'));let fixture,root;const requests=[];
 const server=createServer(async(req,res)=>{let raw='';for await(const b of req)raw+=b;const body=JSON.parse(raw);requests.push(body);res.setHeader('Content-Type','text/event-stream');res.end('data: '+JSON.stringify({choices:[{index:0,delta:{content:body.model+' OK'},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n');});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const {JSDOM}=require('jsdom'),React=require('react');const dom=new JSDOM('<div id="root"></div>');
 const globals=['window','document','navigator','IS_REACT_ACT_ENVIRONMENT'],descriptors=Object.fromEntries(globals.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 Object.defineProperties(globalThis,{window:{value:dom.window,configurable:true},document:{value:dom.window.document,configurable:true},navigator:{value:dom.window.navigator,configurable:true},IS_REACT_ACT_ENVIRONMENT:{value:true,configurable:true}});
 try{
  let bundle;runInNewContext(await readFile(join(process.env.DSH_TEST_BUNDLE??process.cwd(),'client.js'),'utf8'),{window:{__ModuleLoader__:{load:x=>bundle=x}},crypto:webcrypto,console,structuredClone,TextEncoder,URL,setTimeout,clearTimeout,AbortController});const client=bundle.factory(require);
  fixture=await createHostFixture(dir);const {host}=fixture;
  const snapshot=()=>host.settings.describe({redactSecrets:true}).find(x=>x.ns==='purpose-model-router');const wire=snapshot();
  let saving;const form={state:{status:'ready',writable:true,revision:wire.revision,value:wire.value},mutate(ops,revision){saving=(async()=>{await host.settings.mutate('purpose-model-router',ops,revision);const w=snapshot();form.state={...form.state,revision:w.revision,value:w.value};return true;})();return saving;}};
  root=require('react-dom/client').createRoot(dom.window.document.getElementById('root'));
  await React.act(async()=>root.render(React.createElement(client.RouterConfigPage,{form})));
  const button=text=>[...dom.window.document.querySelectorAll('button')].find(x=>x.textContent===text);
  const click=async text=>React.act(async()=>button(text).click());
  const card=()=>dom.window.document.querySelector('details.card');
  const field=(text,scope=card())=>[...scope.querySelectorAll('label')].find(x=>x.firstChild?.textContent===text)?.querySelector('input,select');
  const change=async(el,value)=>React.act(async()=>{const proto=el.tagName==='SELECT'?dom.window.HTMLSelectElement.prototype:dom.window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new dom.window.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));});
  const configure=async name=>{await change(field('显示名称'),name);await change(field('模型名称（服务商提供）'),name);await change(field('接口地址'),`http://127.0.0.1:${server.address().port}/v1/chat/completions`);const checkbox=[...card().querySelectorAll('label')].find(x=>x.textContent.trim()==='启用这个模型').querySelector('input');await React.act(async()=>checkbox.click());};
  await click('添加模型');assert.equal(field('最长等待（秒）').value,'600');await configure('自定义第四模型');await change(field('最长等待（秒）'),'234');
  await click('添加模型');assert.equal(field('最长等待（秒）').value,'600');await configure('自定义第五模型');await change(field('等待方案'),'300000');assert.equal(field('最长等待（秒）').value,'300');
  await React.act(async()=>{button('保存并生效').click();await saving;});
  let saved=JSON.parse(snapshot().value.catalogJson);assert.equal(saved.models.length,5);assert.equal(saved.models.find(m=>m.label==='自定义第四模型').timeoutMs,234000);assert.equal(saved.models.find(m=>m.label==='自定义第五模型').timeoutMs,300000);assert.equal(saved.models[2].timeoutMs,sample.models[0].timeoutMs);
  await click('重新读取');assert.equal(field('最长等待（秒）').value,'300');
  await click('② 任务用途');const purposes=[...dom.window.document.querySelectorAll('details.card')].filter(x=>x.querySelector('label')?.firstChild?.textContent==='用途名称');const general=purposes.at(-1),select=field('使用哪个模型',general);
  for(const label of ['自定义第四模型','自定义第五模型']){
   const model=saved.models.find(m=>m.label===label);await change(select,model.id);await React.act(async()=>{button('保存并生效').click();await saving;});
   const result=await host.tools.execute({callId:'qa-'+model.id,name:'model_router_call',arguments:{purpose:'日常文字',task:'测试新增模型'},signal:new AbortController().signal});assert.equal(result.isError,false);assert.ok(JSON.stringify(result).includes(label+' OK'));assert.equal(requests.at(-1).model,label);assert.equal(requests.at(-1).stream,true);
  }
  assert.equal(requests.length,2);console.log('PASS: fourth/fifth arbitrary-ID models created through compiled React controls, independently configured, persisted by real Host, reread and called by actual ToolRuntime over local HTTP.');
 }finally{
  if(root)await require('react').act(async()=>root.unmount());await fixture?.close();server.closeAllConnections();await new Promise(r=>server.close(r));dom.window.close();for(const k of globals)if(descriptors[k])Object.defineProperty(globalThis,k,descriptors[k]);else delete globalThis[k];await rm(dir,{recursive:true,force:true});
 }
});

