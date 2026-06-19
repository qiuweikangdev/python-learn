# Redis详解

## 概述

Redis向量搜索模块（RediSearch）为Redis提供了向量搜索能力。它结合了Redis的高性能和向量搜索功能，适合需要低延迟的实时应用。

## 核心概念

### 1. 索引（Index）
Redis向量搜索的索引：
- **哈希索引**：基于Redis Hash的索引
- **JSON索引**：基于RedisJSON的索引
- **向量字段**：支持向量相似性搜索
- **标量字段**：支持标量过滤

### 2. 向量类型（Vector Type）
Redis支持的向量类型：
- **FLOAT32**：32位浮点向量
- **FLOAT64**：64位浮点向量
- **BLOB**：二进制向量

### 3. 距离度量（Distance Metric）
Redis支持的距离度量：
- **L2**：欧氏距离
- **IP**：内积
- **COSINE**：余弦相似度

### 4. 查询操作（Query Operations）
Redis的查询操作：
- **向量搜索**：基于向量相似度的搜索
- **混合搜索**：结合标量过滤的向量搜索
- **聚合查询**：支持聚合操作

## 核心API

### 1. 安装和配置
```bash
# 安装Redis Stack（包含RediSearch模块）
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest

# 安装Python客户端
pip install redis
```

### 2. 创建索引
```python
import redis
from redis.commands.search.field import VectorField, TagField, NumericField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType

# 连接到Redis
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# 定义索引
schema = (
    VectorField(
        "embedding",  # 字段名
        "FLAT",  # 索引类型
        {
            "TYPE": "FLOAT32",
            "DIM": 1536,  # 向量维度
            "DISTANCE_METRIC": "COSINE"
        }
    ),
    TagField("category"),
    NumericField("year")
)

# 创建索引
r.ft("documents").create_index(
    fields=schema,
    definition=IndexDefinition(
        prefix=["doc:"],
        index_type=IndexType.HASH
    )
)
```

### 3. 插入数据
```python
import numpy as np

# 插入单个文档
r.hset(
    "doc:1",
    mapping={
        "content": "人工智能是计算机科学的一个分支",
        "category": "ai",
        "year": 2023,
        "embedding": np.random.random(1536).astype(np.float32).tobytes()
    }
)

# 批量插入
for i in range(100):
    r.hset(
        f"doc:{i}",
        mapping={
            "content": f"文档{i}",
            "category": "test",
            "year": 2023,
            "embedding": np.random.random(1536).astype(np.float32).tobytes()
        }
    )
```

### 4. 向量搜索
```python
from redis.commands.search.query import Query

# 生成查询向量
query_vector = np.random.random(1536).astype(np.float32).tobytes()

# 构建查询
query = (
    Query("*=>[KNN 5 @embedding $query_vec AS score]")
    .sort_by("score")
    .return_fields("content", "score")
    .dialect(2)
)

# 执行查询
results = r.ft("documents").search(
    query,
    query_params={"query_vec": query_vector}
)

# 打印结果
for doc in results.docs:
    print(f"ID: {doc.id}, Content: {doc.content}, Score: {doc.score}")
```

### 5. 混合搜索
```python
# 带过滤的向量搜索
query = (
    Query("(@category:{ai})=>[KNN 5 @embedding $query_vec AS score]")
    .sort_by("score")
    .return_fields("content", "category", "score")
    .dialect(2)
)

results = r.ft("documents").search(
    query,
    query_params={"query_vec": query_vector}
)

# 带范围过滤的搜索
query = (
    Query("(@year:[2020 2023])=>[KNN 10 @embedding $query_vec AS score]")
    .sort_by("score")
    .return_fields("content", "year", "score")
    .dialect(2)
)

results = r.ft("documents").search(
    query,
    query_params={"query_vec": query_vector}
)
```

### 6. 删除操作
```python
# 删除文档
r.delete("doc:1")

# 删除索引
r.ft("documents").dropindex()
```

## 实践指南

### 1. 环境准备
```bash
# 使用Docker运行Redis Stack
docker run -d --name redis-stack \
  -p 6379:6379 \
  -p 8001:8001 \
  redis/redis-stack:latest

# 安装Python依赖
pip install redis numpy openai
```

### 2. 基础使用示例
```python
import redis
import numpy as np
from openai import OpenAI
from redis.commands.search.field import VectorField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType

# 连接到Redis
r = redis.Redis(host='localhost', port=6379, decode_responses=False)

# 初始化OpenAI客户端
openai_client = OpenAI(api_key="your-api-key")

# 生成嵌入
def get_embedding(text):
    response = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

# 创建索引
schema = (
    VectorField(
        "embedding",
        "FLAT",
        {
            "TYPE": "FLOAT32",
            "DIM": 1536,
            "DISTANCE_METRIC": "COSINE"
        }
    ),
)

try:
    r.ft("documents").create_index(
        fields=schema,
        definition=IndexDefinition(
            prefix=["doc:"],
            index_type=IndexType.HASH
        )
    )
except:
    pass  # 索引已存在

# 添加文档
documents = [
    {"id": "1", "text": "人工智能是计算机科学的一个分支"},
    {"id": "2", "text": "机器学习是人工智能的一个子领域"},
    {"id": "3", "text": "深度学习是机器学习的一种方法"}
]

for doc in documents:
    embedding = get_embedding(doc["text"])
    r.hset(
        f"doc:{doc['id']}",
        mapping={
            "content": doc["text"],
            "embedding": np.array(embedding, dtype=np.float32).tobytes()
        }
    )

# 查询
query = "什么是机器学习？"
query_embedding = get_embedding(query)

from redis.commands.search.query import Query

search_query = (
    Query("*=>[KNN 3 @embedding $query_vec AS score]")
    .sort_by("score")
    .return_fields("content", "score")
    .dialect(2)
)

results = r.ft("documents").search(
    search_query,
    query_params={"query_vec": np.array(query_embedding, dtype=np.float32).tobytes()}
)

print("查询结果：")
for doc in results.docs:
    print(f"Content: {doc.content}, Score: {doc.score}")
```

### 3. 性能优化
```python
# 使用HNSW索引（更适合大规模数据）
schema = (
    VectorField(
        "embedding",
        "HNSW",
        {
            "TYPE": "FLOAT32",
            "DIM": 1536,
            "DISTANCE_METRIC": "COSINE",
            "M": 40,
            "EF_CONSTRUCTION": 200,
            "EF_RUNTIME": 10
        }
    ),
)

# 批量插入
pipe = r.pipeline()
for i in range(1000):
    embedding = np.random.random(1536).astype(np.float32).tobytes()
    pipe.hset(
        f"doc:{i}",
        mapping={
            "content": f"文档{i}",
            "embedding": embedding
        }
    )
pipe.execute()
```

### 4. 连接池
```python
import redis

# 创建连接池
pool = redis.ConnectionPool(host='localhost', port=6379, decode_responses=False)
r = redis.Redis(connection_pool=pool)

# 使用连接池
for i in range(100):
    r.set(f"key:{i}", f"value:{i}")
```

## 最佳实践

### 1. 索引设计
- **选择合适的索引类型**：小数据集用FLAT，大数据集用HNSW
- **合理设置维度**：根据嵌入模型设置
- **创建标量索引**：为常用过滤字段创建索引

### 2. 性能优化
- **使用连接池**：减少连接开销
- **批量操作**：使用管道批量操作
- **合理设置参数**：调整HNSW参数

### 3. 数据管理
- **设置过期时间**：为临时数据设置过期时间
- **监控内存**：监控Redis内存使用
- **定期清理**：清理无用数据

## 常见问题

### 1. 连接问题
- **服务未启动**：检查Redis服务状态
- **端口冲突**：检查端口配置
- **认证失败**：检查认证配置

### 2. 性能问题
- **查询慢**：优化索引和查询
- **内存占用高**：优化数据结构
- **并发限制**：使用连接池

### 3. 数据问题
- **数据丢失**：检查持久化配置
- **查询不准确**：调整相似度阈值

## 下一步学习

- [Elasticsearch详解](/day121-125/elasticsearch) - Elasticsearch向量搜索
- [Agent框架](/day126-130/) - 了解各种Agent框架
- [多Agent系统](/day131-135/) - 学习多Agent协作