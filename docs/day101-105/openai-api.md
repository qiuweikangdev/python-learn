# OpenAI API详解

## 概述

OpenAI API是OpenAI公司提供的大语言模型API服务，是目前最流行的LLM API之一。本章将详细介绍OpenAI API的核心概念、使用方法和最佳实践。

## 核心概念

### 1. 模型类型
OpenAI提供多种模型类型：
- **GPT-4系列**：最强大的多模态模型
- **GPT-3.5系列**：性价比高的文本模型
- **DALL-E**：图像生成模型
- **Whisper**：语音识别模型
- **Embeddings**：文本嵌入模型

### 2. API端点
OpenAI API的主要端点：
- **Chat Completions**：聊天补全API
- **Completions**：文本补全API（已弃用）
- **Images**：图像生成API
- **Audio**：音频处理API
- **Embeddings**：文本嵌入API

### 3. 计费模型
OpenAI API的计费方式：
- **Token计费**：按输入输出token数量计费
- **模型差异**：不同模型价格不同
- **批量折扣**：大量使用有折扣
- **免费额度**：新用户有免费额度

## 核心API

### 1. Chat Completions API
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 基础调用
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ],
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)
```

### 2. 流式响应
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 流式调用
stream = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "写一个关于人工智能的故事"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

### 3. Function Calling
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 定义函数
functions = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "parameters": {
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
            "required": ["location"]
        }
    }
]

# 调用API
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    functions=functions,
    function_call="auto"
)

# 处理函数调用
message = response.choices[0].message
if message.function_call:
    function_name = message.function_call.name
    arguments = json.loads(message.function_call.arguments)
    print(f"调用函数: {function_name}")
    print(f"参数: {arguments}")
```

### 4. Embeddings API
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 获取文本嵌入
response = client.embeddings.create(
    model="text-embedding-ada-002",
    input="这是一段测试文本"
)

embedding = response.data[0].embedding
print(f"嵌入维度: {len(embedding)}")
print(f"前5个值: {embedding[:5]}")
```

### 5. 图像生成API
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 生成图像
response = client.images.generate(
    model="dall-e-3",
    prompt="一只可爱的猫咪在花园里玩耍",
    size="1024x1024",
    quality="standard",
    n=1
)

image_url = response.data[0].url
print(f"图像URL: {image_url}")
```

## 高级功能

### 1. 多轮对话
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 多轮对话
messages = [
    {"role": "system", "content": "你是一个有用的助手。"},
    {"role": "user", "content": "你好！"},
    {"role": "assistant", "content": "你好！有什么可以帮助你的吗？"},
    {"role": "user", "content": "请介绍一下人工智能。"}
]

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages
)

print(response.choices[0].message.content)
```

### 2. 结构化输出
```python
from openai import OpenAI
from pydantic import BaseModel
from typing import List

client = OpenAI(api_key="your-api-key")

# 定义输出格式
class MovieReview(BaseModel):
    title: str
    rating: float
    pros: List[str]
    cons: List[str]
    summary: str

# 使用JSON模式
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "你是一个电影评论家。请以JSON格式输出电影评论。"},
        {"role": "user", "content": "请评论电影《流浪地球》"}
    ],
    response_format={"type": "json_object"}
)

import json
review = json.loads(response.choices[0].message.content)
print(review)
```

### 3. 错误处理
```python
from openai import OpenAI
from openai import (
    APIError,
    RateLimitError,
    APIConnectionError,
    AuthenticationError
)

client = OpenAI(api_key="your-api-key")

try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "你好！"}]
    )
    print(response.choices[0].message.content)
except AuthenticationError as e:
    print(f"认证错误: {e}")
except RateLimitError as e:
    print(f"速率限制: {e}")
except APIConnectionError as e:
    print(f"连接错误: {e}")
except APIError as e:
    print(f"API错误: {e}")
except Exception as e:
    print(f"未知错误: {e}")
```

## 最佳实践

### 1. 提示设计
- **明确指令**：清晰明确地描述任务
- **提供上下文**：提供必要的背景信息
- **指定格式**：明确输出格式要求
- **使用示例**：通过示例引导模型行为

### 2. 性能优化
- **缓存结果**：缓存重复查询结果
- **批量处理**：批量处理多个请求
- **异步调用**：使用异步API提升并发性能
- **模型选择**：根据任务选择合适的模型

### 3. 成本控制
- **监控使用量**：跟踪API调用次数和费用
- **设置限制**：设置每日/每月使用上限
- **优化提示**：减少不必要的token消耗
- **使用缓存**：缓存常见问题的回答

## 常见问题

### 1. 认证问题
- **API密钥错误**：检查API密钥是否正确
- **密钥过期**：重新生成API密钥
- **权限不足**：检查API密钥权限

### 2. 速率限制
- **请求过快**：降低请求频率
- **并发过高**：减少并发请求数量
- **使用重试**：实现指数退避重试

### 3. 响应质量问题
- **输出不准确**：优化提示设计
- **格式错误**：使用结构化输出
- **内容重复**：调整temperature参数

## 下一步学习

- [提示工程](/agent/llm-basics/prompt-engineering) - 学习提示设计技巧
- [函数调用](/agent/llm-basics/function-calling) - 深入学习工具集成
- [工具使用](/agent/llm-basics/tool-use) - 扩展模型能力