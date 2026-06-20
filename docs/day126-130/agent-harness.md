# 现代Agent Harness详解

## 概述

Agent Harness是管理和运行AI Agent的基础设施框架，提供了模型抽象、工具管理、状态管理、执行引擎等核心功能。理解Agent Harness对于构建生产级Agent系统至关重要。

## 什么是Agent Harness？

### 定义

```
Agent Harness = Agent运行环境 + 管理工具

类比：
- Agent = 司机（智能体）
- Harness = 汽车（运行环境）
- 工具 = 方向盘、油门、刹车（工具集）
```

### 与传统框架的区别

| 对比维度 | 传统框架 | Agent Harness |
|----------|----------|---------------|
| **定位** | 提供Agent构建组件 | 提供Agent运行环境 |
| **职责** | 帮助构建Agent | 管理和运行Agent |
| **功能** | 模型调用、工具集成 | 模型抽象、工具管理、状态管理、执行引擎 |
| **复杂度** | 较低 | 较高 |
| **适用场景** | 原型开发 | 生产环境 |

## 主流Agent Harness对比

### 1. LangChain/LangGraph

**特点**：
- 最流行的LLM应用框架
- 丰富的组件和工具
- 活跃的社区支持

**架构**：
```
┌─────────────────────────────────────────────────────────┐
│                    LangChain架构                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                  应用层                          │   │
│  │  Chains / Agents / Retrieval                     │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │                  核心层                          │   │
│  │  Models / Prompts / Memory / Tools               │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │                  集成层                          │   │
│  │  OpenAI / Anthropic / Google / 开源模型          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**代码示例**：

```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

def create_langchain_agent():
    """
    使用LangChain创建Agent
    
    LangChain提供了：
    1. 统一的模型接口
    2. 丰富的工具集成
    3. 灵活的链组合
    4. 完善的记忆管理
    """
    
    # 1. 创建模型
    llm = ChatOpenAI(
        model="gpt-3.5-turbo",
        temperature=0.7
    )
    
    # 2. 定义工具
    @tool
    def search(query: str) -> str:
        """搜索互联网信息"""
        return f"搜索结果：{query}"
    
    @tool
    def calculate(expression: str) -> str:
        """计算数学表达式"""
        try:
            result = eval(expression)
            return f"计算结果：{result}"
        except Exception as e:
            return f"计算错误：{e}"
    
    tools = [search, calculate]
    
    # 3. 创建提示模板
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手，可以使用工具来完成任务。"),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    
    # 4. 创建Agent
    agent = create_openai_tools_agent(llm, tools, prompt)
    
    # 5. 创建Agent执行器
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iterations=5,
        handle_parsing_errors=True
    )
    
    return agent_executor

# 使用示例
# agent = create_langchain_agent()
# result = agent.invoke({"input": "搜索人工智能最新进展"})
# print(result)
```

### 2. AutoGen

**特点**：
- 微软开发的多Agent框架
- 对话式Agent协作
- 企业级支持

**架构**：
```
┌─────────────────────────────────────────────────────────┐
│                    AutoGen架构                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ Assistant   │ ←→ │   User      │ ←→ │  Group      │ │
│  │ Agent       │    │   Proxy     │    │  Chat       │ │
│  └─────────────┘    └─────────────┘    │  Manager     │ │
│                                         └─────────────┘ │
│       ↓                   ↓                   ↓         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                  LLM服务                         │   │
│  │  OpenAI / Azure OpenAI / 本地模型                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**代码示例**：

```python
import autogen

def create_autogen_agents():
    """
    使用AutoGen创建多Agent系统
    
    AutoGen的特点：
    1. 对话式Agent协作
    2. 自动代码执行
    3. 人工反馈支持
    """
    
    # 配置LLM
    llm_config = {
        "model": "gpt-3.5-turbo",
        "api_key": "your-api-key"
    }
    
    # 创建助手Agent
    assistant = autogen.AssistantAgent(
        name="assistant",
        llm_config=llm_config,
        system_message="你是一个有用的AI助手。"
    )
    
    # 创建用户代理
    user_proxy = autogen.UserProxyAgent(
        name="user_proxy",
        human_input_mode="TERMINATE",
        max_consecutive_auto_reply=10,
        is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
        code_execution_config={"work_dir": "coding"},
        llm_config=llm_config
    )
    
    return assistant, user_proxy

# 使用示例
# assistant, user_proxy = create_autogen_agents()
# user_proxy.initiate_chat(assistant, message="帮我写一个Python函数")
```

### 3. CrewAI

**特点**：
- 专注于多Agent协作
- 简单易用的API
- 角色和任务定义清晰

**架构**：
```
┌─────────────────────────────────────────────────────────┐
│                    CrewAI架构                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                    Crew                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐         │   │
│  │  │ Agent 1 │  │ Agent 2 │  │ Agent 3 │         │   │
│  │  │ (角色A) │  │ (角色B) │  │ (角色C) │         │   │
│  │  └─────────┘  └─────────┘  └─────────┘         │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │                  Tasks                           │   │
│  │  Task 1 → Task 2 → Task 3                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**代码示例**：

```python
from crewai import Agent, Task, Crew, Process

def create_crewai_agents():
    """
    使用CrewAI创建多Agent团队
    
    CrewAI的特点：
    1. 角色定义清晰
    2. 任务分配明确
    3. 协作流程简单
    """
    
    # 创建Agent
    researcher = Agent(
        role="研究员",
        goal="收集和分析信息",
        backstory="你是一个资深研究员，擅长信息收集和分析。",
        verbose=True
    )
    
    writer = Agent(
        role="作家",
        goal="撰写高质量的内容",
        backstory="你是一个专业作家，擅长将复杂信息转化为易懂的内容。",
        verbose=True
    )
    
    # 创建任务
    research_task = Task(
        description="研究人工智能最新进展",
        expected_output="一份详细的研究报告",
        agent=researcher
    )
    
    writing_task = Task(
        description="基于研究结果撰写文章",
        expected_output="一篇高质量的文章",
        agent=writer,
        context=[research_task]  # 依赖研究任务
    )
    
    # 创建团队
    crew = Crew(
        agents=[researcher, writer],
        tasks=[research_task, writing_task],
        process=Process.sequential,  # 顺序执行
        verbose=True
    )
    
    return crew

# 使用示例
# crew = create_crewai_agents()
# result = crew.kickoff()
# print(result)
```

### 4. Semantic Kernel

**特点**：
- 微软开发的AI编排框架
- 支持多种编程语言
- 企业级特性

**代码示例**：

```python
import semantic_kernel as sk
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion

def create_semantic_kernel_agent():
    """
    使用Semantic Kernel创建Agent
    
    Semantic Kernel的特点：
    1. 微软支持
    2. 多语言支持
    3. 插件系统
    """
    
    # 创建Kernel
    kernel = sk.Kernel()
    
    # 添加AI服务
    kernel.add_service(
        OpenAIChatCompletion(
            service_id="chat",
            api_key="your-api-key",
            ai_model_id="gpt-3.5-turbo"
        )
    )
    
    return kernel

# 使用示例
# kernel = create_semantic_kernel_agent()
```

## 核心组件详解

### 1. 模型抽象层

**作用**：统一不同LLM的调用接口

```python
from abc import ABC, abstractmethod
from typing import Dict, List, Optional

class ModelProvider(ABC):
    """
    模型提供者抽象基类
    
    定义了统一的模型调用接口
    """
    
    @abstractmethod
    def chat(self, messages: List[Dict], **kwargs) -> str:
        """
        聊天接口
        
        Args:
            messages: 消息列表
            **kwargs: 其他参数
        
        Returns:
            模型回复
        """
        pass
    
    @abstractmethod
    def stream_chat(self, messages: List[Dict], **kwargs):
        """
        流式聊天接口
        
        Args:
            messages: 消息列表
            **kwargs: 其他参数
        
        Returns:
            流式回复
        """
        pass

class OpenAIProvider(ModelProvider):
    """OpenAI模型提供者"""
    
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo"):
        from openai import OpenAI
        self.client = OpenAI(api_key=api_key)
        self.model = model
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            **kwargs
        )
        return response.choices[0].message.content
    
    def stream_chat(self, messages: List[Dict], **kwargs):
        stream = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            stream=True,
            **kwargs
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

class AnthropicProvider(ModelProvider):
    """Anthropic模型提供者"""
    
    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229"):
        import anthropic
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        response = self.client.messages.create(
            model=self.model,
            messages=messages,
            max_tokens=1000,
            **kwargs
        )
        return response.content[0].text
    
    def stream_chat(self, messages: List[Dict], **kwargs):
        with self.client.messages.stream(
            model=self.model,
            messages=messages,
            max_tokens=1000,
            **kwargs
        ) as stream:
            for text in stream.text_stream:
                yield text
```

### 2. 工具管理系统

**作用**：注册、发现、调用工具

```python
from typing import Dict, Callable, Any
from dataclasses import dataclass
import json

@dataclass
class ToolDefinition:
    """工具定义"""
    name: str
    description: str
    parameters: Dict[str, Any]
    function: Callable

class ToolManager:
    """
    工具管理器
    
    负责工具的注册、发现和调用
    """
    
    def __init__(self):
        self.tools: Dict[str, ToolDefinition] = {}
    
    def register(self, name: str, description: str, parameters: Dict, function: Callable):
        """
        注册工具
        
        Args:
            name: 工具名称
            description: 工具描述
            parameters: 参数定义
            function: 工具函数
        """
        self.tools[name] = ToolDefinition(
            name=name,
            description=description,
            parameters=parameters,
            function=function
        )
    
    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        """获取工具"""
        return self.tools.get(name)
    
    def list_tools(self) -> List[Dict]:
        """列出所有工具"""
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters
            }
            for tool in self.tools.values()
        ]
    
    def call(self, name: str, **kwargs) -> Any:
        """
        调用工具
        
        Args:
            name: 工具名称
            **kwargs: 工具参数
        
        Returns:
            工具执行结果
        """
        tool = self.get_tool(name)
        if not tool:
            raise ValueError(f"工具 {name} 不存在")
        
        try:
            return tool.function(**kwargs)
        except Exception as e:
            return {"error": str(e)}

# 使用示例
def search(query: str) -> str:
    """搜索信息"""
    return f"搜索结果：{query}"

def calculate(expression: str) -> str:
    """计算表达式"""
    try:
        result = eval(expression)
        return f"计算结果：{result}"
    except Exception as e:
        return f"计算错误：{e}"

# 创建工具管理器
tool_manager = ToolManager()

# 注册工具
tool_manager.register(
    name="search",
    description="搜索互联网信息",
    parameters={
        "query": {"type": "string", "description": "搜索关键词"}
    },
    function=search
)

tool_manager.register(
    name="calculate",
    description="计算数学表达式",
    parameters={
        "expression": {"type": "string", "description": "数学表达式"}
    },
    function=calculate
)

# 列出工具
print(tool_manager.list_tools())

# 调用工具
result = tool_manager.call("search", query="人工智能")
print(result)
```

### 3. 状态管理

**作用**：管理Agent的执行状态

```python
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json

@dataclass
class AgentState:
    """
    Agent状态
    
    存储Agent执行过程中的所有状态信息
    """
    # 基本信息
    agent_id: str
    task_id: str
    created_at: datetime = field(default_factory=datetime.now)
    
    # 对话状态
    messages: list = field(default_factory=list)
    current_step: str = "init"
    
    # 任务状态
    task_status: str = "pending"  # pending, running, completed, failed
    task_result: Optional[str] = None
    
    # 工具状态
    tool_calls: list = field(default_factory=list)
    tool_results: list = field(default_factory=list)
    
    # 记忆
    short_term_memory: dict = field(default_factory=dict)
    long_term_memory: dict = field(default_factory=dict)
    
    def update(self, **kwargs):
        """更新状态"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def add_message(self, role: str, content: str):
        """添加消息"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
    
    def add_tool_call(self, tool_name: str, parameters: Dict):
        """添加工具调用"""
        self.tool_calls.append({
            "tool": tool_name,
            "parameters": parameters,
            "timestamp": datetime.now().isoformat()
        })
    
    def add_tool_result(self, tool_name: str, result: Any):
        """添加工具结果"""
        self.tool_results.append({
            "tool": tool_name,
            "result": result,
            "timestamp": datetime.now().isoformat()
        })
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            "agent_id": self.agent_id,
            "task_id": self.task_id,
            "created_at": self.created_at.isoformat(),
            "messages": self.messages,
            "current_step": self.current_step,
            "task_status": self.task_status,
            "task_result": self.task_result,
            "tool_calls": self.tool_calls,
            "tool_results": self.tool_results
        }
    
    def save(self, filepath: str):
        """保存状态到文件"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)
    
    @classmethod
    def load(cls, filepath: str) -> 'AgentState':
        """从文件加载状态"""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return cls(**data)

# 使用示例
state = AgentState(
    agent_id="agent_001",
    task_id="task_001"
)

# 更新状态
state.update(current_step="thinking", task_status="running")

# 添加消息
state.add_message("user", "帮我搜索人工智能")
state.add_message("assistant", "好的，我来帮你搜索")

# 添加工具调用
state.add_tool_call("search", {"query": "人工智能"})

# 保存状态
state.save("agent_state.json")
```

### 4. 执行引擎

**作用**：驱动Agent的执行循环

```python
from typing import Dict, Any, Callable
from abc import ABC, abstractmethod

class ExecutionEngine(ABC):
    """
    执行引擎抽象基类
    
    定义了Agent执行的基本流程
    """
    
    @abstractmethod
    def execute(self, task: str, **kwargs) -> Any:
        """执行任务"""
        pass

class ReActEngine(ExecutionEngine):
    """
    ReAct执行引擎
    
    实现了 Observe -> Think -> Act 循环
    """
    
    def __init__(self, model_provider, tool_manager, max_iterations=5):
        self.model_provider = model_provider
        self.tool_manager = tool_manager
        self.max_iterations = max_iterations
    
    def execute(self, task: str, **kwargs) -> Any:
        """执行任务"""
        messages = [{"role": "user", "content": task}]
        tool_results = []
        
        for iteration in range(self.max_iterations):
            # Observe & Think：让模型决定下一步
            prompt = self._build_prompt(messages, tool_results)
            response = self.model_provider.chat([{"role": "user", "content": prompt}])
            
            # 解析响应
            decision = self._parse_response(response)
            
            if decision["action"] == "answer":
                # 任务完成
                return decision["answer"]
            
            elif decision["action"] == "call_tool":
                # Act：调用工具
                tool_name = decision["tool"]
                tool_params = decision["parameters"]
                
                result = self.tool_manager.call(tool_name, **tool_params)
                tool_results.append({
                    "tool": tool_name,
                    "result": result
                })
                
                # 更新消息
                messages.append({"role": "assistant", "content": f"调用工具 {tool_name}"})
                messages.append({"role": "user", "content": f"工具结果：{result}"})
        
        return "达到最大迭代次数"
    
    def _build_prompt(self, messages, tool_results):
        """构建提示"""
        tools_desc = json.dumps(self.tool_manager.list_tools(), ensure_ascii=False)
        results_desc = json.dumps(tool_results, ensure_ascii=False)
        
        return f"""请根据以下信息决定下一步行动。

对话历史：
{json.dumps(messages, ensure_ascii=False)}

可用工具：
{tools_desc}

工具结果：
{results_desc}

请以JSON格式返回决策：
{{
    "action": "call_tool" 或 "answer",
    "tool": "工具名称",
    "parameters": {{}},
    "answer": "最终答案"
}}"""
    
    def _parse_response(self, response):
        """解析响应"""
        try:
            return json.loads(response)
        except:
            return {"action": "answer", "answer": response}
```

## 最佳实践

### 1. 选择合适的Harness

```
选择建议：

快速原型开发：
→ LangChain（组件丰富、社区活跃）

多Agent协作：
→ CrewAI（简单易用）或 AutoGen（功能强大）

企业级应用：
→ Semantic Kernel（微软支持）或 AutoGen

研究探索：
→ LangChain + LangGraph（灵活）
```

### 2. 设计原则

```
1. 模块化设计
   - 模型、工具、状态分离
   - 便于替换和扩展

2. 可观测性
   - 记录执行日志
   - 监控性能指标

3. 错误处理
   - 捕获和处理异常
   - 提供降级方案

4. 可测试性
   - 接口抽象
   - 模拟测试
```

## 下一步学习

- [Skills协议](/day126-130/skills-protocol) - 学习能力打包
- [多Agent系统](/day131-135/) - 学习多Agent协作
- [Agent平台](/day141-145/) - 了解部署和运维
