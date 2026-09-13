# LangChain API参考手册

> **版本基线**：本文基于 LangChain 1.x / LangGraph 1.x（2025-10 GA），示例模型 gpt-5-mini，更新于 2026-09。

## 概述

本章提供LangChain框架的详细API参考，包括核心模块、类和方法的说明。

## 核心模块

### 1. langchain_core
LangChain的核心模块，提供基础抽象和接口。

#### 基础类
```python
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
```

#### 消息类
```python
from langchain_core.messages import (
    HumanMessage,      # 用户消息
    AIMessage,         # AI消息
    SystemMessage,     # 系统消息
    FunctionMessage,   # 函数消息
    ToolMessage        # 工具消息
)

# 创建消息
human_message = HumanMessage(content="你好！")
ai_message = AIMessage(content="你好！有什么可以帮助你的吗？")
system_message = SystemMessage(content="你是一个有用的助手。")
```

#### 提示模板
```python
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate

# PromptTemplate
prompt_template = PromptTemplate.from_template(
    "请用{language}回答以下问题：{question}"
)
prompt = prompt_template.format(language="中文", question="什么是Python？")

# ChatPromptTemplate
chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}。"),
    ("user", "{input}")
])
messages = chat_prompt.format_messages(role="程序员", input="请解释什么是递归")
```

#### 输出解析器
```python
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

# StrOutputParser
str_parser = StrOutputParser()

# JsonOutputParser
json_parser = JsonOutputParser()
```

### 2. langchain_openai
OpenAI模型集成模块。

#### 模型类
```python
from langchain_openai import ChatOpenAI, OpenAI, OpenAIEmbeddings

# ChatOpenAI：OpenAI聊天模型（推荐）
chat_model = ChatOpenAI(
    model="gpt-5-mini",
    temperature=0.7,
    api_key="your-api-key",
    max_tokens=1000,
    timeout=30,
    max_retries=2
)

# OpenAI：文本补全模型类（遗留接口）
# 新代码请优先使用 ChatOpenAI / ChatAnthropic 等对话模型
llm = OpenAI(
    model="gpt-5-mini",
    temperature=0.7,
    api_key="your-api-key"
)

# OpenAIEmbeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    api_key="your-api-key"
)
```

#### 模型调用
```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-5-mini")

# 同步调用
response = chat.invoke("你好！")
print(response.content)

# 流式调用
for chunk in chat.stream("你好！"):
    print(chunk.content, end="")

# 批量调用
responses = chat.batch(["你好！", "今天天气怎么样？"])
```

### 3. langchain_anthropic
Anthropic模型集成模块。

#### 模型类
```python
from langchain_anthropic import ChatAnthropic

chat = ChatAnthropic(
    model="claude-sonnet-4-5",
    temperature=0.7,
    api_key="your-api-key",
    max_tokens=1000,
    timeout=30,
    max_retries=2
)
```

### 4. langchain_community
社区贡献的集成模块。

#### 文档加载器
```python
from langchain_community.document_loaders import (
    PyPDFLoader,           # PDF加载器
    TextLoader,            # 文本加载器
    UnstructuredMarkdownLoader,  # Markdown加载器
    DirectoryLoader,       # 目录加载器
    WebBaseLoader          # 网页加载器
)

# PDF加载器
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 目录加载器
loader = DirectoryLoader("./documents", glob="**/*.pdf")
documents = loader.load()
```

#### 向量存储
向量库已拆分为独立集成包，按需安装：`langchain-chroma`、`langchain-pinecone`、`langchain-qdrant`、`langchain-weaviate`、`langchain-milvus`（FAISS 与 pgvector 仍在 `langchain-community` 中）。
```python
# Chroma：pip install langchain-chroma
from langchain_chroma import Chroma

# Pinecone：pip install langchain-pinecone
from langchain_pinecone import PineconeVectorStore

# Qdrant：pip install langchain-qdrant
from langchain_qdrant import QdrantVectorStore

# FAISS：仍在 langchain-community，pip install langchain-community faiss-cpu
from langchain_community.vectorstores import FAISS

# Chroma
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# FAISS
vectorstore = FAISS.from_documents(
    documents=chunks,
    embedding=embeddings
)
```

### 5. langchain_text_splitters
文本分割模块。

#### 文本分割器
```python
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
    TokenTextSplitter,
    MarkdownHeaderTextSplitter
)

# RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", " ", ""]
)
chunks = splitter.split_documents(documents)

# CharacterTextSplitter
splitter = CharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separator="\n"
)
chunks = splitter.split_documents(documents)
```

### 6. langchain.agents
代理模块。

#### 代理创建（1.x）
```python
# 导入1.x标准Agent构造函数
from langchain.agents import create_agent

# create_agent()：基于 LangGraph 运行时的标准 Agent 构造方式
# 取代了 0.x 的 AgentExecutor + create_openai_tools_agent 组合
agent = create_agent(llm, tools, system_prompt="你是一个有用的助手。")

# 执行：输入输出均为消息列表
result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京天气怎么样？"}]}
)
print(result["messages"][-1].content)

# langgraph.prebuilt.create_react_agent 仍然可用（旧版 LangGraph 代码兼容）
from langgraph.prebuilt import create_react_agent

react_agent = create_react_agent(llm, tools)
```

::: warning 旧写法对照（0.x）
`AgentExecutor`、`initialize_agent`、`create_openai_tools_agent`、`create_structured_chat_agent` 等已从 `langchain` 主包移除，迁入兼容包 `langchain-classic`（仅为维护旧代码存在，新代码禁止使用）：

```python
# ❌ 旧写法（仅存在于 langchain-classic）
from langchain.agents import AgentExecutor, create_openai_tools_agent
agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

# ✅ 新写法（1.x）
from langchain.agents import create_agent
agent = create_agent(llm, tools)
```

迁移指南：<https://docs.langchain.com/oss/python/migrate/langchain-v1>
:::

#### 工具定义
```python
from langchain.tools import tool, StructuredTool
from langchain_core.tools import Tool

# @tool装饰器
@tool
def search(query: str) -> str:
    """搜索互联网"""
    return f"搜索结果: {query}"
```

::: warning eval() 的安全风险
`eval()` 会执行任意 Python 代码。当工具输入来自用户或模型输出时，可能被注入恶意表达式。下方示例仅为本地演示，生产环境请改用 `ast.literal_eval` 或 `simpleeval` 等受限求值方案。
:::

```python
# StructuredTool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    return str(eval(expression))  # 仅演示用，生产环境禁止

calculator = StructuredTool.from_function(
    func=calculate,
    name="calculator",
    description="计算数学表达式"
)

# Tool
def process_data(data: str) -> str:
    """处理数据"""
    return f"处理结果: {data}"

processor = Tool(
    name="processor",
    description="处理数据",
    func=process_data
)
```

### 7. 记忆：checkpointer 与 thread_id
1.x 中记忆由 LangGraph checkpointer 统一管理，不再使用 `langchain.memory.*`。

::: warning 旧写法对照（0.x）
`ConversationBufferMemory`、`ConversationSummaryMemory`、`ConversationBufferWindowMemory`、`ConversationSummaryBufferMemory` 已从主包移除，迁入兼容包 `langchain-classic`（仅为维护旧代码存在，新代码禁止使用）。能力对应关系：

| 0.x 记忆类 | 1.x 等效方案 |
| --- | --- |
| `ConversationBufferMemory` | checkpointer 默认保留完整消息历史 |
| `ConversationBufferWindowMemory` | 自定义状态/提示中裁剪历史（保留最近 k 条） |
| `ConversationSummaryMemory` | 定期用 LLM 摘要后覆盖旧历史 |

:::

#### 现行写法
```python
# 安装：uv add langgraph
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

# InMemorySaver：内存检查点，适合开发测试
# 生产环境可换用 SqliteSaver / PostgresSaver
checkpointer = InMemorySaver()

agent = create_agent(
    ChatOpenAI(model="gpt-5-mini"),
    tools=[],
    checkpointer=checkpointer,
)

# thread_id：标识一个会话线程，同一 thread_id 自动共享消息历史
config = {"configurable": {"thread_id": "user-001"}}

response = agent.invoke(
    {"messages": [{"role": "user", "content": "你好，我叫小明"}]},
    config=config,
)
print(response["messages"][-1].content)

# 第二轮对话（同一个 thread_id，模型记得上下文）
response = agent.invoke(
    {"messages": [{"role": "user", "content": "我叫什么名字？"}]},
    config=config,
)
print(response["messages"][-1].content)  # 回答"小明"
```

### 8. 链：LCEL 常用组合
1.x 中链统一使用 LCEL 管道语法，`langchain.chains` 中的链类已全部移除。

::: warning 旧写法对照（0.x）
`LLMChain`、`ConversationChain`、`SequentialChain`、`TransformChain` 已从主包移除，迁入兼容包 `langchain-classic`（仅为维护旧代码存在，新代码禁止使用）。对应关系：

| 0.x 链类 | 1.x LCEL 等效写法 |
| --- | --- |
| `LLMChain(llm, prompt)` | `prompt \| model \| parser` |
| `ConversationChain` | LCEL + checkpointer/消息历史 |
| `SequentialChain` | 用 `\|` 直接串联多个 Runnable |
| `TransformChain` | `RunnableLambda(func)` |

:::

#### 现行写法
```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough

model = ChatOpenAI(model="gpt-5-mini")

# 基础组合：提示 -> 模型 -> 解析（等效旧 LLMChain）
chain = (
    ChatPromptTemplate.from_messages([
        ("system", "你是一个{role}。"),
        ("user", "{input}")
    ])
    | model
    | StrOutputParser()
)
result = chain.invoke({"role": "程序员", "input": "解释什么是递归"})

# 数据转换（等效旧 TransformChain）：用 RunnableLambda 包裹普通函数
normalize = RunnableLambda(lambda x: x.strip().lower())

# 顺序组合（等效旧 SequentialChain）：直接用管道串联
pipeline = normalize | chain
```

## 常用方法

### 1. 模型调用方法
```python
# 同步调用
response = model.invoke(input)

# 流式调用
for chunk in model.stream(input):
    print(chunk.content, end="")

# 批量调用
responses = model.batch(inputs)

# 异步调用
response = await model.ainvoke(input)
```

### 2. 链执行方法
```python
# 同步执行
result = chain.invoke(input)

# 流式执行
for chunk in chain.stream(input):
    print(chunk, end="")

# 批量执行
results = chain.batch(inputs)

# 异步执行
result = await chain.ainvoke(input)
```

### 3. 检索方法
```python
# 相似性搜索
results = vectorstore.similarity_search(query, k=5)

# 相似性搜索与分数
results = vectorstore.similarity_search_with_score(query, k=5)

# MMR搜索
results = vectorstore.max_marginal_relevance_search(query, k=5)
```

## 配置选项

### 1. 模型配置
```python
model = ChatOpenAI(
    model="gpt-5-mini",              # 模型名称
    temperature=0.7,                  # 温度参数
    max_tokens=1000,                  # 最大token数
    timeout=30,                       # 超时时间
    max_retries=2,                    # 最大重试次数
    api_key="your-api-key",          # API密钥
    base_url="https://api.openai.com/v1",  # API基础URL
    organization="your-org-id"        # 组织ID
)
```

### 2. 链配置
```python
chain = (
    prompt 
    | model 
    | output_parser
).with_config({
    "run_name": "my_chain",
    "tags": ["production"],
    "metadata": {"version": "1.0"}
})
```

### 3. 代理配置
```python
# create_agent 的常用配置参数
agent = create_agent(
    model,                               # 语言模型（实例或 "openai:gpt-5-mini" 字符串）
    tools,                               # 工具列表
    system_prompt="你是一个有用的助手。",  # 系统提示，定义Agent行为
    checkpointer=InMemorySaver(),        # LangGraph 检查点，提供多轮记忆
)
```

::: warning 旧写法对照（0.x）
旧版 `AgentExecutor` 的 `verbose`、`max_iterations`、`max_execution_time`、`handle_parsing_errors`、`return_intermediate_steps` 等参数已随 `AgentExecutor` 移除（仅存在于 `langchain-classic`）。1.x 对应方案：执行观测用 LangSmith / LangGraph Studio；迭代上限由运行时内置；中间步骤包含在结果 `messages` 中。

:::

## 错误处理

### 1. API错误
```python
from openai import (
    APIError,
    RateLimitError,
    APIConnectionError,
    AuthenticationError
)

try:
    response = model.invoke(input)
except AuthenticationError as e:
    print(f"认证错误: {e}")
except RateLimitError as e:
    print(f"速率限制: {e}")
except APIConnectionError as e:
    print(f"连接错误: {e}")
except APIError as e:
    print(f"API错误: {e}")
```

### 2. 解析错误
```python
from langchain_core.exceptions import OutputParserException

try:
    result = chain.invoke(input)
except OutputParserException as e:
    print(f"解析错误: {e}")
```

## 最佳实践

### 1. 模型使用
- **选择合适的模型**：根据任务选择模型
- **设置合理的参数**：调整temperature等参数
- **处理错误**：添加错误处理机制
- **监控使用量**：跟踪API调用和费用

### 2. 链设计
- **模块化设计**：将复杂链分解为简单链
- **错误处理**：添加错误处理逻辑
- **日志记录**：记录链执行过程
- **性能优化**：优化链执行性能

### 3. 代理使用
- **工具设计**：设计清晰的工具接口
- **权限控制**：限制工具使用权限
- **超时控制**：设置合理的超时时间
- **结果验证**：验证代理执行结果

## 下一步学习

- [最佳实践指南](/agent/langchain/best-practices) - 生产环境使用建议
- [LangGraph工作流](/agent/langgraph/) - 学习基于图的Agent工作流
- [RAG技术](/agent/rag/) - 掌握知识增强技术