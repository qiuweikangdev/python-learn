# OpenAI API详解

> **版本基线**：本文基于 OpenAI Python SDK ≥1.x（含 Responses API），示例模型为 gpt-5-mini，模型迭代快，以官方模型页为准。更新于 2026-09。

## 概述

OpenAI API是OpenAI公司提供的大语言模型API服务，是目前最流行的LLM API之一。本章将详细介绍OpenAI API的核心概念、使用方法和最佳实践。

## 核心概念

### 1. 模型类型
OpenAI提供多种模型类型（模型迭代快，具体以官方模型页为准）：
- **GPT-5 家族**：当前主力模型系列，包括 gpt-5 / gpt-5-mini / gpt-5-nano，旗舰为 gpt-5.4
- **o 系列推理模型**：o1、o3-mini 等为上一代推理模型，擅长复杂逻辑，能力已逐步并入 GPT-5 家族
- **DALL-E / 图像模型**：图像生成模型（如 dall-e-3 仍可用）
- **Whisper**：语音识别模型
- **Embeddings**：文本嵌入模型（text-embedding-3-small / text-embedding-3-large）

### 2. API端点
OpenAI API的主要端点：
- **Responses**：2026 年的主力接口（推荐，见下文专门小节）
- **Chat Completions**：聊天补全API（仍在维护，生态最广）
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
    model="gpt-5-mini",  # 日常开发推荐 gpt-5-mini
    messages=[
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ],
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)
```

### 2. Responses API（主力接口）

Responses API 是 OpenAI 2026 年的主力接口：它是一个**有状态**的 API（服务端可保存对话状态，用 `previous_response_id` 即可续写多轮），并**内置了常用工具**——`web_search`（联网搜索）、`file_search`（文件检索）、`code_interpreter`（代码执行）——无需自己定义和执行函数。

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 内置 web_search 工具：模型自动联网检索并标注来源
response = client.responses.create(
    model="gpt-5-mini",
    input=[
        {"role": "user", "content": "OpenAI 最近发布了哪些新模型？请给出信息来源。"}
    ],
    tools=[{"type": "web_search"}]
)

# 直接取最终文本输出
print(response.output_text)
```

**Responses vs Chat Completions 如何选？**

| 场景 | 推荐 |
|------|------|
| 需要联网搜索、文件检索、代码执行等内置能力 | Responses API |
| 多轮对话不想自己维护 messages 历史 | Responses API（有状态） |
| 需要兼容大量第三方库/自建框架（LangChain 等） | Chat Completions |
| 只做简单的无状态补全、成本敏感 | 两者皆可，Chat Completions 生态更成熟 |

::: tip
新项目建议优先评估 Responses API；已有 Chat Completions 代码可以继续使用，两者模型通用。
:::

### 3. 流式响应
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 流式调用
stream = client.chat.completions.create(
    model="gpt-5-mini",
    messages=[
        {"role": "user", "content": "写一个关于人工智能的故事"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

### 4. Tool Calling（函数调用）
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
    model="gpt-5-mini",
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

### 5. Structured Outputs（结构化输出）
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

# 结构化输出已转正：直接使用 parse（无需 beta 前缀）
response = client.chat.completions.parse(
    model="gpt-5-mini",
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

::: warning 旧写法对照
早期版本需要通过 `client.beta.chat.completions.parse`（beta 前缀）调用结构化输出，现已转正为 `client.chat.completions.parse`，请移除 `beta`。
:::

### 6. Embeddings API
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 获取文本嵌入（推荐使用text-embedding-3-small，ada-002已过时）
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="这是一段测试文本"
)

embedding = response.data[0].embedding
print(f"嵌入维度: {len(embedding)}")  # 1536维
print(f"前5个值: {embedding[:5]}")
```

### 7. 图像生成API
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 生成图像（dall-e-3 仍可用；图像模型迭代快，以官方模型页为准）
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
    model="gpt-5-mini",
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
    model="gpt-5-mini",
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
        model="gpt-5-mini",
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

> 模型迭代快，下表仅反映 2026-09 的相对定位，选型请以 OpenAI 官方模型页与定价页为准。

| 模型 | 特点 | 适用场景 | 价格 |
|------|------|---------|------|
| gpt-5.4 | 当前旗舰，能力最强 | 复杂任务、高难度推理 | 高 |
| gpt-5 | 主力通用模型 | 绝大多数生产任务 | 中 |
| gpt-5-mini | 快速便宜 | 日常对话、简单任务 | 低 |
| gpt-5-nano | 最轻量 | 高并发、低延迟场景 | 最低 |
| o1 / o3-mini | 上一代推理模型 | 历史项目维护（新项目建议用 GPT-5 家族） | 高/中等 |

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
- **模型选择**：简单任务用gpt-5-mini，复杂任务用gpt-5 / gpt-5.4

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
