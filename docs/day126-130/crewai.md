# CrewAI详解

## 概述

CrewAI是一个多Agent协作框架，模拟团队协作的工作模式。它通过角色定义、任务分配和协作机制，实现高效的多Agent协作。

## 核心概念

### 1. 角色（Agent）
CrewAI中的角色定义：
- **角色名称**：角色的唯一标识
- **角色目标**：角色需要完成的目标
- **角色能力**：角色具备的能力
- **角色工具**：角色可使用的工具

### 2. 任务（Task）
CrewAI中的任务定义：
- **任务描述**：任务的详细描述
- **任务目标**：任务需要达成的目标
- **任务依赖**：任务之间的依赖关系
- **任务输出**：任务的预期输出

### 3. 团队（Crew）
CrewAI中的团队定义：
- **团队成员**：团队中的角色列表
- **团队任务**：团队需要完成的任务列表
- **协作模式**：团队的协作方式
- **执行策略**：团队的执行策略

### 4. 流程（Process）
CrewAI的执行流程：
- **顺序执行**：按顺序执行任务
- **层级执行**：按层级关系执行任务
- **协作执行**：多个角色协作执行任务

## 核心API

### 1. 安装和配置
```bash
# 安装CrewAI
pip install crewai

# 安装工具包
pip install crewai-tools

# 配置环境变量
export OPENAI_API_KEY="your-api-key"
```

### 2. 创建角色
```python
from crewai import Agent

# 创建研究员角色
researcher = Agent(
    role="研究员",
    goal="研究人工智能最新进展",
    backstory="你是一位资深的人工智能研究员，专注于前沿技术研究。",
    verbose=True,
    allow_delegation=False
)

# 创建分析师角色
analyst = Agent(
    role="分析师",
    goal="分析研究结果并提供见解",
    backstory="你是一位数据分析专家，擅长从数据中提取有价值的见解。",
    verbose=True,
    allow_delegation=False
)

# 创建作家角色
writer = Agent(
    role="作家",
    goal="撰写高质量的技术报告",
    backstory="你是一位技术写作专家，擅长将复杂的技术概念转化为易懂的文字。",
    verbose=True,
    allow_delegation=False
)
```

### 3. 创建任务
```python
from crewai import Task

# 创建研究任务
research_task = Task(
    description="研究人工智能在医疗领域的最新应用",
    expected_output="一份详细的研究报告，包括主要应用领域和最新进展",
    agent=researcher
)

# 创建分析任务
analysis_task = Task(
    description="分析研究结果，提取关键见解",
    expected_output="一份分析报告，包括关键发现和趋势分析",
    agent=analyst,
    context=[research_task]  # 依赖研究任务
)

# 创建写作任务
writing_task = Task(
    description="基于研究和分析结果撰写技术报告",
    expected_output="一份完整的技术报告，包括摘要、正文和结论",
    agent=writer,
    context=[research_task, analysis_task]  # 依赖研究和分析任务
)
```

### 4. 创建团队
```python
from crewai import Crew, Process

# 创建团队
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential,  # 顺序执行
    verbose=True
)

# 运行团队
result = crew.kickoff()

print("团队执行结果：")
print(result)
```

### 5. 使用工具
```python
from crewai import Agent, Task, Crew
from crewai_tools import SerperDevTool, WebsiteSearchTool

# 创建工具
search_tool = SerperDevTool()
web_tool = WebsiteSearchTool()

# 创建带工具的角色
researcher = Agent(
    role="研究员",
    goal="研究人工智能最新进展",
    backstory="你是一位资深的人工智能研究员。",
    tools=[search_tool, web_tool],
    verbose=True
)

# 创建任务
research_task = Task(
    description="搜索人工智能最新进展",
    expected_output="一份搜索结果摘要",
    agent=researcher
)

# 创建团队
crew = Crew(
    agents=[researcher],
    tasks=[research_task],
    verbose=True
)

# 运行
result = crew.kickoff()
```

## 实践指南

### 1. 环境准备
```bash
# 安装CrewAI
pip install crewai crewai-tools

# 配置API密钥
export OPENAI_API_KEY="your-api-key"
export SERPER_API_KEY="your-serper-api-key"  # 可选，用于搜索
```

### 2. 基础使用示例
```python
from crewai import Agent, Task, Crew, Process

# 创建角色
researcher = Agent(
    role="市场研究员",
    goal="研究目标市场的最新趋势",
    backstory="你是一位经验丰富的市场研究员，擅长识别市场趋势和机会。",
    verbose=True
)

analyst = Agent(
    role="数据分析师",
    goal="分析市场数据并提供洞察",
    backstory="你是一位数据分析专家，能够从复杂数据中提取有价值的见解。",
    verbose=True
)

# 创建任务
research_task = Task(
    description="研究2024年人工智能市场的最新趋势",
    expected_output="一份详细的市场趋势报告",
    agent=researcher
)

analysis_task = Task(
    description="分析市场趋势数据，识别关键机会",
    expected_output="一份机会分析报告",
    agent=analyst,
    context=[research_task]
)

# 创建团队
crew = Crew(
    agents=[researcher, analyst],
    tasks=[research_task, analysis_task],
    process=Process.sequential,
    verbose=True
)

# 运行
result = crew.kickoff()
print(result)
```

### 3. 自定义工具
```python
from crewai import Agent, Task, Crew
from crewai_tools import BaseTool
from pydantic import BaseModel, Field

# 定义工具输入
class CalculatorInput(BaseModel):
    expression: str = Field(description="数学表达式")

# 创建自定义工具
class CalculatorTool(BaseTool):
    name: str = "calculator"
    description: str = "计算数学表达式"
    args_schema: type[BaseModel] = CalculatorInput

    def _run(self, expression: str) -> str:
        try:
            result = eval(expression)
            return f"计算结果: {result}"
        except Exception as e:
            return f"计算错误: {e}"

# 使用自定义工具
calculator = CalculatorTool()

analyst = Agent(
    role="数据分析师",
    goal="分析数据并进行计算",
    backstory="你是一位数据分析专家。",
    tools=[calculator],
    verbose=True
)

task = Task(
    description="计算(100 + 200) * 3的结果",
    expected_output="计算结果",
    agent=analyst
)

crew = Crew(
    agents=[analyst],
    tasks=[task],
    verbose=True
)

result = crew.kickoff()
```

### 4. 人工审批
```python
from crewai import Agent, Task, Crew, Process

# 创建需要人工审批的任务
review_task = Task(
    description="审查代码变更",
    expected_output="审查报告",
    agent=reviewer,
    human_input=True  # 需要人工输入
)

# 创建团队
crew = Crew(
    agents=[reviewer],
    tasks=[review_task],
    process=Process.sequential,
    verbose=True
)

# 运行时会暂停等待人工输入
result = crew.kickoff()
```

## 最佳实践

### 1. 角色设计
- **明确目标**：为每个角色设定明确的目标
- **清晰背景**：提供详细的背景故事
- **合理分工**：合理分配角色职责
- **工具选择**：为角色选择合适的工具

### 2. 任务设计
- **清晰描述**：提供清晰的任务描述
- **明确输出**：明确任务的预期输出
- **合理依赖**：设置合理的任务依赖
- **上下文传递**：合理传递任务上下文

### 3. 团队协作
- **选择合适的流程**：根据任务选择执行流程
- **监控执行**：监控团队执行过程
- **处理错误**：处理执行过程中的错误
- **优化性能**：优化团队执行性能

## 常见问题

### 1. 执行问题
- **任务失败**：检查任务设置和角色配置
- **依赖错误**：检查任务依赖关系
- **工具错误**：检查工具配置

### 2. 性能问题
- **响应慢**：优化角色和任务配置
- **成本高**：控制API调用次数
- **内存占用高**：优化数据处理

### 3. 协作问题
- **沟通障碍**：优化角色间的沟通
- **任务冲突**：解决任务间的冲突
- **输出质量**：提高任务输出质量

## 下一步学习

- [Microsoft AutoGen详解](/day126-130/autogen) - 多Agent对话框架
- [ChatDev详解](/day126-130/chatdev) - 基于角色的开发框架
- [CAMEL详解](/day126-130/camel) - 通信Agent框架