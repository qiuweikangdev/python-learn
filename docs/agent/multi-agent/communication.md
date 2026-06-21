# 多Agent通信机制详解

## 概述

多Agent通信是多Agent系统的基础，定义了Agent之间如何交换信息、协调行动。本章详细介绍各种通信机制的原理、实现和最佳实践。

## 通信模式分类

| 模式 | 特点 | 适用场景 |
|------|------|---------|
| **消息传递** | 直接点对点通信 | 简单协作 |
| **共享内存** | 通过共享空间交换数据 | 紧耦合协作 |
| **事件驱动** | 基于事件的异步通信 | 松耦合协作 |
| **黑板系统** | 共享知识库 | 复杂推理 |

## 1. 消息传递机制

### 1.1 基础消息传递

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import uuid

@dataclass
class Message:
    """消息定义"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender: str = ""           # 发送者
    receiver: str = ""         # 接收者
    content: Any = None        # 消息内容
    msg_type: str = "text"     # 消息类型
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Dict = field(default_factory=dict)

class MessageBus:
    """消息总线 - 管理Agent间通信"""
    
    def __init__(self):
        self.agents: Dict[str, 'BaseAgent'] = {}
        self.message_history: List[Message] = []
        self.subscribers: Dict[str, List[str]] = {}  # 事件 -> Agent列表
    
    def register_agent(self, agent: 'BaseAgent'):
        """注册Agent"""
        self.agents[agent.name] = agent
        print(f"Agent '{agent.name}' 已注册")
    
    def send_message(self, message: Message):
        """发送消息"""
        self.message_history.append(message)
        
        if message.receiver in self.agents:
            self.agents[message.receiver].receive_message(message)
        else:
            print(f"接收者 '{message.receiver}' 不存在")
    
    def broadcast(self, sender: str, content: Any, msg_type: str = "broadcast"):
        """广播消息"""
        for name, agent in self.agents.items():
            if name != sender:
                msg = Message(
                    sender=sender,
                    receiver=name,
                    content=content,
                    msg_type=msg_type
                )
                self.send_message(msg)
    
    def subscribe(self, agent_name: str, event_type: str):
        """订阅事件"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(agent_name)
    
    def publish_event(self, sender: str, event_type: str, data: Any):
        """发布事件"""
        if event_type in self.subscribers:
            for receiver in self.subscribers[event_type]:
                msg = Message(
                    sender=sender,
                    receiver=receiver,
                    content=data,
                    msg_type=event_type
                )
                self.send_message(msg)

class BaseAgent:
    """基础Agent类"""
    
    def __init__(self, name: str, message_bus: MessageBus):
        self.name = name
        self.message_bus = message_bus
        self.inbox: List[Message] = []
        self.message_bus.register_agent(self)
    
    def send(self, receiver: str, content: Any, msg_type: str = "text"):
        """发送消息"""
        msg = Message(
            sender=self.name,
            receiver=receiver,
            content=content,
            msg_type=msg_type
        )
        self.message_bus.send_message(msg)
    
    def receive_message(self, message: Message):
        """接收消息"""
        self.inbox.append(message)
        self.process_message(message)
    
    def process_message(self, message: Message):
        """处理消息（子类重写）"""
        print(f"[{self.name}] 收到来自 {message.sender} 的消息: {message.content}")

# 使用示例
bus = MessageBus()

agent1 = BaseAgent("Agent1", bus)
agent2 = BaseAgent("Agent2", bus)
agent3 = BaseAgent("Agent3", bus)

# 点对点通信
agent1.send("Agent2", "你好，Agent2!")

# 广播
bus.broadcast("Agent1", "大家好！")

# 订阅/发布
bus.subscribe("Agent2", "task_complete")
bus.subscribe("Agent3", "task_complete")
bus.publish_event("Agent1", "task_complete", {"task": "数据处理", "status": "成功"})
```

### 1.2 异步消息传递

```python
import asyncio
from typing import Dict, List, Any, Callable, Coroutine
from dataclasses import dataclass, field
from datetime import datetime
import uuid

@dataclass
class AsyncMessage:
    """异步消息"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender: str = ""
    receiver: str = ""
    content: Any = None
    msg_type: str = "text"
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    reply_to: Optional[str] = None  # 回复的消息ID
    correlation_id: Optional[str] = None  # 关联ID

class AsyncMessageBus:
    """异步消息总线"""
    
    def __init__(self):
        self.agents: Dict[str, 'AsyncAgent'] = {}
        self.message_queues: Dict[str, asyncio.Queue] = {}
        self.handlers: Dict[str, Dict[str, Callable]] = {}  # agent -> type -> handler
    
    async def register_agent(self, agent: 'AsyncAgent'):
        """注册Agent"""
        self.agents[agent.name] = agent
        self.message_queues[agent.name] = asyncio.Queue()
        self.handlers[agent.name] = {}
        print(f"Agent '{agent.name}' 已注册")
    
    async def send_message(self, message: AsyncMessage):
        """发送消息"""
        if message.receiver in self.message_queues:
            await self.message_queues[message.receiver].put(message)
            
            # 触发处理器
            if message.receiver in self.handlers:
                handler = self.handlers[message.receiver].get(message.msg_type)
                if handler:
                    await handler(message)
    
    async def request_reply(self, sender: str, receiver: str, 
                           content: Any, timeout: float = 30.0) -> Any:
        """请求-回复模式"""
        correlation_id = str(uuid.uuid4())
        
        # 发送请求
        request = AsyncMessage(
            sender=sender,
            receiver=receiver,
            content=content,
            msg_type="request",
            correlation_id=correlation_id
        )
        await self.send_message(request)
        
        # 等待回复
        start_time = datetime.now()
        while (datetime.now() - start_time).total_seconds() < timeout:
            if not self.message_queues[sender].empty():
                msg = await self.message_queues[sender].get()
                if msg.correlation_id == correlation_id and msg.msg_type == "reply":
                    return msg.content
            await asyncio.sleep(0.1)
        
        raise TimeoutError("请求超时")

class AsyncAgent:
    """异步Agent"""
    
    def __init__(self, name: str, bus: AsyncMessageBus):
        self.name = name
        self.bus = bus
    
    async def initialize(self):
        """初始化"""
        await self.bus.register_agent(self)
    
    async def send(self, receiver: str, content: Any, msg_type: str = "text"):
        """发送消息"""
        msg = AsyncMessage(
            sender=self.name,
            receiver=receiver,
            content=content,
            msg_type=msg_type
        )
        await self.bus.send_message(msg)
    
    async def request(self, receiver: str, content: Any) -> Any:
        """发送请求并等待回复"""
        return await self.bus.request_reply(self.name, receiver, content)
    
    async def handle_request(self, message: AsyncMessage):
        """处理请求（子类重写）"""
        pass

# 使用示例
async def main():
    bus = AsyncMessageBus()
    
    agent1 = AsyncAgent("Agent1", bus)
    agent2 = AsyncAgent("Agent2", bus)
    
    await agent1.initialize()
    await agent2.initialize()
    
    # 异步通信
    await agent1.send("Agent2", "你好！")
    
    # 请求-回复
    response = await agent1.request("Agent2", "请处理这个任务")
    print(f"收到回复: {response}")

# asyncio.run(main())
```

## 2. 共享内存机制

### 2.1 基础共享内存

```python
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import threading
import json

class SharedMemory:
    """共享内存 - 线程安全的数据共享"""
    
    def __init__(self):
        self._data: Dict[str, Any] = {}
        self._locks: Dict[str, threading.RLock] = {}
        self._global_lock = threading.RLock()
        self._listeners: Dict[str, List[callable]] = {}
    
    def set(self, key: str, value: Any, agent_name: str = "system"):
        """设置值"""
        with self._global_lock:
            if key not in self._locks:
                self._locks[key] = threading.RLock()
        
        with self._locks[key]:
            old_value = self._data.get(key)
            self._data[key] = {
                "value": value,
                "updated_by": agent_name,
                "updated_at": datetime.now().isoformat()
            }
            
            # 触发监听器
            self._notify_listeners(key, old_value, value)
    
    def get(self, key: str) -> Optional[Any]:
        """获取值"""
        if key in self._data:
            return self._data[key]["value"]
        return None
    
    def get_metadata(self, key: str) -> Optional[Dict]:
        """获取元数据"""
        return self._data.get(key)
    
    def delete(self, key: str):
        """删除键"""
        with self._global_lock:
            if key in self._data:
                del self._data[key]
            if key in self._locks:
                del self._locks[key]
    
    def keys(self) -> list:
        """获取所有键"""
        return list(self._data.keys())
    
    def subscribe(self, key: str, callback: callable):
        """订阅键的变化"""
        if key not in self._listeners:
            self._listeners[key] = []
        self._listeners[key].append(callback)
    
    def _notify_listeners(self, key: str, old_value: Any, new_value: Any):
        """通知监听器"""
        if key in self._listeners:
            for callback in self._listeners[key]:
                try:
                    callback(key, old_value, new_value)
                except Exception as e:
                    print(f"监听器错误: {e}")
    
    def to_dict(self) -> Dict:
        """导出为字典"""
        return {k: v["value"] for k, v in self._data.items()}
    
    def load_dict(self, data: Dict, agent_name: str = "system"):
        """从字典加载"""
        for key, value in data.items():
            self.set(key, value, agent_name)

class SharedMemoryAgent:
    """使用共享内存的Agent"""
    
    def __init__(self, name: str, shared_memory: SharedMemory):
        self.name = name
        self.memory = shared_memory
    
    def write(self, key: str, value: Any):
        """写入共享内存"""
        self.memory.set(key, value, self.name)
        print(f"[{self.name}] 写入: {key} = {value}")
    
    def read(self, key: str) -> Optional[Any]:
        """读取共享内存"""
        value = self.memory.get(key)
        print(f"[{self.name}] 读取: {key} = {value}")
        return value
    
    def watch(self, key: str, callback: callable):
        """监视键的变化"""
        self.memory.subscribe(key, callback)
        print(f"[{self.name}] 开始监视: {key}")

# 使用示例
shared_mem = SharedMemory()

agent1 = SharedMemoryAgent("Agent1", shared_mem)
agent2 = SharedMemoryAgent("Agent2", shared_mem)

# Agent2监视数据变化
def on_data_change(key, old_value, new_value):
    print(f"[Agent2] 数据变化: {key} 从 {old_value} 变为 {new_value}")

agent2.watch("task_status", on_data_change)

# Agent1写入数据
agent1.write("task_status", "处理中")
agent1.write("task_result", {"status": "成功", "data": [1, 2, 3]})

# Agent2读取数据
status = agent2.read("task_status")
result = agent2.read("task_result")
```

### 2.2 向量共享内存

```python
from typing import Dict, List, Any, Optional
import numpy as np

class VectorSharedMemory:
    """向量共享内存 - 支持语义搜索的共享内存"""
    
    def __init__(self):
        self.entries: Dict[str, Dict] = {}
        self.embeddings: Dict[str, np.ndarray] = {}
    
    def store(self, key: str, content: str, embedding: np.ndarray, 
              metadata: Dict = None, agent_name: str = "system"):
        """存储带向量的数据"""
        self.entries[key] = {
            "content": content,
            "metadata": metadata or {},
            "stored_by": agent_name,
            "timestamp": datetime.now().isoformat()
        }
        self.embeddings[key] = embedding
    
    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Dict]:
        """语义搜索"""
        if not self.embeddings:
            return []
        
        # 计算相似度
        similarities = []
        for key, emb in self.embeddings.items():
            similarity = np.dot(query_embedding, emb) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(emb)
            )
            similarities.append((key, similarity))
        
        # 排序
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # 返回top_k
        results = []
        for key, score in similarities[:top_k]:
            entry = self.entries[key]
            results.append({
                "key": key,
                "content": entry["content"],
                "metadata": entry["metadata"],
                "score": float(score)
            })
        
        return results
    
    def get(self, key: str) -> Optional[Dict]:
        """获取数据"""
        return self.entries.get(key)
```

## 3. 事件驱动机制

### 3.1 事件总线

```python
from typing import Dict, List, Any, Callable
from dataclasses import dataclass, field
from datetime import datetime
import uuid
import asyncio

@dataclass
class Event:
    """事件定义"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: str = ""             # 事件类型
    source: str = ""           # 事件源
    data: Any = None           # 事件数据
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

class EventBus:
    """事件总线"""
    
    def __init__(self):
        self.subscribers: Dict[str, List[Dict]] = {}  # eventType -> [{agent, handler}]
        self.event_history: List[Event] = []
    
    def subscribe(self, event_type: str, agent_name: str, handler: Callable):
        """订阅事件"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        
        self.subscribers[event_type].append({
            "agent": agent_name,
            "handler": handler
        })
        print(f"[{agent_name}] 订阅事件: {event_type}")
    
    def unsubscribe(self, event_type: str, agent_name: str):
        """取消订阅"""
        if event_type in self.subscribers:
            self.subscribers[event_type] = [
                s for s in self.subscribers[event_type]
                if s["agent"] != agent_name
            ]
    
    def publish(self, event: Event):
        """发布事件"""
        self.event_history.append(event)
        print(f"[EventBus] 发布事件: {event.type} from {event.source}")
        
        if event.type in self.subscribers:
            for subscriber in self.subscribers[event.type]:
                try:
                    subscriber["handler"](event)
                except Exception as e:
                    print(f"处理事件错误: {e}")
    
    def get_history(self, event_type: str = None, limit: int = 100) -> List[Event]:
        """获取事件历史"""
        if event_type:
            events = [e for e in self.event_history if e.type == event_type]
        else:
            events = self.event_history
        return events[-limit:]

class EventDrivenAgent:
    """事件驱动Agent"""
    
    def __init__(self, name: str, event_bus: EventBus):
        self.name = name
        self.event_bus = event_bus
    
    def subscribe(self, event_type: str, handler: Callable):
        """订阅事件"""
        self.event_bus.subscribe(event_type, self.name, handler)
    
    def publish(self, event_type: str, data: Any):
        """发布事件"""
        event = Event(
            type=event_type,
            source=self.name,
            data=data
        )
        self.event_bus.publish(event)

# 使用示例
event_bus = EventBus()

# 创建Agent
agent1 = EventDrivenAgent("Agent1", event_bus)
agent2 = EventDrivenAgent("Agent2", event_bus)
agent3 = EventDrivenAgent("Agent3", event_bus)

# Agent2订阅任务完成事件
def on_task_complete(event: Event):
    print(f"[Agent2] 收到任务完成事件: {event.data}")

agent2.subscribe("task_complete", on_task_complete)

# Agent3也订阅任务完成事件
def on_task_complete_v2(event: Event):
    print(f"[Agent3] 任务完成，准备下一步: {event.data}")

agent3.subscribe("task_complete", on_task_complete_v2)

# Agent1发布事件
agent1.publish("task_complete", {"task": "数据处理", "result": "成功"})
```

### 3.2 异步事件总线

```python
import asyncio
from typing import Dict, List, Any, Callable, Coroutine
from dataclasses import dataclass, field
from datetime import datetime
import uuid

class AsyncEventBus:
    """异步事件总线"""
    
    def __init__(self):
        self.subscribers: Dict[str, List[Dict]] = {}
        self.event_queue: asyncio.Queue = asyncio.Queue()
        self.running = False
    
    def subscribe(self, event_type: str, agent_name: str, 
                  handler: Callable[..., Coroutine]):
        """订阅事件"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        
        self.subscribers[event_type].append({
            "agent": agent_name,
            "handler": handler
        })
    
    async def publish(self, event: Event):
        """发布事件"""
        await self.event_queue.put(event)
    
    async def start(self):
        """启动事件处理循环"""
        self.running = True
        while self.running:
            try:
                event = await asyncio.wait_for(
                    self.event_queue.get(), 
                    timeout=1.0
                )
                await self._process_event(event)
            except asyncio.TimeoutError:
                continue
    
    async def _process_event(self, event: Event):
        """处理事件"""
        if event.type in self.subscribers:
            tasks = []
            for subscriber in self.subscribers[event.type]:
                task = asyncio.create_task(
                    subscriber["handler"](event)
                )
                tasks.append(task)
            
            await asyncio.gather(*tasks, return_exceptions=True)
    
    def stop(self):
        """停止事件处理"""
        self.running = False
```

## 4. 黑板系统

### 4.1 基础黑板系统

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import uuid

@dataclass
class BlackboardEntry:
    """黑板条目"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    key: str = ""
    value: Any = None
    source: str = ""
    confidence: float = 1.0  # 置信度
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    dependencies: List[str] = field(default_factory=list)  # 依赖的条目ID

class Blackboard:
    """黑板系统 - 共享知识库"""
    
    def __init__(self):
        self.entries: Dict[str, List[BlackboardEntry]] = {}  # key -> entries
        self.experts: Dict[str, 'ExpertAgent'] = {}
        self.goal: str = ""
        self.solved = False
    
    def set_goal(self, goal: str):
        """设置目标"""
        self.goal = goal
        self.solved = False
        print(f"[Blackboard] 目标: {goal}")
    
    def post(self, key: str, value: Any, source: str, 
             confidence: float = 1.0, dependencies: List[str] = None):
        """发布到黑板"""
        entry = BlackboardEntry(
            key=key,
            value=value,
            source=source,
            confidence=confidence,
            dependencies=dependencies or []
        )
        
        if key not in self.entries:
            self.entries[key] = []
        self.entries[key].append(entry)
        
        print(f"[Blackboard] {source} 发布: {key} = {value} (置信度: {confidence})")
        
        # 通知专家
        self._notify_experts(key, entry)
    
    def read(self, key: str, latest: bool = True) -> Optional[Any]:
        """读取黑板"""
        if key not in self.entries:
            return None
        
        if latest:
            return self.entries[key][-1].value
        return [e.value for e in self.entries[key]]
    
    def read_entry(self, key: str) -> Optional[BlackboardEntry]:
        """读取条目（含元数据）"""
        if key not in self.entries:
            return None
        return self.entries[key][-1]
    
    def register_expert(self, expert: 'ExpertAgent'):
        """注册专家"""
        self.experts[expert.name] = expert
        print(f"[Blackboard] 专家 '{expert.name}' 已注册")
    
    def _notify_experts(self, key: str, entry: BlackboardEntry):
        """通知相关专家"""
        for expert in self.experts.values():
            if expert.can_contribute(key, entry):
                expert.on_blackboard_update(key, entry)
    
    def mark_solved(self):
        """标记为已解决"""
        self.solved = True
        print(f"[Blackboard] 目标已达成: {self.goal}")
    
    def get_state(self) -> Dict:
        """获取黑板状态"""
        return {
            "goal": self.goal,
            "solved": self.solved,
            "entries": {k: len(v) for k, v in self.entries.items()},
            "experts": list(self.experts.keys())
        }

class ExpertAgent:
    """专家Agent - 参与黑板推理"""
    
    def __init__(self, name: str, blackboard: Blackboard):
        self.name = name
        self.blackboard = blackboard
        self.expertise: List[str] = []  # 专长领域
        blackboard.register_expert(self)
    
    def can_contribute(self, key: str, entry: BlackboardEntry) -> bool:
        """判断是否能贡献"""
        return key in self.expertise
    
    def on_blackboard_update(self, key: str, entry: BlackboardEntry):
        """黑板更新时调用"""
        print(f"[{self.name}] 检测到黑板更新: {key}")
        self.contribute()
    
    def contribute(self):
        """贡献到黑板（子类重写）"""
        pass
    
    def post(self, key: str, value: Any, confidence: float = 1.0, 
             dependencies: List[str] = None):
        """发布到黑板"""
        self.blackboard.post(key, value, self.name, confidence, dependencies)

# 使用示例
blackboard = Blackboard()

class DataExpert(ExpertAgent):
    """数据专家"""
    def __init__(self, blackboard):
        super().__init__("数据专家", blackboard)
        self.expertise = ["raw_data", "data_quality"]
    
    def contribute(self):
        raw_data = self.blackboard.read("raw_data")
        if raw_data:
            # 分析数据质量
            quality = "良好" if len(str(raw_data)) > 10 else "需改进"
            self.post("data_quality", quality, 0.9)

class AnalysisExpert(ExpertAgent):
    """分析专家"""
    def __init__(self, blackboard):
        super().__init__("分析专家", blackboard)
        self.expertise = ["data_quality", "analysis_result"]
    
    def contribute(self):
        quality = self.blackboard.read("data_quality")
        if quality == "良好":
            self.post("analysis_result", "数据可用", 0.95, ["data_quality"])

# 设置目标
blackboard.set_goal("分析数据质量")

# 创建专家
data_expert = DataExpert(blackboard)
analysis_expert = AnalysisExpert(blackboard)

# 发布初始数据
blackboard.post("raw_data", {"values": [1, 2, 3, 4, 5]}, "system")
```

## 5. 通信协议设计

### 5.1 标准协议

```python
from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class MessageType(str, Enum):
    """消息类型"""
    REQUEST = "request"
    RESPONSE = "response"
    NOTIFICATION = "notification"
    ERROR = "error"
    HEARTBEAT = "heartbeat"

class Priority(str, Enum):
    """优先级"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class AgentMessage(BaseModel):
    """标准Agent消息协议"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: MessageType = MessageType.NOTIFICATION
    sender: str
    receiver: str
    action: str = ""           # 请求的动作
    payload: Dict[str, Any] = {}
    priority: Priority = Priority.NORMAL
    correlation_id: Optional[str] = None  # 关联ID
    reply_to: Optional[str] = None        # 回复地址
    ttl: int = 300             # 生存时间（秒）
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class ProtocolHandler:
    """协议处理器"""
    
    def __init__(self):
        self.action_handlers: Dict[str, Callable] = {}
    
    def register_action(self, action: str, handler: Callable):
        """注册动作处理器"""
        self.action_handlers[action] = handler
    
    async def handle_message(self, message: AgentMessage) -> Optional[AgentMessage]:
        """处理消息"""
        if message.type == MessageType.REQUEST:
            return await self._handle_request(message)
        elif message.type == MessageType.RESPONSE:
            return await self._handle_response(message)
        elif message.type == MessageType.NOTIFICATION:
            return await self._handle_notification(message)
        elif message.type == MessageType.ERROR:
            return await self._handle_error(message)
        return None
    
    async def _handle_request(self, message: AgentMessage) -> AgentMessage:
        """处理请求"""
        if message.action in self.action_handlers:
            try:
                result = await self.action_handlers[message.action](message.payload)
                return AgentMessage(
                    type=MessageType.RESPONSE,
                    sender=message.receiver,
                    receiver=message.sender,
                    payload={"result": result},
                    correlation_id=message.id
                )
            except Exception as e:
                return AgentMessage(
                    type=MessageType.ERROR,
                    sender=message.receiver,
                    receiver=message.sender,
                    payload={"error": str(e)},
                    correlation_id=message.id
                )
        
        return AgentMessage(
            type=MessageType.ERROR,
            sender=message.receiver,
            receiver=message.sender,
            payload={"error": f"未知动作: {message.action}"},
            correlation_id=message.id
        )
```

## 最佳实践

### 1. 通信模式选择

| 场景 | 推荐模式 | 理由 |
|------|---------|------|
| 简单协作 | 消息传递 | 实现简单，延迟低 |
| 紧耦合协作 | 共享内存 | 数据一致性好 |
| 松耦合协作 | 事件驱动 | 解耦，易扩展 |
| 复杂推理 | 黑板系统 | 支持多专家协作 |

### 2. 错误处理

```python
class RobustMessageBus:
    """健壮的消息总线"""
    
    def __init__(self, max_retries: int = 3):
        self.max_retries = max_retries
    
    async def send_with_retry(self, message: Message) -> bool:
        """带重试的发送"""
        for attempt in range(self.max_retries):
            try:
                await self.send_message(message)
                return True
            except Exception as e:
                print(f"发送失败 (尝试 {attempt + 1}): {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # 指数退避
        
        return False
```

### 3. 性能优化

```python
# 批量消息处理
async def process_message_batch(messages: List[Message]):
    """批量处理消息"""
    tasks = [process_message(msg) for msg in messages]
    await asyncio.gather(*tasks)

# 消息压缩
import zlib

def compress_message(message: bytes) -> bytes:
    """压缩消息"""
    return zlib.compress(message)

def decompress_message(data: bytes) -> bytes:
    """解压消息"""
    return zlib.decompress(data)
```

## 总结

| 通信机制 | 优点 | 缺点 | 适用场景 |
|---------|------|------|---------|
| **消息传递** | 简单、低延迟 | 紧耦合 | 简单协作 |
| **共享内存** | 数据一致性 | 线程安全复杂 | 紧耦合协作 |
| **事件驱动** | 解耦、易扩展 | 复杂度高 | 松耦合协作 |
| **黑板系统** | 支持复杂推理 | 实现复杂 | 多专家系统 |

## 下一步学习

- [多Agent协作模式](/agent/multi-agent/collaboration) - 学习协作策略
- [任务分解](/agent/multi-agent/task-decomposition) - 学习任务分解方法
- [LangGraph工作流](/agent/langgraph/) - 使用LangGraph实现多Agent
