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

## 多Agent协作组织模式详解

### 组织模式概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    多Agent组织模式                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  层次化组织  │  │  平面化组织  │  │  角色化组织  │            │
│  │ (树形结构)  │  │ (对等关系)  │  │ (角色分工)  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  市场化组织  │  │  流水线组织  │  │  网络化组织  │            │
│  │ (竞争机制)  │  │ (顺序执行)  │  │ (动态连接)  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1. 层次化组织（树形结构）

**特点**：Agent按层级组织，上层Agent管理下层Agent

```
层次化组织结构：

                    ┌─────────────┐
                    │   总监Agent  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
    │ 经理Agent A │ │ 经理Agent B │ │ 经理Agent C │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
    ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
    │ 员工Agent1 │ │ 员工Agent2 │ │ 员工Agent3 │
    └─────────────┘ └─────────────┘ └─────────────┘
```

**代码示例**：

```python
from typing import List, Dict, Any
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class Task:
    """任务"""
    task_id: str
    description: str
    priority: int = 0
    assigned_to: str = None
    status: str = "pending"

class HierarchicalAgent(ABC):
    """层次化Agent基类"""
    
    def __init__(self, agent_id: str, role: str):
        self.agent_id = agent_id
        self.role = role
        self.subordinates: List['HierarchicalAgent'] = []
        self.tasks: List[Task] = []
    
    def add_subordinate(self, agent: 'HierarchicalAgent'):
        """添加下属"""
        self.subordinates.append(agent)
    
    @abstractmethod
    def execute_task(self, task: Task) -> Any:
        """执行任务"""
        pass
    
    def delegate_task(self, task: Task, subordinate: 'HierarchicalAgent'):
        """委派任务给下属"""
        task.assigned_to = subordinate.agent_id
        subordinate.tasks.append(task)
        print(f"[{self.agent_id}] 委派任务 {task.task_id} 给 {subordinate.agent_id}")

class DirectorAgent(HierarchicalAgent):
    """总监Agent"""
    
    def __init__(self, agent_id: str):
        super().__init__(agent_id, "director")
    
    def execute_task(self, task: Task) -> Any:
        """执行任务：分解并委派"""
        print(f"[{self.agent_id}] 分析任务: {task.description}")
        
        # 分解任务
        subtasks = self._decompose_task(task)
        
        # 分配给下属经理
        for i, subtask in enumerate(subtasks):
            if i < len(self.subordinates):
                self.delegate_task(subtask, self.subordinates[i])
        
        return {"status": "delegated", "subtasks": len(subtasks)}
    
    def _decompose_task(self, task: Task) -> List[Task]:
        """分解任务"""
        # 模拟任务分解
        return [
            Task(f"{task.task_id}_1", "需求分析", priority=1),
            Task(f"{task.task_id}_2", "系统设计", priority=2),
            Task(f"{task.task_id}_3", "代码实现", priority=3)
        ]

class ManagerAgent(HierarchicalAgent):
    """经理Agent"""
    
    def __init__(self, agent_id: str):
        super().__init__(agent_id, "manager")
    
    def execute_task(self, task: Task) -> Any:
        """执行任务：分配给员工"""
        print(f"[{self.agent_id}] 处理任务: {task.description}")
        
        if self.subordinates:
            # 分配给员工
            self.delegate_task(task, self.subordinates[0])
            return {"status": "assigned"}
        else:
            # 自己执行
            return {"status": "completed", "result": f"完成{task.description}"}

class EmployeeAgent(HierarchicalAgent):
    """员工Agent"""
    
    def __init__(self, agent_id: str):
        super().__init__(agent_id, "employee")
    
    def execute_task(self, task: Task) -> Any:
        """执行任务"""
        print(f"[{self.agent_id}] 执行任务: {task.description}")
        task.status = "completed"
        return {"status": "completed", "result": f"完成{task.description}"}

# 使用示例
def demo_hierarchical_organization():
    """演示层次化组织"""
    
    # 创建Agent
    director = DirectorAgent("director_001")
    manager_a = ManagerAgent("manager_001")
    manager_b = ManagerAgent("manager_002")
    employee_1 = EmployeeAgent("employee_001")
    employee_2 = EmployeeAgent("employee_002")
    
    # 建立层级关系
    director.add_subordinate(manager_a)
    director.add_subordinate(manager_b)
    manager_a.add_subordinate(employee_1)
    manager_b.add_subordinate(employee_2)
    
    # 执行任务
    task = Task("task_001", "开发电商网站")
    result = director.execute_task(task)
    print(f"结果: {result}")

# 运行示例
# demo_hierarchical_organization()
```

### 2. 平面化组织（对等关系）

**特点**：所有Agent地位平等，通过协商协作

```
平面化组织结构：

    ┌─────────────┐         ┌─────────────┐
    │  Agent A    │ ←─────→ │  Agent B    │
    └──────┬──────┘         └──────┬──────┘
           │                       │
           │      ┌─────────┐      │
           └─────→│  任务   │←─────┘
                  └─────────┘
                       ↑
           ┌───────────┴───────────┐
           │                       │
    ┌──────┴──────┐         ┌──────┴──────┐
    │  Agent C    │ ←─────→ │  Agent D    │
    └─────────────┘         └─────────────┘
```

**代码示例**：

```python
from typing import List, Dict, Any
from dataclasses import dataclass
import json

@dataclass
class Proposal:
    """提案"""
    proposal_id: str
    proposer: str
    content: str
    votes: Dict[str, bool] = None
    
    def __post_init__(self):
        if self.votes is None:
            self.votes = {}

class PeerAgent:
    """对等Agent"""
    
    def __init__(self, agent_id: str, skills: List[str]):
        self.agent_id = agent_id
        self.skills = skills
        self.peers: Dict[str, 'PeerAgent'] = {}
        self.proposals: List[Proposal] = []
    
    def add_peer(self, peer: 'PeerAgent'):
        """添加对等Agent"""
        self.peers[peer.agent_id] = peer
    
    def propose(self, content: str) -> Proposal:
        """提出提案"""
        proposal = Proposal(
            proposal_id=f"proposal_{len(self.proposals) + 1}",
            proposer=self.agent_id,
            content=content
        )
        self.proposals.append(proposal)
        
        # 广播提案
        for peer in self.peers.values():
            peer.receive_proposal(proposal)
        
        print(f"[{self.agent_id}] 提出提案: {content}")
        return proposal
    
    def receive_proposal(self, proposal: Proposal):
        """接收提案"""
        self.proposals.append(proposal)
    
    def vote(self, proposal_id: str, vote: bool):
        """投票"""
        for proposal in self.proposals:
            if proposal.proposal_id == proposal_id:
                proposal.votes[self.agent_id] = vote
                print(f"[{self.agent_id}] 对提案 {proposal_id} 投票: {'赞成' if vote else '反对'}")
                return
    
    def check_consensus(self, proposal_id: str) -> bool:
        """检查共识"""
        for proposal in self.proposals:
            if proposal.proposal_id == proposal_id:
                votes = list(proposal.votes.values())
                if len(votes) == len(self.peers) + 1:  # 所有Agent都投票了
                    return all(votes)
        return False

# 使用示例
def demo_peer_organization():
    """演示平面化组织"""
    
    # 创建Agent
    agent_a = PeerAgent("agent_a", ["分析", "规划"])
    agent_b = PeerAgent("agent_b", ["设计", "实现"])
    agent_c = PeerAgent("agent_c", ["测试", "部署"])
    
    # 建立对等关系
    agent_a.add_peer(agent_b)
    agent_a.add_peer(agent_c)
    agent_b.add_peer(agent_a)
    agent_b.add_peer(agent_c)
    agent_c.add_peer(agent_a)
    agent_c.add_peer(agent_b)
    
    # 提出提案
    proposal = agent_a.propose("使用微服务架构")
    
    # 投票
    agent_b.vote(proposal.proposal_id, True)
    agent_c.vote(proposal.proposal_id, True)
    
    # 检查共识
    consensus = agent_a.check_consensus(proposal.proposal_id)
    print(f"共识达成: {consensus}")

# 运行示例
# demo_peer_organization()
```

### 3. 角色化组织（角色分工）

**特点**：Agent按角色分工，每个角色有明确的职责

```
角色化组织结构：

┌─────────────────────────────────────────────────────────────────┐
│                       软件开发团队                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 产品经理    │  │  架构师     │  │  程序员     │            │
│  │ - 需求分析  │  │ - 系统设计  │  │ - 代码实现  │            │
│  │ - 用户研究  │  │ - 技术选型  │  │ - 单元测试  │            │
│  │ - 产品规划  │  │ - 架构优化  │  │ - Bug修复   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  测试员     │  │  运维工程师 │  │  设计师     │            │
│  │ - 测试计划  │  │ - 部署上线  │  │ - UI设计    │            │
│  │ - 功能测试  │  │ - 监控运维  │  │ - UX设计    │            │
│  │ - 性能测试  │  │ - 故障处理  │  │ - 视觉设计  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**代码示例**：

```python
from typing import List, Dict, Any
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class RoleDefinition:
    """角色定义"""
    role_name: str
    description: str
    skills: List[str]
    responsibilities: List[str]

class RoleBasedAgent(ABC):
    """角色化Agent基类"""
    
    def __init__(self, agent_id: str, role: RoleDefinition):
        self.agent_id = agent_id
        self.role = role
        self.team: Dict[str, 'RoleBasedAgent'] = {}
    
    def join_team(self, team_members: Dict[str, 'RoleBasedAgent']):
        """加入团队"""
        self.team = team_members
    
    @abstractmethod
    def perform_role(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行角色职责"""
        pass
    
    def collaborate(self, target_role: str, message: str) -> str:
        """与其他角色协作"""
        if target_role in self.team:
            target_agent = self.team[target_role]
            print(f"[{self.agent_id}] ({self.role.role_name}) → [{target_agent.agent_id}] ({target_role}): {message}")
            return f"来自{target_role}的回复"
        return f"未找到角色: {target_role}"

class ProductManagerAgent(RoleBasedAgent):
    """产品经理Agent"""
    
    def __init__(self, agent_id: str):
        role = RoleDefinition(
            role_name="产品经理",
            description="负责产品规划和需求分析",
            skills=["需求分析", "用户研究", "产品设计"],
            responsibilities=["收集需求", "制定产品路线图", "编写PRD"]
        )
        super().__init__(agent_id, role)
    
    def perform_role(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行产品经理职责"""
        print(f"[{self.agent_id}] 分析需求: {task.get('description', '')}")
        
        # 与架构师协作
        self.collaborate("架构师", "需求分析完成，请进行系统设计")
        
        return {
            "role": "产品经理",
            "output": "需求文档",
            "status": "completed"
        }

class ArchitectAgent(RoleBasedAgent):
    """架构师Agent"""
    
    def __init__(self, agent_id: str):
        role = RoleDefinition(
            role_name="架构师",
            description="负责系统架构设计",
            skills=["系统设计", "技术选型", "架构优化"],
            responsibilities=["设计系统架构", "选择技术栈", "制定技术规范"]
        )
        super().__init__(agent_id, role)
    
    def perform_role(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行架构师职责"""
        print(f"[{self.agent_id}] 设计系统架构")
        
        # 与程序员协作
        self.collaborate("程序员", "架构设计完成，请开始编码")
        
        return {
            "role": "架构师",
            "output": "架构设计文档",
            "status": "completed"
        }

class DeveloperAgent(RoleBasedAgent):
    """程序员Agent"""
    
    def __init__(self, agent_id: str):
        role = RoleDefinition(
            role_name="程序员",
            description="负责代码实现",
            skills=["编程", "调试", "代码审查"],
            responsibilities=["编写代码", "单元测试", "代码优化"]
        )
        super().__init__(agent_id, role)
    
    def perform_role(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行程序员职责"""
        print(f"[{self.agent_id}] 编写代码")
        
        # 与测试员协作
        self.collaborate("测试员", "代码完成，请进行测试")
        
        return {
            "role": "程序员",
            "output": "代码",
            "status": "completed"
        }

class TesterAgent(RoleBasedAgent):
    """测试员Agent"""
    
    def __init__(self, agent_id: str):
        role = RoleDefinition(
            role_name="测试员",
            description="负责软件测试",
            skills=["测试", "自动化测试", "性能测试"],
            responsibilities=["制定测试计划", "执行测试", "报告Bug"]
        )
        super().__init__(agent_id, role)
    
    def perform_role(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行测试员职责"""
        print(f"[{self.agent_id}] 执行测试")
        
        return {
            "role": "测试员",
            "output": "测试报告",
            "status": "completed"
        }

# 使用示例
def demo_role_based_organization():
    """演示角色化组织"""
    
    # 创建Agent
    pm = ProductManagerAgent("pm_001")
    architect = ArchitectAgent("arch_001")
    developer = DeveloperAgent("dev_001")
    tester = TesterAgent("test_001")
    
    # 建立团队
    team = {
        "产品经理": pm,
        "架构师": architect,
        "程序员": developer,
        "测试员": tester
    }
    
    for agent in team.values():
        agent.join_team(team)
    
    # 执行任务
    task = {"description": "开发用户管理系统"}
    
    print("=== 产品开发流程 ===")
    pm.perform_role(task)
    architect.perform_role(task)
    developer.perform_role(task)
    tester.perform_role(task)

# 运行示例
# demo_role_based_organization()
```

### 4. 流水线组织（顺序执行）

**特点**：Agent按流水线顺序处理任务

```
流水线组织结构：

输入 → ┌─────────┐ → ┌─────────┐ → ┌─────────┐ → ┌─────────┐ → 输出
       │ Agent 1 │   │ Agent 2 │   │ Agent 3 │   │ Agent 4 │
       │ (处理A) │   │ (处理B) │   │ (处理C) │   │ (处理D) │
       └─────────┘   └─────────┘   └─────────┘   └─────────┘

示例：文档处理流水线
原始文档 → 分词 → 词性标注 → 命名实体识别 → 关系抽取 → 结构化数据
```

**代码示例**：

```python
from typing import List, Dict, Any, Callable
from dataclasses import dataclass

@dataclass
class PipelineStage:
    """流水线阶段"""
    stage_name: str
    processor: Callable
    description: str

class PipelineAgent:
    """流水线Agent"""
    
    def __init__(self, agent_id: str, stage: PipelineStage):
        self.agent_id = agent_id
        self.stage = stage
        self.next_agent: 'PipelineAgent' = None
    
    def set_next(self, agent: 'PipelineAgent') -> 'PipelineAgent':
        """设置下一个Agent"""
        self.next_agent = agent
        return agent
    
    def process(self, data: Any) -> Any:
        """处理数据"""
        print(f"[{self.agent_id}] {self.stage.stage_name}: 处理中...")
        
        # 执行当前阶段
        result = self.stage.processor(data)
        
        # 传递给下一个Agent
        if self.next_agent:
            return self.next_agent.process(result)
        
        return result

class PipelineOrchestrator:
    """流水线协调器"""
    
    def __init__(self):
        self.agents: List[PipelineAgent] = []
    
    def add_agent(self, agent: PipelineAgent):
        """添加Agent到流水线"""
        if self.agents:
            self.agents[-1].set_next(agent)
        self.agents.append(agent)
    
    def execute(self, input_data: Any) -> Any:
        """执行流水线"""
        if not self.agents:
            return input_data
        
        print("=== 开始流水线执行 ===")
        result = self.agents[0].process(input_data)
        print("=== 流水线执行完成 ===")
        
        return result

# 使用示例
def demo_pipeline_organization():
    """演示流水线组织"""
    
    # 定义处理函数
    def tokenize(text: str) -> List[str]:
        """分词"""
        return text.split()
    
    def pos_tag(tokens: List[str]) -> List[tuple]:
        """词性标注"""
        return [(token, "名词") for token in tokens]
    
    def extract_entities(tagged: List[tuple]) -> List[str]:
        """提取实体"""
        return [token for token, tag in tagged if tag == "名词"]
    
    # 创建Agent
    tokenizer = PipelineAgent(
        "tokenizer",
        PipelineStage("分词", tokenize, "将文本分割成词语")
    )
    
    pos_tagger = PipelineAgent(
        "pos_tagger",
        PipelineStage("词性标注", pos_tag, "标注每个词语的词性")
    )
    
    entity_extractor = PipelineAgent(
        "entity_extractor",
        PipelineStage("实体提取", extract_entities, "提取命名实体")
    )
    
    # 创建流水线
    pipeline = PipelineOrchestrator()
    pipeline.add_agent(tokenizer)
    pipeline.add_agent(pos_tagger)
    pipeline.add_agent(entity_extractor)
    
    # 执行流水线
    input_text = "人工智能 是 计算机科学 的 一个 分支"
    result = pipeline.execute(input_text)
    print(f"结果: {result}")

# 运行示例
# demo_pipeline_organization()
```

### 5. 市场化组织（竞争机制）

**特点**：Agent通过竞争获取任务

```
市场化组织结构：

                    ┌─────────────┐
                    │   任务市场   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Agent A    │    │  Agent B    │    │  Agent C    │
│  (出价: ¥5) │    │  (出价: ¥3) │    │  (出价: ¥4) │
└─────────────┘    └─────────────┘    └─────────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   竞标结果   │
                    │ Agent B 胜出 │
                    └─────────────┘
```

**代码示例**：

```python
from typing import List, Dict, Any
from dataclasses import dataclass
import uuid

@dataclass
class MarketTask:
    """市场任务"""
    task_id: str
    description: str
    budget: float
    requirements: List[str]

@dataclass
class Bid:
    """竞标"""
    bid_id: str
    agent_id: str
    task_id: str
    price: float
    estimated_time: float
    proposal: str

class MarketAgent:
    """市场化Agent"""
    
    def __init__(self, agent_id: str, skills: List[str], base_price: float):
        self.agent_id = agent_id
        self.skills = skills
        self.base_price = base_price
        self.completed_tasks: List[str] = []
        self.rating: float = 5.0  # 评分
    
    def evaluate_task(self, task: MarketTask) -> float:
        """评估任务"""
        # 检查技能匹配
        matching_skills = set(self.skills) & set(task.requirements)
        if not matching_skills:
            return 0.0  # 无法完成
        
        # 计算出价
        skill_match_ratio = len(matching_skills) / len(task.requirements)
        price = self.base_price * (1 / skill_match_ratio)
        
        return price
    
    def bid(self, task: MarketTask) -> Bid:
        """竞标"""
        price = self.evaluate_task(task)
        
        if price == 0:
            return None
        
        return Bid(
            bid_id=str(uuid.uuid4()),
            agent_id=self.agent_id,
            task_id=task.task_id,
            price=price,
            estimated_time=5.0,
            proposal=f"我可以完成这个任务，价格: ¥{price:.2f}"
        )

class Market:
    """任务市场"""
    
    def __init__(self):
        self.tasks: List[MarketTask] = []
        self.bids: Dict[str, List[Bid]] = {}  # task_id -> bids
        self.agents: Dict[str, MarketAgent] = {}
    
    def register_agent(self, agent: MarketAgent):
        """注册Agent"""
        self.agents[agent.agent_id] = agent
    
    def post_task(self, task: MarketTask):
        """发布任务"""
        self.tasks.append(task)
        self.bids[task.task_id] = []
        print(f"[市场] 发布任务: {task.description} (预算: ¥{task.budget})")
    
    def collect_bids(self, task_id: str) -> List[Bid]:
        """收集竞标"""
        bids = []
        for agent in self.agents.values():
            task = next((t for t in self.tasks if t.task_id == task_id), None)
            if task:
                bid = agent.bid(task)
                if bid:
                    bids.append(bid)
                    self.bids[task_id].append(bid)
        
        return bids
    
    def select_winner(self, task_id: str) -> Bid:
        """选择获胜者"""
        bids = self.bids.get(task_id, [])
        if not bids:
            return None
        
        # 选择价格最低的
        winner = min(bids, key=lambda b: b.price)
        print(f"[市场] 任务 {task_id} 竞标结果: {winner.agent_id} 胜出 (¥{winner.price:.2f})")
        
        return winner

# 使用示例
def demo_market_organization():
    """演示市场化组织"""
    
    # 创建市场
    market = Market()
    
    # 创建Agent
    agent_a = MarketAgent("agent_a", ["Python", "数据分析"], base_price=100)
    agent_b = MarketAgent("agent_b", ["Python", "机器学习"], base_price=120)
    agent_c = MarketAgent("agent_c", ["Python", "数据分析", "可视化"], base_price=90)
    
    # 注册Agent
    market.register_agent(agent_a)
    market.register_agent(agent_b)
    market.register_agent(agent_c)
    
    # 发布任务
    task = MarketTask(
        task_id="task_001",
        description="数据分析与可视化",
        budget=200,
        requirements=["Python", "数据分析", "可视化"]
    )
    market.post_task(task)
    
    # 收集竞标
    bids = market.collect_bids(task.task_id)
    print(f"收到 {len(bids)} 个竞标")
    
    # 选择获胜者
    winner = market.select_winner(task.task_id)

# 运行示例
# demo_market_organization()
```

## 技术方案对比

### 多Agent协作模式对比

| 模式 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| **主从模式** | 主Agent分配任务，从Agent执行 | 结构清晰、易于管理 | 主Agent成为瓶颈 | 任务明确的场景 |
| **对等模式** | 所有Agent平等协作 | 灵活、无单点故障 | 协调复杂 | 需要灵活协作的场景 |
| **竞争模式** | Agent竞争任务 | 激励改进、优胜劣汰 | 可能资源浪费 | 需要竞争的场景 |
| **协作模式** | Agent协作完成任务 | 效率高、资源共享 | 协调复杂 | 需要团队协作的场景 |

### 通信机制对比

| 机制 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| **消息传递** | 通过消息通信 | 简单、解耦 | 可能丢失消息 | 通用场景 |
| **共享内存** | 通过共享数据通信 | 速度快 | 需要同步 | 需要共享状态的场景 |
| **事件驱动** | 通过事件触发 | 响应快 | 复杂度高 | 需要实时响应的场景 |
| **协议通信** | 通过预定义协议 | 可靠 | 灵活性低 | 需要可靠通信的场景 |

### 如何选择多Agent架构？

**选择流程：**
```
任务复杂度？
├── 简单任务 → 单Agent足够
├── 中等复杂 → 主从模式
└── 高度复杂 → 对等/协作模式

协作需求？
├── 无需协作 → 单Agent
├── 简单协作 → 主从模式
└── 复杂协作 → 对等/协作模式

可靠性要求？
├── 低要求 → 主从模式
├── 高要求 → 对等模式（无单点故障）
└── 极高要求 → 分布式协作模式
```

## 设计原理与目的

### 为什么需要多Agent系统？

**单Agent的局限：**

```
问题1：能力有限
单个Agent的能力受限于：
- 单个LLM的能力
- 单个工具集的能力
- 单个记忆空间

问题2：效率瓶颈
复杂任务需要：
- 多个步骤串行执行
- 单个Agent处理所有工作
- 无法并行处理

问题3：专业性不足
不同任务需要不同专业：
- 代码编写需要程序员
- 代码审查需要审查员
- 测试需要测试员
```

**多Agent的解决方案：**

```
解决方案1：能力互补
多个Agent各有专长：
- 研究员Agent：擅长信息收集
- 分析师Agent：擅长数据分析
- 写作Agent：擅长内容生成

解决方案2：并行处理
多个Agent同时工作：
- Agent1处理任务A
- Agent2处理任务B
- Agent3处理任务C

解决方案3：专业分工
不同Agent负责不同领域：
- 产品经理Agent：需求分析
- 架构师Agent：系统设计
- 程序员Agent：代码实现
```

### 多Agent协作的原理

**1. 任务分解与分配**

```
复杂任务 → 分解为子任务 → 分配给合适的Agent

示例：开发一个Web应用

任务分解：
1. 需求分析
2. 系统设计
3. 代码实现
4. 测试验证

任务分配：
- 需求分析 → 产品经理Agent
- 系统设计 → 架构师Agent
- 代码实现 → 程序员Agent
- 测试验证 → 测试员Agent
```

**2. 通信与协调**

```
Agent间通信：

方式1：直接通信
Agent A → 消息 → Agent B

方式2：通过协调器
Agent A → 协调器 → Agent B

方式3：共享内存
Agent A → 共享数据 → Agent B

协调机制：
- 任务协调：确保任务按顺序执行
- 资源协调：避免资源冲突
- 冲突协调：解决Agent间冲突
```

**3. 结果整合**

```
多Agent结果整合：

方式1：顺序整合
Agent1结果 → Agent2结果 → Agent3结果 → 最终结果

方式2：并行整合
Agent1结果 ─┐
Agent2结果 ─┼─→ 合并 → 最终结果
Agent3结果 ─┘

方式3：投票整合
Agent1投票 ─┐
Agent2投票 ─┼─→ 投票 → 最终结果
Agent3投票 ─┘
```

### 为什么主从模式有效？

**类比：公司管理结构**

```
公司组织：
CEO（主Agent）
├── 部门经理1（从Agent）
│   ├── 员工A
│   └── 员工B
└── 部门经理2（从Agent）
    ├── 员工C
    └── 员工D

优势：
- 分工明确
- 责任清晰
- 易于管理

劣势：
- 信息传递慢
- CEO成为瓶颈
```

### 为什么对等模式有效？

**类比：开源社区协作**

```
开源项目：
- 所有贡献者地位平等
- 通过Pull Request协作
- 通过Issue沟通
- 通过投票决策

优势：
- 灵活
- 无单点故障
- 能够自组织

劣势：
- 协调复杂
- 决策慢
```

## 应用场景详解

### 场景一：软件开发团队

**需求：** 模拟软件开发团队协作开发

**实现：**
```python
from typing import List, Dict
from dataclasses import dataclass
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. 定义角色
@dataclass
class AgentRole:
    name: str
    description: str
    skills: List[str]

# 2. 定义工具
@tool
def write_code(filename: str, code: str) -> str:
    """编写代码"""
    with open(filename, "w") as f:
        f.write(code)
    return f"代码已写入：{filename}"

@tool
def review_code(filename: str) -> str:
    """审查代码"""
    try:
        with open(filename, "r") as f:
            code = f.read()
        # 模拟代码审查
        return f"代码审查结果：代码质量良好，建议添加注释"
    except:
        return f"文件不存在：{filename}"

@tool
def write_document(title: str, content: str) -> str:
    """编写文档"""
    with open(f"{title}.md", "w") as f:
        f.write(content)
    return f"文档已写入：{title}.md"

# 3. 创建Agent工厂
def create_agent(role: AgentRole, tools: List) -> AgentExecutor:
    """创建Agent"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""你是{role.name}。
职责：{role.description}
技能：{', '.join(role.skills)}

请根据你的职责完成工作。"""),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    agent = create_openai_functions_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

# 4. 定义角色
pm_role = AgentRole(
    name="产品经理",
    description="负责需求分析和产品规划",
    skills=["需求分析", "用户研究", "产品设计"]
)

dev_role = AgentRole(
    name="程序员",
    description="负责代码实现",
    skills=["Python", "JavaScript", "数据库"]
)

reviewer_role = AgentRole(
    name="代码审查员",
    description="负责代码审查和质量保证",
    skills=["代码审查", "测试", "性能优化"]
)

# 5. 创建团队
pm_agent = create_agent(pm_role, [write_document])
dev_agent = create_agent(dev_role, [write_code])
reviewer_agent = create_agent(reviewer_role, [review_code])

# 6. 协作流程
def team_collaboration(task: str):
    """团队协作"""
    # 产品经理分析需求
    pm_result = pm_agent.invoke({
        "input": f"分析需求并输出需求文档：{task}"
    })
    
    # 程序员实现代码
    dev_result = dev_agent.invoke({
        "input": f"根据需求实现代码：{pm_result['output']}"
    })
    
    # 审查员审查代码
    review_result = reviewer_agent.invoke({
        "input": "审查代码质量"
    })
    
    return {
        "requirements": pm_result["output"],
        "implementation": dev_result["output"],
        "review": review_result["output"]
    }

# 7. 使用
result = team_collaboration("开发一个计算器应用")
print("需求分析：", result["requirements"])
print("代码实现：", result["implementation"])
print("代码审查：", result["review"])
```

**设计要点：**
- 定义不同角色的Agent
- 每个Agent有自己的工具和职责
- 通过协作流程完成任务

### 场景二：客服团队协作

**需求：** 多个客服Agent协作处理客户问题

**实现：**
```python
from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. 定义工具
@tool
def lookup_order(order_id: str) -> str:
    """查询订单"""
    orders = {
        "ORD001": {"status": "已发货", "items": ["手机", "耳机"]},
        "ORD002": {"status": "待付款", "items": ["电脑"]}
    }
    return str(orders.get(order_id, {"error": "订单不存在"}))

@tool
def process_refund(order_id: str, reason: str) -> str:
    """处理退款"""
    return f"退款申请已提交：订单{order_id}，原因：{reason}"

@tool
def escalate_to_manager(issue: str) -> str:
    """升级给经理"""
    return f"已升级给经理：{issue}"

@tool
def search_knowledge_base(query: str) -> str:
    """搜索知识库"""
    kb = {
        "退货": "7天无理由退货，需保持商品完好",
        "换货": "30天内可申请换货",
        "保修": "电子产品保修1年"
    }
    for key, value in kb.items():
        if key in query:
            return value
    return "未找到相关信息"

# 2. 创建不同专长的客服Agent
def create_support_agent(specialty: str, tools: List) -> AgentExecutor:
    """创建客服Agent"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""你是一个专业的客服人员，专长：{specialty}。

工作原则：
1. 保持友好专业
2. 尽力解决问题
3. 无法解决时升级给经理

请使用提供的工具帮助客户。"""),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    agent = create_openai_functions_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

# 3. 创建团队
order_agent = create_support_agent("订单查询", [lookup_order, search_knowledge_base])
refund_agent = create_support_agent("退款处理", [process_refund, escalate_to_manager])
general_agent = create_support_agent("综合客服", [lookup_order, search_knowledge_base, escalate_to_manager])

# 4. 路由逻辑
def route_to_agent(query: str) -> AgentExecutor:
    """根据问题类型路由到合适的Agent"""
    if "订单" in query or "发货" in query:
        return order_agent
    elif "退款" in query or "退货" in query:
        return refund_agent
    else:
        return general_agent

# 5. 使用
def handle_customer_query(query: str) -> str:
    """处理客户问题"""
    agent = route_to_agent(query)
    result = agent.invoke({"input": query})
    return result["output"]

# 测试
print(handle_customer_query("我的订单ORD001发货了吗？"))
print(handle_customer_query("我想退货，怎么操作？"))
print(handle_customer_query("你们的保修政策是什么？"))
```

**设计要点：**
- 根据问题类型路由到合适的Agent
- 每个Agent有专长的工具
- 无法解决时可以升级

### 场景三：研究团队协作

**需求：** 多个研究Agent协作完成研究报告

**实现：**
```python
from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. 定义工具
@tool
def search_papers(query: str) -> str:
    """搜索学术论文"""
    # 模拟搜索
    return f"找到关于'{query}'的10篇相关论文"

@tool
def analyze_data(data_description: str) -> str:
    """分析数据"""
    return f"数据分析结果：{data_description}显示明显趋势"

@tool
def write_section(title: str, content: str) -> str:
    """写报告章节"""
    with open(f"report_{title}.md", "w") as f:
        f.write(content)
    return f"章节已写入：report_{title}.md"

@tool
def review_section(title: str) -> str:
    """审查章节"""
    return f"审查{title}章节：内容完整，建议补充数据支持"

# 2. 创建研究Agent
def create_research_agent(role: str, tools: List) -> AgentExecutor:
    """创建研究Agent"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""你是一个{role}，负责研究报告的编写。

工作流程：
1. 收集相关资料
2. 分析数据
3. 撰写章节
4. 审查内容

请使用提供的工具完成工作。"""),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    agent = create_openai_functions_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

# 3. 创建团队
literature_agent = create_research_agent("文献研究员", [search_papers, write_section])
data_agent = create_research_agent("数据分析师", [analyze_data, write_section])
review_agent = create_research_agent("审查员", [review_section])

# 4. 协作流程
def research_collaboration(topic: str):
    """研究团队协作"""
    # 文献研究
    lit_result = literature_agent.invoke({
        "input": f"研究{topic}的相关文献并撰写文献综述"
    })
    
    # 数据分析
    data_result = data_agent.invoke({
        "input": f"分析{topic}的相关数据并撰写分析章节"
    })
    
    # 审查
    review_result = review_agent.invoke({
        "input": "审查所有章节并提供修改建议"
    })
    
    return {
        "literature": lit_result["output"],
        "data_analysis": data_result["output"],
        "review": review_result["output"]
    }

# 5. 使用
result = research_collaboration("人工智能在医疗领域的应用")
print("文献综述：", result["literature"])
print("数据分析：", result["data_analysis"])
print("审查意见：", result["review"])
```

**设计要点：**
- 不同研究Agent负责不同章节
- 协作流程确保内容完整
- 审查环节保证质量

## 下一步学习

- [通信框架](/day131-135/communication) - Agent间通信机制
- [协作模式](/day131-135/collaboration) - Agent协作模式
- [任务分解](/day131-135/task-decomposition) - 复杂任务分解策略