# RAG实现与优化

## 概述

本章将深入介绍RAG（Retrieval-Augmented Generation）的实现细节和优化技巧，包括文档处理、向量存储、检索策略、生成优化等方面。

## 文档处理

### 1. 文档加载
支持多种文档格式的加载：
```python
# 导入文档加载器
from langchain_community.document_loaders import (
    PyPDFLoader,           # PDF文件加载器
    TextLoader,            # 文本文件加载器
    UnstructuredMarkdownLoader,  # Markdown文件加载器
    UnstructuredHTMLLoader,      # HTML文件加载器
    CSVLoader,             # CSV文件加载器
    JSONLoader,            # JSON文件加载器
    DirectoryLoader,       # 目录加载器
    WebBaseLoader          # 网页加载器
)

# 加载PDF文档
# PyPDFLoader：加载PDF文件
# load()方法：加载文档并返回Document对象列表
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 加载目录中的所有文档
# DirectoryLoader：加载目录中的文件
# 参数：
#   path：目录路径
#   glob：文件匹配模式
#   loader_cls：加载器类
loader = DirectoryLoader(
    "./documents",
    glob="**/*.pdf",  # 匹配所有PDF文件
    loader_cls=PyPDFLoader
)
documents = loader.load()
```

### 2. 文本分割
文本分割是RAG的关键步骤：
```python
# 导入文本分割器
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,  # 递归字符分割器：最常用
    CharacterTextSplitter,  # 字符分割器：按指定字符分割
    TokenTextSplitter,  # Token分割器：按token分割
    MarkdownHeaderTextSplitter  # Markdown标题分割器：按标题分割
)

# 递归字符分割器
# RecursiveCharacterTextSplitter：按照递归规则分割文本
# 参数说明：
#   chunk_size：每个块的最大字符数
#   chunk_overlap：相邻块的重叠字符数
#   length_function：计算长度的函数
#   separators：分隔符列表，按优先级排序
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,        # 块大小：1000个字符
    chunk_overlap=200,      # 重叠大小：200个字符
    length_function=len,    # 长度计算函数：使用len()
    separators=["\n\n", "\n", " ", ""]  # 分隔符优先级
)
chunks = text_splitter.split_documents(documents)

# 字符分割器
# CharacterTextSplitter：按指定字符分割
text_splitter = CharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separator="\n"  # 按换行符分割
)
chunks = text_splitter.split_documents(documents)

# Token分割器
# TokenTextSplitter：按token分割
# 适用于需要精确控制token数量的场景
text_splitter = TokenTextSplitter(
    chunk_size=100,  # 每个块100个token
    chunk_overlap=20  # 重叠20个token
)
chunks = text_splitter.split_documents(documents)
```

### 3. 文档清洗
清洗文档以提高质量：
```python
# 导入正则表达式和类型提示
import re
from typing import List

def clean_text(text: str) -> str:
    """
    清洗文本
    
    参数：
        text (str): 原始文本
    
    返回值：
        str: 清洗后的文本
    
    功能：
    1. 移除多余空白
    2. 移除特殊字符
    3. 规范化空格
    """
    # 移除多余空白：将多个空白字符替换为单个空格
    text = re.sub(r'\s+', ' ', text)
    # 移除特殊字符：只保留字母、数字、标点和基本符号
    text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)]', '', text)
    # 规范化空格：去除首尾空格
    text = text.strip()
    return text

def clean_documents(documents: List) -> List:
    """
    清洗文档
    
    参数：
        documents (List): 原始文档列表
    
    返回值：
        List: 清洗后的文档列表
    """
    cleaned_docs = []
    for doc in documents:
        # 清洗文档内容
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
# 导入嵌入模型
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings

# OpenAI嵌入模型
# OpenAIEmbeddings：OpenAI的嵌入模型
# 参数：
#   model：模型名称
#   openai_api_key：API密钥
embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002",  # 使用Ada 002模型
    openai_api_key="your-api-key"
)

# Hugging Face嵌入模型
# HuggingFaceEmbeddings：Hugging Face的嵌入模型
# 参数：
#   model_name：模型名称或路径
#   model_kwargs：模型参数
#   encode_kwargs：编码参数
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",  # 英文模型
    model_kwargs={'device': 'cpu'},  # 使用CPU
    encode_kwargs={'normalize_embeddings': True}  # 归一化嵌入
)

# 中文嵌入模型
# 适用于中文文本的嵌入模型
embeddings = HuggingFaceEmbeddings(
    model_name="shibing624/text2vec-base-chinese",  # 中文模型
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)
```

### 2. 向量存储配置
配置向量存储：
```python
# 导入向量存储
from langchain_community.vectorstores import Chroma, FAISS

# Chroma配置
# Chroma.from_documents()：从文档创建Chroma向量存储
# 参数：
#   documents：文档列表
#   embedding：嵌入模型
#   persist_directory：持久化目录
#   collection_metadata：集合元数据
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",  # 持久化目录
    collection_metadata={"hnsw:space": "cosine"}  # 使用余弦相似度
)

# FAISS配置
# FAISS.from_documents()：从文档创建FAISS向量存储
vectorstore = FAISS.from_documents(
    documents=chunks,
    embedding=embeddings
)

# 保存和加载
# save_local()：保存FAISS索引到本地
vectorstore.save_local("faiss_index")

# load_local()：从本地加载FAISS索引
loaded_vectorstore = FAISS.load_local("faiss_index", embeddings)
```

### 3. 索引优化
优化向量索引：
```python
# 导入FAISS和NumPy
import faiss
import numpy as np

# 创建HNSW索引
# HNSW（Hierarchical Navigable Small World）：高效的近似最近邻搜索算法
# 参数：
#   dimension：向量维度
#   M：每个节点的连接数
dimension = 1536  # 向量维度（OpenAI嵌入模型的维度）
index = faiss.IndexHNSWFlat(dimension, 32)  # 32是连接数

# 添加向量
# 随机生成1000个向量用于测试
vectors = np.random.random((1000, dimension)).astype('float32')
index.add(vectors)

# 搜索
# search()：搜索最相似的向量
# 参数：
#   query：查询向量
#   k：返回的相似向量数量
# 返回值：
#   distances：距离数组
#   indices：索引数组
query = np.random.random((1, dimension)).astype('float32')
distances, indices = index.search(query, k=5)
```

## 检索策略

### 1. 相似性检索
基础的相似性检索：
```python
# 相似性搜索
# similarity_search()：搜索与查询最相似的文档
# 参数：
#   query：查询文本
#   k：返回的文档数量
# 返回值：Document对象列表
results = vectorstore.similarity_search(
    query="查询内容",
    k=5
)

# 带分数的相似性搜索
# similarity_search_with_score()：搜索并返回相似度分数
# 返回值：(Document, score)元组列表
results = vectorstore.similarity_search_with_score(
    query="查询内容",
    k=5
)

# MMR检索（最大边际相关性）
# max_marginal_relevance_search()：在相似性和多样性之间取得平衡
# 参数：
#   query：查询文本
#   k：返回的文档数量
#   fetch_k：初始获取的文档数量
results = vectorstore.max_marginal_relevance_search(
    query="查询内容",
    k=5,
    fetch_k=20
)
```

### 2. 混合检索
结合多种检索方式：
```python
# 导入检索器
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# BM25检索器
# BM25Retriever：基于BM25算法的检索器
# BM25：基于词频的检索算法，适合关键词匹配
bm25_retriever = BM25Retriever.from_documents(documents)
bm25_retriever.k = 5  # 返回前5个结果

# 向量检索器
# as_retriever()：将向量存储转换为检索器
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# 集成检索器
# EnsembleRetriever：组合多个检索器
# 参数：
#   retrievers：检索器列表
#   weights：权重列表，控制每个检索器的重要性
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.4, 0.6]  # BM25权重0.4，向量检索权重0.6
)

# 使用集成检索器
results = ensemble_retriever.invoke("查询内容")
```

### 3. 重排序
对检索结果进行重排序：
```python
# 导入重排序相关模块
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

# 交叉编码器
# HuggingFaceCrossEncoder：使用交叉编码器进行重排序
# 交叉编码器：同时编码查询和文档，计算相关性分数
cross_encoder = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")

# 重排序器
# CrossEncoderReranker：使用交叉编码器进行重排序
# 参数：
#   model：交叉编码器模型
#   top_n：返回的文档数量
reranker = CrossEncoderReranker(model=cross_encoder, top_n=3)

# 压缩检索器
# ContextualCompressionRetriever：使用压缩器压缩检索结果
# 参数：
#   base_compressor：压缩器（重排序器）
#   base_retriever：基础检索器
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
# 导入多查询检索器
from langchain.retrievers import MultiQueryRetriever

# 多查询检索器
# MultiQueryRetriever：使用LLM生成多个查询
# 优点：通过多个查询提高召回率
# 参数：
#   retriever：基础检索器
#   llm：语言模型，用于生成查询
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
# 导入提示模板
from langchain.prompts import ChatPromptTemplate

# 基础RAG提示
# 设计原则：
# 1. 明确指定基于上下文回答
# 2. 处理上下文中没有信息的情况
# 3. 清晰的格式
template = """基于以下上下文回答问题。如果上下文中没有相关信息，请说"我不知道"。

上下文：
{context}

问题：
{question}

回答："""

prompt = ChatPromptTemplate.from_template(template)

# 带引用的RAG提示
# 设计原则：
# 1. 要求引用来源
# 2. 提供详细回答
# 3. 使用编号引用
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
from typing import List

def truncate_context(context: str, max_tokens: int = 4000) -> str:
    """
    截断上下文
    
    参数：
        context (str): 原始上下文
        max_tokens (int): 最大token数
    
    返回值：
        str: 截断后的上下文
    
    功能：限制上下文长度，避免超出模型限制
    """
    # 简单的截断方法
    if len(context) > max_tokens:
        context = context[:max_tokens] + "..."
    return context

def select_relevant_context(query: str, contexts: List[str], top_k: int = 3) -> str:
    """
    选择相关的上下文
    
    参数：
        query (str): 查询文本
        contexts (List[str]): 上下文列表
        top_k (int): 选择的上下文数量
    
    返回值：
        str: 选择的上下文
    
    功能：从多个上下文中选择最相关的
    """
    # 这里可以使用更复杂的逻辑
    # 例如：使用相似度计算、关键词匹配等
    return "\n\n".join(contexts[:top_k])
```

### 3. 生成策略
优化生成策略：
```python
# 导入OpenAI模型和输出解析器
from langchain_openai import ChatOpenAI
from langchain.schema.output_parser import StrOutputParser

# 使用不同的模型
# ChatOpenAI：OpenAI聊天模型
# 参数：
#   model：模型名称
#   temperature：控制输出随机性
#   max_tokens：最大输出token数
llm = ChatOpenAI(
    model="gpt-4",  # 使用GPT-4模型
    temperature=0.7,
    max_tokens=1000
)

# 流式生成
# stream()：流式生成内容
# 适用于需要实时显示的场景
for chunk in llm.stream("请回答以下问题"):
    print(chunk.content, end="")

# 批量生成
# batch()：批量生成
# 适用于需要处理多个问题的场景
questions = ["问题1", "问题2", "问题3"]
answers = llm.batch(questions)
```

## 性能优化

### 1. 缓存机制
实现缓存以提高性能：
```python
# 导入缓存相关模块
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache, SQLiteCache

# 内存缓存
# InMemoryCache()：内存缓存
# 适用于开发和测试环境
set_llm_cache(InMemoryCache())

# SQLite缓存
# SQLiteCache()：SQLite缓存
# 参数：
#   database_path：数据库文件路径
set_llm_cache(SQLiteCache(database_path=".langchain.db"))

# 自定义缓存
from typing import Optional, Dict, Any
from langchain_core.caches import BaseCache

class RedisCache(BaseCache):
    """
    Redis缓存
    
    功能：使用Redis作为缓存后端
    """
    def __init__(self, redis_client):
        """
        初始化Redis缓存
        
        参数：
            redis_client：Redis客户端实例
        """
        self.redis_client = redis_client
    
    def lookup(self, prompt: str, llm_string: str) -> Optional[str]:
        """
        查找缓存
        
        参数：
            prompt (str): 提示文本
            llm_string (str): LLM字符串
        
        返回值：
            Optional[str]: 缓存的结果，如果不存在返回None
        """
        key = f"{prompt}:{llm_string}"
        return self.redis_client.get(key)
    
    def update(self, prompt: str, llm_string: str, return_val: Any) -> None:
        """
        更新缓存
        
        参数：
            prompt (str): 提示文本
            llm_string (str): LLM字符串
            return_val (Any): 要缓存的结果
        """
        key = f"{prompt}:{llm_string}"
        self.redis_client.set(key, str(return_val))
```

### 2. 异步处理
使用异步处理提高并发性能：
```python
# 导入异步相关模块
import asyncio
from langchain_openai import ChatOpenAI

async def async_rag(query: str) -> str:
    """
    异步RAG
    
    参数：
        query (str): 查询文本
    
    返回值：
        str: 回答
    
    功能：异步执行RAG流程
    """
    # 异步检索
    retriever = vectorstore.as_retriever()
    docs = await retriever.ainvoke(query)
    
    # 异步生成
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    response = await llm.ainvoke(f"基于以下文档回答问题: {docs}")
    
    return response.content

async def batch_async_rag(queries: List[str]) -> List[str]:
    """
    批量异步RAG
    
    参数：
        queries (List[str]): 查询列表
    
    返回值：
        List[str]: 回答列表
    
    功能：批量异步执行RAG流程
    """
    # 创建异步任务列表
    tasks = [async_rag(query) for query in queries]
    # 并发执行所有任务
    return await asyncio.gather(*tasks)
```

### 3. 批量处理
批量处理多个查询：
```python
from typing import List

def batch_rag(queries: List[str]) -> List[str]:
    """
    批量RAG
    
    参数：
        queries (List[str]): 查询列表
    
    返回值：
        List[str]: 回答列表
    
    功能：批量执行RAG流程
    """
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
# 导入时间模块和数据类
import time
from dataclasses import dataclass
from typing import List

@dataclass
class RAGMetrics:
    """
    RAG性能指标
    
    属性：
        retrieval_time (float): 检索时间
        generation_time (float): 生成时间
        total_time (float): 总时间
        num_documents (int): 文档数量
        relevance_score (float): 相关性分数
    """
    retrieval_time: float
    generation_time: float
    total_time: float
    num_documents: int
    relevance_score: float

def monitor_rag(query: str) -> RAGMetrics:
    """
    监控RAG性能
    
    参数：
        query (str): 查询文本
    
    返回值：
        RAGMetrics: 性能指标
    """
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
# 导入类型提示和NumPy
from typing import Dict, List
import numpy as np

def evaluate_rag(questions: List[str], expected_answers: List[str]) -> Dict:
    """
    评估RAG系统
    
    参数：
        questions (List[str]): 问题列表
        expected_answers (List[str]): 期望答案列表
    
    返回值：
        Dict: 评估结果
    
    功能：评估RAG系统的准确性
    """
    predictions = []
    for question in questions:
        answer = rag_chain.invoke(question)
        predictions.append(answer)
    
    # 计算评估指标
    # 这里可以使用BLEU、ROUGE等指标
    accuracy = sum(1 for p, e in zip(predictions, expected_answers) if p == e) / len(questions)
    
    return {
        "accuracy": accuracy,  # 准确率
        "num_questions": len(questions)  # 问题数量
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