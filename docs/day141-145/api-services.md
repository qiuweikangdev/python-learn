# API服务

## 概述

API服务是将Agent能力封装为API接口，供其他应用调用。本章将介绍如何设计和实现Agent API服务。

## 核心概念

### 1. API设计原则
API设计的基本原则：
- **RESTful**：遵循REST架构风格
- **版本控制**：支持API版本管理
- **文档完善**：提供完整的API文档
- **错误处理**：统一的错误处理机制

### 2. 接口类型
常见的API接口类型：
- **同步接口**：立即返回结果
- **异步接口**：返回任务ID，异步获取结果
- **流式接口**：流式返回数据
- **WebSocket**：实时双向通信

### 3. 认证授权
API认证授权机制：
- **API Key**：API密钥认证
- **OAuth 2.0**：OAuth2认证
- **JWT**：JSON Web Token认证
- **RBAC**：基于角色的访问控制

## 核心API

### 1. FastAPI实现
```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Agent API", version="1.0.0")

# 请求模型
class AgentRequest(BaseModel):
    query: str
    context: Optional[str] = None
    model: str = "gpt-3.5-turbo"
    max_tokens: int = 1000

# 响应模型
class AgentResponse(BaseModel):
    response: str
    tokens_used: int
    model: str

# API端点
@app.post("/agent/chat", response_model=AgentResponse)
async def chat(request: AgentRequest):
    """聊天接口"""
    try:
        # 调用Agent
        response = await call_agent(
            query=request.query,
            context=request.context,
            model=request.model,
            max_tokens=request.max_tokens
        )
        
        return AgentResponse(
            response=response["content"],
            tokens_used=response["tokens"],
            model=request.model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agent/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 2. Flask实现
```python
from flask import Flask, request, jsonify
from functools import wraps
import jwt

app = Flask(__name__)

# 认证装饰器
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Missing token'}), 401
        
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            request.user = payload
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated

@app.route('/agent/chat', methods=['POST'])
@require_auth
def chat():
    """聊天接口"""
    data = request.get_json()
    
    if not data or 'query' not in data:
        return jsonify({'error': 'Missing query'}), 400
    
    try:
        # 调用Agent
        response = call_agent(
            query=data['query'],
            context=data.get('context'),
            model=data.get('model', 'gpt-3.5-turbo')
        )
        
        return jsonify({
            'response': response['content'],
            'tokens_used': response['tokens']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

### 3. 异步接口
```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import asyncio
import uuid

app = FastAPI()

# 任务存储
tasks = {}

class AsyncTaskRequest(BaseModel):
    query: str
    callback_url: Optional[str] = None

class AsyncTaskResponse(BaseModel):
    task_id: str
    status: str

@app.post("/agent/async-chat", response_model=AsyncTaskResponse)
async def async_chat(request: AsyncTaskRequest, background_tasks: BackgroundTasks):
    """异步聊天接口"""
    task_id = str(uuid.uuid4())
    
    # 创建任务
    tasks[task_id] = {
        'status': 'pending',
        'result': None
    }
    
    # 后台执行任务
    background_tasks.add_task(execute_task, task_id, request.query)
    
    return AsyncTaskResponse(
        task_id=task_id,
        status='pending'
    )

@app.get("/agent/task/{task_id}")
async def get_task(task_id: str):
    """获取任务状态"""
    if task_id not in tasks:
        return {'error': 'Task not found'}, 404
    
    task = tasks[task_id]
    return {
        'task_id': task_id,
        'status': task['status'],
        'result': task['result']
    }

async def execute_task(task_id: str, query: str):
    """执行任务"""
    try:
        # 模拟长时间任务
        await asyncio.sleep(5)
        
        # 调用Agent
        result = await call_agent(query)
        
        # 更新任务状态
        tasks[task_id] = {
            'status': 'completed',
            'result': result
        }
    except Exception as e:
        tasks[task_id] = {
            'status': 'failed',
            'error': str(e)
        }
```

### 4. 流式接口
```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio

app = FastAPI()

class StreamRequest(BaseModel):
    query: str
    model: str = "gpt-3.5-turbo"

@app.post("/agent/stream")
async def stream_chat(request: StreamRequest):
    """流式聊天接口"""
    async def generate():
        # 模拟流式响应
        async for chunk in stream_agent_response(request.query, request.model):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )

async def stream_agent_response(query: str, model: str):
    """流式Agent响应"""
    # 模拟流式输出
    response = f"This is a streaming response to: {query}"
    for char in response:
        yield char
        await asyncio.sleep(0.05)
```

## 实践指南

### 1. 环境准备
```bash
# 安装依赖
pip install fastapi uvicorn pydantic

# 运行服务
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. 完整示例
```python
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional
import jwt
from datetime import datetime, timedelta

app = FastAPI(
    title="Agent API",
    description="AI Agent API服务",
    version="1.0.0"
)

# 安全配置
security = HTTPBearer()
SECRET_KEY = "your-secret-key"

# 模型定义
class ChatRequest(BaseModel):
    query: str = Field(..., description="用户查询")
    context: Optional[str] = Field(None, description="上下文信息")
    model: str = Field("gpt-3.5-turbo", description="模型名称")
    temperature: float = Field(0.7, ge=0, le=2, description="温度参数")
    max_tokens: int = Field(1000, ge=1, le=4000, description="最大token数")

class ChatResponse(BaseModel):
    response: str = Field(..., description="Agent响应")
    tokens_used: int = Field(..., description="使用的token数")
    model: str = Field(..., description="使用的模型")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")

class ErrorResponse(BaseModel):
    error: str = Field(..., description="错误信息")
    detail: Optional[str] = Field(None, description="错误详情")

# 认证函数
def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API端点
@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user=Depends(verify_token)
):
    """
    聊天接口
    
    - **query**: 用户查询
    - **context**: 上下文信息（可选）
    - **model**: 模型名称
    - **temperature**: 温度参数
    - **max_tokens**: 最大token数
    """
    try:
        # 调用Agent
        result = await call_agent(
            query=request.query,
            context=request.context,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        return ChatResponse(
            response=result["content"],
            tokens_used=result["tokens"],
            model=request.model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/models")
async def list_models(user=Depends(verify_token)):
    """获取可用模型列表"""
    return {
        "models": [
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo"},
            {"id": "gpt-4", "name": "GPT-4"},
            {"id": "claude-3-sonnet", "name": "Claude 3 Sonnet"}
        ]
    }

@app.get("/api/v1/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

### 3. Docker部署
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

### 4. API文档
FastAPI自动生成API文档：
- **Swagger UI**：http://localhost:8000/docs
- **ReDoc**：http://localhost:8000/redoc

## 最佳实践

### 1. API设计
- **版本控制**：使用URL路径版本（如/api/v1/）
- **命名规范**：使用小写字母和连字符
- **参数验证**：使用Pydantic进行参数验证
- **错误处理**：统一的错误响应格式

### 2. 安全性
- **认证授权**：实现完善的认证授权机制
- **输入验证**：验证所有用户输入
- **速率限制**：防止API滥用
- **HTTPS**：使用HTTPS加密传输

### 3. 性能优化
- **缓存机制**：缓存常见请求
- **异步处理**：使用异步提升并发性能
- **连接池**：使用连接池管理连接
- **负载均衡**：使用负载均衡分散请求

### 4. 监控和日志
- **请求日志**：记录所有API请求
- **性能监控**：监控API响应时间
- **错误追踪**：追踪和报告错误
- **使用统计**：统计API使用情况

## 常见问题

### 1. 接口问题
- **参数错误**：检查参数验证规则
- **认证失败**：检查认证令牌
- **超时错误**：调整超时设置
- **版本不兼容**：检查API版本

### 2. 性能问题
- **响应慢**：优化后端逻辑
- **并发低**：使用异步处理
- **内存占用高**：优化数据处理

### 3. 安全问题
- **未授权访问**：加强认证机制
- **数据泄露**：加密敏感数据
- **攻击防护**：添加防护机制

## 下一步学习

- [部署与运维](/day141-145/deployment) - Agent系统的部署和监控
- [Agent框架](/day126-130/) - 了解各种Agent框架
- [多Agent系统](/day131-135/) - 学习多Agent协作