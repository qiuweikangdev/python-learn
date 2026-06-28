# LangChain API参考手册

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

# ChatOpenAI
chat_model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
    api_key="your-api-key",
    max_tokens=1000,
    timeout=30,
    max_retries=2
)

# OpenAI (旧版)
llm = OpenAI(
    model="gpt-4o-mini-instruct",
    temperature=0.7,
    api_key="your-api-key"
)

# OpenAIEmbeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002",
    api_key="your-api-key"
)
```

#### 模型调用
```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-4o-mini")

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
    model="claude-3-sonnet-20240229",
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
```python
from langchain_community.vectorstores import (
    Chroma,        # Chroma向量存储
    FAISS,         # FAISS向量存储
    Pinecone,      # Pinecone向量存储
    Weaviate,      # Weaviate向量存储
    Milvus         # Milvus向量存储
)

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

#### 代理创建
```python
from langchain.agents import (
    AgentExecutor,
    create_openai_tools_agent,
    create_react_agent,
    create_structured_chat_agent
)

# OpenAI Tools Agent
agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

# ReAct Agent
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)
```

#### 工具定义
```python
from langchain.tools import tool, StructuredTool
from langchain_core.tools import Tool

# @tool装饰器
@tool
def search(query: str) -> str:
    """搜索互联网"""
    return f"搜索结果: {query}"

# StructuredTool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    return str(eval(expression))

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

### 7. langchain.memory
记忆模块。

#### 记忆类型
```python
from langchain.memory import (
    ConversationBufferMemory,
    ConversationSummaryMemory,
    ConversationBufferWindowMemory,
    ConversationSummaryBufferMemory
)

# ConversationBufferMemory
memory = ConversationBufferMemory(
    return_messages=True,
    memory_key="history"
)

# ConversationSummaryMemory
memory = ConversationSummaryMemory(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    return_messages=True,
    memory_key="history"
)

# ConversationBufferWindowMemory
memory = ConversationBufferWindowMemory(
    k=10,
    return_messages=True,
    memory_key="history"
)
```

### 8. langchain.chains
链模块。

#### 链类型
```python
from langchain.chains import (
    LLMChain,
    ConversationChain,
    SequentialChain,
    TransformChain
)

# LLMChain
chain = LLMChain(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    prompt=prompt,
    verbose=True
)

# ConversationChain
conversation = ConversationChain(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    memory=ConversationBufferMemory(),
    verbose=True
)

# SequentialChain
chain = SequentialChain(
    chains=[chain1, chain2],
    input_variables=["input"],
    output_variables=["output"],
    verbose=True
)
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
    model="gpt-4o-mini",           # 模型名称
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
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,                    # 详细输出
    max_iterations=10,               # 最大迭代次数
    max_execution_time=60,           # 最大执行时间
    handle_parsing_errors=True,      # 处理解析错误
    return_intermediate_steps=True   # 返回中间步骤
)
```

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