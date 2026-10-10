const fail=message=>{throw Error(message);};
const content=value=>typeof value==='string'?value:Array.isArray(value)?value.filter(x=>x.type==='text').map(x=>x.text).join('\n'):'';

// Native fetch aborts its body reader; explicitly cancel also covers adapted
// response streams and prevents a blocked read from surviving plugin disposal.
async function* chunks(response,maxBytes,signal){
  if(!response.body)fail('模型未返回响应体');
  const reader=response.body.getReader();let size=0;
  const abort=()=>{reader.cancel(signal.reason).catch(()=>{});};
  signal.addEventListener('abort',abort,{once:true});
  try{
    while(true){
      signal.throwIfAborted();const {done,value}=await reader.read();signal.throwIfAborted();
      if(done)break;
      size+=value.byteLength;if(size>maxBytes)fail('模型响应超过配置上限');
      yield value;
    }
  }finally{signal.removeEventListener('abort',abort);await reader.cancel().catch(()=>{});reader.releaseLock();}
}

export async function readAnswer(response,maxBytes,signal,progress={}){
  const stream=/^text\/event-stream\b/i.test(response.headers.get('content-type')??'');
  progress.mode=stream?'stream':'json';
  if(!stream){
    const parts=[];for await(const part of chunks(response,maxBytes,signal))parts.push(part);
    const data=JSON.parse(Buffer.concat(parts).toString('utf8')),choice=data.choices?.[0],msg=choice?.message;
    if(choice?.finish_reason==='length')fail('模型输出达到 token 上限，请调整 requestParams 后重新调用');
    const answer=content(msg?.content);
    if(!answer||msg?.tool_calls?.length)fail('模型未返回可用文字结果，本工具不执行辅助模型的工具调用');
    return answer;
  }
  const decoder=new TextDecoder('utf-8',{fatal:true}),parts=[];
  let pending='',complete=false,finishReason;
  function frame(raw){
    const data=raw.split(/\r?\n|\r/).filter(line=>line.startsWith('data:')).map(line=>line.slice(5).replace(/^ /,'')).join('\n');
    if(!data)return;
    if(data.trim()==='[DONE]'){complete=true;return;}
    const packet=JSON.parse(data);
    if(packet.error)fail('模型未返回正常结果，流式接口报告错误');
    const choice=packet.choices?.find(c=>c.index===0)??packet.choices?.[0];
    if(!choice)return; // usage-only chunk
    const delta=choice.delta??choice.message??{};
    if(delta.tool_calls?.length||delta.function_call)fail('模型未返回可用文字结果，本工具不执行辅助模型的工具调用');
    if(delta.reasoning_content||delta.reasoning)progress.generating=true;
    const text=content(delta.content);if(text){parts.push(text);progress.generating=true;}
    if(choice.finish_reason!=null)finishReason=choice.finish_reason;
    if(finishReason==='length')fail('模型输出达到 token 上限，请调整 requestParams 后重新调用');
    if(finishReason==='content_filter')fail('模型未返回完整结果，接口中止了输出');
  }
  for await(const part of chunks(response,maxBytes,signal)){
    pending+=decoder.decode(part,{stream:true});
    let separator;
    while((separator=/\r?\n\r?\n|\r\r/.exec(pending))){
      frame(pending.slice(0,separator.index));pending=pending.slice(separator.index+separator[0].length);
      if(complete)break;
    }
    if(complete)break;
  }
  if(!complete){pending+=decoder.decode();if(pending.trim())frame(pending);}
  if(!complete&&finishReason!=='stop')fail('模型未返回完整结果，流式连接提前结束；未将部分内容当作成功');
  const answer=parts.join('');if(!answer)fail('模型未返回可用文字结果');
  return answer;
}
