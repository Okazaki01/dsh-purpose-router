const ID = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const ENV = /^[A-Za-z_][A-Za-z0-9_]*$/;
const RESERVED = new Set(['model', 'messages', 'stream', 'tools', 'tool_choice', 'functions', 'function_call']);
const fail = message => { throw new Error(message); };
export const MAX_MODELS=100;
export const DEFAULT_MODEL_TIMEOUT_MS=600000;
export function createModelConfig(id){
  return {id,label:'新模型',enabled:false,protocol:'openai-chat',url:'https://YOUR-PROVIDER.example/v1/chat/completions',model:'YOUR-MODEL',capabilities:['text'],apiKeyEnv:'',timeoutMs:DEFAULT_MODEL_TIMEOUT_MS,responseMode:'stream',requestParams:{},headerEnv:{}};
}
const object = x => x && typeof x === 'object' && !Array.isArray(x);
const text = (x, name, max = 2000) => typeof x === 'string' && x.trim() && x.length <= max || fail(`${name} 必须是非空文本（最多 ${max} 字符）`);
const number = (x, name, min, max) => Number.isSafeInteger(x) && x >= min && x <= max || fail(`${name} 必须是 ${min}–${max} 的整数`);
const strings = (x, name, allowEmpty = false) => {
  if (!Array.isArray(x) || (!allowEmpty && !x.length) || x.some(s => typeof s !== 'string' || !s.trim()) || new Set(x).size !== x.length) fail(`${name} 必须是无重复的文本数组`);
};
function keys(value, allowed, label) {
  if (!object(value)) fail(`${label} 必须是对象`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${label} 含未知字段 ${key}`);
}
export function validateConfig(input) {
  const c = structuredClone(input);
  keys(c, ['version', 'defaultPurpose', 'limits', 'models', 'purposes'], '配置');
  if (c.version !== 1) fail('不支持此配置版本');
  if (!Array.isArray(c.models) || !Array.isArray(c.purposes) || !c.models.length || !c.purposes.length) fail('至少需要一个模型与一个用途');
  if (c.models.length > MAX_MODELS || c.purposes.length > 100) fail('模型与用途各最多 100 个');
  keys(c.limits, ['maxPromptChars', 'maxImages', 'maxImageBytes', 'maxResponseBytes'], 'limits');
  number(c.limits.maxPromptChars, 'maxPromptChars', 1, 1000000);
  number(c.limits.maxImages, 'maxImages', 0, 32);
  number(c.limits.maxImageBytes, 'maxImageBytes', 1, 50000000);
  number(c.limits.maxResponseBytes, 'maxResponseBytes', 100, 20000000);
  const modelIds = new Set();
  for (const m of c.models) {
    keys(m, ['id', 'label', 'enabled', 'protocol', 'url', 'model', 'capabilities', 'apiKey', 'apiKeyEnv', 'timeoutMs', 'responseMode', 'requestParams', 'headerEnv'], '模型');
    m.responseMode??='stream';
    if(m.timeoutMs===undefined)m.timeoutMs=DEFAULT_MODEL_TIMEOUT_MS;
    if(!['stream','json'].includes(m.responseMode))fail('结果接收方式只能是 stream 或 json');
    m.apiKeyEnv ??= '';
    if (m.apiKey !== undefined && (typeof m.apiKey !== 'string' || m.apiKey.length > 16384 || /[\r\n]/.test(m.apiKey))) fail('API Key 格式不正确');
    if (typeof m.id !== 'string' || !ID.test(m.id) || modelIds.has(m.id)) fail('模型 ID 非法或重复');
    modelIds.add(m.id); text(m.label, '模型名称'); text(m.model, 'model', 256);
    if (m.protocol !== 'openai-chat') fail(`模型 ${m.id} 仅支持 openai-chat 协议`);
    if (typeof m.enabled !== 'boolean') fail('enabled 必须是布尔值');
    let u; try { u = new URL(m.url); } catch { fail('模型 URL 非法'); }
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || u.search || u.hash) fail('URL 必须是完整 HTTP(S) 接口地址，不含密钥、查询或片段');
    if (u.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)) fail('远程接口必须使用 HTTPS，本机接口可用 HTTP');
    if (m.enabled && (u.hostname.endsWith('.example') || m.model.startsWith('YOUR-'))) fail(`“${m.label}”尚未配置，请填写接口地址和模型名称后启用`);
    strings(m.capabilities, 'capabilities');
    if (typeof m.apiKeyEnv !== 'string' || m.apiKeyEnv && !ENV.test(m.apiKeyEnv)) fail('apiKeyEnv 只能填写环境变量名称，或留空');
    number(m.timeoutMs, 'timeoutMs', 100, 600000);
    if (!object(m.requestParams)) fail('requestParams 必须是 JSON 对象');
    for (const k of Object.keys(m.requestParams)) if (RESERVED.has(k) || /key|token$|secret|password|authorization/i.test(k) && !['max_tokens', 'max_completion_tokens'].includes(k)) fail(`请求参数不能包含 ${k}，请在 API Key 栏填写密钥`);
    keys(m.headerEnv, Object.keys(m.headerEnv ?? {}), 'headerEnv');
    for (const [h, e] of Object.entries(m.headerEnv)) if (!/^[A-Za-z0-9-]+$/.test(h) || !ENV.test(e) || /^(authorization|content-type|host|content-length|cookie)$/i.test(h)) fail('headerEnv 应为安全请求头名称 → 环境变量名称，不能覆盖授权或协议请求头');
  }
  const purposeIds = new Set();
  for (const p of c.purposes) {
    keys(p, ['id', 'label', 'description', 'keywords', 'priority', 'requires', 'modelIds', 'allowFallback', 'systemPrompt'], '用途');
    if (typeof p.id !== 'string' || !ID.test(p.id) || purposeIds.has(p.id)) fail('用途 ID 非法或重复');
    purposeIds.add(p.id); text(p.label, '用途名称'); text(p.description, '用途说明',16000);
    strings(p.keywords, 'keywords', true); strings(p.requires, 'requires'); strings(p.modelIds, 'modelIds');
    number(p.priority, 'priority', -1000, 1000);
    if (typeof p.allowFallback !== 'boolean' || typeof p.systemPrompt !== 'string' || p.systemPrompt.length > 16000) fail('用途备用开关或 systemPrompt 非法');
    for (const id of p.modelIds) {
      const m = c.models.find(x => x.id === id);
      if (!m) fail(`“${p.label}”选择的模型已不存在，请重新选择模型`);
      if (p.requires.some(r => !m.capabilities.includes(r))) fail(`“${p.label}”与“${m.label}”能力不匹配，请更换模型或修改识图要求`);
    }
  }
  if (!purposeIds.has(c.defaultPurpose)) fail('defaultPurpose 必须引用现有用途');
  if(new Set(c.purposes.map(p=>p.label)).size!==c.purposes.length)fail('用途名称不能重复，请给每个用途起一个不同的中文名称');
  return c;
}
export function catalog(c) {
  return { version: c.version, defaultPurpose: c.defaultPurpose,
    purposes: c.purposes.map(({id,label,description,requires,modelIds,allowFallback}) => ({id,label,description,requires,modelIds,allowFallback})),
    models: c.models.map(({id,label,model,capabilities,enabled,timeoutMs,responseMode}) => ({id,label,model,capabilities,enabled,timeoutMs,responseMode})) };
}
export function route(c, { purpose = 'auto', task, imageCount = 0 }) {
  text(task, 'task', c.limits.maxPromptChars); number(imageCount, 'imageCount', 0, c.limits.maxImages);
  let p, reason;
  if (purpose !== 'auto') {
    p = c.purposes.find(x => x.id === purpose);
    if (!p) { const matches=c.purposes.filter(x=>x.label===purpose); if(matches.length>1) fail('用途名称重复，请先修改为不同名称'); p=matches[0]; }
    if (!p) fail(`不存在用途 ${purpose}`);
    reason = '主模型按具体目标明确选择用途';
  } else {
    let candidates = c.purposes.filter(x => !imageCount || x.requires.includes('vision'));
    const lowered = task.toLowerCase();
    const matched = candidates.filter(x => x.keywords.some(k => lowered.includes(k.toLowerCase()))).sort((a,b) => b.priority - a.priority);
    if (matched.length) {
      if (matched[1]?.priority === matched[0].priority) fail('多个用途同优先级匹配，请明确 purpose');
      p = matched[0]; reason = '关键词匹配与用途优先级';
    } else if (imageCount) {
      if (candidates.length !== 1) fail('图片任务需要明确视觉用途，请查看用途目录后指定 purpose');
      p = candidates[0]; reason = '输入含图片，唯一视觉用途';
    } else { p = c.purposes.find(x => x.id === c.defaultPurpose); reason = '无匹配时使用默认用途'; }
  }
  if (imageCount && !p.requires.includes('vision')) fail('含图片的目标必须使用 requires 包含 vision 的用途');
  const eligible = p.modelIds.map(id => c.models.find(x => x.id === id)).filter(m => m.enabled);
  if (!eligible.length) fail(`用途 ${p.label} 没有启用的模型，请先配置`);
  return { purposeId: p.id, purposeLabel: p.label, modelId: eligible[0].id, model: eligible[0].model, reason,
    candidates: (p.allowFallback ? eligible : eligible.slice(0,1)).map(m => m.id), fallbackEnabled: p.allowFallback };
}
