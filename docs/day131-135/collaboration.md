# Agent协作模式

## 概述

Agent协作模式定义了多个Agent之间如何协同工作以完成复杂任务。本章将介绍常见的Agent协作模式和实现方法。

## 核心概念

### 1. 协作类型
Agent协作的主要类型：
- **主从协作**：一个主Agent协调多个从Agent
- **对等协作**：所有Agent地位平等
- **层次协作**：分层的协作结构
- **竞争协作**：Agent之间竞争完成任务

### 2. 任务分配
任务分配策略：
- **能力匹配**：根据Agent能力分配任务
- **负载均衡**：均衡分配任务负载
- **优先级分配**：根据优先级分配任务
- **动态分配**：根据运行时状态动态分配

### 3. 协调机制
协调机制包括：
- **集中式协调**：由协调器统一管理
- **分布式协调**：Agent之间自主协调
- **基于规则的协调**：通过规则约束协调
- **基于市场的协调**：通过市场机制协调

### 4. 冲突解决
冲突解决策略：
- **协商**：通过协商解决冲突
- **仲裁**：通过仲裁者裁决
- **投票**：通过投票决定
- **优先级**：通过优先级解决

## 协作模式

### 1. 主从模式（Master-Slave）
```python
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class Task:
    task_id: str
    description: str
    assigned_to: str = None
    status: str = "pending"
    result: Any = None

class MasterAgent:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.slaves: List['SlaveAgent'] = []
        self.tasks: List[Task] = []
    
    def add_slave(self, slave: 'SlaveAgent'):
        """添加从Agent"""
        self.slaves.append(slave)
    
    def create_task(self, task_id: str, description: str) -> Task:
        """创建任务"""
        task = Task(task_id=task_id, description=description)
        self.tasks.append(task)
        return task
    
    def assign_task(self, task: Task, slave: 'SlaveAgent'):
        """分配任务"""
        task.assigned_to = slave.agent_id
        task.status = "assigned"
        slave.execute_task(task)
    
    def collect_results(self) -> Dict[str, Any]:
        """收集结果"""
        results = {}
        for task in self.tasks:
            if task.status == "completed":
                results[task.task_id] = task.result
        return results

class SlaveAgent:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.tasks: List[Task] = []
    
    def execute_task(self, task: Task):
        """执行任务"""
        task.status = "running"
        # 模拟任务执行
        result = f"任务 {task.task_id} 的执行结果"
        task.result = result
        task.status = "completed"
        self.tasks.append(task)

# 使用示例
master = MasterAgent("master")
slave1 = SlaveAgent("slave1")
slave2 = SlaveAgent("slave2")

master.add_slave(slave1)
master.add_slave(slave2)

task1 = master.create_task("task1", "执行数据分析")
task2 = master.create_task("task2", "生成报告")

master.assign_task(task1, slave1)
master.assign_task(task2, slave2)

results = master.collect_results()
print(results)
```

### 2. 对等模式（Peer-to-Peer）
```python
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class PeerMessage:
    sender: str
    receiver: str
    content: Any
    message_type: str = "request"

class PeerAgent:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.peers: Dict[str, 'PeerAgent'] = {}
        self.capabilities: List[str] = []
    
    def add_peer(self, peer: 'PeerAgent'):
        """添加对等Agent"""
        self.peers[peer.agent_id] = peer
    
    def set_capabilities(self, capabilities: List[str]):
        """设置能力"""
        self.capabilities = capabilities
    
    def send_request(self, peer_id: str, request: Any) -> Any:
        """发送请求"""
        if peer_id in self.peers:
            peer = self.peers[peer_id]
            return peer.handle_request(self.agent_id, request)
        return None
    
    def handle_request(self, sender_id: str, request: Any) -> Any:
        """处理请求"""
        print(f"Agent {self.agent_id} handling request from {sender_id}")
        return f"处理结果: {request}"
    
    def find_capable_peer(self, capability: str) -> 'PeerAgent':
        """查找具有特定能力的对等Agent"""
        for peer in self.peers.values():
            if capability in peer.capabilities:
                return peer
        return None

# 使用示例
peer1 = PeerAgent("peer1")
peer2 = PeerAgent("peer2")
peer3 = PeerAgent("peer3")

peer1.add_peer(peer2)
peer1.add_peer(peer3)
peer2.add_peer(peer1)
peer2.add_peer(peer3)
peer3.add_peer(peer1)
peer3.add_peer(peer2)

peer1.set_capabilities(["数据分析"])
peer2.set_capabilities(["报告生成"])
peer3.set_capabilities(["数据可视化"])

# 查找具有特定能力的对等Agent
capable_peer = peer1.find_capable_peer("报告生成")
if capable_peer:
    result = peer1.send_request(capable_peer.agent_id, "生成月度报告")
    print(result)
```

### 3. 层次模式（Hierarchical）
```python
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class HierarchicalTask:
    task_id: str
    description: str
    level: int
    parent_id: str = None
    assigned_to: str = None
    status: str = "pending"
    result: Any = None

class HierarchicalAgent:
    def __init__(self, agent_id: str, level: int):
        self.agent_id = agent_id
        self.level = level
        self.children: List['HierarchicalAgent'] = []
        self.parent: 'HierarchicalAgent' = None
        self.tasks: List[HierarchicalTask] = []
    
    def add_child(self, child: 'HierarchicalAgent'):
        """添加子Agent"""
        child.parent = self
        self.children.append(child)
    
    def create_task(self, task_id: str, description: str) -> HierarchicalTask:
        """创建任务"""
        task = HierarchicalTask(
            task_id=task_id,
            description=description,
            level=self.level
        )
        self.tasks.append(task)
        return task
    
    def delegate_task(self, task: HierarchicalTask, child: 'HierarchicalAgent'):
        """委派任务"""
        task.parent_id = self.agent_id
        task.assigned_to = child.agent_id
        child.execute_task(task)
    
    def execute_task(self, task: HierarchicalTask):
        """执行任务"""
        task.status = "running"
        # 如果有子Agent，可以继续委派
        if self.children and task.level < self.level + 2:
            for child in self.children:
                child_task = child.create_task(
                    f"{task.task_id}_{child.agent_id}",
                    f"子任务: {task.description}"
                )
                self.delegate_task(child_task, child)
        else:
            # 执行任务
            result = f"任务 {task.task_id} 的执行结果"
            task.result = result
            task.status = "completed"
    
    def report_to_parent(self):
        """向父Agent报告"""
        if self.parent:
            completed_tasks = [t for t in self.tasks if t.status == "completed"]
            results = {t.task_id: t.result for t in completed_tasks}
            print(f"Agent {self.agent_id} reporting to {self.parent.agent_id}: {results}")

# 使用示例
root = HierarchicalAgent("root", 0)
manager1 = HierarchicalAgent("manager1", 1)
manager2 = HierarchicalAgent("manager2", 1)
worker1 = HierarchicalAgent("worker1", 2)
worker2 = HierarchicalAgent("worker2", 2)
worker3 = HierarchicalAgent("worker3", 2)

root.add_child(manager1)
root.add_child(manager2)
manager1.add_child(worker1)
manager1.add_child(worker2)
manager2.add_child(worker3)

task = root.create_task("task1", "完成项目开发")
root.execute_task(task)
```

### 4. 竞争模式（Competitive）
```python
from typing import List, Dict, Any
from dataclasses import dataclass
import random

@dataclass
class CompetitiveTask:
    task_id: str
    description: str
    competitors: List[str]
    winner: str = None
    result: Any = None

class CompetitiveAgent:
    def __init__(self, agent_id: str, skill_level: float = 0.5):
        self.agent_id = agent_id
        self.skill_level = skill_level
        self.tasks: List[CompetitiveTask] = []
    
    def compete(self, task: CompetitiveTask) -> float:
        """竞争执行任务"""
        # 模拟竞争，基于技能水平
        success_rate = self.skill_level * random.uniform(0.8, 1.2)
        return success_rate
    
    def execute_task(self, task: CompetitiveTask):
        """执行任务"""
        success_rate = self.compete(task)
        result = f"任务 {task.task_id} 的执行结果 (成功率: {success_rate:.2f})"
        return result, success_rate

class CompetitionManager:
    def __init__(self):
        self.agents: Dict[str, CompetitiveAgent] = {}
        self.tasks: List[CompetitiveTask] = []
    
    def register_agent(self, agent: CompetitiveAgent):
        """注册Agent"""
        self.agents[agent.agent_id] = agent
    
    def create_competition(self, task_id: str, description: str, competitor_ids: List[str]) -> CompetitiveTask:
        """创建竞争"""
        task = CompetitiveTask(
            task_id=task_id,
            description=description,
            competitors=competitor_ids
        )
        self.tasks.append(task)
        return task
    
    def run_competition(self, task: CompetitiveTask) -> str:
        """运行竞争"""
        results = {}
        for competitor_id in task.competitors:
            if competitor_id in self.agents:
                agent = self.agents[competitor_id]
                result, score = agent.execute_task(task)
                results[competitor_id] = (result, score)
        
        # 选择获胜者
        winner = max(results.items(), key=lambda x: x[1][1])
        task.winner = winner[0]
        task.result = winner[1][0]
        
        return task.winner

# 使用示例
manager = CompetitionManager()

agent1 = CompetitiveAgent("agent1", skill_level=0.8)
agent2 = CompetitiveAgent("agent2", skill_level=0.9)
agent3 = CompetitiveAgent("agent3", skill_level=0.7)

manager.register_agent(agent1)
manager.register_agent(agent2)
manager.register_agent(agent3)

task = manager.create_competition(
    "task1",
    "完成数据分析任务",
    ["agent1", "agent2", "agent3"]
)

winner = manager.run_competition(task)
print(f"获胜者: {winner}")
print(f"执行结果: {task.result}")
```

## 实践指南

### 1. 协作模式选择
- **主从模式**：适合任务明确、需要集中控制的场景
- **对等模式**：适合需要灵活协作、无中心控制的场景
- **层次模式**：适合大规模、多层次的任务分解
- **竞争模式**：需要激励机制、提高效率的场景

### 2. 任务分配策略
- **能力匹配**：根据Agent能力分配任务
- **负载均衡**：均衡分配任务负载
- **优先级分配**：根据优先级分配任务
- **动态分配**：根据运行时状态动态分配

### 3. 协调机制设计
- **明确职责**：明确每个Agent的职责
- **建立规则**：建立协作规则
- **解决冲突**：设计冲突解决机制
- **监控执行**：监控协作执行过程

## 最佳实践

### 1. 设计原则
- **模块化设计**：将Agent设计为模块化组件
- **松耦合**：Agent之间保持松耦合
- **高内聚**：Agent内部保持高内聚
- **可扩展性**：设计可扩展的协作架构

### 2. 性能优化
- **并行执行**：尽可能并行执行任务
- **资源管理**：合理管理资源
- **负载均衡**：均衡分配任务负载
- **缓存机制**：缓存中间结果

### 3. 可靠性保证
- **错误处理**：添加完善的错误处理
- **故障恢复**：设计故障恢复机制
- **监控告警**：监控系统状态并设置告警
- **日志记录**：记录协作日志

## 常见问题

### 1. 协作问题
- **职责不清**：明确Agent职责
- **沟通障碍**：优化沟通机制
- **任务冲突**：设计冲突解决机制

### 2. 性能问题
- **响应慢**：优化协作流程
- **资源浪费**：合理分配资源
- **扩展性差**：设计可扩展架构

### 3. 可靠性问题
- **单点故障**：添加冗余机制
- **数据不一致**：保证数据一致性
- **故障恢复**：设计故障恢复机制

## 下一步学习

- [任务分解](/day131-135/task-decomposition) - 复杂任务分解策略
- [Deep-Agent开发](/day136-140/) - 深度学习与Agent结合
- [Agent平台与服务](/day141-145/) - Agent系统的部署和运维