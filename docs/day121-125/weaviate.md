# Weaviate详解

## 概述

Weaviate是一个开源的向量数据库，支持多种数据类型和搜索模式。它提供了GraphQL和RESTful API，支持多模态数据存储和查询。

## 核心概念

### 1. 类（Class）
Weaviate中的类类似于数据库中的表：
- **属性定义**：定义类的属性
- **向量化配置**：配置向量化方式
- **索引配置**：配置索引参数
- **模块配置**：配置使用的模块

### 2. 对象（Object）
对象是Weaviate中的基本数据单元：
- **ID**：对象的唯一标识
- **属性**：对象的属性值
- **向量**：对象的向量表示
- **元数据**：对象的附加信息

### 3. 模块（Module）
Weaviate的模块系统：
- **文本向量化模块**：如text2vec-transformers
- **图像向量化模块**：如img2vec-neural
- **问答模块**：如qna-transformers
- **生成模块**：如generative-openai

### 4. 查询（Query）
Weaviate的查询功能：
- **相似性搜索**：基于向量相似度的搜索
- **关键词搜索**：基于关键词的搜索
- **混合搜索**：结合向量和关键词搜索
- **过滤搜索**：基于属性的过滤

## 技术原理

### 1. 向量化机制
Weaviate的向量化机制：
- **自动向量化**：自动将数据转换为向量
- **自定义向量化**：使用自定义向量化模型
- **多模态向量化**：支持多种数据类型的向量化
- **增量向量化**：支持增量更新向量

### 2. 索引结构
Weaviate的索引结构：
- **HNSW索引**：分层可导航小世界图
- **倒排索引**：支持关键词搜索
- **混合索引**：结合多种索引结构
- **动态索引**：支持动态调整索引参数

### 3. 查询优化
Weaviate的查询优化：
- **查询规划**：自动选择最优查询计划
- **缓存机制**：缓存查询结果
- **并行查询**：支持并行查询
- **近似搜索**：支持近似最近邻搜索

## 核心API

### 1. 安装和配置
```python
# 安装Weaviate客户端
pip install weaviate-client

# 连接到Weaviate
import weaviate

client = weaviate.Client(
    url="http://localhost:8080",
    additional_headers={
        "X-OpenAI-Api-Key": "your-openai-api-key"
    }
)
```

### 2. 创建类
```python
# 定义类
class_obj = {
    "class": "Article",
    "vectorizer": "text2vec-openai",
    "moduleConfig": {
        "text2vec-openai": {
            "model": "ada",
            "modelVersion": "002",
            "type": "text"
        }
    },
    "properties": [
        {
            "name": "title",
            "dataType": ["text"],
            "moduleConfig": {
                "text2vec-openai": {
                    "skip": False,
                    "vectorizePropertyName": False
                }
            }
        },
        {
            "name": "content",
            "dataType": ["text"]
        },
        {
            "name": "year",
            "dataType": ["int"]
        }
    ]
}

# 创建类
client.schema.create_class(class_obj)
```

### 3. 插入对象
```python
# 插入单个对象
data_object = {
    "title": "人工智能简介",
    "content": "人工智能是计算机科学的一个分支...",
    "year": 2023
}

client.data_object.create(
    data_object=data_object,
    class_name="Article"
)

# 批量插入
objects = [
    {
        "title": "机器学习基础",
        "content": "机器学习是人工智能的一个子领域...",
        "year": 2022
    },
    {
        "title": "深度学习应用",
        "content": "深度学习是机器学习的一种方法...",
        "year": 2023
    }
]

client.batch.configure(batch_size=100)
for obj in objects:
    client.batch.add_data_object(obj, "Article")
client.batch.flush()
```

### 4. 查询对象
```python
# 相似性搜索
result = (
    client.query
    .get("Article", ["title", "content", "year"])
    .with_near_text({"concepts": ["人工智能"]})
    .with_limit(10)
    .do()
)

# 带过滤的搜索
result = (
    client.query
    .get("Article", ["title", "content", "year"])
    .with_near_text({"concepts": ["人工智能"]})
    .with_where({
        "path": ["year"],
        "operator": "GreaterThan",
        "valueInt": 2020
    })
    .with_limit(5)
    .do()
)

# 混合搜索
result = (
    client.query
    .get("Article", ["title", "content", "year"])
    .with_hybrid(
        query="人工智能",
        alpha=0.5  # 0表示纯关键词搜索，1表示纯向量搜索
    )
    .with_limit(10)
    .do()
)
```

### 5. 更新和删除
```python
# 更新对象
client.data_object.update(
    data_object={"title": "更新后的标题"},
    class_name="Article",
    uuid="your-uuid"
)

# 删除对象
client.data_object.delete(
    class_name="Article",
    uuid="your-uuid"
)

# 删除类
client.schema.delete_class("Article")
```

## 实践指南

### 1. 环境准备
```bash
# 使用Docker运行Weaviate
docker run -d -p 8080:8080 -p 50051:50051 \
  -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
  -e PERSISTENCE_DATA_PATH=/var/lib/weaviate \
  semitechnologies/weaviate:latest

# 安装客户端
pip install weaviate-client openai
```

### 2. 基础使用示例
```python
import weaviate
from openai import OpenAI

# 连接到Weaviate
client = weaviate.Client(
    url="http://localhost:8080",
    additional_headers={
        "X-OpenAI-Api-Key": "your-openai-api-key"
    }
)

# 创建类
class_obj = {
    "class": "Document",
    "vectorizer": "text2vec-openai",
    "properties": [
        {"name": "content", "dataType": ["text"]},
        {"name": "source", "dataType": ["text"]},
        {"name": "timestamp", "dataType": ["date"]}
    ]
}

if not client.schema.exists("Document"):
    client.schema.create_class(class_obj)

# 插入文档
documents = [
    {"content": "人工智能是计算机科学的一个分支", "source": "wiki", "timestamp": "2023-01-01T00:00:00Z"},
    {"content": "机器学习是人工智能的一个子领域", "source": "textbook", "timestamp": "2023-02-01T00:00:00Z"}
]

for doc in documents:
    client.data_object.create(doc, "Document")

# 查询
result = (
    client.query
    .get("Document", ["content", "source"])
    .with_near_text({"concepts": ["人工智能"]})
    .with_limit(5)
    .do()
)

print(result)
```

### 3. 多模态数据
```python
# 图像数据
class ImageClass:
    class_obj = {
        "class": "Image",
        "vectorizer": "img2vec-neural",
        "moduleConfig": {
            "img2vec-neural": {
                "imageFields": ["image"]
            }
        },
        "properties": [
            {"name": "image", "dataType": ["blob"]},
            {"name": "description", "dataType": ["text"]}
        ]
    }

# 插入图像
import base64

with open("image.jpg", "rb") as f:
    image_data = base64.b64encode(f.read()).decode("utf-8")

data_object = {
    "image": image_data,
    "description": "一张风景图片"
}

client.data_object.create(data_object, "Image")
```

### 4. 生成式查询
```python
# 使用生成式模块
result = (
    client.query
    .get("Document", ["content"])
    .with_near_text({"concepts": ["人工智能"]})
    .with_generate(
        single_prompt="请用中文总结以下内容: {content}"
    )
    .with_limit(3)
    .do()
)

for doc in result["data"]["Get"]["Document"]:
    print(f"Content: {doc['content']}")
    print(f"Summary: {doc['_additional']['generate']['singleResult']}")
    print()
```

## 最佳实践

### 1. 类设计
- **合理定义属性**：根据查询需求定义属性
- **选择合适的向量化器**：根据数据类型选择
- **配置索引参数**：根据性能需求配置
- **使用模块系统**：利用模块扩展功能

### 2. 性能优化
- **批量操作**：使用批量插入和查询
- **索引优化**：合理配置HNSW参数
- **查询优化**：使用合适的查询方式
- **缓存利用**：利用缓存提高性能

### 3. 数据管理
- **数据备份**：定期备份数据
- **数据清理**：清理无用数据
- **版本管理**：管理数据版本
- **监控告警**：监控系统状态

## 常见问题

### 1. 连接问题
- **服务未启动**：检查Weaviate服务状态
- **端口冲突**：检查端口配置
- **认证失败**：检查认证配置
- **网络问题**：检查网络连接

### 2. 性能问题
- **查询慢**：优化索引和查询
- **插入慢**：使用批量插入
- **内存占用高**：优化数据结构
- **并发限制**：调整并发配置

### 3. 数据问题
- **向量化失败**：检查向量化器配置
- **数据丢失**：检查持久化配置
- **查询结果不准确**：调整相似度阈值
- **模块错误**：检查模块配置

## 下一步学习

- [Milvus详解](/day121-125/milvus) - 高性能分布式向量数据库
- [Chroma详解](/day121-125/chroma) - 轻量级嵌入式向量数据库
- [Qdrant详解](/day121-125/qdrant) - Rust编写的高性能向量数据库