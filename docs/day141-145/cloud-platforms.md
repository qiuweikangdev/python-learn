# 云服务Agent平台

## 概述

云服务Agent平台是各大云服务商提供的AI Agent开发和部署服务。本章将介绍主流云服务商的Agent平台及其使用方法。

## 主流云服务平台

### 1. OpenAI平台
OpenAI提供的Agent开发服务：
- **GPT API**：GPT系列模型API
- **Assistants API**：助手API，支持工具调用
- **Function Calling**：函数调用功能
- **Fine-tuning**：模型微调服务

```python
from openai import OpenAI

# 初始化客户端
client = OpenAI(api_key="your-api-key")

# 创建助手
assistant = client.beta.assistants.create(
    name="Math Tutor",
    instructions="You are a personal math tutor.",
    model="gpt-4-turbo",
    tools=[
        {
            "type": "function",
            "function": {
                "name": "calculate",
                "description": "Calculate mathematical expressions",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "The mathematical expression to calculate"
                        }
                    },
                    "required": ["expression"]
                }
            }
        }
    ]
)

# 创建线程
thread = client.beta.threads.create()

# 发送消息
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="What is 2 + 2?"
)

# 运行助手
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id
)

# 获取响应
messages = client.beta.threads.messages.list(thread_id=thread.id)
print(messages)
```

### 2. Anthropic平台
Anthropic提供的Claude API：
- **Claude API**：Claude系列模型API
- **Tool Use**：工具使用功能
- **Long Context**：长上下文支持
- **Vision**：图像理解能力

```python
import anthropic

# 初始化客户端
client = anthropic.Anthropic(api_key="your-api-key")

# 创建消息
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello, Claude!"
        }
    ]
)

print(message.content)
```

### 3. Google平台
Google提供的AI服务：
- **Gemini API**：Gemini系列模型API
- **Vertex AI**：AI开发平台
- **Cloud Functions**：云函数服务
- **Cloud Storage**：云存储服务

```python
import google.generativeai as genai

# 配置API密钥
genai.configure(api_key="your-api-key")

# 创建模型
model = genai.GenerativeModel('gemini-pro')

# 生成内容
response = model.generate_content("Hello, Gemini!")
print(response.text)
```

### 4. 微软Azure平台
微软提供的AI服务：
- **Azure OpenAI**：Azure上的OpenAI服务
- **Copilot Studio**：Copilot开发平台
- **Semantic Kernel**：语义内核SDK
- **Azure AI Services**：AI服务集合

```python
from openai import AzureOpenAI

# 初始化客户端
client = AzureOpenAI(
    api_key="your-api-key",
    api_version="2024-02-01",
    azure_endpoint="https://your-resource.openai.azure.com/"
)

# 创建聊天完成
response = client.chat.completions.create(
    model="gpt-35-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

## 平台对比

| 平台 | 优势 | 劣势 | 适用场景 |
|------|------|------|----------|
| **OpenAI** | 模型能力强、生态完善 | 价格较高 | 通用Agent开发 |
| **Anthropic** | 安全性高、长上下文 | API限制较多 | 安全敏感场景 |
| **Google** | 多模态能力强 | 集成复杂 | 多模态应用 |
| **Azure** | 企业级支持、混合部署 | 配置复杂 | 企业应用 |

## 实践指南

### 1. 平台选择
选择平台时考虑：
- **模型能力**：根据任务需求选择模型
- **价格成本**：考虑API调用成本
- **集成难度**：考虑与现有系统的集成
- **安全合规**：考虑数据安全和合规要求

### 2. 多平台集成
```python
class MultiPlatformAgent:
    """多平台Agent"""
    def __init__(self):
        self.platforms = {
            'openai': OpenAI(api_key="openai-key"),
            'anthropic': anthropic.Anthropic(api_key="anthropic-key"),
            'google': genai
        }
    
    def call_platform(self, platform: str, prompt: str) -> str:
        """调用指定平台"""
        if platform == 'openai':
            response = self.platforms['openai'].chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        elif platform == 'anthropic':
            message = self.platforms['anthropic'].messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        elif platform == 'google':
            model = self.platforms['google'].GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
        else:
            raise ValueError(f"Unknown platform: {platform}")
```

### 3. 成本优化
```python
import hashlib
from typing import Dict

class CostOptimizedAgent:
    """成本优化的Agent"""
    def __init__(self):
        self.cache: Dict[str, str] = {}
        self.platform_costs = {
            'openai': 0.002,  # 每1000token的成本
            'anthropic': 0.003,
            'google': 0.001
        }
    
    def get_cache_key(self, platform: str, prompt: str) -> str:
        """生成缓存键"""
        return hashlib.md5(f"{platform}:{prompt}".encode()).hexdigest()
    
    def call_with_cache(self, platform: str, prompt: str) -> str:
        """带缓存的调用"""
        cache_key = self.get_cache_key(platform, prompt)
        
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # 调用API
        result = self.call_platform(platform, prompt)
        
        # 缓存结果
        self.cache[cache_key] = result
        
        return result
    
    def select_platform(self, prompt: str) -> str:
        """选择最经济的平台"""
        # 根据prompt长度和复杂度选择平台
        if len(prompt) < 100:
            return 'google'  # 短prompt使用最便宜的平台
        elif len(prompt) < 500:
            return 'openai'
        else:
            return 'anthropic'  # 长prompt使用支持长上下文的平台
```

## 最佳实践

### 1. API密钥管理
- **环境变量**：使用环境变量存储API密钥
- **密钥轮换**：定期轮换API密钥
- **权限控制**：限制API密钥的权限
- **监控使用**：监控API密钥的使用情况

### 2. 错误处理
```python
import time
from typing import Optional

class RobustAPIClient:
    """健壮的API客户端"""
    def __init__(self, max_retries: int = 3, retry_delay: float = 1.0):
        self.max_retries = max_retries
        self.retry_delay = retry_delay
    
    def call_with_retry(self, func, *args, **kwargs) -> Optional[str]:
        """带重试的API调用"""
        for attempt in range(self.max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if attempt < self.max_retries - 1:
                    print(f"Attempt {attempt + 1} failed: {e}")
                    time.sleep(self.retry_delay * (2 ** attempt))  # 指数退避
                else:
                    print(f"All attempts failed: {e}")
                    return None
```

### 3. 监控和日志
```python
import logging
from datetime import datetime

class APIMonitor:
    """API监控"""
    def __init__(self):
        self.logger = logging.getLogger("api_monitor")
        self.metrics = {
            'total_calls': 0,
            'successful_calls': 0,
            'failed_calls': 0,
            'total_tokens': 0,
            'total_cost': 0.0
        }
    
    def log_call(self, platform: str, success: bool, tokens: int, cost: float):
        """记录API调用"""
        self.metrics['total_calls'] += 1
        if success:
            self.metrics['successful_calls'] += 1
        else:
            self.metrics['failed_calls'] += 1
        
        self.metrics['total_tokens'] += tokens
        self.metrics['total_cost'] += cost
        
        self.logger.info(
            f"API call: platform={platform}, success={success}, "
            f"tokens={tokens}, cost={cost:.4f}"
        )
    
    def get_metrics(self):
        """获取指标"""
        return self.metrics
```

## 常见问题

### 1. API问题
- **认证失败**：检查API密钥
- **速率限制**：实现重试机制
- **超时错误**：调整超时设置
- **配额不足**：升级配额或优化使用

### 2. 成本问题
- **成本过高**：使用缓存、选择合适平台
- **预算超支**：设置使用限制
- **计费错误**：检查计费详情

### 3. 集成问题
- **兼容性问题**：检查API版本
- **依赖冲突**：管理依赖版本
- **网络问题**：检查网络连接

## 下一步学习

- [API服务](/day141-145/api-services) - Agent能力的API化
- [部署与运维](/day141-145/deployment) - Agent系统的部署和监控
- [Agent框架](/day126-130/) - 了解各种Agent框架