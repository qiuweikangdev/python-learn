# Microsoft AutoGen详解

> **版本基线**：本文基于 LangChain 1.x / LangGraph 1.x（2025-10 GA），示例模型 gpt-5-mini，更新于 2026-09。

## 概述

Microsoft AutoGen是微软开发的多Agent对话框架，支持复杂的多Agent协作场景。它提供了灵活的对话管理和Agent协作机制，适合企业级应用。

::: warning 包名与版本（2026-09）
AutoGen 自 v0.4 起重构为全新异步架构，**新包名为 `autogen-agentchat`**（`pip install autogen-agentchat`）。旧包名 `pyautogen` 已停止演进（其社区延续版本为 AG2）。本节示例全部使用 v0.4+ 新 API；网上大量 `import autogen` + `llm_config` 的旧教程对应的是已停更的旧版。
:::

## 核心概念

### 1. Agent类型
AutoGen v0.4+ 常用Agent类型：
- **AssistantAgent**：AI助手Agent
- **UserProxyAgent**：代表人类输入的用户代理Agent
- **CodeExecutorAgent**：负责执行代码的Agent
- **自定义Agent**：继承 `BaseChatAgent` 定制

### 2. 对话模式（Teams）
v0.4+ 用"团队（Team）"组织多Agent协作：
- **RoundRobinGroupChat**：按轮转顺序对话
- **SelectorGroupChat**：由模型选择下一个发言者（群聊）
- **Swarm**：基于"交接（Handoff）"的对话
- **嵌套对话**：Team 可作为更大 Team 的成员

### 3. 代码执行
AutoGen的代码执行能力：
- **代码生成**：Agent生成代码
- **代码执行**：在安全环境中执行代码（本地/Docker沙箱）
- **结果反馈**：将执行结果反馈给Agent
- **错误处理**：处理代码执行错误

### 4. 人类参与
AutoGen的人类参与机制：
- **人工审批**：在关键节点等待人工审批
- **人工输入**：UserProxyAgent 通过 input_func 获取人工输入
- **人工反馈**：获取人工反馈
- **人工干预**：运行可中断、可恢复

## 核心API

### 1. 安装和配置
```bash
# 安装 AutoGen v0.4+（新包名；旧包名 pyautogen 已停止演进）
pip install autogen-agentchat autogen-ext openai

# 配置环境变量
export OPENAI_API_KEY="your-api-key"
```

### 2. 创建Agent
```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

# 配置模型客户端（取代旧版的 llm_config 字典）
model_client = OpenAIChatCompletionClient(
    model="gpt-5-mini",
    api_key="your-api-key",
)

# 创建助手Agent
assistant = AssistantAgent(
    name="assistant",
    model_client=model_client,
    system_message="你是一个有用的AI助手。",
)

# 运行（v0.4+ 为异步接口）
async def main():
    await Console(assistant.run(task="用一句话介绍 AutoGen"))

asyncio.run(main())
```

### 3. 对话与代码执行
```python
import asyncio
from autogen_agentchat.agents import AssistantAgent, CodeExecutorAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.ui import Console
from autogen_ext.code_executors.local import LocalCommandLineCodeExecutor
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(model="gpt-5-mini", api_key="your-api-key")

assistant = AssistantAgent(
    name="assistant",
    model_client=model_client,
    system_message="你是一个有用的AI助手，需要时输出 Python 代码块。",
)

# 代码执行Agent（生产环境建议换用 DockerCommandLineCodeExecutor 沙箱）
code_executor = CodeExecutorAgent(
    name="code_executor",
    code_executor=LocalCommandLineCodeExecutor(work_dir="coding"),
)

# 终止条件：消息中出现 TERMINATE（取代旧版的 is_termination_msg）
termination = TextMentionTermination("TERMINATE")

# 轮转团队：assistant 写代码 → code_executor 执行 → 反馈
team = RoundRobinGroupChat(
    [assistant, code_executor],
    termination_condition=termination,
)

async def main():
    await Console(team.run_stream(task="请写一个Python脚本，分析CSV文件并生成图表。"))

asyncio.run(main())
```

### 4. 群聊对话
```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.conditions import MaxMessageTermination
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(model="gpt-5-mini", api_key="your-api-key")

# 创建多个角色Agent
pm = AssistantAgent(name="product_manager", model_client=model_client,
                    system_message="你是产品经理，负责需求分析。")
architect = AssistantAgent(name="architect", model_client=model_client,
                           system_message="你是架构师，负责系统设计。")
developer = AssistantAgent(name="developer", model_client=model_client,
                           system_message="你是开发者，负责代码实现。")

# 由模型选择下一个发言者的群聊（取代旧版 GroupChat + GroupChatManager）
team = SelectorGroupChat(
    [pm, architect, developer],
    model_client=model_client,  # 负责选择发言者
    termination_condition=MaxMessageTermination(20),
)

async def main():
    await Console(team.run_stream(task="请帮我设计和实现一个简单的博客系统。"))

asyncio.run(main())
```

### 5. 自定义Agent
```python
from autogen_core import CancellationToken
from autogen_agentchat.agents import BaseChatAgent
from autogen_agentchat.base import Response
from autogen_agentchat.messages import TextMessage

class CustomAgent(BaseChatAgent):
    def __init__(self, name: str, **kwargs):
        super().__init__(name=name, description="自定义回复Agent", **kwargs)
        self.custom_data = {}

    async def on_messages(self, messages, cancellation_token: CancellationToken) -> Response:
        # 自定义回复逻辑
        last_message = messages[-1].content
        reply = TextMessage(content=f"自定义回复: {last_message}", source=self.name)
        return Response(chat_message=reply)

    async def on_reset(self, cancellation_token: CancellationToken) -> None:
        self.custom_data = {}
```

## 实践指南

### 1. 环境准备
```bash
# 安装 AutoGen v0.4+（不要再用 pyautogen）
pip install autogen-agentchat autogen-ext openai

# 配置API密钥
export OPENAI_API_KEY="your-api-key"
```

### 2. 基础使用示例
```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(model="gpt-5-mini", api_key="your-api-key")

# 创建助手
assistant = AssistantAgent(
    name="assistant",
    model_client=model_client,
    system_message="你是一个有用的AI助手，擅长编写Python代码。",
)

async def main():
    await Console(assistant.run_stream(task="请帮我写一个Python函数，实现快速排序算法。"))

asyncio.run(main())
```

### 3. 群聊协作

参考上面"群聊对话"一节：用 `SelectorGroupChat` 组织产品经理/架构师/开发者，由模型决定发言顺序，`MaxMessageTermination` 控制轮次上限，防止对话失控。

### 4. 嵌套对话

v0.4+ 中 Team 也可以作为更大 Team 的成员，从而实现"主任务 → 子任务团队"的嵌套结构：把处理子任务的 `RoundRobinGroupChat` 整体注册进一个外层 `SelectorGroupChat`，主任务 Agent 负责拆解与汇总，子团队负责执行。

## 最佳实践

### 1. Agent设计
- **明确角色**：为每个Agent设定明确的角色
- **清晰指令**：提供清晰的系统指令
- **合理配置**：合理配置模型参数
- **工具集成**：为Agent集成合适的工具

### 2. 对话管理
- **控制轮次**：用 termination_condition 设置合理的终止条件
- **处理终止**：正确处理对话终止
- **错误处理**：处理对话中的错误
- **日志记录**：记录对话日志

### 3. 代码执行
- **安全环境**：使用 DockerCommandLineCodeExecutor 等沙箱执行代码
- **超时控制**：设置合理的超时时间
- **错误处理**：处理代码执行错误
- **结果验证**：验证代码执行结果

## 常见问题

### 1. 配置问题
- **API密钥错误**：检查API密钥配置
- **模型不可用**：检查模型可用性
- **依赖缺失**：检查依赖安装

### 2. 执行问题
- **对话卡住**：检查终止条件与轮次设置
- **代码执行失败**：检查代码执行环境
- **内存不足**：优化内存使用

### 3. 协作问题
- **Agent冲突**：解决Agent间的冲突
- **任务重复**：避免任务重复执行
- **输出质量**：提高输出质量

## 下一步学习

- [ChatDev详解](/day126-130/chatdev) - 基于角色的开发框架
- [CAMEL详解](/day126-130/camel) - 通信Agent框架
- [多Agent系统](/day131-135/) - 学习多Agent协作
