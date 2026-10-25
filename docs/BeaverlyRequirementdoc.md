
# Beaverly — 产品需求文档（PRD）

**产品：** Beaverly
**吉祥物：** Barry the Beaver
**赛道：** Personal AI
**目标用户：** 独立执业律师 / 小型律所
**核心技术：** Hermes Agent + NVIDIA OpenShell + NVIDIA Nemotron + Nebius Token Factory + Nebius Serverless Jobs
**版本：** v7.0（最终整合版）

## 1. 一句话定义

> **Beaverly 是一个会逐渐学会律师工作习惯，但同时知道“哪些东西可以记、哪些东西只能属于某个案件”的本地私有 AI 助理。**

普通 AI：“告诉我你需要什么。”
Beaverly：“我学会你怎么工作——但我知道什么不该记住。”

**核心公式：Learn → Scope → Remember → Apply → Verify**

## 2. 问题

### 痛点一：律师在用 AI，但用的是不该用的 AI

Clio 2026 报告：71% 单干律师、75% 小所在用 AI。但最常用的工具是**通用消费级产品**（ChatGPT/Claude），不是法律专用系统——这增加保密风险，也造成工作流碎片化。

8am 2026 报告：通用 AI 个人使用率 68%，法律专用工具只有 40%。独立律师宁愿冒险用 ChatGPT，也不愿意或没能力用 Harvey——因为 Harvey 不可及（$1,200/律师/月，最低 25–50 席位）。

### 痛点二：律师不信任 AI 的输出

Smokeball 调查：只有 33% 的律师对 AI 生成的法律研究结果放心，39% 不信任，53% 有伦理顾虑。已有超过 20 个澳大利亚法院案件涉及 AI 虚构引用，导致处罚。

### 痛点三：利益冲突隔离是执业资格问题

A 客户的案情信息绝对不能在 B 客户的工作中被“想起来”。这不是隐私偏好，是可能被吊销执照的合规红线。ABA Formal Opinion 512 已明确指出，提交信息至公共生成式 AI 工具可能导致无意披露。

### 痛点四：律师没时间学新工具

27%–33% 的单干/小所律师认为“找时间学新技术”是最大障碍。第一次打开到第一个结果必须跟打开 ChatGPT 一样快。

## 3. 核心洞察

AI 有两个矛盾：

1. **AI 不够了解律师**：每次都要重新解释用词习惯、格式、写作风格。
2. **AI 记得太多又很危险**：如果 AI 把“甲方 = ABC Holdings”变成全局记忆，处理另一个客户时就会错误使用。

**Beaverly 要解决的就是这句话：AI 应该越来越了解律师，但不能因此越来越了解所有客户。**

## 4. 产品核心：两种记忆

```
                Beaverly Memory
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
    Lawyer Memory          Case Memory
    全局工作习惯              案件专属信息
          │                     │
   所有案件可用              仅当前案件可用
```

- **Lawyer Memory**：“我喜欢正式、简洁的合同语言。” → 所有案件可用。
- **Case Memory**：“ABC Holdings 是本案甲方。” → 仅 Case A 可用。

## 5. MVP 功能

### P0 — 必须完成

| # | 功能                                  | 说明                                                                                                |
| - | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1 | **Self-Evolving Lawyer Memory** | 律师纠正 AI → Beaverly 问“以后都这样吗？” → 确认为全局技能                                      |
| 2 | **Memory Scope Detection**      | 检测纠正是否包含案件专属信息 → 询问“全局记忆还是仅本案件？”                                      |
| 3 | **Strict Case Isolation**       | 每个案件独立数据空间，OpenShell 内核级强制隔离                                                      |
| 4 | **Pre-Submission Verification** | 草稿 vs 案卷原始材料比对，标红不一致，附来源；长文档通过**Nebius Serverless Jobs** 后台批处理 |

### P1 — 有时间再做

- Skill Version History（可回滚）
- Memory Deletion + Audit Log
- Better RAG

### P2 — 可以直接不做

- Offline Mode
- Fine-tuning
- Weekly Autonomous Consolidation
- Skill Merging

## 6. 核心流程图（Pitch 架构图）

**每次律师纠正 AI：**

```
Correction
     ↓
Is it reusable?
   /       \
  No       Yes
  ↓         ↓
Don't save  Check scope
              ↓
       Contains case info?
          /          \
        Yes           No
         ↓             ↓
   Case Memory    Global Skill
```

**这是整个 Beaverly 最重要的逻辑。它让自主学习引擎和案件隔离墙真正联动。**

## 7. 为什么必须是 OpenShell（不是应用层逻辑）

不该只靠 `if current_case == case_A: allow()`。因为 Agent 可能被 prompt injection、错误调用 tool、请求不该访问的文件。

```
Hermes Agent → OpenShell → Policy Enforcement
```

OpenShell 在**基础设施层**限制 Agent 能读什么、能访问什么网络。**Agent 在技术上没有权限将数据移出沙盒，除非策略明确允许。**

**Beaverly 的安全理念：不要只告诉 AI 它不该做什么，而是从技术上限制它被允许做什么。**

## 8. 竞品对比

| 竞品                      | 核心能力                           | 关键局限                              | 可及性     |
| ------------------------- | ---------------------------------- | ------------------------------------- | ---------- |
| **Harvey II**       | Memory 学习个人风格；ethical walls | 云端 SaaS；$1,200/月，25–50 席位最低 | 不可及     |
| **August Personas** | client/matter 级 memory            | 云端 SaaS；面向律所                   | 需订阅     |
| **Elephas**         | 本地 Mac 运行；按案件隔离          | 通用 AI，不从纠正中学习               | 可及但有限 |
| **Clearbrief**      | 引用验证                           | 检查公共引用，不访问私有案卷          | 部分可及   |

### 为什么不用 Harvey？

Harvey 不可及（$1,200/月，25–50 席位最低）。隔离是**应用层权限配置**，Beaverly 的隔离是 **OpenShell 内核层强制执行**。

### 为什么不用 ChatGPT？

ChatGPT 的数据必须离开设备，违反保密义务；且无私有 RAG 核查；记忆是全局的，不区分案件。

### 为什么必须开源？

Hermes Agent 设计上就跑在自托管 Nemotron 上。OpenShell 的策略执行在基础设施层，闭源 API 无法提供同等控制。

## 9. 为什么独此一家

| 能力                     | Harvey | August | Elephas | Beaverly |
| ------------------------ | ------ | ------ | ------- | -------- |
| 学习个人习惯             | ✅     | ✅     | ❌      | ✅       |
| 按案件隔离记忆           | 路线图 | ✅     | ✅      | ✅       |
| 基础设施层强制隔离       | ❌     | ❌     | ❌      | ✅       |
| 基于私有案卷的提交前核查 | ❌     | ❌     | ❌      | ✅       |
| 独立律师可自己部署       | ❌     | ❌     | ✅      | ✅       |

**Harvey 能做的，Beaverly 也能做。但 Beaverly 能做的，Harvey 做不到——因为数据永远留在律师自己的机器上。**

## 10. 技术架构

```
                  LAWYER
                     │
                     ↓
                  Beaverly
                     │
              Hermes Agent
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
   Memory Manager          Tool Manager
          │
          ↓
  Memory Scope Check
          │
          ↓
      OpenShell
          │
   ┌──────┴──────┐
   ↓             ↓
Local Files   Allowed APIs
   │             │
   ↓             ↓
Case RAG    Nebius Token Factory
   │         + Serverless Jobs
   │             │
   └──────┬──────┘
          ↓
       Nemotron
          ↓
    Draft / Answer
          ↓
 Pre-Submission Check
          ↓
        Lawyer
```

| 技术                             | 作用                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| Hermes Agent                     | Agent runtime、memory、skills                                                         |
| Nemotron Nano                    | 轻量分类、memory scope detection                                                      |
| Nemotron Super                   | 主要推理、drafting、verification                                                      |
| Nemotron Ultra                   | 极端低置信度场景兜底                                                                  |
| OpenShell                        | Agent sandbox、filesystem/network policy（内核级强制隔离）                            |
| **NemoClaw**               | **部署蓝图**（OpenShell + Hermes + Nemotron 的参考组装）— 架构兼容，不实际部署 |
| Nebius Token Factory             | Nemotron inference、Embedding、Rerank                                                 |
| **Nebius Serverless Jobs** | **批量提交前核查**（长文档后台批处理）                                          |
| LanceDB                          | 案件级 memory 向量存储                                                                |

### 关于 NemoClaw 的说明

NemoClaw 是 NVIDIA 的开源部署蓝图，将 OpenShell、Hermes Agent、Nemotron 打包为可安装栈。Beaverly **架构上完全兼容 NemoClaw 蓝图**，但因其需要 DGX Spark 或 GB10 等特定硬件，而目标用户是使用标准笔记本的独立律师，所以 Demo 中直接集成 OpenShell + Hermes Agent + Nemotron。NemoClaw 是生产部署路径。

## 11. Settings 页面（无 Admin Side）

Beaverly **不需要独立 Admin Side**。律师就是唯一用户，也是管理员。所有系统管理集中在右上角齿轮图标的 **Settings 页面**：

| 设置项                              | 说明                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| **API Key**                   | 连接 Nebius Token Factory                                                      |
| **Security Policy**           | 大白话开关：“只能读当前案件文件夹” ✅ 默认开；“禁止连接外部网络” ✅ 默认开 |
| **Advanced Config（可折叠）** | 展示真实 YAML，供技术评审查看                                                  |
| **Model Routing**             | 可选：为不同任务选择 Nano / Super / Ultra                                      |
| **Data Storage Location**     | 显示“数据存储在本机”，让律师放心                                             |
| **Export Audit Log**          | 导出 Protection Record 为 PDF                                                  |
| **About**                     | 版本、开源许可证、NemoClaw 蓝图声明                                            |

**为什么不需要 Admin Side：** Beaverly 是本地应用，不是 SaaS。没有中心服务器、没有多租户、没有用户账户管理。开发团队只负责开发和发版。

## 12. 3 分钟 Demo 故事线

| 时间       | 场景                                                                                              | 目的           |
| ---------- | ------------------------------------------------------------------------------------------------- | -------------- |
| 0:00–0:30 | 律师教 Beaverly 习惯 → 全局技能创建                                                              | 证明它会学习   |
| 0:30–1:00 | 律师在 Case A 说“甲方改成 ABC Holdings” → Beaverly 检测到案件专属信息 → 询问“只存 Case A？” | 证明它知道边界 |
| 1:00–1:30 | 切换到 Case B → 问“甲方是谁？” → Beaverly：“本案没有这个信息。”                             | 证明隔离生效   |
| 1:30–2:00 | 让 Agent 尝试读取 Case A → OpenShell：❌ DENIED                                                  | 证明内核级阻止 |
| 2:00–2:40 | 起草文件 → Beaverly 发现草稿日期 21 March vs 案卷 12 March → 标红 + 来源                        | 证明它会核查   |
| 2:40–3:00 | 收尾：“Beaverly learns how you work — without learning what it shouldn't.”                     | 一句话记住     |

**如果这条链能流畅跑完，Beaverly 就是一个完整的 Personal AI 产品，不是法律 Chatbot。**

## 13. 我们不做什么

❌ 完整法律研究平台
❌ 自动法律意见
❌ 自动提交法院文件
❌ 完整 case management system
❌ 自动判断胜率
❌ 完整 fine-tuning pipeline
❌ 100% hallucination prevention
❌ 100% data-leak prevention claim

**Beaverly 是 AI assistant，不是 autonomous lawyer。**

## 14. 成功标准

Hackathon MVP 验证四件事：

1. **Can Beaverly learn?** 律师纠正后，未来输出体现习惯。
2. **Can Beaverly scope?** 全局技能和案件记忆能正确区分。
3. **Can Beaverly enforce?** Case A 信息不能被 Case B 访问。
4. **Can Beaverly verify?** 找到预先设计的事实错误，并提供来源。

## 15. 风险与应对

| 风险                                         | 应对                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| Memory scope detection 不准确                | MVP 只处理高置信度案例                                                                  |
| **技能安全检测有盲区**                 | NER 只能抓专有名词，对描述性事实有盲区。Demo 只展示高置信度例子，不声称覆盖所有泄露场景 |
| RAG 找不到正确来源                           | 使用小型、结构清晰的 Demo case                                                          |
| **30 秒冷启动**                        | 第一周搭最小闭环测冷启动；用 LanceDB；Nebius API 连接池预热；Demo 前预热机器。专人负责  |
| OpenShell 配置复杂                           | 先实现 filesystem + network 最小 policy                                                 |
| Offline 太复杂                               | P2，时间不够直接砍掉                                                                    |
| **NemoClaw 未实际部署**                | 在 README 和 Pitch 中声明“基于 NemoClaw 蓝图组装”，说明硬件要求导致不直接部署         |
| **Nebius Serverless 未在 Demo 中展示** | 使用 Serverless Jobs 做批处理核查，或在 Pitch 中说明这是扩展路径                        |
| 法律 claim 太大                              | 明确 Beaverly 不提供法律意见                                                            |
| 隐私 claim 太绝对                            | 根据实际部署模式描述，不声称“绝对安全”                                                |

## 16. 最终定位

> **Beaverly：The AI that learns how you work — without learning what it shouldn't.**

**A self-evolving Personal AI assistant for independent lawyers with:**

- 🧠 **Personal Learning** — learns the lawyer's working style
- 🔒 **Memory Boundaries** — separates general skills from case-specific knowledge
- 🛡️ **Enforced Isolation** — OpenShell restricts what the agent can access
- 🔍 **Pre-Submission Verification** — checks AI drafts against case documents

**核心公式：Personal AI + Persistent Memory + Memory Boundaries + Agent Security**

不是：Lawyer chatbot + RAG + privacy + offline + verification + lots of features.

## 17. 数据来源（Pitch 引用时用）

| 数据                                   | 来源                           |
| -------------------------------------- | ------------------------------ |
| 71% 单干律师 / 75% 小所使用 AI         | Clio 2026 Legal Trends Report  |
| 68% 通用工具 / 40% 法律专用            | 8am 2026 Legal Industry Report |
| 33% 放心 / 39% 不信任 / 53% 伦理顾虑   | Smokeball Industry Survey      |
| 27%–33% 没时间学新工具                | Clio 2026                      |
| Harvey 定价 $1,200/月，25–50 席位最低 | 公开报道                       |

**引用时说出具体来源，比“行业调查显示”有力得多。**

## 18. Hackathon 合规性对照

| 要求                                                               | Beaverly 状态                                                               |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 跑在 Nebius Token Factory 或 AI Cloud                              | ✅ Token Factory + Serverless Jobs                                          |
| 至少一个 NVIDIA 开源模型                                           | ✅ Nemotron Nano / Super / Ultra                                            |
| Always-on, private assistant                                       | ✅ 本地运行，持续学习                                                       |
| Data under your control                                            | ✅ 数据物理上不出设备                                                       |
| Persistent memory                                                  | ✅ Lawyer Memory + Case Memory                                              |
| Reusable skills                                                    | ✅ Hermes Agent 技能自生成                                                  |
| Access to chosen tools/info                                        | ✅ 私有案卷 RAG + 联网脱敏                                                  |
| Carry out tasks across daily workflows                             | ✅ 起草、纠正、核查、切换、结案                                             |
| Tools such as NemoClaw, OpenShell, Hermes Agent, Nebius Serverless | ✅ OpenShell + Hermes Agent + Nebius Serverless Jobs + NemoClaw（蓝图声明） |

---

**Beaverly 的核心公式：Learn → Scope → Remember → Apply → Verify**

**Beaverly 学你怎么工作，但知道什么不该记住。**
