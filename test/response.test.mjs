import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {validateConfig,callModel,catalog} from '../src/router.mjs';
import {readAnswer} from '../src/response.mjs';
const example=JSON.parse(await readFile(new URL('../config.example.json',import.meta.url),'utf8'));
const event=(delta,finish_reason=null)=>`data: ${JSON.stringify({choices:[{index:0,delta,finish_reason}]})}\r\n\r\n`;
function streamed(raw){return new Response(raw,{headers:{'Content-Type':'text/event-stream; charset=utf-8'}});}
function config(url,timeoutMs=1000){const c=structuredClone(example);Object.assign(c.models[0],{enabled:true,url,model:'qa-only',timeoutMs,apiKey:''});return validateConfig(c);}
async function server(handler,run){const s=createServer(handler);await new Promise(r=>s.listen(0,'127.0.0.1',r));try{await run(`http://127.0.0.1:${s.address().port}/v1/chat/completions`);}finally{s.closeAllConnections();await new Promise(r=>s.close(r));}}
test('SSE 跨字节中文、CRLF、心跳、推理和 usage：只返回完整回答',async()=>{
 const raw=': ping\r\n\r\n'+event({reasoning_content:'内部推理'})+event({content:'你好'})+event({content:'，完成。'},'stop')+'data: {"choices":[],"usage":{"total_tokens":20}}\r\n\r\ndata: [DONE]\r\n\r\n';
 const bytes=new TextEncoder().encode(raw);let i=0,canceled=false;
 const response=new Response(new ReadableStream({pull(c){if(i<bytes.length)c.enqueue(bytes.slice(i,i+=1));},cancel(){canceled=true;}}),{headers:{'content-type':'text/event-stream'}});
 const progress={};assert.equal(await readAnswer(response,10000,new AbortController().signal,progress),'你好，完成。');
 assert.equal(progress.generating,true);assert.equal(progress.mode,'stream');assert.equal(canceled,true,'DONE ends the reader without waiting for server EOF');
});
test('截断、只推理、工具调用、token 上限、坏协议、超大响应均不得冒充成功',async()=>{
 for(const [raw,pattern] of [[event({content:'半截'}),/提前结束/],[event({reasoning_content:'思考'},'stop'),/可用文字/],[event({tool_calls:[{}]}),/工具调用/],[event({content:'截断'},'length'),/token 上限/],['data: invalid\n\n',/./]])await assert.rejects(readAnswer(streamed(raw),10000,new AbortController().signal),pattern);
 await assert.rejects(readAnswer(streamed(event({content:'x'.repeat(300)})),100,new AbortController().signal),/响应超过/);
});
test('取消阻塞的流式响应读操作会释放 reader，不调用备用',async()=>{
 let canceled=false,calls=0;const controller=new AbortController();
 const c=config('http://127.0.0.1:9999/v1/chat/completions');c.purposes.at(-1).allowFallback=true;c.purposes.at(-1).modelIds=['text-model','reasoning-model'];c.models.at(-1).enabled=true;c.models.at(-1).model='qa-other';c.models.at(-1).url=c.models[0].url;
 const wait=callModel(c,{task:'测试'},{signal:controller.signal,fetchImpl:async()=>{calls++;return new Response(new ReadableStream({start(stream){stream.enqueue(new TextEncoder().encode(event({reasoning_content:'正在思考'})));},cancel(){canceled=true;}}),{headers:{'content-type':'text/event-stream'}});}});
 setTimeout(()=>controller.abort(),20);await assert.rejects(wait,/取消/);assert.equal(canceled,true);assert.equal(calls,1);
});
test('实际 HTTP：旧短上限超时，更长上限接收延迟回答成功，参数和一次请求不变',async()=>{
 let requests=0;
 await server(async(req,res)=>{let raw='';for await(const b of req)raw+=b;const body=JSON.parse(raw);requests++;assert.equal(body.stream,true);assert.equal(body.max_tokens,4096);res.writeHead(200,{'Content-Type':'text/event-stream'});res.write(event({reasoning_content:'推理中'}));const timer=setTimeout(()=>res.end(event({content:'完整结论'},'stop')+'data: [DONE]\n\n'),240);res.on('close',()=>clearTimeout(timer));},async url=>{
  await assert.rejects(callModel(config(url,100),{task:'测试'}),/模型仍在生成.*本地等待到期/);assert.equal(requests,1);
  const result=await callModel(config(url,800),{task:'测试'});assert.equal(result.answer,'完整结论');assert.equal(result.responseMode,'stream');assert.ok(result.elapsedMs>=200);assert.equal(requests,2);
 });
});
test('实际 HTTP：等待响应头超时与 HTTP 504 分别报告，不反射上游内容',async()=>{
 await server((_req,_res)=>{},async url=>{await assert.rejects(callModel(config(url,100),{task:'测试'}),/等待接口开始响应.*本地等待到期/);});
 await server((_req,res)=>{res.writeHead(504);res.end('private upstream error');},async url=>{await assert.rejects(callModel(config(url),{task:'测试'}),e=>/HTTP 504.*服务端或网关超时/.test(e.message)&&!e.message.includes('private'));});
});
test('接口忽略 stream 时可读取 JSON；显式兼容设置发送 stream:false',async()=>{
 let bodies=[];await server(async(req,res)=>{let raw='';for await(const b of req)raw+=b;bodies.push(JSON.parse(raw));res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{message:{content:'兼容 OK'},finish_reason:'stop'}]}));},async url=>{
  const c=config(url);assert.equal((await callModel(c,{task:'测试'})).responseMode,'json');c.models[0].responseMode='json';assert.equal((await callModel(c,{task:'测试'})).answer,'兼容 OK');assert.deepEqual(bodies.map(b=>b.stream),[true,false]);
 });
});
test('默认等待值、旧目录兼容和工具目录中等待信息可见',()=>{
 assert.deepEqual(example.models.map(m=>m.timeoutMs),[300000,600000,600000]);const old=structuredClone(example);delete old.models[0].responseMode;const c=validateConfig(old);assert.equal(c.models[0].responseMode,'stream');assert.equal(catalog(c).models[0].timeoutMs,300000);assert.equal(catalog(c).models[0].responseMode,'stream');assert.throws(()=>validateConfig({...c,models:c.models.map(m=>({...m,responseMode:'other'}))}));
});
