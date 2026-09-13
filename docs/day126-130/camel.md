# CAMEL详解

> **版本基线**：本文基于 LangChain 1.x / LangGraph 1.x（2025-10 GA），示例模型 gpt-5-mini，更新于 2026-09。

## 概述

CAMEL（Communicative Agents for "Mind" Exploration of Large Language Model Society）是一个通信Agent框架，专注于Agent间的通信和协作机制研究。

::: warning 项目状态（2026-09）
CAMEL 是 2023 年兴起的研究型框架（可通过 `pip install camel-ai` 安装），对"角色扮演 + Inception 提示"范式的开创性研究具历史价值；相比 LangGraph/OpenAI Agents SDK 等生产框架，更新放缓，更适合研究与教学场景。具体 API 以官方文档为准。
:::

## 核心概念

### 1. 角色扮演（Role-Playing）
CAMEL的角色扮演机制：
- **角色定义**：定义Agent的角色和职责
- **角色交互**：不同角色之间的交互
- **角色演化**：角色在交互中的演化
- **角色评估**：评估角色的表现

### 2. 通信协议（Communication Protocol）
CAMEL的通信协议：
- **消息格式**：标准化的消息格式
- **通信模式**：支持多种通信模式
- **错误处理**：通信错误处理机制
- **安全机制**：通信安全保障

### 3. 任务完成（Task Completion）
CAMEL的任务完成机制：
- **任务分解**：将复杂任务分解为简单任务
- **任务分配**：将任务分配给合适的Agent
- **任务执行**：Agent执行具体任务
- **任务验证**：验证任务完成情况

### 4. 社会模拟（Society Simulation）
CAMEL的社会模拟能力：
- **社会结构**：模拟社会结构
- **社会互动**：模拟社会互动
- **社会演化**：模拟社会演化
- **社会评估**：评估社会行为

## 核心API

### 1. 安装和配置
```bash
# 安装CAMEL（包名为 camel-ai）
pip install camel-ai

# 配置环境变量
export OPENAI_API_KEY="your-api-key"
```

### 2. 创建Agent
```python
from camel.agents import ChatAgent

# 创建助手Agent
assistant = ChatAgent(
    system_message="你是一个有用的AI助手。",
    model="gpt-5-mini",
)

# 创建用户Agent
user = ChatAgent(
    system_message="你是一个提出需求的用户。",
    model="gpt-5-mini",
)
```

### 3. 角色扮演对话
```python
from camel.societies import RolePlaying  # 注意：RolePlaying 位于 camel.societies

# 创建角色扮演会话
role_playing = RolePlaying(
    assistant_role_name="Python程序员",
    user_role_name="项目经理",
    task_prompt="开发一个命令行待办事项应用",
    with_task_specify=True,
    assistant_agent_kwargs=dict(model="gpt-5-mini"),
    user_agent_kwargs=dict(model="gpt-5-mini"),
)

# 初始化对话
task_prompt, init_msg = role_playing.init_chat()

# 逐步运行角色扮演循环
output_msg = init_msg
for turn in range(5):
    assistant_response, user_response = role_playing.step(output_msg)
    if assistant_response.terminated:
        break
    print(f"Turn {turn+1}: {assistant_response.msgs[0].content[:200]}")
    output_msg = assistant_response.msg
```

### 4. 通信协议
```python
from camel.agents import ChatAgent

assistant = ChatAgent(
    system_message="你是一个有用的AI助手。",
    model="gpt-5-mini",
)

# 单步对话
response = assistant.step("这是一条测试消息")

# 响应中的消息列表
print(response.msgs[0].content)
```

### 5. 任务分解
```python
from camel.agents import ChatAgent

# 用一个 ChatAgent 充当任务分解器
task_agent = ChatAgent(
    system_message="你是任务分解专家，把任务拆成编号的子任务列表，每行一个。",
    model="gpt-5-mini",
)

# 分解任务
main_task = "开发一个博客系统"
response = task_agent.step(f"请分解任务：{main_task}")
print(response.msgs[0].content)
```

## 实践指南

### 1. 环境准备
```bash
# 安装CAMEL
pip install camel-ai

# 配置API密钥
export OPENAI_API_KEY="your-api-key"
```

### 2. 基础使用示例
```python
from camel.agents import ChatAgent

# 创建Agent
agent = ChatAgent(
    system_message="你是一个有用的AI助手。",
    model="gpt-5-mini",
)

# 单步对话
response = agent.step("请介绍一下人工智能。")

print(f"Assistant: {response.msgs[0].content}")
```

### 3. 角色扮演
```python
from camel.societies import RolePlaying

# 创建角色扮演实例
role_playing = RolePlaying(
    assistant_role_name="数据分析师",
    user_role_name="业务经理",
    task_prompt="分析销售数据并提供洞察",
    with_task_specify=True,
    assistant_agent_kwargs=dict(model="gpt-5-mini"),
    user_agent_kwargs=dict(model="gpt-5-mini"),
)

# 运行对话
task_prompt, init_msg = role_playing.init_chat()

output_msg = init_msg
for i in range(5):
    assistant_response, user_response = role_playing.step(output_msg)
    if assistant_response.terminated:
        break
    print(f"Turn {i+1}: {assistant_response.msgs[0].content}")
    output_msg = assistant_response.msg
```

### 4. 多Agent协作
```python
from camel.agents import ChatAgent

# 创建多个Agent
researcher = ChatAgent(
    system_message="你是一个研究员，负责收集信息。",
    model="gpt-5-mini",
)

analyst = ChatAgent(
    system_message="你是一个分析师，负责分析数据。",
    model="gpt-5-mini",
)

# 研究员收集信息
research_result = researcher.step("请研究人工智能最新进展。")

# 分析师分析结果
analysis_result = analyst.step(
    f"请分析以下研究结果：{research_result.msgs[0].content}"
)

print(f"研究结果：{research_result.msgs[0].content}")
print(f"分析结果：{analysis_result.msgs[0].content}")
```

需要更复杂的协作分工时，可以了解 CAMEL 的 `Workforce`（多 Agent 劳动力编排），见官方文档。

### 5. 任务分解和执行
```python
from camel.agents import ChatAgent

# 创建任务分解Agent
task_agent = ChatAgent(
    system_message="你是任务分解专家，把任务拆成编号的子任务列表，每行一个。",
    model="gpt-5-mini",
)

# 分解任务
main_task = "开发一个电商平台"
response = task_agent.step(f"请分解任务：{main_task}")
subtasks = [
    line.strip() for line in response.msgs[0].content.split("\n") if line.strip()
]

print("任务分解：")
for i, subtask in enumerate(subtasks):
    print(f"{i+1}. {subtask}")

# 创建执行Agent
executor = ChatAgent(
    system_message="你是一个执行者，负责执行具体任务。",
    model="gpt-5-mini",
)

# 执行子任务
for subtask in subtasks:
    result = executor.step(f"请执行任务：{subtask}")
    print(f"\n执行任务：{subtask}")
    print(f"执行结果：{result.msgs[0].content}")
```

## 最佳实践

### 1. 角色设计
- **明确职责**：为每个角色设定明确的职责
- **清晰指令**：提供清晰的系统指令
- **合理配置**：合理配置模型参数
- **技能匹配**：确保角色技能匹配任务需求

### 2. 通信设计
- **标准化消息**：使用标准化的消息格式
- **错误处理**：处理通信中的错误
- **超时控制**：设置合理的超时时间
- **日志记录**：记录通信日志

### 3. 任务设计
- **合理分解**：合理分解复杂任务
- **依赖管理**：管理任务间的依赖关系
- **进度跟踪**：跟踪任务执行进度
- **结果验证**：验证任务执行结果

## 常见问题

### 1. 配置问题
- **API密钥错误**：检查API密钥配置
- **模型不可用**：检查模型可用性
- **依赖缺失**：检查依赖安装

### 2. 执行问题
- **任务失败**：检查任务设置
- **通信错误**：检查通信配置
- **超时问题**：调整超时设置

### 3. 质量问题
- **输出质量**：优化角色指令
- **响应速度**：优化模型配置
- **资源占用**：优化资源使用

## 下一步学习

- [多Agent系统](/day131-135/) - 学习多Agent协作
- [Deep-Agent开发](/day136-140/) - 深度学习与Agent结合
- [Agent平台与服务](/day141-145/) - Agent系统的部署和运维
