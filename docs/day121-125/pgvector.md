# pgvector详解

## 概述

pgvector是PostgreSQL的向量搜索扩展，允许在PostgreSQL中存储和查询向量。它结合了关系型数据库的强大功能和向量搜索能力，适合已有PostgreSQL环境的用户。

## 核心概念

### 1. 向量类型（Vector Type）
pgvector提供了向量数据类型：
- **vector**：固定维度的向量
- **halfvec**：半精度向量（节省空间）
- **sparsevec**：稀疏向量

### 2. 索引类型（Index Type）
pgvector支持多种索引：
- **IVFFlat**：倒排文件索引
- **HNSW**：分层可导航小世界图
- **精确搜索**：无索引的精确搜索

### 3. 距离度量（Distance Metric）
pgvector支持多种距离度量：
- **L2距离**：欧氏距离（<->）
- **内积**：向量内积（<#>）
- **余弦相似度**：余弦距离（<=>）

### 4. 查询操作（Query Operations）
pgvector的查询操作：
- **相似性搜索**：找到最相似的向量
- **范围搜索**：找到距离阈值内的向量
- **混合查询**：结合SQL条件的向量搜索

## 核心API

### 1. 安装和配置
```sql
-- 安装pgvector扩展
CREATE EXTENSION vector;

-- 检查版本
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 2. 创建表
```sql
-- 创建包含向量列的表
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding vector(1536)  -- OpenAI嵌入维度
);

-- 创建带元数据的表
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name TEXT,
    category TEXT,
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 插入数据
```sql
-- 插入向量数据
INSERT INTO documents (content, embedding)
VALUES (
    '人工智能是计算机科学的一个分支',
    '[0.1, 0.2, 0.3, ...]'::vector
);

-- 批量插入
INSERT INTO documents (content, embedding)
VALUES
    ('机器学习是人工智能的一个子领域', '[0.4, 0.5, 0.6, ...]'::vector),
    ('深度学习是机器学习的一种方法', '[0.7, 0.8, 0.9, ...]'::vector);
```

### 4. 创建索引
```sql
-- 创建IVFFlat索引
CREATE INDEX ON documents USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- 创建HNSW索引
CREATE INDEX ON documents USING hnsw (embedding vector_l2_ops)
WITH (m = 16, ef_construction = 64);

-- 创建余弦相似度索引
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### 5. 查询数据
```sql
-- L2距离搜索
SELECT id, content, embedding <-> '[0.1, 0.2, 0.3, ...]'::vector AS distance
FROM documents
ORDER BY embedding <-> '[0.1, 0.2, 0.3, ...]'::vector
LIMIT 5;

-- 余弦相似度搜索
SELECT id, content, embedding <=> '[0.1, 0.2, 0.3, ...]'::vector AS distance
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, 0.3, ...]'::vector
LIMIT 5;

-- 内积搜索
SELECT id, content, embedding <#> '[0.1, 0.2, 0.3, ...]'::vector AS distance
FROM documents
ORDER BY embedding <#> '[0.1, 0.2, 0.3, ...]'::vector
LIMIT 5;
```

### 6. 混合查询
```sql
-- 结合SQL条件的向量搜索
SELECT id, content, embedding <=> '[0.1, 0.2, 0.3, ...]'::vector AS distance
FROM documents
WHERE content LIKE '%人工智能%'
ORDER BY embedding <=> '[0.1, 0.2, 0.3, ...]'::vector
LIMIT 5;

-- 带元数据过滤的搜索
SELECT id, name, category, embedding <-> '[0.1, 0.2, 0.3, ...]'::vector AS distance
FROM items
WHERE category = 'technology'
ORDER BY embedding <-> '[0.1, 0.2, 0.3, ...]'::vector
LIMIT 10;
```

## 实践指南

### 1. 环境准备
```bash
# 安装PostgreSQL
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql

# 安装pgvector扩展
# macOS
brew install pgvector

# Ubuntu
sudo apt-get install postgresql-15-pgvector

# 启动PostgreSQL
brew services start postgresql
```

### 2. Python集成
```python
import psycopg2
from openai import OpenAI

# 连接到PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    database="your_database",
    user="your_user",
    password="your_password"
)

# 创建游标
cur = conn.cursor()

# 安装扩展
cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
conn.commit()

# 创建表
cur.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT,
        embedding vector(1536)
    )
""")
conn.commit()

# 初始化OpenAI客户端
openai_client = OpenAI(api_key="your-api-key")

# 生成嵌入
def get_embedding(text):
    response = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

# 插入文档
documents = [
    "人工智能是计算机科学的一个分支",
    "机器学习是人工智能的一个子领域",
    "深度学习是机器学习的一种方法"
]

for doc in documents:
    embedding = get_embedding(doc)
    cur.execute(
        "INSERT INTO documents (content, embedding) VALUES (%s, %s)",
        (doc, str(embedding))
    )
conn.commit()

# 查询
query = "什么是机器学习？"
query_embedding = get_embedding(query)

cur.execute("""
    SELECT id, content, embedding <=> %s::vector AS distance
    FROM documents
    ORDER BY embedding <=> %s::vector
    LIMIT 3
""", (str(query_embedding), str(query_embedding)))

results = cur.fetchall()
print("查询结果：")
for row in results:
    print(f"ID: {row[0]}, Content: {row[1]}, Distance: {row[2]}")
```

### 3. 索引优化
```sql
-- 查看索引大小
SELECT pg_size_pretty(pg_relation_size('documents_embedding_idx'));

-- 查看查询计划
EXPLAIN ANALYZE
SELECT id, content, embedding <=> '[0.1, 0.2, ...]'::vector AS distance
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;

-- 调整HNSW参数
SET hnsw.ef_search = 100;  -- 增加搜索精度

-- 调整IVFFlat参数
SET ivfflat.probes = 10;  -- 增加搜索精度
```

### 4. 性能监控
```sql
-- 查看表大小
SELECT pg_size_pretty(pg_total_relation_size('documents'));

-- 查看索引使用情况
SELECT schemaname, relname, indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE relname = 'documents';

-- 查看查询性能
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, content, embedding <=> '[0.1, 0.2, ...]'::vector AS distance
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;
```

## 最佳实践

### 1. 索引选择
- **小数据集（<10K）**：不使用索引
- **中等数据集（10K-1M）**：使用HNSW索引
- **大数据集（>1M）**：使用IVFFlat索引
- **需要更新频繁**：使用HNSW索引

### 2. 参数调优
- **HNSW索引**：调整m和ef_construction
- **IVFFlat索引**：调整lists参数
- **搜索参数**：调整ef_search和probes

### 3. 数据管理
- **批量插入**：使用批量插入提高性能
- **定期维护**：定期VACUUM和ANALYZE
- **监控性能**：监控查询性能和索引使用情况

## 常见问题

### 1. 安装问题
- **扩展未找到**：检查pgvector是否正确安装
- **版本不兼容**：检查PostgreSQL和pgvector版本兼容性

### 2. 性能问题
- **查询慢**：创建合适的索引
- **内存占用高**：优化向量维度
- **插入慢**：使用批量插入

### 3. 数据问题
- **精度低**：调整索引参数
- **数据类型错误**：确保向量格式正确

## 下一步学习

- [Redis详解](/day121-125/redis) - Redis向量搜索模块
- [Elasticsearch详解](/day121-125/elasticsearch) - Elasticsearch向量搜索
- [Agent框架](/day126-130/) - 了解各种Agent框架