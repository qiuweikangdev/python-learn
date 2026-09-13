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
# 导入LangChain核心消息类
# langchain_core.messages：定义了各种消息类型
from langchain_core.messages import (
    HumanMessage,      # 用户消息：表示用户发送的消息
    AIMessage,         # AI消息：表示AI助手生成的消息
    SystemMessage,     # 系统消息：用于设置AI助手的行为和角色
    FunctionMessage,   # 函数消息：表示函数调用的结果
    ToolMessage        # 工具消息：表示工具调用的结果
)

# 创建消息实例
# HumanMessage：用户发送的消息
human_message = HumanMessage(content="你好！")

# AIMessage：AI助手生成的消息
ai_message = AIMessage(content="你好！有什么可以帮助你的吗？")

# SystemMessage：系统消息，定义AI助手的行为
system_message = SystemMessage(content="你是一个有用的助手。")
```

#### 提示模板
```python
# 导入提示模板类
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate

# PromptTemplate：简单的提示模板
# from_template()：从模板字符串创建提示模板
# 参数：模板字符串，包含{variable}占位符
prompt_template = PromptTemplate.from_template(
    "请用{language}回答以下问题：{question}"
)

# format()：格式化模板，替换占位符
# 参数：占位符变量名和值
prompt = prompt_template.format(language="中文", question="什么是Python？")

# ChatPromptTemplate：聊天提示模板
# from_messages()：从消息列表创建聊天提示模板
# 参数：消息列表，每个消息是元组格式 (角色, 内容)
chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}。"),  # 系统消息
    ("user", "{input}")  # 用户消息
])

# format_messages()：格式化聊天模板
# 返回值：消息对象列表
messages = chat_prompt.format_messages(role="程序员", input="请解释什么是递归")
```

#### 输出解析器
```python
# 导入输出解析器类
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

# StrOutputParser：字符串输出解析器
# 将模型输出转换为纯字符串
# 适用于大多数聊天场景
str_parser = StrOutputParser()

# JsonOutputParser：JSON输出解析器
# 将模型输出解析为JSON对象
# 适用于需要结构化输出的场景
json_parser = JsonOutputParser()
```

### 2. langchain_openai
OpenAI模型集成模块。

#### 模型类
```python
# 导入OpenAI模型类
from langchain_openai import ChatOpenAI, OpenAI, OpenAIEmbeddings

# ChatOpenAI：OpenAI聊天模型
# 参数说明：
#   model：模型名称，如"gpt-5-mini"、"gpt-4o"
#   temperature：控制输出随机性，0-2之间
#   api_key：OpenAI API密钥
#   max_tokens：最大输出token数
#   timeout：请求超时时间（秒）
#   max_retries：最大重试次数
chat_model = ChatOpenAI(
    model="gpt-5-mini",  # 使用gpt-5-mini模型
    temperature=0.7,  # 中等随机性
    api_key="your-api-key",  # API密钥
    max_tokens=1000,  # 最大输出1000个token
    timeout=30,  # 30秒超时
    max_retries=2  # 最多重试2次
)

# OpenAI：文本补全模型类（遗留接口）
# 注意：OpenAI 补全类属于遗留接口，新代码请优先使用
# ChatOpenAI / ChatAnthropic 等对话模型
llm = OpenAI(
    model="gpt-5-mini",  # 使用gpt-5-mini（对话模型走 ChatOpenAI 更佳）
    temperature=0.7,
    api_key="your-api-key"
)

# OpenAIEmbeddings：OpenAI嵌入模型
# 用于将文本转换为向量表示
# 参数说明：
#   model：嵌入模型名称
#   api_key：OpenAI API密钥
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",  # 使用 text-embedding-3-small 模型
    api_key="your-api-key"
)
```

#### 模型调用
```python
# 导入OpenAI聊天模型
from langchain_openai import ChatOpenAI

# 创建模型实例
chat = ChatOpenAI(model="gpt-5-mini")

# 同步调用
# invoke()：发送请求并获取完整响应
# 参数：用户输入的文本或消息列表
# 返回值：AIMessage对象
response = chat.invoke("你好！")
print(response.content)

# 流式调用
# stream()：流式获取响应
# 返回值：生成器，逐步返回响应片段
# 适用于需要实时显示的场景
for chunk in chat.stream("你好！"):
    print(chunk.content, end="")

# 批量调用
# batch()：批量发送多个请求
# 参数：输入列表
# 返回值：响应列表
# 适用于需要处理多个请求的场景
responses = chat.batch(["你好！", "今天天气怎么样？"])
```

### 3. langchain_anthropic
Anthropic模型集成模块。

#### 模型类
```python
# 导入Anthropic聊天模型
from langchain_anthropic import ChatAnthropic

# 创建Anthropic模型实例
# ChatAnthropic：Anthropic Claude模型的LangChain封装
# 参数说明：
#   model：模型名称，如"claude-sonnet-4-5"
#   temperature：控制输出随机性
#   api_key：Anthropic API密钥
#   max_tokens：最大输出token数
#   timeout：请求超时时间
#   max_retries：最大重试次数
chat = ChatAnthropic(
    model="claude-sonnet-4-5",  # 使用Claude Sonnet 4.5模型
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
# 导入社区贡献的文档加载器
from langchain_community.document_loaders import (
    PyPDFLoader,           # PDF加载器：加载PDF文件
    TextLoader,            # 文本加载器：加载纯文本文件
    UnstructuredMarkdownLoader,  # Markdown加载器：加载Markdown文件
    DirectoryLoader,       # 目录加载器：加载目录中的文件
    WebBaseLoader          # 网页加载器：加载网页内容
)

# PDF加载器
# PyPDFLoader：加载PDF文件
# load()方法：加载文档并返回Document对象列表
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 目录加载器
# DirectoryLoader：加载目录中的文件
# 参数：
#   path：目录路径
#   glob：文件匹配模式
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

# Chroma向量存储
# Chroma.from_documents()：从文档创建向量存储
# 参数：
#   documents：文档列表
#   embedding：嵌入模型
#   persist_directory：持久化目录（可选）
vectorstore = Chroma.from_documents(
    documents=chunks,  # 文档块列表
    embedding=embeddings,  # 嵌入模型
    persist_directory="./chroma_db"  # 持久化目录
)

# FAISS向量存储
# FAISS.from_documents()：从文档创建FAISS向量存储
# FAISS是内存中的向量存储，适合小规模数据
vectorstore = FAISS.from_documents(
    documents=chunks,
    embedding=embeddings
)
```

### 5. langchain_text_splitters
文本分割模块。

#### 文本分割器
```python
# 导入文本分割器
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,  # 递归字符文本分割器：最常用
    CharacterTextSplitter,  # 字符文本分割器：按指定字符分割
    TokenTextSplitter,  # Token文本分割器：按token分割
    MarkdownHeaderTextSplitter  # Markdown标题分割器：按标题分割
)

# RecursiveCharacterTextSplitter：递归字符文本分割器
# 按照递归的规则分割文本，保持语义完整性
# 参数说明：
#   chunk_size：每个文本块的最大字符数
#   chunk_overlap：相邻文本块之间的重叠字符数
#   length_function：计算长度的函数
#   separators：分隔符列表，按优先级排序
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # 每个块最多1000个字符
    chunk_overlap=200,  # 相邻块重叠200个字符
    length_function=len,  # 使用len()函数计算长度
    separators=["\n\n", "\n", " ", ""]  # 分隔符优先级
)
chunks = splitter.split_documents(documents)

# CharacterTextSplitter：字符文本分割器
# 按指定字符分割文本
splitter = CharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separator="\n"  # 按换行符分割
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
# 参数：
#   model：语言模型（模型实例或 "openai:gpt-5-mini" 形式的字符串）
#   tools：工具列表
#   system_prompt：系统提示（可选），定义Agent行为
agent = create_agent(llm, tools, system_prompt="你是一个有用的助手。")

# 执行：输入输出均为消息列表
result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京天气怎么样？"}]}
)
print(result["messages"][-1].content)

# langgraph.prebuilt.create_react_agent 仍然可用（旧版 LangGraph 代码兼容）
# 新项目推荐统一使用 langchain.agents.create_agent
from langgraph.prebuilt import create_react_agent

react_agent = create_react_agent(llm, tools)
```

::: warning 旧写法对照（0.x）
`AgentExecutor`、`initialize_agent`、`create_openai_tools_agent` 等已从 `langchain` 主包移除，迁入兼容包 `langchain-classic`（仅为维护旧代码存在，新代码禁止使用）：

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
# 导入工具相关模块
from langchain.tools import tool, StructuredTool
from langchain_core.tools import Tool

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
    return f"搜索结果: {query}"

# StructuredTool：结构化工具
# from_function()：从函数创建结构化工具
# 参数：
#   func：工具函数
#   name：工具名称
#   description：工具描述
```

::: warning eval() 的安全风险
`eval()` 会执行任意 Python 代码。当工具输入来自用户或模型输出时，攻击者可注入恶意表达式导致数据泄露或系统被控。下方示例仅为本地演示，生产环境请改用 `ast.literal_eval` 或 `simpleeval` 等受限求值方案。
:::

```python
def calculate(expression: str) -> str:
    """计算数学表达式"""
    return str(eval(expression))  # 仅演示用，生产环境禁止

calculator = StructuredTool.from_function(
    func=calculate,
    name="calculator",
    description="计算数学表达式"
)

# Tool：基础工具类
# 参数：
#   name：工具名称
#   description：工具描述
#   func：工具函数
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
`ConversationBufferMemory`、`ConversationSummaryMemory`、`ConversationBufferWindowMemory`、`ConversationSummaryBufferMemory` 等记忆类已从主包移除，迁入兼容包 `langchain-classic`（仅为维护旧代码存在，新代码禁止使用）。下表给出能力对应关系：

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
# 生产环境可换用 SqliteSaver / PostgresSaver（langgraph-checkpoint-*）
checkpointer = InMemorySaver()

# 通过 checkpointer 参数挂载记忆
agent = create_agent(
    ChatOpenAI(model="gpt-5-mini"),
    tools=[],
    checkpointer=checkpointer,
)

# thread_id：标识一个会话线程，同一 thread_id 自动共享消息历史
config = {"configurable": {"thread_id": "user-001"}}

# 第一轮对话
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

# 并行分支 + 透传：检索问答的常见结构（等效旧 RouterChain 场景可用 RunnableBranch）
from langchain_core.runnables import RunnableBranch

router = RunnableBranch(
    (lambda x: "翻译" in x["input"], chain),   # 条件分支1
    RunnablePassthrough(),                      # 默认分支
)
```

## 常用方法

### 1. 模型调用方法
```python
# 同步调用
# invoke()：发送请求并获取完整响应
# 参数：用户输入
# 返回值：模型响应
response = model.invoke(input)

# 流式调用
# stream()：流式获取响应
# 返回值：生成器，逐步返回响应片段
for chunk in model.stream(input):
    print(chunk.content, end="")

# 批量调用
# batch()：批量发送多个请求
# 参数：输入列表
# 返回值：响应列表
responses = model.batch(inputs)

# 异步调用
# ainvoke()：异步发送请求
# 参数：用户输入
# 返回值：协程对象
response = await model.ainvoke(input)
```

### 2. 链执行方法
```python
# 同步执行
# invoke()：执行链
# 参数：包含输入变量的字典
# 返回值：链的输出
result = chain.invoke(input)

# 流式执行
# stream()：流式执行链
# 返回值：生成器，逐步返回输出
for chunk in chain.stream(input):
    print(chunk, end="")

# 批量执行
# batch()：批量执行链
# 参数：输入列表
# 返回值：输出列表
results = chain.batch(inputs)

# 异步执行
# ainvoke()：异步执行链
# 参数：包含输入变量的字典
# 返回值：协程对象
result = await chain.ainvoke(input)
```

### 3. 检索方法
```python
# 相似性搜索
# similarity_search()：搜索与查询最相似的文档
# 参数：
#   query：查询文本
#   k：返回的文档数量
# 返回值：Document对象列表
results = vectorstore.similarity_search(query, k=5)

# 相似性搜索与分数
# similarity_search_with_score()：搜索并返回相似度分数
# 返回值：(Document, score)元组列表
results = vectorstore.similarity_search_with_score(query, k=5)

# MMR搜索
# max_marginal_relevance_search()：最大边际相关性搜索
# 在相似性和多样性之间取得平衡
# 参数：
#   query：查询文本
#   k：返回的文档数量
#   fetch_k：初始获取的文档数量
results = vectorstore.max_marginal_relevance_search(query, k=5)
```

## 配置选项

### 1. 模型配置
```python
# 创建模型实例
# ChatOpenAI的配置参数
model = ChatOpenAI(
    model="gpt-5-mini",             # 模型名称
    temperature=0.7,                  # 温度参数：控制输出随机性（0-2）
    max_tokens=1000,                  # 最大token数：限制输出长度
    timeout=30,                       # 超时时间：请求超时（秒）
    max_retries=2,                    # 最大重试次数：失败后重试
    api_key="your-api-key",          # API密钥：身份验证
    base_url="https://api.openai.com/v1",  # API基础URL：可替换为其他兼容API
    organization="your-org-id"        # 组织ID：可选，用于组织级API
)
```

### 2. 链配置
```python
# 链配置
# with_config()：为链添加配置
# 参数：配置字典
chain = (
    prompt 
    | model 
    | output_parser
).with_config({
    "run_name": "my_chain",  # 链名称，用于日志和监控
    "tags": ["production"],  # 标签，用于分类和过滤
    "metadata": {"version": "1.0"}  # 元数据，用于存储额外信息
})
```

### 3. 代理配置
```python
# create_agent 的常用配置参数
# 参数说明：
#   model：语言模型（实例或 "openai:gpt-5-mini" 字符串）
#   tools：工具列表
#   system_prompt：系统提示，定义Agent行为
#   checkpointer：LangGraph 检查点，提供多轮记忆
#   response_format：结构化输出（Pydantic 模型）
agent = create_agent(
    model,
    tools,
    system_prompt="你是一个有用的助手。",   # 系统提示
    checkpointer=InMemorySaver(),           # 挂载记忆
)
```

::: warning 旧写法对照（0.x）
旧版 `AgentExecutor` 的 `verbose`、`max_iterations`、`max_execution_time`、`handle_parsing_errors`、`return_intermediate_steps` 等参数已随 `AgentExecutor` 移除（仅存在于 `langchain-classic`）。1.x 的对应方案：

| 0.x AgentExecutor 参数 | 1.x 对应方案 |
| --- | --- |
| `verbose=True` | LangSmith 追踪 / LangGraph Studio |
| `max_iterations` | Agent 内置安全上限，可用 LangGraph 自定义图精细控制 |
| `max_execution_time` | 应用层超时（如 `asyncio.wait_for`） |
| `handle_parsing_errors` | 运行时已内置处理 |
| `return_intermediate_steps` | 结果的 `messages` 列表包含全部中间消息 |

:::

## 错误处理

### 1. API错误
```python
# 导入OpenAI异常类
from openai import (
    APIError,  # API错误基类
    RateLimitError,  # 速率限制错误：请求过于频繁
    APIConnectionError,  # API连接错误：网络连接问题
    AuthenticationError  # 认证错误：API密钥无效
)

# 错误处理示例
try:
    response = model.invoke(input)
except AuthenticationError as e:
    # 认证错误：检查API密钥是否正确
    print(f"认证错误: {e}")
except RateLimitError as e:
    # 速率限制：降低请求频率或升级套餐
    print(f"速率限制: {e}")
except APIConnectionError as e:
    # 连接错误：检查网络连接
    print(f"连接错误: {e}")
except APIError as e:
    # 其他API错误
    print(f"API错误: {e}")
```

### 2. 解析错误
```python
# 导入LangChain解析异常
from langchain_core.exceptions import OutputParserException

# 解析错误处理示例
try:
    result = chain.invoke(input)
except OutputParserException as e:
    # 解析错误：模型输出格式不符合预期
    # 可能原因：模型返回了无效的JSON、格式错误等
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