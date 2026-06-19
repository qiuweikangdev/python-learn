# LangChain最佳实践指南

## 概述

本章介绍LangChain框架在生产环境中的最佳实践，包括设计原则、性能优化、安全考虑和部署策略。

## 设计原则

### 1. 模块化设计
将复杂应用分解为独立的模块：
- **单一职责**：每个模块只负责一个功能
- **接口清晰**：定义清晰的接口
- **松耦合**：模块间低耦合
- **高内聚**：模块内高内聚

### 2. 可组合性
设计可重用的组件：
- **链组合**：将多个链组合成复杂链
- **工具重用**：在不同代理中重用工具
- **提示模板化**：使用可重用的提示模板
- **配置驱动**：通过配置控制行为

### 3. 可测试性
设计可测试的代码：
- **依赖注入**：通过依赖注入解耦组件
- **接口抽象**：使用接口抽象外部依赖
- **模拟对象**：使用模拟对象进行测试
- **单元测试**：编写单元测试验证功能

## 性能优化

### 1. 缓存策略
实现多级缓存：
```python
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache, SQLiteCache

# 内存缓存
set_llm_cache(InMemoryCache())

# SQLite缓存
set_llm_cache(SQLiteCache(database_path=".langchain.db"))

# 自定义缓存
from langchain_core.caches import BaseCache

class CustomCache(BaseCache):
    def lookup(self, prompt, llm_string):
        # 实现缓存查找逻辑
        pass
    
    def update(self, prompt, llm_string, return_val):
        # 实现缓存更新逻辑
        pass
```

### 2. 异步处理
使用异步API提升并发性能：
```python
import asyncio
from langchain_openai import ChatOpenAI

async def process_batch(inputs):
    model = ChatOpenAI(model="gpt-3.5-turbo")
    
    # 异步批量处理
    tasks = [model.ainvoke(input) for input in inputs]
    results = await asyncio.gather(*tasks)
    
    return results

# 使用示例
inputs = ["问题1", "问题2", "问题3"]
results = asyncio.run(process_batch(inputs))
```

### 3. 流式处理
使用流式处理减少延迟：
```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo")

# 流式处理
for chunk in model.stream("请详细解释人工智能"):
    print(chunk.content, end="", flush=True)
```

### 4. 批量处理
批量处理多个请求：
```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo")

# 批量处理
inputs = ["问题1", "问题2", "问题3"]
results = model.batch(inputs)

for result in results:
    print(result.content)
```

## 安全考虑

### 1. 输入验证
验证用户输入，防止注入攻击：
```python
from langchain_core.prompts import ChatPromptTemplate

def validate_input(user_input: str) -> bool:
    """验证用户输入"""
    # 检查输入长度
    if len(user_input) > 1000:
        return False
    
    # 检查恶意内容
    malicious_patterns = ["ignore previous", "system prompt"]
    for pattern in malicious_patterns:
        if pattern in user_input.lower():
            return False
    
    return True

def safe_invoke(chain, user_input: str):
    """安全调用链"""
    if not validate_input(user_input):
        raise ValueError("输入验证失败")
    
    return chain.invoke({"input": user_input})
```

### 2. 权限控制
限制工具使用权限：
```python
from langchain.tools import tool

class ToolPermissionManager:
    def __init__(self):
        self.permissions = {}
    
    def set_permission(self, user_id: str, tool_name: str, allowed: bool):
        """设置用户权限"""
        if user_id not in self.permissions:
            self.permissions[user_id] = {}
        self.permissions[user_id][tool_name] = allowed
    
    def check_permission(self, user_id: str, tool_name: str) -> bool:
        """检查用户权限"""
        return self.permissions.get(user_id, {}).get(tool_name, False)

# 使用示例
permission_manager = ToolPermissionManager()
permission_manager.set_permission("user1", "search", True)
permission_manager.set_permission("user1", "calculate", False)
```

### 3. 敏感信息保护
避免在提示中包含敏感信息：
```python
from langchain_core.prompts import ChatPromptTemplate

def create_safe_prompt(user_input: str, context: dict):
    """创建安全的提示"""
    # 移除敏感信息
    safe_context = {
        k: v for k, v in context.items() 
        if not k.startswith("password") and not k.startswith("secret")
    }
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手。"),
        ("user", f"上下文: {safe_context}\n\n问题: {user_input}")
    ])
    
    return prompt
```

### 4. 审计日志
记录所有操作日志：
```python
import logging
from datetime import datetime

class AuditLogger:
    def __init__(self):
        self.logger = logging.getLogger("audit")
        self.logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler("audit.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def log_action(self, user_id: str, action: str, details: dict):
        """记录操作日志"""
        self.logger.info(
            f"User: {user_id}, Action: {action}, Details: {details}"
        )

# 使用示例
audit_logger = AuditLogger()
audit_logger.log_action("user1", "invoke_chain", {"input": "问题"})
```

## 部署策略

### 1. 容器化部署
使用Docker容器化部署：
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动服务
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. 微服务架构
将应用拆分为微服务：
```yaml
# docker-compose.yml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8000:8000"
  
  agent-service:
    build: ./agent-service
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
  
  tool-service:
    build: ./tool-service
  
  storage-service:
    build: ./storage-service
```

### 3. 配置管理
使用环境变量管理配置：
```python
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    model_name: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: int = 1000
    cache_enabled: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 监控和运维

### 1. 性能监控
监控关键性能指标：
```python
import time
from functools import wraps

def monitor_performance(func):
    """性能监控装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        duration = end_time - start_time
        print(f"{func.__name__} 执行时间: {duration:.2f}秒")
        
        return result
    return wrapper

# 使用示例
@monitor_performance
def process_request(input_text):
    # 处理请求
    pass
```

### 2. 错误处理
实现全面的错误处理：
```python
from langchain_openai import ChatOpenAI
from openai import APIError, RateLimitError

def safe_model_call(model, input_text, max_retries=3):
    """安全的模型调用"""
    for attempt in range(max_retries):
        try:
            response = model.invoke(input_text)
            return response
        except RateLimitError as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # 指数退避
                continue
            raise
        except APIError as e:
            print(f"API错误: {e}")
            raise
        except Exception as e:
            print(f"未知错误: {e}")
            raise
    
    raise Exception("达到最大重试次数")
```

### 3. 日志管理
实现结构化日志：
```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self):
        self.logger = logging.getLogger("structured")
        self.logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler("app.log")
        formatter = logging.Formatter('%(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def log(self, level: str, message: str, **kwargs):
        """记录结构化日志"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
            **kwargs
        }
        self.logger.info(json.dumps(log_entry))

# 使用示例
logger = StructuredLogger()
logger.log("INFO", "请求处理完成", user_id="user1", duration=1.5)
```

## 测试策略

### 1. 单元测试
编写单元测试验证功能：
```python
import pytest
from langchain_openai import ChatOpenAI
from unittest.mock import Mock, patch

def test_model_call():
    """测试模型调用"""
    model = ChatOpenAI(model="gpt-3.5-turbo")
    
    with patch.object(model, 'invoke') as mock_invoke:
        mock_invoke.return_value = Mock(content="测试响应")
        
        response = model.invoke("测试输入")
        
        assert response.content == "测试响应"
        mock_invoke.assert_called_once_with("测试输入")

def test_chain_execution():
    """测试链执行"""
    # 测试链执行逻辑
    pass
```

### 2. 集成测试
编写集成测试验证端到端功能：
```python
import pytest
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

@pytest.mark.integration
def test_end_to_end():
    """端到端测试"""
    model = ChatOpenAI(model="gpt-3.5-turbo")
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个有用的助手。"),
        ("user", "{input}")
    ])
    
    chain = prompt | model | StrOutputParser()
    
    result = chain.invoke({"input": "你好！"})
    
    assert isinstance(result, str)
    assert len(result) > 0
```

### 3. 性能测试
编写性能测试验证性能：
```python
import pytest
import time
from langchain_openai import ChatOpenAI

@pytest.mark.performance
def test_response_time():
    """测试响应时间"""
    model = ChatOpenAI(model="gpt-3.5-turbo")
    
    start_time = time.time()
    response = model.invoke("测试输入")
    end_time = time.time()
    
    duration = end_time - start_time
    assert duration < 5.0  # 响应时间应小于5秒
```

## 常见问题

### 1. 性能问题
- **响应慢**：使用缓存、异步处理、流式处理
- **内存占用高**：优化数据结构、及时释放资源
- **并发限制**：使用异步处理、批量处理
- **成本高**：优化提示、使用更经济的模型

### 2. 安全问题
- **注入攻击**：验证输入、使用安全的提示模板
- **敏感信息泄露**：保护敏感信息、使用安全的存储
- **权限问题**：实现权限控制、审计日志
- **数据安全**：加密数据、安全传输

### 3. 部署问题
- **配置管理**：使用环境变量、配置文件
- **依赖管理**：使用虚拟环境、锁定依赖版本
- **监控告警**：实现监控、设置告警
- **故障恢复**：实现重试机制、备份恢复

## 下一步学习

- [LangGraph工作流](/agent/langgraph/) - 学习基于图的Agent工作流
- [RAG技术](/agent/rag/) - 掌握知识增强技术
- [Agent框架](/agent/agent-frameworks/) - 了解各种Agent框架