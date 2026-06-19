# Qdrant详解

## 概述

Qdrant是一个用Rust编写的高性能向量数据库，专为大规模向量搜索设计。它提供了丰富的过滤功能和灵活的部署方式，适合生产环境使用。

## 核心概念

### 1. 集合（Collection）
Qdrant中的集合是向量的容器：
- **向量配置**：向量维度和距离度量
- **有效载荷**：附加的元数据信息
- **索引配置**：HNSW索引参数
- **分片配置**：数据分片策略

### 2. 点（Point）
点是Qdrant中的基本数据单元：
- **ID**：点的唯一标识
- **向量**：点的向量表示
- **有效载荷**：点的元数据

### 3. 有效载荷（Payload）
有效载荷是点的元数据：
- **键值对**：支持多种数据类型
- **索引**：支持为有效载荷创建索引
- **过滤**：支持基于有效载荷的过滤

### 4. 搜索（Search）
Qdrant的搜索功能：
- **相似性搜索**：基于向量相似度的搜索
- **过滤搜索**：基于有效载荷的过滤
- **批量搜索**：支持批量搜索
- **推荐搜索**：基于示例的推荐

## 核心API

### 1. 安装和配置
```python
# 安装Qdrant客户端
pip install qdrant-client

# 连接到Qdrant
from qdrant_client import QdrantClient

# 本地客户端
client = QdrantClient(path="./qdrant_data")

# 远程客户端
client = QdrantClient(host="localhost", port=6333)
```

### 2. 创建集合
```python
from qdrant_client.models import VectorParams, Distance

# 创建集合
client.create_collection(
    collection_name="my-collection",
    vectors_config=VectorParams(
        size=1536,  # 向量维度
        distance=Distance.COSINE  # 距离度量
    )
)

# 获取集合信息
collection_info = client.get_collection("my-collection")
print(collection_info)
```

### 3. 插入点
```python
from qdrant_client.models import PointStruct

# 插入单个点
client.upsert(
    collection_name="my-collection",
    points=[
        PointStruct(
            id=1,
            vector=[0.1, 0.2, 0.3, ...],
            payload={"source": "web", "year": 2023}
        )
    ]
)

# 批量插入
points = []
for i in range(1000):
    points.append(
        PointStruct(
            id=i,
            vector=[0.1 * i, 0.2 * i, ...],
            payload={"id": i, "category": "test"}
        )
    )

client.upsert(
    collection_name="my-collection",
    points=points
)
```

### 4. 搜索点
```python
# 相似性搜索
results = client.search(
    collection_name="my-collection",
    query_vector=[0.1, 0.2, 0.3, ...],
    limit=10
)

# 带过滤的搜索
from qdrant_client.models import Filter, FieldCondition, MatchValue

results = client.search(
    collection_name="my-collection",
    query_vector=[0.1, 0.2, 0.3, ...],
    query_filter=Filter(
        must=[
            FieldCondition(
                key="source",
                match=MatchValue(value="web")
            )
        ]
    ),
    limit=10
)

# 批量搜索
results = client.search_batch(
    collection_name="my-collection",
    requests=[
        {"vector": [0.1, 0.2, ...], "limit": 5},
        {"vector": [0.4, 0.5, ...], "limit": 5}
    ]
)
```

### 5. 更新和删除
```python
# 更新点
client.set_payload(
    collection_name="my-collection",
    payload={"updated": True},
    points=[1, 2, 3]
)

# 删除点
client.delete(
    collection_name="my-collection",
    points=[1, 2, 3]
)

# 删除集合
client.delete_collection("my-collection")
```

## 实践指南

### 1. 环境准备
```bash
# 使用Docker运行Qdrant
docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant

# 安装客户端
pip install qdrant-client openai
```

### 2. 基础使用示例
```python
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from openai import OpenAI

# 创建客户端
client = QdrantClient(path="./qdrant_data")

# 创建集合
if not client.collection_exists("documents"):
    client.create_collection(
        collection_name="documents",
        vectors_config=VectorParams(
            size=1536,
            distance=Distance.COSINE
        )
    )

# 初始化OpenAI客户端
openai_client = OpenAI(api_key="your-api-key")

# 生成嵌入
def get_embedding(text):
    response = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

# 添加文档
documents = [
    {"id": 1, "text": "人工智能是计算机科学的一个分支", "source": "wiki"},
    {"id": 2, "text": "机器学习是人工智能的一个子领域", "source": "textbook"},
    {"id": 3, "text": "深度学习是机器学习的一种方法", "source": "paper"}
]

points = []
for doc in documents:
    embedding = get_embedding(doc["text"])
    points.append(
        PointStruct(
            id=doc["id"],
            vector=embedding,
            payload={"text": doc["text"], "source": doc["source"]}
        )
    )

client.upsert(
    collection_name="documents",
    points=points
)

# 查询
query = "什么是机器学习？"
query_embedding = get_embedding(query)

results = client.search(
    collection_name="documents",
    query_vector=query_embedding,
    limit=3
)

print("查询结果：")
for result in results:
    print(f"ID: {result.id}, Score: {result.score}")
    print(f"Text: {result.payload['text']}")
    print()
```

### 3. 高级过滤
```python
from qdrant_client.models import (
    Filter, FieldCondition, MatchValue,
    Range, MatchAny, MatchExcept
)

# 精确匹配
filter_exact = Filter(
    must=[
        FieldCondition(
            key="source",
            match=MatchValue(value="wiki")
        )
    ]
)

# 范围过滤
filter_range = Filter(
    must=[
        FieldCondition(
            key="year",
            range=Range(gte=2020, lte=2023)
        )
    ]
)

# 多值匹配
filter_any = Filter(
    must=[
        FieldCondition(
            key="source",
            match=MatchAny(any=["wiki", "textbook"])
        )
    ]
)

# 组合过滤
filter_complex = Filter(
    must=[
        FieldCondition(
            key="source",
            match=MatchValue(value="wiki")
        )
    ],
    must_not=[
        FieldCondition(
            key="year",
            range=Range(lt=2020)
        )
    ]
)

# 使用过滤搜索
results = client.search(
    collection_name="documents",
    query_vector=query_embedding,
    query_filter=filter_exact,
    limit=10
)
```

### 4. 有效载荷索引
```python
from qdrant_client.models import PayloadSchemaType

# 创建有效载荷索引
client.create_payload_index(
    collection_name="documents",
    field_name="source",
    field_schema=PayloadSchemaType.KEYWORD
)

client.create_payload_index(
    collection_name="documents",
    field_name="year",
    field_schema=PayloadSchemaType.INTEGER
)
```

## 最佳实践

### 1. 集合设计
- **选择合适的维度**：根据嵌入模型选择
- **选择合适的距离度量**：根据应用场景选择
- **合理配置HNSW参数**：平衡精度和性能
- **创建有效载荷索引**：为常用过滤字段创建索引

### 2. 性能优化
- **批量操作**：使用批量插入和搜索
- **索引优化**：合理配置HNSW参数
- **查询优化**：使用有效载荷过滤
- **内存管理**：合理配置内存使用

### 3. 数据管理
- **定期清理**：清理无用数据
- **备份数据**：定期备份数据
- **监控使用量**：跟踪存储和查询使用量

## 常见问题

### 1. 连接问题
- **服务未启动**：检查Qdrant服务状态
- **端口冲突**：检查端口配置
- **认证失败**：检查认证配置

### 2. 性能问题
- **查询慢**：优化索引和查询
- **插入慢**：使用批量插入
- **内存占用高**：优化数据结构

### 3. 数据问题
- **数据丢失**：检查持久化配置
- **查询不准确**：调整相似度阈值

## 下一步学习

- [FAISS详解](/day121-125/faiss) - Facebook开源的相似性搜索库
- [pgvector详解](/day121-125/pgvector) - PostgreSQL向量扩展
- [Redis详解](/day121-125/redis) - Redis向量搜索模块