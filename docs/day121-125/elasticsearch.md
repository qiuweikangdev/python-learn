# Elasticsearch详解

## 概述

Elasticsearch是一个分布式搜索和分析引擎，支持向量搜索功能。它结合了全文搜索和向量搜索能力，适合需要混合搜索的场景。

## 核心概念

### 1. 索引（Index）
Elasticsearch中的索引：
- **文档集合**：类似数据库中的表
- **映射**：定义文档的结构
- **分片**：数据分片存储
- **副本**：数据副本备份

### 2. 文档（Document）
文档是Elasticsearch中的基本数据单元：
- **ID**：文档的唯一标识
- **字段**：文档的属性
- **向量字段**：存储向量数据
- **元数据**：文档的附加信息

### 3. 向量搜索（Vector Search）
Elasticsearch的向量搜索功能：
- **dense_vector**：密集向量字段类型
- **相似性搜索**：基于向量相似度的搜索
- **混合搜索**：结合全文搜索和向量搜索
- **KNN搜索**：k-最近邻搜索

### 4. 查询类型（Query Types）
Elasticsearch支持的查询类型：
- **match查询**：全文搜索
- **knn查询**：向量搜索
- **bool查询**：组合查询
- **script_score查询**：自定义评分

## 核心API

### 1. 安装和配置
```bash
# 使用Docker运行Elasticsearch
docker run -d --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.10.0

# 安装Python客户端
pip install elasticsearch
```

### 2. 创建索引
```python
from elasticsearch import Elasticsearch

# 连接到Elasticsearch
es = Elasticsearch("http://localhost:9200")

# 定义映射
mapping = {
    "mappings": {
        "properties": {
            "content": {"type": "text"},
            "category": {"type": "keyword"},
            "year": {"type": "integer"},
            "embedding": {
                "type": "dense_vector",
                "dims": 1536,
                "index": True,
                "similarity": "cosine"
            }
        }
    }
}

# 创建索引
es.indices.create(index="documents", body=mapping)
```

### 3. 插入文档
```python
# 插入单个文档
doc = {
    "content": "人工智能是计算机科学的一个分支",
    "category": "ai",
    "year": 2023,
    "embedding": [0.1, 0.2, 0.3, ...]  # 向量
}

es.index(index="documents", id=1, document=doc)

# 批量插入
from elasticsearch.helpers import bulk

actions = []
for i in range(1000):
    doc = {
        "_index": "documents",
        "_id": i,
        "_source": {
            "content": f"文档{i}",
            "category": "test",
            "year": 2023,
            "embedding": [0.1 * i, 0.2 * i, ...]
        }
    }
    actions.append(doc)

bulk(es, actions)
```

### 4. 向量搜索
```python
# KNN搜索
query = {
    "knn": {
        "field": "embedding",
        "query_vector": [0.1, 0.2, 0.3, ...],
        "k": 5,
        "num_candidates": 100
    }
}

results = es.search(index="documents", body=query)

# 打印结果
for hit in results["hits"]["hits"]:
    print(f"ID: {hit['_id']}, Score: {hit['_score']}")
    print(f"Content: {hit['_source']['content']}")
```

### 5. 混合搜索
```python
# 结合全文搜索和向量搜索
query = {
    "query": {
        "bool": {
            "must": [
                {"match": {"content": "人工智能"}}
            ],
            "filter": [
                {"term": {"category": "ai"}}
            ]
        }
    },
    "knn": {
        "field": "embedding",
        "query_vector": [0.1, 0.2, 0.3, ...],
        "k": 5,
        "num_candidates": 100
    }
}

results = es.search(index="documents", body=query)
```

### 6. 带过滤的向量搜索
```python
# 带过滤的KNN搜索
query = {
    "knn": {
        "field": "embedding",
        "query_vector": [0.1, 0.2, 0.3, ...],
        "k": 5,
        "num_candidates": 100,
        "filter": {
            "bool": {
                "must": [
                    {"term": {"category": "ai"}},
                    {"range": {"year": {"gte": 2020}}}
                ]
            }
        }
    }
}

results = es.search(index="documents", body=query)
```

### 7. 更新和删除
```python
# 更新文档
es.update(
    index="documents",
    id=1,
    body={
        "doc": {
            "content": "更新后的内容"
        }
    }
)

# 删除文档
es.delete(index="documents", id=1)

# 删除索引
es.indices.delete(index="documents")
```

## 实践指南

### 1. 环境准备
```bash
# 使用Docker运行Elasticsearch
docker run -d --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.10.0

# 安装Python依赖
pip install elasticsearch openai
```

### 2. 基础使用示例
```python
from elasticsearch import Elasticsearch
from openai import OpenAI

# 连接到Elasticsearch
es = Elasticsearch("http://localhost:9200")

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
mapping = {
    "mappings": {
        "properties": {
            "content": {"type": "text"},
            "embedding": {
                "type": "dense_vector",
                "dims": 1536,
                "index": True,
                "similarity": "cosine"
            }
        }
    }
}

if not es.indices.exists(index="documents"):
    es.indices.create(index="documents", body=mapping)

# 添加文档
documents = [
    "人工智能是计算机科学的一个分支",
    "机器学习是人工智能的一个子领域",
    "深度学习是机器学习的一种方法"
]

for i, doc in enumerate(documents):
    embedding = get_embedding(doc)
    es.index(
        index="documents",
        id=i,
        document={
            "content": doc,
            "embedding": embedding
        }
    )

# 刷新索引
es.indices.refresh(index="documents")

# 查询
query = "什么是机器学习？"
query_embedding = get_embedding(query)

search_query = {
    "knn": {
        "field": "embedding",
        "query_vector": query_embedding,
        "k": 3,
        "num_candidates": 100
    }
}

results = es.search(index="documents", body=search_query)

print("查询结果：")
for hit in results["hits"]["hits"]:
    print(f"Content: {hit['_source']['content']}, Score: {hit['_score']}")
```

### 3. 性能优化
```python
# 批量插入
from elasticsearch.helpers import bulk

actions = []
for i, doc in enumerate(documents):
    embedding = get_embedding(doc)
    actions.append({
        "_index": "documents",
        "_id": i,
        "_source": {
            "content": doc,
            "embedding": embedding
        }
    })

bulk(es, actions)

# 优化搜索参数
search_query = {
    "knn": {
        "field": "embedding",
        "query_vector": query_embedding,
        "k": 10,
        "num_candidates": 200,  # 增加候选数量
        "similarity": 0.7  # 设置相似度阈值
    }
}
```

### 4. 监控和调优
```python
# 查看索引统计
stats = es.indices.stats(index="documents")
print(f"文档数量: {stats['_all']['primaries']['docs']['count']}")
print(f"存储大小: {stats['_all']['primaries']['store']['size_in_bytes']}")

# 查看集群健康
health = es.cluster.health()
print(f"集群状态: {health['status']}")
```

## 最佳实践

### 1. 索引设计
- **合理设置分片**：根据数据量设置分片数量
- **创建合适的映射**：为字段创建合适的映射
- **使用合适的相似度**：根据场景选择相似度算法

### 2. 性能优化
- **批量操作**：使用批量插入和更新
- **合理设置参数**：调整KNN搜索参数
- **使用缓存**：利用Elasticsearch缓存

### 3. 数据管理
- **定期清理**：清理无用数据
- **监控性能**：监控查询性能
- **备份数据**：定期备份数据

## 常见问题

### 1. 连接问题
- **服务未启动**：检查Elasticsearch服务状态
- **端口冲突**：检查端口配置
- **认证失败**：检查认证配置

### 2. 性能问题
- **查询慢**：优化索引和查询
- **内存占用高**：优化数据结构
- **并发限制**：使用连接池

### 3. 数据问题
- **数据丢失**：检查副本配置
- **查询不准确**：调整相似度阈值

## 下一步学习

- [Agent框架](/day126-130/) - 了解各种Agent框架
- [多Agent系统](/day131-135/) - 学习多Agent协作
- [Deep-Agent开发](/day136-140/) - 深度学习与Agent结合