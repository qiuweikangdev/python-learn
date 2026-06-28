# RAG核心概念详解

## 概述

RAG（Retrieval-Augmented Generation，检索增强生成）是一种结合外部知识库的生成技术。本章将深入介绍RAG的核心概念，包括检索、生成、向量化、索引等。

## 核心概念

### 1. 检索（Retrieval）
检索是RAG的第一步，从外部知识库中检索相关信息：
- **稀疏检索**：基于关键词的检索（如BM25）
- **稠密检索**：基于向量的检索（如DPR）
- **混合检索**：结合稀疏和稠密检索
- **重排序**：对检索结果进行重排序

### 2. 生成（Generation）
生成是RAG的第二步，基于检索到的信息生成回答：
- **上下文构建**：将检索到的信息构建成上下文
- **提示工程**：设计有效的提示模板
- **模型推理**：使用LLM生成回答
- **后处理**：对生成结果进行后处理

### 3. 向量化（Vectorization）
向量化是将文本转换为向量表示的过程：
- **嵌入模型**：将文本转换为向量的模型
- **向量维度**：向量的维度大小
- **相似度计算**：计算向量间的相似度
- **索引结构**：高效的向量索引结构

### 4. 索引（Indexing）
索引是组织和存储向量的方式：
- **向量索引**：高效的向量索引结构
- **元数据索引**：基于元数据的索引
- **混合索引**：结合多种索引方式
- **增量索引**：支持增量更新的索引

## 技术原理

### 1. 向量空间模型
向量空间模型的基本原理：
- **向量表示**：将文本表示为高维向量
- **语义相似**：语义相似的文本在向量空间中距离较近
- **余弦相似度**：常用相似度计算方法
- **近似最近邻**：高效的近似搜索算法

### 2. 嵌入模型
常用的嵌入模型：
- **OpenAI Embeddings**：OpenAI的嵌入模型
- **Sentence Transformers**：开源的句子嵌入模型
- **BGE嵌入模型**：中文优化的嵌入模型
- **M3E嵌入模型**：多语言嵌入模型

### 3. 检索算法
常见的检索算法：
- **精确搜索**：暴力搜索，准确但慢
- **近似搜索**：近似最近邻搜索，速度快
- **混合搜索**：结合多种搜索策略
- **重排序**：对结果进行二次排序

### 4. 生成策略
常见的生成策略：
- **直接生成**：直接基于上下文生成
- **引用生成**：在生成中引用来源
- **多步生成**：分多步生成回答
- **交互式生成**：与用户交互生成

## 核心API

### 1. 文档处理
```python
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 加载文档
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 文本分割
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len
)
chunks = text_splitter.split_documents(documents)
```

### 2. 嵌入生成
```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings

# OpenAI嵌入
embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002",
    openai_api_key="your-api-key"
)

# Hugging Face嵌入
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 生成嵌入向量
text = "这是一段测试文本"
vector = embeddings.embed_query(text)
```

### 3. 向量存储
```python
from langchain_community.vectorstores import (
    Chroma,
    FAISS,
    Pinecone,
    Weaviate,
    Milvus
)

# Chroma向量存储
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# FAISS向量存储
vectorstore = FAISS.from_documents(
    documents=chunks,
    embedding=embeddings
)

# 相似性搜索
results = vectorstore.similarity_search(
    query="查询内容",
    k=5
)
```

### 4. 检索器
```python
from langchain.retrievers import (
    VectorStoreRetriever,
    MultiQueryRetriever,
    ContextualCompressionRetriever
)

# 基础检索器
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5}
)

# 多查询检索器
retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(),
    llm=ChatOpenAI(model="gpt-4o-mini")
)

# 上下文压缩检索器
from langchain.retrievers.document_compressors import LLMChainExtractor
compressor = LLMChainExtractor.from_llm(ChatOpenAI(model="gpt-4o-mini"))
retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever()
)
```

## 实践指南

### 1. 环境准备
```bash
# 安装必要的库
pip install langchain langchain-openai langchain-community
pip install chromadb faiss-cpu sentence-transformers

# 设置环境变量
export OPENAI_API_KEY="your-openai-key"
```

### 2. 基础RAG示例
```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough

# 1. 加载文档
loader = TextLoader("document.txt", encoding="utf-8")
documents = loader.load()

# 2. 文本分割
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
chunks = text_splitter.split_documents(documents)

# 3. 创建向量存储
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# 4. 创建检索器
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 5. 创建RAG链
template = """基于以下上下文回答问题：

上下文：
{context}

问题：
{question}

回答："""

prompt = ChatPromptTemplate.from_template(template)
llm = ChatOpenAI(model="gpt-4o-mini")

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 6. 使用RAG
answer = rag_chain.invoke("文档的主要内容是什么？")
print(answer)
```

### 3. 多文档RAG示例
```python
from langchain_community.document_loaders import (
    DirectoryLoader,
    PyPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader
)

# 加载目录中的所有文档
loader = DirectoryLoader(
    "./documents",
    glob="**/*.pdf",
    loader_cls=PyPDFLoader
)
documents = loader.load()

# 添加更多文档类型
text_loader = DirectoryLoader(
    "./documents",
    glob="**/*.txt",
    loader_cls=TextLoader
)
documents.extend(text_loader.load())

# 后续处理同上
```

## RAG完整流程详解：Chunk → Embed → Retrieve → Answer

### 流程概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RAG 完整流程                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  离线阶段（索引构建）：                                                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐                  │
│  │  文档   │ →  │  Chunk  │ →  │  Embed  │ →  │  存储   │                  │
│  │ (原始)  │    │ (分块)  │    │ (嵌入)  │    │ (向量库) │                  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘                  │
│                                                                             │
│  在线阶段（查询应答）：                                                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  查询   │ →  │  Embed  │ →  │ Retrieve│ →  │  构建   │ →  │ Answer  │  │
│  │ (用户)  │    │ (嵌入)  │    │ (检索)  │    │ (上下文) │    │ (回答)  │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Chunk（分块）

**为什么需要分块？**

```
问题：文档太长，无法直接放入上下文窗口

示例：
- 一本书：10万字
- 上下文窗口：4K-128K tokens
- 直接放入：超出限制

解决方案：将文档分割成小块
- 每个块：500-1000字
- 检索时只返回相关块
- 大大减少token消耗
```

**分块策略对比**：

| 策略 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| **固定长度** | 按字符数分割 | 简单 | 可能切断语义 | 通用文本 |
| **按段落** | 按段落分割 | 保持语义 | 块大小不一致 | 结构化文档 |
| **递归分割** | 先大后小 | 平衡 | 复杂度高 | 长文档 |
| **语义分割** | 按语义边界 | 最准确 | 实现复杂 | 高质量需求 |

**代码示例**：

```python
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
    TokenTextSplitter
)

def demonstrate_chunking_strategies():
    """
    演示不同的分块策略
    
    比较各种分块策略的优缺点
    """
    
    # 示例文本
    text = """
    人工智能（AI）是计算机科学的一个分支，致力于创建能够模拟人类智能的系统。
    机器学习是AI的一个子领域，它使计算机能够从数据中学习，而无需显式编程。
    深度学习是机器学习的一个子集，使用神经网络来模拟人脑的工作方式。
    
    自然语言处理（NLP）是AI的另一个重要分支，专注于计算机与人类语言之间的交互。
    计算机视觉则致力于让计算机能够理解和解释视觉信息。
    """
    
    # 1. 固定长度分块
    print("=== 固定长度分块 ===")
    fixed_splitter = CharacterTextSplitter(
        chunk_size=100,  # 每块100字符
        chunk_overlap=20,  # 重叠20字符
        separator="\n"  # 优先在换行符处分割
    )
    fixed_chunks = fixed_splitter.split_text(text)
    for i, chunk in enumerate(fixed_chunks):
        print(f"块{i+1}: {chunk[:50]}...")
    
    # 2. 递归分块（推荐）
    print("\n=== 递归分块 ===")
    recursive_splitter = RecursiveCharacterTextSplitter(
        chunk_size=100,
        chunk_overlap=20,
        separators=["\n\n", "\n", "。", "，", " "]  # 分割符优先级
    )
    recursive_chunks = recursive_splitter.split_text(text)
    for i, chunk in enumerate(recursive_chunks):
        print(f"块{i+1}: {chunk[:50]}...")
    
    # 3. Token分块
    print("\n=== Token分块 ===")
    token_splitter = TokenTextSplitter(
        chunk_size=50,  # 每块50 tokens
        chunk_overlap=10
    )
    token_chunks = token_splitter.split_text(text)
    for i, chunk in enumerate(token_chunks):
        print(f"块{i+1}: {chunk[:50]}...")

# 运行示例
# demonstrate_chunking_strategies()
```

**分块大小选择指南**：

```
分块大小选择：

太小（<100字）：
- 优点：检索精确
- 缺点：丢失上下文，增加检索次数

太大（>2000字）：
- 优点：上下文完整
- 缺点：检索不精确，token消耗大

推荐：
- 通用场景：500-1000字
- 技术文档：300-500字
- 长文档：1000-1500字

重叠设置：
- 推荐：10-20%的块大小
- 示例：块大小1000，重叠100-200
```

### 2. Embed（嵌入）

**什么是嵌入？**

```
嵌入是将文本转换为数值向量的过程

文本："人工智能是未来"
     ↓ 嵌入模型
向量：[0.12, -0.34, 0.56, 0.78, ...] （1536维）

为什么嵌入能表示语义？
- 训练过程中，模型学习到语义相似的文本向量距离近
- "猫"和"狗"的向量距离近（都是宠物）
- "猫"和"汽车"的向量距离远（语义不同）
```

**嵌入模型对比**：

| 模型 | 维度 | 中文支持 | 价格 | 适用场景 |
|------|------|----------|------|----------|
| **OpenAI text-embedding-ada-002** | 1536 | 优秀 | 中等 | 通用场景 |
| **OpenAI text-embedding-3-small** | 1536 | 优秀 | 低 | 成本敏感 |
| **BGE-large-zh** | 1024 | 优秀 | 免费 | 中文场景 |
| **M3E-base** | 768 | 优秀 | 免费 | 多语言 |

**代码示例**：

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
import numpy as np

def demonstrate_embeddings():
    """
    演示嵌入模型的使用
    
    比较不同嵌入模型的特点
    """
    
    # 1. OpenAI嵌入
    print("=== OpenAI嵌入 ===")
    openai_embeddings = OpenAIEmbeddings(
        model="text-embedding-ada-002"
    )
    
    texts = ["人工智能", "机器学习", "今天天气"]
    vectors = openai_embeddings.embed_documents(texts)
    
    print(f"向量维度：{len(vectors[0])}")
    
    # 计算相似度
    def cosine_similarity(v1, v2):
        """计算余弦相似度"""
        dot_product = np.dot(v1, v2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        return dot_product / (norm1 * norm2)
    
    sim_ai_ml = cosine_similarity(vectors[0], vectors[1])
    sim_ai_weather = cosine_similarity(vectors[0], vectors[2])
    
    print(f"人工智能 vs 机器学习：{sim_ai_ml:.4f}")
    print(f"人工智能 vs 今天天气：{sim_ai_weather:.4f}")
    
    # 2. Hugging Face嵌入（本地模型）
    print("\n=== Hugging Face嵌入 ===")
    hf_embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    vectors = hf_embeddings.embed_documents(texts)
    print(f"向量维度：{len(vectors[0])}")

# 运行示例
# demonstrate_embeddings()
```

### 3. Retrieve（检索）

**检索策略对比**：

| 策略 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **相似性搜索** | 向量余弦相似度 | 语义理解好 | 可能漏掉关键词 |
| **关键词搜索** | BM25等算法 | 精确匹配 | 无法理解语义 |
| **混合搜索** | 结合两者 | 兼顾 | 复杂度高 |
| **重排序** | 二次排序 | 提高精度 | 增加延迟 |

**代码示例**：

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.retrievers import (
    VectorStoreRetriever,
    BM25Retriever,
    EnsembleRetriever
)
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain.retrievers import ContextualCompressionRetriever

def demonstrate_retrieval_strategies():
    """
    演示不同的检索策略
    
    比较各种检索策略的优缺点
    """
    
    # 创建示例文档
    docs = [
        "人工智能是计算机科学的一个分支",
        "机器学习是人工智能的子领域",
        "深度学习是机器学习的一种方法",
        "自然语言处理是AI的重要应用",
        "今天天气很好"
    ]
    
    # 创建向量存储
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma.from_texts(docs, embeddings)
    
    # 1. 基础相似性搜索
    print("=== 基础相似性搜索 ===")
    results = vectorstore.similarity_search("AI技术", k=2)
    for doc in results:
        print(f"- {doc.page_content}")
    
    # 2. 带分数的相似性搜索
    print("\n=== 带分数的相似性搜索 ===")
    results = vectorstore.similarity_search_with_score("AI技术", k=2)
    for doc, score in results:
        print(f"- {doc.page_content} (分数: {score:.4f})")
    
    # 3. 混合检索（向量 + 关键词）
    print("\n=== 混合检索 ===")
    bm25_retriever = BM25Retriever.from_texts(docs)
    bm25_retriever.k = 2
    
    vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
    
    # 创建集成检索器
    ensemble_retriever = EnsembleRetriever(
        retrievers=[bm25_retriever, vector_retriever],
        weights=[0.4, 0.6]  # BM25权重0.4，向量权重0.6
    )
    
    results = ensemble_retriever.invoke("AI技术")
    for doc in results:
        print(f"- {doc.page_content}")

# 运行示例
# demonstrate_retrieval_strategies()
```

### 4. Answer with Citations（带引用的回答）

**为什么需要引用？**

```
问题：模型可能编造信息（幻觉）

示例：
用户：人工智能的发展历史是什么？
模型（无引用）：人工智能在1956年诞生...（可能是编造的）

模型（有引用）：根据文档[1]，人工智能在1956年诞生...（有来源）

引用的作用：
1. 增加可信度
2. 便于验证
3. 减少幻觉
```

**代码示例**：

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough
from typing import List, Dict

def create_rag_with_citations():
    """
    创建带引用的RAG系统
    
    在回答中引用来源，增加可信度
    """
    
    # 创建示例文档（带元数据）
    docs = [
        {
            "page_content": "人工智能（AI）是计算机科学的一个分支，致力于创建能够模拟人类智能的系统。",
            "metadata": {"source": "AI基础教程", "page": 1}
        },
        {
            "page_content": "机器学习是AI的一个子领域，它使计算机能够从数据中学习。",
            "metadata": {"source": "机器学习入门", "page": 5}
        },
        {
            "page_content": "深度学习使用神经网络来模拟人脑的工作方式。",
            "metadata": {"source": "深度学习详解", "page": 10}
        }
    ]
    
    # 创建向量存储
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma.from_texts(
        texts=[d["page_content"] for d in docs],
        embedding=embeddings,
        metadatas=[d["metadata"] for d in docs]
    )
    
    # 创建检索器
    retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
    
    # 创建带引用的提示模板
    prompt = ChatPromptTemplate.from_messages([
        ("system", """你是一个有用的助手。请基于提供的上下文回答问题。

重要规则：
1. 只基于上下文中的信息回答
2. 在回答中引用来源，格式：[来源: 文档名, 页码]
3. 如果上下文中没有相关信息，请说"根据现有资料，无法回答这个问题"
4. 不要编造信息

上下文：
{context}"""),
        ("user", "{question}")
    ])
    
    # 格式化文档（包含引用信息）
    def format_docs_with_citation(docs):
        """格式化文档，包含引用信息"""
        formatted = []
        for i, doc in enumerate(docs):
            source = doc.metadata.get("source", "未知来源")
            page = doc.metadata.get("page", "未知页码")
            formatted.append(f"[文档{i+1}] {doc.page_content}\n来源: {source}, 第{page}页")
        return "\n\n".join(formatted)
    
    # 创建RAG链
    rag_chain = (
        {
            "context": retriever | format_docs_with_citation,
            "question": RunnablePassthrough()
        }
        | prompt
        | ChatOpenAI(model="gpt-4o-mini")
        | StrOutputParser()
    )
    
    return rag_chain, retriever

def demonstrate_citation_validation():
    """
    演示引用验证
    
    验证模型回答中的引用是否真实存在
    """
    
    # 创建带引用的RAG
    rag_chain, retriever = create_rag_with_citations()
    
    # 提问
    question = "什么是人工智能？"
    answer = rag_chain.invoke(question)
    
    print(f"问题：{question}")
    print(f"回答：{answer}")
    
    # 验证引用
    retrieved_docs = retriever.invoke(question)
    print(f"\n检索到的文档：")
    for doc in retrieved_docs:
        print(f"- {doc.page_content[:50]}...")

# 运行示例
# demonstrate_citation_validation()
```

### 5. RAG错误处理

**常见错误及处理**：

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

def create_robust_rag():
    """
    创建健壮的RAG系统
    
    处理各种错误情况
    """
    
    # 创建向量存储
    embeddings = OpenAIEmbeddings()
    
    try:
        # 尝试加载已存在的向量存储
        vectorstore = Chroma(
            persist_directory="./chroma_db",
            embedding_function=embeddings
        )
    except Exception as e:
        print(f"加载向量存储失败：{e}")
        print("创建新的向量存储...")
        vectorstore = Chroma.from_texts(
            ["初始化文档"],
            embedding=embeddings,
            persist_directory="./chroma_db"
        )
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # 创建带错误处理的RAG链
    prompt = ChatPromptTemplate.from_messages([
        ("system", """你是一个有用的助手。请基于提供的上下文回答问题。

重要规则：
1. 只基于上下文中的信息回答
2. 如果上下文为空或没有相关信息，请说"抱歉，我没有找到相关信息"
3. 不要编造信息
4. 如果检索失败，请说"检索过程中出现错误，请稍后重试"

上下文：
{context}"""),
        ("user", "{question}")
    ])
    
    def safe_retrieve(question: str) -> str:
        """安全的检索函数"""
        try:
            docs = retriever.invoke(question)
            if not docs:
                return "未找到相关文档"
            return "\n\n".join(doc.page_content for doc in docs)
        except Exception as e:
            return f"检索失败：{str(e)}"
    
    rag_chain = (
        {
            "context": lambda x: safe_retrieve(x),
            "question": lambda x: x
        }
        | prompt
        | ChatOpenAI(model="gpt-4o-mini")
        | StrOutputParser()
    )
    
    return rag_chain

# 使用示例
# rag = create_robust_rag()
# answer = rag.invoke("测试问题")
# print(answer)
```

## 最佳实践

### 1. 文档处理优化
- **合理的分块大小**：根据文档类型选择合适的分块大小
- **适当的重叠**：确保分块之间的连续性
- **元数据保留**：保留文档的元数据信息
- **预处理清洗**：清理文档中的噪声数据

### 2. 向量存储优化
- **选择合适的嵌入模型**：根据语言和领域选择模型
- **索引优化**：选择合适的索引结构
- **批量处理**：批量生成嵌入向量
- **持久化存储**：持久化向量存储

### 3. 检索优化
- **混合检索**：结合关键词和语义检索
- **重排序**：对检索结果进行重排序
- **过滤机制**：基于元数据过滤结果
- **查询扩展**：扩展查询以提高召回率

### 4. 生成优化
- **提示工程**：设计有效的提示模板
- **上下文控制**：控制上下文长度和质量
- **引用来源**：在回答中引用来源
- **不确定性处理**：处理模型的不确定性

## 常见问题

### 1. 检索质量问题
- **检索不准确**：优化嵌入模型和索引结构
- **召回率低**：增加检索数量或使用混合检索
- **噪声数据**：预处理文档，清理噪声
- **分块不合理**：调整分块策略

### 2. 生成质量问题
- **幻觉问题**：加强上下文约束，要求引用来源
- **回答不完整**：优化提示模板，要求完整回答
- **格式问题**：在提示中指定输出格式
- **语言问题**：明确指定回答语言

### 3. 性能问题
- **响应慢**：优化索引结构，使用缓存
- **内存占用高**：优化向量存储，使用量化
- **并发限制**：使用异步处理，优化查询
- **存储空间**：压缩向量，清理无用数据

## 下一步学习

- [实现与优化](/agent/rag/implementation) - RAG实现细节和优化技巧
- [高级模式](/agent/rag/advanced-patterns) - RAG高级应用模式
- [向量数据库](/agent/rag/vector-databases/) - 向量数据库详解