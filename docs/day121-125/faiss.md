# FAISS详解

## 概述

FAISS（Facebook AI Similarity Search）是Facebook开源的高效相似性搜索和密集向量聚类的库。它能够在海量向量中快速找到最相似的向量，是目前最流行的向量检索库之一。

## 核心概念

### 1. 索引（Index）
FAISS的核心是索引结构：
- **平坦索引（Flat）**：精确搜索，适合小数据集
- **IVF索引**：倒排文件索引，适合大数据集
- **HNSW索引**：分层可导航小世界图
- **PQ索引**：乘积量化，节省内存

### 2. 距离度量（Distance Metric）
FAISS支持多种距离度量：
- **L2距离**：欧氏距离
- **内积**：向量内积
- **余弦相似度**：归一化后的内积

### 3. 训练（Training）
某些索引需要训练：
- **IVF索引**：需要训练聚类中心
- **PQ索引**：需要训练量化器
- **OPQ索引**：需要训练旋转矩阵

### 4. 搜索（Search）
FAISS的搜索功能：
- **最近邻搜索**：找到最相似的k个向量
- **范围搜索**：找到距离阈值内的所有向量
- **批量搜索**：支持批量查询

## 核心API

### 1. 安装
```bash
# CPU版本
pip install faiss-cpu

# GPU版本
pip install faiss-gpu
```

### 2. 创建索引
```python
import faiss
import numpy as np

# 创建平坦索引（精确搜索）
dimension = 128
index = faiss.IndexFlatL2(dimension)

# 创建IVF索引
nlist = 100  # 聚类中心数量
quantizer = faiss.IndexFlatL2(dimension)
index = faiss.IndexIVFFlat(quantizer, dimension, nlist)

# 创建HNSW索引
M = 32  # 每层的连接数
index = faiss.IndexHNSWFlat(dimension, M)

# 创建PQ索引
m = 8  # 子量化器数量
nbits = 8  # 每个子量化的比特数
index = faiss.IndexPQ(dimension, m, nbits)
```

### 3. 添加向量
```python
# 生成随机向量
nb = 10000  # 向量数量
vectors = np.random.random((nb, dimension)).astype('float32')

# 添加到索引
index.add(vectors)

# 检查索引中的向量数量
print(f"索引中的向量数量: {index.ntotal}")
```

### 4. 搜索向量
```python
# 生成查询向量
nq = 10  # 查询数量
queries = np.random.random((nq, dimension)).astype('float32')

# 搜索最相似的k个向量
k = 5
distances, indices = index.search(queries, k)

print(f"距离: {distances}")
print(f"索引: {indices}")
```

### 5. 训练索引
```python
# 创建需要训练的索引
nlist = 100
quantizer = faiss.IndexFlatL2(dimension)
index = faiss.IndexIVFFlat(quantizer, dimension, nlist)

# 训练索引
train_vectors = np.random.random((5000, dimension)).astype('float32')
index.train(train_vectors)

# 添加向量
index.add(vectors)
```

### 6. 保存和加载
```python
# 保存索引
faiss.write_index(index, "index.faiss")

# 加载索引
index = faiss.read_index("index.faiss")
```

## 实践指南

### 1. 环境准备
```bash
# 安装FAISS
pip install faiss-cpu

# 安装其他依赖
pip install numpy openai
```

### 2. 基础使用示例
```python
import faiss
import numpy as np
from openai import OpenAI

# 初始化OpenAI客户端
openai_client = OpenAI(api_key="your-api-key")

# 生成嵌入
def get_embedding(text):
    response = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

# 文档列表
documents = [
    "人工智能是计算机科学的一个分支",
    "机器学习是人工智能的一个子领域",
    "深度学习是机器学习的一种方法",
    "自然语言处理是人工智能的重要应用",
    "计算机视觉是人工智能的另一个重要应用"
]

# 生成文档嵌入
dimension = 1536  # OpenAI嵌入维度
vectors = []
for doc in documents:
    embedding = get_embedding(doc)
    vectors.append(embedding)

vectors = np.array(vectors).astype('float32')

# 创建索引
index = faiss.IndexFlatL2(dimension)

# 添加向量
index.add(vectors)

# 查询
query = "什么是机器学习？"
query_vector = np.array([get_embedding(query)]).astype('float32')

# 搜索
k = 3
distances, indices = index.search(query_vector, k)

print("查询结果：")
for i, (idx, dist) in enumerate(zip(indices[0], distances[0])):
    print(f"{i+1}. {documents[idx]}")
    print(f"   距离: {dist:.4f}")
```

### 3. IVF索引优化
```python
import faiss
import numpy as np

# 参数设置
dimension = 1536
nb = 100000  # 向量数量
nlist = 100  # 聚类中心数量

# 生成数据
vectors = np.random.random((nb, dimension)).astype('float32')

# 创建IVF索引
quantizer = faiss.IndexFlatL2(dimension)
index = faiss.IndexIVFFlat(quantizer, dimension, nlist)

# 训练索引
train_size = min(nb, 10000)
index.train(vectors[:train_size])

# 添加向量
index.add(vectors)

# 设置搜索时检查的聚类中心数量
index.nprobe = 10  # 默认是1，增大可以提高精度但降低速度

# 搜索
query = np.random.random((1, dimension)).astype('float32')
k = 5
distances, indices = index.search(query, k)
```

### 4. HNSW索引
```python
import faiss
import numpy as np

# 参数设置
dimension = 1536
M = 32  # 每层的连接数

# 创建HNSW索引
index = faiss.IndexHNSWFlat(dimension, M)

# 设置搜索参数
index.hnsw.efSearch = 64  # 搜索时的动态候选列表大小

# 添加向量
vectors = np.random.random((10000, dimension)).astype('float32')
index.add(vectors)

# 搜索
query = np.random.random((1, dimension)).astype('float32')
k = 5
distances, indices = index.search(query, k)
```

### 5. PQ索引节省内存
```python
import faiss
import numpy as np

# 参数设置
dimension = 1536
m = 8  # 子量化器数量
nbits = 8  # 每个子量化的比特数

# 创建PQ索引
index = faiss.IndexPQ(dimension, m, nbits)

# 训练索引
train_vectors = np.random.random((10000, dimension)).astype('float32')
index.train(train_vectors)

# 添加向量
vectors = np.random.random((100000, dimension)).astype('float32')
index.add(vectors)

# 搜索
query = np.random.random((1, dimension)).astype('float32')
k = 5
distances, indices = index.search(query, k)
```

### 6. GPU加速
```python
import faiss
import numpy as np

# 检查GPU是否可用
print(f"GPU数量: {faiss.get_num_gpus()}")

# 创建GPU索引
dimension = 1536
index_cpu = faiss.IndexFlatL2(dimension)

# 将索引移到GPU
index_gpu = faiss.index_cpu_to_all_gpus(index_cpu)

# 添加向量
vectors = np.random.random((100000, dimension)).astype('float32')
index_gpu.add(vectors)

# 搜索
query = np.random.random((1, dimension)).astype('float32')
k = 5
distances, indices = index_gpu.search(query, k)

# 将索引移回CPU
index_cpu = faiss.index_gpu_to_all_cpus(index_gpu)
```

## 最佳实践

### 1. 索引选择
- **小数据集（<10K）**：使用Flat索引
- **中等数据集（10K-1M）**：使用IVF或HNSW索引
- **大数据集（>1M）**：使用IVFPQ或HNSW索引
- **内存受限**：使用PQ或OPQ索引

### 2. 参数调优
- **IVF索引**：调整nlist和nprobe
- **HNSW索引**：调整M和efSearch
- **PQ索引**：调整m和nbits

### 3. 性能优化
- **批量处理**：使用批量搜索
- **GPU加速**：大数据集使用GPU
- **内存映射**：使用mmap加载大索引

## 常见问题

### 1. 安装问题
- **依赖冲突**：使用虚拟环境
- **GPU支持**：安装faiss-gpu版本

### 2. 性能问题
- **搜索慢**：调整索引参数
- **内存占用高**：使用PQ索引
- **训练慢**：减少训练数据量

### 3. 精度问题
- **精度低**：增大nprobe或efSearch
- **结果不稳定**：使用Flat索引验证

## 下一步学习

- [pgvector详解](/day121-125/pgvector) - PostgreSQL向量扩展
- [Redis详解](/day121-125/redis) - Redis向量搜索模块
- [Elasticsearch详解](/day121-125/elasticsearch) - Elasticsearch向量搜索