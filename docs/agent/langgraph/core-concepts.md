# LangGraph核心概念详解

## 概述

LangGraph是LangChain团队开发的基于图的Agent工作流框架，用于构建复杂的、有状态的LLM应用。本章将深入介绍LangGraph的核心概念，包括图结构、状态管理、节点和边等。

## 核心概念

### 1. 图结构（Graph）
LangGraph基于有向图结构：
- **节点（Nodes）**：执行具体操作的单元
- **边（Edges）**：连接节点的转移关系
- **条件边（Conditional Edges）**：根据条件选择路径
- **状态（State）**：在节点间传递的数据

### 2. 状态管理（State Management）
LangGraph的状态管理特点：
- **全局状态**：所有节点共享的状态对象
- **状态更新**：节点可以读取和更新状态
- **状态持久化**：支持状态持久化和恢复
- **状态验证**：支持状态模式验证

### 3. 工作流模式
LangGraph支持多种工作流模式：
- **顺序执行**：节点按顺序执行
- **条件分支**：根据条件选择执行路径
- **并行执行**：多个节点并行执行
- **循环执行**：重复执行直到满足条件

### 4. 人机交互
LangGraph支持人机交互模式：
- **人工审批**：在关键节点等待人工审批
- **人工输入**：在需要时获取人工输入
- **中断恢复**：支持中断和恢复执行
- **检查点**：支持执行检查点

## 技术原理

### 1. 图执行引擎
LangGraph的图执行引擎：
- **拓扑排序**：确定节点执行顺序
- **状态传递**：在节点间传递状态
- **条件评估**：评估条件边的条件
- **循环检测**：检测和处理循环

### 2. 状态管理机制
状态管理的核心机制：
- **状态定义**：使用TypedDict定义状态结构
- **状态更新**：节点返回状态更新
- **状态合并**：合并多个节点的状态更新
- **状态验证**：验证状态的有效性

### 3. 检查点机制
检查点机制的核心：
- **检查点创建**：在关键节点创建检查点
- **检查点恢复**：从检查点恢复执行
- **检查点存储**：持久化存储检查点
- **检查点查询**：查询检查点信息

## 核心API

### 1. 状态图定义
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated

# 定义状态
class State(TypedDict):
    messages: list
    current_step: str
    results: dict

# 创建状态图
graph = StateGraph(State)
```

### 2. 节点定义
```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# 定义节点函数
def process_input(state: State) -> State:
    """处理输入节点"""
    messages = state["messages"]
    # 处理逻辑
    return {"messages": messages, "current_step": "processed"}

def generate_response(state: State) -> State:
    """生成响应节点"""
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    response = llm.invoke(state["messages"])
    return {"messages": [response], "current_step": "completed"}

# 添加节点到图
graph.add_node("process_input", process_input)
graph.add_node("generate_response", generate_response)
```

### 3. 边定义
```python
# 添加普通边
graph.add_edge("process_input", "generate_response")

# 添加条件边
def should_continue(state: State) -> str:
    """判断是否继续"""
    if state["current_step"] == "completed":
        return "end"
    return "continue"

graph.add_conditional_edges(
    "generate_response",
    should_continue,
    {
        "continue": "process_input",
        "end": END
    }
)
```

### 4. 图编译和执行
```python
# 设置入口点
graph.set_entry_point("process_input")

# 编译图
app = graph.compile()

# 执行图
initial_state = {
    "messages": [HumanMessage(content="你好！")],
    "current_step": "start",
    "results": {}
}
result = app.invoke(initial_state)
```

### 5. 流式执行
```python
# 流式执行
for event in app.stream(initial_state):
    print(event)
```

## 实践指南

### 1. 环境准备
```bash
# 安装LangGraph
pip install langgraph langchain-openai

# 设置环境变量
export OPENAI_API_KEY="your-openai-key"
```

### 2. 基础示例
```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from typing import TypedDict, Annotated

# 定义状态
class AgentState(TypedDict):
    messages: list
    next_step: str

# 定义节点
def chat_node(state: AgentState) -> AgentState:
    """聊天节点"""
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    response = llm.invoke(state["messages"])
    return {
        "messages": state["messages"] + [response],
        "next_step": "end"
    }

# 创建图
graph = StateGraph(AgentState)
graph.add_node("chat", chat_node)

# 设置边
graph.set_entry_point("chat")
graph.add_edge("chat", END)

# 编译和执行
app = graph.compile()
result = app.invoke({
    "messages": [HumanMessage(content="你好！")],
    "next_step": "start"
})
print(result["messages"][-1].content)
```

### 3. 条件路由示例
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

# 定义状态
class RouterState(TypedDict):
    input: str
    route: str
    output: str

# 定义节点
def classify_input(state: RouterState) -> RouterState:
    """分类输入"""
    input_text = state["input"].lower()
    if "天气" in input_text:
        route = "weather"
    elif "新闻" in input_text:
        route = "news"
    else:
        route = "general"
    return {"input": state["input"], "route": route, "output": ""}

def handle_weather(state: RouterState) -> RouterState:
    """处理天气查询"""
    return {"input": state["input"], "route": state["route"], "output": "天气查询结果"}

def handle_news(state: RouterState) -> RouterState:
    """处理新闻查询"""
    return {"input": state["input"], "route": state["route"], "output": "新闻查询结果"}

def handle_general(state: RouterState) -> RouterState:
    """处理一般查询"""
    return {"input": state["input"], "route": state["route"], "output": "一般查询结果"}

# 创建图
graph = StateGraph(RouterState)
graph.add_node("classify", classify_input)
graph.add_node("weather", handle_weather)
graph.add_node("news", handle_news)
graph.add_node("general", handle_general)

# 设置条件边
def route_function(state: RouterState) -> str:
    return state["route"]

graph.add_conditional_edges(
    "classify",
    route_function,
    {
        "weather": "weather",
        "news": "news",
        "general": "general"
    }
)

# 设置出口
graph.add_edge("weather", END)
graph.add_edge("news", END)
graph.add_edge("general", END)

# 编译和执行
graph.set_entry_point("classify")
app = graph.compile()

result = app.invoke({"input": "北京天气怎么样？", "route": "", "output": ""})
print(result["output"])
```

### 4. 人机交互示例
```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict

# 定义状态
class HumanLoopState(TypedDict):
    messages: list
    human_input: str
    approved: bool

# 定义节点
def process_node(state: HumanLoopState) -> HumanLoopState:
    """处理节点"""
    return {
        "messages": state["messages"],
        "human_input": "",
        "approved": False
    }

def human_approval_node(state: HumanLoopState) -> HumanLoopState:
    """人工审批节点"""
    # 这里可以集成人工审批界面
    print("需要人工审批")
    return {
        "messages": state["messages"],
        "human_input": "approved",
        "approved": True
    }

def final_node(state: HumanLoopState) -> HumanLoopState:
    """最终节点"""
    return {
        "messages": state["messages"],
        "human_input": state["human_input"],
        "approved": True
    }

# 创建图
graph = StateGraph(HumanLoopState)
graph.add_node("process", process_node)
graph.add_node("human_approval", human_approval_node)
graph.add_node("final", final_node)

# 设置边
graph.set_entry_point("process")
graph.add_edge("process", "human_approval")
graph.add_edge("human_approval", "final")
graph.add_edge("final", END)

# 使用检查点
checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer, interrupt_before=["human_approval"])

# 执行
config = {"configurable": {"thread_id": "1"}}
result = app.invoke({
    "messages": [],
    "human_input": "",
    "approved": False
}, config)
```

## 最佳实践

### 1. 图设计原则
- **模块化设计**：每个节点只做一件事
- **清晰的状态定义**：明确定义状态结构
- **合理的错误处理**：添加错误处理节点
- **可测试性**：设计可测试的节点

### 2. 性能优化
- **并行执行**：独立节点并行执行
- **状态优化**：减少状态传递的数据量
- **缓存机制**：缓存中间结果
- **异步执行**：使用异步节点提升性能

### 3. 调试技巧
- **可视化图**：使用可视化工具查看图结构
- **日志记录**：记录每个节点的执行日志
- **断点调试**：在关键节点设置断点
- **状态检查**：检查每个节点的状态变化

## 常见问题

### 1. 状态管理问题
- **状态不一致**：确保所有节点正确更新状态
- **状态丢失**：使用检查点持久化状态
- **状态验证**：添加状态验证逻辑

### 2. 执行流程问题
- **死循环**：设置最大执行次数
- **条件判断错误**：仔细检查条件函数
- **节点执行失败**：添加错误处理和重试机制

### 3. 性能问题
- **执行慢**：优化节点函数，减少不必要的计算
- **内存占用高**：优化状态结构，减少数据传递
- **并发限制**：使用异步执行提升并发能力

## 下一步学习

- [API参考手册](/agent/langgraph/api-reference) - 详细的API文档
- [工作流模式](/agent/langgraph/workflow-patterns) - 常见工作流模式
- [RAG技术](/agent/rag/) - 掌握知识增强技术