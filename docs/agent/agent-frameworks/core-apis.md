# Agent核心API详解

## 概述

本章详细介绍Agent开发中的核心API，包括LLM引擎、工具注册、记忆管理、规划器、执行器等关键组件的API设计和使用方法。

## 1. LLM引擎API

LLM引擎是Agent的核心推理组件，负责理解用户输入、生成响应和决策。

### 1.1 基础LLM调用

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# 创建LLM实例
llm = ChatOpenAI(
    model="gpt-4",                    # 模型名称
    temperature=0.7,                   # 温度参数（0-2），控制随机性
    max_tokens=2000,                   # 最大输出token数
    timeout=30,                        # 请求超时时间（秒）
    max_retries=2,                     # 最大重试次数
    api_key="your-api-key"            # API密钥
)

# 基础调用
response = llm.invoke([
    SystemMessage(content="你是一个专业的AI助手"),
    HumanMessage(content="请解释什么是Agent")
])

print(response.content)
```

### 1.2 流式输出

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(model="gpt-4", streaming=True)

# 流式调用
for chunk in llm.stream([HumanMessage(content="写一个关于AI的故事")]):
    print(chunk.content, end="", flush=True)
```

### 1.3 结构化输出

```python
from langchain_openai import ChatOpenAI
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List

# 定义输出结构
class AgentDecision(BaseModel):
    """Agent决策结果"""
    reasoning: str = Field(description="推理过程")
    action: str = Field(description="要执行的动作")
    action_input: dict = Field(description="动作参数")
    confidence: float = Field(description="置信度 0-1")

# 创建支持结构化输出的LLM
llm = ChatOpenAI(model="gpt-4")
structured_llm = llm.with_structured_output(AgentDecision)

# 调用
result = structured_llm.invoke([
    HumanMessage(content="用户问：今天天气怎么样？请决定下一步动作")
])

print(f"推理: {result.reasoning}")
print(f"动作: {result.action}")
print(f"参数: {result.action_input}")
print(f"置信度: {result.confidence}")
```

### 1.4 多模型切换

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

class LLMManager:
    """LLM管理器 - 支持多模型切换"""
    
    def __init__(self):
        self.models = {
            "gpt-4": ChatOpenAI(model="gpt-4"),
            "gpt-3.5-turbo": ChatOpenAI(model="gpt-3.5-turbo"),
            "claude-3": ChatAnthropic(model="claude-3-sonnet-20240229"),
            "gemini": ChatGoogleGenerativeAI(model="gemini-pro")
        }
        self.default_model = "gpt-4"
    
    def get_model(self, model_name: str = None):
        """获取模型实例"""
        name = model_name or self.default_model
        return self.models.get(name)
    
    def invoke(self, messages, model_name: str = None):
        """调用指定模型"""
        model = self.get_model(model_name)
        return model.invoke(messages)

# 使用示例
manager = LLMManager()
response = manager.invoke(
    [HumanMessage(content="你好")],
    model_name="claude-3"
)
```

## 2. 工具注册API

工具是Agent与外部世界交互的接口，包括搜索、计算、API调用等功能。

### 2.1 @tool装饰器

```python
from langchain_core.tools import tool
from typing import Optional

# 使用@tool装饰器定义工具
@tool
def search_web(query: str, max_results: int = 5) -> str:
    """搜索互联网获取最新信息
    
    Args:
        query: 搜索关键词
        max_results: 最大返回结果数
    
    Returns:
        搜索结果的文本摘要
    """
    # 这里实现实际的搜索逻辑
    return f"搜索 '{query}' 的结果：找到 {max_results} 条相关信息"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式
    
    Args:
        expression: 数学表达式，如 "2 + 3 * 4"
    
    Returns:
        计算结果
    """
    try:
        result = eval(expression)
        return f"计算结果: {result}"
    except Exception as e:
        return f"计算错误: {str(e)}"

@tool
def read_file(file_path: str) -> str:
    """读取文件内容
    
    Args:
        file_path: 文件路径
    
    Returns:
        文件内容
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"读取文件失败: {str(e)}"

# 查看工具信息
print(search_web.name)           # search_web
print(search_web.description)    # 搜索互联网获取最新信息
print(search_web.args_schema.schema())  # 参数JSON Schema
```

### 2.2 StructuredTool

```python
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from typing import List, Optional

# 定义参数Schema
class SearchInput(BaseModel):
    """搜索参数"""
    query: str = Field(description="搜索关键词")
    num_results: int = Field(default=5, description="返回结果数量")
    language: str = Field(default="zh", description="搜索语言")

class SearchResult(BaseModel):
    """搜索结果"""
    title: str = Field(description="标题")
    url: str = Field(description="链接")
    snippet: str = Field(description="摘要")

# 实现工具函数
def search_function(query: str, num_results: int = 5, language: str = "zh") -> List[SearchResult]:
    """执行搜索"""
    # 实际搜索逻辑
    return [
        SearchResult(title=f"结果{i}", url=f"https://example.com/{i}", snippet=f"摘要{i}")
        for i in range(num_results)
    ]

# 创建StructuredTool
search_tool = StructuredTool.from_function(
    func=search_function,
    name="advanced_search",
    description="高级搜索工具，支持多语言和结果数量配置",
    args_schema=SearchInput,
    return_direct=True  # 直接返回结果给用户
)

# 使用工具
result = search_tool.invoke({"query": "Python Agent", "num_results": 3})
print(result)
```

### 2.3 工具注册表

```python
from langchain_core.tools import BaseTool, tool
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class ToolRegistry:
    """工具注册表 - 管理所有可用工具"""
    
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._categories: Dict[str, List[str]] = {}
    
    def register(self, tool: BaseTool, category: str = "general"):
        """注册工具
        
        Args:
            tool: 工具实例
            category: 工具类别
        """
        self._tools[tool.name] = tool
        
        if category not in self._categories:
            self._categories[category] = []
        self._categories[category].append(tool.name)
    
    def get_tool(self, name: str) -> Optional[BaseTool]:
        """获取工具"""
        return self._tools.get(name)
    
    def get_tools(self, category: str = None) -> List[BaseTool]:
        """获取工具列表"""
        if category:
            tool_names = self._categories.get(category, [])
            return [self._tools[name] for name in tool_names if name in self._tools]
        return list(self._tools.values())
    
    def get_tool_names(self) -> List[str]:
        """获取所有工具名称"""
        return list(self._tools.keys())
    
    def remove_tool(self, name: str):
        """移除工具"""
        if name in self._tools:
            del self._tools[name]
            for category, tools in self._categories.items():
                if name in tools:
                    tools.remove(name)

# 使用示例
registry = ToolRegistry()

# 注册工具
registry.register(search_web, category="search")
registry.register(calculate, category="utility")
registry.register(read_file, category="file")

# 获取特定类别的工具
search_tools = registry.get_tools(category="search")
print(f"搜索工具: {[t.name for t in search_tools]}")

# 获取所有工具
all_tools = registry.get_tools()
print(f"所有工具: {[t.name for t in all_tools]}")
```

### 2.4 动态工具加载

```python
import importlib
from langchain_core.tools import BaseTool
from typing import Dict, Any

class DynamicToolLoader:
    """动态工具加载器"""
    
    def __init__(self):
        self.loaded_tools: Dict[str, BaseTool] = {}
    
    def load_from_module(self, module_path: str, tool_names: List[str] = None):
        """从模块加载工具
        
        Args:
            module_path: 模块路径，如 "my_tools.search"
            tool_names: 要加载的工具名称列表，None表示加载所有
        """
        try:
            module = importlib.import_module(module_path)
            
            # 获取模块中所有工具
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if isinstance(attr, BaseTool):
                    if tool_names is None or attr_name in tool_names:
                        self.loaded_tools[attr_name] = attr
                        print(f"加载工具: {attr_name}")
        except Exception as e:
            print(f"加载模块失败: {e}")
    
    def load_from_config(self, config: Dict[str, Any]):
        """从配置加载工具
        
        Args:
            config: 工具配置字典
            {
                "search": {
                    "module": "tools.search",
                    "class": "SearchTool",
                    "params": {"api_key": "xxx"}
                }
            }
        """
        for tool_name, tool_config in config.items():
            try:
                module = importlib.import_module(tool_config["module"])
                tool_class = getattr(module, tool_config["class"])
                tool_instance = tool_class(**tool_config.get("params", {}))
                self.loaded_tools[tool_name] = tool_instance
            except Exception as e:
                print(f"加载工具 {tool_name} 失败: {e}")
    
    def get_tool(self, name: str) -> Optional[BaseTool]:
        """获取工具"""
        return self.loaded_tools.get(name)
```

## 3. 记忆管理API

记忆系统让Agent能够记住对话历史和重要信息。

### 3.1 对话记忆

```python
from langchain.memory import (
    ConversationBufferMemory,
    ConversationSummaryMemory,
    ConversationBufferWindowMemory
)
from langchain_openai import ChatOpenAI

# 1. 缓冲记忆 - 保存完整对话历史
buffer_memory = ConversationBufferMemory(
    return_messages=True,      # 返回消息列表格式
    memory_key="history",      # 在提示中的变量名
    input_key="input",         # 输入变量名
    output_key="output"        # 输出变量名
)

# 2. 窗口记忆 - 只保留最近K轮对话
window_memory = ConversationBufferWindowMemory(
    k=10,                      # 保留最近10轮对话
    return_messages=True,
    memory_key="history"
)

# 3. 摘要记忆 - 使用LLM压缩对话历史
summary_memory = ConversationSummaryMemory(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    return_messages=True,
    memory_key="history"
)

# 使用记忆
memory = ConversationBufferMemory(return_messages=True)

# 保存上下文
memory.save_context(
    {"input": "你好，我叫张三"},
    {"output": "你好张三！很高兴认识你。"}
)

# 加载记忆变量
variables = memory.load_memory_variables({})
print(variables["history"])
```

### 3.2 向量记忆

```python
from langchain.memory import VectorStoreRetrieverMemory
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

class VectorMemory:
    """向量记忆 - 基于语义检索历史信息"""
    
    def __init__(self, collection_name: str = "agent_memory"):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings
        )
        self.retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 5}
        )
        self.memory = VectorStoreRetrieverMemory(
            retriever=self.retriever,
            memory_key="history",
            input_key="input"
        )
    
    def save(self, input_text: str, output_text: str):
        """保存对话到向量存储"""
        self.memory.save_context(
            {"input": input_text},
            {"output": output_text}
        )
    
    def recall(self, query: str, k: int = 5) -> List[str]:
        """根据语义相似度召回相关记忆"""
        docs = self.vectorstore.similarity_search(query, k=k)
        return [doc.page_content for doc in docs]
    
    def clear(self):
        """清空记忆"""
        self.vectorstore.delete_collection()

# 使用示例
vector_memory = VectorMemory()

# 保存记忆
vector_memory.save("我喜欢吃苹果", "了解，你喜欢苹果")
vector_memory.save("我住在北京", "好的，你住在北京")

# 召回相关记忆
relevant_memories = vector_memory.recall("我喜欢什么水果？")
print(f"相关记忆: {relevant_memories}")
```

### 3.3 长期记忆

```python
import json
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict

@dataclass
class MemoryEntry:
    """记忆条目"""
    id: str
    timestamp: str
    category: str
    content: str
    metadata: Dict[str, Any]
    importance: float  # 0-1

class LongTermMemory:
    """长期记忆 - 基于SQLite的持久化记忆"""
    
    def __init__(self, db_path: str = "agent_memory.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                timestamp TEXT,
                category TEXT,
                content TEXT,
                metadata TEXT,
                importance REAL
            )
        """)
        conn.commit()
        conn.close()
    
    def save(self, category: str, content: str, 
             metadata: Dict = None, importance: float = 0.5) -> str:
        """保存记忆"""
        memory_id = f"{category}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        entry = MemoryEntry(
            id=memory_id,
            timestamp=datetime.now().isoformat(),
            category=category,
            content=content,
            metadata=metadata or {},
            importance=importance
        )
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO memories VALUES (?, ?, ?, ?, ?, ?)",
            (entry.id, entry.timestamp, entry.category, 
             entry.content, json.dumps(entry.metadata), entry.importance)
        )
        conn.commit()
        conn.close()
        
        return memory_id
    
    def recall(self, category: str = None, limit: int = 10) -> List[MemoryEntry]:
        """召回记忆"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if category:
            cursor.execute(
                "SELECT * FROM memories WHERE category = ? ORDER BY importance DESC, timestamp DESC LIMIT ?",
                (category, limit)
            )
        else:
            cursor.execute(
                "SELECT * FROM memories ORDER BY importance DESC, timestamp DESC LIMIT ?",
                (limit,)
            )
        
        rows = cursor.fetchall()
        conn.close()
        
        return [
            MemoryEntry(
                id=row[0], timestamp=row[1], category=row[2],
                content=row[3], metadata=json.loads(row[4]), importance=row[5]
            )
            for row in rows
        ]
    
    def search(self, keyword: str, limit: int = 10) -> List[MemoryEntry]:
        """搜索记忆"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM memories WHERE content LIKE ? ORDER BY importance DESC LIMIT ?",
            (f"%{keyword}%", limit)
        )
        rows = cursor.fetchall()
        conn.close()
        
        return [
            MemoryEntry(
                id=row[0], timestamp=row[1], category=row[2],
                content=row[3], metadata=json.loads(row[4]), importance=row[5]
            )
            for row in rows
        ]

# 使用示例
ltm = LongTermMemory()

# 保存重要信息
ltm.save("user_info", "用户喜欢Python编程", {"source": "conversation"}, importance=0.8)
ltm.save("task", "完成了RAG系统开发", {"project": "ai-assistant"}, importance=0.9)

# 召回记忆
user_memories = ltm.recall(category="user_info")
print(f"用户相关记忆: {[m.content for m in user_memories]}")
```

## 4. 规划器API

规划器负责将复杂任务分解为可执行的步骤。

### 4.1 任务分解

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List

class TaskStep(BaseModel):
    """任务步骤"""
    step_number: int = Field(description="步骤编号")
    description: str = Field(description="步骤描述")
    required_tools: List[str] = Field(description="需要的工具")
    dependencies: List[int] = Field(default=[], description="依赖的步骤编号")

class TaskPlan(BaseModel):
    """任务计划"""
    goal: str = Field(description="任务目标")
    steps: List[TaskStep] = Field(description="执行步骤")
    estimated_time: str = Field(description="预估时间")

class TaskPlanner:
    """任务规划器"""
    
    def __init__(self, llm=None):
        self.llm = llm or ChatOpenAI(model="gpt-4")
        self.structured_llm = self.llm.with_structured_output(TaskPlan)
    
    def create_plan(self, task: str, available_tools: List[str]) -> TaskPlan:
        """创建任务执行计划
        
        Args:
            task: 任务描述
            available_tools: 可用工具列表
        
        Returns:
            任务计划
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个任务规划专家。根据用户的任务描述，创建详细的执行计划。
            
可用工具: {tools}

请将任务分解为清晰的步骤，每一步都要指定需要使用的工具。"""),
            ("human", "请为以下任务创建执行计划: {task}")
        ])
        
        chain = prompt | self.structured_llm
        
        plan = chain.invoke({
            "task": task,
            "tools": ", ".join(available_tools)
        })
        
        return plan
    
    def replan(self, original_plan: TaskPlan, 
               completed_steps: List[int], 
               error_info: str = None) -> TaskPlan:
        """重新规划
        
        Args:
            original_plan: 原始计划
            completed_steps: 已完成的步骤
            error_info: 错误信息（如果有）
        
        Returns:
            新的任务计划
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个任务规划专家。根据执行情况重新规划任务。

原始计划: {original_plan}
已完成步骤: {completed_steps}
错误信息: {error_info}

请创建新的执行计划，调整未完成的步骤。"""),
            ("human", "请重新规划任务")
        ])
        
        chain = prompt | self.structured_llm
        
        new_plan = chain.invoke({
            "original_plan": original_plan.json(),
            "completed_steps": str(completed_steps),
            "error_info": error_info or "无"
        })
        
        return new_plan

# 使用示例
planner = TaskPlanner()

# 创建计划
plan = planner.create_plan(
    task="帮我搜索最新的AI新闻，总结要点，并发送邮件给团队",
    available_tools=["search_web", "summarize_text", "send_email"]
)

print(f"任务目标: {plan.goal}")
print(f"执行步骤:")
for step in plan.steps:
    print(f"  {step.step_number}. {step.description} (工具: {step.required_tools})")
```

### 4.2 ReAct规划器

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from typing import List, Dict, Any, Tuple

class ReActPlanner:
    """ReAct规划器 - 推理与行动交替执行"""
    
    def __init__(self, llm=None):
        self.llm = llm or ChatOpenAI(model="gpt-4")
    
    def think(self, task: str, context: str, 
              available_tools: List[str]) -> Tuple[str, str, Dict]:
        """思考下一步行动
        
        Args:
            task: 任务描述
            context: 当前上下文（历史动作和观察结果）
            available_tools: 可用工具
        
        Returns:
            (思考过程, 动作名称, 动作参数)
        """
        prompt = f"""你是一个智能Agent。根据任务和当前情况，决定下一步行动。

任务: {task}

可用工具: {', '.join(available_tools)}

历史动作和观察:
{context}

请按以下格式回答:
Thought: 分析当前情况，思考下一步
Action: 工具名称
Action Input: 工具参数（JSON格式）

如果任务完成，回答:
Thought: 任务已完成
Final Answer: 最终答案"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        
        # 解析响应
        content = response.content
        thought = ""
        action = ""
        action_input = {}
        
        for line in content.split("\n"):
            if line.startswith("Thought:"):
                thought = line[8:].strip()
            elif line.startswith("Action:"):
                action = line[7:].strip()
            elif line.startswith("Action Input:"):
                try:
                    action_input = json.loads(line[13:].strip())
                except:
                    action_input = {"input": line[13:].strip()}
            elif line.startswith("Final Answer:"):
                return "任务完成", "finish", {"answer": line[13:].strip()}
        
        return thought, action, action_input

# 使用示例
react_planner = ReActPlanner()

task = "搜索今天的天气并告诉用户"
context = ""
tools = ["search_weather", "send_message"]

# 模拟ReAct循环
for i in range(5):  # 最多5轮
    thought, action, action_input = react_planner.think(task, context, tools)
    
    print(f"\n--- 第{i+1}轮 ---")
    print(f"思考: {thought}")
    print(f"动作: {action}")
    print(f"参数: {action_input}")
    
    if action == "finish":
        print(f"最终答案: {action_input.get('answer')}")
        break
    
    # 模拟执行动作
    observation = f"执行了 {action}，参数为 {action_input}"
    context += f"\nThought: {thought}\nAction: {action}\nAction Input: {action_input}\nObservation: {observation}\n"
```

## 5. 执行器API

执行器负责实际执行工具调用和处理结果。

### 5.1 基础执行器

```python
from langchain.agents import AgentExecutor
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

class AgentExecutorManager:
    """Agent执行器管理器"""
    
    def __init__(self, llm=None, tools=None):
        self.llm = llm or ChatOpenAI(model="gpt-4")
        self.tools = tools or []
        self.executor = None
    
    def create_executor(self, system_prompt: str) -> AgentExecutor:
        """创建Agent执行器
        
        Args:
            system_prompt: 系统提示词
        
        Returns:
            AgentExecutor实例
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history", optional=True),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        agent = create_openai_tools_agent(self.llm, self.tools, prompt)
        
        self.executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,                  # 打印详细执行过程
            max_iterations=10,             # 最大迭代次数
            max_execution_time=60,         # 最大执行时间（秒）
            handle_parsing_errors=True,    # 处理解析错误
            return_intermediate_steps=True # 返回中间步骤
        )
        
        return self.executor
    
    def execute(self, input_text: str, 
                chat_history: List = None) -> Dict[str, Any]:
        """执行任务
        
        Args:
            input_text: 用户输入
            chat_history: 聊天历史
        
        Returns:
            执行结果
        """
        if not self.executor:
            raise ValueError("请先调用 create_executor 创建执行器")
        
        result = self.executor.invoke({
            "input": input_text,
            "chat_history": chat_history or []
        })
        
        return {
            "output": result["output"],
            "intermediate_steps": [
                {
                    "action": step[0].tool,
                    "input": step[0].tool_input,
                    "output": step[1]
                }
                for step in result.get("intermediate_steps", [])
            ]
        }

# 使用示例
from langchain_core.tools import tool

@tool
def search(query: str) -> str:
    """搜索信息"""
    return f"搜索结果: {query}"

@tool
def calculate(expression: str) -> str:
    """计算表达式"""
    return str(eval(expression))

# 创建执行器
manager = AgentExecutorManager(
    tools=[search, calculate]
)

executor = manager.create_executor(
    system_prompt="你是一个有用的AI助手，可以使用搜索和计算工具。"
)

# 执行任务
result = manager.execute("搜索今天的新闻，然后计算3+5等于多少")
print(f"输出: {result['output']}")
print(f"中间步骤: {result['intermediate_steps']}")
```

### 5.2 错误处理和重试

```python
from langchain.agents import AgentExecutor
from typing import Any, Dict
import time

class RobustAgentExecutor:
    """健壮的Agent执行器 - 支持错误处理和重试"""
    
    def __init__(self, executor: AgentExecutor, max_retries: int = 3):
        self.executor = executor
        self.max_retries = max_retries
    
    def execute_with_retry(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """带重试的执行
        
        Args:
            input_data: 输入数据
        
        Returns:
            执行结果
        """
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                result = self.executor.invoke(input_data)
                return {
                    "success": True,
                    "result": result,
                    "attempts": attempt + 1
                }
            except Exception as e:
                last_error = e
                print(f"第 {attempt + 1} 次执行失败: {str(e)}")
                
                if attempt < self.max_retries - 1:
                    # 指数退避
                    wait_time = 2 ** attempt
                    print(f"等待 {wait_time} 秒后重试...")
                    time.sleep(wait_time)
        
        return {
            "success": False,
            "error": str(last_error),
            "attempts": self.max_retries
        }

# 使用示例
robust_executor = RobustAgentExecutor(executor, max_retries=3)
result = robust_executor.execute_with_retry({"input": "查询天气"})
```

## 6. 状态管理API

状态管理让Agent能够维护和更新执行过程中的状态信息。

### 6.1 状态定义

```python
from typing import TypedDict, Annotated, List, Dict, Any
from operator import add

class AgentState(TypedDict):
    """Agent状态定义"""
    # 用户输入
    input: str
    
    # 对话历史（使用add操作符合并）
    messages: Annotated[List[Dict], add]
    
    # 当前任务
    current_task: str
    
    # 任务计划
    task_plan: Dict[str, Any]
    
    # 已完成的步骤
    completed_steps: Annotated[List[str], add]
    
    # 工具执行结果
    tool_results: Annotated[List[Dict], add]
    
    # 最终输出
    output: str
    
    # 错误信息
    error: str
    
    # 元数据
    metadata: Dict[str, Any]
```

### 6.2 状态管理器

```python
from typing import Dict, Any, Optional
import json
from datetime import datetime

class StateManager:
    """状态管理器"""
    
    def __init__(self):
        self.state: Dict[str, Any] = {}
        self.history: List[Dict[str, Any]] = []
    
    def initialize(self, initial_state: Dict[str, Any]):
        """初始化状态"""
        self.state = initial_state.copy()
        self._save_snapshot("initialize")
    
    def get(self, key: str, default=None) -> Any:
        """获取状态值"""
        return self.state.get(key, default)
    
    def set(self, key: str, value: Any):
        """设置状态值"""
        old_value = self.state.get(key)
        self.state[key] = value
        self._save_snapshot(f"set_{key}")
    
    def update(self, updates: Dict[str, Any]):
        """批量更新状态"""
        self.state.update(updates)
        self._save_snapshot("batch_update")
    
    def append(self, key: str, value: Any):
        """追加到列表状态"""
        if key not in self.state:
            self.state[key] = []
        self.state[key].append(value)
        self._save_snapshot(f"append_{key}")
    
    def get_snapshot(self) -> Dict[str, Any]:
        """获取当前状态快照"""
        return self.state.copy()
    
    def _save_snapshot(self, action: str):
        """保存状态快照"""
        self.history.append({
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "state": self.state.copy()
        })
    
    def get_history(self) -> List[Dict[str, Any]]:
        """获取状态历史"""
        return self.history
    
    def rollback(self, steps: int = 1):
        """回滚到之前的状态"""
        if len(self.history) > steps:
            self.history = self.history[:-steps]
            self.state = self.history[-1]["state"].copy()

# 使用示例
state_manager = StateManager()

# 初始化状态
state_manager.initialize({
    "input": "搜索天气",
    "messages": [],
    "completed_steps": [],
    "output": ""
})

# 更新状态
state_manager.set("current_task", "天气查询")
state_manager.append("completed_steps", "step1_search")
state_manager.update({
    "tool_results": [{"tool": "search", "result": "晴天"}],
    "output": "今天天气晴朗"
})

# 获取状态
print(f"当前任务: {state_manager.get('current_task')}")
print(f"已完成步骤: {state_manager.get('completed_steps')}")
print(f"状态历史: {len(state_manager.get_history())} 条记录")
```

## 总结

本章介绍了Agent开发的六大核心API：

| API | 功能 | 关键类/函数 |
|-----|------|------------|
| **LLM引擎** | 模型调用、流式输出、结构化输出 | `ChatOpenAI`, `with_structured_output` |
| **工具注册** | 定义、注册、管理工具 | `@tool`, `StructuredTool`, `ToolRegistry` |
| **记忆管理** | 对话记忆、向量记忆、长期记忆 | `ConversationBufferMemory`, `VectorMemory` |
| **规划器** | 任务分解、ReAct规划 | `TaskPlanner`, `ReActPlanner` |
| **执行器** | 执行循环、错误处理、重试 | `AgentExecutor`, `RobustAgentExecutor` |
| **状态管理** | 状态定义、更新、历史记录 | `AgentState`, `StateManager` |

## 下一步学习

- [Agent核心技术详解](/agent/agent-frameworks/core-technologies) - 深入理解ReAct、CoT等技术
- [LangChain框架](/agent/langchain/) - 学习LangChain的Agent实现
- [LangGraph工作流](/agent/langgraph/) - 学习基于图的Agent工作流
