# 回声 Echo

> 不是测试，不是分类，不是问卷。是一次认真的对话，帮你看见一个更完整的自己。

**回声** 是一个对话式人格画像应用。它通过自然、深度的聊天访谈，逐步了解你的情绪模式、关系风格、决策偏好和自我认知，最终为你生成一份文学性的人物画像——不是诊断报告，而是一面镜子。

---

## 功能特性

- **自然对话** — 像和朋友聊天一样，没有标准答案，没有对错
- **12 维度人格分析** — 情绪稳定性、社交能量、自我表达、依赖-独立、风险规避等
- **6 个 AI Agent** — 画像推理、深度追问、叙事生成、对话管理、矛盾检测、安全过滤
- **双模式运行** — 配置 LLM API Key 后使用 AI 驱动；不配置则使用内置规则引擎，完全离线可用
- **人物画像生成** — 文学化叙事文本，而不是冷冰冰的数据报告
- **记忆库** — 对话中的重要发现自动记录，支持筛选和搜索
- **本地优先** — 数据存储在本地，无需注册账号
- **暗色模式** — 支持亮色/暗色主题切换

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18, TypeScript, Vite 5, Tailwind CSS 3.4, React Router 6 |
| 后端 | Node.js, Express 4, TypeScript 5.3 |
| LLM | Anthropic (Claude), OpenAI (GPT-4o), DeepSeek, 自定义 OpenAI 兼容 API |
| 存储 | 文件级 JSON（无数据库依赖） |

---

## 目录结构

```
Echo/
├── package.json              # Monorepo 根配置
├── shared/types.ts           # 共享 TypeScript 类型
├── client/                   # React 前端
│   └── src/
│       ├── main.tsx          # 应用入口
│       ├── App.tsx           # 路由 & 布局
│       ├── api/client.ts     # API 客户端
│       ├── hooks/            # useChat, useProfile
│       ├── components/       # Nav, ChatBubble, ChatInput, ProfileCard, MemoryList
│       └── pages/            # Home, Chat, Profile, Memory, Settings
└── server/                   # Express 后端
    └── src/
        ├── index.ts          # 服务入口 (端口 4000)
        ├── settings.ts       # 设置管理
        ├── services/llm.ts   # 多模型 LLM 客户端
        ├── memory/index.ts   # JSON 文件存储
        ├── data/questions/   # 基础问题库
        ├── routes/           # chat, profile, memory, settings API
        └── agents/           # 6 个 AI Agent
```

---

## 快速开始

```bash
# 安装依赖
npm install
cd client && npm install
cd ../server && npm install
cd ..

# 启动开发环境（前端 :3000 + 后端 :4000）
npm run dev
```

浏览器打开 `http://localhost:3000` 即可开始使用。

> **无需配置任何 API Key** — 默认使用内置规则引擎运行。

---

## 配置 AI 模型（可选）

在设置页面添加模型供应商和 API Key 后，对话将由 AI 驱动，体验更自然：

1. 打开「设置」页面
2. 选择平台（Anthropic / OpenAI / DeepSeek / 自定义）
3. 填入 API Key，点击「添加」
4. 在 Agent 分配区域，为需要启用 LLM 的 Agent 打开开关并选择模型
5. 点击「保存」

支持的模型：
- **Anthropic**: Claude Opus 4.7, Claude Sonnet 4.6, Claude Haiku 4.5
- **OpenAI**: GPT-4o, GPT-4o Mini
- **DeepSeek**: DeepSeek Chat
- **自定义**: 任何兼容 OpenAI API 接口的服务

---

## 使用说明

1. **开始对话** — 从首页点击「开始对话」，AI 会用中文与你展开自然的对话
2. **深入交流** — 根据你的回答，AI 会追问值得深入的话题
3. **生成画像** — 当对话足够深入后，点击「生成画像」获取人物画像
4. **查看画像** — 在「画像」页面查看完整的性格维度分析和叙事画像
5. **浏览记忆** — 在「记忆」页面查看对话中发现的所有重要信息
6. **持续更新** — 随时回来继续对话，画像会随着你的变化而更新

---

## 隐私说明

- 所有对话数据和画像**仅存储在本地文件系统**（`server/src/data/`）
- **不需要注册账号**
- 不会上传数据到任何云端服务（除非你配置了 LLM API，消息会发送到对应的 AI 服务商）
- 可以随时在设置中重置或删除数据

---

## 构建生产版本

```bash
npm run build
npm start    # 启动生产服务器（Express 托管前端静态文件）
```

---

## 许可

MIT
