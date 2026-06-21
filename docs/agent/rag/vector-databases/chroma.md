# Chroma详解

## 概述

Chroma是一个轻量级、开源的向量数据库，专为AI应用设计。它以简单易用著称，支持嵌入式部署和客户端-服务器模式，是原型开发和小规模应用的理想选择。

## 核心特点

| 特性 | 说明 |
|------|------|
| **简单易用** | API设计直观，5分钟上手 |
| **嵌入式部署** | 无需独立服务，直接嵌入应用 |
| **Python原生** | 完全用Python编写，与AI生态无缝集成 |
| **自动持久化** | 支持数据自动持久化到磁盘 |
| **元数据过滤** | 支持丰富的元数据过滤功能 |
| **LangChain集成** | 与LangChain深度集成 |

## 安装与配置

### 安装

```bash
# 基础安装
pip install chromadb

# 带依赖的安装
pip install chromadb --extra-index-url https://chroma-downloads.s3.amazonaws.com/latest
```

### 配置选项

```python
import chromadb
from chromadb.config import Settings

# 1. 内存模式（开发测试）
client = chromadb.Client()

# 2. 持久化模式（生产环境）
client = chromadb.PersistentClient(path="./chroma_db")

# 3. 自定义配置
client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",  # 存储后端
    persist_directory="./chroma_db",   # 持久化目录
    anonymized_telemetry=False         # 关闭遥测
))

# 4. 客户端-服务器模式
# 启动服务器: chroma run --path /db_path
client = chromadb.HttpClient(host="localhost", port=8000)
```

## 核心API详解

### 1. 集合管理

```python
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

# 创建集合
collection = client.create_collection(
    name="documents",
    metadata={
        "hnsw:space": "cosine",           # 距离度量: cosine/l2/ip
        "hnsw:M": 16,                     # HNSW图的连接数
        "hnsw:construction_ef": 200,      # 构建时的搜索宽度
        "hnsw:search_ef": 100             # 搜索时的搜索宽度
    }
)

# 获取已存在的集合
collection = client.get_collection(name="documents")

# 获取或创建集合
collection = client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}
)

# 删除集合
client.delete_collection(name="documents")

# 列出所有集合
collections = client.list_collections()
print(f"集合数量: {len(collections)}")

# 集合信息
print(f"集合名称: {collection.name}")
print(f"文档数量: {collection.count()}")
```

### 2. 数据插入

```python
# 方式1: 逐条插入
collection.add(
    ids=["doc1", "doc2", "doc3"],
    documents=["这是第一篇文档", "这是第二篇文档", "这是第三篇文档"],
    metadatas=[
        {"source": "web", "category": "tech"},
        {"source": "book", "category": "science"},
        {"source": "paper", "category": "ai"}
    ]
)

# 方式2: 使用嵌入向量
collection.add(
    ids=["doc4"],
    embeddings=[[0.1, 0.2, 0.3, ...]],  # 预计算的嵌入向量
    documents=["这是第四篇文档"],
    metadatas=[{"source": "manual"}]
)

# 方式3: 批量插入（推荐）
def batch_insert(collection, documents, batch_size=100):
    """批量插入文档"""
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]
        collection.add(
            ids=[f"doc_{i+j}" for j in range(len(batch))],
            documents=batch,
            metadatas=[{"batch": i // batch_size}] * len(batch)
        )
        print(f"已插入 {min(i+batch_size, len(documents))}/{len(documents)}")

# 使用示例
documents = [f"文档内容 {i}" for i in range(1000)]
batch_insert(collection, documents, batch_size=100)
```

### 3. 查询操作

```python
# 基础查询
results = collection.query(
    query_texts=["搜索关键词"],
    n_results=5
)

print(f"查询结果: {results}")

# 带元数据过滤的查询
results = collection.query(
    query_texts=["搜索关键词"],
    n_results=5,
    where={"source": "web"},  # 简单过滤
    # where={"$and": [{"source": "web"}, {"category": "tech"}]}  # 复合过滤
)

# 使用嵌入向量查询
results = collection.query(
    query_embeddings=[[0.1, 0.2, 0.3, ...]],
    n_results=5
)

# 指定返回字段
results = collection.query(
    query_texts=["搜索关键词"],
    n_results=5,
    include=["documents", "metadatas", "distances"]  # 指定返回内容
)

# 遍历结果
for i, (doc, metadata, distance) in enumerate(zip(
    results["documents"][0],
    results["metadatas"][0],
    results["distances"][0]
)):
    print(f"结果 {i+1}:")
    print(f"  文档: {doc[:50]}...")
    print(f"  元数据: {metadata}")
    print(f"  距离: {distance:.4f}")
```

### 4. 元数据过滤

```python
# 简单过滤
results = collection.query(
    query_texts=["查询"],
    where={"source": "web"}
)

# 比较操作符
results = collection.query(
    query_texts=["查询"],
    where={"year": {"$gt": 2020}}  # year > 2020
)

# 支持的操作符
# $eq, $ne, $gt, $gte, $lt, $lte
# $in, $nin
# $and, $or

# 复合过滤示例
results = collection.query(
    query_texts=["查询"],
    where={
        "$and": [
            {"source": {"$in": ["web", "book"]}},
            {"year": {"$gte": 2020}},
            {"category": {"$ne": "spam"}}
        ]
    }
)
```

### 5. 更新和删除

```python
# 更新文档
collection.update(
    ids=["doc1"],
    documents=["更新后的文档内容"],
    metadatas=[{"source": "updated"}]
)

# 替换文档（upsert）
collection.upsert(
    ids=["doc1", "doc_new"],
    documents=["更新内容", "新文档内容"],
    metadatas=[{"source": "updated"}, {"source": "new"}]
)

# 删除文档
collection.delete(
    ids=["doc1", "doc2"]
)

# 按条件删除
collection.delete(
    where={"source": "spam"}
)
```

## 与LangChain集成

### 基础集成

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader

# 加载文档
loader = TextLoader("document.txt")
documents = loader.load()

# 文本分割
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
docs = text_splitter.split_documents(documents)

# 创建向量存储
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=embeddings,
    persist_directory="./chroma_db",
    collection_name="my_collection"
)

# 相似性搜索
results = vectorstore.similarity_search("查询内容", k=3)
for doc in results:
    print(f"内容: {doc.page_content[:100]}...")
    print(f"元数据: {doc.metadata}")
```

### 高级用法

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

# 创建带过滤的检索器
retriever = vectorstore.as_retriever(
    search_type="mmr",  # 最大边际相关性
    search_kwargs={
        "k": 5,
        "fetch_k": 20,
        "filter": {"source": "web"}
    }
)

# 创建带压缩的检索器
compressor = LLMChainExtractor.from_llm(ChatOpenAI())
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=retriever
)

# 使用检索器
results = compression_retriever.invoke("查询内容")
```

## 性能优化

### 1. 索引优化

```python
# 优化HNSW参数
collection = client.create_collection(
    name="optimized_collection",
    metadata={
        "hnsw:space": "cosine",
        "hnsw:M": 32,                    # 增加连接数（默认16）
        "hnsw:construction_ef": 400,     # 增加构建搜索宽度
        "hnsw:search_ef": 200            # 增加查询搜索宽度
    }
)
```

### 2. 批量操作

```python
# 使用批量操作提高性能
def optimized_batch_insert(collection, ids, documents, metadatas, batch_size=500):
    """优化的批量插入"""
    for i in range(0, len(ids), batch_size):
        collection.add(
            ids=ids[i:i+batch_size],
            documents=documents[i:i+batch_size],
            metadatas=metadatas[i:i+batch_size]
        )
```

### 3. 查询优化

```python
# 只返回需要的字段
results = collection.query(
    query_texts=["查询"],
    n_results=5,
    include=["documents", "distances"]  # 不返回metadatas
)

# 使用预过滤缩小搜索范围
results = collection.query(
    query_texts=["查询"],
    where={"category": "tech"},  # 先过滤再搜索
    n_results=5
)
```

## 最佳实践

### 1. 数据组织

```python
# 按类别组织集合
tech_collection = client.create_collection("tech_docs")
science_collection = client.create_collection("science_docs")

# 或者使用元数据过滤
all_collection = client.create_collection("all_docs")
# 插入时添加category元数据
```

### 2. 持久化策略

```python
# 定期持久化
import time

def periodic_persist(client, interval=300):
    """定期持久化"""
    while True:
        time.sleep(interval)
        client.persist()
        print(f"数据已持久化: {time.strftime('%Y-%m-%d %H:%M:%S')}")
```

### 3. 错误处理

```python
import chromadb
from chromadb.errors import InvalidCollectionException

def safe_query(collection_name, query_text, n_results=5):
    """安全的查询函数"""
    try:
        client = chromadb.PersistentClient(path="./chroma_db")
        collection = client.get_collection(collection_name)
        
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results
    except InvalidCollectionException:
        print(f"集合 {collection_name} 不存在")
        return None
    except Exception as e:
        print(f"查询错误: {str(e)}")
        return None
```

## 适用场景

| 场景 | 推荐度 | 说明 |
|------|--------|------|
| 原型开发 | ⭐⭐⭐⭐⭐ | 安装简单，API直观 |
| 学习实验 | ⭐⭐⭐⭐⭐ | 文档丰富，社区活跃 |
| 小规模生产 | ⭐⭐⭐⭐ | 百万级向量表现良好 |
| 大规模生产 | ⭐⭐ | 建议使用Milvus或Pinecone |
| 嵌入式应用 | ⭐⭐⭐⭐⭐ | 支持嵌入式部署 |
| 多模态应用 | ⭐⭐ | 不原生支持多模态 |

## 局限性

1. **不支持分布式** - 无法水平扩展
2. **性能瓶颈** - 超过千万级向量性能下降
3. **功能有限** - 不支持混合搜索、多模态等高级功能
4. **生产级特性不足** - 缺乏事务、复制等企业级特性

## 下一步学习

- [FAISS详解](/agent/rag/vector-databases/faiss) - 更高性能的本地方案
- [Milvus详解](/agent/rag/vector-databases/milvus) - 大规模生产环境方案
- [RAG实现](/agent/rag/implementation) - 学习如何构建RAG系统
