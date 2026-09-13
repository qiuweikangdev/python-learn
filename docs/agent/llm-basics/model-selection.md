# LLM选型指南

> **版本基线**：本文模型信息更新于 2026-09。模型迭代快，选型请以各厂商官方模型页、定价页与基准测试为准。

## 概述

选择合适的大语言模型（LLM）是构建AI应用的关键决策。本章将对比主流LLM的特点，帮助你根据需求选择最合适的模型。

## 主流LLM对比

### 主流模型选型（2026-09）

> **免责声明**：模型迭代非常快，本表仅反映 2026-09 的相对定位，选型请以官方定价与基准为准。

| 模型 | 厂商 | 特点 | 适用场景 | 价格 |
|------|------|------|---------|------|
| GPT-5 家族（gpt-5 / gpt-5-mini / gpt-5-nano） | OpenAI | 主力通用模型，多模态 | 绝大多数生产任务 | 中 |
| gpt-5.4（旗舰） | OpenAI | 当前旗舰，能力最强 | 复杂任务、高难度推理 | 高 |
| Claude Opus 4.6（旗舰） | Anthropic | 能力最强，长文本、代码突出 | 复杂编程、Agent、长文档 | 高 |
| Claude Sonnet 4.5 / Haiku 4.5 | Anthropic | Sonnet 均衡强大，Haiku 快速便宜 | 编程、长文档分析 / 日常任务 | 中 / 低 |
| Gemini 3.x（3.6 Flash 于 2026-07 GA） | Google | 多模态、超长上下文 | 多模态任务、长文档 | 中等 |
| DeepSeek V3 / R1 | DeepSeek | 开源、中文强、推理强 | 中文任务、成本敏感、推理 | 低 |
| Qwen3 系列 | 阿里 | 开源、中文优化、尺寸齐全 | 中文任务、私有部署 | 免费（自部署） |
| Llama 等开源模型 | Meta 等 | 开源生态、可微调 | 私有部署、研究 | 免费（自部署） |

### 模型能力雷达图

```
                GPT-5     Claude     Gemini 3    DeepSeek
编码能力         ★★★★★     ★★★★★        ★★★★☆        ★★★★☆
推理能力         ★★★★★     ★★★★☆        ★★★★☆        ★★★★★
中文能力         ★★★★☆     ★★★★☆        ★★★★☆        ★★★★★
多模态           ★★★★★     ★★★★☆        ★★★★★        ★★★☆☆
长文本           ★★★★☆     ★★★★★        ★★★★★        ★★★★☆
性价比           ★★★★☆     ★★★★☆        ★★★★☆        ★★★★★
```

## 选型维度

### 1. 成本考虑

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| 预算充足 | gpt-5.4 / Claude Opus 4.6 | 能力最强 |
| 性价比优先 | gpt-5-mini | 便宜且够用 |
| 成本敏感 | DeepSeek V3 / R1 | 开源免费或API便宜 |
| 私有部署 | Qwen3 / Llama 3 | 开源免费 |

### 2. 任务类型

| 任务类型 | 推荐模型 | 理由 |
|---------|---------|------|
| 日常对话 | gpt-5-mini / Claude Haiku 4.5 | 快速便宜 |
| 代码生成 | Claude Sonnet 4.5 / GPT-5 家族 | 代码能力强 |
| 数学推理 | DeepSeek R1 / GPT-5 推理 | 推理能力突出 |
| 长文档分析 | Claude Sonnet 4.5 / Gemini 3.x | 长上下文支持 |
| 图像理解 | GPT-5 家族 / Gemini 3.x | 多模态能力强 |
| 中文任务 | DeepSeek V3 / Qwen3 | 中文优化 |

### 3. 部署方式

| 部署方式 | 推荐选择 | 理由 |
|---------|---------|------|
| API调用 | GPT-5 家族 / Claude 4.5 系列 | 简单易用 |
| 私有部署 | Qwen3 / Llama 3 | 开源可控 |
| 边缘设备 | Qwen3 小尺寸版 / Gemma | 小模型轻量 |

## 零基础入门建议

### 第一步：从简单开始

```python
# 推荐入门组合
from openai import OpenAI

client = OpenAI()

# 使用gpt-5-mini（便宜、快速、够用）
response = client.chat.completions.create(
    model="gpt-5-mini",  # 入门首选
    messages=[{"role": "user", "content": "你好！"}]
)
```

### 第二步：根据需求升级

| 如果你需要... | 升级到 |
|--------------|-------|
| 更好的回答质量 | gpt-5 / gpt-5.4 |
| 更快的响应速度 | gpt-5-mini（已够快） |
| 处理图像 | GPT-5 家族 / Gemini 3.x |
| 长文本处理 | Claude Sonnet 4.5 |
| 复杂推理 | DeepSeek R1 / GPT-5 推理 |
| 降低成本 | DeepSeek V3 / gpt-5-nano |

### 第三步：进阶优化

1. **模型路由**：简单任务用小模型，复杂任务用大模型
2. **缓存策略**：缓存常见问题的回答
3. **批量处理**：使用Batch API降低成本

## LangChain中的模型选择

```python
# OpenAI模型
from langchain_openai import ChatOpenAI

# 入门级（便宜快速）
llm = ChatOpenAI(model="gpt-5-mini")

# 高级（能力更强）
llm = ChatOpenAI(model="gpt-5")

# Anthropic模型
from langchain_anthropic import ChatAnthropic

# Claude Sonnet 4.5（代码和长文本强）
llm = ChatAnthropic(model="claude-sonnet-4-5")

# 本地模型（通过Ollama）
# 注意：旧的 langchain_community.llms.Ollama 已弃用，改用 langchain_ollama.ChatOllama
from langchain_ollama import ChatOllama

llm = ChatOllama(model="qwen3:8b")
```

## 成本优化技巧

### 1. 选择合适的模型

```python
# 简单任务用小模型
simple_llm = ChatOpenAI(model="gpt-5-mini")

# 复杂任务用大模型
complex_llm = ChatOpenAI(model="gpt-5")

# 具体价格变化较快，以官方定价页为准
```

### 2. 优化提示

```python
# 差的提示（浪费token）
prompt = "请你非常详细地、全面地、完整地介绍一下Python编程语言的所有方面和特点，包括历史、语法、应用等等等等..."

# 好的提示（精准高效）
prompt = "用100字介绍Python的核心特点"
```

### 3. 使用缓存

::: tip 现代缓存方案（2026-09）
LangChain 0.3 已移除早期的 `langchain.cache`（如 `SQLiteCache`）全局 LLM 缓存机制。当前推荐三层方案：
:::

```python
# 1）OpenAI 请求级 Prompt Caching：对重复前缀自动生效，
#    无需改代码，缓存命中的输入 token 费用约减半
#    （由 OpenAI 服务端自动管理，见官方 Prompt Caching 文档）

# 2）LangSmith 观测：跟踪缓存命中率与 token 消耗
#    pip install langsmith，配置 LANGSMITH_API_KEY 环境变量后在
#    LangSmith 控制台查看每次调用的延迟与成本

# 3）应用层缓存：对确定性问答做应用级缓存（如 Redis）
import redis, json

r = redis.Redis(host="localhost", port=6379, db=0)

def cached_answer(question: str, answer_fn) -> str:
    """应用层缓存示例：命中则直接返回，未命中才调用 LLM"""
    key = f"qa:{question}"
    if (hit := r.get(key)) is not None:
        return json.loads(hit)
    answer = answer_fn(question)
    r.set(key, json.dumps(answer, ensure_ascii=False), ex=86400)
    return answer
```

## 常见问题

### Q1: gpt-5和gpt-5-mini有什么区别？
A: gpt-5能力更强但更贵，gpt-5-mini便宜且速度快，适合大多数日常任务。旗舰 gpt-5.4 用于最复杂的项目。

### Q2: 如何选择OpenAI和Anthropic？
A: OpenAI生态更完善，Anthropic在代码和长文本方面有优势。建议都尝试后选择。

### Q3: 开源模型能用吗？
A: 可以。DeepSeek V3/R1和Qwen3在中文任务上表现优秀，且可私有部署。

### Q4: 如何降低API成本？
A: 使用gpt-5-mini等轻量模型、优化提示、利用 OpenAI 自动 Prompt Caching、应用层缓存（Redis）、使用Batch API。

### Q5: 模型信息会不会很快过时？
A: 会。模型迭代非常快，本文的选型建议反映 2026-09 的情况，实际选型请以各厂商官方模型页、定价页与最新基准为准。

## 下一步学习

- [OpenAI API详解](/agent/llm-basics/openai-api) - 深入学习OpenAI API
- [提示工程](/agent/llm-basics/prompt-engineering) - 学习提示设计技巧
- [LangChain核心概念](/agent/langchain/core-concepts) - 学习LangChain框架
