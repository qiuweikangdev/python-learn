# LLM应用开发基础

> **版本基线**：本文基于 OpenAI Python SDK ≥1.x（含 Chat Completions 与 Responses API），示例模型为 gpt-5-mini，模型迭代快，以官方模型页为准。更新于 2026-09。

## 概述

大语言模型（LLM）应用开发是构建AI Agent的基础。本章将介绍LLM应用开发的核心概念、技术原理和实践方法。

## 核心概念

### 1. 大语言模型（LLM）
大语言模型是基于Transformer架构的深度学习模型，通过大规模文本数据训练，能够理解和生成自然语言。主要特点包括：
- **规模巨大**：通常包含数十亿甚至数千亿参数
- **通用能力**：能够处理多种自然语言任务
- **上下文理解**：能够理解长文本的上下文信息
- **生成能力**：能够生成连贯、有逻辑的文本

### 2. 提示工程（Prompt Engineering）
提示工程是设计有效Prompt以引导模型行为的技术。关键要素包括：
- **指令清晰**：明确告诉模型需要做什么
- **上下文提供**：提供必要的背景信息
- **格式要求**：指定输出格式
- **示例展示**：通过示例引导模型行为

### 3. 函数调用（Function Calling）
函数调用是让LLM调用外部工具和API的机制。主要特点：
- **工具集成**：让模型能够使用外部工具
- **参数提取**：从用户输入中提取函数参数
- **结果处理**：处理函数执行结果
- **错误处理**：处理函数调用失败的情况

### 4. 工具使用（Tool Use）
工具使用是扩展LLM能力的重要方式。常见工具类型：
- **搜索工具**：互联网搜索、数据库查询
- **计算工具**：数学计算、数据分析
- **文件操作**：读写文件、处理文档
- **API调用**：调用第三方服务API

## 技术原理

### 1. Transformer架构
LLM基于Transformer架构，核心组件包括：
- **自注意力机制**：捕捉序列内部依赖关系
- **多头注意力**：并行处理多个注意力模式
- **前馈网络**：非线性变换
- **位置编码**：编码序列位置信息

### 2. 预训练与微调
LLM的训练过程包括：
- **预训练**：在大规模文本数据上学习语言模式
- **指令微调**：在指令数据上微调以遵循指令
- **RLHF**：通过人类反馈强化学习优化行为

### 3. 推理优化
LLM推理的关键技术：
- **KV缓存**：缓存注意力计算结果
- **批处理**：并行处理多个请求
- **量化**：降低模型精度以提升速度
- **模型并行**：将模型分布到多个设备

## 核心API

### OpenAI API
OpenAI API是最常用的LLM API，主要接口包括：

#### 1. Chat Completions API
```python
from openai import OpenAI

client = OpenAI()  # 自动读取环境变量 OPENAI_API_KEY

response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=[
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ],
    temperature=0.7,
    max_tokens=1000
)
```

::: warning 旧写法对照
`openai.ChatCompletion.create(...)` 是 1.0 之前旧版 SDK 的写法，在现行 SDK（≥1.x）中已不存在。迁移方式：创建 `client = OpenAI()` 客户端对象，改为 `client.chat.completions.create(...)`。
:::

#### 2. Tool Calling API
```python
from openai import OpenAI

client = OpenAI()

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

response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=[{"role": "user", "content": "北京天气怎么样？"}],
    tools=tools,
    tool_choice="auto"
)
```

::: warning 旧写法对照
旧的 `functions=` / `function_call="auto"` 参数已弃用，统一改用 `tools=` + `tool_choice="auto"`；工具结果回传时使用 `role: "tool"`（而非旧的 `role: "function"`）。
:::

### 其他LLM API
#### 1. Anthropic Claude API
```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")
message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "你好！"}
    ]
)
```

#### 2. Google Gemini API
```python
from google import genai

client = genai.Client()  # 自动读取环境变量 GOOGLE_API_KEY / GEMINI_API_KEY
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="你好！"
)
print(response.text)
```

::: warning 旧写法对照
`import google.generativeai as genai` 是已弃用的旧包，现行 SDK 为 `google-genai`（`pip install google-genai`），通过 `genai.Client()` 统一调用。
:::

## 实践指南

### 1. 环境准备
```bash
# 安装必要的库
pip install openai anthropic google-genai

# 设置API密钥
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export GOOGLE_API_KEY="your-google-key"
```

### 2. 基础调用示例
```python
import os
from openai import OpenAI

# 初始化客户端
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 简单对话
def chat_with_gpt(prompt):
    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# 使用示例
response = chat_with_gpt("解释什么是机器学习")
print(response)
```

### 3. 错误处理
```python
import openai
from openai import OpenAI

client = OpenAI()

try:
    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[{"role": "user", "content": "你好！"}]
    )
    print(response.choices[0].message.content)
except openai.APIError as e:
    print(f"API错误: {e}")
except openai.RateLimitError as e:
    print(f"速率限制: {e}")
except Exception as e:
    print(f"未知错误: {e}")
```

## 最佳实践

### 1. 提示设计原则
- **明确具体**：避免模糊指令
- **分步骤**：复杂任务分解为简单步骤
- **提供示例**：通过示例引导模型行为
- **设置约束**：明确输出格式和限制

### 2. 性能优化
- **缓存结果**：避免重复计算
- **批量处理**：减少API调用次数
- **异步调用**：提升并发性能
- **模型选择**：根据任务选择合适的模型

### 3. 成本控制
- **监控使用量**：跟踪API调用次数和费用
- **设置限制**：设置每日/每月使用上限
- **优化提示**：减少不必要的token消耗
- **使用缓存**：缓存常见问题的回答

## 常见问题

### 1. API调用失败
- **检查API密钥**：确保密钥正确且有效
- **检查网络**：确保网络连接正常
- **检查配额**：确保API配额充足
- **查看错误信息**：根据错误信息排查问题

### 2. 模型输出质量差
- **优化提示**：改进提示设计
- **调整参数**：调整temperature等参数
- **提供示例**：添加Few-shot示例
- **使用更高级模型**：考虑使用 GPT-5 家族等更高级模型

### 3. 响应速度慢
- **减少token数量**：精简输入输出
- **使用流式响应**：使用stream参数
- **异步处理**：使用异步API调用
- **选择更快的模型**：根据需求选择模型

## 下一步学习

- [OpenAI API详解](/agent/llm-basics/openai-api) - 深入学习OpenAI API
- [提示工程](/agent/llm-basics/prompt-engineering) - 掌握提示设计技巧
- [函数调用](/agent/llm-basics/function-calling) - 学习工具集成
- [工具使用](/agent/llm-basics/tool-use) - 扩展模型能力