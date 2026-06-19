# Chroma详解

## 概述

Chroma是一个轻量级的嵌入式向量数据库，专为AI应用设计。它提供了简单的API，支持本地和云端部署，适合原型开发和小规模应用。

## 核心概念

### 1. 集合（Collection）
Chroma中的集合类似于数据库中的表：
- **名称**：集合的唯一标识
- **嵌入函数**：用于生成向量的函数
- **元数据**：集合的附加信息

### 2. 文档（Document）
文档是Chroma中的基本数据单元：
- **ID**：文档的唯一标识
- **嵌入**：文档的向量表示
- **文档内容**：文档的文本内容
- **元数据**：文档的附加信息

### 3. 查询（Query）
Chroma的查询功能：
- **相似性搜索**：基于向量相似度的搜索
- **过滤搜索**：基于元数据的过滤
- **分页查询**：支持分页查询

## 核心API

### 1. 安装和配置
```python
# 安装Chroma
pip install chromadb

# 创建客户端
import chroma

# 本地客户端
client = chroma.Client()

# 持久化客户端
client = chroma.PersistentClient(path="./chroma_db")
```

### 2. 创建集合
```python
# 创建集合
collection = client.create_collection(
    name="my-collection",
    metadata={"hnsw:space": "cosine"}
)

# 获取集合
collection = client.get_collection(name="my-collection")

# 获取或创建集合
collection = client.get_or_create_collection(
    name="my-collection",
    metadata={"hnsw:space": "cosine"}
)
```

### 3. 添加文档
```python
# 添加文档
collection.add(
    ids=["id1", "id2", "id3"],
    documents=["文档1", "文档2", "文档3"],
    metadatas=[{"source": "web"}, {"source": "book"}, {"source": "pdf"}]
)

# 添加带嵌入的文档
collection.add(
    ids=["id1", "id2"],
    embeddings=[[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]],
    documents=["文档1", "文档2"]
)
```

### 4. 查询文档
```python
# 相似性搜索
results = collection.query(
    query_texts=["查询内容"],
    n_results=5
)

# 带过滤的搜索
results = collection.query(
    query_texts=["查询内容"],
    n_results=5,
    where={"source": "web"}
)

# 返回字段控制
results = collection.query(
    query_texts=["查询内容"],
    n_results=5,
    include=["documents", "metadatas", "distances"]
)
```

### 5. 更新和删除
```python
# 更新文档
collection.update(
    ids=["id1"],
    documents=["更新后的文档"],
    metadatas=[{"source": "updated"}]
)

# 删除文档
collection.delete(ids=["id1", "id2"])
```

## 实践指南

### 1. 环境准备
```bash
# 安装必要的库
pip install chromadb openai

# 设置环境变量
export OPENAI_API_KEY="your-openai-api-key"
```

### 2. 基础使用示例
```python
import chromadb
from openai import OpenAI

# 创建客户端
client = chromadb.PersistentClient(path="./chroma_db")

# 创建集合
collection = client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}
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
    {"id": "doc1", "text": "人工智能是计算机科学的一个分支"},
    {"id": "doc2", "text": "机器学习是人工智能的一个子领域"},
    {"id": "doc3", "text": "深度学习是机器学习的一种方法"}
]

for doc in documents:
    embedding = get_embedding(doc["text"])
    collection.add(
        ids=[doc["id"]],
        embeddings=[embedding],
        documents=[doc["text"]]
    )

# 查询
query = "什么是机器学习？"
query_embedding = get_embedding(query)

results = collection.query(
    query_embeddings=[query_embedding],
    n_results=3
)

print("查询结果：")
for i, doc in enumerate(results["documents"][0]):
    print(f"{i+1}. {doc}")
    print(f"   距离: {results['distances'][0][i]}")
```

### 3. 持久化存储
```python
# 持久化存储
client = chromadb.PersistentClient(path="./chroma_db")

# 集合会自动持久化
collection = client.get_or_create_collection("my-collection")

# 添加数据
collection.add(
    ids=["id1"],
    documents=["文档1"],
    embeddings=[[0.1, 0.2, 0.3]]
)

# 重启后数据仍然存在
client2 = chromadb.PersistentClient(path="./chroma_db")
collection2 = client2.get_collection("my-collection")
print(collection2.count())  # 输出: 1
```

### 4. 元数据过滤
```python
# 添加带元数据的文档
collection.add(
    ids=["id1", "id2", "id3"],
    documents=["文档1", "文档2", "文档3"],
    metadatas=[
        {"source": "web", "year": 2023},
        {"source": "book", "year": 2022},
        {"source": "pdf", "year": 2023}
    ]
)

# 简单过滤
results = collection.query(
    query_texts=["查询"],
    where={"source": "web"}
)

# 复杂过滤
results = collection.query(
    query_texts=["查询"],
    where={
        "$and": [
            {"source": "web"},
            {"year": {"$gte": 2023}}
        ]
    }
)
```

## 最佳实践

### 1. 集合设计
- **选择合适的距离度量**：根据应用场景选择
- **合理设置元数据**：为常用过滤字段设置元数据
- **使用持久化存储**：生产环境使用持久化存储

### 2. 性能优化
- **批量操作**：使用批量添加和查询
- **索引优化**：合理配置HNSW参数
- **查询优化**：限制返回结果数量

### 3. 数据管理
- **定期清理**：清理无用数据
- **备份数据**：定期备份数据
- **监控使用量**：跟踪存储和查询使用量

## 常见问题

### 1. 安装问题
- **依赖冲突**：使用虚拟环境隔离依赖
- **版本兼容**：检查版本兼容性

### 2. 性能问题
- **查询慢**：优化索引，减少结果数量
- **内存占用高**：使用持久化存储
- **并发限制**：使用异步处理

### 3. 数据问题
- **数据丢失**：检查持久化配置
- **查询不准确**：调整相似度阈值

## 下一步学习

- [Qdrant详解](/day121-125/qdrant) - Rust编写的高性能向量数据库
- [FAISS详解](/day121-125/faiss) - Facebook开源的相似性搜索库
- [pgvector详解](/day121-125/pgvector) - PostgreSQL向量扩展