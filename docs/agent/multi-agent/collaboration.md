# 多Agent协作模式详解

## 概述

多Agent协作模式定义了多个Agent如何协同工作完成复杂任务。本章详细介绍各种协作模式的原理、实现和最佳实践。

## 协作模式分类

| 模式 | 特点 | 适用场景 |
|------|------|---------|
| **主从模式** | 一个主Agent协调多个从Agent | 任务明确、层次清晰 |
| **对等模式** | Agent平等协作 | 创新性任务 |
| **竞争模式** | 多个Agent竞争最佳方案 | 需要多样性 |
| **协作模式** | Agent互补协作 | 复杂综合任务 |

## 1. 主从模式

### 1.1 基础主从架构

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import uuid

@dataclass
class Task:
    """任务定义"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    description: str = ""
    status: str = "pending"  # pending/running/completed/failed
    assigned_to: Optional[str] = None
    result: Any = None
    dependencies: List[str] = field(default_factory=list)

class MasterAgent:
    """主Agent - 协调者"""
    
    def __init__(self, name: str):
        self.name = name
        self.workers: Dict[str, 'WorkerAgent'] = {}
        self.tasks: Dict[str, Task] = {}
        self.results: Dict[str, Any] = {}
    
    def register_worker(self, worker: 'WorkerAgent'):
        """注册工作Agent"""
        self.workers[worker.name] = worker
        print(f"[{self.name}] 注册工作Agent: {worker.name}")
    
    def create_task(self, description: str, dependencies: List[str] = None) -> Task:
        """创建任务"""
        task = Task(description=description, dependencies=dependencies or [])
        self.tasks[task.id] = task
        print(f"[{self.name}] 创建任务: {description}")
        return task
    
    def assign_task(self, task_id: str, worker_name: str):
        """分配任务"""
        if task_id not in self.tasks:
            raise ValueError(f"任务不存在: {task_id}")
        if worker_name not in self.workers:
            raise ValueError(f"工作Agent不存在: {worker_name}")
        
        task = self.tasks[task_id]
        task.assigned_to = worker_name
        task.status = "assigned"
        
        print(f"[{self.name}] 分配任务 '{task.description}' 给 {worker_name}")
    
    def execute_workflow(self, task_descriptions: List[str]) -> Dict[str, Any]:
        """执行工作流"""
        # 1. 创建任务
        tasks = [self.create_task(desc) for desc in task_descriptions]
        
        # 2. 分配任务（简单轮询）
        worker_names = list(self.workers.keys())
        for i, task in enumerate(tasks):
            worker_name = worker_names[i % len(worker_names)]
            self.assign_task(task.id, worker_name)
        
        # 3. 执行任务
        for task in tasks:
            if task.assigned_to:
                worker = self.workers[task.assigned_to]
                result = worker.execute(task)
                task.result = result
                task.status = "completed"
                self.results[task.id] = result
        
        return self.results

class WorkerAgent(ABC):
    """工作Agent基类"""
    
    def __init__(self, name: str):
        self.name = name
        self.skills: List[str] = []
    
    @abstractmethod
    def execute(self, task: Task) -> Any:
        """执行任务"""
        pass
    
    def can_handle(self, task: Task) -> bool:
        """判断是否能处理任务"""
        return True

class ResearchWorker(WorkerAgent):
    """研究工作Agent"""
    
    def __init__(self):
        super().__init__("研究员")
        self.skills = ["research", "analysis"]
    
    def execute(self, task: Task) -> Any:
        print(f"[{self.name}] 执行研究任务: {task.description}")
        # 模拟研究工作
        return {"type": "research", "findings": f"研究结果: {task.description}"}

class WriterWorker(WorkerAgent):
    """写作工作Agent"""
    
    def __init__(self):
        super().__init__("写作者")
        self.skills = ["writing", "summarization"]
    
    def execute(self, task: Task) -> Any:
        print(f"[{self.name}] 执行写作任务: {task.description}")
        # 模拟写作工作
        return {"type": "writing", "content": f"写作内容: {task.description}"}

# 使用示例
master = MasterAgent("协调者")

researcher = ResearchWorker()
writer = WriterWorker()

master.register_worker(researcher)
master.register_worker(writer)

# 执行工作流
results = master.execute_workflow([
    "研究AI最新发展",
    "撰写技术报告",
    "总结关键发现"
])

print("\n执行结果:")
for task_id, result in results.items():
    print(f"  {task_id}: {result}")
```

### 1.2 动态任务分配

```python
from typing import Dict, List, Any, Callable
from dataclasses import dataclass, field
import heapq

class DynamicMasterAgent:
    """动态主Agent - 智能任务分配"""
    
    def __init__(self, name: str):
        self.name = name
        self.workers: Dict[str, WorkerAgent] = {}
        self.task_queue: List[Task] = []  # 优先队列
        self.completed_tasks: Dict[str, Task] = {}
    
    def register_worker(self, worker: WorkerAgent):
        """注册工作Agent"""
        self.workers[worker.name] = worker
    
    def add_task(self, task: Task, priority: int = 0):
        """添加任务到队列"""
        heapq.heappush(self.task_queue, (priority, task))
    
    def find_best_worker(self, task: Task) -> Optional[WorkerAgent]:
        """找到最适合的工作Agent"""
        best_worker = None
        best_score = -1
        
        for worker in self.workers.values():
            # 计算匹配分数
            score = self._calculate_match_score(worker, task)
            if score > best_score:
                best_score = score
                best_worker = worker
        
        return best_worker
    
    def _calculate_match_score(self, worker: WorkerAgent, task: Task) -> float:
        """计算匹配分数"""
        # 简单的技能匹配
        score = 0.0
        
        # 基础分数
        score += 0.5
        
        # 技能匹配
        task_keywords = task.description.lower().split()
        for skill in worker.skills:
            if skill in task_keywords:
                score += 0.3
        
        return score
    
    def execute_dynamic(self):
        """动态执行任务"""
        while self.task_queue:
            # 获取最高优先级任务
            priority, task = heapq.heappop(self.task_queue)
            
            # 找到最佳工作Agent
            worker = self.find_best_worker(task)
            
            if worker:
                # 分配并执行任务
                task.assigned_to = worker.name
                task.status = "running"
                
                print(f"[{self.name}] 动态分配: '{task.description}' -> {worker.name}")
                
                result = worker.execute(task)
                task.result = result
                task.status = "completed"
                
                self.completed_tasks[task.id] = task
            else:
                print(f"[{self.name}] 无法为任务 '{task.description}' 找到合适的工作Agent")
```

## 2. 对等模式

### 2.1 平等协作

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
import uuid

@dataclass
class PeerMessage:
    """对等消息"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender: str = ""
    receiver: str = ""  # 空表示广播
    content: Any = None
    msg_type: str = "collaboration"  # collaboration/request/response
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

class PeerAgent:
    """对等Agent"""
    
    def __init__(self, name: str):
        self.name = name
        self.peers: Dict[str, 'PeerAgent'] = {}
        self.inbox: List[PeerMessage] = []
        self.knowledge: Dict[str, Any] = {}
    
    def connect_peer(self, peer: 'PeerAgent'):
        """连接对等Agent"""
        self.peers[peer.name] = peer
        peer.peers[self.name] = self
        print(f"[{self.name}] 与 {peer.name} 建立连接")
    
    def send(self, receiver: str, content: Any, msg_type: str = "collaboration"):
        """发送消息"""
        if receiver in self.peers:
            msg = PeerMessage(
                sender=self.name,
                receiver=receiver,
                content=content,
                msg_type=msg_type
            )
            self.peers[receiver].receive(msg)
    
    def broadcast(self, content: Any, msg_type: str = "collaboration"):
        """广播消息"""
        for peer_name in self.peers:
            self.send(peer_name, content, msg_type)
    
    def receive(self, message: PeerMessage):
        """接收消息"""
        self.inbox.append(message)
        self.process_message(message)
    
    def process_message(self, message: PeerMessage):
        """处理消息"""
        print(f"[{self.name}] 收到来自 {message.sender} 的消息: {message.content}")
        
        # 学习新知识
        if isinstance(message.content, dict):
            self.knowledge.update(message.content)
    
    def collaborate(self, task: str) -> Any:
        """协作完成任务"""
        # 向所有对等Agent请求帮助
        self.broadcast({"task": task, "request": "help"})
        
        # 收集建议
        suggestions = []
        for msg in self.inbox:
            if msg.msg_type == "response":
                suggestions.append(msg.content)
        
        # 综合建议
        return self.synthesize(suggestions)
    
    def synthesize(self, suggestions: List[Any]) -> Any:
        """综合建议"""
        # 简单综合逻辑
        return {"synthesized": suggestions}

# 使用示例
peer1 = PeerAgent("Agent1")
peer2 = PeerAgent("Agent2")
peer3 = PeerAgent("Agent3")

# 建立连接
peer1.connect_peer(peer2)
peer1.connect_peer(peer3)
peer2.connect_peer(peer3)

# 协作
result = peer1.collaborate("分析市场趋势")
print(f"\n协作结果: {result}")
```

## 3. 竞争模式

### 3.1 竞争求解

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
import uuid

@dataclass
class Solution:
    """解决方案"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agent_name: str = ""
    content: Any = None
    score: float = 0.0
    reasoning: str = ""

class CompetitiveAgent:
    """竞争Agent"""
    
    def __init__(self, name: str, llm=None):
        self.name = name
        self.llm = llm
    
    def solve(self, problem: str) -> Solution:
        """解决问题"""
        print(f"[{self.name}] 正在解决问题: {problem}")
        
        # 生成解决方案
        solution = self.generate_solution(problem)
        
        return Solution(
            agent_name=self.name,
            content=solution,
            reasoning=f"{self.name} 的推理过程"
        )
    
    def generate_solution(self, problem: str) -> Any:
        """生成解决方案（子类重写）"""
        return f"{self.name} 的解决方案: {problem}"

class CompetitionManager:
    """竞争管理器"""
    
    def __init__(self, judge_name: str = "裁判"):
        self.judge_name = judge_name
        self.agents: Dict[str, CompetitiveAgent] = {}
        self.solutions: List[Solution] = []
    
    def register_agent(self, agent: CompetitiveAgent):
        """注册竞争Agent"""
        self.agents[agent.name] = agent
    
    def run_competition(self, problem: str) -> Solution:
        """运行竞争"""
        print(f"\n{'='*50}")
        print(f"竞争开始: {problem}")
        print(f"{'='*50}\n")
        
        # 1. 收集所有解决方案
        solutions = []
        for agent in self.agents.values():
            solution = agent.solve(problem)
            solutions.append(solution)
        
        # 2. 评估解决方案
        evaluated_solutions = self.evaluate_solutions(solutions)
        
        # 3. 选择最佳方案
        best_solution = self.select_best(evaluated_solutions)
        
        print(f"\n{'='*50}")
        print(f"竞争结束，获胜者: {best_solution.agent_name}")
        print(f"{'='*50}\n")
        
        return best_solution
    
    def evaluate_solutions(self, solutions: List[Solution]) -> List[Solution]:
        """评估解决方案"""
        for solution in solutions:
            # 简单评估逻辑
            solution.score = self.calculate_score(solution)
            print(f"评估 {solution.agent_name} 的方案: 分数 {solution.score:.2f}")
        
        return solutions
    
    def calculate_score(self, solution: Solution) -> float:
        """计算分数"""
        # 简单的评分逻辑
        base_score = 0.7
        variation = hash(solution.content) % 30 / 100
        return base_score + variation
    
    def select_best(self, solutions: List[Solution]) -> Solution:
        """选择最佳方案"""
        return max(solutions, key=lambda s: s.score)

# 使用示例
competition = CompetitionManager()

# 注册竞争Agent
agent1 = CompetitiveAgent("方案A")
agent2 = CompetitiveAgent("方案B")
agent3 = CompetitiveAgent("方案C")

competition.register_agent(agent1)
competition.register_agent(agent2)
competition.register_agent(agent3)

# 运行竞争
best = competition.run_competition("设计一个推荐系统")

print(f"最佳方案: {best.content}")
print(f"分数: {best.score:.2f}")
```

## 4. 协作模式

### 4.1 角色协作

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from enum import Enum

class AgentRole(str, Enum):
    """Agent角色"""
    RESEARCHER = "researcher"    # 研究员
    ANALYST = "analyst"          # 分析师
    WRITER = "writer"            # 写作者
    REVIEWER = "reviewer"        # 审核者
    COORDINATOR = "coordinator"  # 协调者

@dataclass
class CollaborativeTask:
    """协作任务"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    description: str = ""
    required_roles: List[AgentRole] = field(default_factory=list)
    current_role: Optional[AgentRole] = None
    intermediate_results: Dict[str, Any] = field(default_factory=dict)
    final_result: Any = None

class RoleBasedAgent:
    """基于角色的Agent"""
    
    def __init__(self, name: str, role: AgentRole):
        self.name = name
        self.role = role
    
    def contribute(self, task: CollaborativeTask) -> Any:
        """根据角色贡献"""
        if self.role == AgentRole.RESEARCHER:
            return self.research(task)
        elif self.role == AgentRole.ANALYST:
            return self.analyze(task)
        elif self.role == AgentRole.WRITER:
            return self.write(task)
        elif self.role == AgentRole.REVIEWER:
            return self.review(task)
        elif self.role == AgentRole.COORDINATOR:
            return self.coordinate(task)
        
        return None
    
    def research(self, task: CollaborativeTask) -> Any:
        """研究"""
        print(f"[{self.name}] 进行研究: {task.description}")
        return {"research": f"研究结果: {task.description}"}
    
    def analyze(self, task: CollaborativeTask) -> Any:
        """分析"""
        print(f"[{self.name}] 进行分析")
        research_data = task.intermediate_results.get("research", {})
        return {"analysis": f"分析结果基于: {research_data}"}
    
    def write(self, task: CollaborativeTask) -> Any:
        """写作"""
        print(f"[{self.name}] 撰写报告")
        analysis = task.intermediate_results.get("analysis", {})
        return {"report": f"报告基于: {analysis}"}
    
    def review(self, task: CollaborativeTask) -> Any:
        """审核"""
        print(f"[{self.name}] 审核内容")
        report = task.intermediate_results.get("report", {})
        return {"review": "审核通过", "feedback": "内容质量良好"}
    
    def coordinate(self, task: CollaborativeTask) -> Any:
        """协调"""
        print(f"[{self.name}] 协调工作流程")
        return {"status": "协调完成"}

class CollaborativeWorkflow:
    """协作工作流"""
    
    def __init__(self):
        self.agents: Dict[AgentRole, List[RoleBasedAgent]] = {}
        self.workflow: List[AgentRole] = []
    
    def add_agent(self, agent: RoleBasedAgent):
        """添加Agent"""
        if agent.role not in self.agents:
            self.agents[agent.role] = []
        self.agents[agent.role].append(agent)
    
    def set_workflow(self, workflow: List[AgentRole]):
        """设置工作流"""
        self.workflow = workflow
    
    def execute(self, task: CollaborativeTask) -> Any:
        """执行协作工作流"""
        print(f"\n{'='*50}")
        print(f"开始协作: {task.description}")
        print(f"工作流: {' -> '.join([r.value for r in self.workflow])}")
        print(f"{'='*50}\n")
        
        for role in self.workflow:
            task.current_role = role
            
            # 获取该角色的Agent
            agents = self.agents.get(role, [])
            if not agents:
                print(f"警告: 没有 {role.value} 角色的Agent")
                continue
            
            # 执行贡献
            for agent in agents:
                result = agent.contribute(task)
                task.intermediate_results[role.value] = result
                print(f"  {role.value} 完成贡献")
        
        # 综合结果
        task.final_result = self.synthesize(task)
        
        print(f"\n{'='*50}")
        print(f"协作完成")
        print(f"{'='*50}\n")
        
        return task.final_result
    
    def synthesize(self, task: CollaborativeTask) -> Any:
        """综合结果"""
        return {
            "task": task.description,
            "results": task.intermediate_results,
            "status": "完成"
        }

# 使用示例
workflow = CollaborativeWorkflow()

# 添加不同角色的Agent
workflow.add_agent(RoleBasedAgent("研究员A", AgentRole.RESEARCHER))
workflow.add_agent(RoleBasedAgent("分析师B", AgentRole.ANALYST))
workflow.add_agent(RoleBasedAgent("写作者C", AgentRole.WRITER))
workflow.add_agent(RoleBasedAgent("审核者D", AgentRole.REVIEWER))

# 设置工作流
workflow.set_workflow([
    AgentRole.RESEARCHER,
    AgentRole.ANALYST,
    AgentRole.WRITER,
    AgentRole.REVIEWER
])

# 创建任务
task = CollaborativeTask(
    description="撰写AI发展趋势报告",
    required_roles=[
        AgentRole.RESEARCHER,
        AgentRole.ANALYST,
        AgentRole.WRITER,
        AgentRole.REVIEWER
    ]
)

# 执行协作
result = workflow.execute(task)

print(f"最终结果: {result}")
```

## 5. 协作模式对比

| 模式 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **主从模式** | 层次清晰、易于管理 | 主Agent是瓶颈 | 任务明确、流程固定 |
| **对等模式** | 灵活、无单点故障 | 协调复杂 | 创新性任务 |
| **竞争模式** | 多样性、质量高 | 资源消耗大 | 需要最优方案 |
| **协作模式** | 互补性强、质量高 | 协调成本高 | 复杂综合任务 |

## 最佳实践

### 1. 选择合适的协作模式

```python
def choose_collaboration_mode(task_type: str, requirements: dict) -> str:
    """选择协作模式"""
    
    if requirements.get("need_hierarchy"):
        return "主从模式"
    elif requirements.get("need_diversity"):
        return "竞争模式"
    elif requirements.get("need_complementary"):
        return "协作模式"
    else:
        return "对等模式"
```

### 2. 处理协作冲突

```python
class ConflictResolver:
    """冲突解决器"""
    
    def resolve(self, conflicting_results: List[Any]) -> Any:
        """解决冲突"""
        # 策略1: 投票
        # 策略2: 专家优先
        # 策略3: 综合评估
        
        # 简单实现: 选择第一个
        return conflicting_results[0] if conflicting_results else None
```

### 3. 监控协作过程

```python
class CollaborationMonitor:
    """协作监控器"""
    
    def __init__(self):
        self.events: List[Dict] = []
    
    def log_event(self, event_type: str, data: Dict):
        """记录事件"""
        self.events.append({
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
    
    def get_summary(self) -> Dict:
        """获取摘要"""
        return {
            "total_events": len(self.events),
            "event_types": list(set(e["type"] for e in self.events))
        }
```

## 总结

| 协作模式 | 核心特点 | 实现复杂度 | 推荐场景 |
|---------|---------|-----------|---------|
| 主从模式 | 层次协调 | 低 | 任务明确、流程固定 |
| 对等模式 | 平等协作 | 中 | 创新性、探索性任务 |
| 竞争模式 | 多样竞争 | 中 | 需要最优方案 |
| 协作模式 | 角色互补 | 高 | 复杂综合任务 |

## 下一步学习

- [任务分解策略](/agent/multi-agent/task-decomposition) - 学习任务分解方法
- [LangGraph工作流](/agent/langgraph/) - 使用LangGraph实现协作
- [多Agent通信](/agent/multi-agent/communication) - 深入学习通信机制
