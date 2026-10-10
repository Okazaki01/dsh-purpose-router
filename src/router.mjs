import { readFile } from 'node:fs/promises';
import { validateConfig, catalog, route } from './catalog.mjs';
import {readAnswer} from './response.mjs';
export { validateConfig, catalog, route };
const fail = message => { throw new Error(message); };
const strings = (x, name, allowEmpty = false) => {
  if (!Array.isArray(x) || (!allowEmpty && !x.length) || x.some(s => typeof s !== 'string' || !s.trim()) || new Set(x).size !== x.length) fail(name + ' 必须是无重复的文本数组');
};
export async function loadConfig(path) {
  let raw;
  try { raw = await readFile(path, 'utf8'); } catch { fail('无法读取用途配置，请打开设置中的用途模型路由完成配置，或核对 configPath'); }
  if (Buffer.byteLength(raw) > 1024 * 1024) fail('配置文件超过 1 MiB');
  let value; try { value = JSON.parse(raw.replace(/^\uFEFF/, '')); } catch { fail('配置不是有效 JSON'); }
  return validateConfig(value);
}
export function imageMime(bytes) {
  if (bytes[0] === 137 && Buffer.from(bytes.slice(1,8)).equals(Buffer.from([80,78,71,13,10,26,10]))) return 'image/png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  const b = Buffer.from(bytes);
  if (['GIF87a', 'GIF89a'].includes(b.toString('ascii',0,6))) return 'image/gif';
  if (b.toString('ascii',0,4) === 'RIFF' && b.toString('ascii',8,12) === 'WEBP') return 'image/webp';
  fail('图片内容不是支持的 PNG/JPEG/GIF/WebP');
}
export async function callModel(c, args, { signal, readImage, fetchImpl = fetch, env = process.env } = {}) {
  const paths = args.imagePaths ?? [];
  strings(paths, 'imagePaths', true); // Do not silently omit requested images.
  const selected = route(c, { ...args, imageCount: paths.length });
  signal?.throwIfAborted();
  const p = c.purposes.find(x => x.id === selected.purposeId);
  const images = [];
  for (const path of paths) {
    if (!readImage) fail('未提供 Harness 文件读取能力');
    const bytes = await readImage(path, c.limits.maxImageBytes, signal);
    if (bytes.length > c.limits.maxImageBytes) fail('图片超过配置上限');
    images.push({type:'image_url',image_url:{url:`data:${imageMime(bytes)};base64,${Buffer.from(bytes).toString('base64')}`}});
  }
  const attempted = [];
  for (const id of selected.candidates) {
    signal?.throwIfAborted();
    const m = c.models.find(x => x.id === id);
    const apiKey=m.apiKey?.trim() || (m.apiKeyEnv ? env[m.apiKeyEnv] : '');
    if (m.apiKeyEnv && !apiKey) fail('此旧连接的密钥尚未配置，请在 API Key 栏直接填写');
    const headers = {'Content-Type':'application/json'};
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    for (const [h,e] of Object.entries(m.headerEnv)) {
      if (!env[e]) fail(`缺少环境变量 ${e}`); headers[h] = env[e];
    }
    const content = images.length ? [{type:'text',text:args.task}, ...images] : args.task;
    const instructions=p.systemPrompt || p.description;
    const messages = [...(instructions ? [{role:'system',content:instructions}] : []), {role:'user',content}];
    const timeout = AbortSignal.timeout(m.timeoutMs);
    const combined = signal ? AbortSignal.any([signal,timeout]) : timeout;
    const started=performance.now(),progress={headers:false,generating:false};
    attempted.push(id);
    try {
      const res = await fetchImpl(m.url, {method:'POST',headers,redirect:'error',signal:combined,
        body:JSON.stringify({...m.requestParams,model:m.model,messages,stream:m.responseMode!=='json'})});
      progress.headers=true;
      if (!res.ok) { await res.body?.cancel(); fail(`模型接口 HTTP ${res.status}`+([408,504].includes(res.status)?'（服务端或网关超时，尚未得到完整结果）':'')); }
      const answer=await readAnswer(res,c.limits.maxResponseBytes,combined,progress);
      return { ...selected, modelId:id, model:m.model, attemptedModelIds:attempted, answer,elapsedMs:Math.round(performance.now()-started),responseMode:progress.mode };
    } catch (error) {
      if (signal?.aborted) fail('模型调用已取消');
      if (attempted.length < selected.candidates.length) continue;
      // Do not persist upstream bodies, URLs, headers, or low-level errors containing credentials.
      if (timeout.aborted) fail(`模型“${m.label}”请求超时：已等待 ${(performance.now()-started)/1000|0} 秒，上限 ${m.timeoutMs/1000} 秒；${progress.generating?'模型仍在生成，未得到完整回答':progress.headers?'已收到响应头，等待完整回答':'等待接口开始响应'}。本地等待到期，未自动重试。`);
      if (['UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT','ETIMEDOUT'].includes(error.cause?.code??error.code))fail('模型网络等待超时（响应头或响应内容）；未得到完整结果，未自动重试');
      if (/^模型接口 HTTP \d+|^模型未返回|^模型输出达到|^模型响应超过/.test(error.message)) throw error;
      fail('模型请求失败（连接、解码或协议错误）；未记录密钥或上游响应体');
    }
  }
}

// One actual request to the selected connection, never fallback to another provider.
export async function testConnection(model,options={}) {
  const c=validateConfig({version:1,defaultPurpose:'test',limits:{maxPromptChars:2000,maxImages:0,maxImageBytes:1,maxResponseBytes:65536},models:[{...model,enabled:true}],purposes:[{id:'test',label:'连接测试',description:'连接测试，请只回复 OK。',systemPrompt:'只回复 OK。',keywords:[],priority:0,requires:['text'],modelIds:[model.id],allowFallback:false}]});
  const result=await callModel(c,{purpose:'test',task:'请回复 OK，确认接口可以正常返回文字。'},options);
  return {ok:true,model:result.model,message:'连接成功，模型已返回文字。此测试不验证识图能力。'};
}
