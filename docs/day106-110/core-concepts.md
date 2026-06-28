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
    model="gpt-4o-mini",
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
    | ChatOpenAI(model="gpt-4o-mini")
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
    llm=ChatOpenAI(model="gpt-4o-mini"),
    memory=memory,
    verbose=True
)

# 对话
response = conversation.predict(input="你好！")
print(response)
```

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
from langchain.prompts import ChatPromptTemplate

def demonstrate_context_window():
    """
    演示上下文窗口的概念
    
    上下文窗口限制了模型一次能处理的token数量
    超出限制的消息会被截断或丢失
    """
    
    # 创建模型（指定上下文窗口大小）
    llm = ChatOpenAI(
        model="gpt-4o-mini",
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

**LangChain提供的会话记忆类型**：

| 记忆类型 | 原理 | 优点 | 缺点 | 适用场景 |
|----------|------|------|------|----------|
| **ConversationBufferMemory** | 存储完整对话历史 | 简单、完整 | token消耗大 | 短对话 |
| **ConversationSummaryMemory** | 对话摘要 | 节省token | 可能丢失细节 | 长对话 |
| **ConversationBufferWindowMemory** | 滑动窗口 | 平衡 | 可能丢失早期信息 | 中等长度对话 |
| **VectorStoreRetrieverMemory** | 向量存储 | 可检索 | 复杂度高 | 大量历史 |

**代码示例**：

```python
from langchain.memory import (
    ConversationBufferMemory,
    ConversationSummaryMemory,
    ConversationBufferWindowMemory
)
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationChain

def demonstrate_different_memories():
    """
    演示不同类型的记忆
    
    比较不同记忆类型的特点和适用场景
    """
    
    llm = ChatOpenAI(model="gpt-4o-mini")
    
    # 1. ConversationBufferMemory：存储完整对话历史
    print("=== ConversationBufferMemory ===")
    buffer_memory = ConversationBufferMemory(return_messages=True)
    buffer_conversation = ConversationChain(
        llm=llm,
        memory=buffer_memory,
        verbose=False
    )
    
    # 进行多轮对话
    buffer_conversation.predict(input="我叫张三")
    buffer_conversation.predict(input="我是程序员")
    response = buffer_conversation.predict(input="我叫什么？")
    print(f"回答：{response}")
    print(f"记忆内容：{buffer_memory.buffer}")
    
    # 2. ConversationSummaryMemory：对话摘要
    print("\n=== ConversationSummaryMemory ===")
    summary_memory = ConversationSummaryMemory(llm=llm, return_messages=True)
    summary_conversation = ConversationChain(
        llm=llm,
        memory=summary_memory,
        verbose=False
    )
    
    # 进行多轮对话
    summary_conversation.predict(input="我叫张三")
    summary_conversation.predict(input="我是程序员")
    response = summary_conversation.predict(input="我叫什么？")
    print(f"回答：{response}")
    print(f"记忆摘要：{summary_memory.buffer}")
    
    # 3. ConversationBufferWindowMemory：滑动窗口
    print("\n=== ConversationBufferWindowMemory ===")
    window_memory = ConversationBufferWindowMemory(k=2, return_messages=True)  # 只保留最近2轮
    window_conversation = ConversationChain(
        llm=llm,
        memory=window_memory,
        verbose=False
    )
    
    # 进行多轮对话
    window_conversation.predict(input="第一轮对话")
    window_conversation.predict(input="第二轮对话")
    window_conversation.predict(input="第三轮对话")
    response = window_conversation.predict(input="我们讨论了几轮？")
    print(f"回答：{response}")
    print(f"记忆内容（只保留最近2轮）：{window_memory.buffer}")

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
from langchain.memory import VectorStoreRetrieverMemory
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import ConversationChain

def demonstrate_vector_memory():
    """
    演示向量存储记忆
    
    使用向量数据库存储和检索历史信息
    适合存储大量历史数据
    """
    
    # 创建向量存储
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma(embedding_function=embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # 创建向量记忆
    memory = VectorStoreRetrieverMemory(
        retriever=retriever,
        memory_key="history"
    )
    
    # 保存一些历史信息
    memory.save_context(
        {"input": "我叫张三"},
        {"output": "你好，张三！"}
    )
    memory.save_context(
        {"input": "我是程序员"},
        {"output": "很高兴认识你，程序员张三！"}
    )
    memory.save_context(
        {"input": "我喜欢Python"},
        {"output": "Python是一门很好的编程语言！"}
    )
    
    # 检索相关记忆
    result = memory.load_memory_variables({"prompt": "我的职业是什么？"})
    print(f"检索到的记忆：{result}")

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
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate
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
    llm = ChatOpenAI(model="gpt-4o-mini")
    tools = [reliable_tool, unreliable_tool, slow_tool]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """你是一个有用的助手。

重要：如果工具调用失败，请：
1. 告知用户发生了什么错误
2. 尝试使用其他工具
3. 如果所有工具都失败，请直接回答用户的问题"""),
        ("user", "{input}"),
        ("placeholder", "{agent_scratchpad}")
    ])
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    
    # 创建Agent执行器，配置错误处理
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iterations=5,  # 最大迭代次数
        handle_parsing_errors=True,  # 处理解析错误
        return_intermediate_steps=True  # 返回中间步骤
    )
    
    return agent_executor

# 使用示例
# agent = create_robust_agent()
# result = agent.invoke({"input": "测试工具调用"})
# print(result)
```

### 2. 空结果处理

**问题**：工具返回空结果或无意义结果。

**代码示例**：

```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate

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
    llm = ChatOpenAI(model="gpt-4o-mini")
    tools = [search_database, get_user_info]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """你是一个有用的助手。

当工具返回以下结果时，请这样处理：
- "未找到相关结果" → 告知用户没有找到，并询问是否要尝试其他搜索
- "用户不存在" → 告知用户该用户不存在，请检查输入
- 空字符串或None → 告知工具执行异常，请重试"""),
        ("user", "{input}"),
        ("placeholder", "{agent_scratchpad}")
    ])
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    return agent_executor

# 使用示例
# agent = create_agent_with_empty_result_handling()
# result = agent.invoke({"input": "查询用户456的信息"})
# print(result)
```

### 3. 幻觉引用处理

**问题**：模型可能编造不存在的引用来源。

**代码示例**：

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

def create_agent_with_citation_validation():
    """
    创建带引用验证的Agent
    
    确保模型的回答基于真实的检索结果，而不是编造的引用
    """
    
    # 创建向量存储（模拟知识库）
    embeddings = OpenAIEmbeddings()
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
        | ChatOpenAI(model="gpt-4o-mini")
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
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate
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
        try:
            result = eval(expression)
            return f"计算结果：{result}"
        except Exception as e:
            return f"计算错误：{e}"
    
    # 创建Agent
    llm = ChatOpenAI(model="gpt-4o-mini")
    tools = [search, calculate]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """你是一个有用的助手。

重要规则：
1. 不要重复调用相同的工具和参数
2. 如果工具返回"已经搜索过"或"已经计算过"，请使用之前的结果
3. 合理规划工具调用，避免不必要的重复"""),
        ("user", "{input}"),
        ("placeholder", "{agent_scratchpad}")
    ])
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iterations=5
    )
    
    return agent_executor, called_tools

# 使用示例
# agent, called = create_agent_with_duplicate_prevention()
# result = agent.invoke({"input": "搜索人工智能并计算1+1"})
# print(result)
# print(f"已调用的工具：{called}")
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
    llm = ChatOpenAI(model="gpt-4o-mini")
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