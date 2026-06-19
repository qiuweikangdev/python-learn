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

## 技术方案对比

### 提示类型对比

| 提示类型 | 原理 | 优点 | 缺点 | 适用场景 |
|----------|------|------|------|----------|
| **零样本提示** | 直接给出指令 | 简单快速 | 复杂任务效果差 | 简单分类、翻译 |
| **少样本提示** | 提供示例引导 | 效果稳定 | 需要准备示例 | 特定格式输出 |
| **思维链提示** | 引导逐步推理 | 复杂推理能力强 | 输出较长 | 数学、逻辑推理 |
| **角色提示** | 指定角色身份 | 输出风格可控 | 角色设定需设计 | 专业领域问答 |

### 如何选择提示类型？

**场景判断流程：**
```
任务简单？ → 零样本提示
需要特定格式？ → 少样本提示
需要推理？ → 思维链提示
需要特定风格？ → 角色提示
```

**示例对比：**

任务：判断情感倾向

```
# 零样本提示
"判断以下文本的情感倾向：'这个产品太棒了！'"
效果：一般，可能输出格式不统一

# 少样本提示
"判断情感倾向：
示例1：'质量很好' → 正面
示例2：'太差了' → 负面
示例3：'这个产品太棒了！' → ?"
效果：好，输出格式统一

# 角色提示
"你是一个情感分析专家。请判断以下文本的情感倾向：'这个产品太棒了！'"
效果：好，输出更专业
```

## 设计原理与目的

### 为什么提示能影响模型行为？

**核心原理：条件概率生成**

大语言模型的本质是根据输入预测下一个词：
```
P(输出|输入) = P(词1|输入) × P(词2|输入,词1) × ...
```

提示的作用是改变这个条件概率：
- 好的提示 → 模型更可能生成正确答案
- 差的提示 → 模型可能生成无关内容

**类比理解：**
把模型想象成一个知识渊博的人：
- 模糊的问题 → 得到模糊的回答
- 具体的问题 → 得到具体的回答
- 带有引导的问题 → 得到更有针对性的回答

### 提示设计的核心思想

**1. 明确任务边界**
```
差："帮我处理一下这个文本"
好："请将以下中文翻译成英文，保持原文的语气和风格"
```
为什么？明确的指令减少了模型的"猜测空间"

**2. 提供足够上下文**
```
差："写一篇文章"
好："写一篇关于人工智能在医疗领域应用的文章，面向非技术读者，约500字"
```
为什么？上下文帮助模型理解你的具体需求

**3. 约束输出格式**
```
差："分析一下这个数据"
好："请用以下格式分析数据：
- 关键发现：...
- 趋势分析：...
- 建议：..."
```
为什么？格式约束让输出更可控

### 思维链为什么有效？

**问题：** 小明有5个苹果，给了小红2个，又买了3个，现在有几个？

**直接回答：**
```
问：小明现在有几个苹果？
答：6个
```
模型可能直接给出答案，但容易出错

**思维链回答：**
```
问：请一步步推理：
1. 小明开始有5个苹果
2. 给了小红2个，剩下 5-2=3个
3. 又买了3个，现在有 3+3=6个
答：6个
```
逐步推理减少了错误

**设计目的：**
- 将复杂问题分解为简单步骤
- 让模型"展示工作过程"
- 便于检查和调试

## 应用场景详解

### 场景一：文本分类

**需求：** 将客户反馈分类为"正面"、"负面"、"中性"

**提示设计：**
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

def classify_sentiment(text):
    """情感分类"""
    prompt = f"""请将以下客户反馈分类为"正面"、"负面"或"中性"。

分类规则：
- 正面：表达满意、赞扬、推荐
- 负面：表达不满、投诉、批评
- 中性：客观描述、无明显情感

客户反馈：{text}

请只输出分类结果，不要解释。"""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0  # 分类任务用低温度
    )
    
    return response.choices[0].message.content

# 使用示例
print(classify_sentiment("这个产品太棒了，强烈推荐！"))  # 正面
print(classify_sentiment("质量很差，很失望"))  # 负面
print(classify_sentiment("产品收到了"))  # 中性
```

**设计要点：**
- 提供明确的分类标准
- 使用低temperature保证一致性
- 约束输出格式（只输出分类结果）

### 场景二：信息提取

**需求：** 从文本中提取人名、地点、时间

**提示设计：**
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

def extract_entities(text):
    """实体提取"""
    prompt = f"""请从以下文本中提取实体信息。

提取规则：
- 人名：完整姓名
- 地点：具体地址或城市
- 时间：具体日期或时间

文本：{text}

请以JSON格式输出：
{{
    "persons": ["人名1", "人名2"],
    "locations": ["地点1", "地点2"],
    "times": ["时间1", "时间2"]
}}"""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

# 使用示例
text = "张三和李四于2024年1月15日在北京参加了会议。"
result = extract_entities(text)
print(result)
# 输出：{"persons": ["张三", "李四"], "locations": ["北京"], "times": ["2024年1月15日"]}
```

**设计要点：**
- 明确定义要提取的实体类型
- 指定输出格式（JSON）
- 使用低temperature保证准确性

### 场景三：内容摘要

**需求：** 将长文章压缩为指定长度的摘要

**提示设计：**
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

def summarize(text, max_words=100):
    """生成摘要"""
    prompt = f"""请将以下文章压缩为不超过{max_words}字的摘要。

摘要要求：
- 保留核心信息
- 保持原文主要观点
- 语言简洁明了

文章：
{text}

摘要："""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    
    return response.choices[0].message.content

# 使用示例
article = "人工智能（AI）是计算机科学的一个分支..."  # 长文章
summary = summarize(article, max_words=50)
print(summary)
```

**设计要点：**
- 明确字数限制
- 指定摘要要求（保留核心、语言简洁）
- 使用低temperature保持准确性

### 场景四：代码生成

**需求：** 根据需求描述生成Python代码

**提示设计：**
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

def generate_code(requirement):
    """代码生成"""
    prompt = f"""请根据以下需求生成Python代码。

需求：{requirement}

代码要求：
- 添加必要的注释
- 包含错误处理
- 遵循PEP8规范
- 提供使用示例

请输出完整的可执行代码："""

    response = client.chat.completions.create(
        model="gpt-4",  # 代码生成建议用GPT-4
        messages=[
            {"role": "system", "content": "你是一个专业的Python开发者。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    
    return response.choices[0].message.content

# 使用示例
code = generate_code("实现一个函数，判断一个数是否为素数")
print(code)
```

**设计要点：**
- 使用GPT-4获得更好的代码生成效果
- 指定代码规范和要求
- 使用低temperature保证代码正确性

### 场景五：多轮对话

**需求：** 实现一个能记住上下文的对话系统

**提示设计：**
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

class ChatBot:
    def __init__(self):
        self.messages = [
            {"role": "system", "content": """你是一个友好的AI助手。
规则：
1. 记住之前的对话内容
2. 回答要简洁明了
3. 如果不确定，诚实说不知道"""}
        ]
    
    def chat(self, user_input):
        """对话"""
        self.messages.append({"role": "user", "content": user_input})
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=self.messages,
            temperature=0.7
        )
        
        assistant_message = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": assistant_message})
        
        return assistant_message

# 使用示例
bot = ChatBot()
print(bot.chat("你好，我叫张三"))
print(bot.chat("我叫什么名字？"))  # 能记住之前的信息
```

**设计要点：**
- 维护完整的消息历史
- system prompt定义助手行为
- 使用中等temperature平衡创造性和准确性

## 提示设计技巧

### 1. 零样本提示
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 简单零样本提示
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
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
    model="gpt-3.5-turbo",
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
    model="gpt-3.5-turbo",
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
    model="gpt-3.5-turbo",
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
    model="gpt-3.5-turbo",
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
    model="gpt-3.5-turbo",
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
        model="gpt-3.5-turbo",
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