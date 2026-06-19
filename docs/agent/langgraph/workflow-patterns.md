# LangGraph工作流模式

## 概述

LangGraph支持多种工作流模式，用于构建复杂的、有状态的LLM应用。本章将介绍常见的工作流模式，包括顺序执行、条件分支、并行执行、循环执行等。

## 基础模式

### 1. 顺序执行模式
节点按顺序依次执行：
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class State(TypedDict):
    input: str
    step1_result: str
    step2_result: str
    output: str

# 定义节点
def step1(state: State) -> State:
    """步骤1"""
    return {"step1_result": f"步骤1处理: {state['input']}"}

def step2(state: State) -> State:
    """步骤2"""
    return {"step2_result": f"步骤2处理: {state['step1_result']}"}

def step3(state: State) -> State:
    """步骤3"""
    return {"output": f"最终结果: {state['step2_result']}"}

# 创建图
graph = StateGraph(State)
graph.add_node("step1", step1)
graph.add_node("step2", step2)
graph.add_node("step3", step3)

# 设置顺序边
graph.set_entry_point("step1")
graph.add_edge("step1", "step2")
graph.add_edge("step2", "step3")
graph.add_edge("step3", END)

# 编译和执行
app = graph.compile()
result = app.invoke({"input": "测试数据", "step1_result": "", "step2_result": "", "output": ""})
print(result["output"])
```

### 2. 条件分支模式
根据条件选择不同的执行路径：
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class State(TypedDict):
    input: str
    category: str
    output: str

# 定义节点
def classify(state: State) -> State:
    """分类节点"""
    input_text = state["input"].lower()
    if "天气" in input_text:
        category = "weather"
    elif "新闻" in input_text:
        category = "news"
    else:
        category = "general"
    return {"category": category}

def handle_weather(state: State) -> State:
    """处理天气查询"""
    return {"output": f"天气查询结果: {state['input']}"}

def handle_news(state: State) -> State:
    """处理新闻查询"""
    return {"output": f"新闻查询结果: {state['input']}"}

def handle_general(state: State) -> State:
    """处理一般查询"""
    return {"output": f"一般查询结果: {state['input']}"}

# 创建图
graph = StateGraph(State)
graph.add_node("classify", classify)
graph.add_node("weather", handle_weather)
graph.add_node("news", handle_news)
graph.add_node("general", handle_general)

# 设置条件边
def route_function(state: State) -> str:
    return state["category"]

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

result = app.invoke({"input": "北京天气怎么样？", "category": "", "output": ""})
print(result["output"])
```

### 3. 并行执行模式
多个节点并行执行：
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List
import asyncio

class State(TypedDict):
    input: str
    results: List[str]
    output: str

# 定义节点
async def task1(state: State) -> State:
    """任务1"""
    await asyncio.sleep(1)  # 模拟异步操作
    return {"results": [f"任务1结果: {state['input']}"]}

async def task2(state: State) -> State:
    """任务2"""
    await asyncio.sleep(1)  # 模拟异步操作
    return {"results": [f"任务2结果: {state['input']}"]}

async def task3(state: State) -> State:
    """任务3"""
    await asyncio.sleep(1)  # 模拟异步操作
    return {"results": [f"任务3结果: {state['input']}"]}

def merge_results(state: State) -> State:
    """合并结果"""
    return {"output": "合并结果: " + ", ".join(state["results"])}

# 创建图
graph = StateGraph(State)
graph.add_node("task1", task1)
graph.add_node("task2", task2)
graph.add_node("task3", task3)
graph.add_node("merge", merge_results)

# 设置并行边
graph.set_entry_point("task1")
graph.add_edge("task1", "task2")
graph.add_edge("task1", "task3")
graph.add_edge("task2", "merge")
graph.add_edge("task3", "merge")
graph.add_edge("merge", END)

# 编译和执行
app = graph.compile()
result = app.invoke({"input": "测试数据", "results": [], "output": ""})
print(result["output"])
```

## 高级模式

### 1. 循环执行模式
重复执行直到满足条件：
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class State(TypedDict):
    count: int
    max_iterations: int
    output: str

# 定义节点
def process(state: State) -> State:
    """处理节点"""
    count = state["count"] + 1
    return {"count": count}

def should_continue(state: State) -> str:
    """判断是否继续"""
    if state["count"] >= state["max_iterations"]:
        return "end"
    return "continue"

# 创建图
graph = StateGraph(State)
graph.add_node("process", process)

# 设置条件边
graph.add_conditional_edges(
    "process",
    should_continue,
    {
        "continue": "process",
        "end": END
    }
)

# 编译和执行
graph.set_entry_point("process")
app = graph.compile()

result = app.invoke({"count": 0, "max_iterations": 5, "output": ""})
print(f"执行次数: {result['count']}")
```

### 2. 人机交互模式
在关键节点等待人工输入：
```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict

class State(TypedDict):
    messages: list
    human_input: str
    approved: bool

# 定义节点
def process(state: State) -> State:
    """处理节点"""
    return {"messages": state["messages"], "human_input": "", "approved": False}

def human_approval(state: State) -> State:
    """人工审批节点"""
    print("需要人工审批")
    return {"messages": state["messages"], "human_input": "approved", "approved": True}

def final(state: State) -> State:
    """最终节点"""
    return {"messages": state["messages"], "human_input": state["human_input"], "approved": True}

# 创建图
graph = StateGraph(State)
graph.add_node("process", process)
graph.add_node("human_approval", human_approval)
graph.add_node("final", final)

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

### 3. 状态机模式
实现复杂的状态机逻辑：
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class State(TypedDict):
    current_state: str
    input: str
    output: str

# 定义状态转换
def state_a(state: State) -> State:
    """状态A"""
    if "触发" in state["input"]:
        return {"current_state": "B", "output": "从A转换到B"}
    return {"current_state": "A", "output": "保持在A"}

def state_b(state: State) -> State:
    """状态B"""
    if "完成" in state["input"]:
        return {"current_state": "C", "output": "从B转换到C"}
    return {"current_state": "B", "output": "保持在B"}

def state_c(state: State) -> State:
    """状态C"""
    return {"current_state": "C", "output": "最终状态C"}

# 创建图
graph = StateGraph(State)
graph.add_node("A", state_a)
graph.add_node("B", state_b)
graph.add_node("C", state_c)

# 设置条件边
def route_function(state: State) -> str:
    return state["current_state"]

graph.add_conditional_edges(
    "A",
    route_function,
    {
        "A": "A",
        "B": "B"
    }
)

graph.add_conditional_edges(
    "B",
    route_function,
    {
        "B": "B",
        "C": "C"
    }
)

graph.add_edge("C", END)

# 编译和执行
graph.set_entry_point("A")
app = graph.compile()

result = app.invoke({"current_state": "A", "input": "触发", "output": ""})
print(result["output"])
```

## 实际应用模式

### 1. RAG工作流模式
实现检索增强生成工作流：
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class State(TypedDict):
    query: str
    documents: List[str]
    context: str
    answer: str

# 定义节点
def retrieve(state: State) -> State:
    """检索节点"""
    # 这里应该是实际的检索逻辑
    documents = [f"文档1: {state['query']}", f"文档2: {state['query']}"]
    return {"documents": documents}

def rerank(state: State) -> State:
    """重排序节点"""
    # 这里应该是实际的重排序逻辑
    context = "\n".join(state["documents"])
    return {"context": context}

def generate(state: State) -> State:
    """生成节点"""
    # 这里应该是实际的生成逻辑
    answer = f"基于上下文的回答: {state['context']}"
    return {"answer": answer}

# 创建图
graph = StateGraph(State)
graph.add_node("retrieve", retrieve)
graph.add_node("rerank", rerank)
graph.add_node("generate", generate)

# 设置边
graph.set_entry_point("retrieve")
graph.add_edge("retrieve", "rerank")
graph.add_edge("rerank", "generate")
graph.add_edge("generate", END)

# 编译和执行
app = graph.compile()
result = app.invoke({"query": "什么是人工智能？", "documents": [], "context": "", "answer": ""})
print(result["answer"])
```

### 2. 多Agent协作模式
实现多Agent协作工作流：
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class State(TypedDict):
    task: str
    research_result: str
    analysis_result: str
    final_report: str

# 定义节点
def researcher(state: State) -> State:
    """研究员Agent"""
    research_result = f"研究结果: {state['task']}"
    return {"research_result": research_result}

def analyst(state: State) -> State:
    """分析师Agent"""
    analysis_result = f"分析结果: {state['research_result']}"
    return {"analysis_result": analysis_result}

def writer(state: State) -> State:
    """作家Agent"""
    final_report = f"最终报告: {state['analysis_result']}"
    return {"final_report": final_report}

# 创建图
graph = StateGraph(State)
graph.add_node("researcher", researcher)
graph.add_node("analyst", analyst)
graph.add_node("writer", writer)

# 设置边
graph.set_entry_point("researcher")
graph.add_edge("researcher", "analyst")
graph.add_edge("analyst", "writer")
graph.add_edge("writer", END)

# 编译和执行
app = graph.compile()
result = app.invoke({
    "task": "人工智能在医疗领域的应用",
    "research_result": "",
    "analysis_result": "",
    "final_report": ""
})
print(result["final_report"])
```

### 3. 对话管理模式
实现复杂的对话管理：
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class State(TypedDict):
    messages: List[dict]
    intent: str
    context: dict
    response: str

# 定义节点
def understand_intent(state: State) -> State:
    """理解意图"""
    last_message = state["messages"][-1]["content"]
    if "天气" in last_message:
        intent = "weather"
    elif "新闻" in last_message:
        intent = "news"
    else:
        intent = "chat"
    return {"intent": intent}

def gather_context(state: State) -> State:
    """收集上下文"""
    context = {"intent": state["intent"], "history": state["messages"]}
    return {"context": context}

def generate_response(state: State) -> State:
    """生成响应"""
    response = f"基于意图{state['intent']}的响应"
    return {"response": response}

# 创建图
graph = StateGraph(State)
graph.add_node("understand", understand_intent)
graph.add_node("gather", gather_context)
graph.add_node("generate", generate_response)

# 设置边
graph.set_entry_point("understand")
graph.add_edge("understand", "gather")
graph.add_edge("gather", "generate")
graph.add_edge("generate", END)

# 编译和执行
app = graph.compile()
result = app.invoke({
    "messages": [{"role": "user", "content": "北京天气怎么样？"}],
    "intent": "",
    "context": {},
    "response": ""
})
print(result["response"])
```

## 最佳实践

### 1. 模式选择
- **顺序执行**：简单的线性流程
- **条件分支**：需要根据条件选择路径
- **并行执行**：需要同时处理多个任务
- **循环执行**：需要重复执行直到满足条件

### 2. 状态设计
- **最小化状态**：只包含必要的状态信息
- **清晰的类型**：使用TypedDict定义状态
- **合理的更新**：每个节点只更新相关的状态
- **错误处理**：在状态中包含错误信息

### 3. 性能优化
- **并行执行**：独立任务并行执行
- **缓存结果**：缓存中间结果
- **异步处理**：使用异步节点提升性能
- **资源管理**：合理管理资源

## 常见问题

### 1. 执行流程问题
- **死循环**：设置最大迭代次数
- **条件判断错误**：仔细检查条件函数
- **节点执行失败**：添加错误处理

### 2. 状态管理问题
- **状态不一致**：确保所有节点正确更新状态
- **状态丢失**：使用检查点持久化状态
- **状态验证**：添加状态验证逻辑

### 3. 性能问题
- **执行慢**：优化节点函数
- **内存占用高**：减少状态大小
- **并发限制**：使用异步执行

## 下一步学习

- [RAG技术](/agent/rag/) - 掌握知识增强技术
- [Agent框架](/agent/agent-frameworks/) - 了解各种Agent框架
- [多Agent系统](/agent/multi-agent/) - 学习多Agent协作