# Qdrant详解

## 概述

Qdrant是用Rust编写的高性能向量搜索引擎，专注于提供快速、可靠的向量相似性搜索服务。它以简洁的API、优秀的性能和易于部署著称。

## 核心特点

| 特性 | 说明 |
|------|------|
| **Rust实现** | 内存安全，高性能 |
| **简洁API** | REST和gRPC接口，易于使用 |
| **丰富过滤** | 支持复杂的标量过滤 |
| **持久化** | 数据自动持久化到磁盘 |
| **分布式** | 支持集群部署 |
| **多距离度量** | 支持Cosine、Euclid、Dot等 |

## 安装与配置

### Docker安装

```bash
# 拉取镜像
docker pull qdrant/qdrant

# 启动服务
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage \
    qdrant/qdrant
```

### Python客户端安装

```bash
pip install qdrant-client
```

### 配置文件

```yaml
# config.yaml
storage:
  storage_path: /qdrant/storage
  snapshots_path: /qdrant/snapshots

service:
  grpc_port: 6334
  http_port: 6333

performance:
  max_search_threads: 4
  max_optimization_threads: 2
```

## 核心API详解

### 1. 连接管理

```python
from qdrant_client import QdrantClient

# 连接到Qdrant
client = QdrantClient(host="localhost", port=6333)

# 或使用URL
client = QdrantClient(url="http://localhost:6333")

# 带API密钥（云服务）
client = QdrantClient(
    url="https://your-cluster.qdrant.io",
    api_key="your-api-key"
)

# 检查连接
collections = client.get_collections()
print(f"集合数量: {len(collections.collections)}")
```

### 2. 集合管理

```python
from qdrant_client.models import (
    Distance, VectorParams, CollectionParams,
    OptimizersConfigDiff, WalConfigDiff
)

# 创建集合
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(
        size=768,           # 向量维度
        distance=Distance.COSINE  # 距离度量: COSINE, EUCLID, DOT
    ),
    optimizers_config=OptimizersConfigDiff(
        deleted_threshold=0.2,
        vacuum_min_vector_number=1000,
        indexing_threshold=20000
    ),
    wal_config=WalConfigDiff(
        wal_capacity_mb=32
    )
)

# 获取集合信息
collection_info = client.get_collection("documents")
print(f"向量数量: {collection_info.vectors_count}")
print(f"索引状态: {collection_info.status}")

# 列出所有集合
collections = client.get_collections()
for col in collections.collections:
    print(f"集合: {col.name}")

# 删除集合
client.delete_collection("documents")
```

### 3. 数据操作

```python
from qdrant_client.models import PointStruct
import numpy as np

# 插入数据
points = [
    PointStruct(
        id=1,
        vector=np.random.random(768).tolist(),
        payload={
            "text": "这是第一篇文档",
            "source": "web",
            "year": 2023
        }
    ),
    PointStruct(
        id=2,
        vector=np.random.random(768).tolist(),
        payload={
            "text": "这是第二篇文档",
            "source": "book",
            "year": 2022
        }
    )
]

client.upsert(
    collection_name="documents",
    points=points
)

# 批量插入
def batch_insert(client, collection_name, texts, embeddings, metadatas, batch_size=100):
    """批量插入数据"""
    for i in range(0, len(texts), batch_size):
        points = [
            PointStruct(
                id=i+j,
                vector=embeddings[i+j].tolist(),
                payload={
                    "text": texts[i+j],
                    **metadatas[i+j]
                }
            )
            for j in range(min(batch_size, len(texts)-i))
        ]
        
        client.upsert(
            collection_name=collection_name,
            points=points
        )
        print(f"已插入 {min(i+batch_size, len(texts))}/{len(texts)}")
```

### 4. 查询操作

```python
from qdrant_client.models import Filter, FieldCondition, MatchValue

# 向量搜索
results = client.search(
    collection_name="documents",
    query_vector=np.random.random(768).tolist(),
    limit=5
)

for result in results:
    print(f"ID: {result.id}, 分数: {result.score:.4f}")
    print(f"文本: {result.payload.get('text', '')[:50]}...")

# 带过滤的搜索
results = client.search(
    collection_name="documents",
    query_vector=np.random.random(768).tolist(),
    query_filter=Filter(
        must=[
            FieldCondition(
                key="source",
                match=MatchValue(value="web")
            ),
            FieldCondition(
                key="year",
                range={"gte": 2023}
            )
        ]
    ),
    limit=5
)

# 使用scroll遍历所有数据
records, next_page_offset = client.scroll(
    collection_name="documents",
    limit=100,
    with_payload=True,
    with_vectors=False
)
```

### 5. 高级过滤

```python
from qdrant_client.models import (
    Filter, FieldCondition, MatchValue, MatchAny,
    Range, IsNull, HasIdCondition
)

# 复杂过滤示例
complex_filter = Filter(
    must=[
        # 匹配特定值
        FieldCondition(key="source", match=MatchValue(value="web")),
        
        # 范围查询
        FieldCondition(key="year", range=Range(gte=2020, lte=2024)),
        
        # 匹配多个值
        FieldCondition(key="category", match=MatchAny(any=["tech", "science"]))
    ],
    should=[
        # OR条件
        FieldCondition(key="priority", match=MatchValue(value="high")),
        FieldCondition(key="featured", match=MatchValue(value=True))
    ],
    must_not=[
        # 排除条件
        FieldCondition(key="status", match=MatchValue(value="deleted"))
    ]
)

results = client.search(
    collection_name="documents",
    query_vector=query_vector,
    query_filter=complex_filter,
    limit=10
)
```

### 6. Payload索引

```python
# 创建Payload索引（提高过滤性能）
client.create_payload_index(
    collection_name="documents",
    field_name="source",
    field_schema="keyword"  # keyword, integer, float, bool, text
)

client.create_payload_index(
    collection_name="documents",
    field_name="year",
    field_schema="integer"
)

# 创建文本索引（支持全文搜索）
client.create_payload_index(
    collection_name="documents",
    field_name="text",
    field_schema="text"
)
```

## 与LangChain集成

```python
from langchain_community.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings

# 创建向量存储
embeddings = OpenAIEmbeddings()

vectorstore = Qdrant.from_documents(
    documents=docs,
    embedding=embeddings,
    url="http://localhost:6333",
    collection_name="langchain_docs",
    force_recreate=True
)

# 相似性搜索
results = vectorstore.similarity_search("查询内容", k=3)

# 带过滤的搜索
results = vectorstore.similarity_search(
    "查询内容",
    k=3,
    filter={"source": "web"}
)

# 检索器
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 5, "filter": {"year": {"$gte": 2023}}}
)
```

## 性能优化

### 1. 索引优化

```python
# 优化索引参数
client.update_collection(
    collection_name="documents",
    optimizers_config=OptimizersConfigDiff(
        indexing_threshold=50000,  # 触发索引构建的阈值
        deleted_threshold=0.2,
        vacuum_min_vector_number=1000
    )
)

# 手动触发优化
client.update_collection(
    collection_name="documents",
    optimizer_config=OptimizersConfigDiff(
        max_segment_size=200000
    )
)
```

### 2. 批量操作

```python
# 使用批量API提高性能
from qdrant_client.models import Batch

# 批量插入
client.upsert(
    collection_name="documents",
    points=Batch(
        ids=[1, 2, 3],
        vectors=[v1, v2, v3],
        payloads=[p1, p2, p3]
    )
)
```

### 3. 查询优化

```python
# 使用搜索参数优化
results = client.search(
    collection_name="documents",
    query_vector=query_vector,
    limit=10,
    search_params={
        "exact": False,  # 使用近似搜索
        "hnsw_ef": 128   # HNSW搜索参数
    }
)
```

## 最佳实践

### 1. 数据建模

```python
# 合理设计Payload结构
payload_schema = {
    "text": str,           # 文本内容
    "metadata": {
        "source": str,     # 来源
        "year": int,       # 年份
        "category": str,   # 类别
        "tags": list       # 标签
    },
    "embedding_model": str  # 嵌入模型
}
```

### 2. 集群部署

```yaml
# docker-compose.yml (集群模式)
version: '3.8'
services:
  qdrant-1:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage_1:/qdrant/storage
    environment:
      QDRANT__CLUSTER__ENABLED: "true"
      QDRANT__CLUSTER__PEERS: "qdrant-1,qdrant-2,qdrant-3"
  
  qdrant-2:
    image: qdrant/qdrant
    volumes:
      - ./qdrant_storage_2:/qdrant/storage
    environment:
      QDRANT__CLUSTER__ENABLED: "true"
  
  qdrant-3:
    image: qdrant/qdrant
    volumes:
      - ./qdrant_storage_3:/qdrant/storage
    environment:
      QDRANT__CLUSTER__ENABLED: "true"
```

## 适用场景

| 场景 | 推荐度 | 说明 |
|------|--------|------|
| 高性能需求 | ⭐⭐⭐⭐⭐ | Rust实现，性能优秀 |
| 中小规模生产 | ⭐⭐⭐⭐⭐ | 部署简单，功能完善 |
| 复杂过滤查询 | ⭐⭐⭐⭐⭐ | 丰富的过滤条件 |
| 原型开发 | ⭐⭐⭐⭐ | API简洁易用 |
| 大规模分布式 | ⭐⭐⭐⭐ | 支持集群部署 |

## 局限性

1. **社区相对较小** - 相比Milvus、Pinecone
2. **多模态支持有限** - 不原生支持多模态
3. **文档不够完善** - 部分高级功能文档较少

## 下一步学习

- [Milvus详解](/agent/rag/vector-databases/milvus) - 更大规模的分布式方案
- [Weaviate详解](/agent/rag/vector-databases/weaviate) - 多模态向量数据库
- [RAG实现](/agent/rag/implementation) - 学习如何构建RAG系统
