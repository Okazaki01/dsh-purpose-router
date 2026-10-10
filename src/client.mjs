import {createElement as h,useEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react';
import defaults from '../config.example.json' with {type:'json'};
import {validateConfig,route,createModelConfig,MAX_MODELS} from './catalog.mjs';
export const inject=['slots','configForms','connection'];
export const name='purpose-model-router-config';
export const CONFIG_KEY='dsh-purpose-router#purpose-model-router';
export function readDesktopConfig(form){
  if(!form || form.state.status!=='ready')throw Error('配置尚未加载，请重新读取。');
  const json=form.state.value?.catalogJson;
  return json?validateConfig(JSON.parse(json)):structuredClone(defaults);
}
export async function saveDesktopConfig(config,form,revision){
  if(!form || form.state.status!=='ready' || !form.state.writable)throw Error('当前配置不可保存，请重新读取。');
  const c=structuredClone(config),ops=[];
  for(const m of c.models)if(m.apiKey!==undefined){
    if(typeof m.apiKey!=='string'||/[\r\n]/.test(m.apiKey)||m.apiKey.length>16384)throw Error('API Key 格式不正确');
    ops.push(m.apiKey.trim()?{op:'set',path:['apiKeys',m.id],value:m.apiKey.trim()}:{op:'unset',path:['apiKeys',m.id]});
    m.apiKeyEnv='';delete m.apiKey;
  }
  for(const m of readDesktopConfig(form).models)if(!c.models.some(row=>row.id===m.id))ops.push({op:'unset',path:['apiKeys',m.id]});
  const json=JSON.stringify(validateConfig(c));
  if(new TextEncoder().encode(json).length>1048576)throw Error('配置过大');
  ops.unshift({op:'set',path:['catalogJson'],value:json});
  if(!await form.mutate(ops,revision))throw Error('保存未被接受，请重新读取后重试，原配置保留。');
  return c;
}
export function normalizeEndpoint(value){
  const url=value.trim().replace(/\/+$/,'');
  try{const parsed=new URL(url);if(parsed.pathname===''||parsed.pathname==='/')return url+'/v1/chat/completions';if(parsed.pathname==='/v1')return url+'/chat/completions';}catch{}
  return url;
}
const uid=prefix=>prefix+'-'+globalThis.crypto.randomUUID().replaceAll('-','');
const friendlyError=error=>{
  const message=error.message||'操作未完成，请重试。';
  if(message.includes('HTTP 401'))return '认证失败：请检查 API Key 是否正确、是否有此模型的权限。（401）';
  if(message.includes('HTTP 403'))return '接口拒绝访问：请检查账号和模型权限。（403）';
  if(message.includes('HTTP 404'))return '找不到接口或模型：请检查接口地址和模型名称。（404）';
  if(message.includes('HTTP 429'))return '接口限流或额度不足：请检查服务商余额与限制。（429）';
  if(error.name==='AbortError')return '已取消连接测试。';
  return message;
};
const css=`.dsh-pr{font:14px/1.6 system-ui;color:inherit;max-width:1040px}.dsh-pr h2{font-size:21px;margin:18px 0 8px}.dsh-pr p{opacity:.85}.dsh-pr article,.dsh-pr .card{border:1px solid #8793a340;border-radius:14px;padding:20px;margin:14px 0}.dsh-pr .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.dsh-pr label{display:block}.dsh-pr input:not([type=checkbox]),.dsh-pr textarea,.dsh-pr select{box-sizing:border-box;width:100%;font:inherit;color:inherit;background:transparent;border:1px solid #8793a366;border-radius:8px;padding:10px;margin-top:6px}.dsh-pr option{color:#273341;background:#f4f6fa}.dsh-pr textarea{min-height:90px;resize:vertical}.dsh-pr button{font:inherit;padding:9px 16px;border:0;border-radius:9px;cursor:pointer;color:white;background:#2867df;margin:4px 8px 4px 0}.dsh-pr .secondary{background:#8793a322;color:inherit}.dsh-pr .danger{background:#e553531a;color:inherit}.dsh-pr .wide{grid-column:1/-1}.dsh-pr .head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.dsh-pr .note{background:#2867df10;border-radius:10px;padding:12px}.dsh-pr .status{padding:12px;border-radius:10px;background:#8793a315;white-space:pre-wrap}.dsh-pr button:disabled{opacity:.45;cursor:default}.dsh-pr summary{cursor:pointer;font-weight:600}.dsh-pr .advanced{margin-top:16px}.dsh-pr .advanced .grid{margin-top:12px}.dsh-pr .key{display:flex;align-items:center;gap:6px}.dsh-pr .key input{flex:1}.dsh-pr .key button{white-space:nowrap;margin:6px 0 0}.dsh-pr .tag{font-size:12px;opacity:.7;margin-left:12px}.dsh-pr small{display:block;margin:5px 0;opacity:.7}@media(max-width:650px){.dsh-pr .grid{grid-template-columns:1fr}}`;
function KeyField({value,onChange}){
  const [show,setShow]=useState(false);
  return h('label',null,'API Key',h('div',{className:'key'},h('input',{type:show?'text':'password',value:value??'',autoComplete:'off',placeholder:'直接粘贴；留空保留已保存的密钥',onChange:e=>onChange(e.target.value||undefined)}),h('button',{type:'button',className:'secondary',onClick:()=>setShow(v=>!v)},show?'隐藏':'显示')),h('small',null,'直接填写，不需要环境变量。密钥保存在 Harness 本地。'),h('button',{type:'button',className:'secondary',onClick:()=>onChange('')},'清除已保存的密钥'),value===''?h('small',null,'保存后将清除密钥；本地免密接口可使用。'):null);
}
function JsonField({value,onChange}){
  const [raw,setRaw]=useState(()=>JSON.stringify(value,null,2));
  return h('label',null,'额外请求参数（可不填）',h('textarea',{value:raw,onChange:e=>{setRaw(e.target.value);try{const v=JSON.parse(e.target.value);if(!v||typeof v!=='object'||Array.isArray(v))throw Error();e.target.setCustomValidity('');onChange(v);}catch{e.target.setCustomValidity('参数应为合法的 JSON 对象');}}}));
}
export function RouterConfigPage({view,form,testConnection}){
  const [config,setConfig]=useState(()=>{try{return readDesktopConfig(form);}catch{return structuredClone(defaults);}});
  const [message,setMessage]=useState('先填写模型连接，再给用途选择模型。保存后立即供下一次调用使用。');
  const [busy,setBusy]=useState(false),[testing,setTesting]=useState(null),[results,setResults]=useState({});
  const [tab,setTab]=useState('models');
  const [chosen,setChosen]=useState(''),[task,setTask]=useState('请分析这个任务'),[preview,setPreview]=useState('');
  const root=useRef(null),revision=useRef(form?.state.revision),saved=useRef(null),initialized=useRef(form?.state.status==='ready'),abort=useRef(null);
  useEffect(()=>()=>abort.current?.abort(),[]);
  useEffect(()=>{if(!initialized.current&&form?.state.status==='ready'){setConfig(readDesktopConfig(form));revision.current=form.state.revision;initialized.current=true;}if(saved.current&&form?.state.value?.catalogJson===saved.current){revision.current=form.state.revision;saved.current=null;}},[form?.state.status,form?.state.revision,form?.state.value?.catalogJson]);
  const ready=form?.state.status==='ready',writable=ready&&form.state.writable;
  const editModel=(i,patch)=>{setConfig(old=>({...old,models:old.models.map((m,n)=>n===i?{...m,...patch}:m)}));setResults({});};
  const editPurpose=(i,patch)=>setConfig(old=>({...old,purposes:old.purposes.map((p,n)=>n===i?{...p,...patch}:p)}));
  const field=(label,value,change,placeholder)=>h('label',null,label,h('input',{value,placeholder,onChange:e=>change(e.target.value)}));
  const check=(label,value,change)=>h('label',null,h('input',{type:'checkbox',checked:value,onChange:e=>change(e.target.checked)}),' ',label);
  const valid=()=>[...root.current.querySelectorAll('input,textarea')].every(el=>el.reportValidity());
  const dropModel=id=>{const linked=config.purposes.filter(p=>p.modelIds.includes(id));if(linked.length){setMessage('请先为这些用途更换模型，再删除：'+linked.map(p=>p.label).join('、'));return;}setConfig(c=>({...c,models:c.models.filter(m=>m.id!==id)}));};
  const dropPurpose=id=>{if(config.purposes.length===1){setMessage('至少保留一个用途。');return;}setConfig(c=>({...c,purposes:c.purposes.filter(p=>p.id!==id),defaultPurpose:c.defaultPurpose===id?c.purposes.find(p=>p.id!==id).id:c.defaultPurpose}));};
  if(view==='summary')return h('span',null,'中文用途 · 下拉选择模型 · 直接填写 API Key');
  if(!ready)return h('p',null,'配置尚未加载，请返回设置并重新读取。');
  return h('div',{className:'dsh-pr',ref:root},h('style',null,css),h('div',{className:'head'},h('h2',null,'用途与模型'),h('div',null,
    h('button',{className:'secondary',disabled:busy||testing!==null,onClick:()=>{try{setConfig(readDesktopConfig(form));revision.current=form.state.revision;setMessage('已读取保存配置；已保存的 API Key 不会显示原文。');setResults({});}catch(e){setMessage(e.message);}}},'重新读取'),
    h('button',{disabled:!writable||busy||testing!==null,onClick:async()=>{if(!valid())return;setBusy(true);try{const result=await saveDesktopConfig(config,form,revision.current);saved.current=JSON.stringify(result);setConfig(result);revision.current=form.state.revision;setMessage('已保存。下一次辅助调用使用这份配置；无需重启。');}catch(e){setMessage(e.message);}finally{setBusy(false);}}},busy?'正在保存…':'保存并生效'))),
    h('div',{className:'status',role:'status'},message),h('p',{className:'note'},'① 添加模型，填写接口地址、模型名称和 API Key。② 用中文命名用途，在下拉框选择模型。支持兼容 OpenAI 的聊天接口。'),
    h('nav',null,h('button',{className:tab==='models'?undefined:'secondary',onClick:()=>setTab('models')},'① 模型连接'),h('button',{className:tab==='purposes'?undefined:'secondary',onClick:()=>setTab('purposes')},'② 任务用途')),
    tab==='models'?h('div',{className:'head'},h('h2',null,`模型连接（${config.models.length}/${MAX_MODELS}）`),h('button',{className:'secondary',disabled:busy||testing!==null||config.models.length>=MAX_MODELS,onClick:()=>setConfig(c=>c.models.length>=MAX_MODELS?c:({...c,models:[createModelConfig(uid('m')),...c.models]}))},'添加模型')):null,
    tab==='models'?h('p',null,'可继续添加不同服务商或同一服务商的多个模型；每个模型独立保存地址、密钥和等待设置。新模型默认最多等待 10 分钟并逐步接收结果。'):null,
    ...(tab==='models'?config.models.map((m,i)=>h('details',{className:'card',key:m.id,open:i===0?true:undefined},h('summary',null,m.label,h('span',{className:'tag'},m.enabled?'已启用':'待填写 / 未启用')),h('div',{className:'grid'},
      field('显示名称',m.label,v=>editModel(i,{label:v}),'例如：我的识图模型'),field('模型名称（服务商提供）',m.model,v=>editModel(i,{model:v}),'例如：deepseek-chat'),
      h('label',{className:'wide'},'接口地址',h('input',{value:m.url,placeholder:'例如：https://api.deepseek.com/v1',onChange:e=>editModel(i,{url:e.target.value}),onBlur:e=>editModel(i,{url:normalizeEndpoint(e.target.value)})}),h('small',null,'可填根地址、/v1 或完整 /chat/completions 地址；自动补齐常见地址。')),
      h(KeyField,{value:m.apiKey,onChange:v=>editModel(i,{apiKey:v,...(v!==undefined?{apiKeyEnv:''}:{})})}),
      h('div',null,h('label',null,'等待方案',h('select',{value:'',onChange:e=>{if(e.target.value)editModel(i,{timeoutMs:Number(e.target.value)});}},h('option',{value:''},'选择预设，或直接填写下方秒数'),h('option',{value:'300000'},'普通任务 · 5 分钟'),h('option',{value:'600000'},'识图 / 复杂推理 · 10 分钟'))),h('label',null,'最长等待（秒）',h('input',{type:'number',min:.1,max:600,step:.1,value:m.timeoutMs/1000,onChange:e=>editModel(i,{timeoutMs:Math.round(Number(e.target.value)*1000)})})),h('small',null,'仅影响此模型，包含排队、推理和回答。填写秒数即可自定义；可随时取消。')),
      h('div',null,check('这个模型可以看图片',m.capabilities.includes('vision'),v=>{if(!v&&config.purposes.some(p=>p.requires.includes('vision')&&p.modelIds.includes(m.id))){setMessage('此模型正在用于识图，请先更换相关用途的模型。');return;}editModel(i,{capabilities:v?[...new Set([...m.capabilities,'vision'])]:m.capabilities.filter(x=>x!=='vision')});}),h('small',null,'按服务商实际能力勾选。'),check('启用这个模型',m.enabled,v=>editModel(i,{enabled:v}))),
      h('div',{className:'wide'},h('button',{disabled:testing!==null||busy||!testConnection,onClick:async()=>{if(!valid())return;const controller=new AbortController();abort.current=controller;setTesting(m.id);setResults(r=>({...r,[m.id]:'正在发出一次测试请求…'}));try{const result=await testConnection({...m,url:normalizeEndpoint(m.url)},controller.signal);setResults(r=>({...r,[m.id]:result.message}));}catch(e){setResults(r=>({...r,[m.id]:friendlyError(e)}));}finally{setTesting(null);abort.current=null;}}},testing===m.id?'测试中…':'测试连接'),testing===m.id?h('button',{className:'secondary',onClick:()=>abort.current?.abort()},'取消测试'):null,h('small',null,'会发一次短文字请求，可能产生接口费用。不自动保存或改用其他模型。'),results[m.id]?h('p',{role:'status'},results[m.id]):null),
      h('details',{className:'wide advanced'},h('summary',null,'高级选项（通常不用改）'),h('div',{className:'grid'},h('label',null,'结果接收方式',h('select',{value:m.responseMode??'stream',onChange:e=>editModel(i,{responseMode:e.target.value})},h('option',{value:'stream'},'逐步接收（推荐）'),h('option',{value:'json'},'等待完整回答（兼容）')),h('small',null,'后台逐步接收，完整回答后交给主模型。接口不支持时可改为兼容方式。')),h(JsonField,{key:m.id,value:m.requestParams,onChange:v=>editModel(i,{requestParams:v})}))),h('div',{className:'wide'},h('button',{className:'danger',onClick:()=>dropModel(m.id)},'删除这个模型'))))):[]),
    tab==='purposes'?h('div',{className:'head'},h('h2',null,'任务用途'),h('button',{className:'secondary',onClick:()=>setConfig(c=>({...c,purposes:[{id:uid('p'),label:'新用途',description:'请填写什么时候使用这个用途，以及回答要求。',keywords:[],priority:10,requires:['text'],modelIds:[c.models[0].id],allowFallback:false,systemPrompt:''},...c.purposes]}))},'添加用途')):null,
    ...(tab==='purposes'?config.purposes.map((p,i)=>h('details',{className:'card',key:p.id,open:i===0?true:undefined},h('summary',null,p.label),h('div',{className:'grid'},field('用途名称',p.label,v=>editPurpose(i,{label:v}),'例如：美术复核、翻译、识图'),h('label',null,'使用哪个模型',h('select',{value:p.modelIds[0],onChange:e=>{const m=config.models.find(m=>m.id===e.target.value);if(p.requires.includes('vision')&&!m.capabilities.includes('vision')){setMessage('这个用途需要看图片，请选择支持识图的模型，或先取消下方的识图要求。');return;}editPurpose(i,{modelIds:[m.id],requires:p.requires.includes('vision')?['vision']:['text'],allowFallback:false});}},...config.models.map(m=>h('option',{key:m.id,value:m.id},m.label+(m.enabled?'':'（未启用）'))))),
      h('label',{className:'wide'},'用途说明',h('textarea',{value:p.systemPrompt&&p.systemPrompt!==p.description?p.description+'\n'+p.systemPrompt:p.description,placeholder:'例如：遇到参考图时使用，指出可见问题并区分事实和推测。',onChange:e=>editPurpose(i,{description:e.target.value,systemPrompt:e.target.value})}),h('small',null,'写清楚什么时候用、希望怎样回答。一处填写即可。')),
      h('div',{className:'wide'},check('这个用途需要看图片',p.requires.includes('vision'),v=>{const m=config.models.find(m=>m.id===p.modelIds[0]);if(v&&!m.capabilities.includes('vision')){setMessage('请先选择已勾选“可以看图片”的模型。');return;}editPurpose(i,{requires:v?['vision']:['text']});}),check('没有匹配时，使用这个用途',config.defaultPurpose===p.id,v=>{if(v)setConfig(c=>({...c,defaultPurpose:p.id}));})),
      h('details',{className:'wide advanced'},h('summary',null,'高级：关键词匹配与备用模型'),h('small',null,'主模型按用途说明选择。关键词仅用于自动预选，留空也能使用。'),h('label',null,'匹配关键词（逗号分隔）',h('input',{defaultValue:p.keywords.join('，'),onBlur:e=>editPurpose(i,{keywords:[...new Set(e.target.value.split(/[,，]/).map(v=>v.trim()).filter(Boolean))]})})),h('label',null,'匹配优先级',h('input',{type:'number',value:p.priority,onChange:e=>editPurpose(i,{priority:Number(e.target.value)})})),h('label',null,'备用模型',h('select',{value:p.modelIds[1]??'',onChange:e=>{const m=config.models.find(m=>m.id===e.target.value);if(m&&p.requires.some(v=>!m.capabilities.includes(v))){setMessage('备用模型不支持此用途所需能力。');return;}editPurpose(i,{modelIds:e.target.value?[p.modelIds[0],e.target.value]:[p.modelIds[0]],allowFallback:!!e.target.value});}},h('option',{value:''},'不使用备用模型'),...config.models.filter(m=>m.id!==p.modelIds[0]).map(m=>h('option',{key:m.id,value:m.id},m.label)))),h('small',null,'选择备用后，失败会将任务发送给备用接口，可能额外计费。')),h('div',{className:'wide'},h('button',{className:'danger',onClick:()=>dropPurpose(p.id)},'删除这个用途'))))):[]),
    h('details',{className:'card'},h('summary',null,'检查用途选择（不请求模型）'),h('label',null,'用途',h('select',{value:chosen,onChange:e=>setChosen(e.target.value)},h('option',{value:''},'自动预选'),...config.purposes.map(p=>h('option',{key:p.id,value:p.id},p.label)))),field('任务',task,setTask,'填写要做的事'),h('button',{className:'secondary',onClick:()=>{try{const r=route(validateConfig(config),{purpose:chosen||'auto',task});setPreview('用途：'+r.purposeLabel+'\n模型：'+config.models.find(m=>m.id===r.modelId).label+'\n'+r.reason);}catch(e){setPreview(e.message);}}},'检查选择'),h('p',{className:'status'},preview)));
}
export async function setRouterEnabled(form,value){
  const state=form.getSnapshot();if(state.status!=='ready'||!state.writable)throw Error('设置尚未可写，请重新读取。');
  if(!await form.mutate([{op:'set',path:['enabled'],value}],state.revision))throw Error('开关未更新，请刷新后重试，原配置保留。');
}
export function RouterSettingsPage({getForm,refresh,close,testConnection}){
  const store=useMemo(()=>getForm(),[getForm]),state=useSyncExternalStore(listener=>store.subscribe(listener),()=>store.getSnapshot());
  const [editing,setEditing]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const form={state,mutate:(ops,revision)=>store.mutate(ops,revision)};let config;try{config=readDesktopConfig(form);}catch{}
  if(editing)return h('div',{className:'dsh-pr'},h('style',null,css),h('button',{className:'secondary',onClick:()=>setEditing(false)},'返回插件设置'),h(RouterConfigPage,{view:'page',form,testConnection}));
  const ready=state.status==='ready';
  return h('section',{className:'dsh-pr'},h('style',null,css),h('h2',null,'用途模型路由'),h('p',null,'识图用识图模型，翻译用翻译模型。你可以添加自己的中文用途。'),h('article',null,h('label',null,h('input',{type:'checkbox',checked:state.value?.enabled!==false,disabled:!ready||!state.writable||busy,onChange:async e=>{setBusy(true);try{await setRouterEnabled(store,e.target.checked);setMessage('调用开关已更新。');}catch(e){setMessage(e.message);}finally{setBusy(false);}}}),' 允许调用辅助模型'),h('p',null,config?`${config.models.filter(m=>m.enabled).length} 个已启用模型 · ${config.purposes.length} 个用途`:'正在读取配置…'),h('button',{disabled:!ready,onClick:()=>setEditing(true)},'配置用途与模型'),h('button',{className:'secondary',disabled:busy,onClick:async()=>{setBusy(true);try{await refresh?.();setMessage('已重新读取配置。');}catch(e){setMessage(e.message);}finally{setBusy(false);}}},'重新读取配置'),!ready?h('p',{className:'note'},'后台配置未就绪，请重新读取；仍不可用时检查插件是否启用。'):null,h('p',null,'直接填写 API Key、接口地址和模型名称，再给用途选择模型。保存后无需重启。')),h('p',null,'主模型按照用途说明调用辅助模型，再整合结果。接口调用可能计费；连接测试会发出一次短请求。'),h('div',{className:'status',role:'status'},message),close?h('button',{className:'secondary',onClick:close},'关闭设置'):null);
}
export function apply(ctx){
  const testConnection=async(model,signal)=>{const r=await ctx.connection.rpc.call('/api','purpose-router/test',{model},signal);if(!r.ok)throw Error(r.error.message);return r.value;};
  ctx.effect(()=>ctx.slots.inject('plugins.row.config',()=>ctx.slots.register({name:'plugins.row.config',key:CONFIG_KEY,inject:()=>({testConnection})},RouterConfigPage)),'purpose-router:desktop-config');
  ctx.effect(()=>ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:'purpose-model-router',order:55,label:'用途模型路由',inject:()=>({getForm:()=>ctx.configForms.get('purpose-model-router'),refresh:()=>ctx.configForms.describe().load(),testConnection})},RouterSettingsPage)),'purpose-router:settings-entry');
}
