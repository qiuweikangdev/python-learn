# Agent框架概述

## 什么是Agent框架？

Agent框架是用于构建AI Agent的软件框架，提供了工具调用、记忆管理、规划决策等核心功能，帮助开发者快速构建能够自主完成任务的智能系统。

## 核心概念

### 1. Agent定义
Agent是能够感知环境、做出决策并采取行动的智能系统：
- **自主性**：能够独立做出决策
- **反应性**：能够响应环境变化
- **主动性**：能够主动采取行动
- **社会性**：能够与其他Agent交互

### 2. 核心组件
Agent框架的核心组件：
- **LLM引擎**：大语言模型作为推理引擎
- **工具集**：Agent可使用的工具集合
- **记忆系统**：短期和长期记忆管理
- **规划器**：任务规划和分解
- **执行器**：任务执行和监控

### 3. 工作模式
Agent的常见工作模式：
- **ReAct模式**：推理-行动-观察循环
- **Plan-and-Execute**：先规划后执行
- **Reflexion**：反思和改进
- **Multi-Agent**：多Agent协作

## 主流Agent框架对比

| 框架 | 特点 | 优势 | 劣势 | 适用场景 |
|------|------|------|------|----------|
| **AutoGPT** | 自主Agent | 完全自主、持续运行 | 不稳定、成本高 | 探索性任务 |
| **BabyAGI** | 任务驱动 | 简单、易理解 | 功能有限 | 任务管理 |
| **MetaGPT** | 多角色协作 | 角色明确、协作高效 | 复杂度高 | 软件开发 |
| **CrewAI** | 多Agent协作 | 易用、灵活 | 相对较新 | 团队协作 |
| **AutoGen** | 对话式Agent | 微软支持、企业级 | 学习曲线陡 | 企业应用 |
| **ChatDev** | 虚拟公司 | 场景明确、易于理解 | 限制较多 | 软件开发 |
| **CAMEL** | 通信Agent | 通信机制完善 | 应用场景窄 | 研究探索 |

## 技术方案对比

### Agent框架架构对比

| 框架 | 架构模式 | 自主程度 | 协作方式 | 学习成本 | 适用场景 |
|------|----------|----------|----------|----------|----------|
| **AutoGPT** | 单Agent自主循环 | 完全自主 | 无 | 低 | 探索性任务 |
| **BabyAGI** | 任务队列驱动 | 半自主 | 无 | 低 | 任务管理 |
| **MetaGPT** | 角色扮演协作 | 半自主 | 角色分工 | 中等 | 软件开发 |
| **CrewAI** | 团队协作 | 半自主 | 任务分配 | 低 | 团队协作 |
| **AutoGen** | 对话式协作 | 半自主 | 对话协商 | 中等 | 企业应用 |
| **ChatDev** | 虚拟公司 | 半自主 | 角色分工 | 低 | 软件开发 |
| **CAMEL** | 通信Agent | 半自主 | 消息传递 | 中等 | 研究探索 |

### Agent工作模式对比

| 模式 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| **ReAct** | 推理-行动-观察循环 | 简单、可解释 | 可能陷入循环 | 通用任务 |
| **Plan-and-Execute** | 先规划后执行 | 计划清晰 | 规划可能不准确 | 复杂任务 |
| **Reflexion** | 反思和改进 | 能从错误学习 | 需要多次尝试 | 需要改进的任务 |
| **Multi-Agent** | 多Agent协作 | 能力互补 | 协调复杂 | 团队任务 |

### 如何选择Agent框架？

**选择流程：**
```
任务类型？
├── 探索性任务 → AutoGPT（完全自主）
├── 任务管理 → BabyAGI（任务驱动）
├── 软件开发 → MetaGPT/ChatDev（角色协作）
└── 团队协作 → CrewAI/AutoGen（多Agent）

自主程度？
├── 完全自主 → AutoGPT
├── 半自主 → BabyAGI/CrewAI
└── 需要人工监督 → AutoGen

协作需求？
├── 无需协作 → AutoGPT/BabyAGI
├── 简单协作 → CrewAI
└── 复杂协作 → AutoGen/MetaGPT
```

## 设计原理与目的

### 为什么需要Agent框架？

**直接使用LLM的问题：**

```
问题1：无法执行操作
LLM只能生成文本，无法：
- 调用API
- 读写文件
- 执行代码

问题2：无法处理复杂任务
复杂任务需要：
- 分解子任务
- 逐步执行
- 处理中间结果

问题3：无法持续运行
有些任务需要：
- 长时间运行
- 多次尝试
- 从错误中恢复
```

**Agent框架的解决方案：**

```
解决方案1：工具调用
让LLM能够调用外部工具：
- 搜索引擎
- 计算器
- 文件系统
- API接口

解决方案2：任务规划
让LLM能够规划和分解任务：
- 分析任务需求
- 制定执行计划
- 分解为子任务

解决方案3：执行循环
让Agent能够持续运行：
- 执行行动
- 观察结果
- 调整策略
- 重复循环
```

### Agent的核心原理

**1. ReAct模式（推理-行动-观察）**

```
执行循环：

用户输入 → 思考(Thought) → 行动(Action) → 观察(Observation)
                ↑                              ↓
                └──────── 重复循环 ←───────────┘

示例：
用户：北京天气怎么样？

思考1：我需要查询北京的天气信息
行动1：调用天气API，参数：北京
观察1：北京今天晴，25℃

思考2：我已经获取到天气信息，可以回答用户
行动2：生成回答
观察2：任务完成

回答：北京今天天气晴朗，温度25度。
```

**2. 工具调用机制**

```
工具定义：
{
    "name": "search",
    "description": "搜索互联网信息",
    "parameters": {
        "query": {"type": "string", "description": "搜索关键词"}
    }
}

工具调用过程：
1. LLM分析用户需求
2. LLM决定使用哪个工具
3. LLM生成工具参数
4. 执行工具
5. 将结果返回给LLM
6. LLM基于结果生成回答
```

**3. 记忆管理机制**

```
记忆类型：

短期记忆（对话历史）：
- 当前对话的上下文
- 最近的消息
- 用于保持对话连贯

长期记忆（知识库）：
- 用户偏好
- 历史信息
- 用于个性化服务

工作记忆（当前任务）：
- 任务状态
- 中间结果
- 用于任务执行
```

### 为什么多Agent协作有效？

**问题：** 单个Agent能力有限

**解决方案：** 多个Agent协作

```
类比：团队协作

单Agent：
一个人完成所有工作
- 精力有限
- 技能有限
- 效率有限

多Agent：
多人协作完成工作
- 分工明确
- 技能互补
- 效率更高

示例：软件开发团队
- 产品经理：分析需求
- 架构师：设计系统
- 程序员：编写代码
- 测试员：测试质量
```

### 为什么角色扮演有效？

**问题：** LLM默认行为可能不适合特定任务

**解决方案：** 让LLM扮演特定角色

```
角色扮演的作用：

1. 约束行为
"你是一个专业的Python程序员"
→ LLM会以程序员的视角回答问题

2. 明确职责
"你的职责是审查代码质量"
→ LLM会专注于代码审查

3. 提高质量
"你有10年的开发经验"
→ LLM会提供更专业的建议
```

## 应用场景详解

### 场景一：自主研究Agent

**需求：** 自动研究某个主题并生成报告

**实现：**
```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. 定义工具
@tool
def search_web(query: str) -> str:
    """搜索互联网信息"""
    # 这里应该是实际的搜索API
    return f"搜索结果：关于'{query}'的最新研究..."

@tool
def save_notes(content: str) -> str:
    """保存研究笔记"""
    with open("research_notes.txt", "a", encoding="utf-8") as f:
        f.write(content + "\n")
    return "笔记已保存"

@tool
def read_notes() -> str:
    """读取研究笔记"""
    try:
        with open("research_notes.txt", "r", encoding="utf-8") as f:
            return f.read()
    except:
        return "暂无笔记"

# 2. 创建Agent
tools = [search_web, save_notes, read_notes]

prompt = ChatPromptTemplate.from_messages([
    ("system", """你是一个专业的研究员。你的任务是研究指定主题并生成报告。

研究流程：
1. 搜索相关信息
2. 保存重要发现
3. 整理和分析
4. 生成报告

请使用提供的工具完成研究。"""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

llm = ChatOpenAI(model="gpt-3.5-turbo")
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 3. 使用
response = agent_executor.invoke({
    "input": "请研究人工智能在医疗领域的应用，并生成一份报告"
})
print(response["output"])
```

**设计要点：**
- 定义研究相关的工具
- 使用提示模板引导研究流程
- Agent可以自主执行多步研究

### 场景二：任务管理Agent

**需求：** 自动分解和管理复杂任务

**实现：**
```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from typing import List, Dict
import json

# 1. 任务存储
tasks_db = []

@tool
def create_task(title: str, description: str, priority: str = "medium") -> str:
    """创建新任务"""
    task = {
        "id": len(tasks_db) + 1,
        "title": title,
        "description": description,
        "priority": priority,
        "status": "pending"
    }
    tasks_db.append(task)
    return f"任务已创建：{task['id']} - {title}"

@tool
def list_tasks() -> str:
    """列出所有任务"""
    if not tasks_db:
        return "暂无任务"
    
    task_list = []
    for task in tasks_db:
        task_list.append(f"- [{task['status']}] {task['id']}. {task['title']} ({task['priority']})")
    
    return "\n".join(task_list)

@tool
def complete_task(task_id: int) -> str:
    """完成任务"""
    for task in tasks_db:
        if task["id"] == task_id:
            task["status"] = "completed"
            return f"任务已完成：{task_id} - {task['title']}"
    return f"未找到任务：{task_id}"

# 2. 创建Agent
tools = [create_task, list_tasks, complete_task]

prompt = ChatPromptTemplate.from_messages([
    ("system", """你是一个任务管理助手。你可以帮助用户：
1. 分解复杂任务为子任务
2. 创建和管理任务列表
3. 跟踪任务进度

请使用提供的工具管理任务。"""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

llm = ChatOpenAI(model="gpt-3.5-turbo")
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 3. 使用
response = agent_executor.invoke({
    "input": "帮我分解这个任务：开发一个电商网站"
})
print(response["output"])
```

**设计要点：**
- 定义任务管理工具
- Agent可以自动分解任务
- 支持任务状态管理

### 场景三：代码助手Agent

**需求：** 自动编写、测试和调试代码

**实现：**
```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. 定义工具
@tool
def write_code(filename: str, code: str) -> str:
    """编写代码到文件"""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(code)
    return f"代码已写入：{filename}"

@tool
def read_code(filename: str) -> str:
    """读取代码文件"""
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()
    except:
        return f"文件不存在：{filename}"

@tool
def run_code(filename: str) -> str:
    """运行代码"""
    import subprocess
    try:
        result = subprocess.run(
            ["python", filename],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return f"运行成功：\n{result.stdout}"
        else:
            return f"运行失败：\n{result.stderr}"
    except Exception as e:
        return f"运行错误：{e}"

# 2. 创建Agent
tools = [write_code, read_code, run_code]

prompt = ChatPromptTemplate.from_messages([
    ("system", """你是一个专业的Python程序员。你可以：
1. 编写Python代码
2. 读取和分析代码
3. 运行和测试代码
4. 调试和修复错误

请使用提供的工具完成编程任务。"""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

llm = ChatOpenAI(model="gpt-4")  # 代码任务建议使用GPT-4
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 3. 使用
response = agent_executor.invoke({
    "input": "请写一个Python函数，实现快速排序算法，并测试它"
})
print(response["output"])
```

**设计要点：**
- 定义代码相关工具
- 使用GPT-4获得更好的代码生成效果
- 支持代码编写、运行和调试

### 场景四：客服Agent

**需求：** 智能客服系统，能回答问题和处理请求

**实现：**
```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory

# 1. 定义工具
@tool
def lookup_order(order_id: str) -> str:
    """查询订单状态"""
    # 模拟订单查询
    orders = {
        "ORD001": {"status": "已发货", "tracking": "SF1234567890"},
        "ORD002": {"status": "待付款", "amount": 299.00}
    }
    order = orders.get(order_id)
    if order:
        return f"订单{order_id}：{order}"
    return f"未找到订单：{order_id}"

@tool
def create_ticket(subject: str, description: str) -> str:
    """创建工单"""
    # 模拟创建工单
    ticket_id = "TKT001"
    return f"工单已创建：{ticket_id} - {subject}"

@tool
def search_faq(query: str) -> str:
    """搜索常见问题"""
    # 模拟FAQ搜索
    faq = {
        "退货": "7天无理由退货，请在订单页面申请退货",
        "发货": "订单付款后48小时内发货",
        "支付": "支持支付宝、微信、银行卡支付"
    }
    for key, value in faq.items():
        if key in query:
            return value
    return "未找到相关问题，请联系人工客服"

# 2. 创建Agent
tools = [lookup_order, create_ticket, search_faq]

prompt = ChatPromptTemplate.from_messages([
    ("system", """你是一个专业的客服助手。你可以：
1. 查询订单状态
2. 创建客服工单
3. 回答常见问题

请用友好专业的语气与客户沟通。如果无法解决问题，请创建工单转接人工客服。"""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

llm = ChatOpenAI(model="gpt-3.5-turbo")
memory = ConversationBufferMemory(return_messages=True, memory_key="chat_history")
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, memory=memory, verbose=True)

# 3. 使用
response = agent_executor.invoke({"input": "我的订单ORD001发货了吗？"})
print(response["output"])

response = agent_executor.invoke({"input": "怎么退货？"})
print(response["output"])
```

**设计要点：**
- 定义客服相关工具
- 使用记忆保持对话上下文
- 引导Agent友好专业地服务

## 选型指南

### 1. 需求分析
- **任务类型**：探索性任务、确定性任务
- **自主程度**：完全自主、半自主、人工监督
- **协作需求**：单Agent、多Agent协作
- **性能要求**：响应时间、准确性、稳定性

### 2. 技术评估
- **成熟度**：框架的稳定性和社区活跃度
- **扩展性**：功能扩展和定制能力
- **集成性**：与现有系统的集成难度
- **学习成本**：团队学习和使用成本

## 下一步学习

选择一个Agent框架深入学习：
- [AutoGPT详解](/day126-130/autogpt) - 自主AI代理
- [BabyAGI详解](/day126-130/babyagi) - 任务驱动的自主Agent
- [MetaGPT详解](/day126-130/metagpt) - 多角色协作框架
- [CrewAI详解](/day126-130/crewai) - 多Agent协作框架
- [Microsoft AutoGen详解](/day126-130/autogen) - 多Agent对话框架
- [ChatDev详解](/day126-130/chatdev) - 基于角色的开发框架
- [CAMEL详解](/day126-130/camel) - 通信Agent框架