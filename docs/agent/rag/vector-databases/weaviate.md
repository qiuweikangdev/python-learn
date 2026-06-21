# Weaviate详解

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
pip install weaviate-client
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

# 连接到Weaviate
client = weaviate.Client(
    url="http://localhost:8080",
    additional_headers={
        "X-OpenAI-Api-Key": "your-openai-key"  # 如果使用OpenAI模块
    }
)

# 检查连接
if client.is_ready():
    print("Weaviate连接成功")

# 获取元数据
meta = client.get_meta()
print(f"Weaviate版本: {meta['version']}")
```

### 2. 类（集合）管理

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

# 定义类（Schema）
class_obj = {
    "class": "Document",
    "vectorizer": "text2vec-openai",  # 使用OpenAI向量化
    "moduleConfig": {
        "text2vec-openai": {
            "model": "ada-002",
            "modelVersion": "002",
            "type": "text"
        }
    },
    "properties": [
        {
            "name": "content",
            "dataType": ["text"],
            "moduleConfig": {
                "text2vec-openai": {
                    "skip": False,
                    "vectorizePropertyName": False
                }
            }
        },
        {
            "name": "source",
            "dataType": ["string"]
        },
        {
            "name": "year",
            "dataType": ["int"]
        },
        {
            "name": "category",
            "dataType": ["string"]
        }
    ]
}

# 创建类
client.schema.create_class(class_obj)

# 获取Schema
schema = client.schema.get()
print(schema)

# 删除类
client.schema.delete_class("Document")
```

### 3. 数据操作

```python
# 插入数据
data_object = {
    "content": "这是第一篇文档的内容",
    "source": "web",
    "year": 2023,
    "category": "technology"
}

# 自动向量化并插入
client.data_object.create(
    data_object,
    "Document",
    vector=None  # 如果配置了vectorizer，会自动向量化
)

# 批量插入
def batch_insert(client, class_name, objects, batch_size=100):
    """批量插入数据"""
    for i in range(0, len(objects), batch_size):
        batch = objects[i:i+batch_size]
        
        with client.batch as batch_client:
            batch_client.batch_size = batch_size
            
            for obj in batch:
                batch_client.add_data_object(
                    obj,
                    class_name
                )
        
        print(f"已插入 {min(i+batch_size, len(objects))}/{len(objects)}")

# 使用示例
objects = [
    {"content": f"文档内容 {i}", "source": "web", "year": 2023}
    for i in range(1000)
]
batch_insert(client, "Document", objects)
```

### 4. 查询操作

```python
# 基础查询
result = (
    client.query
    .get("Document", ["content", "source", "year"])
    .with_limit(10)
    .do()
)

# 向量搜索
result = (
    client.query
    .get("Document", ["content", "source", "year"])
    .with_near_vector({
        "vector": query_vector
    })
    .with_limit(5)
    .do()
)

# 文本搜索（自动向量化）
result = (
    client.query
    .get("Document", ["content", "source", "year"])
    .with_near_text({
        "concepts": ["人工智能", "机器学习"]
    })
    .with_limit(5)
    .do()
)

# 带过滤的搜索
import weaviate.classes as wvc

result = (
    client.query
    .get("Document", ["content", "source", "year"])
    .with_near_text({
        "concepts": ["人工智能"]
    })
    .with_where({
        "operator": "And",
        "operands": [
            {
                "path": ["source"],
                "operator": "Equal",
                "valueString": "web"
            },
            {
                "path": ["year"],
                "operator": "GreaterThan",
                "valueInt": 2022
            }
        ]
    })
    .with_limit(5)
    .do()
)
```

### 5. 混合搜索

```python
# 混合搜索（向量 + 关键词）
result = (
    client.query
    .get("Document", ["content", "source", "year"])
    .with_hybrid(
        query="人工智能",
        alpha=0.75  # 0=纯关键词, 1=纯向量
    )
    .with_limit(5)
    .do()
)

# BM25搜索（纯关键词）
result = (
    client.query
    .get("Document", ["content", "source", "year"])
    .with_bm25(
        query="人工智能",
        properties=["content"]
    )
    .with_limit(5)
    .do()
)
```

### 6. 生成式搜索（RAG）

```python
# 使用Weaviate的生成式搜索
result = (
    client.query
    .get("Document", ["content", "source"])
    .with_near_text({
        "concepts": ["人工智能"]
    })
    .with_generate(
        single_prompt="请基于以下内容回答什么是人工智能: {content}"
    )
    .with_limit(3)
    .do()
)

# 遍历结果
for doc in result["data"]["Get"]["Document"]:
    print(f"内容: {doc['content'][:50]}...")
    print(f"生成答案: {doc['_additional']['generate']['singleResult']}")
```

## 与LangChain集成

```python
from langchain_community.vectorstores import Weaviate
from langchain_openai import OpenAIEmbeddings

# 创建向量存储
embeddings = OpenAIEmbeddings()

vectorstore = Weaviate.from_documents(
    documents=docs,
    embedding=embeddings,
    weaviate_url="http://localhost:8080",
    index_name="Document",
    text_key="content"
)

# 相似性搜索
results = vectorstore.similarity_search("查询内容", k=3)

# 带过滤的搜索
results = vectorstore.similarity_search(
    "查询内容",
    k=3,
    where_filter={
        "path": ["source"],
        "operator": "Equal",
        "valueString": "web"
    }
)

# 检索器
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 5}
)
```

## 性能优化

### 1. 向量化优化

```python
# 使用本地嵌入模型（避免API调用）
class_obj = {
    "class": "Document",
    "vectorizer": "text2vec-transformers",  # 使用本地模型
    "moduleConfig": {
        "text2vec-transformers": {
            "poolingStrategy": "masked_mean",
            "vectorizeClassName": False
        }
    }
}
```

### 2. 批量操作优化

```python
# 优化批量插入
client.batch.configure(
    batch_size=100,
    dynamic=True,  # 动态调整批次大小
    timeout_retries=3,
    num_workers=2  # 并发工作线程
)
```

### 3. 查询优化

```python
# 使用缓存
result = (
    client.query
    .get("Document", ["content"])
    .with_near_text({"concepts": ["AI"]})
    .with_limit(10)
    .with_additional("vector")  # 返回向量
    .do()
)
```

## 最佳实践

### 1. 数据建模

```python
# 合理设计类结构
schema = {
    "classes": [
        {
            "class": "Document",
            "properties": [
                {"name": "content", "dataType": ["text"]},
                {"name": "metadata", "dataType": ["object"]},
                {"name": "references", "dataType": ["Document"]}
            ]
        }
    ]
}
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
