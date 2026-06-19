# RAG实现与优化

## 概述

本章将深入介绍RAG（Retrieval-Augmented Generation）的实现细节和优化技巧，包括文档处理、向量存储、检索策略、生成优化等方面。

## 文档处理

### 1. 文档加载
支持多种文档格式的加载：
```python
from langchain_community.document_loaders import (
    PyPDFLoader,           # PDF文件
    TextLoader,            # 文本文件
    UnstructuredMarkdownLoader,  # Markdown文件
    UnstructuredHTMLLoader,      # HTML文件
    CSVLoader,             # CSV文件
    JSONLoader,            # JSON文件
    DirectoryLoader,       # 目录加载
    WebBaseLoader          # 网页加载
)

# 加载PDF文档
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 加载目录中的所有文档
loader = DirectoryLoader(
    "./documents",
    glob="**/*.pdf",
    loader_cls=PyPDFLoader
)
documents = loader.load()
```

### 2. 文本分割
文本分割是RAG的关键步骤：
```python
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
    TokenTextSplitter,
    MarkdownHeaderTextSplitter
)

# 递归字符分割器
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,        # 块大小
    chunk_overlap=200,      # 重叠大小
    length_function=len,    # 长度计算函数
    separators=["\n\n", "\n", " ", ""]  # 分隔符
)
chunks = text_splitter.split_documents(documents)

# 字符分割器
text_splitter = CharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separator="\n"
)
chunks = text_splitter.split_documents(documents)

# Token分割器
text_splitter = TokenTextSplitter(
    chunk_size=100,
    chunk_overlap=20
)
chunks = text_splitter.split_documents(documents)
```

### 3. 文档清洗
清洗文档以提高质量：
```python
import re
from typing import List

def clean_text(text: str) -> str:
    """清洗文本"""
    # 移除多余空白
    text = re.sub(r'\s+', ' ', text)
    # 移除特殊字符
    text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)]', '', text)
    # 规范化空格
    text = text.strip()
    return text

def clean_documents(documents: List) -> List:
    """清洗文档"""
    cleaned_docs = []
    for doc in documents:
        cleaned_content = clean_text(doc.page_content)
        doc.page_content = cleaned_content
        cleaned_docs.append(doc)
    return cleaned_docs

# 使用示例
cleaned_documents = clean_documents(documents)
```

## 向量存储

### 1. 嵌入模型选择
选择合适的嵌入模型：
```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings

# OpenAI嵌入模型
embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002",  # 模型名称
    openai_api_key="your-api-key"
)

# Hugging Face嵌入模型
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)

# 中文嵌入模型
embeddings = HuggingFaceEmbeddings(
    model_name="shibing624/text2vec-base-chinese",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)
```

### 2. 向量存储配置
配置向量存储：
```python
from langchain_community.vectorstores import Chroma, FAISS

# Chroma配置
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",
    collection_metadata={"hnsw:space": "cosine"}
)

# FAISS配置
vectorstore = FAISS.from_documents(
    documents=chunks,
    embedding=embeddings
)

# 保存和加载
vectorstore.save_local("faiss_index")
loaded_vectorstore = FAISS.load_local("faiss_index", embeddings)
```

### 3. 索引优化
优化向量索引：
```python
import faiss
import numpy as np

# 创建HNSW索引
dimension = 1536  # 向量维度
index = faiss.IndexHNSWFlat(dimension, 32)  # 32是连接数

# 添加向量
vectors = np.random.random((1000, dimension)).astype('float32')
index.add(vectors)

# 搜索
query = np.random.random((1, dimension)).astype('float32')
distances, indices = index.search(query, k=5)
```

## 检索策略

### 1. 相似性检索
基础的相似性检索：
```python
# 相似性搜索
results = vectorstore.similarity_search(
    query="查询内容",
    k=5
)

# 带分数的相似性搜索
results = vectorstore.similarity_search_with_score(
    query="查询内容",
    k=5
)

# MMR检索（最大边际相关性）
results = vectorstore.max_marginal_relevance_search(
    query="查询内容",
    k=5,
    fetch_k=20
)
```

### 2. 混合检索
结合多种检索方式：
```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# BM25检索器
bm25_retriever = BM25Retriever.from_documents(documents)
bm25_retriever.k = 5

# 向量检索器
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# 集成检索器
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.4, 0.6]
)

# 使用集成检索器
results = ensemble_retriever.invoke("查询内容")
```

### 3. 重排序
对检索结果进行重排序：
```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

# 交叉编码器
cross_encoder = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
reranker = CrossEncoderReranker(model=cross_encoder, top_n=3)

# 压缩检索器
compression_retriever = ContextualCompressionRetriever(
    base_compressor=reranker,
    base_retriever=vectorstore.as_retriever()
)

# 使用重排序检索器
results = compression_retriever.invoke("查询内容")
```

### 4. 查询扩展
扩展查询以提高召回率：
```python
from langchain.retrievers import MultiQueryRetriever

# 多查询检索器
multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(),
    llm=ChatOpenAI(model="gpt-3.5-turbo")
)

# 使用多查询检索器
results = multi_query_retriever.invoke("查询内容")
```

## 生成优化

### 1. 提示工程
设计有效的提示模板：
```python
from langchain.prompts import ChatPromptTemplate

# 基础RAG提示
template = """基于以下上下文回答问题。如果上下文中没有相关信息，请说"我不知道"。

上下文：
{context}

问题：
{question}

回答："""

prompt = ChatPromptTemplate.from_template(template)

# 带引用的RAG提示
template = """基于以下上下文回答问题，并引用来源。

上下文：
{context}

问题：
{question}

请提供详细回答，并在回答中引用来源（如[1]、[2]等）。"""

prompt = ChatPromptTemplate.from_template(template)
```

### 2. 上下文管理
管理上下文长度和质量：
```python
def truncate_context(context: str, max_tokens: int = 4000) -> str:
    """截断上下文"""
    # 简单的截断方法
    if len(context) > max_tokens:
        context = context[:max_tokens] + "..."
    return context

def select_relevant_context(query: str, contexts: List[str], top_k: int = 3) -> str:
    """选择相关的上下文"""
    # 这里可以使用更复杂的逻辑
    return "\n\n".join(contexts[:top_k])
```

### 3. 生成策略
优化生成策略：
```python
from langchain_openai import ChatOpenAI
from langchain.schema.output_parser import StrOutputParser

# 使用不同的模型
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
    max_tokens=1000
)

# 流式生成
for chunk in llm.stream("请回答以下问题"):
    print(chunk.content, end="")

# 批量生成
questions = ["问题1", "问题2", "问题3"]
answers = llm.batch(questions)
```

## 性能优化

### 1. 缓存机制
实现缓存以提高性能：
```python
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache, SQLiteCache

# 内存缓存
set_llm_cache(InMemoryCache())

# SQLite缓存
set_llm_cache(SQLiteCache(database_path=".langchain.db"))

# 自定义缓存
from typing import Optional, Dict, Any
from langchain_core.caches import BaseCache

class RedisCache(BaseCache):
    def __init__(self, redis_client):
        self.redis_client = redis_client
    
    def lookup(self, prompt: str, llm_string: str) -> Optional[str]:
        key = f"{prompt}:{llm_string}"
        return self.redis_client.get(key)
    
    def update(self, prompt: str, llm_string: str, return_val: Any) -> None:
        key = f"{prompt}:{llm_string}"
        self.redis_client.set(key, str(return_val))
```

### 2. 异步处理
使用异步处理提高并发性能：
```python
import asyncio
from langchain_openai import ChatOpenAI

async def async_rag(query: str) -> str:
    """异步RAG"""
    # 异步检索
    retriever = vectorstore.as_retriever()
    docs = await retriever.ainvoke(query)
    
    # 异步生成
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    response = await llm.ainvoke(f"基于以下文档回答问题: {docs}")
    
    return response.content

# 批量异步处理
async def batch_async_rag(queries: List[str]) -> List[str]:
    """批量异步RAG"""
    tasks = [async_rag(query) for query in queries]
    return await asyncio.gather(*tasks)
```

### 3. 批量处理
批量处理多个查询：
```python
def batch_rag(queries: List[str]) -> List[str]:
    """批量RAG"""
    results = []
    for query in queries:
        result = rag_chain.invoke(query)
        results.append(result)
    return results

# 使用批量处理
queries = ["问题1", "问题2", "问题3"]
answers = batch_rag(queries)
```

## 监控和评估

### 1. 性能监控
监控RAG系统性能：
```python
import time
from dataclasses import dataclass
from typing import List

@dataclass
class RAGMetrics:
    retrieval_time: float
    generation_time: float
    total_time: float
    num_documents: int
    relevance_score: float

def monitor_rag(query: str) -> RAGMetrics:
    """监控RAG性能"""
    start_time = time.time()
    
    # 检索
    retrieval_start = time.time()
    docs = retriever.invoke(query)
    retrieval_time = time.time() - retrieval_start
    
    # 生成
    generation_start = time.time()
    answer = rag_chain.invoke(query)
    generation_time = time.time() - generation_start
    
    total_time = time.time() - start_time
    
    return RAGMetrics(
        retrieval_time=retrieval_time,
        generation_time=generation_time,
        total_time=total_time,
        num_documents=len(docs),
        relevance_score=0.8  # 这里需要实际计算
    )
```

### 2. 质量评估
评估RAG系统质量：
```python
from typing import Dict, List
import numpy as np

def evaluate_rag(questions: List[str], expected_answers: List[str]) -> Dict:
    """评估RAG系统"""
    predictions = []
    for question in questions:
        answer = rag_chain.invoke(question)
        predictions.append(answer)
    
    # 计算评估指标
    # 这里可以使用BLEU、ROUGE等指标
    accuracy = sum(1 for p, e in zip(predictions, expected_answers) if p == e) / len(questions)
    
    return {
        "accuracy": accuracy,
        "num_questions": len(questions)
    }
```

## 常见问题

### 1. 文档处理问题
- **格式不支持**：使用合适的文档加载器
- **文本质量差**：添加文档清洗步骤
- **分块不合理**：调整分块策略
- **编码问题**：指定正确的编码格式

### 2. 向量存储问题
- **存储空间不足**：使用向量量化
- **索引速度慢**：优化索引结构
- **查询性能差**：使用合适的索引参数
- **数据一致性**：实现增量更新

### 3. 检索质量问题
- **召回率低**：使用混合检索
- **精度低**：使用重排序
- **噪声多**：优化文档清洗
- **相关性差**：优化嵌入模型

### 4. 生成质量问题
- **幻觉问题**：加强上下文约束
- **回答不完整**：优化提示模板
- **格式错误**：指定输出格式
- **语言问题**：明确指定语言

## 下一步学习

- [高级模式](/agent/rag/advanced-patterns) - RAG高级应用模式
- [向量数据库](/agent/rag/vector-databases/) - 向量数据库详解
- [Agent框架](/agent/agent-frameworks/) - 了解各种Agent框架