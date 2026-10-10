// DeepSeek Harness browser module registry, matching the official 0.2.0-rc.2 client bundle format.
window.__ModuleLoader__.load({id:'dsh-purpose-router',factory:(require)=>{const module={exports:{}};const exports=module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.mjs
var client_exports = {};
__export(client_exports, {
  CONFIG_KEY: () => CONFIG_KEY,
  RouterConfigPage: () => RouterConfigPage,
  RouterSettingsPage: () => RouterSettingsPage,
  apply: () => apply,
  inject: () => inject,
  name: () => name,
  normalizeEndpoint: () => normalizeEndpoint,
  readDesktopConfig: () => readDesktopConfig,
  saveDesktopConfig: () => saveDesktopConfig,
  setRouterEnabled: () => setRouterEnabled
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");

// config.example.json
var config_example_default = {
  version: 1,
  defaultPurpose: "general",
  limits: {
    maxPromptChars: 6e4,
    maxImages: 6,
    maxImageBytes: 10485760,
    maxResponseBytes: 4194304
  },
  models: [
    {
      id: "text-model",
      label: "\u65E5\u5E38\u6587\u5B57\u6A21\u578B",
      enabled: false,
      protocol: "openai-chat",
      url: "https://YOUR-PROVIDER.example/v1/chat/completions",
      model: "YOUR-TEXT-MODEL",
      capabilities: [
        "text"
      ],
      apiKeyEnv: "",
      timeoutMs: 3e5,
      requestParams: {
        max_tokens: 4096
      },
      headerEnv: {},
      responseMode: "stream"
    },
    {
      id: "vision-model",
      label: "\u89C6\u89C9\u7406\u89E3\u6A21\u578B",
      enabled: false,
      protocol: "openai-chat",
      url: "https://YOUR-PROVIDER.example/v1/chat/completions",
      model: "YOUR-VISION-MODEL",
      capabilities: [
        "text",
        "vision"
      ],
      apiKeyEnv: "",
      timeoutMs: 6e5,
      requestParams: {
        max_tokens: 4096
      },
      headerEnv: {},
      responseMode: "stream"
    },
    {
      id: "reasoning-model",
      label: "\u89C4\u5212\u4E0E\u590D\u6742\u63A8\u7406\u6A21\u578B",
      enabled: false,
      protocol: "openai-chat",
      url: "https://YOUR-PROVIDER.example/v1/chat/completions",
      model: "YOUR-REASONING-MODEL",
      capabilities: [
        "text",
        "reasoning",
        "code"
      ],
      apiKeyEnv: "",
      timeoutMs: 6e5,
      requestParams: {
        max_tokens: 8192
      },
      headerEnv: {},
      responseMode: "stream"
    }
  ],
  purposes: [
    {
      id: "vision",
      label: "\u8BC6\u56FE\u7406\u89E3",
      description: "\u8BFB\u622A\u56FE\u3001\u7406\u89E3\u53C2\u8003\u56FE\u3001\u5206\u6790\u56FE\u8868\u4E0E\u89C6\u89C9\u5E03\u5C40\u3002 \u6839\u636E\u63D0\u4F9B\u7684\u771F\u5B9E\u56FE\u7247\u56DE\u7B54\u3002\u533A\u5206\u53EF\u89C1\u4E8B\u5B9E\u548C\u63A8\u65AD\uFF1B\u770B\u4E0D\u6E05\u6216\u8D44\u6599\u4E0D\u8DB3\u65F6\u660E\u786E\u8BF4\u660E\u3002",
      keywords: [
        "\u8BC6\u56FE",
        "\u622A\u56FE",
        "\u53C2\u8003\u56FE",
        "\u56FE\u8868",
        "\u56FE\u7247",
        "image",
        "screenshot"
      ],
      priority: 100,
      requires: [
        "vision"
      ],
      modelIds: [
        "vision-model"
      ],
      allowFallback: false,
      systemPrompt: "\u8BFB\u622A\u56FE\u3001\u7406\u89E3\u53C2\u8003\u56FE\u3001\u5206\u6790\u56FE\u8868\u4E0E\u89C6\u89C9\u5E03\u5C40\u3002 \u6839\u636E\u63D0\u4F9B\u7684\u771F\u5B9E\u56FE\u7247\u56DE\u7B54\u3002\u533A\u5206\u53EF\u89C1\u4E8B\u5B9E\u548C\u63A8\u65AD\uFF1B\u770B\u4E0D\u6E05\u6216\u8D44\u6599\u4E0D\u8DB3\u65F6\u660E\u786E\u8BF4\u660E\u3002"
    },
    {
      id: "planning",
      label: "\u89C4\u5212\u4E0E\u63A8\u7406",
      description: "\u590D\u6742\u4EFB\u52A1\u62C6\u89E3\u3001\u6280\u672F\u65B9\u6848\u6BD4\u8F83\u3001\u6839\u56E0\u63A8\u7406\u3002 \u56F4\u7ED5\u6307\u5B9A\u76EE\u6807\u7ED9\u51FA\u5177\u4F53\u3001\u53EF\u68C0\u67E5\u7684\u5206\u6790\uFF0C\u8BF4\u660E\u5173\u952E\u5047\u8BBE\u3002",
      keywords: [
        "\u89C4\u5212",
        "\u65B9\u6848",
        "\u63A8\u7406",
        "\u6839\u56E0",
        "plan",
        "reason"
      ],
      priority: 40,
      requires: [
        "text"
      ],
      modelIds: [
        "reasoning-model"
      ],
      allowFallback: false,
      systemPrompt: "\u590D\u6742\u4EFB\u52A1\u62C6\u89E3\u3001\u6280\u672F\u65B9\u6848\u6BD4\u8F83\u3001\u6839\u56E0\u63A8\u7406\u3002 \u56F4\u7ED5\u6307\u5B9A\u76EE\u6807\u7ED9\u51FA\u5177\u4F53\u3001\u53EF\u68C0\u67E5\u7684\u5206\u6790\uFF0C\u8BF4\u660E\u5173\u952E\u5047\u8BBE\u3002"
    },
    {
      id: "coding",
      label: "\u4EE3\u7801\u8F85\u52A9",
      description: "\u9488\u5BF9\u6307\u5B9A\u4EE3\u7801\u7247\u6BB5\u7ED9\u51FA\u5B9E\u73B0\u4E0E\u95EE\u9898\u5206\u6790\u3002 \u53EA\u5206\u6790\u63D0\u4F9B\u7684\u4EE3\u7801\u548C\u76EE\u6807\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FD0\u884C\u6D4B\u8BD5\u6216\u4FEE\u6539\u6587\u4EF6\u3002",
      keywords: [
        "\u4EE3\u7801",
        "\u7F16\u7A0B",
        "bug",
        "code",
        "debug"
      ],
      priority: 30,
      requires: [
        "text"
      ],
      modelIds: [
        "reasoning-model"
      ],
      allowFallback: false,
      systemPrompt: "\u9488\u5BF9\u6307\u5B9A\u4EE3\u7801\u7247\u6BB5\u7ED9\u51FA\u5B9E\u73B0\u4E0E\u95EE\u9898\u5206\u6790\u3002 \u53EA\u5206\u6790\u63D0\u4F9B\u7684\u4EE3\u7801\u548C\u76EE\u6807\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FD0\u884C\u6D4B\u8BD5\u6216\u4FEE\u6539\u6587\u4EF6\u3002"
    },
    {
      id: "general",
      label: "\u65E5\u5E38\u6587\u5B57",
      description: "\u666E\u901A\u603B\u7ED3\u3001\u6539\u5199\u548C\u6587\u672C\u8F85\u52A9\u3002 \u51C6\u786E\u3001\u7B80\u6D01\u5730\u5B8C\u6210\u6307\u5B9A\u6587\u672C\u4EFB\u52A1\u3002",
      keywords: [],
      priority: 0,
      requires: [
        "text"
      ],
      modelIds: [
        "text-model"
      ],
      allowFallback: false,
      systemPrompt: "\u666E\u901A\u603B\u7ED3\u3001\u6539\u5199\u548C\u6587\u672C\u8F85\u52A9\u3002 \u51C6\u786E\u3001\u7B80\u6D01\u5730\u5B8C\u6210\u6307\u5B9A\u6587\u672C\u4EFB\u52A1\u3002"
    }
  ]
};

// src/catalog.mjs
var ID = /^[a-z0-9][a-z0-9_-]{0,63}$/;
var ENV = /^[A-Za-z_][A-Za-z0-9_]*$/;
var RESERVED = /* @__PURE__ */ new Set(["model", "messages", "stream", "tools", "tool_choice", "functions", "function_call"]);
var fail = (message) => {
  throw new Error(message);
};
var MAX_MODELS = 100;
var DEFAULT_MODEL_TIMEOUT_MS = 6e5;
function createModelConfig(id) {
  return { id, label: "\u65B0\u6A21\u578B", enabled: false, protocol: "openai-chat", url: "https://YOUR-PROVIDER.example/v1/chat/completions", model: "YOUR-MODEL", capabilities: ["text"], apiKeyEnv: "", timeoutMs: DEFAULT_MODEL_TIMEOUT_MS, responseMode: "stream", requestParams: {}, headerEnv: {} };
}
var object = (x) => x && typeof x === "object" && !Array.isArray(x);
var text = (x, name2, max = 2e3) => typeof x === "string" && x.trim() && x.length <= max || fail(`${name2} \u5FC5\u987B\u662F\u975E\u7A7A\u6587\u672C\uFF08\u6700\u591A ${max} \u5B57\u7B26\uFF09`);
var number = (x, name2, min, max) => Number.isSafeInteger(x) && x >= min && x <= max || fail(`${name2} \u5FC5\u987B\u662F ${min}\u2013${max} \u7684\u6574\u6570`);
var strings = (x, name2, allowEmpty = false) => {
  if (!Array.isArray(x) || !allowEmpty && !x.length || x.some((s) => typeof s !== "string" || !s.trim()) || new Set(x).size !== x.length) fail(`${name2} \u5FC5\u987B\u662F\u65E0\u91CD\u590D\u7684\u6587\u672C\u6570\u7EC4`);
};
function keys(value, allowed, label) {
  if (!object(value)) fail(`${label} \u5FC5\u987B\u662F\u5BF9\u8C61`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${label} \u542B\u672A\u77E5\u5B57\u6BB5 ${key}`);
}
function validateConfig(input) {
  const c = structuredClone(input);
  keys(c, ["version", "defaultPurpose", "limits", "models", "purposes"], "\u914D\u7F6E");
  if (c.version !== 1) fail("\u4E0D\u652F\u6301\u6B64\u914D\u7F6E\u7248\u672C");
  if (!Array.isArray(c.models) || !Array.isArray(c.purposes) || !c.models.length || !c.purposes.length) fail("\u81F3\u5C11\u9700\u8981\u4E00\u4E2A\u6A21\u578B\u4E0E\u4E00\u4E2A\u7528\u9014");
  if (c.models.length > MAX_MODELS || c.purposes.length > 100) fail("\u6A21\u578B\u4E0E\u7528\u9014\u5404\u6700\u591A 100 \u4E2A");
  keys(c.limits, ["maxPromptChars", "maxImages", "maxImageBytes", "maxResponseBytes"], "limits");
  number(c.limits.maxPromptChars, "maxPromptChars", 1, 1e6);
  number(c.limits.maxImages, "maxImages", 0, 32);
  number(c.limits.maxImageBytes, "maxImageBytes", 1, 5e7);
  number(c.limits.maxResponseBytes, "maxResponseBytes", 100, 2e7);
  const modelIds = /* @__PURE__ */ new Set();
  for (const m of c.models) {
    keys(m, ["id", "label", "enabled", "protocol", "url", "model", "capabilities", "apiKey", "apiKeyEnv", "timeoutMs", "responseMode", "requestParams", "headerEnv"], "\u6A21\u578B");
    m.responseMode ??= "stream";
    if (m.timeoutMs === void 0) m.timeoutMs = DEFAULT_MODEL_TIMEOUT_MS;
    if (!["stream", "json"].includes(m.responseMode)) fail("\u7ED3\u679C\u63A5\u6536\u65B9\u5F0F\u53EA\u80FD\u662F stream \u6216 json");
    m.apiKeyEnv ??= "";
    if (m.apiKey !== void 0 && (typeof m.apiKey !== "string" || m.apiKey.length > 16384 || /[\r\n]/.test(m.apiKey))) fail("API Key \u683C\u5F0F\u4E0D\u6B63\u786E");
    if (typeof m.id !== "string" || !ID.test(m.id) || modelIds.has(m.id)) fail("\u6A21\u578B ID \u975E\u6CD5\u6216\u91CD\u590D");
    modelIds.add(m.id);
    text(m.label, "\u6A21\u578B\u540D\u79F0");
    text(m.model, "model", 256);
    if (m.protocol !== "openai-chat") fail(`\u6A21\u578B ${m.id} \u4EC5\u652F\u6301 openai-chat \u534F\u8BAE`);
    if (typeof m.enabled !== "boolean") fail("enabled \u5FC5\u987B\u662F\u5E03\u5C14\u503C");
    let u;
    try {
      u = new URL(m.url);
    } catch {
      fail("\u6A21\u578B URL \u975E\u6CD5");
    }
    if (!["http:", "https:"].includes(u.protocol) || u.username || u.password || u.search || u.hash) fail("URL \u5FC5\u987B\u662F\u5B8C\u6574 HTTP(S) \u63A5\u53E3\u5730\u5740\uFF0C\u4E0D\u542B\u5BC6\u94A5\u3001\u67E5\u8BE2\u6216\u7247\u6BB5");
    if (u.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)) fail("\u8FDC\u7A0B\u63A5\u53E3\u5FC5\u987B\u4F7F\u7528 HTTPS\uFF0C\u672C\u673A\u63A5\u53E3\u53EF\u7528 HTTP");
    if (m.enabled && (u.hostname.endsWith(".example") || m.model.startsWith("YOUR-"))) fail(`\u201C${m.label}\u201D\u5C1A\u672A\u914D\u7F6E\uFF0C\u8BF7\u586B\u5199\u63A5\u53E3\u5730\u5740\u548C\u6A21\u578B\u540D\u79F0\u540E\u542F\u7528`);
    strings(m.capabilities, "capabilities");
    if (typeof m.apiKeyEnv !== "string" || m.apiKeyEnv && !ENV.test(m.apiKeyEnv)) fail("apiKeyEnv \u53EA\u80FD\u586B\u5199\u73AF\u5883\u53D8\u91CF\u540D\u79F0\uFF0C\u6216\u7559\u7A7A");
    number(m.timeoutMs, "timeoutMs", 100, 6e5);
    if (!object(m.requestParams)) fail("requestParams \u5FC5\u987B\u662F JSON \u5BF9\u8C61");
    for (const k of Object.keys(m.requestParams)) if (RESERVED.has(k) || /key|token$|secret|password|authorization/i.test(k) && !["max_tokens", "max_completion_tokens"].includes(k)) fail(`\u8BF7\u6C42\u53C2\u6570\u4E0D\u80FD\u5305\u542B ${k}\uFF0C\u8BF7\u5728 API Key \u680F\u586B\u5199\u5BC6\u94A5`);
    keys(m.headerEnv, Object.keys(m.headerEnv ?? {}), "headerEnv");
    for (const [h2, e] of Object.entries(m.headerEnv)) if (!/^[A-Za-z0-9-]+$/.test(h2) || !ENV.test(e) || /^(authorization|content-type|host|content-length|cookie)$/i.test(h2)) fail("headerEnv \u5E94\u4E3A\u5B89\u5168\u8BF7\u6C42\u5934\u540D\u79F0 \u2192 \u73AF\u5883\u53D8\u91CF\u540D\u79F0\uFF0C\u4E0D\u80FD\u8986\u76D6\u6388\u6743\u6216\u534F\u8BAE\u8BF7\u6C42\u5934");
  }
  const purposeIds = /* @__PURE__ */ new Set();
  for (const p of c.purposes) {
    keys(p, ["id", "label", "description", "keywords", "priority", "requires", "modelIds", "allowFallback", "systemPrompt"], "\u7528\u9014");
    if (typeof p.id !== "string" || !ID.test(p.id) || purposeIds.has(p.id)) fail("\u7528\u9014 ID \u975E\u6CD5\u6216\u91CD\u590D");
    purposeIds.add(p.id);
    text(p.label, "\u7528\u9014\u540D\u79F0");
    text(p.description, "\u7528\u9014\u8BF4\u660E", 16e3);
    strings(p.keywords, "keywords", true);
    strings(p.requires, "requires");
    strings(p.modelIds, "modelIds");
    number(p.priority, "priority", -1e3, 1e3);
    if (typeof p.allowFallback !== "boolean" || typeof p.systemPrompt !== "string" || p.systemPrompt.length > 16e3) fail("\u7528\u9014\u5907\u7528\u5F00\u5173\u6216 systemPrompt \u975E\u6CD5");
    for (const id of p.modelIds) {
      const m = c.models.find((x) => x.id === id);
      if (!m) fail(`\u201C${p.label}\u201D\u9009\u62E9\u7684\u6A21\u578B\u5DF2\u4E0D\u5B58\u5728\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u6A21\u578B`);
      if (p.requires.some((r) => !m.capabilities.includes(r))) fail(`\u201C${p.label}\u201D\u4E0E\u201C${m.label}\u201D\u80FD\u529B\u4E0D\u5339\u914D\uFF0C\u8BF7\u66F4\u6362\u6A21\u578B\u6216\u4FEE\u6539\u8BC6\u56FE\u8981\u6C42`);
    }
  }
  if (!purposeIds.has(c.defaultPurpose)) fail("defaultPurpose \u5FC5\u987B\u5F15\u7528\u73B0\u6709\u7528\u9014");
  if (new Set(c.purposes.map((p) => p.label)).size !== c.purposes.length) fail("\u7528\u9014\u540D\u79F0\u4E0D\u80FD\u91CD\u590D\uFF0C\u8BF7\u7ED9\u6BCF\u4E2A\u7528\u9014\u8D77\u4E00\u4E2A\u4E0D\u540C\u7684\u4E2D\u6587\u540D\u79F0");
  return c;
}
function route(c, { purpose = "auto", task, imageCount = 0 }) {
  text(task, "task", c.limits.maxPromptChars);
  number(imageCount, "imageCount", 0, c.limits.maxImages);
  let p, reason;
  if (purpose !== "auto") {
    p = c.purposes.find((x) => x.id === purpose);
    if (!p) {
      const matches = c.purposes.filter((x) => x.label === purpose);
      if (matches.length > 1) fail("\u7528\u9014\u540D\u79F0\u91CD\u590D\uFF0C\u8BF7\u5148\u4FEE\u6539\u4E3A\u4E0D\u540C\u540D\u79F0");
      p = matches[0];
    }
    if (!p) fail(`\u4E0D\u5B58\u5728\u7528\u9014 ${purpose}`);
    reason = "\u4E3B\u6A21\u578B\u6309\u5177\u4F53\u76EE\u6807\u660E\u786E\u9009\u62E9\u7528\u9014";
  } else {
    let candidates = c.purposes.filter((x) => !imageCount || x.requires.includes("vision"));
    const lowered = task.toLowerCase();
    const matched = candidates.filter((x) => x.keywords.some((k) => lowered.includes(k.toLowerCase()))).sort((a, b) => b.priority - a.priority);
    if (matched.length) {
      if (matched[1]?.priority === matched[0].priority) fail("\u591A\u4E2A\u7528\u9014\u540C\u4F18\u5148\u7EA7\u5339\u914D\uFF0C\u8BF7\u660E\u786E purpose");
      p = matched[0];
      reason = "\u5173\u952E\u8BCD\u5339\u914D\u4E0E\u7528\u9014\u4F18\u5148\u7EA7";
    } else if (imageCount) {
      if (candidates.length !== 1) fail("\u56FE\u7247\u4EFB\u52A1\u9700\u8981\u660E\u786E\u89C6\u89C9\u7528\u9014\uFF0C\u8BF7\u67E5\u770B\u7528\u9014\u76EE\u5F55\u540E\u6307\u5B9A purpose");
      p = candidates[0];
      reason = "\u8F93\u5165\u542B\u56FE\u7247\uFF0C\u552F\u4E00\u89C6\u89C9\u7528\u9014";
    } else {
      p = c.purposes.find((x) => x.id === c.defaultPurpose);
      reason = "\u65E0\u5339\u914D\u65F6\u4F7F\u7528\u9ED8\u8BA4\u7528\u9014";
    }
  }
  if (imageCount && !p.requires.includes("vision")) fail("\u542B\u56FE\u7247\u7684\u76EE\u6807\u5FC5\u987B\u4F7F\u7528 requires \u5305\u542B vision \u7684\u7528\u9014");
  const eligible = p.modelIds.map((id) => c.models.find((x) => x.id === id)).filter((m) => m.enabled);
  if (!eligible.length) fail(`\u7528\u9014 ${p.label} \u6CA1\u6709\u542F\u7528\u7684\u6A21\u578B\uFF0C\u8BF7\u5148\u914D\u7F6E`);
  return {
    purposeId: p.id,
    purposeLabel: p.label,
    modelId: eligible[0].id,
    model: eligible[0].model,
    reason,
    candidates: (p.allowFallback ? eligible : eligible.slice(0, 1)).map((m) => m.id),
    fallbackEnabled: p.allowFallback
  };
}

// src/client.mjs
var inject = ["slots", "configForms", "connection"];
var name = "purpose-model-router-config";
var CONFIG_KEY = "dsh-purpose-router#purpose-model-router";
function readDesktopConfig(form) {
  if (!form || form.state.status !== "ready") throw Error("\u914D\u7F6E\u5C1A\u672A\u52A0\u8F7D\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u3002");
  const json = form.state.value?.catalogJson;
  return json ? validateConfig(JSON.parse(json)) : structuredClone(config_example_default);
}
async function saveDesktopConfig(config, form, revision) {
  if (!form || form.state.status !== "ready" || !form.state.writable) throw Error("\u5F53\u524D\u914D\u7F6E\u4E0D\u53EF\u4FDD\u5B58\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u3002");
  const c = structuredClone(config), ops = [];
  for (const m of c.models) if (m.apiKey !== void 0) {
    if (typeof m.apiKey !== "string" || /[\r\n]/.test(m.apiKey) || m.apiKey.length > 16384) throw Error("API Key \u683C\u5F0F\u4E0D\u6B63\u786E");
    ops.push(m.apiKey.trim() ? { op: "set", path: ["apiKeys", m.id], value: m.apiKey.trim() } : { op: "unset", path: ["apiKeys", m.id] });
    m.apiKeyEnv = "";
    delete m.apiKey;
  }
  for (const m of readDesktopConfig(form).models) if (!c.models.some((row) => row.id === m.id)) ops.push({ op: "unset", path: ["apiKeys", m.id] });
  const json = JSON.stringify(validateConfig(c));
  if (new TextEncoder().encode(json).length > 1048576) throw Error("\u914D\u7F6E\u8FC7\u5927");
  ops.unshift({ op: "set", path: ["catalogJson"], value: json });
  if (!await form.mutate(ops, revision)) throw Error("\u4FDD\u5B58\u672A\u88AB\u63A5\u53D7\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u91CD\u8BD5\uFF0C\u539F\u914D\u7F6E\u4FDD\u7559\u3002");
  return c;
}
function normalizeEndpoint(value) {
  const url = value.trim().replace(/\/+$/, "");
  try {
    const parsed = new URL(url);
    if (parsed.pathname === "" || parsed.pathname === "/") return url + "/v1/chat/completions";
    if (parsed.pathname === "/v1") return url + "/chat/completions";
  } catch {
  }
  return url;
}
var uid = (prefix) => prefix + "-" + globalThis.crypto.randomUUID().replaceAll("-", "");
var friendlyError = (error) => {
  const message = error.message || "\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002";
  if (message.includes("HTTP 401")) return "\u8BA4\u8BC1\u5931\u8D25\uFF1A\u8BF7\u68C0\u67E5 API Key \u662F\u5426\u6B63\u786E\u3001\u662F\u5426\u6709\u6B64\u6A21\u578B\u7684\u6743\u9650\u3002\uFF08401\uFF09";
  if (message.includes("HTTP 403")) return "\u63A5\u53E3\u62D2\u7EDD\u8BBF\u95EE\uFF1A\u8BF7\u68C0\u67E5\u8D26\u53F7\u548C\u6A21\u578B\u6743\u9650\u3002\uFF08403\uFF09";
  if (message.includes("HTTP 404")) return "\u627E\u4E0D\u5230\u63A5\u53E3\u6216\u6A21\u578B\uFF1A\u8BF7\u68C0\u67E5\u63A5\u53E3\u5730\u5740\u548C\u6A21\u578B\u540D\u79F0\u3002\uFF08404\uFF09";
  if (message.includes("HTTP 429")) return "\u63A5\u53E3\u9650\u6D41\u6216\u989D\u5EA6\u4E0D\u8DB3\uFF1A\u8BF7\u68C0\u67E5\u670D\u52A1\u5546\u4F59\u989D\u4E0E\u9650\u5236\u3002\uFF08429\uFF09";
  if (error.name === "AbortError") return "\u5DF2\u53D6\u6D88\u8FDE\u63A5\u6D4B\u8BD5\u3002";
  return message;
};
var css = `.dsh-pr{font:14px/1.6 system-ui;color:inherit;max-width:1040px}.dsh-pr h2{font-size:21px;margin:18px 0 8px}.dsh-pr p{opacity:.85}.dsh-pr article,.dsh-pr .card{border:1px solid #8793a340;border-radius:14px;padding:20px;margin:14px 0}.dsh-pr .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.dsh-pr label{display:block}.dsh-pr input:not([type=checkbox]),.dsh-pr textarea,.dsh-pr select{box-sizing:border-box;width:100%;font:inherit;color:inherit;background:transparent;border:1px solid #8793a366;border-radius:8px;padding:10px;margin-top:6px}.dsh-pr option{color:#273341;background:#f4f6fa}.dsh-pr textarea{min-height:90px;resize:vertical}.dsh-pr button{font:inherit;padding:9px 16px;border:0;border-radius:9px;cursor:pointer;color:white;background:#2867df;margin:4px 8px 4px 0}.dsh-pr .secondary{background:#8793a322;color:inherit}.dsh-pr .danger{background:#e553531a;color:inherit}.dsh-pr .wide{grid-column:1/-1}.dsh-pr .head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.dsh-pr .note{background:#2867df10;border-radius:10px;padding:12px}.dsh-pr .status{padding:12px;border-radius:10px;background:#8793a315;white-space:pre-wrap}.dsh-pr button:disabled{opacity:.45;cursor:default}.dsh-pr summary{cursor:pointer;font-weight:600}.dsh-pr .advanced{margin-top:16px}.dsh-pr .advanced .grid{margin-top:12px}.dsh-pr .key{display:flex;align-items:center;gap:6px}.dsh-pr .key input{flex:1}.dsh-pr .key button{white-space:nowrap;margin:6px 0 0}.dsh-pr .tag{font-size:12px;opacity:.7;margin-left:12px}.dsh-pr small{display:block;margin:5px 0;opacity:.7}@media(max-width:650px){.dsh-pr .grid{grid-template-columns:1fr}}`;
function KeyField({ value, onChange }) {
  const [show, setShow] = (0, import_react.useState)(false);
  return (0, import_react.createElement)("label", null, "API Key", (0, import_react.createElement)("div", { className: "key" }, (0, import_react.createElement)("input", { type: show ? "text" : "password", value: value ?? "", autoComplete: "off", placeholder: "\u76F4\u63A5\u7C98\u8D34\uFF1B\u7559\u7A7A\u4FDD\u7559\u5DF2\u4FDD\u5B58\u7684\u5BC6\u94A5", onChange: (e) => onChange(e.target.value || void 0) }), (0, import_react.createElement)("button", { type: "button", className: "secondary", onClick: () => setShow((v) => !v) }, show ? "\u9690\u85CF" : "\u663E\u793A")), (0, import_react.createElement)("small", null, "\u76F4\u63A5\u586B\u5199\uFF0C\u4E0D\u9700\u8981\u73AF\u5883\u53D8\u91CF\u3002\u5BC6\u94A5\u4FDD\u5B58\u5728 Harness \u672C\u5730\u3002"), (0, import_react.createElement)("button", { type: "button", className: "secondary", onClick: () => onChange("") }, "\u6E05\u9664\u5DF2\u4FDD\u5B58\u7684\u5BC6\u94A5"), value === "" ? (0, import_react.createElement)("small", null, "\u4FDD\u5B58\u540E\u5C06\u6E05\u9664\u5BC6\u94A5\uFF1B\u672C\u5730\u514D\u5BC6\u63A5\u53E3\u53EF\u4F7F\u7528\u3002") : null);
}
function JsonField({ value, onChange }) {
  const [raw, setRaw] = (0, import_react.useState)(() => JSON.stringify(value, null, 2));
  return (0, import_react.createElement)("label", null, "\u989D\u5916\u8BF7\u6C42\u53C2\u6570\uFF08\u53EF\u4E0D\u586B\uFF09", (0, import_react.createElement)("textarea", { value: raw, onChange: (e) => {
    setRaw(e.target.value);
    try {
      const v = JSON.parse(e.target.value);
      if (!v || typeof v !== "object" || Array.isArray(v)) throw Error();
      e.target.setCustomValidity("");
      onChange(v);
    } catch {
      e.target.setCustomValidity("\u53C2\u6570\u5E94\u4E3A\u5408\u6CD5\u7684 JSON \u5BF9\u8C61");
    }
  } }));
}
function RouterConfigPage({ view, form, testConnection }) {
  const [config, setConfig] = (0, import_react.useState)(() => {
    try {
      return readDesktopConfig(form);
    } catch {
      return structuredClone(config_example_default);
    }
  });
  const [message, setMessage] = (0, import_react.useState)("\u5148\u586B\u5199\u6A21\u578B\u8FDE\u63A5\uFF0C\u518D\u7ED9\u7528\u9014\u9009\u62E9\u6A21\u578B\u3002\u4FDD\u5B58\u540E\u7ACB\u5373\u4F9B\u4E0B\u4E00\u6B21\u8C03\u7528\u4F7F\u7528\u3002");
  const [busy, setBusy] = (0, import_react.useState)(false), [testing, setTesting] = (0, import_react.useState)(null), [results, setResults] = (0, import_react.useState)({});
  const [tab, setTab] = (0, import_react.useState)("models");
  const [chosen, setChosen] = (0, import_react.useState)(""), [task, setTask] = (0, import_react.useState)("\u8BF7\u5206\u6790\u8FD9\u4E2A\u4EFB\u52A1"), [preview, setPreview] = (0, import_react.useState)("");
  const root = (0, import_react.useRef)(null), revision = (0, import_react.useRef)(form?.state.revision), saved = (0, import_react.useRef)(null), initialized = (0, import_react.useRef)(form?.state.status === "ready"), abort = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => () => abort.current?.abort(), []);
  (0, import_react.useEffect)(() => {
    if (!initialized.current && form?.state.status === "ready") {
      setConfig(readDesktopConfig(form));
      revision.current = form.state.revision;
      initialized.current = true;
    }
    if (saved.current && form?.state.value?.catalogJson === saved.current) {
      revision.current = form.state.revision;
      saved.current = null;
    }
  }, [form?.state.status, form?.state.revision, form?.state.value?.catalogJson]);
  const ready = form?.state.status === "ready", writable = ready && form.state.writable;
  const editModel = (i, patch) => {
    setConfig((old) => ({ ...old, models: old.models.map((m, n) => n === i ? { ...m, ...patch } : m) }));
    setResults({});
  };
  const editPurpose = (i, patch) => setConfig((old) => ({ ...old, purposes: old.purposes.map((p, n) => n === i ? { ...p, ...patch } : p) }));
  const field = (label, value, change, placeholder) => (0, import_react.createElement)("label", null, label, (0, import_react.createElement)("input", { value, placeholder, onChange: (e) => change(e.target.value) }));
  const check = (label, value, change) => (0, import_react.createElement)("label", null, (0, import_react.createElement)("input", { type: "checkbox", checked: value, onChange: (e) => change(e.target.checked) }), " ", label);
  const valid = () => [...root.current.querySelectorAll("input,textarea")].every((el) => el.reportValidity());
  const dropModel = (id) => {
    const linked = config.purposes.filter((p) => p.modelIds.includes(id));
    if (linked.length) {
      setMessage("\u8BF7\u5148\u4E3A\u8FD9\u4E9B\u7528\u9014\u66F4\u6362\u6A21\u578B\uFF0C\u518D\u5220\u9664\uFF1A" + linked.map((p) => p.label).join("\u3001"));
      return;
    }
    setConfig((c) => ({ ...c, models: c.models.filter((m) => m.id !== id) }));
  };
  const dropPurpose = (id) => {
    if (config.purposes.length === 1) {
      setMessage("\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\u7528\u9014\u3002");
      return;
    }
    setConfig((c) => ({ ...c, purposes: c.purposes.filter((p) => p.id !== id), defaultPurpose: c.defaultPurpose === id ? c.purposes.find((p) => p.id !== id).id : c.defaultPurpose }));
  };
  if (view === "summary") return (0, import_react.createElement)("span", null, "\u4E2D\u6587\u7528\u9014 \xB7 \u4E0B\u62C9\u9009\u62E9\u6A21\u578B \xB7 \u76F4\u63A5\u586B\u5199 API Key");
  if (!ready) return (0, import_react.createElement)("p", null, "\u914D\u7F6E\u5C1A\u672A\u52A0\u8F7D\uFF0C\u8BF7\u8FD4\u56DE\u8BBE\u7F6E\u5E76\u91CD\u65B0\u8BFB\u53D6\u3002");
  return (0, import_react.createElement)(
    "div",
    { className: "dsh-pr", ref: root },
    (0, import_react.createElement)("style", null, css),
    (0, import_react.createElement)("div", { className: "head" }, (0, import_react.createElement)("h2", null, "\u7528\u9014\u4E0E\u6A21\u578B"), (0, import_react.createElement)(
      "div",
      null,
      (0, import_react.createElement)("button", { className: "secondary", disabled: busy || testing !== null, onClick: () => {
        try {
          setConfig(readDesktopConfig(form));
          revision.current = form.state.revision;
          setMessage("\u5DF2\u8BFB\u53D6\u4FDD\u5B58\u914D\u7F6E\uFF1B\u5DF2\u4FDD\u5B58\u7684 API Key \u4E0D\u4F1A\u663E\u793A\u539F\u6587\u3002");
          setResults({});
        } catch (e) {
          setMessage(e.message);
        }
      } }, "\u91CD\u65B0\u8BFB\u53D6"),
      (0, import_react.createElement)("button", { disabled: !writable || busy || testing !== null, onClick: async () => {
        if (!valid()) return;
        setBusy(true);
        try {
          const result = await saveDesktopConfig(config, form, revision.current);
          saved.current = JSON.stringify(result);
          setConfig(result);
          revision.current = form.state.revision;
          setMessage("\u5DF2\u4FDD\u5B58\u3002\u4E0B\u4E00\u6B21\u8F85\u52A9\u8C03\u7528\u4F7F\u7528\u8FD9\u4EFD\u914D\u7F6E\uFF1B\u65E0\u9700\u91CD\u542F\u3002");
        } catch (e) {
          setMessage(e.message);
        } finally {
          setBusy(false);
        }
      } }, busy ? "\u6B63\u5728\u4FDD\u5B58\u2026" : "\u4FDD\u5B58\u5E76\u751F\u6548")
    )),
    (0, import_react.createElement)("div", { className: "status", role: "status" }, message),
    (0, import_react.createElement)("p", { className: "note" }, "\u2460 \u6DFB\u52A0\u6A21\u578B\uFF0C\u586B\u5199\u63A5\u53E3\u5730\u5740\u3001\u6A21\u578B\u540D\u79F0\u548C API Key\u3002\u2461 \u7528\u4E2D\u6587\u547D\u540D\u7528\u9014\uFF0C\u5728\u4E0B\u62C9\u6846\u9009\u62E9\u6A21\u578B\u3002\u652F\u6301\u517C\u5BB9 OpenAI \u7684\u804A\u5929\u63A5\u53E3\u3002"),
    (0, import_react.createElement)("nav", null, (0, import_react.createElement)("button", { className: tab === "models" ? void 0 : "secondary", onClick: () => setTab("models") }, "\u2460 \u6A21\u578B\u8FDE\u63A5"), (0, import_react.createElement)("button", { className: tab === "purposes" ? void 0 : "secondary", onClick: () => setTab("purposes") }, "\u2461 \u4EFB\u52A1\u7528\u9014")),
    tab === "models" ? (0, import_react.createElement)("div", { className: "head" }, (0, import_react.createElement)("h2", null, `\u6A21\u578B\u8FDE\u63A5\uFF08${config.models.length}/${MAX_MODELS}\uFF09`), (0, import_react.createElement)("button", { className: "secondary", disabled: busy || testing !== null || config.models.length >= MAX_MODELS, onClick: () => setConfig((c) => c.models.length >= MAX_MODELS ? c : { ...c, models: [createModelConfig(uid("m")), ...c.models] }) }, "\u6DFB\u52A0\u6A21\u578B")) : null,
    tab === "models" ? (0, import_react.createElement)("p", null, "\u53EF\u7EE7\u7EED\u6DFB\u52A0\u4E0D\u540C\u670D\u52A1\u5546\u6216\u540C\u4E00\u670D\u52A1\u5546\u7684\u591A\u4E2A\u6A21\u578B\uFF1B\u6BCF\u4E2A\u6A21\u578B\u72EC\u7ACB\u4FDD\u5B58\u5730\u5740\u3001\u5BC6\u94A5\u548C\u7B49\u5F85\u8BBE\u7F6E\u3002\u65B0\u6A21\u578B\u9ED8\u8BA4\u6700\u591A\u7B49\u5F85 10 \u5206\u949F\u5E76\u9010\u6B65\u63A5\u6536\u7ED3\u679C\u3002") : null,
    ...tab === "models" ? config.models.map((m, i) => (0, import_react.createElement)("details", { className: "card", key: m.id, open: i === 0 ? true : void 0 }, (0, import_react.createElement)("summary", null, m.label, (0, import_react.createElement)("span", { className: "tag" }, m.enabled ? "\u5DF2\u542F\u7528" : "\u5F85\u586B\u5199 / \u672A\u542F\u7528")), (0, import_react.createElement)(
      "div",
      { className: "grid" },
      field("\u663E\u793A\u540D\u79F0", m.label, (v) => editModel(i, { label: v }), "\u4F8B\u5982\uFF1A\u6211\u7684\u8BC6\u56FE\u6A21\u578B"),
      field("\u6A21\u578B\u540D\u79F0\uFF08\u670D\u52A1\u5546\u63D0\u4F9B\uFF09", m.model, (v) => editModel(i, { model: v }), "\u4F8B\u5982\uFF1Adeepseek-chat"),
      (0, import_react.createElement)("label", { className: "wide" }, "\u63A5\u53E3\u5730\u5740", (0, import_react.createElement)("input", { value: m.url, placeholder: "\u4F8B\u5982\uFF1Ahttps://api.deepseek.com/v1", onChange: (e) => editModel(i, { url: e.target.value }), onBlur: (e) => editModel(i, { url: normalizeEndpoint(e.target.value) }) }), (0, import_react.createElement)("small", null, "\u53EF\u586B\u6839\u5730\u5740\u3001/v1 \u6216\u5B8C\u6574 /chat/completions \u5730\u5740\uFF1B\u81EA\u52A8\u8865\u9F50\u5E38\u89C1\u5730\u5740\u3002")),
      (0, import_react.createElement)(KeyField, { value: m.apiKey, onChange: (v) => editModel(i, { apiKey: v, ...v !== void 0 ? { apiKeyEnv: "" } : {} }) }),
      (0, import_react.createElement)("div", null, (0, import_react.createElement)("label", null, "\u7B49\u5F85\u65B9\u6848", (0, import_react.createElement)("select", { value: "", onChange: (e) => {
        if (e.target.value) editModel(i, { timeoutMs: Number(e.target.value) });
      } }, (0, import_react.createElement)("option", { value: "" }, "\u9009\u62E9\u9884\u8BBE\uFF0C\u6216\u76F4\u63A5\u586B\u5199\u4E0B\u65B9\u79D2\u6570"), (0, import_react.createElement)("option", { value: "300000" }, "\u666E\u901A\u4EFB\u52A1 \xB7 5 \u5206\u949F"), (0, import_react.createElement)("option", { value: "600000" }, "\u8BC6\u56FE / \u590D\u6742\u63A8\u7406 \xB7 10 \u5206\u949F"))), (0, import_react.createElement)("label", null, "\u6700\u957F\u7B49\u5F85\uFF08\u79D2\uFF09", (0, import_react.createElement)("input", { type: "number", min: 0.1, max: 600, step: 0.1, value: m.timeoutMs / 1e3, onChange: (e) => editModel(i, { timeoutMs: Math.round(Number(e.target.value) * 1e3) }) })), (0, import_react.createElement)("small", null, "\u4EC5\u5F71\u54CD\u6B64\u6A21\u578B\uFF0C\u5305\u542B\u6392\u961F\u3001\u63A8\u7406\u548C\u56DE\u7B54\u3002\u586B\u5199\u79D2\u6570\u5373\u53EF\u81EA\u5B9A\u4E49\uFF1B\u53EF\u968F\u65F6\u53D6\u6D88\u3002")),
      (0, import_react.createElement)("div", null, check("\u8FD9\u4E2A\u6A21\u578B\u53EF\u4EE5\u770B\u56FE\u7247", m.capabilities.includes("vision"), (v) => {
        if (!v && config.purposes.some((p) => p.requires.includes("vision") && p.modelIds.includes(m.id))) {
          setMessage("\u6B64\u6A21\u578B\u6B63\u5728\u7528\u4E8E\u8BC6\u56FE\uFF0C\u8BF7\u5148\u66F4\u6362\u76F8\u5173\u7528\u9014\u7684\u6A21\u578B\u3002");
          return;
        }
        editModel(i, { capabilities: v ? [.../* @__PURE__ */ new Set([...m.capabilities, "vision"])] : m.capabilities.filter((x) => x !== "vision") });
      }), (0, import_react.createElement)("small", null, "\u6309\u670D\u52A1\u5546\u5B9E\u9645\u80FD\u529B\u52FE\u9009\u3002"), check("\u542F\u7528\u8FD9\u4E2A\u6A21\u578B", m.enabled, (v) => editModel(i, { enabled: v }))),
      (0, import_react.createElement)("div", { className: "wide" }, (0, import_react.createElement)("button", { disabled: testing !== null || busy || !testConnection, onClick: async () => {
        if (!valid()) return;
        const controller = new AbortController();
        abort.current = controller;
        setTesting(m.id);
        setResults((r) => ({ ...r, [m.id]: "\u6B63\u5728\u53D1\u51FA\u4E00\u6B21\u6D4B\u8BD5\u8BF7\u6C42\u2026" }));
        try {
          const result = await testConnection({ ...m, url: normalizeEndpoint(m.url) }, controller.signal);
          setResults((r) => ({ ...r, [m.id]: result.message }));
        } catch (e) {
          setResults((r) => ({ ...r, [m.id]: friendlyError(e) }));
        } finally {
          setTesting(null);
          abort.current = null;
        }
      } }, testing === m.id ? "\u6D4B\u8BD5\u4E2D\u2026" : "\u6D4B\u8BD5\u8FDE\u63A5"), testing === m.id ? (0, import_react.createElement)("button", { className: "secondary", onClick: () => abort.current?.abort() }, "\u53D6\u6D88\u6D4B\u8BD5") : null, (0, import_react.createElement)("small", null, "\u4F1A\u53D1\u4E00\u6B21\u77ED\u6587\u5B57\u8BF7\u6C42\uFF0C\u53EF\u80FD\u4EA7\u751F\u63A5\u53E3\u8D39\u7528\u3002\u4E0D\u81EA\u52A8\u4FDD\u5B58\u6216\u6539\u7528\u5176\u4ED6\u6A21\u578B\u3002"), results[m.id] ? (0, import_react.createElement)("p", { role: "status" }, results[m.id]) : null),
      (0, import_react.createElement)("details", { className: "wide advanced" }, (0, import_react.createElement)("summary", null, "\u9AD8\u7EA7\u9009\u9879\uFF08\u901A\u5E38\u4E0D\u7528\u6539\uFF09"), (0, import_react.createElement)("div", { className: "grid" }, (0, import_react.createElement)("label", null, "\u7ED3\u679C\u63A5\u6536\u65B9\u5F0F", (0, import_react.createElement)("select", { value: m.responseMode ?? "stream", onChange: (e) => editModel(i, { responseMode: e.target.value }) }, (0, import_react.createElement)("option", { value: "stream" }, "\u9010\u6B65\u63A5\u6536\uFF08\u63A8\u8350\uFF09"), (0, import_react.createElement)("option", { value: "json" }, "\u7B49\u5F85\u5B8C\u6574\u56DE\u7B54\uFF08\u517C\u5BB9\uFF09")), (0, import_react.createElement)("small", null, "\u540E\u53F0\u9010\u6B65\u63A5\u6536\uFF0C\u5B8C\u6574\u56DE\u7B54\u540E\u4EA4\u7ED9\u4E3B\u6A21\u578B\u3002\u63A5\u53E3\u4E0D\u652F\u6301\u65F6\u53EF\u6539\u4E3A\u517C\u5BB9\u65B9\u5F0F\u3002")), (0, import_react.createElement)(JsonField, { key: m.id, value: m.requestParams, onChange: (v) => editModel(i, { requestParams: v }) }))),
      (0, import_react.createElement)("div", { className: "wide" }, (0, import_react.createElement)("button", { className: "danger", onClick: () => dropModel(m.id) }, "\u5220\u9664\u8FD9\u4E2A\u6A21\u578B"))
    ))) : [],
    tab === "purposes" ? (0, import_react.createElement)("div", { className: "head" }, (0, import_react.createElement)("h2", null, "\u4EFB\u52A1\u7528\u9014"), (0, import_react.createElement)("button", { className: "secondary", onClick: () => setConfig((c) => ({ ...c, purposes: [{ id: uid("p"), label: "\u65B0\u7528\u9014", description: "\u8BF7\u586B\u5199\u4EC0\u4E48\u65F6\u5019\u4F7F\u7528\u8FD9\u4E2A\u7528\u9014\uFF0C\u4EE5\u53CA\u56DE\u7B54\u8981\u6C42\u3002", keywords: [], priority: 10, requires: ["text"], modelIds: [c.models[0].id], allowFallback: false, systemPrompt: "" }, ...c.purposes] })) }, "\u6DFB\u52A0\u7528\u9014")) : null,
    ...tab === "purposes" ? config.purposes.map((p, i) => (0, import_react.createElement)("details", { className: "card", key: p.id, open: i === 0 ? true : void 0 }, (0, import_react.createElement)("summary", null, p.label), (0, import_react.createElement)(
      "div",
      { className: "grid" },
      field("\u7528\u9014\u540D\u79F0", p.label, (v) => editPurpose(i, { label: v }), "\u4F8B\u5982\uFF1A\u7F8E\u672F\u590D\u6838\u3001\u7FFB\u8BD1\u3001\u8BC6\u56FE"),
      (0, import_react.createElement)("label", null, "\u4F7F\u7528\u54EA\u4E2A\u6A21\u578B", (0, import_react.createElement)("select", { value: p.modelIds[0], onChange: (e) => {
        const m = config.models.find((m2) => m2.id === e.target.value);
        if (p.requires.includes("vision") && !m.capabilities.includes("vision")) {
          setMessage("\u8FD9\u4E2A\u7528\u9014\u9700\u8981\u770B\u56FE\u7247\uFF0C\u8BF7\u9009\u62E9\u652F\u6301\u8BC6\u56FE\u7684\u6A21\u578B\uFF0C\u6216\u5148\u53D6\u6D88\u4E0B\u65B9\u7684\u8BC6\u56FE\u8981\u6C42\u3002");
          return;
        }
        editPurpose(i, { modelIds: [m.id], requires: p.requires.includes("vision") ? ["vision"] : ["text"], allowFallback: false });
      } }, ...config.models.map((m) => (0, import_react.createElement)("option", { key: m.id, value: m.id }, m.label + (m.enabled ? "" : "\uFF08\u672A\u542F\u7528\uFF09"))))),
      (0, import_react.createElement)("label", { className: "wide" }, "\u7528\u9014\u8BF4\u660E", (0, import_react.createElement)("textarea", { value: p.systemPrompt && p.systemPrompt !== p.description ? p.description + "\n" + p.systemPrompt : p.description, placeholder: "\u4F8B\u5982\uFF1A\u9047\u5230\u53C2\u8003\u56FE\u65F6\u4F7F\u7528\uFF0C\u6307\u51FA\u53EF\u89C1\u95EE\u9898\u5E76\u533A\u5206\u4E8B\u5B9E\u548C\u63A8\u6D4B\u3002", onChange: (e) => editPurpose(i, { description: e.target.value, systemPrompt: e.target.value }) }), (0, import_react.createElement)("small", null, "\u5199\u6E05\u695A\u4EC0\u4E48\u65F6\u5019\u7528\u3001\u5E0C\u671B\u600E\u6837\u56DE\u7B54\u3002\u4E00\u5904\u586B\u5199\u5373\u53EF\u3002")),
      (0, import_react.createElement)("div", { className: "wide" }, check("\u8FD9\u4E2A\u7528\u9014\u9700\u8981\u770B\u56FE\u7247", p.requires.includes("vision"), (v) => {
        const m = config.models.find((m2) => m2.id === p.modelIds[0]);
        if (v && !m.capabilities.includes("vision")) {
          setMessage("\u8BF7\u5148\u9009\u62E9\u5DF2\u52FE\u9009\u201C\u53EF\u4EE5\u770B\u56FE\u7247\u201D\u7684\u6A21\u578B\u3002");
          return;
        }
        editPurpose(i, { requires: v ? ["vision"] : ["text"] });
      }), check("\u6CA1\u6709\u5339\u914D\u65F6\uFF0C\u4F7F\u7528\u8FD9\u4E2A\u7528\u9014", config.defaultPurpose === p.id, (v) => {
        if (v) setConfig((c) => ({ ...c, defaultPurpose: p.id }));
      })),
      (0, import_react.createElement)("details", { className: "wide advanced" }, (0, import_react.createElement)("summary", null, "\u9AD8\u7EA7\uFF1A\u5173\u952E\u8BCD\u5339\u914D\u4E0E\u5907\u7528\u6A21\u578B"), (0, import_react.createElement)("small", null, "\u4E3B\u6A21\u578B\u6309\u7528\u9014\u8BF4\u660E\u9009\u62E9\u3002\u5173\u952E\u8BCD\u4EC5\u7528\u4E8E\u81EA\u52A8\u9884\u9009\uFF0C\u7559\u7A7A\u4E5F\u80FD\u4F7F\u7528\u3002"), (0, import_react.createElement)("label", null, "\u5339\u914D\u5173\u952E\u8BCD\uFF08\u9017\u53F7\u5206\u9694\uFF09", (0, import_react.createElement)("input", { defaultValue: p.keywords.join("\uFF0C"), onBlur: (e) => editPurpose(i, { keywords: [...new Set(e.target.value.split(/[,，]/).map((v) => v.trim()).filter(Boolean))] }) })), (0, import_react.createElement)("label", null, "\u5339\u914D\u4F18\u5148\u7EA7", (0, import_react.createElement)("input", { type: "number", value: p.priority, onChange: (e) => editPurpose(i, { priority: Number(e.target.value) }) })), (0, import_react.createElement)("label", null, "\u5907\u7528\u6A21\u578B", (0, import_react.createElement)("select", { value: p.modelIds[1] ?? "", onChange: (e) => {
        const m = config.models.find((m2) => m2.id === e.target.value);
        if (m && p.requires.some((v) => !m.capabilities.includes(v))) {
          setMessage("\u5907\u7528\u6A21\u578B\u4E0D\u652F\u6301\u6B64\u7528\u9014\u6240\u9700\u80FD\u529B\u3002");
          return;
        }
        editPurpose(i, { modelIds: e.target.value ? [p.modelIds[0], e.target.value] : [p.modelIds[0]], allowFallback: !!e.target.value });
      } }, (0, import_react.createElement)("option", { value: "" }, "\u4E0D\u4F7F\u7528\u5907\u7528\u6A21\u578B"), ...config.models.filter((m) => m.id !== p.modelIds[0]).map((m) => (0, import_react.createElement)("option", { key: m.id, value: m.id }, m.label)))), (0, import_react.createElement)("small", null, "\u9009\u62E9\u5907\u7528\u540E\uFF0C\u5931\u8D25\u4F1A\u5C06\u4EFB\u52A1\u53D1\u9001\u7ED9\u5907\u7528\u63A5\u53E3\uFF0C\u53EF\u80FD\u989D\u5916\u8BA1\u8D39\u3002")),
      (0, import_react.createElement)("div", { className: "wide" }, (0, import_react.createElement)("button", { className: "danger", onClick: () => dropPurpose(p.id) }, "\u5220\u9664\u8FD9\u4E2A\u7528\u9014"))
    ))) : [],
    (0, import_react.createElement)("details", { className: "card" }, (0, import_react.createElement)("summary", null, "\u68C0\u67E5\u7528\u9014\u9009\u62E9\uFF08\u4E0D\u8BF7\u6C42\u6A21\u578B\uFF09"), (0, import_react.createElement)("label", null, "\u7528\u9014", (0, import_react.createElement)("select", { value: chosen, onChange: (e) => setChosen(e.target.value) }, (0, import_react.createElement)("option", { value: "" }, "\u81EA\u52A8\u9884\u9009"), ...config.purposes.map((p) => (0, import_react.createElement)("option", { key: p.id, value: p.id }, p.label)))), field("\u4EFB\u52A1", task, setTask, "\u586B\u5199\u8981\u505A\u7684\u4E8B"), (0, import_react.createElement)("button", { className: "secondary", onClick: () => {
      try {
        const r = route(validateConfig(config), { purpose: chosen || "auto", task });
        setPreview("\u7528\u9014\uFF1A" + r.purposeLabel + "\n\u6A21\u578B\uFF1A" + config.models.find((m) => m.id === r.modelId).label + "\n" + r.reason);
      } catch (e) {
        setPreview(e.message);
      }
    } }, "\u68C0\u67E5\u9009\u62E9"), (0, import_react.createElement)("p", { className: "status" }, preview))
  );
}
async function setRouterEnabled(form, value) {
  const state = form.getSnapshot();
  if (state.status !== "ready" || !state.writable) throw Error("\u8BBE\u7F6E\u5C1A\u672A\u53EF\u5199\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u3002");
  if (!await form.mutate([{ op: "set", path: ["enabled"], value }], state.revision)) throw Error("\u5F00\u5173\u672A\u66F4\u65B0\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\uFF0C\u539F\u914D\u7F6E\u4FDD\u7559\u3002");
}
function RouterSettingsPage({ getForm, refresh, close, testConnection }) {
  const store = (0, import_react.useMemo)(() => getForm(), [getForm]), state = (0, import_react.useSyncExternalStore)((listener) => store.subscribe(listener), () => store.getSnapshot());
  const [editing, setEditing] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(false), [message, setMessage] = (0, import_react.useState)("");
  const form = { state, mutate: (ops, revision) => store.mutate(ops, revision) };
  let config;
  try {
    config = readDesktopConfig(form);
  } catch {
  }
  if (editing) return (0, import_react.createElement)("div", { className: "dsh-pr" }, (0, import_react.createElement)("style", null, css), (0, import_react.createElement)("button", { className: "secondary", onClick: () => setEditing(false) }, "\u8FD4\u56DE\u63D2\u4EF6\u8BBE\u7F6E"), (0, import_react.createElement)(RouterConfigPage, { view: "page", form, testConnection }));
  const ready = state.status === "ready";
  return (0, import_react.createElement)("section", { className: "dsh-pr" }, (0, import_react.createElement)("style", null, css), (0, import_react.createElement)("h2", null, "\u7528\u9014\u6A21\u578B\u8DEF\u7531"), (0, import_react.createElement)("p", null, "\u8BC6\u56FE\u7528\u8BC6\u56FE\u6A21\u578B\uFF0C\u7FFB\u8BD1\u7528\u7FFB\u8BD1\u6A21\u578B\u3002\u4F60\u53EF\u4EE5\u6DFB\u52A0\u81EA\u5DF1\u7684\u4E2D\u6587\u7528\u9014\u3002"), (0, import_react.createElement)("article", null, (0, import_react.createElement)("label", null, (0, import_react.createElement)("input", { type: "checkbox", checked: state.value?.enabled !== false, disabled: !ready || !state.writable || busy, onChange: async (e) => {
    setBusy(true);
    try {
      await setRouterEnabled(store, e.target.checked);
      setMessage("\u8C03\u7528\u5F00\u5173\u5DF2\u66F4\u65B0\u3002");
    } catch (e2) {
      setMessage(e2.message);
    } finally {
      setBusy(false);
    }
  } }), " \u5141\u8BB8\u8C03\u7528\u8F85\u52A9\u6A21\u578B"), (0, import_react.createElement)("p", null, config ? `${config.models.filter((m) => m.enabled).length} \u4E2A\u5DF2\u542F\u7528\u6A21\u578B \xB7 ${config.purposes.length} \u4E2A\u7528\u9014` : "\u6B63\u5728\u8BFB\u53D6\u914D\u7F6E\u2026"), (0, import_react.createElement)("button", { disabled: !ready, onClick: () => setEditing(true) }, "\u914D\u7F6E\u7528\u9014\u4E0E\u6A21\u578B"), (0, import_react.createElement)("button", { className: "secondary", disabled: busy, onClick: async () => {
    setBusy(true);
    try {
      await refresh?.();
      setMessage("\u5DF2\u91CD\u65B0\u8BFB\u53D6\u914D\u7F6E\u3002");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  } }, "\u91CD\u65B0\u8BFB\u53D6\u914D\u7F6E"), !ready ? (0, import_react.createElement)("p", { className: "note" }, "\u540E\u53F0\u914D\u7F6E\u672A\u5C31\u7EEA\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\uFF1B\u4ECD\u4E0D\u53EF\u7528\u65F6\u68C0\u67E5\u63D2\u4EF6\u662F\u5426\u542F\u7528\u3002") : null, (0, import_react.createElement)("p", null, "\u76F4\u63A5\u586B\u5199 API Key\u3001\u63A5\u53E3\u5730\u5740\u548C\u6A21\u578B\u540D\u79F0\uFF0C\u518D\u7ED9\u7528\u9014\u9009\u62E9\u6A21\u578B\u3002\u4FDD\u5B58\u540E\u65E0\u9700\u91CD\u542F\u3002")), (0, import_react.createElement)("p", null, "\u4E3B\u6A21\u578B\u6309\u7167\u7528\u9014\u8BF4\u660E\u8C03\u7528\u8F85\u52A9\u6A21\u578B\uFF0C\u518D\u6574\u5408\u7ED3\u679C\u3002\u63A5\u53E3\u8C03\u7528\u53EF\u80FD\u8BA1\u8D39\uFF1B\u8FDE\u63A5\u6D4B\u8BD5\u4F1A\u53D1\u51FA\u4E00\u6B21\u77ED\u8BF7\u6C42\u3002"), (0, import_react.createElement)("div", { className: "status", role: "status" }, message), close ? (0, import_react.createElement)("button", { className: "secondary", onClick: close }, "\u5173\u95ED\u8BBE\u7F6E") : null);
}
function apply(ctx) {
  const testConnection = async (model, signal) => {
    const r = await ctx.connection.rpc.call("/api", "purpose-router/test", { model }, signal);
    if (!r.ok) throw Error(r.error.message);
    return r.value;
  };
  ctx.effect(() => ctx.slots.inject("plugins.row.config", () => ctx.slots.register({ name: "plugins.row.config", key: CONFIG_KEY, inject: () => ({ testConnection }) }, RouterConfigPage)), "purpose-router:desktop-config");
  ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({ name: "settings.section", id: "purpose-model-router", order: 55, label: "\u7528\u9014\u6A21\u578B\u8DEF\u7531", inject: () => ({ getForm: () => ctx.configForms.get("purpose-model-router"), refresh: () => ctx.configForms.describe().load(), testConnection }) }, RouterSettingsPage)), "purpose-router:settings-entry");
}

return module.exports;}});
