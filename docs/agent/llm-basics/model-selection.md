# LLM选型指南

## 概述

选择合适的大语言模型（LLM）是构建AI应用的关键决策。本章将对比主流LLM的特点，帮助你根据需求选择最合适的模型。

## 主流LLM对比

### 2025年主流模型

| 模型 | 厂商 | 特点 | 适用场景 | 价格 |
|------|------|------|---------|------|
| GPT-4o | OpenAI | 最强多模态，速度快 | 复杂任务、图像理解 | 中高 |
| GPT-4o-mini | OpenAI | 快速便宜，性价比高 | 日常对话、简单任务 | 低 |
| o1 | OpenAI | 推理能力强 | 数学、编程、逻辑 | 高 |
| o3-mini | OpenAI | 推理+性价比 | 中等复杂度推理 | 中等 |
| Claude 3.5 Sonnet | Anthropic | 长文本、代码能力强 | 长文档分析、编程 | 中等 |
| Claude 3.5 Haiku | Anthropic | 快速便宜 | 日常对话、简单任务 | 低 |
| Gemini 2.0 | Google | 多模态、长上下文 | 多模态任务、长文档 | 中等 |
| DeepSeek-V3 | DeepSeek | 开源、中文强 | 中文任务、成本敏感 | 低 |
| Qwen-2.5 | 阿里 | 开源、中文优化 | 中文任务、私有部署 | 免费 |

### 模型能力雷达图

```
                GPT-4o    Claude 3.5    Gemini 2.0    DeepSeek-V3
编码能力         ★★★★★     ★★★★★        ★★★★☆        ★★★★☆
推理能力         ★★★★★     ★★★★☆        ★★★★☆        ★★★★☆
中文能力         ★★★★☆     ★★★★☆        ★★★★☆        ★★★★★
多模态           ★★★★★     ★★★★☆        ★★★★★        ★★★☆☆
长文本           ★★★★☆     ★★★★★        ★★★★★        ★★★★☆
性价比           ★★★★☆     ★★★★☆        ★★★★☆        ★★★★★
```

## 选型维度

### 1. 成本考虑

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| 预算充足 | GPT-4o | 能力最强 |
| 性价比优先 | GPT-4o-mini | 便宜且够用 |
| 成本敏感 | DeepSeek-V3 | 开源免费或API便宜 |
| 私有部署 | Qwen-2.5 / Llama 3 | 开源免费 |

### 2. 任务类型

| 任务类型 | 推荐模型 | 理由 |
|---------|---------|------|
| 日常对话 | GPT-4o-mini / Claude 3.5 Haiku | 快速便宜 |
| 代码生成 | Claude 3.5 Sonnet / GPT-4o | 代码能力强 |
| 数学推理 | o1 / o3-mini | 推理能力突出 |
| 长文档分析 | Claude 3.5 Sonnet / Gemini 2.0 | 长上下文支持 |
| 图像理解 | GPT-4o / Gemini 2.0 | 多模态能力强 |
| 中文任务 | DeepSeek-V3 / Qwen-2.5 | 中文优化 |

### 3. 部署方式

| 部署方式 | 推荐选择 | 理由 |
|---------|---------|------|
| API调用 | GPT-4o / Claude 3.5 | 简单易用 |
| 私有部署 | Qwen-2.5 / Llama 3 | 开源可控 |
| 边缘设备 | Phi-3 / Gemma | 小模型轻量 |

## 零基础入门建议

### 第一步：从简单开始

```python
# 推荐入门组合
from openai import OpenAI

client = OpenAI()

# 使用GPT-4o-mini（便宜、快速、够用）
response = client.chat.completions.create(
    model="gpt-4o-mini",  # 入门首选
    messages=[{"role": "user", "content": "你好！"}]
)
```

### 第二步：根据需求升级

| 如果你需要... | 升级到 |
|--------------|-------|
| 更好的回答质量 | GPT-4o |
| 更快的响应速度 | GPT-4o-mini（已够快） |
| 处理图像 | GPT-4o |
| 长文本处理 | Claude 3.5 Sonnet |
| 复杂推理 | o1 / o3-mini |
| 降低成本 | DeepSeek-V3 |

### 第三步：进阶优化

1. **模型路由**：简单任务用小模型，复杂任务用大模型
2. **缓存策略**：缓存常见问题的回答
3. **批量处理**：使用Batch API降低成本

## LangChain中的模型选择

```python
# OpenAI模型
from langchain_openai import ChatOpenAI

# 入门级（便宜快速）
llm = ChatOpenAI(model="gpt-4o-mini")

# 高级（能力更强）
llm = ChatOpenAI(model="gpt-4o")

# Anthropic模型
from langchain_anthropic import ChatAnthropic

# Claude 3.5 Sonnet（代码和长文本强）
llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")

# 本地模型（通过Ollama）
from langchain_community.llms import Ollama

llm = Ollama(model="qwen2.5:7b")
```

## 成本优化技巧

### 1. 选择合适的模型

```python
# 简单任务用小模型
simple_llm = ChatOpenAI(model="gpt-4o-mini")  # $0.15/1M tokens

# 复杂任务用大模型
complex_llm = ChatOpenAI(model="gpt-4o")  # $2.5/1M tokens
```

### 2. 优化提示

```python
# 差的提示（浪费token）
prompt = "请你非常详细地、全面地、完整地介绍一下Python编程语言的所有方面和特点，包括历史、语法、应用等等等等..."

# 好的提示（精准高效）
prompt = "用100字介绍Python的核心特点"
```

### 3. 使用缓存

```python
from langchain.cache import SQLiteCache
import langchain

# 启用缓存
langchain.llm_cache = SQLiteCache(database_path=".langchain.db")
```

## 常见问题

### Q1: GPT-4o和GPT-4o-mini有什么区别？
A: GPT-4o能力更强但更贵，GPT-4o-mini便宜且速度快，适合大多数日常任务。

### Q2: 如何选择OpenAI和Anthropic？
A: OpenAI生态更完善，Anthropic在代码和长文本方面有优势。建议都尝试后选择。

### Q3: 开源模型能用吗？
A: 可以。DeepSeek-V3和Qwen-2.5在中文任务上表现优秀，且可私有部署。

### Q4: 如何降低API成本？
A: 使用GPT-4o-mini、优化提示、启用缓存、使用Batch API。

## 下一步学习

- [OpenAI API详解](/agent/llm-basics/openai-api) - 深入学习OpenAI API
- [提示工程](/agent/llm-basics/prompt-engineering) - 学习提示设计技巧
- [LangChain核心概念](/agent/langchain/core-concepts) - 学习LangChain框架
