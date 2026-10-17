# 开发与验证

普通使用者直接安装 Release 的 `.tgz` 即可，以下内容面向修改插件的开发者。

## 本地构建

使用 Node.js 22 或更新版本：

```sh
npm ci
npm run build
npm test
npm pack
```

依赖锁定文件用于复现开发环境；Harness 插件安装使用宿主提供的共享组件。仓库包含已编译的 `client.js`，安装包不要求用户运行构建脚本，也没有安装时的 `prepare` 或 `postinstall`。

测试使用独立配置、模拟密钥和本地 HTTP 服务，不请求付费模型、不读取用户正式 Harness 配置。也可通过 `DSH_TEST_RUNTIME` 指向已准备好的测试依赖目录；它需要有自己的 `package.json` 和 `node_modules`。生成的 `qa/` 内容不会进入仓库或安装包。

## 主要文件

| 文件 | 作用 |
| --- | --- |
| `index.js` | Host 工具、配置校验、连接测试与卸载取消 |
| `src/client.mjs` / `client.js` | 可编辑桌面界面 / 预编译浏览器入口 |
| `src/catalog.mjs` | 目录校验、用途选择与新增模型默认值 |
| `src/router.mjs` | 模型请求、图片读取、超时和错误处理 |
| `src/response.mjs` | SSE 与 JSON 响应读取 |
| `config.example.json` | 不含密钥、默认停用的模板 |
| `cordis.patch.yml` | Harness 原生 bundle 注册 |
| `test/` | 路由、响应、桌面表单、Host 与 RPC 回归 |

没有额外 MCP 服务器或独立配置网页。旧实验界面、本机日志和用户配置不属于发布内容。

## 接入契约

- `model_router_catalog`：读取不含密钥的用途目录，不请求上游。
- `model_router_route`：检查选择结果，支持中文用途名称。`auto` 只按关键词和优先级预选，不是语义分类器。
- `model_router_call`：调用指定用途的辅助模型。主模型读取用途说明、拆分任务、决定是否并行，再整合回答。
- 桌面使用官方 ConfigForms / Host SettingsForms。模型目录与 secret 密钥字段分别保存，带版本冲突保护；损坏配置不会覆盖原数据。
- 连接测试调用 `ctx.connection.rpc.call('/api', 'purpose-router/test', {model}, signal)`，Host 匹配 `POST /api/purpose-router/test` 和同名操作。使用现有认证连接，不另开服务，也不从浏览器直接访问模型接口。
- 图片通过 Harness 文件能力读取真实字节，相对路径以会话目录为准。辅助回答不会自动执行其代码或工具。

每个模型独立维护 URL、名称、密钥、请求参数、等待时间和响应方式。新增模型默认 `600000ms`、`stream`；旧配置中显式设置的值保持不变。流式请求等完整回答结束后返回，不把断开或 token 截断的半段回答当成成功。本地截止时间覆盖排队、推理和回答；服务商可能有自己的更短限制。无自动重试；用途显式配置备用时才允许失败转用。

## 验证边界

隔离测试覆盖真实 Cordis / ToolRuntime、Host 设置持久化、官方配置表单、编译后的 React 按钮、认证 RPC、本地 HTTP 与 SSE，以及新增第四、第五模型的保存和实际路由。目录也测试了 100 模型的边界。

这些结果不代表所有服务商、桌面版本或网络都已测试。仓库演示图由作者提供，展示实际 Harness 会话；发布前回归使用本地测试接口，不使用作者的真实 API Key。

已验证组件版本：Harness `0.2.1-rc.2`，Cordis `4.0.5`，schemastery `3.18.5`；同时兼容 `0.2.0-rc.2`。SDK 变化时先针对设置、RPC 和卸载契约补验，不绕过错误，也不覆盖用户配置来规避兼容问题。

### 兼容声明与内核门禁

内核在启动时读取插件 `package.json` 判断能否启用（`@deepseek-ai/dsh-app-boot` 的 `evaluatePluginCompatibility`）。规则是：**只要写了 `engines.dsh`，它就单独决定结果，`peerDependencies` 不再参与判断**；没写 `engines.dsh` 时，才会逐个检查 `@deepseek-ai/dsh` / `@deepseek-ai/dsh-*` 的 peer 范围。

因此把 peer 写成精确版本（如 `"0.2.0-rc.2"`）等于把插件钉死在某一个内核上——内核一升级，插件就会被判为不兼容并整行禁用，日志以 `disabling profile plugin row` 开头。本仓库改用区间表达：

```json
"engines": { "node": ">=22", "dsh": ">=0.2.0-rc.2 <0.3.0-0" }
```

预发布版本参与比较（实现上用了 `includePrerelease: true`），所以 `0.2.1-rc.2` 落在区间内。若确认兼容 0.3 之前的全部补丁版本，保持该写法即可；验证 0.3 后再放宽上界。

### 0.2.1-rc.2 的契约变化

- `connection.createSharedFetchHandler(channel).fetch(request)` → `fetch(request, peer)`，且精确 Fetch 路由要求 `peer.principal.kind === 'owner'`。直接调用时需传 `{principal:{kind:'owner'}}`，否则报 `Cannot read properties of undefined (reading 'principal')`。
- `@deepseek-ai/dsh-client-connection` 的浏览器入口从 `lib/client.js` 改名为 `lib/client.browser.js`（`exports["./client"]` 的 `browser`/`default` 条件）。测试里按 `exports` 条件解析，不要写死文件名。
- `@deepseek-ai/dsh-client-store` 不再随内核 `node_modules` 发布（被打进 shell），跑桌面表单回归时需单独提供。

官方依据：[工具开发](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-tool.md)、[配置表单](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-settings/README.md)、[认证连接](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/connection/README.md)、[打包安装](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md)。
