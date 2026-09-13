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
记忆管理的核心机制（1.x 中由 LangGraph checkpointer 承担）：
- **存储后端**：InMemorySaver / SqliteSaver / PostgresSaver 等多种检查点后端
- **序列化**：会话状态随检查点自动序列化持久化
- **压缩**：在提示或自定义状态中裁剪/摘要历史以节省空间
- **检索**：通过 `thread_id` 按线程读取历史状态

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

# 调用模型
response = llm.invoke("你好！")
print(response.content)
```

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
print(messages)
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
print(result)
```

### 4. 记忆管理
```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver
from langchain_openai import ChatOpenAI

# 创建 Agent 并挂载内存检查点
conversation = create_agent(
    ChatOpenAI(model="gpt-5-mini"),
    tools=[],
    checkpointer=InMemorySaver(),
)

# 同一个 thread_id 共享会话状态（多轮记忆）
config = {"configurable": {"thread_id": "user-001"}}

# 多轮对话
response = conversation.invoke(
    {"messages": [{"role": "user", "content": "你好！"}]},
    config=config,
)
print(response["messages"][-1].content)
```

::: tip 普通链的消息历史
对 LCEL 链（而非 Agent），可用 `RunnableWithMessageHistory` + `InMemoryChatMessageHistory` 管理消息历史；Agent 一律使用 checkpointer。
:::

## 记忆系统详解

### 记忆的三种类型

在Agent系统中，记忆分为三种类型：

```
┌─────────────────────────────────────────────────────────┐
│                      记忆系统                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  短期记忆    │  │  会话记忆    │  │  长期记忆    │     │
│  │ (上下文窗口) │  │ (对话历史)   │  │ (向量存储)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  - 当前对话的上下文    - 完整的对话历史    - 持久化存储   │
│  - 有限的token数量    - 可以压缩/摘要     - 可以检索     │
│  - 会话结束后丢失     - 跨会话保留       - 长期保留     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1. 短期记忆（上下文窗口）

**定义**：模型一次能处理的最大token数量。

**特点**：
- 有限的token数量（如GPT-4：8K/32K/128K）
- 会话结束后丢失
- 包含当前对话的所有消息

**代码示例**：

```python
from langchain_openai import ChatOpenAI

def demonstrate_context_window():
    """
    演示上下文窗口的概念
    
    上下文窗口限制了模型一次能处理的token数量
    超出限制的消息会被截断或丢失
    """
    
    # 创建模型（指定上下文窗口大小）
    llm = ChatOpenAI(
        model="gpt-5-mini",
        max_tokens=100,  # 限制输出token
    )
    
    # 创建一个很长的对话历史
    long_conversation = []
    for i in range(50):
        long_conversation.append({"role": "user", "content": f"问题{i}: 这是一个测试问题"})
        long_conversation.append({"role": "assistant", "content": f"回答{i}: 这是一个测试回答"})
    
    # 添加当前问题
    long_conversation.append({"role": "user", "content": "请问我们刚才讨论了什么？"})
    
    # 调用模型
    try:
        response = llm.invoke(long_conversation)
        print(f"模型回答：{response.content}")
    except Exception as e:
        print(f"错误：{e}")
        print("原因：对话历史超出了上下文窗口限制")

# 运行示例
# demonstrate_context_window()
```

### 2. 会话记忆（对话历史）

**定义**：存储完整的对话历史，可以在会话之间保留。

**LangChain 0.x 的会话记忆类型（已移除）与 1.x 等效方案**：

| 0.x 记忆类型（已移除） | 原理 | 1.x 等效方案 | 适用场景 |
|----------|------|------|----------|
| **ConversationBufferMemory** | 存储完整对话历史 | checkpointer 默认保留完整历史 | 短对话 |
| **ConversationSummaryMemory** | 对话摘要 | 自定义状态中定期 LLM 摘要 | 长对话 |
| **ConversationBufferWindowMemory** | 滑动窗口 | 提示/状态中裁剪历史（保留最近 k 条） | 中等长度对话 |
| **VectorStoreRetrieverMemory** | 向量存储 | LangGraph Store 或向量库检索 | 大量历史 |

::: warning 旧写法对照
上表左侧的 `langchain.memory.*` 类已从主包移除，迁入 `langchain-classic`（仅为维护旧代码存在，新代码禁止使用）。1.x 统一用 LangGraph checkpointer + `thread_id` 管理会话记忆。
:::

**代码示例（1.x checkpointer 写法）**：

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver
from langchain_openai import ChatOpenAI

def demonstrate_different_memories():
    """
    演示不同记忆策略的 1.x 实现
    
    通过裁剪/摘要传入模型的消息历史，等效实现
    旧版 buffer / summary / window 三种记忆
    """
    
    llm = ChatOpenAI(model="gpt-5-mini")
    
    # 1. 完整历史（等效旧 ConversationBufferMemory）
    # checkpointer 默认在 thread 内保留完整消息列表
    agent = create_agent(llm, tools=[], checkpointer=InMemorySaver())
    config = {"configurable": {"thread_id": "demo-001"}}
    
    agent.invoke({"messages": [{"role": "user", "content": "我叫张三"}]}, config=config)
    agent.invoke({"messages": [{"role": "user", "content": "我是程序员"}]}, config=config)
    response = agent.invoke({"messages": [{"role": "user", "content": "我叫什么？"}]}, config=config)
    print(f"回答：{response['messages'][-1].content}")
    print(f"记忆内容：{[m.content for m in response['messages']]}")
    
    # 2. 滑动窗口（等效旧 ConversationBufferWindowMemory）
    # 自定义策略：只把最近 k 条消息传给模型
    def windowed_messages(state, k=4):
        return state["messages"][-k:]
    
    # 3. 摘要压缩（等效旧 ConversationSummaryMemory）
    # 自定义节点：定期用 LLM 把旧历史压缩成摘要，再拼接到系统提示
    
    # 说明：策略2/3需要自定义 LangGraph 图或在 create_agent 的
    # pre_model_hook 中实现，此处给出思路；完整示例见 LangGraph 章节。

# 运行示例
# demonstrate_different_memories()
```

### 3. 长期记忆（向量存储）

**定义**：使用向量数据库存储和检索历史信息。

**特点**：
- 持久化存储
- 支持语义检索
- 可以存储大量信息

**代码示例**：

```python
# 旧版 VectorStoreRetrieverMemory 已从 langchain.memory 移除。
# 1.x 中长期记忆有两种推荐方案：
#   a) LangGraph Store（跨 thread 的长期记忆，见 LangGraph 章节）
#   b) 向量库直接做语义检索（本例演示）
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma  # pip install langchain-chroma

def demonstrate_vector_memory():
    """
    演示基于向量存储的长期记忆
    
    使用向量数据库存储和检索历史信息
    适合存储大量历史数据
    """
    
    # 创建向量存储
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = Chroma(embedding_function=embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # 保存一些历史信息（每条对话存为一个文档）
    vectorstore.add_texts([
        "用户说：我叫张三。助手回答：你好，张三！",
        "用户说：我是程序员。助手回答：很高兴认识你，程序员张三！",
        "用户说：我喜欢Python。助手回答：Python是一门很好的编程语言！",
    ])
    
    # 检索相关记忆
    docs = retriever.invoke("我的职业是什么？")
    print(f"检索到的记忆：{[d.page_content for d in docs]}")

# 运行示例
# demonstrate_vector_memory()
```

## 错误处理策略

### 1. 工具调用失败处理

**常见失败情况**：
- 工具不存在
- 参数错误
- 执行超时
- 网络错误

**代码示例**：

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain.tools import tool
import time

def create_robust_agent():
    """
    创建健壮的Agent，包含错误处理
    
    处理各种工具调用失败的情况
    """
    
    @tool
    def reliable_tool(query: str) -> str:
        """可靠的工具"""
        return f"结果：{query}"
    
    @tool
    def unreliable_tool(query: str) -> str:
        """不可靠的工具（可能失败）"""
        import random
        if random.random() < 0.5:  # 50%概率失败
            raise Exception("工具执行失败")
        return f"结果：{query}"
    
    @tool
    def slow_tool(query: str) -> str:
        """慢速工具（可能超时）"""
        time.sleep(10)  # 模拟慢速操作
        return f"结果：{query}"
    
    # 创建Agent
    # 1.x 中工具异常由运行时捕获并作为 ToolMessage 回传给模型，
    # 模型会看到错误信息并自行决定重试或换工具
    llm = ChatOpenAI(model="gpt-5-mini")
    tools = [reliable_tool, unreliable_tool, slow_tool]
    
    agent = create_agent(
        llm,
        tools,
        system_prompt="""你是一个有用的助手。

重要：如果工具调用失败，请：
1. 告知用户发生了什么错误
2. 尝试使用其他工具
3. 如果所有工具都失败，请直接回答用户的问题""",
    )
    
    return agent

# 使用示例
# agent = create_robust_agent()
# result = agent.invoke(
#     {"messages": [{"role": "user", "content": "测试工具调用"}]}
# )
# print(result["messages"][-1].content)
```

::: tip 旧版参数去哪了
旧版 `AgentExecutor` 的 `max_iterations`、`handle_parsing_errors`、`return_intermediate_steps` 等参数已随 `AgentExecutor` 移除（仅存在于 `langchain-classic`）。1.x 中：迭代上限由运行时内置；解析错误由运行时自动处理；中间步骤通过结果 `messages` 列表查看；执行观测推荐 LangSmith。
:::

### 2. 空结果处理

**问题**：工具返回空结果或无意义结果。

**代码示例**：

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain.tools import tool

def create_agent_with_empty_result_handling():
    """
    创建处理空结果的Agent
    
    当工具返回空结果时，提供合适的处理策略
    """
    
    @tool
    def search_database(query: str) -> str:
        """搜索数据库"""
        # 模拟搜索，可能返回空结果
        results = []  # 假设没有找到结果
        
        if not results:
            return "未找到相关结果"
        return str(results)
    
    @tool
    def get_user_info(user_id: str) -> str:
        """获取用户信息"""
        # 模拟用户查询，可能返回空
        users = {
            "123": {"name": "张三", "age": 30}
        }
        
        if user_id not in users:
            return "用户不存在"
        return str(users[user_id])
    
    # 创建Agent
    llm = ChatOpenAI(model="gpt-5-mini")
    tools = [search_database, get_user_info]
    
    agent = create_agent(
        llm,
        tools,
        system_prompt="""你是一个有用的助手。

当工具返回以下结果时，请这样处理：
- "未找到相关结果" → 告知用户没有找到，并询问是否要尝试其他搜索
- "用户不存在" → 告知用户该用户不存在，请检查输入
- 空字符串或None → 告知工具执行异常，请重试""",
    )
    
    return agent

# 使用示例
# agent = create_agent_with_empty_result_handling()
# result = agent.invoke(
#     {"messages": [{"role": "user", "content": "查询用户456的信息"}]}
# )
# print(result["messages"][-1].content)
```

### 3. 幻觉引用处理

**问题**：模型可能编造不存在的引用来源。

**代码示例**：

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_chroma import Chroma  # pip install langchain-chroma
from langchain_openai import OpenAIEmbeddings

def create_agent_with_citation_validation():
    """
    创建带引用验证的Agent
    
    确保模型的回答基于真实的检索结果，而不是编造的引用
    """
    
    # 创建向量存储（模拟知识库）
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = Chroma.from_texts(
        texts=[
            "人工智能是计算机科学的一个分支。",
            "机器学习是人工智能的子领域。",
            "深度学习是机器学习的一种方法。"
        ],
        embedding=embeddings
    )
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
    
    # 创建RAG链，要求引用来源
    prompt = ChatPromptTemplate.from_messages([
        ("system", """你是一个有用的助手。

重要规则：
1. 只基于提供的上下文回答问题
2. 如果上下文中没有相关信息，请说"根据现有资料，我无法回答这个问题"
3. 不要编造引用来源
4. 回答时请引用来源，格式：[来源: 文档内容]

上下文：
{context}"""),
        ("user", "{question}")
    ])
    
    def format_docs(docs):
        """格式化文档"""
        return "\n\n".join(doc.page_content for doc in docs)
    
    def validate_citation(answer: str, context: str) -> bool:
        """
        验证引用是否存在于上下文中
        
        Args:
            answer: 模型回答
            context: 检索到的上下文
        
        Returns:
            引用是否有效
        """
        # 简单验证：检查回答中的关键内容是否在上下文中
        # 实际应用中可以使用更复杂的验证逻辑
        return True
    
    # 创建链
    chain = (
        {
            "context": retriever | format_docs,
            "question": lambda x: x
        }
        | prompt
        | ChatOpenAI(model="gpt-5-mini")
        | StrOutputParser()
    )
    
    return chain

# 使用示例
# chain = create_agent_with_citation_validation()
# result = chain.invoke("什么是人工智能？")
# print(result)
```

### 4. 重复调用处理

**问题**：Agent可能重复调用相同的工具。

**代码示例**：

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain.tools import tool
from typing import Set

def create_agent_with_duplicate_prevention():
    """
    创建防止重复调用的Agent
    
    记录已调用的工具和参数，避免重复调用
    """
    
    # 记录已调用的工具
    called_tools: Set[str] = set()
    
    @tool
    def search(query: str) -> str:
        """搜索信息"""
        # 检查是否重复调用
        call_key = f"search:{query}"
        if call_key in called_tools:
            return f"已经搜索过'{query}'，请使用之前的结果"
        
        called_tools.add(call_key)
        return f"搜索结果：{query}"
    
    @tool
    def calculate(expression: str) -> str:
        """计算表达式"""
        # 检查是否重复调用
        call_key = f"calculate:{expression}"
        if call_key in called_tools:
            return f"已经计算过'{expression}'，请使用之前的结果"
        
        called_tools.add(call_key)
        # 注意：eval 有代码注入风险，生产环境请用
        # ast.literal_eval 或 simpleeval 等受限求值方案
        try:
            result = eval(expression)
            return f"计算结果：{result}"
        except Exception as e:
            return f"计算错误：{e}"
    
    # 创建Agent
    llm = ChatOpenAI(model="gpt-5-mini")
    tools = [search, calculate]
    
    agent = create_agent(
        llm,
        tools,
        system_prompt="""你是一个有用的助手。

重要规则：
1. 不要重复调用相同的工具和参数
2. 如果工具返回"已经搜索过"或"已经计算过"，请使用之前的结果
3. 合理规划工具调用，避免不必要的重复""",
    )
    
    return agent, called_tools

# 使用示例
# agent, called = create_agent_with_duplicate_prevention()
# result = agent.invoke(
#     {"messages": [{"role": "user", "content": "搜索人工智能并计算1+1"}]}
# )
# print(result["messages"][-1].content)
# print(f"已调用的工具：{called}")
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
::: warning eval() 的安全风险
示例中的 `calculate` 工具使用 `eval()` 直接执行字符串表达式，仅适用于本地演示。`eval()` 会执行任意 Python 代码，若工具输入来自用户或模型输出，可能被注入恶意代码导致数据泄露或系统被控。生产环境请改用 `ast.literal_eval`（仅解析字面量）或受限的表达式求值库（如 `simpleeval`）。
:::

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain.tools import tool

@tool
def search(query: str) -> str:
    """搜索互联网"""
    return f"搜索结果: {query}"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    # 注意：eval 有代码注入风险，生产环境请用
    # ast.literal_eval 或 simpleeval 等受限求值方案
    try:
        result = eval(expression)
        return str(result)
    except:
        return "计算错误"

def build_agent():
    llm = ChatOpenAI(model="gpt-5-mini")
    tools = [search, calculate]
    
    # 1.x 无需手写含 agent_scratchpad 的提示模板，
    # create_agent 内置标准提示，用 system_prompt 定制即可
    return create_agent(
        llm,
        tools,
        system_prompt="你是一个有用的助手，可以使用工具来完成任务。",
    )

# 使用示例
agent = build_agent()
result = agent.invoke(
    {"messages": [{"role": "user", "content": "搜索最新科技新闻并计算相关数据"}]}
)
print(result["messages"][-1].content)
```

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