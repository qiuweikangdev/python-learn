# 部署与运维

## 概述

本章介绍Agent系统的部署和运维实践，包括容器化部署、Kubernetes部署、监控告警、日志管理等。

## 部署方式

### 1. 容器化部署
使用Docker进行容器化部署：

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非root用户
RUN useradd -m -u 1000 appuser
USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  agent-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=agent_db
      - POSTGRES_USER=agent_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

### 2. Kubernetes部署
使用Kubernetes进行生产级部署：

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-api
  labels:
    app: agent-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-api
  template:
    metadata:
      labels:
        app: agent-api
    spec:
      containers:
        - name: agent-api
          image: agent-api:latest
          ports:
            - containerPort: 8000
          env:
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: agent-secrets
                  key: openai-api-key
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: agent-api-service
spec:
  selector:
    app: agent-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agent-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agent-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 3. Serverless部署
使用云函数进行无服务器部署：

```python
# AWS Lambda
import json
import boto3

def lambda_handler(event, context):
    """Lambda处理函数"""
    try:
        # 解析请求
        body = json.loads(event['body'])
        query = body['query']
        
        # 调用Agent
        response = call_agent(query)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'response': response['content'],
                'tokens_used': response['tokens']
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }
```

## 监控和告警

### 1. Prometheus监控
```python
from prometheus_client import Counter, Histogram, Gauge
import time

# 定义指标
REQUEST_COUNT = Counter(
    'agent_requests_total',
    'Total number of requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'agent_request_duration_seconds',
    'Request latency in seconds',
    ['method', 'endpoint']
)

ACTIVE_REQUESTS = Gauge(
    'agent_active_requests',
    'Number of active requests'
)

# 中间件
@app.middleware("http")
async def monitor_requests(request, call_next):
    ACTIVE_REQUESTS.inc()
    start_time = time.time()
    
    try:
        response = await call_next(request)
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        return response
    finally:
        REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(time.time() - start_time)
        ACTIVE_REQUESTS.dec()
```

### 2. Grafana仪表盘
```json
{
  "dashboard": {
    "title": "Agent API Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(agent_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(agent_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p95"
          }
        ]
      },
      {
        "title": "Active Requests",
        "type": "gauge",
        "targets": [
          {
            "expr": "agent_active_requests"
          }
        ]
      }
    ]
  }
}
```

### 3. 告警规则
```yaml
# alerting_rules.yaml
groups:
  - name: agent_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(agent_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} per second"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(agent_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }} seconds"
      
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 > 1024
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }} MB"
```

## 日志管理

### 1. 结构化日志
```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    """结构化日志"""
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter('%(message)s'))
        self.logger.addHandler(handler)
    
    def log(self, level: str, message: str, **kwargs):
        """记录日志"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': level,
            'message': message,
            **kwargs
        }
        self.logger.info(json.dumps(log_entry))

# 使用示例
logger = StructuredLogger("agent-api")

@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    logger.log("INFO", "Chat request received",
               query=request.query,
               model=request.model,
               user_id=request.user_id)
    
    try:
        response = await call_agent(request.query)
        logger.log("INFO", "Chat response generated",
                   tokens_used=response['tokens'])
        return response
    except Exception as e:
        logger.log("ERROR", "Chat request failed",
                   error=str(e))
        raise
```

### 2. ELK Stack集成
```python
# 日志发送到Elasticsearch
from elasticsearch import Elasticsearch

es = Elasticsearch(['http://elasticsearch:9200'])

def send_to_elasticsearch(log_entry: dict):
    """发送日志到Elasticsearch"""
    es.index(
        index=f"agent-logs-{datetime.now().strftime('%Y.%m.%d')}",
        document=log_entry
    )
```

## 备份和恢复

### 1. 数据备份
```bash
#!/bin/bash
# backup.sh

# 备份数据库
pg_dump -h postgres -U agent_user agent_db > backup_$(date +%Y%m%d).sql

# 备份Redis
redis-cli -h redis BGSAVE
cp /data/dump.rdb backup_redis_$(date +%Y%m%d).rdb

# 上传到云存储
aws s3 cp backup_$(date +%Y%m%d).sql s3://backups/
aws s3 cp backup_redis_$(date +%Y%m%d).rdb s3://backups/
```

### 2. 恢复流程
```bash
#!/bin/bash
# restore.sh

# 从云存储下载备份
aws s3 cp s3://backups/backup_$1.sql .
aws s3 cp s3://backups/backup_redis_$1.rdb .

# 恢复数据库
psql -h postgres -U agent_user agent_db < backup_$1.sql

# 恢复Redis
redis-cli -h redis SHUTDOWN NOSAVE
cp backup_redis_$1.rdb /data/dump.rdb
redis-cli -h redis START
```

## 最佳实践

### 1. 部署策略
- **蓝绿部署**：零停机部署
- **金丝雀发布**：渐进式发布
- **滚动更新**：逐步更新实例
- **回滚机制**：快速回滚到上一版本

### 2. 配置管理
- **环境变量**：使用环境变量管理配置
- **配置中心**：使用配置中心管理配置
- **密钥管理**：使用密钥管理服务
- **配置版本化**：配置文件版本控制

### 3. 安全实践
- **最小权限**：使用最小权限原则
- **网络隔离**：使用网络隔离
- **加密传输**：使用HTTPS加密
- **审计日志**：记录所有操作日志

### 4. 性能优化
- **缓存策略**：使用多级缓存
- **连接池**：使用连接池管理连接
- **异步处理**：使用异步提升性能
- **负载均衡**：使用负载均衡分散请求

## 常见问题

### 1. 部署问题
- **容器启动失败**：检查日志和配置
- **网络连接问题**：检查网络配置
- **资源不足**：调整资源限制
- **权限问题**：检查用户权限

### 2. 监控问题
- **指标缺失**：检查监控配置
- **告警误报**：调整告警阈值
- **日志丢失**：检查日志收集配置
- **性能下降**：分析性能瓶颈

### 3. 运维问题
- **故障恢复**：执行恢复流程
- **数据丢失**：从备份恢复
- **安全事件**：执行安全响应流程
- **容量规划**：评估资源需求

## 下一步学习

- [Agent框架](/day126-130/) - 了解各种Agent框架
- [多Agent系统](/day131-135/) - 学习多Agent协作
- [Deep-Agent开发](/day136-140/) - 深度学习与Agent结合