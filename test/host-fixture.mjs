import {Context} from '@deepseek-ai/cordis';
import {Loader} from '@deepseek-ai/cordis-plugin-loader';
import {mountRootInclude,readProfilePatches} from '@deepseek-ai/dsh-app-boot';
import {ConfigEditor} from '@deepseek-ai/dsh-config-editor';
import {SettingsForms} from '@deepseek-ai/dsh-settings';
import {SystemPrompt} from '@deepseek-ai/dsh-system-prompt';
import {ToolRuntime} from '@deepseek-ai/dsh-tools';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createServer} from 'node:http';
import {randomBytes} from 'node:crypto';
import {FixtureWebServer,fixtureConnection} from './web-server-fixture.mjs';

export async function createHostFixture(dir,{html}={}){
  await mkdir(join(dir,'home'),{recursive:true});
  const patchPath=join(dir,'cordis.patch.yml'),rootPath=join(dir,'cordis.json');
  const fixtureDir=join(dir,'node_modules','qa-router-fixture');await mkdir(fixtureDir,{recursive:true});
  await writeFile(join(fixtureDir,'package.json'),JSON.stringify({name:'qa-router-fixture',version:'0.0.0',main:'unused.js',dsh:{bundle:{patch:'./cordis.patch.yml'}}}));
  await writeFile(join(fixtureDir,'cordis.patch.yml'),JSON.stringify([{insert:[{id:'purpose-model-router',name:pathToFileURL(join(process.env.DSH_TEST_BUNDLE ?? process.cwd(),'index.js')).href,config:{}}]}]));
  await writeFile(join(dir,'package.json'),JSON.stringify({name:'isolated-ux-qa',dependencies:{'qa-router-fixture':'file:./node_modules/qa-router-fixture'},dsh:{profile:{bundles:['qa-router-fixture']}}}));
  await writeFile(rootPath,'[]');await writeFile(patchPath,'[]\n');
  const host=new Context();await host.plugin(Loader);
  host.provide('profileContext');host.set('profileContext',{name:'qa',home:join(dir,'home'),dir,patchPath,installAnchor:join(dir,'package.json'),overlays:[]});
  await host.plugin(SystemPrompt,{includeRuntimeContext:false});await host.plugin(ToolRuntime,{mode:'native'});
  host.provide('fs');host.set('fs',{});
  const token=randomBytes(24).toString('hex'),routes=new Map();
  await host.plugin(FixtureWebServer,{routes});
  await host.plugin(fixtureConnection,{isAuthenticated:request=>request.headers.authorization==='Bearer '+token});
  await mountRootInclude(host,rootPath,readProfilePatches('dsh',host.profileContext));await host.loader.await();
  await host.plugin(ConfigEditor);await host.plugin(SettingsForms);
  const server=createServer(async(req,res)=>{
    if(req.url==='/'&&html){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'"});res.end(html);return;}
    if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}
    const route=[...routes.values()].find(r=>req.url.startsWith(r.path+'/'));
    if(route){await route.handler(req,res);return;}
    if(req.headers.authorization!=='Bearer '+token){res.writeHead(401);res.end();return;}
    if(req.url.startsWith('/api/')){
      const controller=new AbortController();res.on('close',()=>controller.abort());
      const chunks=[];for await(const b of req)chunks.push(b);
      const request=new Request('http://127.0.0.1'+req.url,{method:req.method,headers:req.headers,body:Buffer.concat(chunks),signal:controller.signal});
      const result=await host.connection.createSharedFetchHandler('/api').fetch(request);
      res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));return;
    }
    try{
      if(req.url!=='/qa/settings')throw Error('Unknown QA endpoint');
      if(req.method==='POST'){
        const chunks=[];let size=0;for await(const bytes of req){size+=bytes.length;if(size>1048576)throw Error('Too large');chunks.push(bytes);}
        const body=JSON.parse(Buffer.concat(chunks));await host.settings.mutate('purpose-model-router',body.ops,body.revision);
      }
      res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(host.settings.describe({redactSecrets:true}).find(r=>r.ns==='purpose-model-router')));
    }catch{res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'配置未接受，原配置保留'}));}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
  const rpc=async(model,{signal,auth=true,endpoint='test'}={})=>{
    const r=await fetch(origin+'/api/purpose-router/'+endpoint,{method:'POST',signal,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({type:'client-request',rpcId:'qa-test',method:'purpose-router/'+endpoint,payload:{model}})});
    return {status:r.status,...(r.status===200?{result:(await r.json()).result}:{})};
  };
  return {host,server,origin,token,rpc,patchPath,routes,async close(){await host.fiber.dispose();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}

