# LangChain框架

## 概述

LangChain是最流行的LLM应用开发框架，提供了丰富的组件和工具，帮助开发者快速构建基于大语言模型的应用程序。本章将深入介绍LangChain的核心概念、架构设计和实践方法。

## 核心概念

### 1. 模型（Models）
LangChain支持多种LLM模型，包括：
- **OpenAI**：GPT-3.5、GPT-4等
- **Anthropic**：Claude系列模型
- **Google**：Gemini系列模型
- **开源模型**：Llama、Mistral等

### 2. 提示（Prompts）
提示管理是LangChain的核心功能：
- **PromptTemplate**：可重用的提示模板
- **ChatPromptTemplate**：聊天提示模板
- **FewShotPromptTemplate**：少样本提示模板
- **提示组合**：多个提示的组合使用

### 3. 链（Chains）
链是LangChain的核心抽象，用于组合多个组件：
- **LLMChain**：基础LLM链
- **SequentialChain**：顺序执行链
- **RouterChain**：条件路由链
- **自定义链**：根据需求自定义链

### 4. 记忆（Memory）
记忆组件用于管理对话历史：
- **ConversationBufferMemory**：完整对话历史
- **ConversationSummaryMemory**：对话摘要
- **ConversationBufferWindowMemory**：滑动窗口记忆
- **向量存储记忆**：基于向量数据库的记忆

### 5. 索引（Indexes）
索引组件用于文档检索：
- **文档加载器**：加载各种格式的文档
- **文本分割器**：将文档分割成小块
- **向量存储**：存储文档向量
- **检索器**：检索相关文档

### 6. 代理（Agents）
代理是LangChain的高级抽象，能够动态决定行动：
- **工具使用**：调用外部工具
- **推理引擎**：决定下一步行动
- **执行循环**：执行和观察结果
- **错误处理**：处理执行失败

## 技术方案对比

### LangChain vs 其他LLM框架

| 对比维度 | LangChain | LlamaIndex | Haystack | 自研框架 |
|----------|-----------|------------|----------|----------|
| **定位** | 通用LLM应用框架 | 数据索引和检索 | NLP管道框架 | 完全自定义 |
| **学习曲线** | 中等 | 较低 | 中等 | 高 |
| **组件丰富度** | 非常丰富 | 丰富 | 中等 | 需自己实现 |
| **社区活跃度** | 非常高 | 高 | 中等 | N/A |
| **适用场景** | 通用场景 | RAG场景 | NLP任务 | 特殊需求 |
| **扩展性** | 高 | 中等 | 中等 | 最高 |

### 如何选择框架？

**场景一：快速构建RAG应用**
- 推荐：LlamaIndex
- 原因：专注于数据索引，API更简洁

**场景二：复杂LLM应用（Agent、多步推理）**
- 推荐：LangChain
- 原因：组件丰富，支持复杂工作流

**场景三：NLP管道任务**
- 推荐：Haystack
- 原因：专注于NLP任务，性能好

**场景四：特殊需求**
- 推荐：自研框架
- 原因：完全可控，可深度定制

### LangChain组件对比

| 组件 | 作用 | 常用实现 | 选择建议 |
|------|------|----------|----------|
| **Models** | 调用LLM | OpenAI、Anthropic | 根据需求和成本选择 |
| **Prompts** | 管理提示 | PromptTemplate | 使用模板提高复用性 |
| **Chains** | 组合组件 | LLMChain、SequentialChain | 根据复杂度选择 |
| **Memory** | 管理记忆 | ConversationBufferMemory | 根据对话长度选择 |
| **Indexes** | 文档检索 | VectorStoreRetriever | 根据数据量选择 |
| **Agents** | 动态决策 | OpenAIFunctionsAgent | 需要工具调用时使用 |

## 设计原理与目的

### 为什么需要LangChain？

**直接使用LLM API的问题：**

```
问题1：代码重复
每次调用都需要：
- 构建消息列表
- 处理API响应
- 管理对话历史
- 处理错误

问题2：组件难以复用
- 不同项目的提示无法共享
- 工具调用逻辑需要重写
- 记忆管理需要自己实现

问题3：工作流复杂
- 多步推理需要自己编排
- 条件分支需要自己实现
- 错误恢复需要自己处理
```

**LangChain的解决方案：**

```
解决方案1：抽象组件
- 模型：统一的模型接口
- 提示：可复用的提示模板
- 链：可组合的工作流

解决方案2：标准化接口
- 所有组件遵循相同接口
- 可以轻松替换组件
- 便于测试和调试

解决方案3：内置工作流
- 链：简单的顺序执行
- Agent：动态决策
- 检索：RAG工作流
```

### 核心设计思想

**1. 组件化设计**

```
类比：乐高积木

每个组件都是一个"积木"：
- 模型积木：调用LLM
- 提示积木：构建提示
- 记忆积木：管理历史
- 工具积木：调用外部工具

组合方式：
- 链：按顺序拼接
- Agent：动态选择拼接
```

**2. 接口统一**

```python
# 所有模型都遵循相同接口
class BaseLLM:
    def invoke(input) -> output
    def batch(inputs) -> outputs
    def stream(input) -> iterator

# OpenAI实现
class OpenAI(BaseLLM):
    def invoke(input):
        return openai_api_call(input)

# Anthropic实现
class Anthropic(BaseLLM):
    def invoke(input):
        return anthropic_api_call(input)

# 使用时可以无缝切换
llm = OpenAI()  # 或 Anthropic()
result = llm.invoke("你好")
```

**3. 管道模式**

```
LangChain的执行流程：

输入 → 组件1 → 组件2 → 组件3 → 输出

示例：
用户问题 
→ 提示模板（构建完整提示）
→ LLM模型（生成回答）
→ 输出解析器（格式化输出）
→ 最终结果
```

### 为什么链(Chain)设计有效？

**问题：** 复杂任务需要多个步骤

**解决方案：** 将任务分解为多个链

```
示例：文档问答

步骤1：加载文档
步骤2：分割文档
步骤3：生成嵌入
步骤4：存储向量
步骤5：检索相关文档
步骤6：构建提示
步骤7：生成回答

LangChain实现：
chain = load_docs | split_docs | embed | store | retrieve | prompt | llm

优势：
- 每个步骤可独立测试
- 步骤可以复用
- 便于调试和优化
```

### 为什么Agent设计有效？

**问题：** 有些任务需要动态决策

**解决方案：** 让LLM决定下一步行动

```
示例：回答复杂问题

传统方式：
用户 → 固定流程 → 回答
问题：无法处理意外情况

Agent方式：
用户 → LLM决策 → 行动 → 观察 → LLM决策 → ...
优势：可以动态调整策略

Agent执行循环：
1. 思考（Thought）：分析当前情况
2. 行动（Action）：选择并执行工具
3. 观察（Observation）：观察结果
4. 重复，直到完成任务
```

## 应用场景详解

### 场景一：聊天机器人

**需求：** 构建一个有记忆的聊天机器人

**实现：**
```python
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. 创建模型
llm = ChatOpenAI(model="gpt-4o-mini")

# 2. 创建记忆
memory = ConversationBufferMemory(
    return_messages=True,
    memory_key="history"
)

# 3. 创建提示模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个友好的AI助手。请用简洁明了的语言回答问题。"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])

# 4. 创建对话链
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    prompt=prompt,
    verbose=True
)

# 5. 使用
response = conversation.invoke({"input": "你好，我叫张三"})
print(response["response"])

response = conversation.invoke({"input": "我叫什么名字？"})
print(response["response"])  # 能记住之前的信息
```

**设计要点：**
- 使用ConversationBufferMemory保存完整对话历史
- 使用MessagesPlaceholder插入历史消息
- 设置verbose=True便于调试

### 场景二：文档问答系统

**需求：** 基于文档内容回答问题

**实现：**
```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain.chains import RetrievalQA
from langchain.prompts import ChatPromptTemplate

# 1. 加载文档
loader = TextLoader("document.txt", encoding="utf-8")
documents = loader.load()

# 2. 分割文档
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
chunks = text_splitter.split_documents(documents)

# 3. 创建向量数据库
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(chunks, embeddings)

# 4. 创建提示模板
prompt_template = """基于以下文档内容回答问题。如果文档中没有相关信息，请说"我不知道"。

文档内容：
{context}

问题：{question}

回答："""

prompt = ChatPromptTemplate.from_template(prompt_template)

# 5. 创建问答链
llm = ChatOpenAI(model="gpt-4o-mini")
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    chain_type_kwargs={"prompt": prompt}
)

# 6. 使用
answer = qa_chain.invoke({"query": "文档的主要内容是什么？"})
print(answer["result"])
```

**设计要点：**
- 使用TextLoader加载文档
- 使用RecursiveCharacterTextSplitter分割文档
- 使用Chroma创建向量数据库
- 使用RetrievalQA链组合检索和问答

### 场景三：多工具Agent

**需求：** 构建一个能使用多个工具的Agent

**实现：**
```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. 定义工具
@tool
def search_web(query: str) -> str:
    """搜索互联网信息"""
    # 这里应该是实际的搜索API
    return f"搜索结果：关于'{query}'的最新信息..."

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return f"计算结果：{result}"
    except Exception as e:
        return f"计算错误：{e}"

@tool
def get_weather(city: str) -> str:
    """获取天气信息"""
    # 这里应该是实际的天气API
    return f"{city}今天天气晴朗，温度25度"

# 2. 创建工具列表
tools = [search_web, calculate, get_weather]

# 3. 创建提示模板
prompt = ChatPromptTemplate.from_messages([
    ("system", """你是一个有用的AI助手。你可以使用以下工具：
- search_web: 搜索互联网信息
- calculate: 计算数学表达式
- get_weather: 获取天气信息

请根据用户的问题选择合适的工具。"""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

# 4. 创建Agent
llm = ChatOpenAI(model="gpt-4o-mini")
agent = create_openai_functions_agent(llm, tools, prompt)

# 5. 创建Agent执行器
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True
)

# 6. 使用
response = agent_executor.invoke({
    "input": "北京今天天气怎么样？顺便帮我算一下123+456"
})
print(response["output"])
```

**设计要点：**
- 使用@tool装饰器定义工具
- 使用create_openai_functions_agent创建Agent
- 使用AgentExecutor执行Agent
- 工具描述要清晰明确

### 场景四：文档总结链

**需求：** 自动总结长文档

**实现：**
```python
from langchain_openai import ChatOpenAI
from langchain.chains.summarize import load_summarize_chain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader

# 1. 加载文档
loader = TextLoader("long_document.txt", encoding="utf-8")
documents = loader.load()

# 2. 分割文档
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2000,
    chunk_overlap=200
)
chunks = text_splitter.split_documents(documents)

# 3. 创建总结链
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# map_reduce模式：先分别总结每个块，再合并总结
chain = load_summarize_chain(
    llm,
    chain_type="map_reduce",
    verbose=True
)

# 4. 使用
summary = chain.invoke(chunks)
print(summary["output_text"])
```

**设计要点：**
- 使用load_summarize_chain加载总结链
- map_reduce模式适合长文档
- 设置temperature=0保证总结的准确性

### 场景五：结构化输出

**需求：** 从文本中提取结构化信息

**实现：**
```python
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List

# 1. 定义输出格式
class PersonInfo(BaseModel):
    name: str = Field(description="姓名")
    age: int = Field(description="年龄")
    occupation: str = Field(description="职业")
    skills: List[str] = Field(description="技能列表")

# 2. 创建解析器
parser = PydanticOutputParser(pydantic_object=PersonInfo)

# 3. 创建提示模板
prompt = ChatPromptTemplate.from_messages([
    ("system", """从以下文本中提取人物信息。
{format_instructions}"""),
    ("human", "{text}")
])

# 4. 创建链
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
chain = prompt | llm | parser

# 5. 使用
text = "张三，28岁，是一名软件工程师，擅长Python、Java和机器学习。"
result = chain.invoke({
    "text": text,
    "format_instructions": parser.get_format_instructions()
})

print(f"姓名：{result.name}")
print(f"年龄：{result.age}")
print(f"职业：{result.occupation}")
print(f"技能：{result.skills}")
```

**设计要点：**
- 使用Pydantic定义输出格式
- 使用PydanticOutputParser解析输出
- 设置temperature=0保证输出稳定性

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
    model="gpt-4o-mini",
    temperature=0.7,
    api_key="your-api-key"
)

# Anthropic模型
llm = ChatAnthropic(
    model="claude-3-sonnet-20240229",
    api_key="your-api-key"
)
```

### 2. 提示模板
```python
from langchain.prompts import ChatPromptTemplate

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
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

# 创建链
chain = (
    ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手。"),
        ("user", "{input}")
    ])
    | ChatOpenAI(model="gpt-4o-mini")
    | StrOutputParser()
)

# 执行链
result = chain.invoke({"input": "你好！"})
```

### 4. 代理构建
```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool

# 定义工具
@tool
def search(query: str) -> str:
    """搜索互联网"""
    return f"搜索结果: {query}"

# 创建代理
llm = ChatOpenAI(model="gpt-4o-mini")
tools = [search]
agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

# 执行代理
result = agent_executor.invoke({"input": "搜索最新科技新闻"})
```

### 5. 记忆管理
```python
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationChain

# 创建记忆
memory = ConversationBufferMemory(return_messages=True)

# 创建对话链
conversation = ConversationChain(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    memory=memory,
    verbose=True
)

# 对话
response = conversation.predict(input="你好！")
```

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
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

# 创建简单链
def simple_chain():
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手。"),
        ("user", "{input}")
    ])
    
    llm = ChatOpenAI(model="gpt-4o-mini")
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
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
import requests

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

def create_agent():
    llm = ChatOpenAI(model="gpt-4o-mini")
    tools = [get_weather, search_web]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手，可以使用工具来获取信息。"),
        ("user", "{input}"),
        ("placeholder", "{agent_scratchpad}")
    ])
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    return agent_executor

# 使用示例
agent = create_agent()
result = agent.invoke({"input": "北京今天天气怎么样？"})
print(result)
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
- **verbose模式**：开启verbose模式查看执行过程
- **回调函数**：使用回调函数监控执行
- **日志分析**：分析日志定位问题

## 下一步学习

- [核心概念详解](/agent/langchain/core-concepts) - 深入理解LangChain核心概念
- [API参考手册](/agent/langchain/api-reference) - 详细的API文档
- [最佳实践指南](/agent/langchain/best-practices) - 生产环境使用建议