# 工具调用（Tool Calling）

## 什么是工具调用？

工具调用（Tool Calling）是让大语言模型（LLM）调用外部工具和API的机制。通过工具调用，LLM可以获取实时信息、执行计算、操作数据等，从而扩展其能力范围。

## 核心概念

### 1. 工具定义
工具调用需要定义工具的接口：
- **工具名称**：工具的唯一标识
- **工具描述**：工具功能的描述
- **参数定义**：工具的输入参数（JSON Schema格式）
- **返回值**：工具的返回结果

### 2. 调用流程
工具调用的典型流程：
1. **用户输入**：用户提出需要调用工具的请求
2. **模型决策**：LLM决定是否需要调用工具
3. **参数提取**：从用户输入中提取工具参数
4. **工具执行**：执行工具并获取结果
5. **结果处理**：将结果返回给模型，模型生成最终回答

### 3. 调用模式
工具调用的不同模式：
- **自动调用**：模型自动决定是否调用工具（`tool_choice="auto"`）
- **强制调用**：强制模型调用指定工具（`tool_choice={"type": "function", "function": {"name": "xxx"}}`）
- **禁止调用**：禁止模型调用工具（`tool_choice="none"`）

## 技术原理

### 1. 参数提取
LLM从用户输入中提取工具参数：
- **实体识别**：识别输入中的实体
- **关系抽取**：抽取实体之间的关系
- **参数映射**：将实体映射到工具参数

### 2. 工具选择
LLM选择合适的工具：
- **语义匹配**：根据用户意图匹配工具
- **上下文理解**：理解上下文选择工具
- **多工具选择**：选择多个工具组合（并行工具调用）

### 3. 结果处理
处理工具执行结果：
- **结果解析**：解析工具返回结果
- **格式转换**：转换结果格式
- **错误处理**：处理工具执行错误

## 核心API

### 1. 基础工具调用
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 定义工具（使用tools参数，替代旧的functions参数）
tools = [
    {
        "type": "function",  # 工具类型
        "function": {  # 函数定义
            "name": "get_weather",  # 函数名称
            "description": "获取指定城市的天气信息",  # 函数描述
            "parameters": {  # 参数定义（JSON Schema格式）
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "城市名称，如：北京"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位"
                    }
                },
                "required": ["location"]  # 必需参数
            }
        }
    }
]

# 调用API
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    tools=tools,
    tool_choice="auto"  # 自动决定是否调用工具
)

# 处理工具调用
message = response.choices[0].message

# 检查模型是否决定调用工具
if message.tool_calls:
    tool_call = message.tool_calls[0]  # 获取第一个工具调用
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)
    
    print(f"调用工具: {function_name}")
    print(f"参数: {arguments}")
```

### 2. 并行工具调用
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 定义多个工具
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "城市名称"
                    }
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_restaurant",
            "description": "搜索指定城市的餐厅",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "城市名称"
                    },
                    "cuisine": {
                        "type": "string",
                        "description": "菜系类型"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# 用户请求包含多个任务
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？顺便推荐几家川菜馆"}
    ],
    tools=tools,
    tool_choice="auto"
)

# 处理多个工具调用
message = response.choices[0].message
if message.tool_calls:
    for tool_call in message.tool_calls:
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        print(f"调用工具: {function_name}, 参数: {arguments}")
```

### 3. 强制工具调用
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 定义工具
tools = [
    {
        "type": "function",
        "function": {
            "name": "extract_info",
            "description": "从文本中提取信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "需要提取信息的文本"
                    },
                    "info_type": {
                        "type": "string",
                        "enum": ["name", "date", "location"],
                        "description": "要提取的信息类型"
                    }
                },
                "required": ["text", "info_type"]
            }
        }
    }
]

# 强制调用指定工具
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "张三在北京参加了2024年1月15日的会议"}
    ],
    tools=tools,
    tool_choice={
        "type": "function",
        "function": {"name": "extract_info"}  # 强制调用extract_info
    }
)

# 处理结果
message = response.choices[0].message
if message.tool_calls:
    arguments = json.loads(message.tool_calls[0].function.arguments)
    print(f"提取的信息: {arguments}")
```

### 4. 工具调用结果回传
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 定义工具
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "城市名称"}
                },
                "required": ["location"]
            }
        }
    }
]

# 模拟工具执行
def execute_tool(name: str, arguments: dict) -> str:
    """执行工具并返回结果"""
    if name == "get_weather":
        return json.dumps({
            "location": arguments["location"],
            "temperature": 25,
            "condition": "晴朗"
        })
    return "{}"

# 第一轮：获取工具调用
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "北京天气怎么样？"}],
    tools=tools,
    tool_choice="auto"
)

# 获取模型响应和工具调用
assistant_message = response.choices[0].message

# 执行工具并获取结果
if assistant_message.tool_calls:
    tool_call = assistant_message.tool_calls[0]
    tool_result = execute_tool(
        tool_call.function.name,
        json.loads(tool_call.function.arguments)
    )
    
    # 第二轮：将工具结果回传给模型
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": "北京天气怎么样？"},
            assistant_message,  # 模型的工具调用消息
            {
                "role": "tool",  # 工具结果消息
                "tool_call_id": tool_call.id,  # 对应的工具调用ID
                "content": tool_result  # 工具执行结果
            }
        ],
        tools=tools
    )
    
    # 获取最终回答
    final_answer = response.choices[0].message.content
    print(final_answer)
```

## 实践指南

### 1. 环境准备
```bash
pip install openai
export OPENAI_API_KEY="your-api-key"
```

### 2. 完整示例：天气查询助手
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 实际的天气查询函数
def get_weather(location: str) -> dict:
    """获取天气信息（模拟）"""
    return {
        "location": location,
        "temperature": 25,
        "condition": "晴朗",
        "humidity": 60
    }

# 工具定义
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "城市名称"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# 工具执行函数
def run_tool(tool_call):
    """执行工具调用"""
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)
    
    if function_name == "get_weather":
        return get_weather(arguments["location"])
    return {}

# 主对话循环
def chat(user_input: str, conversation_history: list = None):
    """与助手对话"""
    if conversation_history is None:
        conversation_history = []
    
    # 添加用户消息
    conversation_history.append({"role": "user", "content": user_input})
    
    # 调用API
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=conversation_history,
        tools=tools,
        tool_choice="auto"
    )
    
    assistant_message = response.choices[0].message
    conversation_history.append(assistant_message)
    
    # 处理工具调用
    if assistant_message.tool_calls:
        for tool_call in assistant_message.tool_calls:
            tool_result = run_tool(tool_call)
            
            # 添加工具结果
            conversation_history.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(tool_result, ensure_ascii=False)
            })
        
        # 再次调用API获取最终回答
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation_history,
            tools=tools,
            tool_choice="auto"
        )
        assistant_message = response.choices[0].message
        conversation_history.append(assistant_message)
    
    return assistant_message.content, conversation_history

# 使用示例
answer, history = chat("北京天气怎么样？")
print(answer)
```

## 最佳实践

### 1. 工具设计原则
- **单一职责**：每个工具只做一件事
- **清晰描述**：工具描述要准确清晰
- **参数验证**：在工具内部验证参数
- **错误处理**：优雅处理错误情况

### 2. 性能优化
- **减少工具数量**：只定义必要的工具
- **缓存结果**：缓存工具执行结果
- **异步执行**：使用异步工具执行

### 3. 安全考虑
- **输入验证**：验证工具输入参数
- **权限控制**：限制工具使用权限
- **敏感信息**：避免在工具中暴露敏感信息

## 常见问题

### Q1: tools和functions有什么区别？
A: `tools`是新版API，支持并行调用；`functions`是旧版API，已弃用。

### Q2: 如何处理工具调用失败？
A: 在工具内部捕获异常，返回错误信息给模型，让模型决定下一步。

### Q3: 如何支持多个工具同时调用？
A: 新版API支持并行工具调用，模型可以一次返回多个tool_calls。

## 下一步学习

- [工具使用](/agent/llm-basics/tool-use) - 扩展模型能力
- [OpenAI API详解](/agent/llm-basics/openai-api) - 深入学习OpenAI API
- [LangChain核心概念](/agent/langchain/core-concepts) - 学习LangChain框架
