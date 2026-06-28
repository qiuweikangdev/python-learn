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

## 技术方案对比

### 工具使用方案对比

| 方案 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| **内置工具** | 框架自带工具 | 开箱即用 | 功能有限 | 快速原型开发 |
| **外部工具** | 调用第三方API | 功能丰富 | 需要集成 | 生产环境 |
| **自定义工具** | 自己实现工具 | 完全可控 | 开发成本高 | 特殊需求 |

### 工具描述方式对比

| 描述方式 | 示例 | 优点 | 缺点 |
|----------|------|------|------|
| **JSON Schema** | `{"name": "search", "parameters": {...}}` | 结构化、可验证 | 描述复杂 |
| **自然语言** | "搜索互联网信息" | 简单易懂 | 模型理解可能偏差 |
| **代码示例** | `search(query) -> results` | 精确 | 需要模型理解代码 |

## 设计原理与目的

### 为什么模型能使用工具？

**核心原理：语义理解 + 模式匹配**

模型通过以下方式理解工具：
1. **工具描述**：模型理解工具的功能描述
2. **参数定义**：模型理解需要什么参数
3. **上下文推断**：模型根据用户输入推断需要哪个工具

**类比理解：**
就像人类看到"请用计算器算一下"知道要用计算器一样，模型看到工具描述知道要使用它

### 工具描述的重要性

**好的工具描述 vs 差的工具描述：**

```python
# 差的描述
{
    "name": "search",
    "description": "搜索"
}
# 问题：不知道搜什么、怎么搜

# 好的描述
{
    "name": "web_search",
    "description": "在互联网上搜索信息，返回相关网页标题和摘要",
    "parameters": {
        "query": {
            "type": "string",
            "description": "搜索关键词"
        },
        "num_results": {
            "type": "integer",
            "description": "返回结果数量，默认10",
            "default": 10
        }
    }
}
# 优点：功能明确、参数清晰
```

### 工具选择的决策过程

```
用户输入："帮我查一下北京今天有什么新闻"

模型分析：
1. 意图识别：查询新闻
2. 实体提取：北京、今天
3. 工具匹配：
   - web_search：可以搜索新闻 ✓
   - calculator：不相关 ✗
   - file_reader：不相关 ✗
4. 参数生成：query="北京 今天 新闻"

决策：调用 web_search(query="北京 今天 新闻")
```

### 多工具组合原理

当需要多个工具协同工作时：

```
用户："分析这张图片中的文字并翻译成英文"

模型规划：
1. image_to_text：提取图片中的文字
2. translate：翻译文字

执行流程：
image_to_text(图片) → 文字 → translate(文字, "英文") → 翻译结果
```

**设计目的：**
- 单一工具功能有限
- 组合工具可以完成复杂任务
- 模型可以自动规划工具调用顺序

## 应用场景详解

### 场景一：搜索引擎集成

**需求：** 让模型能够搜索互联网获取最新信息

**实现：**
```python
from openai import OpenAI
import json
import requests

client = OpenAI(api_key="your-api-key")

# 搜索工具实现
def web_search(query, num_results=5):
    """搜索互联网"""
    # 这里使用模拟搜索，实际应该调用搜索API
    # 如：Google Custom Search API、Bing Search API等
    
    results = [
        {"title": f"关于'{query}'的搜索结果1", "snippet": "这是搜索结果的摘要..."},
        {"title": f"关于'{query}'的搜索结果2", "snippet": "这是另一个搜索结果..."},
    ]
    
    return {
        "query": query,
        "results": results[:num_results],
        "total": len(results)
    }

# 工具定义
tools = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "在互联网上搜索信息，获取最新内容",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "搜索关键词"
                    },
                    "num_results": {
                        "type": "integer",
                        "description": "返回结果数量",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        }
    }
]

def chat_with_search(query):
    """带搜索功能的对话"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": query}],
        tools=tools,
        tool_choice="auto"
    )
    
    message = response.choices[0].message
    
    if message.tool_calls:
        tool_call = message.tool_calls[0]
        func_name = tool_call.function.name
        args = json.loads(tool_call.function.arguments)
        
        if func_name == "web_search":
            result = web_search(**args)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": query},
                message,
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False)
                }
            ]
        )
        
        return response.choices[0].message.content
    
    return message.content

# 使用示例
print(chat_with_search("今天的科技新闻有什么？"))
```

**设计要点：**
- 工具描述要清晰说明搜索能力
- 返回结构化的搜索结果
- 模型可以基于搜索结果生成回答

### 场景二：计算工具集成

**需求：** 让模型能够进行精确计算

**实现：**
```python
from openai import OpenAI
import json
import math

client = OpenAI(api_key="your-api-key")

# 计算工具实现
def calculator(expression):
    """计算数学表达式"""
    try:
        # 安全的数学计算环境
        allowed_names = {
            "abs": abs, "round": round,
            "min": min, "max": max,
            "sum": sum, "len": len,
            "math": math
        }
        
        # 替换一些常用函数
        expression = expression.replace("^", "**")
        
        result = eval(expression, {"__builtins__": {}}, allowed_names)
        return {"expression": expression, "result": result}
    except Exception as e:
        return {"expression": expression, "error": str(e)}

# 工具定义
tools = [
    {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "计算数学表达式，支持加减乘除、幂运算、数学函数等",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "数学表达式，如：2+3*4, sqrt(16), sin(3.14)"
                    }
                },
                "required": ["expression"]
            }
        }
    }
]

def chat_with_calculator(query):
    """带计算功能的对话"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": query}],
        tools=tools,
        tool_choice="auto"
    )
    
    message = response.choices[0].message
    
    if message.tool_calls:
        tool_call = message.tool_calls[0]
        args = json.loads(tool_call.function.arguments)
        result = calculator(**args)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": query},
                message,
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False)
                }
            ]
        )
        
        return response.choices[0].message.content
    
    return message.content

# 使用示例
print(chat_with_calculator("计算 (123 + 456) * 789"))
print(chat_with_calculator("计算圆的面积，半径是5"))
```

**设计要点：**
- 安全的表达式执行环境
- 支持多种数学函数
- 返回计算结果和原始表达式

### 场景三：文件操作工具

**需求：** 让模型能够读写文件

**实现：**
```python
from openai import OpenAI
import json
import os

client = OpenAI(api_key="your-api-key")

# 文件操作工具实现
def read_file(file_path):
    """读取文件内容"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return {"file_path": file_path, "content": content, "size": len(content)}
    except Exception as e:
        return {"file_path": file_path, "error": str(e)}

def write_file(file_path, content):
    """写入文件内容"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return {"file_path": file_path, "success": True, "message": "文件写入成功"}
    except Exception as e:
        return {"file_path": file_path, "error": str(e)}

def list_files(directory="."):
    """列出目录中的文件"""
    try:
        files = os.listdir(directory)
        return {"directory": directory, "files": files, "count": len(files)}
    except Exception as e:
        return {"directory": directory, "error": str(e)}

# 工具定义
tools = [
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "读取指定文件的内容",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "文件路径"}
                },
                "required": ["file_path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "将内容写入指定文件",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "文件路径"},
                    "content": {"type": "string", "description": "要写入的内容"}
                },
                "required": ["file_path", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_files",
            "description": "列出指定目录中的文件",
            "parameters": {
                "type": "object",
                "properties": {
                    "directory": {"type": "string", "description": "目录路径，默认为当前目录"}
                }
            }
        }
    }
]

def chat_with_files(query):
    """带文件操作的对话"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": query}],
        tools=tools,
        tool_choice="auto"
    )
    
    message = response.choices[0].message
    
    if message.tool_calls:
        tool_call = message.tool_calls[0]
        func_name = tool_call.function.name
        args = json.loads(tool_call.function.arguments)
        
        if func_name == "read_file":
            result = read_file(**args)
        elif func_name == "write_file":
            result = write_file(**args)
        elif func_name == "list_files":
            result = list_files(**args)
        else:
            result = {"error": "未知工具"}
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": query},
                message,
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False)
                }
            ]
        )
        
        return response.choices[0].message.content
    
    return message.content

# 使用示例
print(chat_with_files("列出当前目录的文件"))
print(chat_with_files("读取config.txt文件的内容"))
print(chat_with_files("创建一个hello.txt文件，内容为'Hello World'"))
```

**设计要点：**
- 完善的错误处理
- 支持多种文件操作
- 返回操作结果和状态

### 场景四：多工具协作

**需求：** 让多个工具协同完成复杂任务

**实现：**
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 多个工具定义
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "城市名称"}
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_restaurant",
            "description": "搜索餐厅",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "城市名称"},
                    "cuisine": {"type": "string", "description": "菜系类型"}
                },
                "required": ["location"]
            }
        }
    }
]

def get_weather(location):
    """获取天气"""
    return {"location": location, "weather": "晴", "temperature": 25}

def search_restaurant(location, cuisine="中餐"):
    """搜索餐厅"""
    return {
        "location": location,
        "cuisine": cuisine,
        "restaurants": [
            {"name": "餐厅A", "rating": 4.5},
            {"name": "餐厅B", "rating": 4.2}
        ]
    }

def chat_with_multiple_tools(query):
    """多工具协作对话"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": query}],
        tools=tools,
        tool_choice="auto"
    )
    
    message = response.choices[0].message
    
    if message.tool_calls:
        # 可能有多个工具调用
        results = []
        for tool_call in message.tool_calls:
            func_name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            
            if func_name == "get_weather":
                result = get_weather(**args)
            elif func_name == "search_restaurant":
                result = search_restaurant(**args)
            else:
                result = {"error": "未知工具"}
            
            results.append({
                "tool_call_id": tool_call.id,
                "result": result
            })
        
        # 构建工具结果消息
        tool_messages = []
        for r in results:
            tool_messages.append({
                "role": "tool",
                "tool_call_id": r["tool_call_id"],
                "content": json.dumps(r["result"], ensure_ascii=False)
            })
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": query},
                message,
                *tool_messages
            ]
        )
        
        return response.choices[0].message.content
    
    return message.content

# 使用示例
print(chat_with_multiple_tools("北京今天天气怎么样？有什么好吃的餐厅推荐？"))
```

**设计要点：**
- 支持多个工具同时调用
- 正确处理多个工具的结果
- 模型可以综合多个工具的信息生成回答

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
        model="gpt-4o-mini",
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
                model="gpt-4o-mini",
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
            model="gpt-4o-mini",
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