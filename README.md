# 回声 Echo

> 不是测试，不是分类，不是问卷。是一次认真的对话，帮你看见一个更完整的自己。

**回声** 是一个对话式人格画像应用。通过自然、深度的聊天访谈，逐步了解你的情绪模式、关系风格、决策偏好和自我认知，最终生成一份文学性的人物画像。

---

## 架构

```
┌─────────────────────────┐     ┌──────────────────────────────┐
│  Android App (Capacitor) │────▶│  Render 云服务器 (Express)     │
│  React 18 + Vite 5       │ API │  Node.js + TypeScript         │
│  WebView 内运行           │     │  6 AI Agent + 规则引擎         │
└─────────────────────────┘     └──────────────────────────────┘
```

- **前端**: React SPA，通过 Capacitor 打包为 Android APK，也支持浏览器访问
- **后端**: Express 服务器部署在 Render（免费 tier），处理对话、画像生成、记忆存储
- **LLM**: 支持 Anthropic / OpenAI / DeepSeek / 自定义兼容 API，**不配 Key 也能用**（内置规则引擎）
- **存储**: 服务器 JSON 文件 + 客户端 localStorage 双保险持久化

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18, TypeScript 5.3, Vite 5 |
| 样式 | Tailwind CSS 3.4 + 自研 CSS 设计系统（深海生物荧光主题） |
| 路由 | React Router 6 |
| 移动端 | Capacitor 6（Android） |
| 后端 | Express 4, TypeScript 5.3 |
| LLM | Anthropic SDK, OpenAI SDK, DeepSeek, 自定义 OpenAI 兼容 |
| 部署 | Render（免费 tier, 自动部署） |
| 存储 | JSON 文件 + 内存缓存 + localStorage 三层 |

---

## 目录结构

```
Echo/
├── package.json              # Monorepo 根配置 + Capacitor + Electron-builder 脚本
├── capacitor.config.ts       # Capacitor 移动端配置
├── shared/types.ts           # 共享 TypeScript 类型（12维度、画像、对话、设置）
├── client/                   # React 前端
│   └── src/
│       ├── main.tsx          # 应用入口
│       ├── App.tsx           # 路由 & 主题初始化
│       ├── vite-env.d.ts     # Vite 类型声明
│       ├── index.css         # 设计系统（760行CSS：变量、组件类、动画关键帧）
│       ├── api/client.ts     # API 客户端（超时25s、移动端自适应URL）
│       ├── hooks/
│       │   ├── useChat.ts        # 对话状态管理（localStorage持久化conversationId）
│       │   ├── useProfile.ts     # 画像/记忆数据加载
│       │   └── useReducedMotion.ts # 无障碍：尊重用户动画偏好
│       ├── components/
│       │   ├── Nav.tsx           # 毛玻璃导航栏（主题自适应）
│       │   ├── ChatBubble.tsx    # 消息气泡（user/assistant/system/summary/profile）
│       │   ├── ChatInput.tsx     # 自动扩展输入框
│       │   ├── ProfileCard.tsx   # 人格画像卡片（叙事+维度条）
│       │   ├── MemoryList.tsx    # 记忆列表
│       │   ├── EchoEye.tsx       # 首页深海生物荧光眼睛（SVG动画）
│       │   └── AstroRings.tsx    # 首页双斜交叉星环（75+环带，密度波模拟）
│       └── pages/
│           ├── HomePage.tsx      # 首页（眼睛+星环+画像预览）
│           ├── ChatPage.tsx      # 对话界面（空状态/错误/消息列表）
│           ├── ProfilePage.tsx   # 画像页（叙事+维度+版本历史）
│           ├── MemoryPage.tsx    # 记忆库（筛选+搜索）
│           └── SettingsPage.tsx  # 设置（模型配置+一键分配+主题切换）
├── server/                   # Express 后端
│   └── src/
│       ├── index.ts          # 服务入口（端口4000，生产模式托管前端静态文件）
│       ├── settings.ts       # 设置管理（内存缓存+文件双写，抵抗Render重启）
│       ├── services/llm.ts   # 多模型LLM客户端（Anthropic/OpenAI/DeepSeek/自定义）
│       ├── memory/index.ts   # JSON文件存储（用户/对话/记忆/画像版本）
│       ├── data/questions/
│       │   └── base-questions.ts  # 8道基础访谈问题（McAdams生命故事访谈法）
│       ├── routes/           # chat, profile, memory, settings API
│       └── agents/
│           ├── orchestrator.ts        # 主协调器（8步流水线处理每条消息）
│           ├── interview-agent.ts     # 对话管理（阶段流转、问题选择、语气）
│           ├── profiler-agent.ts      # 画像推理（LLM优先，规则引擎回退）
│           ├── digging-agent.ts       # 深度追问检测
│           ├── narrative-agent.ts     # 叙事生成（12维度全覆盖+跨维度综合分析）
│           ├── contradiction-agent.ts # 矛盾检测（消息内+跨消息）
│           ├── safety-tone-agent.ts   # 安全与语气过滤
│           └── llm-agent-calls.ts     # LLM调用封装
└── android/                  # Capacitor Android 原生项目（用 Android Studio 打开）
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

浏览器打开 `http://localhost:3000`。

> **无需配置任何 API Key** — 默认使用内置规则引擎。

---

## Android App 构建

```bash
# 构建前端 + 同步到 Android 项目
npm run android:build

# 用 Android Studio 打开 android/ 目录
# Build → Build APK
```

App 连接 Render 云服务器 `https://echo-p0on.onrender.com`，独立运行。

---

## 部署

推送代码到 `main` 分支后，Render 自动部署。

Render 配置：
- **Build Command**: `cd server && npm install && npx tsc`
- **Start Command**: `node server/dist/server/src/index.js`
- **注意**: TypeScript 编译输出在 `server/dist/server/src/`（因为 rootDir 原因）

---

## 设计系统

### 配色 — 深海生物荧光

| Token | 暗色模式 | 亮色模式 |
|-------|---------|---------|
| `--color-abyss` | `#010b18` 深海黑 | `#eef3f7` 浅水白 |
| `--color-surface` | `#051025` 深海蓝 | `#f4f7fa` |
| `--color-accent` | `#5b9ed8` 生物荧光蓝 | `#3980c8` 海洋蓝 |
| `--color-accent-hover` | `#78b8ee` | `#2b6db3` |

- **主题**: `:root`（亮色） + `.dark`（暗色，默认）
- **组件类**: `.glass`, `.card`, `.btn-primary`, `.message-bubble` 等均使用 CSS 变量，自动跟随主题
- **字体**: Inter + Noto Sans SC（正文）+ Noto Serif SC（画像叙事）
- **动画**: 所有动画尊重 `prefers-reduced-motion`

### 首页视觉

- **EchoEye**: 440×190 SVG 眼睛，多层生物荧光辉光 + 8向光线 + 回声弧 + 眨眼动画
- **AstroRings**: 75+ 椭圆环带，±32° 双斜交叉环面，密度波调制 + 光照阴影叠加
- 移动端自动跳过 SVG 高斯模糊滤镜以优化性能

---

## 画像系统

### 12 个人格维度

`emotionalStability`（情绪稳定性）、`socialEnergy`（社交能量）、`selfExpressionTendency`（主动表达）、`selfDisclosureTendency`（自我暴露）、`dependencyIndependence`（依赖/独立）、`riskAversion`（风险规避）、`relationshipSensitivity`（关系敏感度）、`controlNeed`（掌控感）、`reflectionAbility`（反思能力）、`empathyTendency`（共情）、`actionPreference`（行动偏好）、`decisionStyle`（决策风格）

### 叙事生成

- **开头**: 基于最突出特质个性化生成（高反思/高共情/高独立/社交×暴露组合）
- **主体**: 12 维度全覆盖叙事段落
- **综合分析**: 6 种跨维度关联（如"高共情×低社交"、"高独立×低表露"）
- **矛盾**: 消息内自相矛盾检测（5 种模式，新用户也可用）
- **时间线**: 自动从对话中提取过去/最近/现在/未来事件
- **结尾**: 基于最突出特质动态生成（5 种个性化结尾）

### 识别引擎

- LLM 优先，规则引擎回退
- 短文本加权（`lengthFactor`），一句话也能被识别
- 阈值 `totalWeight >= 0.12`（1 个强关键词即可）
- 证据自动去重

---

## 关键设计决策

1. **"你"而非"她"**: 画像以第二人称书写，直接对话、不分性别
2. **无自动重启**: 跳转页面不回退对话，conversationId 持久化到 localStorage
3. **双保险持久化**: 设置同时存服务器内存缓存 + localStorage，Render 重启不丢失
4. **即改即存**: 设置页所有开关/选择即时保存，无需手动点"保存"
5. **移动端性能**: AstroRings 在小屏 (<768px) 跳过 SVG 滤镜
6. **API 超时**: 25s 超时 + "服务器正在唤醒中"提示，应对 Render 冷启动
7. **一键配置**: 选择一个模型可批量应用到全部 6 个 Agent
