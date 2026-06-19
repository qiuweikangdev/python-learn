# LangChain核心概念详解

## 概述

LangChain是一个用于开发由大语言模型（LLM）驱动的应用程序的框架。本章将深入介绍LangChain的核心概念，包括模型、提示、链、记忆、索引和代理等。

## 核心概念

### 1. 模型（Models）
LangChain支持多种LLM模型：
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
链是LangChain的核心抽象：
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
代理是LangChain的高级抽象：
- **工具使用**：调用外部工具
- **推理引擎**：决定下一步行动
- **执行循环**：执行和观察结果
- **错误处理**：处理执行失败

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
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# OpenAI模型
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.7,
    api_key="your-api-key"
)

# Anthropic模型
llm = ChatAnthropic(
    model="claude-3-sonnet-20240229",
    api_key="your-api-key"
)

# 调用模型
response = llm.invoke("你好！")
print(response.content)
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
print(messages)
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
    | ChatOpenAI(model="gpt-3.5-turbo")
    | StrOutputParser()
)

# 执行链
result = chain.invoke({"input": "你好！"})
print(result)
```

### 4. 记忆管理
```python
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationChain

# 创建记忆
memory = ConversationBufferMemory(return_messages=True)

# 创建对话链
conversation = ConversationChain(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    memory=memory,
    verbose=True
)

# 对话
response = conversation.predict(input="你好！")
print(response)
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
    
    llm = ChatOpenAI(model="gpt-3.5-turbo")
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

@tool
def search(query: str) -> str:
    """搜索互联网"""
    return f"搜索结果: {query}"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return str(result)
    except:
        return "计算错误"

def create_agent():
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    tools = [search, calculate]
    
    from langchain.prompts import ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手，可以使用工具来完成任务。"),
        ("user", "{input}"),
        ("placeholder", "{agent_scratchpad}")
    ])
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    return agent_executor

# 使用示例
agent = create_agent()
result = agent.invoke({"input": "搜索最新科技新闻并计算相关数据"})
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

- [API参考手册](/agent/langchain/api-reference) - 详细的API文档
- [最佳实践指南](/agent/langchain/best-practices) - 生产环境使用建议
- [LangGraph工作流](/agent/langgraph/) - 学习基于图的Agent工作流