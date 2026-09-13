# Weaviate详解

> **版本基线**：本文基于 LangChain 1.x，向量库使用官方独立集成包，更新于 2026-09。

::: warning 客户端版本说明
2026 年 Weaviate 主推 v4 gRPC 客户端，本文基于 v4。旧版 v3 的 `weaviate.Client` 与 schema/class API 已弃用，请迁移到 `connect_to_local()` 与 collections API。
:::

## 概述

Weaviate是一个开源的向量数据库，支持语义搜索、多模态数据和GraphQL查询。它以灵活的数据模型、强大的多模态支持和易用的GraphQL接口著称。

## 核心特点

| 特性 | 说明 |
|------|------|
| **多模态支持** | 原生支持文本、图像、音频等多种数据类型 |
| **GraphQL接口** | 灵活的GraphQL查询语言 |
| **模块化架构** | 支持多种嵌入模型和向量化模块 |
| **混合搜索** | 支持向量+关键词的混合搜索 |
| **实时索引** | 支持实时数据更新和索引 |
| **云原生** | 支持Kubernetes部署 |

## 安装与配置

### Docker安装

```bash
# 拉取镜像
docker pull semitechnologies/weaviate:latest

# 启动服务
docker run -d \
    -p 8080:8080 \
    -p 50051:50051 \
    -v $(pwd)/weaviate_data:/var/lib/weaviate \
    -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
    -e PERSISTENCE_DATA_PATH=/var/lib/weaviate \
    semitechnologies/weaviate:latest
```

### Python客户端安装

```bash
# v4 gRPC 客户端（weaviate-client >= 4）
pip install weaviate-client

# LangChain 集成包（1.x 起为官方独立集成包）
pip install langchain-weaviate
```

### 配置选项

```yaml
# docker-compose.yml
version: '3.4'
services:
  weaviate:
    image: semitechnologies/weaviate:latest
    ports:
      - "8080:8080"
      - "50051:50051"
    environment:
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-openai'
      ENABLE_MODULES: 'text2vec-openai,generative-openai'
      CLUSTER_HOSTNAME: 'node1'
    volumes:
      - weaviate_data:/var/lib/weaviate
```

## 核心API详解

### 1. 连接管理

```python
import weaviate

# v4：连接到本地 Weaviate（REST 8080 + gRPC 50051）
client = weaviate.connect_to_local(
    headers={
        "X-OpenAI-Api-Key": "your-openai-key"  # 如果使用OpenAI向量化模块
    }
)

# 检查连接
if client.is_ready():
    print("Weaviate连接成功")

# 获取元数据
meta = client.get_meta()
print(f"Weaviate版本: {meta['version']}")

# 使用完毕后关闭连接
# client.close()
```

### 2. 集合管理

```python
import weaviate
from weaviate.classes.config import Configure, Property, DataType

client = weaviate.connect_to_local()

# 创建集合（v4 中不再需要手写 JSON Schema）
# 方式1：自带向量化（使用 OpenAI 模块）
collection = client.collections.create(
    name="Document",
    vectorizer_config=Configure.Vectorizer.text2vec_openai(
        model="text-embedding-3-small",  # 替代旧的 ada-002
    ),
    properties=[
        Property(name="content", data_type=DataType.TEXT),
        Property(name="source", data_type=DataType.TEXT),
        Property(name="year", data_type=DataType.INT),
        Property(name="category", data_type=DataType.TEXT),
    ]
)

# 方式2：向量由外部生成（如 LangChain/OpenAIEmbeddings），关闭内置向量化
collection = client.collections.create(
    name="Doc",
    vectorizer_config=Configure.Vectorizer.none(),
    properties=[
        Property(name="text", data_type=DataType.TEXT),
    ]
)

# 获取已存在的集合
collection = client.collections.get("Document")

# 删除集合
client.collections.delete("Document")
```

### 3. 数据操作

```python
collection = client.collections.get("Document")

# 插入数据（配置了向量化模块时会自动向量化）
collection.data.insert({
    "content": "这是第一篇文档的内容",
    "source": "web",
    "year": 2023,
    "category": "technology"
})

# 插入时自带向量（vectorizer 为 none 时）
collection.data.insert(
    {"text": "这是第一篇文档的内容"},
    vector=[0.1, 0.2, 0.3]  # 预计算的嵌入向量
)

# 批量插入
def batch_insert(collection, objects, batch_size=100):
    """批量插入数据"""
    with collection.batch.fixed_size(batch_size=batch_size) as batch:
        for obj in objects:
            batch.add_object(properties=obj)
            if batch.number_errors > 10:
                print("批量插入错误过多，中止")
                break
    print(f"失败对象数: {len(collection.batch.failed_objects)}")

# 使用示例
objects = [
    {"content": f"文档内容 {i}", "source": "web", "year": 2023}
    for i in range(1000)
]
batch_insert(client.collections.get("Document"), objects)
```

### 4. 查询操作

```python
collection = client.collections.get("Document")

# 基础查询（获取对象列表）
results = collection.query.fetch_objects(limit=10)
for obj in results.objects:
    print(obj.properties)

# 向量搜索
results = collection.query.near_vector(
    near_vector=query_vector,
    limit=5
)

# 文本搜索（自动向量化）
results = collection.query.near_text(
    query="人工智能",
    limit=5
)
for obj in results.objects:
    print(obj.properties["content"], obj.metadata.distance)

# 带过滤的搜索（v4 使用 Filter 对象）
from weaviate.classes.query import Filter

results = collection.query.near_text(
    query="人工智能",
    limit=5,
    filters=(
        Filter.by_property("source").equal("web")
        & Filter.by_property("year").greater_than(2022)
    )
)
```

### 5. 混合搜索

```python
# 混合搜索（向量 + 关键词）
results = collection.query.hybrid(
    query="人工智能",
    alpha=0.75,  # 0=纯关键词, 1=纯向量
    limit=5
)

# BM25搜索（纯关键词）
results = collection.query.bm25(
    query="人工智能",
    query_properties=["content"],
    limit=5
)
```

### 6. 生成式搜索（RAG）

```python
# 使用Weaviate的生成式搜索
results = collection.generate.near_text(
    query="人工智能",
    limit=3,
    single_prompt="请基于以下内容回答什么是人工智能: {content}"
)

# 遍历结果
for obj in results.objects:
    print(f"内容: {obj.properties['content'][:50]}...")
    print(f"生成答案: {obj.generated}")
```

## 与LangChain集成

```python
# 1.x：Weaviate 已拆分到官方独立集成包 langchain-weaviate
# 旧写法（已废弃）：from langchain_community.vectorstores import Weaviate
from langchain_weaviate import WeaviateVectorStore
from langchain_openai import OpenAIEmbeddings

# 创建向量存储
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vectorstore = WeaviateVectorStore(
    client=client,  # v4 客户端实例
    index_name="Document",
    text_key="content",
    embedding=embeddings
)

# 相似性搜索
results = vectorstore.similarity_search("查询内容", k=3)

# 带过滤的搜索（v4 使用 Filter 对象）
from weaviate.classes.query import Filter

results = vectorstore.similarity_search(
    "查询内容",
    k=3,
    filters=Filter.by_property("source").equal("web")
)

# 检索器
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 5}
)
```

## 性能优化

### 1. 向量化优化

```python
# v4：使用本地嵌入模型（避免API调用）
collection = client.collections.create(
    name="DocumentLocal",
    vectorizer_config=Configure.Vectorizer.text2vec_transformers(
        pooling_strategy="masked_mean"
    )
)

# 或者完全自带向量（外部生成，如 LangChain Embeddings）
# vectorizer_config=Configure.Vectorizer.none()
```

### 2. 批量操作优化

```python
# v4：固定批次大小（支持并发）
with collection.batch.fixed_size(batch_size=100) as batch:
    for obj in objects:
        batch.add_object(properties=obj)

# 动态批次大小
with collection.batch.dynamic() as batch:
    for obj in objects:
        batch.add_object(properties=obj)
```

### 3. 查询优化

```python
# v4：返回向量与距离元数据
results = collection.query.near_text(
    query="AI",
    limit=10,
    include_vector=True,  # 返回向量
    return_metadata=["distance"]
)
```

## 最佳实践

### 1. 数据建模

```python
# v4：合理设计集合结构
from weaviate.classes.config import Configure, Property, DataType, ReferenceProperty

client.collections.create(
    name="Document",
    properties=[
        Property(name="content", data_type=DataType.TEXT),
        Property(name="metadata", data_type=DataType.OBJECT),
        ReferenceProperty(
            name="references",
            target_collection="Document"  # 跨引用
        )
    ]
)
```

### 2. 模块选择

| 模块 | 用途 | 推荐场景 |
|------|------|---------|
| text2vec-openai | OpenAI嵌入 | 生产环境 |
| text2vec-transformers | 本地模型 | 隐私敏感 |
| multi2vec-clip | 多模态 | 图文搜索 |
| img2vec-neural | 图像嵌入 | 图像搜索 |

## 适用场景

| 场景 | 推荐度 | 说明 |
|------|--------|------|
| 多模态应用 | ⭐⭐⭐⭐⭐ | 原生多模态支持 |
| 复杂查询 | ⭐⭐⭐⭐⭐ | GraphQL灵活查询 |
| 混合搜索 | ⭐⭐⭐⭐⭐ | 向量+关键词 |
| RAG应用 | ⭐⭐⭐⭐⭐ | 生成式搜索 |
| 原型开发 | ⭐⭐⭐⭐ | 模块化易用 |

## 局限性

1. **性能一般** - 大规模数据性能不如Milvus、Qdrant
2. **内存占用大** - 相比其他方案内存消耗较高
3. **部署复杂** - 依赖多个模块
4. **学习曲线** - GraphQL和概念较多

## 下一步学习

- [Qdrant详解](/agent/rag/vector-databases/qdrant) - 更高性能的方案
- [Milvus详解](/agent/rag/vector-databases/milvus) - 大规模分布式方案
- [RAG实现](/agent/rag/implementation) - 学习如何构建RAG系统
