# Milvus详解

## 概述

Milvus是一个开源的高性能向量数据库，专为大规模向量搜索设计。它支持多种索引类型，提供分布式部署能力，是目前最流行的向量数据库之一。

## 核心概念

### 1. 集合（Collection）
Milvus中的集合类似于数据库中的表：
- **名称**：集合的唯一标识
- **Schema**：定义字段结构
- **索引**：为向量字段创建索引
- **分区**：数据分区管理

### 2. 字段（Field）
集合中的字段类型：
- **主键字段**：文档的唯一标识
- **向量字段**：存储向量数据
- **标量字段**：存储元数据（整数、字符串等）

### 3. 索引（Index）
Milvus支持多种索引类型：
- **FLAT**：暴力搜索，精确但慢
- **IVF_FLAT**：倒排文件索引
- **IVF_SQ8**：量化倒排索引
- **IVF_PQ**：乘积量化索引
- **HNSW**：分层可导航小世界图
- **ANNOY**：近似最近邻索引

### 4. 分区（Partition）
分区用于数据管理：
- **数据隔离**：不同分区的数据相互隔离
- **查询范围**：查询可以指定分区
- **性能优化**：减少搜索范围

## 技术方案对比

### Milvus vs 其他向量数据库

| 对比维度 | Milvus | Pinecone | Weaviate | Chroma |
|----------|--------|----------|----------|--------|
| **部署方式** | 自托管/云 | 全托管 | 自托管/云 | 嵌入式 |
| **扩展性** | 分布式，水平扩展 | 自动扩展 | 单机/集群 | 单机 |
| **索引类型** | 多种（10+） | 专有 | HNSW | HNSW |
| **最大数据量** | 万亿级 | 无限制 | 十亿级 | 百万级 |
| **性能** | 高 | 高 | 中等 | 中等 |
| **学习成本** | 较高 | 低 | 中等 | 低 |
| **社区活跃度** | 高 | N/A | 高 | 中等 |

### 何时选择Milvus？

**推荐使用Milvus的场景：**
1. **大规模数据**：数据量超过千万级
2. **高并发需求**：需要处理大量并发查询
3. **分布式部署**：需要多节点部署
4. **复杂索引需求**：需要多种索引类型
5. **企业级应用**：需要生产级别的稳定性

**不推荐使用Milvus的场景：**
1. **快速原型**：Chroma更简单
2. **小规模数据**：FAISS更轻量
3. **不想运维**：Pinecone更省心

## 设计原理与目的

### 为什么Milvus性能高？

**1. 分布式架构**
```
Milvus架构：
┌─────────────┐
│   接入层    │  ← 处理客户端请求
├─────────────┤
│   协调层    │  ← 协调各个组件
├─────────────┤
│   执行层    │  ← 实际执行查询
│  ┌───┬───┐  │
│  │N1 │N2 │  │  ← 多个数据节点
│  └───┴───┘  │
└─────────────┘

优势：
- 水平扩展：增加节点即可提升性能
- 负载均衡：请求自动分配到不同节点
- 高可用：单节点故障不影响整体
```

**2. 多种索引支持**
```
根据场景选择索引：

FLAT（暴力搜索）：
- 精度：100%
- 速度：慢
- 适用：小数据集、精确搜索

IVF_FLAT（倒排索引）：
- 精度：95%+
- 速度：快
- 适用：中等数据集

HNSW（图索引）：
- 精度：98%+
- 速度：很快
- 适用：通用场景

IVF_PQ（量化索引）：
- 精度：90%+
- 速度：极快
- 适用：超大规模、内存受限
```

**3. 数据分片**
```
数据分片原理：
大数据集 → 分成多个小分片 → 分布在不同节点

查询过程：
1. 查询请求发送到所有分片
2. 每个分片并行搜索
3. 合并结果
4. 返回最终结果

优势：
- 并行处理，速度快
- 单个分片故障不影响整体
```

### 索引算法详解

**HNSW算法原理：**
```
HNSW = Hierarchical Navigable Small World

类比：像高速公路网络

构建过程：
1. 所有向量在最底层（类似城市道路）
2. 部分向量提升到中层（类似省道）
3. 少数向量提升到高层（类似高速公路）

搜索过程：
1. 从高层开始（高速定位大致区域）
2. 逐层下降（缩小搜索范围）
3. 在底层找到精确结果

参数说明：
- M：每个节点的连接数（越大越精确，内存越大）
- efConstruction：构建时的搜索范围（越大越精确，构建越慢）
- efSearch：查询时的搜索范围（越大越精确，查询越慢）
```

**IVF算法原理：**
```
IVF = Inverted File（倒排文件）

类比：像图书馆分类系统

构建过程：
1. 使用K-means将向量聚类
2. 每个聚类作为一个"桶"
3. 记录每个向量属于哪个桶

搜索过程：
1. 计算查询向量最近的nprobe个桶
2. 只在这些桶中搜索
3. 返回最近邻结果

参数说明：
- nlist：聚类数量（通常sqrt(N)）
- nprobe：搜索时检查的桶数量（越大越精确，越慢）
```

### 为什么需要量化？

**问题：** 大规模向量占用大量内存
```
示例：
- 100万个向量
- 每个1536维
- 每个维度4字节（float32）
- 总内存：100万 × 1536 × 4 = 6GB

问题：内存成本高，且可能超出单机内存
```

**解决方案：量化压缩**
```
量化原理：
原始向量：[0.123, 0.456, 0.789, ...]（float32）
↓ 量化
量化向量：[31, 117, 202, ...]（uint8）

压缩比：4倍（float32 → uint8）
精度损失：通常<5%

Milvus支持的量化类型：
- SQ8：标量量化，压缩4倍
- PQ：乘积量化，压缩更多
```

## 核心API

### 1. 安装和配置
```bash
# 使用Docker安装Milvus
docker-compose up -d

# 或使用Milvus Lite（轻量版）
pip install milvus

# 安装Python客户端
pip install pymilvus
```

### 2. 连接Milvus
```python
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType

# 连接到Milvus
connections.connect(
    alias="default",
    host="localhost",
    port="19530"
)
```

### 3. 创建集合
```python
from pymilvus import Collection, FieldSchema, CollectionSchema, DataType

# 定义字段
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536)
]

# 创建Schema
schema = CollectionSchema(fields, description="文本向量集合")

# 创建集合
collection = Collection("text_vectors", schema)

# 创建索引
index_params = {
    "metric_type": "COSINE",
    "index_type": "HNSW",
    "params": {"M": 16, "efConstruction": 200}
}

collection.create_index("embedding", index_params)
```

### 4. 插入数据
```python
from pymilvus import Collection
import numpy as np

collection = Collection("text_vectors")

# 准备数据
texts = ["人工智能是计算机科学的一个分支", "机器学习是AI的子领域", "深度学习是机器学习的一种方法"]

# 获取嵌入向量（这里用随机向量示例）
embeddings = [np.random.random(1536).tolist() for _ in texts]

# 插入数据
data = [texts, embeddings]
collection.insert(data)

# 刷新集合
collection.flush()
```

### 5. 搜索数据
```python
from pymilvus import Collection

collection = Collection("text_vectors")
collection.load()

# 查询向量
query_vector = np.random.random(1536).tolist()

# 搜索参数
search_params = {
    "metric_type": "COSINE",
    "params": {"ef": 100}
}

# 搜索
results = collection.search(
    data=[query_vector],
    anns_field="embedding",
    param=search_params,
    limit=3,
    output_fields=["text"]
)

# 打印结果
for hits in results:
    for hit in hits:
        print(f"ID: {hit.id}, Score: {hit.score}, Text: {hit.entity.get('text')}")
```

### 6. 带过滤的搜索
```python
from pymilvus import Collection

collection = Collection("text_vectors")
collection.load()

# 查询向量
query_vector = np.random.random(1536).tolist()

# 搜索参数
search_params = {
    "metric_type": "COSINE",
    "params": {"ef": 100}
}

# 带过滤的搜索
results = collection.search(
    data=[query_vector],
    anns_field="embedding",
    param=search_params,
    limit=3,
    expr='text like "%人工智能%"',  # 过滤条件
    output_fields=["text"]
)
```

### 7. 删除数据
```python
from pymilvus import Collection

collection = Collection("text_vectors")

# 删除指定ID的数据
collection.delete(expr="id in [1, 2, 3]")

# 删除所有数据
collection.delete(expr="id >= 0")
```

## 实践指南

### 1. 环境准备
```bash
# 使用Docker Compose安装Milvus
# docker-compose.yml
version: '3.5'

services:
  etcd:
    image: quay.io/coreos/etcd:v3.5.5
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
    volumes:
      - etcd:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd

  minio:
    image: minio/minio:RELEASE.2023-03-20T20-16-18Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    volumes:
      - minio:/minio_data
    command: minio server /minio_data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  standalone:
    image: milvusdb/milvus:v2.3.3
    command: ["milvus", "run", "standalone"]
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    volumes:
      - milvus:/var/lib/milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9099/healthz"]
      interval: 30s
      start_period: 90s
      timeout: 20s
      retries: 3
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - etcd
      - minio

volumes:
  etcd:
  minio:
  milvus:

# 启动Milvus
docker-compose up -d
```

### 2. 基础使用示例
```python
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType
from openai import OpenAI
import numpy as np

# 连接到Milvus
connections.connect(alias="default", host="localhost", port="19530")

# 初始化OpenAI客户端
openai_client = OpenAI(api_key="your-api-key")

# 定义字段
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
    FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=100),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536)
]

# 创建集合
schema = CollectionSchema(fields, description="文本向量集合")
collection = Collection("documents", schema)

# 创建索引
index_params = {
    "metric_type": "COSINE",
    "index_type": "HNSW",
    "params": {"M": 16, "efConstruction": 200}
}
collection.create_index("embedding", index_params)

# 获取嵌入向量
def get_embedding(text):
    response = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

# 添加文档
def add_document(text, source="unknown"):
    embedding = get_embedding(text)
    collection.insert([[text], [source], [embedding]])
    collection.flush()

# 搜索文档
def search_documents(query, top_k=5):
    collection.load()
    
    query_embedding = get_embedding(query)
    
    search_params = {
        "metric_type": "COSINE",
        "params": {"ef": 100}
    }
    
    results = collection.search(
        data=[query_embedding],
        anns_field="embedding",
        param=search_params,
        limit=top_k,
        output_fields=["text", "source"]
    )
    
    return results

# 使用示例
add_document("人工智能是计算机科学的一个分支", "wiki")
add_document("机器学习是人工智能的子领域", "textbook")
add_document("深度学习是机器学习的一种方法", "paper")

results = search_documents("什么是AI？")
for hits in results:
    for hit in hits:
        print(f"Score: {hit.score:.2f}")
        print(f"Text: {hit.entity.get('text')}")
        print(f"Source: {hit.entity.get('source')}")
        print()
```

### 3. 分区管理
```python
from pymilvus import Collection

collection = Collection("documents")

# 创建分区
collection.create_partition("wiki")
collection.create_partition("textbook")

# 在指定分区插入数据
collection.insert(data, partition_name="wiki")

# 在指定分区搜索
results = collection.search(
    data=[query_embedding],
    anns_field="embedding",
    param=search_params,
    limit=5,
    partition_names=["wiki"],  # 只在wiki分区搜索
    output_fields=["text"]
)
```

### 4. 性能优化
```python
from pymilvus import Collection

collection = Collection("documents")

# 1. 批量插入
batch_size = 1000
for i in range(0, len(data), batch_size):
    batch = data[i:i+batch_size]
    collection.insert(batch)

# 2. 调整搜索参数
search_params = {
    "metric_type": "COSINE",
    "params": {
        "ef": 200  # 增大ef可以提高精度，但会降低速度
    }
}

# 3. 使用分区减少搜索范围
results = collection.search(
    data=[query_embedding],
    anns_field="embedding",
    param=search_params,
    limit=5,
    partition_names=["wiki"],  # 只搜索相关分区
    output_fields=["text"]
)
```

## 最佳实践

### 1. 索引选择
- **小数据集（<10万）**：使用FLAT索引
- **中等数据集（10万-1000万）**：使用HNSW索引
- **大数据集（>1000万）**：使用IVF_PQ索引
- **高精度需求**：使用HNSW索引，增大M和efConstruction

### 2. 性能优化
- **批量操作**：使用批量插入和搜索
- **分区管理**：将数据按类别分区
- **索引优化**：根据场景选择合适的索引参数
- **资源分配**：为Milvus分配足够的内存和CPU

### 3. 数据管理
- **定期清理**：删除无用数据
- **备份数据**：定期备份数据
- **监控性能**：监控查询延迟和吞吐量
- **扩展集群**：根据负载扩展节点

## 常见问题

### 1. 连接问题
- **服务未启动**：检查Milvus服务状态
- **端口冲突**：检查端口配置
- **网络问题**：检查网络连接

### 2. 性能问题
- **查询慢**：优化索引参数，增大ef
- **内存占用高**：使用量化索引，如IVF_PQ
- **插入慢**：使用批量插入

### 3. 数据问题
- **数据丢失**：检查持久化配置
- **查询不准确**：调整索引参数
- **空间不足**：清理无用数据或扩展存储

## 下一步学习

- [向量数据库选型指南](/day121-125/) - 如何选择合适的向量数据库
- [RAG技术](/day116-120/) - 使用向量数据库构建RAG系统
- [Agent框架](/day126-130/) - 了解各种Agent框架
