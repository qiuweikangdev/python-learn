# 多Agent系统概述

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
# 安装必要的库
pip install langchain openai

# 设置环境变量
export OPENAI_API_KEY="your-openai-key"
```

### 2. 基础多Agent示例
```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from typing import Dict, List

# 创建研究员Agent
@tool
def research(topic: str) -> str:
    """研究指定主题"""
    return f"关于{topic}的研究结果：这是一个重要的研究领域..."

research_llm = ChatOpenAI(model="gpt-4o-mini")
research_tools = [research]

from langchain.prompts import ChatPromptTemplate
research_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个研究员，负责收集和分析信息。"),
    ("user", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

research_agent = create_openai_tools_agent(research_llm, research_tools, research_prompt)
research_executor = AgentExecutor(agent=research_agent, tools=research_tools)

# 创建分析师Agent
@tool
def analyze(data: str) -> str:
    """分析数据"""
    return f"分析结果：基于数据分析，发现以下趋势..."

analyst_llm = ChatOpenAI(model="gpt-4o-mini")
analyst_tools = [analyze]

analyst_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个分析师，负责分析数据并提供见解。"),
    ("user", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

analyst_agent = create_openai_tools_agent(analyst_llm, analyst_tools, analyst_prompt)
analyst_executor = AgentExecutor(agent=analyst_agent, tools=analyst_tools)

# 创建协调器
class Coordinator:
    def __init__(self):
        self.research_executor = research_executor
        self.analyst_executor = analyst_executor
    
    def coordinate(self, task: str) -> str:
        # 研究阶段
        research_result = self.research_executor.invoke({
            "input": f"研究: {task}"
        })
        
        # 分析阶段
        analyst_result = self.analyst_executor.invoke({
            "input": f"分析以下研究结果: {research_result['output']}"
        })
        
        return f"研究结果:\n{research_result['output']}\n\n分析结果:\n{analyst_result['output']}"

# 使用示例
coordinator = Coordinator()
result = coordinator.coordinate("人工智能在医疗领域的应用")
print(result)
```

### 3. 多Agent协作示例
```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from typing import Dict, List
import asyncio

# 创建不同角色的Agent
class AgentRole:
    RESEARCHER = "researcher"
    ANALYST = "analyst"
    WRITER = "writer"
    REVIEWER = "reviewer"

# Agent工厂
class AgentFactory:
    @staticmethod
    def create_agent(role: str) -> AgentExecutor:
        if role == AgentRole.RESEARCHER:
            return AgentFactory._create_researcher()
        elif role == AgentRole.ANALYST:
            return AgentFactory._create_analyst()
        elif role == AgentRole.WRITER:
            return AgentFactory._create_writer()
        elif role == AgentRole.REVIEWER:
            return AgentFactory._create_reviewer()
        else:
            raise ValueError(f"Unknown role: {role}")
    
    @staticmethod
    def _create_researcher() -> AgentExecutor:
        @tool
        def research(topic: str) -> str:
            """研究指定主题"""
            return f"研究结果: {topic}"
        
        llm = ChatOpenAI(model="gpt-4o-mini")
        prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个研究员，负责收集和分析信息。"),
            ("user", "{input}"),
            ("placeholder", "{agent_scratchpad}")
        ])
        agent = create_openai_tools_agent(llm, [research], prompt)
        return AgentExecutor(agent=agent, tools=[research])
    
    @staticmethod
    def _create_analyst() -> AgentExecutor:
        @tool
        def analyze(data: str) -> str:
            """分析数据"""
            return f"分析结果: {data}"
        
        llm = ChatOpenAI(model="gpt-4o-mini")
        prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个分析师，负责分析数据并提供见解。"),
            ("user", "{input}"),
            ("placeholder", "{agent_scratchpad}")
        ])
        agent = create_openai_tools_agent(llm, [analyze], prompt)
        return AgentExecutor(agent=agent, tools=[analyze])
    
    @staticmethod
    def _create_writer() -> AgentExecutor:
        @tool
        def write(content: str) -> str:
            """撰写内容"""
            return f"撰写内容: {content}"
        
        llm = ChatOpenAI(model="gpt-4o-mini")
        prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个作家，负责撰写高质量的内容。"),
            ("user", "{input}"),
            ("placeholder", "{agent_scratchpad}")
        ])
        agent = create_openai_tools_agent(llm, [write], prompt)
        return AgentExecutor(agent=agent, tools=[write])
    
    @staticmethod
    def _create_reviewer() -> AgentExecutor:
        @tool
        def review(content: str) -> str:
            """审查内容"""
            return f"审查结果: {content}"
        
        llm = ChatOpenAI(model="gpt-4o-mini")
        prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个审查员，负责审查内容的质量。"),
            ("user", "{input}"),
            ("placeholder", "{agent_scratchpad}")
        ])
        agent = create_openai_tools_agent(llm, [review], prompt)
        return AgentExecutor(agent=agent, tools=[review])

# 多Agent协作系统
class MultiAgentSystem:
    def __init__(self):
        self.agents: Dict[str, AgentExecutor] = {}
        self.results: Dict[str, str] = {}
    
    def add_agent(self, role: str, agent: AgentExecutor):
        self.agents[role] = agent
    
    def execute_task(self, task: str) -> str:
        # 研究阶段
        researcher = self.agents.get(AgentRole.RESEARCHER)
        if researcher:
            research_result = researcher.invoke({"input": f"研究: {task}"})
            self.results[AgentRole.RESEARCHER] = research_result['output']
        
        # 分析阶段
        analyst = self.agents.get(AgentRole.ANALYST)
        if analyst:
            analyst_result = analyst.invoke({
                "input": f"分析: {self.results.get(AgentRole.RESEARCHER, '')}"
            })
            self.results[AgentRole.ANALYST] = analyst_result['output']
        
        # 写作阶段
        writer = self.agents.get(AgentRole.WRITER)
        if writer:
            writer_result = writer.invoke({
                "input": f"基于以下内容撰写报告:\n{self.results.get(AgentRole.ANALYST, '')}"
            })
            self.results[AgentRole.WRITER] = writer_result['output']
        
        # 审查阶段
        reviewer = self.agents.get(AgentRole.REVIEWER)
        if reviewer:
            reviewer_result = reviewer.invoke({
                "input": f"审查以下报告:\n{self.results.get(AgentRole.WRITER, '')}"
            })
            self.results[AgentRole.REVIEWER] = reviewer_result['output']
        
        return self.results.get(AgentRole.REVIEWER, "任务完成")

# 使用示例
system = MultiAgentSystem()
system.add_agent(AgentRole.RESEARCHER, AgentFactory.create_agent(AgentRole.RESEARCHER))
system.add_agent(AgentRole.ANALYST, AgentFactory.create_agent(AgentRole.ANALYST))
system.add_agent(AgentRole.WRITER, AgentFactory.create_agent(AgentRole.WRITER))
system.add_agent(AgentRole.REVIEWER, AgentFactory.create_agent(AgentRole.REVIEWER))

result = system.execute_task("人工智能在医疗领域的应用")
print(result)
```

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