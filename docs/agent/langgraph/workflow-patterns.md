# LangGraph工作流模式

## 概述

LangGraph支持多种工作流模式，用于构建复杂的、有状态的LLM应用。本章将介绍常见的工作流模式，包括顺序执行、条件分支、并行执行、循环执行等。

## 基础模式

### 1. 顺序执行模式
节点按顺序依次执行：
```python
# 导入LangGraph核心组件
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 定义状态类型
class State(TypedDict):
    """
    状态定义
    
    属性：
        input (str): 输入数据
        step1_result (str): 步骤1的处理结果
        step2_result (str): 步骤2的处理结果
        output (str): 最终输出
    """
    input: str
    step1_result: str
    step2_result: str
    output: str

# 定义节点函数
def step1(state: State) -> State:
    """
    步骤1节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    # 处理输入数据
    return {"step1_result": f"步骤1处理: {state['input']}"}

def step2(state: State) -> State:
    """
    步骤2节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    # 处理步骤1的结果
    return {"step2_result": f"步骤2处理: {state['step1_result']}"}

def step3(state: State) -> State:
    """
    步骤3节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    # 生成最终结果
    return {"output": f"最终结果: {state['step2_result']}"}

# 创建图
graph = StateGraph(State)

# 添加节点
graph.add_node("step1", step1)
graph.add_node("step2", step2)
graph.add_node("step3", step3)

# 设置顺序边
# 顺序执行模式：节点按顺序依次执行
graph.set_entry_point("step1")  # 设置入口点
graph.add_edge("step1", "step2")  # step1 -> step2
graph.add_edge("step2", "step3")  # step2 -> step3
graph.add_edge("step3", END)  # step3 -> 结束

# 编译和执行
app = graph.compile()

# 执行图
result = app.invoke({
    "input": "测试数据",
    "step1_result": "",
    "step2_result": "",
    "output": ""
})
print(result["output"])
```

### 2. 条件分支模式
根据条件选择不同的执行路径：
```python
# 导入LangGraph核心组件
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 定义状态类型
class State(TypedDict):
    """
    状态定义
    
    属性：
        input (str): 用户输入
        category (str): 分类结果（weather/news/general）
        output (str): 处理结果
    """
    input: str
    category: str
    output: str

# 定义节点函数
def classify(state: State) -> State:
    """
    分类节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：根据输入内容进行分类
    """
    input_text = state["input"].lower()
    
    # 根据关键词分类
    if "天气" in input_text:
        category = "weather"
    elif "新闻" in input_text:
        category = "news"
    else:
        category = "general"
    
    return {"category": category}

def handle_weather(state: State) -> State:
    """
    处理天气查询
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    return {"output": f"天气查询结果: {state['input']}"}

def handle_news(state: State) -> State:
    """
    处理新闻查询
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    return {"output": f"新闻查询结果: {state['input']}"}

def handle_general(state: State) -> State:
    """
    处理一般查询
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    return {"output": f"一般查询结果: {state['input']}"}

# 创建图
graph = StateGraph(State)

# 添加节点
graph.add_node("classify", classify)
graph.add_node("weather", handle_weather)
graph.add_node("news", handle_news)
graph.add_node("general", handle_general)

# 设置条件边
def route_function(state: State) -> str:
    """
    路由函数
    
    参数：
        state (State): 当前状态
    
    返回值：
        str: 路由目标
    """
    return state["category"]

# 添加条件边
# 条件分支模式：根据条件选择不同的执行路径
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
graph.add_edge("weather", END)
graph.add_edge("news", END)
graph.add_edge("general", END)

# 编译和执行
graph.set_entry_point("classify")
app = graph.compile()

# 执行图
result = app.invoke({
    "input": "北京天气怎么样？",
    "category": "",
    "output": ""
})
print(result["output"])
```

### 3. 并行执行模式
多个节点并行执行：
```python
# 导入LangGraph核心组件
from langgraph.graph import StateGraph, END
from typing import TypedDict, List
import asyncio  # 异步IO库

# 定义状态类型
class State(TypedDict):
    """
    状态定义
    
    属性：
        input (str): 输入数据
        results (List[str]): 任务结果列表
        output (str): 合并后的输出
    """
    input: str
    results: List[str]
    output: str

# 定义异步节点函数
async def task1(state: State) -> State:
    """
    任务1（异步）
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    # await asyncio.sleep(1)：模拟异步操作
    await asyncio.sleep(1)
    return {"results": [f"任务1结果: {state['input']}"]}

async def task2(state: State) -> State:
    """
    任务2（异步）
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    await asyncio.sleep(1)
    return {"results": [f"任务2结果: {state['input']}"]}

async def task3(state: State) -> State:
    """
    任务3（异步）
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    await asyncio.sleep(1)
    return {"results": [f"任务3结果: {state['input']}"]}

def merge_results(state: State) -> State:
    """
    合并结果节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    # 合并所有任务的结果
    return {"output": "合并结果: " + ", ".join(state["results"])}

# 创建图
graph = StateGraph(State)

# 添加节点
graph.add_node("task1", task1)
graph.add_node("task2", task2)
graph.add_node("task3", task3)
graph.add_node("merge", merge_results)

# 设置并行边
# 并行执行模式：多个节点可以并行执行
graph.set_entry_point("task1")
graph.add_edge("task1", "task2")  # task1完成后执行task2
graph.add_edge("task1", "task3")  # task1完成后同时执行task3
graph.add_edge("task2", "merge")  # task2完成后执行merge
graph.add_edge("task3", "merge")  # task3完成后执行merge
graph.add_edge("merge", END)  # merge完成后结束

# 编译和执行
app = graph.compile()

# 执行图
result = app.invoke({
    "input": "测试数据",
    "results": [],
    "output": ""
})
print(result["output"])
```

## 高级模式

### 1. 循环执行模式
重复执行直到满足条件：
```python
# 导入LangGraph核心组件
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 定义状态类型
class State(TypedDict):
    """
    状态定义
    
    属性：
        count (int): 当前执行次数
        max_iterations (int): 最大迭代次数
        output (str): 输出结果
    """
    count: int
    max_iterations: int
    output: str

# 定义节点函数
def process(state: State) -> State:
    """
    处理节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    # 增加计数
    count = state["count"] + 1
    return {"count": count}

def should_continue(state: State) -> str:
    """
    判断是否继续执行
    
    参数：
        state (State): 当前状态
    
    返回值：
        str: 决定下一步
            "continue"：继续执行
            "end"：结束执行
    """
    # 检查是否达到最大迭代次数
    if state["count"] >= state["max_iterations"]:
        return "end"
    return "continue"

# 创建图
graph = StateGraph(State)

# 添加节点
graph.add_node("process", process)

# 设置条件边
# 循环执行模式：重复执行直到满足条件
graph.add_conditional_edges(
    "process",  # 起始节点
    should_continue,  # 条件函数
    {
        "continue": "process",  # 继续执行，回到process节点
        "end": END  # 结束执行
    }
)

# 编译和执行
graph.set_entry_point("process")
app = graph.compile()

# 执行图
result = app.invoke({
    "count": 0,
    "max_iterations": 5,
    "output": ""
})
print(f"执行次数: {result['count']}")
```

### 2. 人机交互模式
在关键节点等待人工输入：
```python
# 导入LangGraph核心组件
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver  # 内存检查点
from typing import TypedDict

# 定义状态类型
class State(TypedDict):
    """
    状态定义
    
    属性：
        messages (list): 消息列表
        human_input (str): 人工输入
        approved (bool): 是否已批准
    """
    messages: list
    human_input: str
    approved: bool

# 定义节点函数
def process(state: State) -> State:
    """
    处理节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    return {
        "messages": state["messages"],
        "human_input": "",
        "approved": False
    }

def human_approval(state: State) -> State:
    """
    人工审批节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：等待人工审批
    """
    print("需要人工审批")
    return {
        "messages": state["messages"],
        "human_input": "approved",  # 模拟人工输入
        "approved": True
    }

def final(state: State) -> State:
    """
    最终节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    return {
        "messages": state["messages"],
        "human_input": state["human_input"],
        "approved": True
    }

# 创建图
graph = StateGraph(State)

# 添加节点
graph.add_node("process", process)
graph.add_node("human_approval", human_approval)
graph.add_node("final", final)

# 设置边
graph.set_entry_point("process")
graph.add_edge("process", "human_approval")
graph.add_edge("human_approval", "final")
graph.add_edge("final", END)

# 使用检查点
# MemorySaver()：内存检查点，用于保存和恢复状态
checkpointer = MemorySaver()

# 编译图，启用检查点和中断
# interrupt_before=["human_approval"]：在human_approval节点前中断执行
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

### 3. 状态机模式
实现复杂的状态机逻辑：
```python
# 导入LangGraph核心组件
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

# 定义状态类型
class State(TypedDict):
    """
    状态定义
    
    属性：
        current_state (str): 当前状态（A/B/C）
        input (str): 输入数据
        output (str): 输出结果
    """
    current_state: str
    input: str
    output: str

# 定义状态转换函数
def state_a(state: State) -> State:
    """
    状态A
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    # 根据输入决定状态转换
    if "触发" in state["input"]:
        return {"current_state": "B", "output": "从A转换到B"}
    return {"current_state": "A", "output": "保持在A"}

def state_b(state: State) -> State:
    """
    状态B
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    if "完成" in state["input"]:
        return {"current_state": "C", "output": "从B转换到C"}
    return {"current_state": "B", "output": "保持在B"}

def state_c(state: State) -> State:
    """
    状态C（最终状态）
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    """
    return {"current_state": "C", "output": "最终状态C"}

# 创建图
graph = StateGraph(State)

# 添加节点
graph.add_node("A", state_a)
graph.add_node("B", state_b)
graph.add_node("C", state_c)

# 设置条件边
def route_function(state: State) -> str:
    """
    路由函数
    
    参数：
        state (State): 当前状态
    
    返回值：
        str: 路由目标
    """
    return state["current_state"]

# 添加条件边
# 状态机模式：实现复杂的状态机逻辑
graph.add_conditional_edges(
    "A",  # 从状态A
    route_function,
    {
        "A": "A",  # 保持在A
        "B": "B"   # 转换到B
    }
)

graph.add_conditional_edges(
    "B",  # 从状态B
    route_function,
    {
        "B": "B",  # 保持在B
        "C": "C"   # 转换到C
    }
)

# 设置出口
graph.add_edge("C", END)  # 状态C是最终状态

# 编译和执行
graph.set_entry_point("A")
app = graph.compile()

# 执行图
result = app.invoke({
    "current_state": "A",
    "input": "触发",
    "output": ""
})
print(result["output"])
```

## 实际应用模式

### 1. RAG工作流模式
实现检索增强生成工作流：
```python
# 导入LangGraph核心组件
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

# 定义状态类型
class State(TypedDict):
    """
    状态定义
    
    属性：
        query (str): 用户查询
        documents (List[str]): 检索到的文档列表
        context (str): 上下文信息
        answer (str): 生成的回答
    """
    query: str
    documents: List[str]
    context: str
    answer: str

# 定义节点函数
def retrieve(state: State) -> State:
    """
    检索节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：从知识库中检索相关文档
    """
    # 这里应该是实际的检索逻辑
    # 示例：模拟检索结果
    documents = [f"文档1: {state['query']}", f"文档2: {state['query']}"]
    return {"documents": documents}

def rerank(state: State) -> State:
    """
    重排序节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：对检索结果进行重排序
    """
    # 这里应该是实际的重排序逻辑
    # 示例：将文档合并为上下文
    context = "\n".join(state["documents"])
    return {"context": context}

def generate(state: State) -> State:
    """
    生成节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：基于上下文生成回答
    """
    # 这里应该是实际的生成逻辑
    # 示例：模拟生成回答
    answer = f"基于上下文的回答: {state['context']}"
    return {"answer": answer}

# 创建图
graph = StateGraph(State)

# 添加节点
graph.add_node("retrieve", retrieve)
graph.add_node("rerank", rerank)
graph.add_node("generate", generate)

# 设置边
# RAG工作流模式：检索 -> 重排序 -> 生成
graph.set_entry_point("retrieve")
graph.add_edge("retrieve", "rerank")
graph.add_edge("rerank", "generate")
graph.add_edge("generate", END)

# 编译和执行
app = graph.compile()

# 执行图
result = app.invoke({
    "query": "什么是人工智能？",
    "documents": [],
    "context": "",
    "answer": ""
})
print(result["answer"])
```

### 2. 多Agent协作模式
实现多Agent协作工作流：
```python
# 导入LangGraph核心组件
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

# 定义状态类型
class State(TypedDict):
    """
    状态定义
    
    属性：
        task (str): 任务描述
        research_result (str): 研究结果
        analysis_result (str): 分析结果
        final_report (str): 最终报告
    """
    task: str
    research_result: str
    analysis_result: str
    final_report: str

# 定义节点函数（Agent）
def researcher(state: State) -> State:
    """
    研究员Agent
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：执行研究任务，收集信息
    """
    # 这里应该是实际的研究逻辑
    research_result = f"研究结果: {state['task']}"
    return {"research_result": research_result}

def analyst(state: State) -> State:
    """
    分析师Agent
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：分析研究结果
    """
    # 这里应该是实际的分析逻辑
    analysis_result = f"分析结果: {state['research_result']}"
    return {"analysis_result": analysis_result}

def writer(state: State) -> State:
    """
    作家Agent
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：撰写最终报告
    """
    # 这里应该是实际的写作逻辑
    final_report = f"最终报告: {state['analysis_result']}"
    return {"final_report": final_report}

# 创建图
graph = StateGraph(State)

# 添加节点
graph.add_node("researcher", researcher)
graph.add_node("analyst", analyst)
graph.add_node("writer", writer)

# 设置边
# 多Agent协作模式：研究 -> 分析 -> 写作
graph.set_entry_point("researcher")
graph.add_edge("researcher", "analyst")
graph.add_edge("analyst", "writer")
graph.add_edge("writer", END)

# 编译和执行
app = graph.compile()

# 执行图
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
# 导入LangGraph核心组件
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

# 定义状态类型
class State(TypedDict):
    """
    状态定义
    
    属性：
        messages (List[dict]): 对话消息列表
        intent (str): 用户意图
        context (dict): 上下文信息
        response (str): 生成的响应
    """
    messages: List[dict]
    intent: str
    context: dict
    response: str

# 定义节点函数
def understand_intent(state: State) -> State:
    """
    理解意图节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：分析用户意图
    """
    # 获取最后一条消息
    last_message = state["messages"][-1]["content"]
    
    # 根据关键词判断意图
    if "天气" in last_message:
        intent = "weather"
    elif "新闻" in last_message:
        intent = "news"
    else:
        intent = "chat"
    
    return {"intent": intent}

def gather_context(state: State) -> State:
    """
    收集上下文节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：收集和整理上下文信息
    """
    # 收集上下文信息
    context = {
        "intent": state["intent"],
        "history": state["messages"]
    }
    return {"context": context}

def generate_response(state: State) -> State:
    """
    生成响应节点
    
    参数：
        state (State): 当前状态
    
    返回值：
        State: 更新后的状态
    
    功能：根据意图和上下文生成响应
    """
    # 这里应该是实际的响应生成逻辑
    response = f"基于意图{state['intent']}的响应"
    return {"response": response}

# 创建图
graph = StateGraph(State)

# 添加节点
graph.add_node("understand", understand_intent)
graph.add_node("gather", gather_context)
graph.add_node("generate", generate_response)

# 设置边
# 对话管理模式：理解意图 -> 收集上下文 -> 生成响应
graph.set_entry_point("understand")
graph.add_edge("understand", "gather")
graph.add_edge("gather", "generate")
graph.add_edge("generate", END)

# 编译和执行
app = graph.compile()

# 执行图
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