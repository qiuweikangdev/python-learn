# FAISS详解

## 概述

FAISS（Facebook AI Similarity Search）是Facebook开源的高性能相似性搜索库，专门用于高效搜索和密集向量的聚类。它是目前最流行的向量搜索库之一，以极致的性能著称。

## 核心特点

| 特性 | 说明 |
|------|------|
| **极致性能** | C++实现，支持GPU加速 |
| **多种索引** | 支持HNSW、IVF、PQ等多种索引 |
| **内存高效** | 支持向量量化，大幅减少内存占用 |
| **可扩展性** | 支持十亿级向量搜索 |
| **纯库形式** | 无需部署服务，直接嵌入应用 |
| **研究友好** | 学术界广泛使用，论文引用率高 |

## 安装与配置

### 安装

```bash
# CPU版本
pip install faiss-cpu

# GPU版本（需要CUDA）
pip install faiss-gpu

# 或者从conda安装
conda install -c pytorch faiss-cpu
conda install -c pytorch faiss-gpu
```

### 验证安装

```python
import faiss
print(f"FAISS版本: {faiss.__version__}")
print(f"GPU支持: {faiss.get_num_gpus()}")
```

## 核心API详解

### 1. 基础索引

```python
import faiss
import numpy as np

# 创建基础索引
dimension = 768  # 向量维度

# 1. 暴力搜索索引（精确但慢）
index_flat = faiss.IndexFlatL2(dimension)  # L2距离
index_flat = faiss.IndexFlatIP(dimension)  # 内积距离

# 2. 平面索引（支持内积）
index_ip = faiss.IndexFlatIP(dimension)

# 3. L2索引
index_l2 = faiss.IndexFlatL2(dimension)

# 添加向量
vectors = np.random.random((1000, dimension)).astype('float32')
index_flat.add(vectors)

print(f"索引中的向量数: {index_flat.ntotal}")
print(f"向量维度: {index_flat.d}")
```

### 2. HNSW索引

```python
# HNSW索引 - 高性能近似搜索
M = 32  # 每个节点的连接数（默认16，越大越精确但越慢）
index_hnsw = faiss.IndexHNSWFlat(dimension, M)

# 设置搜索参数
index_hnsw.hnsw.efSearch = 64  # 搜索时的动态候选列表大小
index_hnsw.hnsw.efConstruction = 200  # 构建时的候选列表大小

# 添加向量
index_hnsw.add(vectors)

# 搜索
query = np.random.random((1, dimension)).astype('float32')
k = 5  # 返回最近的5个邻居
distances, indices = index_hnsw.search(query, k)

print(f"最近邻索引: {indices[0]}")
print(f"距离: {distances[0]}")
```

### 3. IVF索引

```python
# IVF索引 - 倒排文件索引
nlist = 100  # 聚类中心数量
quantizer = faiss.IndexFlatL2(dimension)  # 量化器
index_ivf = faiss.IndexIVFFlat(quantizer, dimension, nlist)

# 训练索引（IVF需要训练）
train_vectors = np.random.random((10000, dimension)).astype('float32')
index_ivf.train(train_vectors)

# 添加向量
index_ivf.add(vectors)

# 设置搜索参数
index_ivf.nprobe = 10  # 搜索的聚类数量（越大越精确但越慢）

# 搜索
distances, indices = index_ivf.search(query, k)
```

### 4. PQ索引（乘积量化）

```python
# PQ索引 - 内存高效的量化索引
m = 8  # 子向量数量（必须是维度的因子）
nbits = 8  # 每个子向量的比特数

index_pq = faiss.IndexPQ(dimension, m, nbits)

# 训练
index_pq.train(train_vectors)

# 添加向量
index_pq.add(vectors)

# 搜索
distances, indices = index_pq.search(query, k)

# 内存占用对比
flat_size = vectors.nbytes / 1024 / 1024  # MB
pq_size = index_pq.sa_code_size() * vectors.shape[0] / 1024 / 1024  # MB
print(f"原始向量内存: {flat_size:.2f} MB")
print(f"PQ索引内存: {pq_size:.2f} MB")
print(f"压缩比: {flat_size/pq_size:.1f}x")
```

### 5. IVF+PQ组合索引

```python
# IVF+PQ组合 - 平衡性能和内存
nlist = 100
m = 8
quantizer = faiss.IndexFlatL2(dimension)
index_ivfpq = faiss.IndexIVFPQ(quantizer, dimension, nlist, m, 8)

# 训练
index_ivfpq.train(train_vectors)

# 添加向量
index_ivfpq.add(vectors)

# 搜索
index_ivfpq.nprobe = 10
distances, indices = index_ivfpq.search(query, k)
```

### 6. GPU加速

```python
import faiss

# 检查GPU可用性
if faiss.get_num_gpus() > 0:
    print(f"可用GPU数量: {faiss.get_num_gpus()}")
    
    # 将CPU索引转移到GPU
    gpu_index = faiss.index_cpu_to_all_gpus(index_flat)
    
    # 或者直接创建GPU索引
    res = faiss.StandardGpuResources()
    gpu_index = faiss.index_cpu_to_gpu(res, 0, index_flat)
    
    # GPU搜索
    distances, indices = gpu_index.search(query, k)
    
    # 转回CPU索引
    cpu_index = faiss.index_gpu_to_cpu(gpu_index)
else:
    print("GPU不可用，使用CPU版本")
```

### 7. 索引持久化

```python
# 保存索引
faiss.write_index(index_flat, "index.faiss")

# 加载索引
loaded_index = faiss.read_index("index.faiss")

# 保存到内存（字节形式）
index_bytes = faiss.serialize_index(index_flat)

# 从内存加载
index_from_bytes = faiss.deserialize_index(index_bytes)
```

## 与LangChain集成

```python
from langchain_community.vectorstores import FAISS
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
vectorstore = FAISS.from_documents(
    documents=docs,
    embedding=embeddings
)

# 相似性搜索
results = vectorstore.similarity_search("查询内容", k=3)

# 保存向量存储
vectorstore.save_local("faiss_index")

# 加载向量存储
loaded_vectorstore = FAISS.load_local(
    "faiss_index",
    embeddings,
    allow_dangerous_deserialization=True
)

# 添加新文档
new_docs = ["新文档内容1", "新文档内容2"]
vectorstore.add_texts(new_docs)

# 删除文档
vectorstore.delete(["doc_id_1", "doc_id_2"])
```

## 性能优化

### 1. 选择合适的索引

```python
def choose_index(dimension, num_vectors, memory_limit_mb=None):
    """根据需求选择索引类型"""
    
    if num_vectors < 10000:
        # 小数据集：暴力搜索
        return faiss.IndexFlatL2(dimension)
    
    elif num_vectors < 1000000:
        # 中等数据集：HNSW
        return faiss.IndexHNSWFlat(dimension, 32)
    
    elif memory_limit_mb and memory_limit_mb < num_vectors * dimension * 4 / 1024 / 1024:
        # 内存受限：IVF+PQ
        nlist = min(4096, int(np.sqrt(num_vectors)))
        m = 8  # 子向量数量
        quantizer = faiss.IndexFlatL2(dimension)
        return faiss.IndexIVFPQ(quantizer, dimension, nlist, m, 8)
    
    else:
        # 大数据集：IVF
        nlist = min(4096, int(np.sqrt(num_vectors)))
        quantizer = faiss.IndexFlatL2(dimension)
        return faiss.IndexIVFFlat(quantizer, dimension, nlist)
```

### 2. 参数调优

```python
# HNSW参数调优
def tune_hnsw(dimension, M=32, ef_construction=200, ef_search=64):
    """调优HNSW参数"""
    index = faiss.IndexHNSWFlat(dimension, M)
    index.hnsw.efConstruction = ef_construction
    index.hnsw.efSearch = ef_search
    return index

# IVF参数调优
def tune_ivf(dimension, nlist=100, nprobe=10):
    """调优IVF参数"""
    quantizer = faiss.IndexFlatL2(dimension)
    index = faiss.IndexIVFFlat(quantizer, dimension, nlist)
    index.nprobe = nprobe
    return index
```

### 3. 批量操作

```python
def batch_add(index, vectors, batch_size=10000):
    """批量添加向量"""
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i+batch_size]
        index.add(batch)
        print(f"已添加 {min(i+batch_size, len(vectors))}/{len(vectors)}")

def batch_search(index, queries, k=5, batch_size=1000):
    """批量搜索"""
    all_distances = []
    all_indices = []
    
    for i in range(0, len(queries), batch_size):
        batch = queries[i:i+batch_size]
        distances, indices = index.search(batch, k)
        all_distances.append(distances)
        all_indices.append(indices)
    
    return np.vstack(all_distances), np.vstack(all_indices)
```

## 最佳实践

### 1. 内存管理

```python
import faiss
import psutil

def monitor_memory():
    """监控内存使用"""
    process = psutil.Process()
    return process.memory_info().rss / 1024 / 1024  # MB

# 使用量化减少内存
def create_memory_efficient_index(dimension, vectors):
    """创建内存高效的索引"""
    m = 8  # 子向量数量
    nbits = 8
    
    index = faiss.IndexPQ(dimension, m, nbits)
    index.train(vectors)
    index.add(vectors)
    
    return index
```

### 2. 索引选择指南

| 数据规模 | 推荐索引 | 内存占用 | 搜索速度 | 精度 |
|---------|---------|---------|---------|------|
| < 10K | IndexFlatL2 | 高 | 快 | 100% |
| 10K - 100K | IndexHNSWFlat | 中 | 很快 | 95%+ |
| 100K - 1M | IndexIVFFlat | 中 | 快 | 90%+ |
| 1M - 10M | IndexIVFPQ | 低 | 中 | 85%+ |
| > 10M | IndexIVFPQ + 分片 | 低 | 中 | 85%+ |

### 3. 常见问题

```python
# 问题1: 维度不匹配
try:
    index.add(vectors)
except RuntimeError as e:
    if "dimension" in str(e).lower():
        print(f"维度不匹配: 索引维度={index.d}, 向量维度={vectors.shape[1]}")

# 问题2: 索引未训练
if not index.is_trained:
    print("索引需要训练")
    index.train(train_vectors)

# 问题3: 内存不足
def create_on_disk_index(dimension, filename):
    """创建磁盘索引"""
    # 使用内存映射
    index = faiss.IndexFlatL2(dimension)
    # 无法直接创建磁盘索引，但可以分片处理
    return index
```

## 适用场景

| 场景 | 推荐度 | 说明 |
|------|--------|------|
| 研究实验 | ⭐⭐⭐⭐⭐ | 学术界标准工具 |
| 高性能需求 | ⭐⭐⭐⭐⭐ | GPU加速，极致性能 |
| 本地部署 | ⭐⭐⭐⭐⭐ | 纯库形式，无需服务 |
| 原型开发 | ⭐⭐⭐⭐ | API相对底层 |
| 大规模数据 | ⭐⭐⭐⭐⭐ | 支持十亿级向量 |
| 生产环境 | ⭐⭐⭐ | 需要自行封装服务 |

## 局限性

1. **无元数据过滤** - 不支持基于元数据的过滤查询
2. **无CRUD支持** - 删除操作需要重建索引
3. **需要自行封装** - 作为库，需要自行构建服务层
4. **Python接口有限** - 部分高级功能需要C++接口

## 与其他方案对比

| 对比维度 | FAISS | Chroma | Milvus |
|---------|-------|--------|--------|
| 部署方式 | 库 | 嵌入式/服务 | 分布式服务 |
| 性能 | 极高 | 中 | 高 |
| 内存效率 | 高(量化) | 中 | 中 |
| 元数据过滤 | ❌ | ✅ | ✅ |
| 学习曲线 | 中 | 低 | 高 |
| 适用规模 | 十亿级 | 百万级 | 百亿级 |

## 下一步学习

- [Chroma详解](/agent/rag/vector-databases/chroma) - 更简单的入门方案
- [Milvus详解](/agent/rag/vector-databases/milvus) - 大规模生产环境方案
- [RAG实现](/agent/rag/implementation) - 学习如何构建RAG系统
