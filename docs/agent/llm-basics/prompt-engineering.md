# 提示工程

## 什么是提示工程？

提示工程（Prompt Engineering）是设计有效提示以引导大语言模型（LLM）行为的技术。通过精心设计的提示，可以显著提高模型输出的质量、准确性和相关性。

## 核心概念

### 1. 提示组成
一个完整的提示通常包含：
- **指令**：告诉模型需要做什么
- **上下文**：提供必要的背景信息
- **输入数据**：需要处理的具体内容
- **输出格式**：指定输出的格式要求

### 2. 提示类型
常见的提示类型：
- **零样本提示**：不提供示例，直接给出指令
- **少样本提示**：提供几个示例引导模型
- **思维链提示**：引导模型逐步推理
- **角色提示**：指定模型扮演特定角色

### 3. 提示原则
设计有效提示的原则：
- **明确具体**：避免模糊指令
- **简洁清晰**：避免冗余信息
- **结构化**：使用清晰的结构
- **可测试**：便于验证和迭代

## 技术原理

### 1. 注意力机制
LLM基于Transformer的注意力机制：
- **自注意力**：捕捉序列内部依赖关系
- **多头注意力**：并行处理多个注意力模式
- **位置编码**：编码序列位置信息

### 2. 上下文学习
LLM的上下文学习能力：
- **少样本学习**：从少量示例中学习
- **零样本泛化**：无示例也能理解任务
- **指令遵循**：理解并遵循自然语言指令

### 3. 思维链推理
思维链（Chain-of-Thought）推理：
- **逐步推理**：将复杂问题分解为简单步骤
- **中间步骤**：展示推理的中间过程
- **自我验证**：验证推理过程的正确性

## 提示设计技巧

### 1. 零样本提示
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 简单零样本提示
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "将以下文本翻译成英文：'人工智能是未来的发展方向'"}
    ]
)

print(response.choices[0].message.content)
```

### 2. 少样本提示
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 少样本提示
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一个情感分析专家。"},
        {"role": "user", "content": "示例1：'这个产品太棒了！' -> 正面"},
        {"role": "assistant", "content": "正面"},
        {"role": "user", "content": "示例2：'服务态度很差' -> 负面"},
        {"role": "assistant", "content": "负面"},
        {"role": "user", "content": "请分析：'电影情节很精彩，但演员演技一般'"}
    ]
)

print(response.choices[0].message.content)
```

### 3. 思维链提示
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 思维链提示
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一个数学老师。请逐步解决数学问题。"},
        {"role": "user", "content": "问题：一个商店有15个苹果，卖出了8个，又进货了12个，现在有多少个苹果？\n\n请逐步推理："}
    ]
)

print(response.choices[0].message.content)
```

### 4. 角色提示
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 角色提示
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一个经验丰富的软件工程师，擅长Python编程。请用专业但易懂的方式回答问题。"},
        {"role": "user", "content": "请解释什么是装饰器？"}
    ]
)

print(response.choices[0].message.content)
```

## 高级技巧

### 1. 结构化提示
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 结构化提示
prompt = """
# 任务
请分析以下产品评论，提取关键信息。

# 输入
评论：{{review}}

# 输出格式
请以JSON格式输出：
{
  "sentiment": "正面/负面/中性",
  "key_points": ["要点1", "要点2"],
  "rating": 1-5,
  "summary": "一句话总结"
}

# 要求
1. 情感分析要准确
2. 提取关键要点
3. 给出1-5分的评分
4. 用一句话总结
"""

review = "这款手机拍照效果很好，电池续航也不错，就是价格有点贵。"

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一个产品评论分析专家。"},
        {"role": "user", "content": prompt.replace("{{review}}", review)}
    ],
    response_format={"type": "json_object"}
)

import json
result = json.loads(response.choices[0].message.content)
print(result)
```

### 2. 多轮对话提示
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 多轮对话
messages = [
    {"role": "system", "content": "你是一个旅行顾问。请根据用户的需求推荐旅行目的地。"},
    {"role": "user", "content": "我想去一个温暖的地方度假。"},
    {"role": "assistant", "content": "我推荐您去三亚，那里有美丽的海滩和温暖的气候。"},
    {"role": "user", "content": "预算在5000元左右，有什么建议？"}
]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)

print(response.choices[0].message.content)
```

### 3. 条件提示
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 条件提示
def generate_response(user_input, user_type):
    if user_type == "beginner":
        system_prompt = "你是一个面向初学者的编程老师。请用简单易懂的语言解释概念。"
    elif user_type == "expert":
        system_prompt = "你是一个面向高级开发者的编程专家。可以使用专业术语。"
    else:
        system_prompt = "你是一个编程助手。"
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]
    )
    
    return response.choices[0].message.content

# 使用示例
response = generate_response("请解释什么是递归", "beginner")
print(response)
```

## 最佳实践

### 1. 提示设计原则
- **明确任务**：清晰定义任务目标
- **提供上下文**：提供必要的背景信息
- **指定格式**：明确输出格式要求
- **设置约束**：明确限制条件

### 2. 迭代优化
- **测试验证**：测试提示效果
- **收集反馈**：收集用户反馈
- **持续改进**：根据反馈优化提示
- **版本管理**：管理提示版本

### 3. 错误处理
- **边界情况**：考虑边界情况
- **异常处理**：处理异常输入
- **回退策略**：设计回退策略
- **用户引导**：引导用户正确使用

## 常见问题

### 1. 输出质量差
- **提示模糊**：优化提示设计
- **缺乏上下文**：提供更多上下文
- **格式不明确**：明确输出格式
- **任务复杂**：分解复杂任务

### 2. 响应不稳定
- **温度参数**：调整temperature参数
- **提示一致性**：保持提示一致性
- **模型选择**：选择合适的模型
- **参数调优**：调优其他参数

### 3. 性能问题
- **提示过长**：精简提示内容
- **重复调用**：缓存常见问题
- **并发限制**：优化并发策略
- **模型选择**：选择更高效的模型

## 下一步学习

- [函数调用](/agent/llm-basics/function-calling) - 学习工具集成
- [工具使用](/agent/llm-basics/tool-use) - 扩展模型能力
- [LangChain框架](/agent/langchain/) - 学习LLM应用开发框架