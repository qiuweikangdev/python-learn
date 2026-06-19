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