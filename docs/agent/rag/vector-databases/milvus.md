# Milvus详解

## 概述

Milvus是云原生分布式向量数据库，专为大规模向量搜索和管理设计。它支持多种索引类型、GPU加速、混合搜索，是大规模生产环境的首选方案。

## 核心特点

| 特性 | 说明 |
|------|------|
| **云原生架构** | 基于Kubernetes的分布式架构 |
| **高性能** | 支持GPU加速，百亿级向量搜索 |
| **多种索引** | 支持HNSW、IVF、DiskANN等多种索引 |
| **混合搜索** | 支持向量+标量的混合查询 |
| **多模态** | 原生支持多种数据类型 |
| **企业级** | 支持事务、复制、多租户 |

## 安装与配置

### Docker安装（推荐）

```bash
# 下载安装脚本
wget https://github.com/milvus-io/milvus/releases/download/v2.3.3/milvus-standalone-docker-compose.yml -O docker-compose.yml

# 启动服务
docker-compose up -d

# 检查服务状态
docker-compose ps
```

### Python客户端安装

```bash
pip install pymilvus
```

### Kubernetes安装

```bash
# 使用Helm安装
helm repo add milvus https://milvus-io/milvus
helm repo update

helm install my-milvus milvus/milvus \
  --set cluster.enabled=true \
  --set etcd.replicaCount=3 \
  --set minio.mode=distributed \
  --set pulsar.enabled=true
```

## 核心API详解

### 1. 连接管理

```python
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType

# 连接到Milvus
connections.connect(
    alias="default",
    host="localhost",
    port="19530"
)

# 检查连接
from pymilvus import utility
print(f"服务器版本: {utility.get_server_version()}")
```

### 2. 集合管理

```python
from pymilvus import Collection, FieldSchema, CollectionSchema, DataType

# 定义字段
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=100),
    FieldSchema(name="year", dtype=DataType.INT64)
]

# 创建集合Schema
schema = CollectionSchema(fields, description="文档向量集合")

# 创建集合
collection = Collection(
    name="documents",
    schema=schema,
    using="default",
    shards_num=2
)

# 集合信息
print(f"集合名称: {collection.name}")
print(f"Schema: {collection.schema}")
print(f"实体数量: {collection.num_entities}")
```

### 3. 索引管理

```python
from pymilvus import Collection

collection = Collection("documents")

# 1. HNSW索引（推荐）
index_params = {
    "metric_type": "COSINE",  # L2, IP, COSINE
    "index_type": "HNSW",
    "params": {
        "M": 16,              # 每个节点的连接数
        "efConstruction": 200  # 构建时的搜索宽度
    }
}
collection.create_index(field_name="embedding", index_params=index_params)

# 2. IVF_FLAT索引
index_params = {
    "metric_type": "L2",
    "index_type": "IVF_FLAT",
    "params": {"nlist": 1024}  # 聚类中心数量
}
collection.create_index(field_name="embedding", index_params=index_params)

# 3. IVF_PQ索引（内存高效）
index_params = {
    "metric_type": "L2",
    "index_type": "IVF_PQ",
    "params": {
        "nlist": 1024,
        "m": 8,           # 子向量数量
        "nbits": 8         # 比特数
    }
}
collection.create_index(field_name="embedding", index_params=index_params)

# 4. DiskANN索引（超大规模）
index_params = {
    "metric_type": "L2",
    "index_type": "DISKANN",
    "params": {
        "search_list": 50
    }
}
collection.create_index(field_name="embedding", index_params=index_params)

# 列出所有索引
print(collection.indexes)
```

### 4. 数据操作

```python
import numpy as np
from pymilvus import Collection

collection = Collection("documents")

# 插入数据
data = [
    ["文档1内容", "文档2内容", "文档3内容"],  # text字段
    np.random.random((3, 768)).tolist(),         # embedding字段
    ["web", "book", "paper"],                    # source字段
    [2023, 2022, 2024]                           # year字段
]

insert_result = collection.insert(data)
print(f"插入成功，ID: {insert_result.primary_keys}")

# 批量插入
def batch_insert(collection, texts, embeddings, metadatas, batch_size=1000):
    """批量插入数据"""
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i+batch_size]
        batch_embeddings = embeddings[i:i+batch_size]
        batch_sources = [m["source"] for m in metadatas[i:i+batch_size]]
        batch_years = [m["year"] for m in metadatas[i:i+batch_size]]
        
        data = [batch_texts, batch_embeddings, batch_sources, batch_years]
        collection.insert(data)
        print(f"已插入 {min(i+batch_size, len(texts))}/{len(texts)}")

# 刷新数据到存储
collection.flush()
```

### 5. 查询操作

```python
from pymilvus import Collection

collection = Collection("documents")
collection.load()  # 加载集合到内存

# 向量搜索
search_params = {
    "metric_type": "COSINE",
    "params": {"ef": 100}  # HNSW搜索参数
}

query_vectors = np.random.random((1, 768)).tolist()

results = collection.search(
    data=query_vectors,
    anns_field="embedding",
    param=search_params,
    limit=10,
    expr=None,  # 过滤表达式
    output_fields=["text", "source", "year"]
)

# 遍历结果
for hits in results:
    for hit in hits:
        print(f"ID: {hit.id}, 距离: {hit.distance:.4f}")
        print(f"文本: {hit.entity.get('text')[:50]}...")
        print(f"来源: {hit.entity.get('source')}, 年份: {hit.entity.get('year')}")
```

### 6. 混合查询

```python
from pymilvus import Collection

collection = Collection("documents")
collection.load()

# 标量过滤查询
results = collection.search(
    data=query_vectors,
    anns_field="embedding",
    param=search_params,
    limit=10,
    expr="source == 'web' and year >= 2023",  # 标量过滤
    output_fields=["text", "source", "year"]
)

# 复杂过滤表达式
# 支持的操作符: ==, !=, >, <, >=, <=, and, or, not, in, like
expr_filters = [
    "source in ['web', 'book']",           # IN操作
    "year >= 2020 and year <= 2024",        # 范围查询
    "source != 'spam'",                     # 不等于
    "source like 'web%'",                   # 模糊匹配
    "year > 2022 or source == 'paper'"      # OR条件
]

for expr in expr_filters:
    results = collection.search(
        data=query_vectors,
        anns_field="embedding",
        param=search_params,
        limit=5,
        expr=expr,
        output_fields=["text"]
    )
    print(f"过滤条件: {expr}, 结果数: {len(results[0])}")
```

### 7. 范围搜索

```python
# 范围搜索 - 搜索距离在阈值内的所有向量
search_params = {
    "metric_type": "COSINE",
    "params": {
        "radius": 0.8,      # 距离阈值
        "range_filter": 1.0  # 距离上限
    }
}

results = collection.search(
    data=query_vectors,
    anns_field="embedding",
    param=search_params,
    limit=100,  # 最大返回数量
    output_fields=["text"]
)
```

## 与LangChain集成

```python
from langchain_community.vectorstores import Milvus
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 创建向量存储
embeddings = OpenAIEmbeddings()

vectorstore = Milvus.from_documents(
    documents=docs,
    embedding=embeddings,
    connection_args={"host": "localhost", "port": "19530"},
    collection_name="langchain_docs",
    index_params={"metric_type": "COSINE", "index_type": "HNSW", "params": {"M": 16}},
    drop_old=True
)

# 相似性搜索
results = vectorstore.similarity_search("查询内容", k=3)

# 带过滤的搜索
results = vectorstore.similarity_search(
    "查询内容",
    k=3,
    expr="source == 'web'"
)

# 检索器
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 5, "fetch_k": 20}
)
```

## 性能优化

### 1. 索引选择

| 数据规模 | 推荐索引 | 说明 |
|---------|---------|------|
| < 100K | FLAT | 精确搜索 |
| 100K - 1M | HNSW | 高性能，内存占用适中 |
| 1M - 10M | IVF_FLAT | 平衡性能和内存 |
| 10M - 100M | IVF_PQ | 内存高效 |
| > 100M | DiskANN | 磁盘索引，超大规模 |

### 2. 集群配置

```yaml
# milvus.yaml 配置示例
etcd:
  endpoints:
    - etcd-0:2379
    - etcd-1:2379
    - etcd-2:2379

minio:
  address: minio:9000
  accessKeyID: minioadmin
  secretAccessKey: minioadmin

pulsar:
  address: pulsar://pulsar:6650

queryNode:
  cacheSize: 32GB  # 缓存大小
```

### 3. 查询优化

```python
# 预加载集合到内存
collection.load()

# 使用分区提高查询效率
collection.create_partition("web_data")
collection.create_partition("book_data")

# 插入数据到指定分区
collection.insert(data, partition_name="web_data")

# 在指定分区搜索
results = collection.search(
    data=query_vectors,
    anns_field="embedding",
    param=search_params,
    limit=10,
    partition_names=["web_data"]  # 只搜索指定分区
)
```

## 最佳实践

### 1. 分区策略

```python
# 按时间分区
def create_time_partitions(collection, years):
    """按年份创建分区"""
    for year in years:
        partition_name = f"year_{year}"
        if not collection.has_partition(partition_name):
            collection.create_partition(partition_name)
            print(f"创建分区: {partition_name}")

# 按来源分区
def create_source_partitions(collection, sources):
    """按来源创建分区"""
    for source in sources:
        partition_name = f"source_{source}"
        if not collection.has_partition(partition_name):
            collection.create_partition(partition_name)
```

### 2. 监控和运维

```python
from pymilvus import utility

# 获取集合统计信息
def get_collection_stats(collection_name):
    """获取集合统计信息"""
    collection = Collection(collection_name)
    collection.flush()
    
    stats = {
        "name": collection.name,
        "num_entities": collection.num_entities,
        "indexes": [idx.params for idx in collection.indexes],
        "partitions": [p.name for p in collection.partitions]
    }
    return stats

# 检查索引状态
def check_index_status(collection, field_name):
    """检查索引状态"""
    index = collection.index(field_name)
    if index:
        return {
            "field": field_name,
            "index_type": index.params.get("index_type"),
            "metric_type": index.params.get("metric_type")
        }
    return None
```

## 适用场景

| 场景 | 推荐度 | 说明 |
|------|--------|------|
| 大规模生产 | ⭐⭐⭐⭐⭐ | 分布式架构，支持百亿级 |
| 企业级应用 | ⭐⭐⭐⭐⭐ | 事务、多租户、安全 |
| 多模态应用 | ⭐⭐⭐⭐⭐ | 原生多模态支持 |
| 混合搜索 | ⭐⭐⭐⭐⭐ | 向量+标量混合查询 |
| 原型开发 | ⭐⭐⭐ | 部署相对复杂 |
| 小规模应用 | ⭐⭐ | 资源消耗较大 |

## 局限性

1. **部署复杂** - 依赖etcd、MinIO、Pulsar等组件
2. **资源消耗大** - 最低需要4GB内存
3. **学习曲线陡** - 概念和配置较多
4. **运维成本高** - 需要专业运维团队

## 下一步学习

- [Qdrant详解](/agent/rag/vector-databases/qdrant) - 更轻量的高性能方案
- [Chroma详解](/agent/rag/vector-databases/chroma) - 更简单的入门方案
- [RAG实现](/agent/rag/implementation) - 学习如何构建RAG系统
