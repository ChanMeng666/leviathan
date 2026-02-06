# 利维坦的诞生 | The Birth of Leviathan

> *"任何叙事都能构建——历史、民族、国家皆可被发明。"*

一款以**刘仲敬**思想为内核的政治模拟文字卡牌游戏。玩家扮演"民族发明家"，在旧帝国崩溃后的权力真空中，利用垃圾素材编造神话、构建叙事、发明民族，最终使自己的政治实体在"大洪水"中幸存。

**基调：黑色幽默 + 社会达尔文主义沙盒。** 没有道德预设，活下来就是一切。

---

## 游戏截图

> 终端机风格 UI — CRT 扫描线 + 绿色荧光 + 等宽字体

---

## 核心玩法

### 叙事纺织机 (The Narrative Loom)

将垃圾素材卡牌投入"叙事纺织机"，选择叙事意图（编造建国神话、发明民族英雄、伪造历史文献……），AI 会根据卡牌属性和当前国家状态，生成一段荒诞而讽刺的叙事结果。

- **9 张初始素材卡**: 半个发霉的馒头、义乌产塑料关公像、没有插线的红色电话机……
- **5 种合成配方**: 关帝爷的雷电荆棘、大黑斑行省法理宣称、肉罐头金本位、英灵显灵大会、利维坦的觉醒
- **3 种 AI 人格**: 解构主义史官 / 狂热宣传机器 / 市井虚无主义者

### 灾难事件引擎

每日结算时，系统根据国家状态触发灾难事件。同一事件在不同政体下由 AI 生成截然不同的文案：

| 事件 | 触发条件 | 抉择 |
|------|---------|------|
| 巴别塔的碎片 | 叙事 > 60 | 暴力统一 / 发明双语神话 / 消灭少数派 |
| 活着的祖宗 | 叙事 > 60 | 册封国父 / 让他"自然死亡" / 公开辩论 |
| 双脚羊的诱惑 | 给养 < 15 | 默许"紧急营养法案" / 铁腕配给 / 献祭苦行 |
| 来自旧世界的硬盘 | 随机 | 焚书 / 秘密阅读 / 篡改后公开 |

### 四种死法

- **暴力权威 ≤ 0** → 暴民推翻（RIOT）
- **给养储备 ≤ 0** → 饿死（STARVATION）
- **叙事完整度 ≥ 100** → 疯狂飞升（MADNESS）
- **理智度 ≤ 0** → 精神崩溃（INSANITY）

死亡后，AI 以后世历史学家视角撰写一篇盖棺定论式的"历史评价"。

### 替罪羊轮盘

不满值过高时启用。选择一个社会群体作为替罪羊——瞬间清零不满，但永久失去该群体的加成。每一次清洗都是不可逆的。

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 运行时 | Node.js | LTS |
| 前端 | Vite 6 + React 19 + TypeScript | SPA |
| 样式 | Tailwind CSS 4 | 终端机风格自定义主题 |
| 状态管理 | Zustand 5 + Persist | 切片模式 + localStorage 自动存档 |
| 动画 | Framer Motion | 卡牌翻转、数值跳动、事件弹窗 |
| AI 集成 | Vercel AI SDK (`ai`) + `@ai-sdk/openai` | 支持 OpenAI |
| 后端 | Express 5 | AI API 代理 + Prompt 管理 |
| 包管理 | npm workspaces (monorepo) | 共享类型定义 |

## 项目结构

```
leviathan/
├── packages/
│   ├── shared/              # 共享类型与游戏数据
│   │   └── src/
│   │       ├── types/       # NationState, Card, GameEvent 等
│   │       └── constants/   # 卡牌、事件、合成公式、AI Prompt
│   ├── client/              # Vite + React 前端
│   │   └── src/
│   │       ├── components/  # UI 组件 + 游戏组件
│   │       ├── stores/      # Zustand 5 切片 (nation/cards/events/game/narrative)
│   │       ├── hooks/       # useGameLoop, useAINarrative, useAutoSave
│   │       └── pages/       # MainMenu, GameScreen
│   └── server/              # Express 5 后端
│       └── src/
│           ├── routes/      # /api/weave, /api/event-flavor, /api/judge, /api/history-book
│           ├── services/    # promptBuilder, contextManager, comboEngine
│           └── middleware/   # rateLimiter
├── .env.example             # 环境变量模板
└── package.json             # monorepo root
```

---

## 快速开始

### 安装

```bash
git clone https://github.com/<your-username>/leviathan.git
cd leviathan
npm install
```

### 配置 AI（可选）

```bash
cp .env.example .env
# 编辑 .env，填入 OpenAI API Key
# 不填 Key 则以 Mock 模式运行（使用本地规则引擎，无需联网）
```

### 启动开发服务器

```bash
# 终端 1: 启动后端 (端口 3001)
npm run dev:server

# 终端 2: 启动前端 (端口 5173)
npm run dev:client
```

打开浏览器访问 `http://localhost:5173`。

### Vercel 部署

本项目支持 Vercel 部署：

- **Framework**: Vite
- **Root Directory**: `packages/client`
- **Build Command**: `cd ../.. && npm install && npx -w packages/client vite build`
- **Output Directory**: `dist`
- **Environment Variables**: 在 Vercel 项目设置中添加 `OPENAI_API_KEY`

> 注意：后端 API 路由需要单独部署为 Vercel Serverless Functions 或其他服务。Mock 模式下前端可独立运行。

---

## AI 模式

| 模式 | 条件 | 行为 |
|------|------|------|
| **Mock** | 无 API Key | 使用本地 `comboEngine` 规则引擎生成确定性结果 |
| **AI** | 设置 `OPENAI_API_KEY` | 调用 GPT-4.1-mini 生成动态叙事、事件润色、历史书 |

Mock 模式完全可玩——规则引擎会根据卡牌标签和属性计算结果。AI 模式提供更丰富、更不可预测的叙事体验。

---

## 游戏数据

### 初始素材卡

| 卡牌 | 标签 | 叙事潜力 |
|------|------|----------|
| 半个发霉的馒头 | 食物, 腐烂, 绝望 | 20 |
| 义乌产塑料关公像 | 信仰, 武德, 廉价 | 75 |
| 甚至没有插线的红色电话机 | 权威, 神秘, 沉默 | 90 |
| 只有下半部的《XX通史》 | 仇恨, 历史, 残缺 | 80 |
| 许多枚公章(萝卜刻的) | 官僚, 许可, 混乱 | 50 |
| 带血的眼镜 | 知识, 脆弱, 替罪羊 | 55 |
| 一箱全英文标签的午餐肉 | 食物, 外来, 阴谋 | 45 |
| 盗版《建国大业》DVD | 神话, 娱乐, 反射 | 70 |
| 坏掉的村口大喇叭 | 宣传, 噪音, 真理 | 75 |

### 合成配方

1. **关公像 + 铁丝网** → 关帝爷的雷电荆棘（神权防御）
2. **半部史书 + 咖啡渍地图** → 大黑斑行省法理宣称（领土发明）
3. **午餐肉 + 公章 + 红色电话** → 肉罐头金本位（货币体系）
4. **DVD + 大喇叭 + 敌军尸体** → 英灵显灵大会（萨满科技）
5. **关公像 + 电话 + 史书 + 公章 + 喇叭** → 利维坦的觉醒（隐藏终极）

---

## 设计哲学

本游戏的核心命题来自刘仲敬的"民族发明学"：

- **所有民族都是被发明的** — 玩家亲手经历这个过程
- **叙事的力量与脆弱** — 用垃圾素材可以构建帝国，但一个矛盾就能摧毁一切
- **暴力是叙事的底层保障** — 没有枪的故事只是故事
- **所有选择都有代价** — 没有"好"的选项，只有"活下去"的选项

---

## 许可证

MIT
