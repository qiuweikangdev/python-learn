# LangChain核心概念详解

> **版本基线**：本文基于 LangChain 1.x / LangGraph 1.x（2025-10 GA），示例模型 gpt-5-mini，更新于 2026-09。

## 概述

LangChain是一个用于开发由大语言模型（LLM）驱动的应用程序的框架。本章将深入介绍LangChain的核心概念，包括模型、提示、链、记忆、索引和代理等。

## 核心概念

### 1. 模型（Models）
LangChain支持多种LLM模型：
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

### 3. 链（LCEL）
1.x 中链统一使用 LCEL 管道语法组合组件：
- **`prompt | model | parser`**：基础组合
- **Runnable 组合子**：`RunnableParallel`、`RunnableLambda` 等编排
- **条件路由**：`RunnableBranch` 实现分支逻辑
- **自定义链**：任何 `Runnable` 都可以拼接

::: warning 旧写法对照
0.x 的 `LLMChain`、`SequentialChain`、`RouterChain` 等类已从 `langchain` 主包移除，迁入兼容包 `langchain-classic`（仅为维护旧代码存在，新代码禁止使用）。现行写法一律使用 LCEL 管道。
:::

### 4. 工具（Tools）
工具是 Agent 与外部世界交互的接口：
- **@tool 装饰器**：把普通函数转换为工具
- **StructuredTool**：从函数构建结构化工具
- **工具类型注解**：参数类型自动生成工具 schema
- **检索增强组件**：文档加载器、文本分割器、向量存储、检索器常封装为工具接入 Agent

### 5. 代理（Agents / create_agent）
1.x 中代理的标准构造方式是 `create_agent`（基于 LangGraph 运行时）：
- **create_agent**：内置推理与工具调用循环，取代 AgentExecutor
- **工具使用**：模型自主决定调用哪些工具
- **中间步骤**：结果中的消息列表包含完整的思考与工具调用轨迹
- **错误处理**：模型与工具错误由运行时统一处理

### 6. 记忆（Memory / Checkpointer）
1.x 中记忆由 LangGraph checkpointer 统一管理：
- **InMemorySaver**：内存检查点，适合开发测试
- **SqliteSaver / PostgresSaver**：持久化存储，适合生产环境
- **thread_id**：一个会话一个线程，自动保留消息历史
- **摘要/窗口策略**：在提示或自定义状态中裁剪历史实现

::: warning 旧写法对照
0.x 的 `ConversationBufferMemory`、`ConversationSummaryMemory` 等 `langchain.memory.*` 类已从主包移除，迁入 `langchain-classic`。新代码请使用 checkpointer 方案。
:::

## 技术原理

### 1. 模型抽象层
LangChain的模型抽象层：
- **统一接口**：统一不同模型的调用接口
- **参数管理**：管理模型参数
- **错误处理**：处理模型调用错误
- **重试机制**：自动重试失败的调用

### 2. 链执行引擎
链执行引擎的核心机制：
- **顺序执行**：按顺序执行链中的组件
- **数据传递**：在组件间传递数据
- **错误传播**：传播和处理错误
- **回调机制**：支持回调函数

### 3. 记忆管理机制
记忆管理的核心机制：
- **存储后端**：支持多种存储后端
- **序列化**：序列化和反序列化记忆
- **压缩**：压缩记忆以节省空间
- **检索**：从记忆中检索信息

## 核心API

### 1. 模型调用
```python
# 导入LangChain的模型封装类
# langchain_openai.ChatOpenAI：OpenAI模型的LangChain封装
# 安装：pip install langchain-openai
from langchain_openai import ChatOpenAI

# 导入Anthropic模型封装类
# langchain_anthropic.ChatAnthropic：Anthropic Claude模型的LangChain封装
# 安装：pip install langchain-anthropic
from langchain_anthropic import ChatAnthropic

# 创建OpenAI模型实例
# ChatOpenAI类：封装了OpenAI API的调用逻辑
# 参数说明：
#   model：模型名称，如"gpt-5-mini"、"gpt-4o"
#   temperature：控制输出随机性，0-2之间，越低越确定
#   api_key：OpenAI API密钥
llm = ChatOpenAI(
    model="gpt-5-mini",  # 使用gpt-5-mini模型（推荐）
    temperature=0.7,  # 中等随机性，平衡创造性和准确性
    api_key="your-api-key"  # 替换为真实的API密钥
)

# 创建Anthropic模型实例
# ChatAnthropic类：封装了Anthropic API的调用逻辑
# 参数说明：
#   model：模型名称，如"claude-sonnet-4-5"
#   api_key：Anthropic API密钥
llm = ChatAnthropic(
    model="claude-sonnet-4-5",  # 使用Claude Sonnet 4.5模型
    api_key="your-api-key"  # 替换为真实的API密钥
)

# 调用模型
# invoke()方法：发送请求并获取响应
# 参数：用户输入的文本
# 返回值：AIMessage对象，包含模型生成的内容
response = llm.invoke("你好！")

# 获取响应内容
# response.content：AIMessage对象的content属性，包含文本内容
print(response.content)
```

### 2. 提示模板
```python
# 导入LangChain的聊天提示模板
# langchain_core.prompts.ChatPromptTemplate：用于创建聊天提示模板
# 提示模板可以包含系统消息、用户消息等
from langchain_core.prompts import ChatPromptTemplate

# 创建提示模板
# ChatPromptTemplate.from_messages()：从消息列表创建提示模板
# 参数：消息列表，每个消息是元组格式 (角色, 内容)
# 角色类型：
#   "system"：系统消息，定义AI助手的行为
#   "user"：用户消息，用户的输入
#   "assistant"：助手消息，AI的回复
# 占位符：{input} 表示运行时会被替换的变量
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手。"),  # 系统消息：定义助手角色
    ("user", "{input}")  # 用户消息：{input}是占位符
])

# 格式化提示
# format_messages()：将占位符替换为实际值
# 参数：占位符变量名和值的映射
# 返回值：格式化后的消息列表
messages = prompt.format_messages(input="你好！")
print(messages)
```

### 3. 链构建
```python
# 导入必要的LangChain组件
from langchain_openai import ChatOpenAI  # OpenAI模型封装
from langchain_core.prompts import ChatPromptTemplate  # 提示模板
from langchain_core.output_parsers import StrOutputParser  # 字符串输出解析器

# 创建链（Chain）
# 链是LangChain的核心抽象，将多个组件串联起来
# 使用管道操作符 | 连接各个组件
# 数据流向：提示模板 -> 模型 -> 输出解析器
chain = (
    # 第一步：创建提示模板
    ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手。"),
        ("user", "{input}")
    ])
    # 第二步：创建OpenAI模型
    | ChatOpenAI(model="gpt-5-mini")
    # 第三步：创建输出解析器
    # StrOutputParser()：将模型输出转换为字符串
    | StrOutputParser()
)

# 执行链
# invoke()方法：执行整个链
# 参数：包含占位符变量的字典
# 返回值：链的最终输出结果
result = chain.invoke({"input": "你好！"})
print(result)
```

### 4. 记忆管理（现代方式）
```python
# 导入LangChain的核心组件
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# 创建存储会话历史的字典
# 每个session_id对应一个独立的对话历史
store = {}

def get_session_history(session_id: str) -> InMemoryChatMessageHistory:
    """获取会话历史"""
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

# 创建模型
llm = ChatOpenAI(model="gpt-5-mini")

# 创建带历史的链
# RunnableWithMessageHistory：自动管理对话历史
with_message_history = RunnableWithMessageHistory(
    llm,  # 语言模型
    get_session_history,  # 获取历史的函数
    input_messages_key="input",  # 输入消息的键
    history_messages_key="history",  # 历史消息的键
)

# 配置session_id
config = {"configurable": {"session_id": "abc123"}}

# 第一轮对话
response = with_message_history.invoke(
    {"input": "你好，我叫小明"},
    config=config,
)
print(response.content)

# 第二轮对话（模型会记住上下文）
response = with_message_history.invoke(
    {"input": "我叫什么名字？"},
    config=config,
)
print(response.content)  # 模型会回答"小明"
```

::: tip Agent 的记忆用 checkpointer
`RunnableWithMessageHistory` 适合普通 LCEL 链。对于 `create_agent` 创建的 Agent，记忆统一由 LangGraph checkpointer 管理（`InMemorySaver` + `thread_id`），详见下文实践指南。
:::

## 实践指南

### 1. 环境准备
```bash
# 安装LangChain
pip install langchain langchain-openai langchain-anthropic

# 设置环境变量
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
```

### 2. 基础示例
```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 创建简单链的函数
def simple_chain():
    """
    创建一个简单的LangChain链
    
    返回值：
        chain: 可执行的链对象
    
    链的结构：提示模板 -> 模型 -> 输出解析器
    """
    # 创建提示模板
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手。"),  # 系统消息
        ("user", "{input}")  # 用户消息占位符
    ])
    
    # 创建OpenAI模型
    llm = ChatOpenAI(model="gpt-5-mini")
    
    # 创建输出解析器
    # StrOutputParser()：将模型输出转换为纯字符串
    output_parser = StrOutputParser()
    
    # 使用管道操作符连接组件
    # 数据流向：prompt -> llm -> output_parser
    chain = prompt | llm | output_parser
    return chain

# 使用示例
# 创建链实例
chain = simple_chain()

# 执行链
# invoke()方法：执行整个链
# 参数：包含输入变量的字典
result = chain.invoke({"input": "解释什么是Python"})
print(result)
```

### 3. 工具集成示例
::: warning eval() 的安全风险
示例中的 `calculate` 工具使用 `eval()` 直接执行字符串表达式，仅适用于本地演示。`eval()` 会执行任意 Python 代码，若工具输入来自用户或模型输出，可能被注入恶意代码导致数据泄露或系统被控。生产环境请改用 `ast.literal_eval`（仅解析字面量）或受限的表达式求值库（如 `simpleeval`），并遵循最小权限原则。
:::

```python
# 导入必要的LangChain组件
from langchain_openai import ChatOpenAI  # OpenAI模型
from langchain.agents import create_agent  # 1.x 标准Agent构造函数
from langchain.tools import tool  # 工具装饰器

# 使用@tool装饰器定义工具
# @tool装饰器：将函数转换为LangChain工具
# 函数的docstring会作为工具的描述
# 函数的类型注解会作为参数的类型定义
@tool
def search(query: str) -> str:
    """搜索互联网
    
    参数：
        query (str): 搜索关键词
    
    返回值：
        str: 搜索结果
    """
    # 这里应该是实际的搜索API调用
    # 示例返回模拟结果
    return f"搜索结果: {query}"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式
    
    参数：
        expression (str): 数学表达式，如 "2 + 3 * 4"
    
    返回值：
        str: 计算结果
    """
    try:
        # 仅演示用：eval() 有代码注入风险，生产环境请使用
        # ast.literal_eval 或 simpleeval 等受限求值方案
        result = eval(expression)
        return str(result)
    except:
        return "计算错误"

def build_agent():
    """
    创建Agent
    
    返回值：
        agent: 基于 LangGraph 运行时的 Agent 实例
    
    Agent是能够使用工具的智能体
    """
    # 创建OpenAI模型
    llm = ChatOpenAI(model="gpt-5-mini")
    
    # 工具列表
    tools = [search, calculate]
    
    # 创建Agent
    # create_agent()：1.x 标准Agent构造方式，基于 LangGraph 运行时
    # 参数：
    #   llm：语言模型
    #   tools：工具列表
    #   system_prompt：系统提示，定义Agent的行为（无需手写 agent_scratchpad）
    return create_agent(
        llm,
        tools,
        system_prompt="你是一个有用的助手，可以使用工具来完成任务。",
    )

# 使用示例
# 创建Agent实例
agent = build_agent()

# 执行Agent
# invoke()方法：执行Agent
# 输入是 messages 列表；Agent会自动决定是否使用工具，以及使用哪个工具
# 结果在 result["messages"] 中，最后一条为最终回答
result = agent.invoke(
    {"messages": [{"role": "user", "content": "搜索最新科技新闻并计算相关数据"}]}
)
print(result["messages"][-1].content)
```

#### 旧写法（0.x）对照

```python
# ❌ 旧写法（LangChain 0.x，AgentExecutor 已从主包移除，仅存在于 langchain-classic）
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手，可以使用工具来完成任务。"),
    ("user", "{input}"),
    ("placeholder", "{agent_scratchpad}")  # 需要手动维护思考过程占位符
])
agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
result = agent_executor.invoke({"input": "搜索最新科技新闻并计算相关数据"})

# ✅ 新写法（LangChain 1.x）
from langchain.agents import create_agent

agent = create_agent(llm, tools, system_prompt="你是一个有用的助手。")
result = agent.invoke({"messages": [{"role": "user", "content": "..."}]})
```

迁移要点：
- `AgentExecutor` 的执行循环已内置于 `create_agent`（底层是 LangGraph 运行时）。
- 提示模板与 `agent_scratchpad` 不再需要，用 `system_prompt` 参数定制行为。
- 输入从 `{"input": ...}` 改为 `{"messages": [...]}`；`verbose=True` 的调试输出由 LangSmith / LangGraph Studio 取代。

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

- [API参考手册](/agent/langchain/api-reference) - 详细的API文档
- [最佳实践指南](/agent/langchain/best-practices) - 生产环境使用建议
- [LangGraph工作流](/agent/langgraph/) - 学习基于图的Agent工作流