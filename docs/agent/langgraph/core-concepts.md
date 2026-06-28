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
# 导入LangGraph的核心组件
# langgraph.graph.StateGraph：状态图，LangGraph的核心类
# langgraph.graph.END：结束节点，表示图执行结束
from langgraph.graph import StateGraph, END

# 导入Python类型提示模块
# typing.TypedDict：定义字典的类型结构
# typing.Annotated：添加类型注解
from typing import TypedDict, Annotated

# 定义状态类型
# TypedDict：定义字典的键和值的类型
# 这里定义了状态对象必须包含的字段
class State(TypedDict):
    """
    状态定义
    
    属性：
        messages (list): 消息列表，存储对话历史
        current_step (str): 当前执行步骤
        results (dict): 结果字典，存储执行结果
    """
    messages: list  # 消息列表
    current_step: str  # 当前步骤
    results: dict  # 结果字典

# 创建状态图
# StateGraph(State)：创建状态图实例
# 参数：状态类型定义
# 返回值：StateGraph实例
graph = StateGraph(State)
```

### 2. 节点定义
```python
# 导入LangChain的OpenAI模型
from langchain_openai import ChatOpenAI

# 导入LangChain的消息类型
# HumanMessage：用户消息
# AIMessage：AI助手消息
from langchain_core.messages import HumanMessage

# 定义节点函数
# 节点是LangGraph中执行具体操作的单元
# 每个节点函数接收当前状态，返回更新后的状态

def process_input(state: State) -> State:
    """
    处理输入节点
    
    参数：
        state (State): 当前状态对象
    
    返回值：
        State: 更新后的状态对象
    
    功能：处理用户输入，准备后续处理
    """
    # 从状态中获取消息列表
    messages = state["messages"]
    
    # 处理逻辑（这里可以添加具体的处理代码）
    # ...
    
    # 返回更新后的状态
    # 返回的字典会与现有状态合并
    return {"messages": messages, "current_step": "processed"}

def generate_response(state: State) -> State:
    """
    生成响应节点
    
    参数：
        state (State): 当前状态对象
    
    返回值：
        State: 更新后的状态对象
    
    功能：调用LLM生成响应
    """
    # 创建OpenAI模型实例
    llm = ChatOpenAI(model="gpt-4o-mini")
    
    # 调用模型生成响应
    # invoke()方法：发送请求并获取响应
    response = llm.invoke(state["messages"])
    
    # 返回更新后的状态
    # 将响应添加到消息列表
    return {"messages": [response], "current_step": "completed"}

# 添加节点到图
# add_node()方法：向图中添加节点
# 参数：
#   name：节点名称（字符串）
#   action：节点函数（可调用对象）
graph.add_node("process_input", process_input)
graph.add_node("generate_response", generate_response)
```

### 3. 边定义
```python
# 添加普通边
# add_edge()方法：添加普通边（无条件转移）
# 参数：
#   start：起始节点名称
#   end：结束节点名称
# 这里表示从process_input节点转移到generate_response节点
graph.add_edge("process_input", "generate_response")

# 添加条件边
# 条件边根据条件函数的返回值选择不同的路径

def should_continue(state: State) -> str:
    """
    判断是否继续执行
    
    参数：
        state (State): 当前状态对象
    
    返回值：
        str: 决定下一步的字符串
            "continue"：继续执行
            "end"：结束执行
    """
    # 根据当前步骤决定下一步
    if state["current_step"] == "completed":
        return "end"  # 已完成，结束执行
    return "continue"  # 未完成，继续执行

# add_conditional_edges()方法：添加条件边
# 参数：
#   start：起始节点名称
#   condition：条件函数
#   path_map：路径映射字典
#       键：条件函数的返回值
#       值：目标节点名称
graph.add_conditional_edges(
    "generate_response",  # 起始节点
    should_continue,  # 条件函数
    {
        "continue": "process_input",  # 继续执行，回到process_input
        "end": END  # 结束执行，END是LangGraph的特殊标记
    }
)
```

### 4. 图编译和执行
```python
# 设置入口点
# set_entry_point()方法：设置图的入口节点
# 入口点是图执行的起始节点
graph.set_entry_point("process_input")

# 编译图
# compile()方法：编译图，使其可执行
# 返回值：编译后的图应用
app = graph.compile()

# 执行图
# invoke()方法：执行图
# 参数：初始状态字典
# 返回值：最终状态
initial_state = {
    "messages": [HumanMessage(content="你好！")],  # 初始消息
    "current_step": "start",  # 初始步骤
    "results": {}  # 初始结果
}
result = app.invoke(initial_state)
```

### 5. 流式执行
```python
# 流式执行
# stream()方法：流式执行图
# 与invoke()不同，stream()会逐步返回每个节点的执行结果
# 适用于需要实时查看执行过程的场景
for event in app.stream(initial_state):
    # event是一个字典，包含当前节点的执行结果
    # 键是节点名称，值是该节点的输出状态
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
# 导入必要的组件
from langgraph.graph import StateGraph, END  # 状态图和结束标记
from langchain_openai import ChatOpenAI  # OpenAI模型
from langchain_core.messages import HumanMessage, AIMessage  # 消息类型
from typing import TypedDict, Annotated  # 类型提示

# 定义Agent状态
class AgentState(TypedDict):
    """
    Agent状态定义
    
    属性：
        messages (list): 消息列表
        next_step (str): 下一步执行的节点
    """
    messages: list  # 消息列表
    next_step: str  # 下一步

# 定义聊天节点
def chat_node(state: AgentState) -> AgentState:
    """
    聊天节点
    
    参数：
        state (AgentState): 当前状态
    
    返回值：
        AgentState: 更新后的状态
    """
    # 创建OpenAI模型
    llm = ChatOpenAI(model="gpt-4o-mini")
    
    # 调用模型生成响应
    response = llm.invoke(state["messages"])
    
    # 返回更新后的状态
    # 将AI响应添加到消息列表
    return {
        "messages": state["messages"] + [response],  # 追加响应
        "next_step": "end"  # 设置下一步为结束
    }

# 创建图
graph = StateGraph(AgentState)

# 添加节点
graph.add_node("chat", chat_node)

# 设置边
graph.set_entry_point("chat")  # 设置入口点
graph.add_edge("chat", END)  # chat节点直接结束

# 编译和执行
app = graph.compile()

# 执行图
result = app.invoke({
    "messages": [HumanMessage(content="你好！")],  # 初始消息
    "next_step": "start"  # 初始步骤
})

# 获取最后一条消息（AI的响应）
print(result["messages"][-1].content)
```

### 3. 条件路由示例
```python
# 导入必要的组件
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

# 定义路由器状态
class RouterState(TypedDict):
    """
    路由器状态定义
    
    属性：
        input (str): 用户输入
        route (str): 路由决定（weather/news/general）
        output (str): 输出结果
    """
    input: str  # 用户输入
    route: str  # 路由决定
    output: str  # 输出结果

# 定义分类节点
def classify_input(state: RouterState) -> RouterState:
    """
    分类输入节点
    
    参数：
        state (RouterState): 当前状态
    
    返回值：
        RouterState: 更新后的状态
    
    功能：根据用户输入内容决定路由
    """
    input_text = state["input"].lower()  # 转换为小写
    
    # 根据关键词决定路由
    if "天气" in input_text:
        route = "weather"  # 天气查询
    elif "新闻" in input_text:
        route = "news"  # 新闻查询
    else:
        route = "general"  # 一般查询
    
    return {"input": state["input"], "route": route, "output": ""}

# 定义处理节点
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

# 添加节点
graph.add_node("classify", classify_input)  # 分类节点
graph.add_node("weather", handle_weather)  # 天气处理节点
graph.add_node("news", handle_news)  # 新闻处理节点
graph.add_node("general", handle_general)  # 一般处理节点

# 设置条件边
def route_function(state: RouterState) -> str:
    """
    路由函数
    
    参数：
        state (RouterState): 当前状态
    
    返回值：
        str: 路由决定
    """
    return state["route"]

# 添加条件边
# add_conditional_edges()：根据条件选择路径
graph.add_conditional_edges(
    "classify",  # 起始节点
    route_function,  # 路由函数
    {
        "weather": "weather",  # 天气路由
        "news": "news",  # 新闻路由
        "general": "general"  # 一般路由
    }
)

# 设置出口
graph.add_edge("weather", END)  # 天气处理后结束
graph.add_edge("news", END)  # 新闻处理后结束
graph.add_edge("general", END)  # 一般处理后结束

# 编译和执行
graph.set_entry_point("classify")  # 设置入口点
app = graph.compile()

# 执行图
result = app.invoke({"input": "北京天气怎么样？", "route": "", "output": ""})
print(result["output"])
```

### 4. 人机交互示例
```python
# 导入必要的组件
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver  # 内存检查点
from typing import TypedDict

# 定义人机交互状态
class HumanLoopState(TypedDict):
    """
    人机交互状态定义
    
    属性：
        messages (list): 消息列表
        human_input (str): 人工输入
        approved (bool): 是否已批准
    """
    messages: list  # 消息列表
    human_input: str  # 人工输入
    approved: bool  # 是否已批准

# 定义节点
def process_node(state: HumanLoopState) -> HumanLoopState:
    """
    处理节点
    
    参数：
        state (HumanLoopState): 当前状态
    
    返回值：
        HumanLoopState: 更新后的状态
    """
    return {
        "messages": state["messages"],
        "human_input": "",
        "approved": False
    }

def human_approval_node(state: HumanLoopState) -> HumanLoopState:
    """
    人工审批节点
    
    参数：
        state (HumanLoopState): 当前状态
    
    返回值：
        HumanLoopState: 更新后的状态
    
    功能：等待人工审批
    """
    # 这里可以集成人工审批界面
    # 例如：Web界面、命令行输入等
    print("需要人工审批")
    return {
        "messages": state["messages"],
        "human_input": "approved",  # 模拟人工输入
        "approved": True
    }

def final_node(state: HumanLoopState) -> HumanLoopState:
    """
    最终节点
    
    参数：
        state (HumanLoopState): 当前状态
    
    返回值：
        HumanLoopState: 更新后的状态
    """
    return {
        "messages": state["messages"],
        "human_input": state["human_input"],
        "approved": True
    }

# 创建图
graph = StateGraph(HumanLoopState)

# 添加节点
graph.add_node("process", process_node)
graph.add_node("human_approval", human_approval_node)
graph.add_node("final", final_node)

# 设置边
graph.set_entry_point("process")  # 入口点
graph.add_edge("process", "human_approval")  # 处理后进入人工审批
graph.add_edge("human_approval", "final")  # 审批后进入最终节点
graph.add_edge("final", END)  # 最终节点后结束

# 使用检查点
# MemorySaver()：内存检查点，用于保存和恢复状态
checkpointer = MemorySaver()

# 编译图，启用检查点和中断
# checkpointer：检查点实例
# interrupt_before：在指定节点前中断执行
app = graph.compile(checkpointer=checkpointer, interrupt_before=["human_approval"])

# 执行配置
# config：配置字典，包含thread_id用于标识执行线程
config = {"configurable": {"thread_id": "1"}}

# 执行图
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