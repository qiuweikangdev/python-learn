# LangChain框架

> **版本基线**：本文基于 LangChain 1.x / LangGraph 1.x（2025-10 GA），示例模型 gpt-5-mini，更新于 2026-09。

::: tip LangChain 1.0 迁移速览
LangChain 1.0（2025-10 GA）做了一次大规模 API 重构。如果你在旧教程中见过下面的写法，请按对照关系替换：

| 旧写法（0.x） | 现行写法（1.x） |
| --- | --- |
| `AgentExecutor` / `initialize_agent` | `from langchain.agents import create_agent`（基于 LangGraph 运行时） |
| `LLMChain` / `SequentialChain` 等 Chains 类 | LCEL 管道写法：`chain = prompt \| model \| parser` |
| `langchain.memory.*`（`ConversationBufferMemory` 等） | LangGraph checkpointer：`InMemorySaver` + `thread_id` |
| `langchain` 主包中的旧链/记忆实现 | 已迁入兼容包 `langchain-classic`（仅为维护旧代码存在，新代码禁用） |

官方迁移指南：<https://docs.langchain.com/oss/python/migrate/langchain-v1>
:::

## 概述

LangChain是最流行的LLM应用开发框架，提供了丰富的组件和工具，帮助开发者快速构建基于大语言模型的应用程序。本章将深入介绍LangChain的核心概念、架构设计和实践方法。

## 核心概念

### 1. 模型（Models）
LangChain支持多种LLM模型，包括：
- **OpenAI**：GPT-5、GPT-4o等（模型迭代快，以官方为准）
- **Anthropic**：Claude系列模型
- **Google**：Gemini系列模型
- **开源模型**：Llama、Mistral等

### 2. 提示（Prompts）
提示管理是LangChain的核心功能：
- **PromptTemplate**：可重用的提示模板
- **ChatPromptTemplate**：聊天提示模板
- **FewShotPromptTemplate**：少样本提示模板
- **提示组合**：多个提示的组合使用

### 3. 链（Chains / LCEL）
1.x 中链统一使用 LCEL（LangChain Expression Language）管道语法组合组件：
- **`prompt | model | parser`**：最常用的基础组合
- **Runnable 组合子**：`RunnableParallel`、`RunnableLambda` 等用于编排
- **条件路由**：`RunnableBranch` 实现分支逻辑
- **自定义链**：任何 `Runnable` 都可以用管道拼接

::: warning 旧写法对照
0.x 的 `LLMChain`、`SequentialChain`、`RouterChain` 等类已从 `langchain` 主包移除，迁入兼容包 `langchain-classic`（仅为维护旧代码存在，新代码禁止使用）。现行写法一律使用 LCEL 管道。
:::

### 4. 记忆（Memory / Checkpointer）
1.x 中记忆由 LangGraph 的 checkpointer 统一管理，按 `thread_id` 保存会话状态：
- **InMemorySaver**：内存检查点，适合开发与测试
- **SqliteSaver / PostgresSaver**：持久化存储，适合生产环境
- **thread_id**：一个会话对应一个线程，自动保留完整消息历史
- **摘要/窗口策略**：在自定义状态或提示中裁剪历史实现

::: warning 旧写法对照
0.x 的 `ConversationBufferMemory`、`ConversationSummaryMemory` 等 `langchain.memory.*` 类已从主包移除，迁入 `langchain-classic`。新代码请使用 checkpointer 方案。
:::

### 5. 索引（Indexes）
索引组件用于文档检索：
- **文档加载器**：加载各种格式的文档
- **文本分割器**：将文档分割成小块
- **向量存储**：存储文档向量
- **检索器**：检索相关文档

### 6. 代理（Agents）
代理是LangChain的高级抽象，能够动态决定行动：
- **create_agent**：1.x 标准构造方式（基于 LangGraph 运行时）
- **工具使用**：调用外部工具
- **推理循环**：模型决定下一步行动并观察结果
- **checkpointer**：为 Agent 提供多轮记忆

## 架构设计

### 1. 核心架构
LangChain采用分层架构：
```
应用层
├── Chains（链）
├── Agents（代理）
└── Retrieval（检索）
    ├── Models（模型）
    ├── Prompts（提示）
    ├── Memory（记忆）
    └── Indexes（索引）
```

### 2. 组件交互
```
用户输入 → 提示模板 → LLM模型 → 输出解析 → 结果
                ↑
            记忆组件
                ↑
            工具调用
```

### 3. 扩展机制
LangChain支持多种扩展方式：
- **自定义组件**：实现自定义模型、工具等
- **插件系统**：安装第三方插件
- **回调系统**：监控和调试
- **缓存机制**：缓存计算结果

## 核心API

### 1. 模型调用
```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# OpenAI模型
llm = ChatOpenAI(
    model="gpt-5-mini",
    temperature=0.7,
    api_key="your-api-key"
)

# Anthropic模型
llm = ChatAnthropic(
    model="claude-sonnet-4-5",
    api_key="your-api-key"
)

# 也可以用 init_chat_model 按字符串快速实例化
from langchain.chat_models import init_chat_model
llm = init_chat_model("openai:gpt-5-mini")
```

::: tip 模型迭代快
模型名称更新很快，写代码时请以各厂商官方文档为准。
:::

### 2. 提示模板
```python
from langchain_core.prompts import ChatPromptTemplate

# 创建提示模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手。"),
    ("user", "{input}")
])

# 格式化提示
messages = prompt.format_messages(input="你好！")
```

### 3. 链构建
```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 创建链
chain = (
    ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手。"),
        ("user", "{input}")
    ])
    | ChatOpenAI(model="gpt-5-mini")
    | StrOutputParser()
)

# 执行链
result = chain.invoke({"input": "你好！"})
```

### 4. 代理构建
```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain.tools import tool

# 定义工具
@tool
def search(query: str) -> str:
    """搜索互联网"""
    return f"搜索结果: {query}"

# 创建代理（基于 LangGraph 运行时）
llm = ChatOpenAI(model="gpt-5-mini")
tools = [search]
agent = create_agent(llm, tools, system_prompt="你是一个有用的助手。")

# 执行代理：输入输出均为 messages 列表
result = agent.invoke(
    {"messages": [{"role": "user", "content": "搜索最新科技新闻"}]}
)
print(result["messages"][-1].content)
```

### 5. 记忆管理
```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver
from langchain_openai import ChatOpenAI

# 创建 Agent 并挂载内存检查点
agent = create_agent(
    ChatOpenAI(model="gpt-5-mini"),
    tools=[],
    checkpointer=InMemorySaver(),
)

# 同一个 thread_id 共享会话状态（多轮记忆）
config = {"configurable": {"thread_id": "user-001"}}

# 第一轮对话
response = agent.invoke(
    {"messages": [{"role": "user", "content": "你好，我叫小明"}]},
    config=config,
)
print(response["messages"][-1].content)

# 第二轮对话（模型记得上下文）
response = agent.invoke(
    {"messages": [{"role": "user", "content": "我叫什么名字？"}]},
    config=config,
)
print(response["messages"][-1].content)  # 回答"小明"
```

## 实践指南

### 1. 环境准备
```bash
# 安装（推荐使用 uv）
uv add langchain langchain-openai langchain-anthropic

# 或使用 pip
pip install -U langchain langchain-openai langchain-anthropic

# 设置环境变量
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
```

### 2. 基础示例
```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 创建简单链
def simple_chain():
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手。"),
        ("user", "{input}")
    ])
    
    llm = ChatOpenAI(model="gpt-5-mini")
    output_parser = StrOutputParser()
    
    chain = prompt | llm | output_parser
    return chain

# 使用示例
chain = simple_chain()
result = chain.invoke({"input": "解释什么是Python"})
print(result)
```

### 3. 工具集成示例
```python
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    # 这里应该是实际的天气API调用
    return f"{city}今天天气晴朗，温度25度"

@tool
def search_web(query: str) -> str:
    """搜索互联网信息"""
    # 这里应该是实际的搜索API调用
    return f"搜索结果: {query}"

def build_agent():
    llm = ChatOpenAI(model="gpt-5-mini")
    tools = [get_weather, search_web]
    
    # 1.x 无需手写含 agent_scratchpad 的提示模板，
    # create_agent 内置了标准 Agent 提示，用 system_prompt 定制即可
    return create_agent(
        llm,
        tools,
        system_prompt="你是一个有用的助手，可以使用工具来获取信息。",
    )

# 使用示例
agent = build_agent()
result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京今天天气怎么样？"}]}
)
print(result["messages"][-1].content)
```

### 旧写法（0.x）对照与迁移
如果你在维护旧代码，下面是 Agent 部分的典型对照：

```python
# ❌ 旧写法（LangChain 0.x，已从主包移除，仅存在于兼容包 langchain-classic）
from langchain.agents import AgentExecutor, create_openai_tools_agent

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
result = agent_executor.invoke({"input": "北京今天天气怎么样？"})

# ✅ 新写法（LangChain 1.x）
from langchain.agents import create_agent

agent = create_agent(llm, tools, system_prompt="你是一个有用的助手。")
result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京今天天气怎么样？"}]}
)
```

迁移要点：
- 输入键从 `{"input": ...}` 改为 `{"messages": [...]}`，结果取自 `result["messages"]`。
- `agent_scratchpad` 占位符与手写 Agent 提示不再需要，用 `system_prompt` 定制行为。
- `verbose=True` 调试输出 → 改用 LangSmith 追踪或 LangGraph Studio 观测执行过程。
- `langgraph.prebuilt.create_react_agent` 仍然可用，适合已有 LangGraph 代码；新项目推荐统一使用 `langchain.agents.create_agent`。

## 最佳实践

### 1. 链设计原则
- **单一职责**：每个链只做一件事
- **可组合性**：链应该可以轻松组合
- **错误处理**：添加适当的错误处理
- **日志记录**：记录链的执行过程

### 2. 性能优化
- **缓存结果**：缓存常见查询结果
- **异步执行**：使用异步API提升性能
- **批量处理**：批量处理多个请求
- **模型选择**：根据任务选择合适的模型

### 3. 安全考虑
- **输入验证**：验证用户输入
- **权限控制**：限制工具使用权限
- **敏感信息**：避免在提示中包含敏感信息
- **审计日志**：记录所有操作日志

## 常见问题

### 1. 安装问题
- **依赖冲突**：使用虚拟环境隔离依赖
- **版本兼容**：检查版本兼容性
- **API密钥**：确保API密钥正确设置

### 2. 性能问题
- **响应慢**：优化提示设计，减少token数量
- **内存占用**：使用流式处理减少内存占用
- **并发限制**：使用异步处理提升并发能力

### 3. 调试技巧
- **LangSmith**：开启追踪，查看链与 Agent 每一步的输入输出
- **回调函数**：使用回调函数监控执行
- **日志分析**：分析日志定位问题

## 下一步学习

- [核心概念详解](/agent/langchain/core-concepts) - 深入理解LangChain核心概念
- [API参考手册](/agent/langchain/api-reference) - 详细的API文档
- [最佳实践指南](/agent/langchain/best-practices) - 生产环境使用建议