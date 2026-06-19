# 工具使用

## 什么是工具使用？

工具使用（Tool Use）是让大语言模型（LLM）调用外部工具和API来扩展其能力的技术。通过工具使用，LLM可以获取实时信息、执行计算、操作数据、控制设备等。

## 核心概念

### 1. 工具类型
常见的工具类型：
- **信息检索**：搜索互联网、查询数据库
- **数据处理**：计算、统计、分析
- **文件操作**：读写文件、处理文档
- **API调用**：调用第三方服务API
- **设备控制**：控制硬件设备

### 2. 工具接口
工具的接口设计：
- **工具名称**：工具的唯一标识
- **工具描述**：工具功能的描述
- **输入参数**：工具的输入参数
- **输出格式**：工具的输出格式

### 3. 工具调用流程
工具调用的典型流程：
1. **用户输入**：用户提出需要使用工具的请求
2. **工具选择**：LLM选择合适的工具
3. **参数准备**：准备工具的输入参数
4. **工具执行**：执行工具并获取结果
5. **结果处理**：处理工具返回的结果

## 技术原理

### 1. 工具选择机制
LLM选择工具的机制：
- **语义匹配**：根据用户意图匹配工具
- **上下文理解**：理解上下文选择工具
- **能力评估**：评估工具的能力
- **组合使用**：组合多个工具

### 2. 参数生成机制
LLM生成工具参数的机制：
- **实体识别**：识别输入中的实体
- **参数映射**：将实体映射到参数
- **格式转换**：转换参数格式
- **验证检查**：验证参数有效性

### 3. 结果处理机制
处理工具执行结果的机制：
- **结果解析**：解析工具返回结果
- **格式转换**：转换结果格式
- **错误处理**：处理执行错误
- **结果整合**：整合多个工具结果

## 工具设计

### 1. 工具接口设计
```python
from typing import Dict, Any, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class ToolResult:
    success: bool
    data: Any
    error: Optional[str] = None

class Tool(ABC):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    @abstractmethod
    def execute(self, **kwargs) -> ToolResult:
        """执行工具"""
        pass
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.get_parameters()
        }
    
    @abstractmethod
    def get_parameters(self) -> Dict[str, Any]:
        """获取参数定义"""
        pass
```

### 2. 工具注册机制
```python
from typing import Dict, List, Type

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
    
    def register(self, tool: Tool):
        """注册工具"""
        self.tools[tool.name] = tool
    
    def get_tool(self, name: str) -> Optional[Tool]:
        """获取工具"""
        return self.tools.get(name)
    
    def list_tools(self) -> List[str]:
        """列出所有工具"""
        return list(self.tools.keys())
    
    def get_tools_description(self) -> List[Dict[str, Any]]:
        """获取所有工具描述"""
        return [tool.to_dict() for tool in self.tools.values()]

# 使用示例
registry = ToolRegistry()
```

### 3. 工具执行器
```python
from typing import Dict, Any

class ToolExecutor:
    def __init__(self, registry: ToolRegistry):
        self.registry = registry
    
    def execute(self, tool_name: str, **kwargs) -> ToolResult:
        """执行工具"""
        tool = self.registry.get_tool(tool_name)
        if not tool:
            return ToolResult(
                success=False,
                data=None,
                error=f"工具 {tool_name} 不存在"
            )
        
        try:
            result = tool.execute(**kwargs)
            return result
        except Exception as e:
            return ToolResult(
                success=False,
                data=None,
                error=f"工具执行失败: {e}"
            )
```

## 实践指南

### 1. 环境准备
```bash
# 安装必要的库
pip install openai requests

# 设置环境变量
export OPENAI_API_KEY="your-api-key"
```

### 2. 基础工具示例
```python
from openai import OpenAI
import json
import requests

client = OpenAI(api_key="your-api-key")

# 定义工具
class SearchTool:
    def __init__(self):
        self.name = "search"
        self.description = "搜索互联网信息"
    
    def execute(self, query: str) -> dict:
        """执行搜索"""
        # 这里应该是实际的搜索API调用
        return {
            "query": query,
            "results": [
                {"title": "搜索结果1", "url": "https://example.com/1"},
                {"title": "搜索结果2", "url": "https://example.com/2"}
            ]
        }
    
    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "搜索关键词"
                    }
                },
                "required": ["query"]
            }
        }

class CalculatorTool:
    def __init__(self):
        self.name = "calculator"
        self.description = "计算数学表达式"
    
    def execute(self, expression: str) -> dict:
        """执行计算"""
        try:
            result = eval(expression)
            return {"expression": expression, "result": result}
        except Exception as e:
            return {"expression": expression, "error": str(e)}
    
    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "数学表达式"
                    }
                },
                "required": ["expression"]
            }
        }

# 创建工具实例
search_tool = SearchTool()
calculator_tool = CalculatorTool()

# 工具列表
tools = [search_tool, calculator_tool]

# 转换为OpenAI函数格式
functions = [tool.to_dict() for tool in tools]

# 工具映射
tool_map = {tool.name: tool for tool in tools}
```

### 3. 带工具的对话
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

def chat_with_tools(user_input: str) -> str:
    """带工具的对话"""
    # 第一次调用
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": user_input}
        ],
        functions=functions,
        function_call="auto"
    )
    
    message = response.choices[0].message
    
    # 检查是否需要调用工具
    if message.function_call:
        tool_name = message.function_call.name
        arguments = json.loads(message.function_call.arguments)
        
        # 执行工具
        if tool_name in tool_map:
            tool_result = tool_map[tool_name].execute(**arguments)
            
            # 第二次调用，将工具结果传回模型
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": user_input},
                    message,
                    {
                        "role": "function",
                        "name": tool_name,
                        "content": json.dumps(tool_result, ensure_ascii=False)
                    }
                ]
            )
            
            return response.choices[0].message.content
    
    return message.content

# 使用示例
response = chat_with_tools("搜索人工智能最新进展，然后计算2+3等于多少")
print(response)
```

### 4. 多工具组合
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

def chat_with_multiple_tools(user_input: str) -> str:
    """带多个工具的对话"""
    messages = [
        {"role": "user", "content": user_input}
    ]
    
    while True:
        # 调用API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            functions=functions,
            function_call="auto"
        )
        
        message = response.choices[0].message
        
        # 检查是否需要调用工具
        if message.function_call:
            tool_name = message.function_call.name
            arguments = json.loads(message.function_call.arguments)
            
            # 执行工具
            if tool_name in tool_map:
                tool_result = tool_map[tool_name].execute(**arguments)
                
                # 将工具结果添加到消息
                messages.append(message)
                messages.append({
                    "role": "function",
                    "name": tool_name,
                    "content": json.dumps(tool_result, ensure_ascii=False)
                })
                
                # 继续对话
                continue
        
        # 返回最终结果
        return message.content

# 使用示例
response = chat_with_multiple_tools("搜索人工智能最新进展，然后计算2+3等于多少，最后总结一下")
print(response)
```

## 高级功能

### 1. 工具链
```python
from typing import List, Dict, Any

class ToolChain:
    def __init__(self, tools: List[Tool]):
        self.tools = tools
        self.results: Dict[str, Any] = {}
    
    def execute(self, user_input: str) -> Dict[str, Any]:
        """执行工具链"""
        # 这里应该实现工具链的执行逻辑
        # 例如：先搜索，再分析，最后总结
        pass

# 使用示例
chain = ToolChain([search_tool, calculator_tool])
result = chain.execute("搜索人工智能最新进展")
```

### 2. 工具缓存
```python
from typing import Dict, Any
import hashlib
import json

class ToolCache:
    def __init__(self):
        self.cache: Dict[str, Any] = {}
    
    def get_cache_key(self, tool_name: str, **kwargs) -> str:
        """生成缓存键"""
        key_data = {"tool": tool_name, "args": kwargs}
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, tool_name: str, **kwargs) -> Any:
        """获取缓存"""
        key = self.get_cache_key(tool_name, **kwargs)
        return self.cache.get(key)
    
    def set(self, tool_name: str, result: Any, **kwargs):
        """设置缓存"""
        key = self.get_cache_key(tool_name, **kwargs)
        self.cache[key] = result

# 使用示例
cache = ToolCache()
```

### 3. 工具监控
```python
from typing import Dict, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ToolCallRecord:
    tool_name: str
    arguments: Dict[str, Any]
    result: Any
    duration: float
    timestamp: datetime

class ToolMonitor:
    def __init__(self):
        self.records: List[ToolCallRecord] = []
    
    def record(self, record: ToolCallRecord):
        """记录工具调用"""
        self.records.append(record)
    
    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        if not self.records:
            return {}
        
        total_calls = len(self.records)
        successful_calls = sum(1 for r in self.records if r.result is not None)
        average_duration = sum(r.duration for r in self.records) / total_calls
        
        return {
            "total_calls": total_calls,
            "successful_calls": successful_calls,
            "success_rate": successful_calls / total_calls,
            "average_duration": average_duration
        }

# 使用示例
monitor = ToolMonitor()
```

## 最佳实践

### 1. 工具设计原则
- **单一职责**：每个工具只做一件事
- **清晰接口**：提供清晰的接口定义
- **错误处理**：处理工具执行错误
- **性能优化**：优化工具执行性能

### 2. 安全考虑
- **输入验证**：验证工具输入
- **权限控制**：控制工具使用权限
- **敏感信息**：保护敏感信息
- **审计日志**：记录工具调用日志

### 3. 性能优化
- **缓存机制**：缓存工具结果
- **异步执行**：异步执行工具
- **批量处理**：批量处理多个工具调用
- **资源管理**：管理工具资源

## 常见问题

### 1. 工具调用失败
- **工具不存在**：检查工具注册
- **参数错误**：检查参数格式
- **执行超时**：优化工具执行
- **权限不足**：检查工具权限

### 2. 结果不准确
- **工具选择错误**：优化工具描述
- **参数提取错误**：优化参数定义
- **结果处理错误**：优化结果处理
- **工具质量问题**：优化工具实现

### 3. 性能问题
- **响应慢**：优化工具执行
- **并发限制**：优化并发策略
- **资源占用**：优化资源使用
- **成本高**：优化工具调用

## 下一步学习

- [LangChain框架](/agent/langchain/) - 学习LLM应用开发框架
- [Agent框架](/agent/agent-frameworks/) - 了解各种Agent框架
- [RAG技术](/agent/rag/) - 掌握知识增强技术