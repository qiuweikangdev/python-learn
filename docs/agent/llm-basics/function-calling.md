# 函数调用

## 什么是函数调用？

函数调用（Function Calling）是让大语言模型（LLM）调用外部工具和API的机制。通过函数调用，LLM可以获取实时信息、执行计算、操作数据等，从而扩展其能力范围。

## 核心概念

### 1. 函数定义
函数调用需要定义函数的接口：
- **函数名称**：函数的唯一标识
- **函数描述**：函数功能的描述
- **参数定义**：函数的输入参数
- **返回值**：函数的返回结果

### 2. 调用流程
函数调用的典型流程：
1. **用户输入**：用户提出需要调用函数的请求
2. **模型决策**：LLM决定是否需要调用函数
3. **参数提取**：从用户输入中提取函数参数
4. **函数执行**：执行函数并获取结果
5. **结果处理**：将结果返回给用户

### 3. 调用模式
函数调用的不同模式：
- **自动调用**：模型自动决定是否调用函数
- **强制调用**：强制模型调用指定函数
- **禁止调用**：禁止模型调用函数

## 技术原理

### 1. 参数提取
LLM从用户输入中提取函数参数：
- **实体识别**：识别输入中的实体
- **关系抽取**：抽取实体之间的关系
- **参数映射**：将实体映射到函数参数

### 2. 函数选择
LLM选择合适的函数：
- **语义匹配**：根据用户意图匹配函数
- **上下文理解**：理解上下文选择函数
- **多函数选择**：选择多个函数组合

### 3. 结果处理
处理函数执行结果：
- **结果解析**：解析函数返回结果
- **格式转换**：转换结果格式
- **错误处理**：处理函数执行错误

## 核心API

### 1. 基础函数调用
```python
# 导入OpenAI库
# openai：OpenAI官方Python客户端库
# 安装：pip install openai
from openai import OpenAI

# 导入json模块
# json：Python内置的JSON处理模块
import json

# 创建OpenAI客户端实例
# OpenAI(api_key)：初始化OpenAI客户端
# api_key参数：OpenAI API密钥
client = OpenAI(api_key="your-api-key")

# 定义函数（Function Calling）
# functions参数：定义模型可以调用的函数列表
# 每个函数是一个字典，包含以下字段：
#   name：函数名称（必须是有效的Python标识符）
#   description：函数功能描述（帮助模型理解何时使用该函数）
#   parameters：函数参数定义（JSON Schema格式）
functions = [
    {
        "name": "get_weather",  # 函数名称
        "description": "获取指定城市的天气信息",  # 函数描述
        "parameters": {  # 参数定义
            "type": "object",  # 参数类型：对象
            "properties": {  # 属性定义
                "location": {
                    "type": "string",  # 类型：字符串
                    "description": "城市名称，如：北京"  # 描述
                },
                "unit": {
                    "type": "string",  # 类型：字符串
                    "enum": ["celsius", "fahrenheit"],  # 枚举值
                    "description": "温度单位"  # 描述
                }
            },
            "required": ["location"]  # 必需的参数
        }
    }
]

# 调用API
# client.chat.completions.create()：创建聊天补全请求
# 参数：
#   model：使用的模型名称
#   messages：消息列表
#   functions：函数定义列表
#   function_call：函数调用模式
#       "auto"：模型自动决定是否调用函数
#       "none"：禁止调用函数
#       {"name": "function_name"}：强制调用指定函数
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    functions=functions,
    function_call="auto"  # 自动决定是否调用函数
)

# 处理函数调用
message = response.choices[0].message

# 检查模型是否决定调用函数
# message.function_call：如果模型决定调用函数，该属性不为None
if message.function_call:
    # 获取函数名称
    function_name = message.function_call.name
    
    # 获取函数参数（JSON字符串）
    # json.loads()：将JSON字符串解析为Python字典
    arguments = json.loads(message.function_call.arguments)
    
    print(f"调用函数: {function_name}")
    print(f"参数: {arguments}")
```

### 2. 多函数调用
```python
# 导入OpenAI库和json模块
from openai import OpenAI
import json

# 创建OpenAI客户端实例
client = OpenAI(api_key="your-api-key")

# 定义多个函数
# 模型可以根据用户请求选择调用一个或多个函数
functions = [
    {
        "name": "get_weather",  # 天气查询函数
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
    },
    {
        "name": "search_restaurant",  # 餐厅搜索函数
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
]

# 调用API
# 用户请求包含多个任务：查询天气和搜索餐厅
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？顺便推荐几家川菜馆"}
    ],
    functions=functions,
    function_call="auto"  # 模型自动决定调用哪些函数
)

# 处理函数调用
message = response.choices[0].message

# 检查是否需要调用函数
if message.function_call:
    # 获取函数名称
    function_name = message.function_call.name
    
    # 获取函数参数
    arguments = json.loads(message.function_call.arguments)
    
    print(f"调用函数: {function_name}")
    print(f"参数: {arguments}")
    
    # 注意：当前API版本一次只能调用一个函数
    # 如果需要调用多个函数，需要多次调用API或使用并行函数调用（Parallel Function Calling）
```

### 3. 强制函数调用
```python
# 导入OpenAI库和json模块
from openai import OpenAI
import json

# 创建OpenAI客户端实例
client = OpenAI(api_key="your-api-key")

# 定义函数
functions = [
    {
        "name": "extract_info",  # 信息提取函数
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
                    "enum": ["name", "date", "location"],  # 可提取的信息类型
                    "description": "要提取的信息类型"
                }
            },
            "required": ["text", "info_type"]  # 两个参数都是必需的
        }
    }
]

# 强制调用函数
# function_call={"name": "extract_info"}：强制模型调用extract_info函数
# 适用场景：当确定需要调用特定函数时
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "张三在北京参加了2024年1月15日的会议"}
    ],
    functions=functions,
    function_call={"name": "extract_info"}  # 强制调用extract_info函数
)

# 处理结果
message = response.choices[0].message

if message.function_call:
    # 解析函数参数
    arguments = json.loads(message.function_call.arguments)
    print(f"提取的信息: {arguments}")
    
    # 示例输出：
    # 提取的信息: {"text": "张三在北京参加了2024年1月15日的会议", "info_type": "name"}
```

## 实践指南

### 1. 环境准备
```bash
# 安装OpenAI库
pip install openai

# 设置环境变量
export OPENAI_API_KEY="your-api-key"
```

### 2. 完整示例
```python
# 导入必要的库
from openai import OpenAI
import json
import requests  # HTTP请求库

# 创建OpenAI客户端实例
client = OpenAI(api_key="your-api-key")

# 定义实际函数
# 这些函数会被模型调用
def get_weather(location: str) -> dict:
    """
    获取天气信息
    
    参数：
        location (str): 城市名称
    
    返回值：
        dict: 天气信息字典
    """
    # 这里应该是实际的天气API调用
    # 示例返回模拟数据
    return {
        "location": location,
        "temperature": 25,
        "condition": "晴朗",
        "humidity": 60
    }

def search_restaurant(location: str, cuisine: str) -> list:
    """
    搜索餐厅
    
    参数：
        location (str): 城市名称
        cuisine (str): 菜系类型
    
    返回值：
        list: 餐厅列表
    """
    # 这里应该是实际的餐厅API调用
    # 示例返回模拟数据
    return [
        {"name": "川菜馆A", "rating": 4.5, "address": "北京市朝阳区"},
        {"name": "川菜馆B", "rating": 4.2, "address": "北京市海淀区"}
    ]

# 函数映射
# 将函数名称映射到实际函数
# 用于根据模型返回的函数名调用对应函数
function_map = {
    "get_weather": get_weather,
    "search_restaurant": search_restaurant
}

# 定义函数描述
# 与之前的函数定义相同
functions = [
    {
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
    },
    {
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
]

def chat_with_functions(user_input: str) -> str:
    """
    带函数调用的对话
    
    参数：
        user_input (str): 用户输入
    
    返回值：
        str: 模型生成的回答
    
    流程：
        1. 第一次调用：模型决定是否调用函数
        2. 如果需要调用函数，执行函数并获取结果
        3. 第二次调用：将函数结果传回模型，生成最终回答
    """
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
    
    # 检查是否需要调用函数
    if message.function_call:
        function_name = message.function_call.name
        arguments = json.loads(message.function_call.arguments)
        
        # 执行函数
        if function_name in function_map:
            # 调用实际函数
            function_result = function_map[function_name](**arguments)
            
            # 第二次调用，将函数结果传回模型
            # 注意：需要将函数结果作为新的消息添加到对话中
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": user_input},  # 原始用户输入
                    message,  # 模型的响应（包含函数调用信息）
                    {
                        "role": "function",  # 角色：函数
                        "name": function_name,  # 函数名称
                        "content": json.dumps(function_result, ensure_ascii=False)  # 函数结果
                    }
                ]
            )
            
            return response.choices[0].message.content
    
    # 如果不需要调用函数，直接返回模型的回答
    return message.content

# 使用示例
response = chat_with_functions("北京今天天气怎么样？顺便推荐几家川菜馆")
print(response)
```

### 3. 错误处理
```python
# 导入必要的库
from openai import OpenAI
import json

# 创建OpenAI客户端实例
client = OpenAI(api_key="your-api-key")

def safe_function_call(user_input: str) -> str:
    """
    安全的函数调用
    
    参数：
        user_input (str): 用户输入
    
    返回值：
        str: 模型生成的回答或错误信息
    
    功能：包含完整的错误处理机制
    """
    try:
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
        
        # 检查是否需要调用函数
        if message.function_call:
            function_name = message.function_call.name
            arguments = json.loads(message.function_call.arguments)
            
            # 验证函数是否存在
            if function_name not in function_map:
                return f"错误：函数 {function_name} 不存在"
            
            # 验证参数
            try:
                # 调用函数
                function_result = function_map[function_name](**arguments)
            except TypeError as e:
                # 参数类型错误
                return f"错误：函数参数不正确 - {e}"
            except Exception as e:
                # 其他执行错误
                return f"错误：函数执行失败 - {e}"
            
            # 将结果传回模型
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": user_input},
                    message,
                    {
                        "role": "function",
                        "name": function_name,
                        "content": json.dumps(function_result, ensure_ascii=False)
                    }
                ]
            )
            
            return response.choices[0].message.content
        
        # 如果不需要调用函数，直接返回
        return message.content
        
    except Exception as e:
        # 捕获所有其他异常
        return f"错误：{e}"

# 使用示例
response = safe_function_call("北京天气怎么样？")
print(response)
```

## 最佳实践

### 1. 函数设计原则
- **单一职责**：每个函数只做一件事
- **清晰描述**：提供清晰的函数描述
- **参数验证**：验证函数参数
- **错误处理**：处理函数执行错误

### 2. 性能优化
- **缓存结果**：缓存函数执行结果
- **异步执行**：异步执行函数
- **批量处理**：批量处理多个函数调用
- **超时控制**：设置函数执行超时

### 3. 安全考虑
- **输入验证**：验证用户输入
- **权限控制**：控制函数调用权限
- **敏感信息**：避免暴露敏感信息
- **审计日志**：记录函数调用日志

## 常见问题

### 1. 函数调用失败
- **函数不存在**：检查函数定义
- **参数错误**：检查参数格式
- **执行超时**：优化函数执行
- **权限不足**：检查函数权限

### 2. 结果不准确
- **描述不清**：优化函数描述
- **参数提取错误**：优化参数定义
- **函数选择错误**：优化函数描述
- **结果处理错误**：优化结果处理

### 3. 性能问题
- **响应慢**：优化函数执行
- **并发限制**：优化并发策略
- **资源占用**：优化资源使用
- **成本高**：优化函数调用

## 下一步学习

- [工具使用](/agent/llm-basics/tool-use) - 扩展模型能力
- [LangChain框架](/agent/langchain/) - 学习LLM应用开发框架
- [Agent框架](/agent/agent-frameworks/) - 了解各种Agent框架