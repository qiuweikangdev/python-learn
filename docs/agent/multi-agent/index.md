# 多Agent系统概述

> **版本基线**：本文基于 LangChain 1.x / LangGraph 1.x（2025-10 GA），示例模型 gpt-5-mini，更新于 2026-09。

## 什么是多Agent系统？

多Agent系统（Multi-Agent System，MAS）是由多个自主Agent组成的分布式人工智能系统。这些Agent能够相互协作、通信和协调，共同完成复杂任务。

## 核心概念

### 1. Agent协作
Agent协作是多Agent系统的核心：
- **任务分配**：将任务分配给合适的Agent
- **资源共享**：Agent间共享资源和信息
- **冲突解决**：解决Agent间的冲突和竞争
- **协同决策**：共同做出决策

### 2. 通信机制
Agent间的通信方式：
- **消息传递**：通过消息进行通信
- **共享内存**：通过共享数据通信
- **事件驱动**：通过事件触发通信
- **协议通信**：通过预定义协议通信

### 3. 协调机制
Agent间的协调方式：
- **集中式协调**：由协调器统一管理
- **分布式协调**：Agent间自主协调
- **层次化协调**：分层协调管理
- **基于规则的协调**：通过规则约束协调

### 4. 组织结构
多Agent系统的组织形式：
- **扁平结构**：所有Agent平等
- **层次结构**：分层管理
- **矩阵结构**：多维度组织
- **网络结构**：网状连接

## 技术原理

### 1. 分布式计算
多Agent系统的分布式特性：
- **分布式决策**：每个Agent独立决策
- **分布式执行**：任务分布式执行
- **分布式状态**：状态分布式管理
- **分布式一致性**：保证系统一致性

### 2. 通信协议
Agent通信协议设计：
- **消息格式**：标准化消息格式
- **通信模式**：同步/异步通信
- **错误处理**：通信错误处理
- **安全机制**：通信安全保障

### 3. 协调算法
常见的协调算法：
- **合同网协议**：基于招标的协调
- **拍卖机制**：基于拍卖的协调
- **博弈论**：基于博弈的协调
- **共识算法**：基于共识的协调

### 4. 学习机制
多Agent学习：
- **独立学习**：每个Agent独立学习
- **联合学习**：Agent间共享学习经验
- **对抗学习**：通过竞争学习
- **协作学习**：通过协作学习

## 架构设计

### 1. 集中式架构
```
用户输入 → 协调器 → Agent1 → 任务1
                ↓
            Agent2 → 任务2
                ↓
            Agent3 → 任务3
                ↓
            结果整合 → 输出
```

### 2. 分布式架构
```
用户输入 → Agent1 ↔ Agent2 ↔ Agent3
            ↓          ↓          ↓
        任务1      任务2      任务3
            ↓          ↓          ↓
        结果1      结果2      结果3
            ↓          ↓          ↓
            结果整合 → 输出
```

### 3. 层次化架构
```
用户输入 → 顶层协调器
            ↓
        中层协调器1 ↔ 中层协调器2
            ↓              ↓
        Agent1-3        Agent4-6
            ↓              ↓
        任务1-3         任务4-6
            ↓              ↓
            结果整合 → 输出
```

## 协作模式

### 1. 主从模式
- **主Agent**：负责任务分配和协调
- **从Agent**：负责具体任务执行
- **优点**：结构清晰，易于管理
- **缺点**：主Agent成为瓶颈

### 2. 对等模式
- **平等地位**：所有Agent地位平等
- **自主决策**：每个Agent自主决策
- **优点**：灵活，无单点故障
- **缺点**：协调复杂

### 3. 竞争模式
- **任务竞争**：Agent竞争任务
- **优胜劣汰**：表现好的Agent获得更多任务
- **优点**：激励Agent改进
- **缺点**：可能导致资源浪费

### 4. 协作模式
- **任务协作**：Agent协作完成任务
- **资源共享**：Agent共享资源
- **优点**：提高效率，资源共享
- **缺点**：协调复杂

## 通信机制

### 1. 消息传递
```python
from typing import Dict, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Message:
    sender: str
    receiver: str
    content: Any
    timestamp: datetime
    message_type: str

class MessageBroker:
    def __init__(self):
        self.agents: Dict[str, 'Agent'] = {}
        self.message_queue: Dict[str, list] = {}

    def register_agent(self, agent_id: str, agent: 'Agent'):
        self.agents[agent_id] = agent
        self.message_queue[agent_id] = []

    def send_message(self, message: Message):
        if message.receiver in self.message_queue:
            self.message_queue[message.receiver].append(message)
            self.agents[message.receiver].receive_message(message)

    def get_messages(self, agent_id: str) -> list:
        messages = self.message_queue.get(agent_id, [])
        self.message_queue[agent_id] = []
        return messages

class Agent:
    def __init__(self, agent_id: str, broker: MessageBroker):
        self.agent_id = agent_id
        self.broker = broker
        broker.register_agent(agent_id, self)

    def send_message(self, receiver: str, content: Any, message_type: str = "text"):
        message = Message(
            sender=self.agent_id,
            receiver=receiver,
            content=content,
            timestamp=datetime.now(),
            message_type=message_type
        )
        self.broker.send_message(message)

    def receive_message(self, message: Message):
        print(f"Agent {self.agent_id} received: {message.content}")
```

### 2. 共享内存
```python
from typing import Dict, Any
import threading

class SharedMemory:
    def __init__(self):
        self.memory: Dict[str, Any] = {}
        self.lock = threading.Lock()

    def read(self, key: str) -> Any:
        with self.lock:
            return self.memory.get(key)

    def write(self, key: str, value: Any):
        with self.lock:
            self.memory[key] = value

    def delete(self, key: str):
        with self.lock:
            if key in self.memory:
                del self.memory[key]

    def keys(self) -> list:
        with self.lock:
            return list(self.memory.keys())

class Agent:
    def __init__(self, agent_id: str, shared_memory: SharedMemory):
        self.agent_id = agent_id
        self.shared_memory = shared_memory

    def read_memory(self, key: str) -> Any:
        return self.shared_memory.read(key)

    def write_memory(self, key: str, value: Any):
        self.shared_memory.write(key, value)
```

### 3. 事件驱动
```python
from typing import Dict, Callable, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Event:
    event_type: str
    source: str
    data: Any
    timestamp: datetime

class EventBus:
    def __init__(self):
        self.subscribers: Dict[str, list] = {}

    def subscribe(self, event_type: str, callback: Callable):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)

    def publish(self, event: Event):
        if event.event_type in self.subscribers:
            for callback in self.subscribers[event.event_type]:
                callback(event)

class Agent:
    def __init__(self, agent_id: str, event_bus: EventBus):
        self.agent_id = agent_id
        self.event_bus = event_bus
        self.event_bus.subscribe("task_completed", self.handle_task_completed)

    def handle_task_completed(self, event: Event):
        print(f"Agent {self.agent_id} handling event: {event.data}")

    def publish_event(self, event_type: str, data: Any):
        event = Event(
            event_type=event_type,
            source=self.agent_id,
            data=data,
            timestamp=datetime.now()
        )
        self.event_bus.publish(event)
```

## 实践指南

### 1. 环境准备
```bash
# 安装必要的库（LangChain 1.x 自带 LangGraph 依赖）
pip install -U langchain langgraph langchain-openai

# 设置环境变量
export OPENAI_API_KEY="your-openai-key"
```

### 2. 基础多Agent示例：create_agent 按角色构建

LangChain 1.x 用 `create_agent` 一行创建一个完整的 Agent，取代了旧版的 `AgentExecutor` + `create_openai_tools_agent` 组合。每个角色一个 Agent，各自拥有独立的工具集与系统提示词：

```python
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

# 1. 定义工具：每个角色的 Agent 拥有自己的工具集
@tool
def research(topic: str) -> str:
    """研究指定主题，返回研究摘要"""
    return f"关于{topic}的研究结果：这是一个重要的研究领域..."

@tool
def analyze(data: str) -> str:
    """分析数据并给出结论"""
    return "分析结果：基于数据分析，发现以下趋势..."

llm = ChatOpenAI(model="gpt-5-mini")

# 2. create_agent 直接创建 Agent（内部是一条 LangGraph 执行图）
researcher = create_agent(
    llm,
    tools=[research],
    system_prompt="你是一个研究员，负责收集和分析信息。",
)

analyst = create_agent(
    llm,
    tools=[analyze],
    system_prompt="你是一个分析师，负责分析数据并提供见解。",
)

# 3. 顺序编排：先研究，后分析（最简单的多Agent流水线）
research_result = researcher.invoke({
    "messages": [{"role": "user", "content": "研究: 人工智能在医疗领域的应用"}]
})
research_text = research_result["messages"][-1].content

analysis_result = analyst.invoke({
    "messages": [{"role": "user",
                  "content": f"分析以下研究结果: {research_text}"}]
})
print(analysis_result["messages"][-1].content)
```

::: tip 旧写法对照（LangChain 0.x）
旧版教程常用 `AgentExecutor` + `create_openai_tools_agent`，并从 `langchain.prompts` 导入提示词模板。这些 API 在 LangChain 1.x 中已全部移除（兼容实现迁入 `langchain-classic` 包）：

```python
# ❌ 旧写法（LangChain 0.x，已移除）
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.prompts import ChatPromptTemplate  # 现应从 langchain_core.prompts 导入

agent = create_openai_tools_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools)
executor.invoke({"input": "..."})["output"]
```

新写法只需 `from langchain.agents import create_agent`；调用结果是一个消息列表，`messages[-1].content` 即最终回答。
:::

### 3. 多Agent协作示例：Supervisor 模式 + LangGraph 编排

更工程化的做法是用 LangGraph 的 `StateGraph` 显式编排多个 Agent。下面是一个典型的 **supervisor（主管）模式**：一个 supervisor 节点用**结构化输出**决定下一步交给谁，两个专家 Agent 各自作为图中的节点工作，完成后交回 supervisor，直到任务完成：

```python
import operator
from typing import Annotated, Literal, TypedDict

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

llm = ChatOpenAI(model="gpt-5-mini")

# ---------- 1. 两个专家 Agent ----------
@tool
def research(topic: str) -> str:
    """检索并总结指定主题的研究资料"""
    return f"关于「{topic}」的研究资料：..."

@tool
def analyze(data: str) -> str:
    """对给定材料做数据分析"""
    return f"数据分析结论：{data}"

research_agent = create_agent(
    llm, tools=[research],
    system_prompt="你是研究员，只负责收集资料，不要做分析。",
)
analyst_agent = create_agent(
    llm, tools=[analyze],
    system_prompt="你是数据分析师，只负责分析材料，不要做检索。",
)

# ---------- 2. Supervisor：结构化输出做路由 ----------
class Route(BaseModel):
    """supervisor 的路由决策"""
    next: Literal["researcher", "analyst", "FINISH"] = Field(
        description="下一个执行的专家；任务已完成时填 FINISH"
    )

supervisor_llm = llm.with_structured_output(Route)

def supervisor_node(state: dict) -> dict:
    decision: Route = supervisor_llm.invoke(state["messages"])
    return {"next": decision.next}

# ---------- 3. 专家节点：调用对应 Agent 并把结果写回状态 ----------
def _run_expert(agent, name: str, state: dict) -> dict:
    result = agent.invoke({"messages": state["messages"]})
    reply = result["messages"][-1].content
    return {"messages": [HumanMessage(content=f"{name} 的反馈: {reply}")]}

def researcher_node(state: dict) -> dict:
    return _run_expert(research_agent, "researcher", state)

def analyst_node(state: dict) -> dict:
    return _run_expert(analyst_agent, "analyst", state)

# ---------- 4. StateGraph 编排 ----------
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]  # 追加式消息历史
    next: str                                # supervisor 的路由结果

def route_after_supervisor(state: AgentState) -> str:
    return END if state["next"] == "FINISH" else state["next"]

builder = StateGraph(AgentState)
builder.add_node("supervisor", supervisor_node)
builder.add_node("researcher", researcher_node)
builder.add_node("analyst", analyst_node)

builder.add_edge(START, "supervisor")
builder.add_conditional_edges("supervisor", route_after_supervisor)
builder.add_edge("researcher", "supervisor")
builder.add_edge("analyst", "supervisor")

graph = builder.compile()

# ---------- 5. 运行 ----------
final = graph.invoke({
    "messages": [HumanMessage(content="调研 AI 辅助医学影像的现状，并给出数据分析视角的结论")]
})
print(final["messages"][-1].content)
```

这种写法把"谁在什么时候干活"变成了**图结构**：循环、并行、人工介入（`interrupt`）都可以通过增删边来表达，这也是 LangGraph 官方 `langgraph-supervisor` 等编排库的底层原理。

## 最佳实践

### 1. 设计原则
- **模块化设计**：每个Agent职责明确
- **松耦合**：Agent间低耦合，高内聚
- **可扩展性**：易于添加新Agent
- **容错性**：单个Agent失败不影响整体

### 2. 通信优化
- **消息压缩**：减少消息大小
- **批量通信**：批量发送消息
- **异步通信**：使用异步通信提升性能
- **消息缓存**：缓存常用消息

### 3. 协调优化
- **负载均衡**：合理分配任务
- **优先级管理**：设置任务优先级
- **超时处理**：设置合理的超时时间
- **重试机制**：失败任务自动重试

## 常见问题

### 1. 通信问题
- **消息丢失**：添加消息确认机制
- **消息重复**：添加消息去重机制
- **通信延迟**：优化通信协议
- **通信安全**：加密通信内容

### 2. 协调问题
- **死锁**：设计避免死锁的机制
- **活锁**：添加随机性避免活锁
- **资源竞争**：合理分配资源
- **优先级反转**：避免优先级反转

### 3. 性能问题
- **响应慢**：优化Agent执行效率
- **吞吐量低**：增加并发Agent数量
- **资源浪费**：合理分配资源
- **扩展性差**：设计可扩展架构

## 下一步学习

- [通信框架](/agent/multi-agent/communication) - Agent间通信机制
- [协作模式](/agent/multi-agent/collaboration) - Agent协作模式
- [任务分解](/agent/multi-agent/task-decomposition) - 复杂任务分解策略
