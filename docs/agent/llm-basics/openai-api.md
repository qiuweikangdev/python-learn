# OpenAI API详解

## 概述

OpenAI API是OpenAI公司提供的大语言模型API服务，是目前最流行的LLM API之一。本章将详细介绍OpenAI API的核心概念、使用方法和最佳实践。

## 核心概念

### 1. 模型类型
OpenAI提供多种模型类型：
- **GPT-4o系列**：最新的多模态模型，速度快、能力强
- **GPT-4o mini**：轻量级模型，性价比高
- **o1/o3系列**：推理模型，擅长复杂逻辑
- **DALL-E 3**：图像生成模型
- **Whisper**：语音识别模型
- **Embeddings**：文本嵌入模型

### 2. API端点
OpenAI API的主要端点：
- **Chat Completions**：聊天补全API（主要使用）
- **Responses**：新的响应API（推荐）
- **Images**：图像生成API
- **Audio**：音频处理API
- **Embeddings**：文本嵌入API

### 3. 计费模型
OpenAI API的计费方式：
- **Token计费**：按输入输出token数量计费
- **模型差异**：不同模型价格不同
- **批量折扣**：Batch API有50%折扣

## 核心API

### 1. Chat Completions API
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 基础调用
response = client.chat.completions.create(
    model="gpt-4o-mini",  # 推荐使用gpt-4o-mini
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
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "写一个关于人工智能的故事"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

### 3. Tool Calling（函数调用）
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 定义工具（推荐使用tools参数，替代旧的functions参数）
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
    }
]

# 调用API
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    tools=tools,
    tool_choice="auto"
)

# 处理工具调用
message = response.choices[0].message
if message.tool_calls:
    tool_call = message.tool_calls[0]
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)
    print(f"调用函数: {function_name}")
    print(f"参数: {arguments}")
```

### 4. Structured Outputs（结构化输出）
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
response = client.beta.chat.completions.parse(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一个电影评论家。请以JSON格式输出电影评论。"},
        {"role": "user", "content": "请评论电影《流浪地球》"}
    ],
    response_format=MovieReview
)

review = response.choices[0].message.parsed
print(f"电影: {review.title}")
print(f"评分: {review.rating}")
```

### 5. Embeddings API
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 获取文本嵌入（推荐使用text-embedding-3-small）
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="这是一段测试文本"
)

embedding = response.data[0].embedding
print(f"嵌入维度: {len(embedding)}")  # 1536维
print(f"前5个值: {embedding[:5]}")
```

### 6. 图像生成API
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 生成图像（DALL-E 3）
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
    model="gpt-4o-mini",
    messages=messages
)

print(response.choices[0].message.content)
```

### 2. JSON模式
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 强制JSON输出
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一个数据助手。请以JSON格式回复。"},
        {"role": "user", "content": "列出3种编程语言及其特点"}
    ],
    response_format={"type": "json_object"}
)

data = json.loads(response.choices[0].message.content)
print(data)
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
        model="gpt-4o-mini",
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

## 模型选择指南

| 模型 | 特点 | 适用场景 | 价格 |
|------|------|---------|------|
| gpt-4o | 最强多模态 | 复杂任务、图像理解 | 较高 |
| gpt-4o-mini | 快速便宜 | 日常对话、简单任务 | 低 |
| o1 | 推理能力强 | 数学、编程、逻辑 | 高 |
| o3-mini | 推理+性价比 | 中等复杂度推理 | 中等 |

## 最佳实践

### 1. 提示设计
- **明确指令**：清晰明确地描述任务
- **提供上下文**：提供必要的背景信息
- **指定格式**：明确输出格式要求
- **使用示例**：通过示例引导模型行为

### 2. 性能优化
- **缓存结果**：缓存重复查询结果
- **批量处理**：使用Batch API处理大量请求
- **异步调用**：使用异步API提升并发性能
- **模型选择**：简单任务用gpt-4o-mini，复杂任务用gpt-4o

### 3. 成本控制
- **监控使用量**：跟踪API调用次数和费用
- **优化提示**：减少不必要的token消耗
- **使用缓存**：缓存常见问题的回答
- **选择合适模型**：不要过度使用高端模型

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
- **格式错误**：使用Structured Outputs
- **内容重复**：调整temperature参数

## 下一步学习

- [提示工程](/agent/llm-basics/prompt-engineering) - 学习提示设计技巧
- [函数调用](/agent/llm-basics/function-calling) - 深入学习工具集成
- [工具使用](/agent/llm-basics/tool-use) - 扩展模型能力
- [LLM选型指南](/agent/llm-basics/model-selection) - 选择合适的模型
