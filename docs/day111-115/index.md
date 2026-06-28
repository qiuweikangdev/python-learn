# LangGraph工作流

## 概述

LangGraph是LangChain团队开发的基于图的Agent工作流框架，用于构建复杂的、有状态的LLM应用。它提供了更灵活的控制流和状态管理能力，适合构建需要多步推理和决策的Agent系统。

## 核心概念

### 1. 图结构（Graph）
LangGraph基于有向图结构，包含：
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

## 技术方案对比

### LangGraph vs 其他工作流方案

| 对比维度 | LangGraph | 状态机 | 工作流引擎 | 自研方案 |
|----------|-----------|--------|------------|----------|
| **定位** | LLM工作流 | 通用状态管理 | 业务流程管理 | 完全自定义 |
| **LLM集成** | 原生支持 | 需要自己集成 | 需要自己集成 | 需要自己实现 |
| **状态管理** | 内置 | 需要自己实现 | 内置 | 需要自己实现 |
| **人机交互** | 原生支持 | 需要自己实现 | 部分支持 | 需要自己实现 |
| **学习曲线** | 中等 | 较低 | 中等 | 高 |
| **适用场景** | LLM应用 | 通用状态机 | 业务流程 | 特殊需求 |

### 如何选择方案？

**场景一：简单LLM调用**
- 推荐：直接使用LangChain
- 原因：LangGraph对于简单场景过于复杂

**场景二：多步推理、需要状态管理**
- 推荐：LangGraph
- 原因：原生支持状态管理和条件分支

**场景三：需要人机交互**
- 推荐：LangGraph
- 原因：原生支持人工审批和输入

**场景四：复杂的业务流程**
- 推荐：工作流引擎（如Airflow）
- 原因：更适合业务流程管理

### LangGraph工作流模式对比

| 模式 | 原理 | 适用场景 | 复杂度 |
|------|------|----------|--------|
| **顺序执行** | 节点按顺序执行 | 简单流程 | 低 |
| **条件分支** | 根据条件选择路径 | 决策树 | 中等 |
| **并行执行** | 多个节点同时执行 | 需要并行处理的任务 | 中等 |
| **循环执行** | 重复执行直到满足条件 | 迭代优化 | 较高 |
| **人机交互** | 等待人工输入 | 需要人工审批的流程 | 较高 |

## 设计原理与目的

### 为什么需要LangGraph？

**直接使用LangChain的问题：**

```
问题1：复杂工作流难以表达
LangChain的链是线性的，难以表达：
- 条件分支
- 循环
- 并行执行

问题2：状态管理困难
LangChain没有内置的状态管理：
- 需要自己传递状态
- 难以在节点间共享数据
- 状态持久化需要自己实现

问题3：人机交互复杂
需要人工审批或输入时：
- LangChain没有原生支持
- 需要自己实现中断和恢复
```

**LangGraph的解决方案：**

```
解决方案1：图结构
使用有向图表达复杂工作流：
- 节点：执行具体操作
- 边：定义转移关系
- 条件边：支持条件分支

解决方案2：状态管理
内置全局状态对象：
- 所有节点共享状态
- 节点可以读取和更新状态
- 支持状态持久化

解决方案3：人机交互
原生支持人工参与：
- 中断节点
- 人工输入
- 检查点
```

### 核心设计思想

**1. 图结构表示工作流**

```
类比：流程图

传统代码：
if condition1:
    do_A()
elif condition2:
    do_B()
else:
    do_C()

LangGraph：
graph.add_conditional_edges(
    "decision",
    route_function,
    {"A": "node_A", "B": "node_B", "C": "node_C"}
)

优势：
- 可视化：可以画出流程图
- 灵活：易于修改和扩展
- 可测试：每个节点独立测试
```

**2. 状态驱动的执行**

```
执行过程：

初始状态 → 节点A → 状态更新 → 节点B → 状态更新 → ...

状态示例：
{
    "messages": [...],  # 对话历史
    "current_step": "analyzing",  # 当前步骤
    "results": {...}  # 中间结果
}

每个节点：
1. 读取状态
2. 执行逻辑
3. 返回状态更新
```

**3. 条件路由机制**

```
路由函数决定下一步：

def route(state):
    if state["needs_search"]:
        return "search_node"
    elif state["needs_calculation"]:
        return "calc_node"
    else:
        return "end"

图执行：
1. 执行当前节点
2. 调用路由函数
3. 根据返回值选择下一个节点
4. 重复，直到结束
```

### 为什么图结构有效？

**问题：** 复杂任务有多种可能的执行路径

**示例：** 用户提问"北京天气怎么样？"

```
可能的执行路径：

路径1：简单回答
用户提问 → 直接回答 → 结束

路径2：需要查询
用户提问 → 调用天气API → 整合回答 → 结束

路径3：需要澄清
用户提问 → 询问具体日期 → 调用天气API → 整合回答 → 结束

图结构可以表达所有可能的路径，并根据状态动态选择
```

### 为什么状态管理重要？

**问题：** 多个节点需要共享数据

**示例：** 多步推理

```
步骤1：分析问题
状态：{"analysis": "..."}

步骤2：搜索信息
读取：state["analysis"]
状态：{"analysis": "...", "search_results": "..."}

步骤3：生成回答
读取：state["analysis"], state["search_results"]
状态：{"analysis": "...", "search_results": "...", "answer": "..."}

状态管理确保数据在节点间正确传递
```

## 应用场景详解

### 场景一：多步问答系统

**需求：** 构建一个能进行多步推理的问答系统

**实现：**
```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict, List

# 1. 定义状态
class QAState(TypedDict):
    question: str
    analysis: str
    search_results: List[str]
    answer: str

# 2. 定义节点
def analyze_question(state: QAState) -> QAState:
    """分析问题"""
    llm = ChatOpenAI(model="gpt-4o-mini")
    analysis = llm.invoke(f"分析问题的类型和需要的信息：{state['question']}")
    return {"analysis": analysis.content}

def search_information(state: QAState) -> QAState:
    """搜索信息"""
    # 这里应该是实际的搜索逻辑
    search_results = [f"搜索结果1：关于{state['question']}"]
    return {"search_results": search_results}

def generate_answer(state: QAState) -> QAState:
    """生成回答"""
    llm = ChatOpenAI(model="gpt-4o-mini")
    context = "\n".join(state["search_results"])
    answer = llm.invoke(f"基于以下信息回答问题：\n{context}\n\n问题：{state['question']}")
    return {"answer": answer.content}

# 3. 创建图
graph = StateGraph(QAState)

# 添加节点
graph.add_node("analyze", analyze_question)
graph.add_node("search", search_information)
graph.add_node("generate", generate_answer)

# 添加边
graph.set_entry_point("analyze")
graph.add_edge("analyze", "search")
graph.add_edge("search", "generate")
graph.add_edge("generate", END)

# 4. 编译并执行
app = graph.compile()
result = app.invoke({
    "question": "什么是人工智能？",
    "analysis": "",
    "search_results": [],
    "answer": ""
})

print(result["answer"])
```

**设计要点：**
- 使用TypedDict定义状态结构
- 每个节点只负责一个步骤
- 状态在节点间自动传递

### 场景二：条件分支工作流

**需求：** 根据问题类型选择不同的处理流程

**实现：**
```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict

# 1. 定义状态
class RouterState(TypedDict):
    question: str
    question_type: str
    answer: str

# 2. 定义节点
def classify_question(state: RouterState) -> RouterState:
    """分类问题"""
    llm = ChatOpenAI(model="gpt-4o-mini")
    response = llm.invoke(f"将以下问题分类为'天气'、'新闻'或'其他'：{state['question']}")
    question_type = response.content.strip().lower()
    return {"question_type": question_type}

def handle_weather(state: RouterState) -> RouterState:
    """处理天气问题"""
    return {"answer": f"天气查询：{state['question']}"}

def handle_news(state: RouterState) -> RouterState:
    """处理新闻问题"""
    return {"answer": f"新闻查询：{state['question']}"}

def handle_other(state: RouterState) -> RouterState:
    """处理其他问题"""
    llm = ChatOpenAI(model="gpt-4o-mini")
    answer = llm.invoke(state["question"])
    return {"answer": answer.content}

# 3. 定义路由函数
def route_question(state: RouterState) -> str:
    """根据问题类型路由"""
    if state["question_type"] == "天气":
        return "weather"
    elif state["question_type"] == "新闻":
        return "news"
    else:
        return "other"

# 4. 创建图
graph = StateGraph(RouterState)

# 添加节点
graph.add_node("classify", classify_question)
graph.add_node("weather", handle_weather)
graph.add_node("news", handle_news)
graph.add_node("other", handle_other)

# 添加边
graph.set_entry_point("classify")
graph.add_conditional_edges(
    "classify",
    route_question,
    {
        "weather": "weather",
        "news": "news",
        "other": "other"
    }
)
graph.add_edge("weather", END)
graph.add_edge("news", END)
graph.add_edge("other", END)

# 5. 编译并执行
app = graph.compile()

result = app.invoke({
    "question": "北京今天天气怎么样？",
    "question_type": "",
    "answer": ""
})
print(result["answer"])
```

**设计要点：**
- 使用条件边实现分支
- 路由函数根据状态决定路径
- 每个分支独立处理

### 场景三：人机交互工作流

**需求：** 在关键步骤需要人工审批

**实现：**
```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from typing import TypedDict

# 1. 定义状态
class ApprovalState(TypedDict):
    task: str
    draft: str
    approved: bool
    final_output: str

# 2. 定义节点
def generate_draft(state: ApprovalState) -> ApprovalState:
    """生成草稿"""
    llm = ChatOpenAI(model="gpt-4o-mini")
    draft = llm.invoke(f"根据以下任务生成草稿：{state['task']}")
    return {"draft": draft.content}

def human_review(state: ApprovalState) -> ApprovalState:
    """人工审核（这里模拟，实际需要人工输入）"""
    # 在实际应用中，这里会暂停等待人工输入
    print(f"请审核以下草稿：\n{state['draft']}")
    return {"approved": True}  # 假设审核通过

def finalize(state: ApprovalState) -> ApprovalState:
    """最终输出"""
    if state["approved"]:
        return {"final_output": state["draft"]}
    else:
        return {"final_output": "草稿未通过审核"}

# 3. 创建图
graph = StateGraph(ApprovalState)

# 添加节点
graph.add_node("generate", generate_draft)
graph.add_node("review", human_review)
graph.add_node("finalize", finalize)

# 添加边
graph.set_entry_point("generate")
graph.add_edge("generate", "review")
graph.add_edge("review", "finalize")
graph.add_edge("finalize", END)

# 4. 使用检查点支持中断
checkpointer = MemorySaver()
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["review"]  # 在审核前中断
)

# 5. 执行
config = {"configurable": {"thread_id": "1"}}
result = app.invoke({
    "task": "写一篇关于AI的文章",
    "draft": "",
    "approved": False,
    "final_output": ""
}, config)
```

**设计要点：**
- 使用interrupt_before在特定节点前中断
- 使用MemorySaver保存执行状态
- 可以恢复执行并继续

### 场景四：循环优化工作流

**需求：** 迭代优化直到满足质量要求

**实现：**
```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict

# 1. 定义状态
class OptimizationState(TypedDict):
    task: str
    current_output: str
    quality_score: float
    iteration: int
    max_iterations: int

# 2. 定义节点
def generate_output(state: OptimizationState) -> OptimizationState:
    """生成输出"""
    llm = ChatOpenAI(model="gpt-4o-mini")
    output = llm.invoke(f"完成以下任务：{state['task']}")
    return {
        "current_output": output.content,
        "iteration": state["iteration"] + 1
    }

def evaluate_quality(state: OptimizationState) -> OptimizationState:
    """评估质量"""
    llm = ChatOpenAI(model="gpt-4o-mini")
    response = llm.invoke(f"评估以下输出的质量（0-10分）：\n{state['current_output']}")
    try:
        score = float(response.content)
    except:
        score = 5.0
    return {"quality_score": score}

def improve_output(state: OptimizationState) -> OptimizationState:
    """改进输出"""
    llm = ChatOpenAI(model="gpt-4o-mini")
    improved = llm.invoke(f"改进以下输出，提高质量：\n{state['current_output']}")
    return {"current_output": improved.content}

# 3. 定义条件函数
def should_continue(state: OptimizationState) -> str:
    """判断是否继续"""
    if state["quality_score"] >= 8.0:
        return "end"
    elif state["iteration"] >= state["max_iterations"]:
        return "end"
    else:
        return "improve"

# 4. 创建图
graph = StateGraph(OptimizationState)

# 添加节点
graph.add_node("generate", generate_output)
graph.add_node("evaluate", evaluate_quality)
graph.add_node("improve", improve_output)

# 添加边
graph.set_entry_point("generate")
graph.add_edge("generate", "evaluate")
graph.add_conditional_edges(
    "evaluate",
    should_continue,
    {
        "improve": "improve",
        "end": END
    }
)
graph.add_edge("improve", "evaluate")

# 5. 编译并执行
app = graph.compile()

result = app.invoke({
    "task": "写一个关于人工智能的简介",
    "current_output": "",
    "quality_score": 0.0,
    "iteration": 0,
    "max_iterations": 3
})

print(f"最终输出（迭代{result['iteration']}次，质量分数{result['quality_score']}）：")
print(result["current_output"])
```

**设计要点：**
- 使用循环边实现迭代
- 条件函数判断是否继续
- 限制最大迭代次数避免无限循环

## 架构设计

### 1. 核心架构
```
应用层
├── 图定义（Graph Definition）
├── 执行引擎（Execution Engine）
└── 状态管理（State Management）
    ├── 节点（Nodes）
    ├── 边（Edges）
    └── 状态（State）
```

### 2. 执行流程
```
开始 → 初始状态 → 节点执行 → 状态更新 → 边判断 → 下一节点 → 结束
                ↑                              ↓
                └──────── 循环执行 ←───────────┘
```

### 3. 组件交互
```python
# 图定义
graph = StateGraph(State)

# 添加节点
graph.add_node("node1", function1)
graph.add_node("node2", function2)

# 添加边
graph.add_edge("node1", "node2")
graph.add_conditional_edges("node2", condition_function)

# 编译和执行
app = graph.compile()
result = app.invoke(initial_state)
```

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
    llm = ChatOpenAI(model="gpt-4o-mini")
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
    llm = ChatOpenAI(model="gpt-4o-mini")
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

- [核心概念详解](/agent/langgraph/core-concepts) - 深入理解LangGraph核心概念
- [API参考手册](/agent/langgraph/api-reference) - 详细的API文档
- [工作流模式](/agent/langgraph/workflow-patterns) - 常见工作流模式