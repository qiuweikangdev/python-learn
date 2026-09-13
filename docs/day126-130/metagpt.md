# MetaGPT详解

> **版本基线**：本文基于 LangChain 1.x / LangGraph 1.x（2025-10 GA），示例模型 gpt-5-mini，更新于 2026-09。

## 概述

MetaGPT是一个多角色协作框架，模拟软件开发团队的工作流程。它将不同的角色（如产品经理、架构师、工程师等）分配给不同的Agent，实现高效的软件开发。

::: warning 项目状态（2026-09）
MetaGPT 属于 **2023 年的早期探索项目，具历史意义**：它是"多角色软件公司"范式的代表作，可以通过 `pip install metagpt` 安装，但更新节奏已放缓，更适合用来理解 SOP 驱动的多角色协作思想。具体 API 以官方文档为准。
:::

## 核心概念

### 1. 角色定义（Role Definition）
MetaGPT的角色定义：
- **产品经理**：负责需求分析和产品规划
- **架构师**：负责系统架构设计
- **工程师**：负责代码实现
- **测试工程师**：负责测试和质量保证

### 2. 工作流程（Workflow）
MetaGPT的工作流程：
```
1. 产品经理分析需求
2. 架构师设计系统架构
3. 工程师实现代码
4. 测试工程师测试代码
5. 产品经理验收产品
```

### 3. 通信机制（Communication）
MetaGPT的通信机制：
- **消息传递**：通过消息进行通信
- **文档共享**：通过文档共享信息
- **代码仓库**：通过代码仓库协作
- **会议机制**：通过会议进行讨论

### 4. 知识管理（Knowledge Management）
MetaGPT的知识管理：
- **需求文档**：存储需求信息
- **设计文档**：存储设计信息
- **代码文档**：存储代码信息
- **测试文档**：存储测试信息

## 技术原理

### 1. 角色扮演
MetaGPT的角色扮演机制：
- **角色定义**：定义角色的职责和能力
- **角色分配**：将任务分配给合适的角色
- **角色协作**：角色之间进行协作
- **角色评估**：评估角色的表现

### 2. 任务分解
MetaGPT的任务分解机制：
- **需求分析**：分析用户需求
- **任务分解**：将需求分解为任务
- **任务分配**：将任务分配给角色
- **任务执行**：执行具体任务

### 3. 质量控制
MetaGPT的质量控制机制：
- **代码审查**：审查代码质量
- **测试覆盖**：确保测试覆盖
- **文档完整性**：确保文档完整
- **用户验收**：用户验收产品

## 核心API

### 1. 安装和配置
```bash
# 安装MetaGPT
pip install metagpt

# 或者从源码安装
git clone https://github.com/geekan/MetaGPT.git
cd MetaGPT
pip install -r requirements.txt

# 配置环境变量
export OPENAI_API_KEY="your-api-key"
```

### 2. 基础配置
```yaml
# ~/.metagpt/config2.yaml（首次运行 metagpt --init-config 自动生成）
llm:
  api_type: "openai"
  model: "gpt-5-mini"
  api_key: "sk-..."
  base_url: "https://api.openai.com/v1"  # 可选
```

### 3. 运行MetaGPT
```bash
# 方式一：CLI 一句话生成整个软件项目
metagpt "开发一个待办事项应用"
```

```python
# 方式二：用 Python 组建"软件公司"
import asyncio
from metagpt.roles.product_manager import ProductManager
from metagpt.roles.architect import Architect
from metagpt.roles.engineer import Engineer
from metagpt.roles.project_manager import ProjectManager
from metagpt.team import Team

async def main(idea: str, investment: float = 3.0, n_round: int = 5):
    company = Team()
    company.hire([ProductManager(), Architect(), ProjectManager(), Engineer()])
    company.invest(investment)      # 预算上限（美元），防止成本失控
    company.start_project(idea)
    await company.run(n_round=n_round)

asyncio.run(main(idea="开发一个待办事项应用"))
```

### 4. 自定义角色
```python
import asyncio
from metagpt.actions import Action
from metagpt.roles import Role

class WriteAnalysis(Action):
    """自定义动作：撰写分析"""
    name: str = "WriteAnalysis"
    PROMPT_TEMPLATE: str = "请对以下需求做分析：{req}"

    async def run(self, req: str):
        return await self._aask(self.PROMPT_TEMPLATE.format(req=req))

class Analyst(Role):
    """自定义角色：需求分析师"""
    name: str = "Alice"
    profile: str = "需求分析师"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.set_actions([WriteAnalysis])

async def main():
    role = Analyst()
    result = await role.run("开发一个待办事项应用")
    print(result)

asyncio.run(main())
```

## 实践指南

### 1. 环境准备
```bash
# 安装MetaGPT
pip install metagpt

# 配置API密钥
export OPENAI_API_KEY="your-api-key"
```

### 2. 基础使用示例
```python
# 最简单的方式：直接用 CLI
# metagpt "开发一个待办事项应用"

# 或用 Python API（见上文"运行MetaGPT"的 Team 组队示例）
```

### 3. 自定义工作流程

MetaGPT 的流程由角色之间的"订阅-发布"消息机制驱动（SOP 固化在角色与动作的定义里）。要调整流程，通常做法是：

- **增删角色**：`Team().hire([...])` 决定参与的角色
- **控制轮次**：`company.run(n_round=N)` 限制协作轮数
- **自定义动作**：继承 `Action` 定义新的执行步骤，挂到自定义 `Role` 上

### 4. 角色协作

角色之间通过共享的 `Environment` 发布/订阅消息协作：产品经理产出 PRD → 架构师订阅并产出设计 → 工程师订阅并写代码。上面的 `Team` 示例已经组装了这条完整流水线，无需手动编排每个角色的顺序。

## 最佳实践

### 1. 角色设计
- **明确职责**：为每个角色明确职责
- **合理分工**：合理分配任务给角色
- **有效沟通**：确保角色之间有效沟通
- **质量控制**：确保角色工作质量

### 2. 工作流程设计
- **流程清晰**：设计清晰的工作流程
- **阶段明确**：明确每个阶段的任务
- **质量检查**：在每个阶段进行质量检查
- **反馈机制**：建立反馈机制

### 3. 性能优化
- **并发处理**：使用并发处理提升性能
- **缓存机制**：缓存常见任务结果
- **资源管理**：合理管理计算资源
- **监控调优**：监控系统性能并调优

## 常见问题

### 1. 执行问题
- **任务失败**：检查任务设置和权限
- **角色冲突**：解决角色之间的冲突
- **沟通障碍**：解决沟通障碍

### 2. 性能问题
- **响应慢**：优化任务执行
- **成本高**：控制API调用次数
- **内存占用高**：优化记忆管理

### 3. 质量问题
- **代码质量**：加强代码审查
- **测试覆盖**：增加测试覆盖
- **文档完整性**：确保文档完整

## 下一步学习

- [CrewAI详解](/day126-130/crewai) - 多Agent协作框架
- [Microsoft AutoGen详解](/day126-130/autogen) - 多Agent对话框架
- [ChatDev详解](/day126-130/chatdev) - 基于角色的开发框架