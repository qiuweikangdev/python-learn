# pgvector详解

## 概述

pgvector是PostgreSQL的向量搜索扩展，让你可以在现有的PostgreSQL数据库中存储和查询向量。它以零额外基础设施、SQL兼容性和事务支持著称，是已有PostgreSQL环境的理想选择。

## 核心特点

| 特性 | 说明 |
|------|------|
| **PostgreSQL扩展** | 无需额外基础设施 |
| **SQL兼容** | 使用标准SQL查询 |
| **事务支持** | 支持ACID事务 |
| **混合查询** | 向量+关系数据联合查询 |
| **成本效益** | 利用现有PG基础设施 |
| **开源免费** | 完全开源 |

## 安装与配置

### 安装pgvector

```bash
# 使用Docker
docker pull pgvector/pgvector:pg16
docker run -d \
    --name pgvector \
    -e POSTGRES_PASSWORD=your_password \
    -p 5432:5432 \
    pgvector/pgvector:pg16

# Ubuntu/Debian安装
sudo apt install postgresql-16-pgvector

# macOS安装
brew install pgvector

# 从源码安装
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

### 启用扩展

```sql
-- 连接到PostgreSQL后执行
CREATE EXTENSION vector;

-- 验证安装
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Python客户端安装

```bash
pip install psycopg2-binary pgvector
```

## 核心API详解

### 1. 连接管理

```python
import psycopg2
from pgvector.psycopg2 import register_vector

# 连接到PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="your_database",
    user="your_user",
    password="your_password"
)

# 注册pgvector类型
register_vector(conn)

# 创建游标
cur = conn.cursor()
```

### 2. 表和索引管理

```python
import psycopg2
from pgvector.psycopg2 import register_vector

conn = psycopg2.connect("...")
register_vector(conn)
cur = conn.cursor()

# 创建带向量列的表
cur.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT,
        source VARCHAR(100),
        year INTEGER,
        embedding vector(768)  -- 768维向量
    )
""")

# 创建索引
# HNSW索引（推荐）
cur.execute("""
    CREATE INDEX ON documents 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 200)
""")

# IVFFlat索引
cur.execute("""
    CREATE INDEX ON documents 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)
""")

conn.commit()
```

### 3. 数据操作

```python
import numpy as np

# 插入数据
def insert_document(cur, content, source, year, embedding):
    """插入文档"""
    cur.execute(
        """
        INSERT INTO documents (content, source, year, embedding)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """,
        (content, source, year, embedding.tolist())
    )
    return cur.fetchone()[0]

# 批量插入
def batch_insert(cur, documents, batch_size=100):
    """批量插入文档"""
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]
        
        values = []
        params = []
        for doc in batch:
            values.append("(%s, %s, %s, %s)")
            params.extend([
                doc["content"],
                doc["source"],
                doc["year"],
                doc["embedding"].tolist()
            ])
        
        query = f"""
            INSERT INTO documents (content, source, year, embedding)
            VALUES {', '.join(values)}
        """
        cur.execute(query, params)
        
        print(f"已插入 {min(i+batch_size, len(documents))}/{len(documents)}")

# 更新数据
cur.execute(
    "UPDATE documents SET content = %s WHERE id = %s",
    ("更新后的内容", 1)
)

# 删除数据
cur.execute("DELETE FROM documents WHERE id = %s", (1,))
```

### 4. 查询操作

```python
import numpy as np

# 向量搜索（余弦距离）
query_embedding = np.random.random(768)

cur.execute(
    """
    SELECT id, content, source, year,
           1 - (embedding <=> %s) as similarity
    FROM documents
    ORDER BY embedding <=> %s
    LIMIT 5
    """,
    (query_embedding.tolist(), query_embedding.tolist())
)

results = cur.fetchall()
for row in results:
    print(f"ID: {row[0]}, 相似度: {row[4]:.4f}")
    print(f"内容: {row[1][:50]}...")

# L2距离搜索
cur.execute(
    """
    SELECT id, content,
           embedding <-> %s as distance
    FROM documents
    ORDER BY embedding <-> %s
    LIMIT 5
    """,
    (query_embedding.tolist(), query_embedding.tolist())
)

# 内积搜索
cur.execute(
    """
    SELECT id, content,
           embedding <#> %s as negative_inner_product
    FROM documents
    ORDER BY embedding <#> %s
    LIMIT 5
    """,
    (query_embedding.tolist(), query_embedding.tolist())
)
```

### 5. 混合查询

```python
# 向量 + SQL过滤
cur.execute(
    """
    SELECT id, content, source, year,
           1 - (embedding <=> %s) as similarity
    FROM documents
    WHERE source = %s AND year >= %s
    ORDER BY embedding <=> %s
    LIMIT 5
    """,
    (query_embedding.tolist(), "web", 2023, query_embedding.tolist())
)

# 向量 + 全文搜索
cur.execute("""
    SELECT id, content,
           1 - (embedding <=> %s) as similarity
    FROM documents
    WHERE to_tsvector('english', content) @@ to_tsquery('english', 'artificial & intelligence')
    ORDER BY embedding <=> %s
    LIMIT 5
""", (query_embedding.tolist(), query_embedding.tolist()))

# 复杂SQL查询
cur.execute("""
    WITH ranked_docs AS (
        SELECT id, content, source, year,
               1 - (embedding <=> %s) as similarity,
               ROW_NUMBER() OVER (PARTITION BY source ORDER BY embedding <=> %s) as rank
        FROM documents
        WHERE year >= 2020
    )
    SELECT * FROM ranked_docs
    WHERE rank <= 3
    ORDER BY similarity DESC
""", (query_embedding.tolist(), query_embedding.tolist()))
```

### 6. 距离度量

```python
# 余弦距离 (<=>)
cur.execute("""
    SELECT 1 - (embedding <=> %s) as cosine_similarity
    FROM documents
    ORDER BY embedding <=> %s
""", (query_embedding.tolist(), query_embedding.tolist()))

# L2距离 (<->)
cur.execute("""
    SELECT embedding <-> %s as l2_distance
    FROM documents
    ORDER BY embedding <-> %s
""", (query_embedding.tolist(), query_embedding.tolist()))

# 内积 (<#>)
cur.execute("""
    SELECT (embedding <#> %s) * -1 as inner_product
    FROM documents
    ORDER BY embedding <#> %s
""", (query_embedding.tolist(), query_embedding.tolist()))
```

## 与LangChain集成

```python
from langchain_community.vectorstores import PGVector
from langchain_openai import OpenAIEmbeddings

# 连接字符串
CONNECTION_STRING = "postgresql+psycopg2://user:password@localhost:5432/database"

# 创建向量存储
embeddings = OpenAIEmbeddings()

vectorstore = PGVector.from_documents(
    documents=docs,
    embedding=embeddings,
    connection_string=CONNECTION_STRING,
    collection_name="documents",
    use_jsonb=True  # 使用JSONB存储元数据
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
    search_kwargs={"k": 5}
)
```

## 性能优化

### 1. 索引选择

```python
# HNSW索引（推荐，性能好）
cur.execute("""
    CREATE INDEX ON documents 
    USING hnsw (embedding vector_cosine_ops)
    WITH (
        m = 16,                # 每个节点的连接数（默认16）
        ef_construction = 200  # 构建时的搜索宽度
    )
""")

# 设置搜索参数
cur.execute("SET hnsw.ef_search = 100")  # 搜索时的宽度

# IVFFlat索引（内存效率高）
cur.execute("""
    CREATE INDEX ON documents 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)  # 聚类中心数量
""")

# 设置搜索参数
cur.execute("SET ivfflat.probes = 10")  # 搜索的聚类数量
```

### 2. 分区表

```python
# 创建分区表
cur.execute("""
    CREATE TABLE documents (
        id SERIAL,
        content TEXT,
        source VARCHAR(100),
        year INTEGER,
        embedding vector(768)
    ) PARTITION BY RANGE (year)
""")

# 创建分区
cur.execute("""
    CREATE TABLE documents_2023 PARTITION OF documents
    FOR VALUES FROM (2023) TO (2024)
""")

cur.execute("""
    CREATE TABLE documents_2024 PARTITION OF documents
    FOR VALUES FROM (2024) TO (2025)
""")
```

### 3. 查询优化

```python
# 使用EXPLAIN分析查询
cur.execute("""
    EXPLAIN ANALYZE
    SELECT id, content,
           1 - (embedding <=> %s) as similarity
    FROM documents
    ORDER BY embedding <=> %s
    LIMIT 5
""", (query_embedding.tolist(), query_embedding.tolist()))

print(cur.fetchall())

# 批量查询优化
def batch_search(cur, query_embeddings, k=5):
    """批量搜索"""
    results = []
    
    for query in query_embeddings:
        cur.execute(
            """
            SELECT id, content,
                   1 - (embedding <=> %s) as similarity
            FROM documents
            ORDER BY embedding <=> %s
            LIMIT %s
            """,
            (query.tolist(), query.tolist(), k)
        )
        results.append(cur.fetchall())
    
    return results
```

## 最佳实践

### 1. 数据建模

```python
# 合理设计表结构
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',  -- 使用JSONB存储灵活元数据
    embedding vector(768) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建JSONB索引
CREATE INDEX idx_metadata ON documents USING gin (metadata);

-- 创建向量索引
CREATE INDEX idx_embedding ON documents 
USING hnsw (embedding vector_cosine_ops);
```

### 2. 维护策略

```python
# 定期VACUUM
cur.execute("VACUUM ANALYZE documents")

# 监控索引使用
cur.execute("""
    SELECT schemaname, tablename, indexname, idx_scan
    FROM pg_stat_user_indexes
    WHERE tablename = 'documents'
""")

# 监控表大小
cur.execute("""
    SELECT pg_size_pretty(pg_total_relation_size('documents'))
""")
```

### 3. 连接池

```python
from psycopg2 import pool

# 创建连接池
connection_pool = pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=10,
    host="localhost",
    port=5432,
    database="your_database",
    user="your_user",
    password="your_password"
)

def get_connection():
    """获取连接"""
    return connection_pool.getconn()

def release_connection(conn):
    """释放连接"""
    connection_pool.putconn(conn)
```

## 适用场景

| 场景 | 推荐度 | 说明 |
|------|--------|------|
| 已有PG环境 | ⭐⭐⭐⭐⭐ | 零额外基础设施 |
| 需要事务 | ⭐⭐⭐⭐⭐ | 支持ACID |
| 混合查询 | ⭐⭐⭐⭐⭐ | SQL+向量联合查询 |
| 预算有限 | ⭐⭐⭐⭐⭐ | 开源免费 |
| 小规模应用 | ⭐⭐⭐⭐ | 性能足够 |
| 大规模应用 | ⭐⭐ | 建议使用专用向量数据库 |

## 局限性

1. **性能瓶颈** - 超过千万级向量性能下降明显
2. **扩展性有限** - 不支持原生分布式
3. **索引类型少** - 只支持HNSW和IVFFlat
4. **内存占用大** - 大规模数据内存消耗高

## 与其他方案对比

| 对比维度 | pgvector | Chroma | Milvus |
|---------|----------|--------|--------|
| 部署方式 | PG扩展 | 嵌入式/服务 | 分布式服务 |
| 额外基础设施 | 无 | 无 | 需要 |
| 事务支持 | ✅ | ❌ | ✅ |
| SQL支持 | ✅ | ❌ | ❌ |
| 性能 | 中 | 中 | 高 |
| 扩展性 | 低 | 低 | 高 |

## 下一步学习

- [Chroma详解](/agent/rag/vector-databases/chroma) - 更简单的入门方案
- [Milvus详解](/agent/rag/vector-databases/milvus) - 大规模分布式方案
- [RAG实现](/agent/rag/implementation) - 学习如何构建RAG系统
