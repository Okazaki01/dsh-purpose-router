# 更新记录

## 0.2.0

适配 DeepSeek Harness 桌面版内核 **0.2.1-rc.2**。

**修复「插件已启用却被自动停用」**：0.1.0 把 `@deepseek-ai/dsh-*` 的兼容版本写死为精确的 `0.2.0-rc.2`。内核升到 0.2.1-rc.2 后，启动时的兼容门禁判定不满足，日志会打印

```
disabling profile plugin row "purpose-model-router": Plugin dsh-purpose-router@0.1.0
is incompatible with dsh 0.2.1-rc.2 ...
```

然后整行插件被禁用，设置里的「配置用途与模型」按钮随之变灰。现在改用 `engines.dsh: ">=0.2.0-rc.2 <0.3.0-0"` 表达兼容区间：0.2.0-rc.2 与 0.2.1-rc.2 均放行，0.1.7 及更早仍会被拦下，0.3 起需要重新验证。

其他改动：

- 开发与回归依赖升级到 0.2.1-rc.2（Cordis 4.0.5、schemastery 3.18.5、client-connection / tools / fs / system-prompt / 各 ui-* 包）。
- 图片读取在会话缺少 `cwd` 时不再抛错，改为交给文件后端使用默认工作目录。
- 测试夹具跟随 0.2.1 的 `connection.fetch(request, peer)` 签名，并兼容 Client Connection 浏览器入口改名（`lib/client.js` → `lib/client.browser.js`）。
- 回归 27 项 + 打包冒烟 1 项，全部通过；使用本地模拟接口与模拟密钥，不请求付费模型。

## 0.1.0

首次公开发布。

- 在 DeepSeek Harness 桌面设置中配置模型连接和中文任务用途。
- 支持自定义模型地址、名称和直接填写 API Key，最多 100 个模型、100 个用途。
- 按用途调用辅助模型，支持识图与多个独立目标。
- 每个模型独立设置最长等待，支持 SSE 与完整 JSON 响应，无自动重试。
- 提供 Agent、桌面插件页面、手动安装三种方式及预编译安装包。
