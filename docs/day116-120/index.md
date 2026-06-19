# RAG技术

## 概述

RAG（Retrieval-Augmented Generation，检索增强生成）是一种结合外部知识库的生成技术，通过检索相关信息来增强大语言模型的生成能力。RAG技术能够解决LLM知识截止、幻觉问题等局限性，是构建知识密集型应用的关键技术。

## 核心概念

### 1. 检索增强生成
RAG的核心思想：
- **检索**：从外部知识库中检索相关信息
- **增强**：将检索到的信息作为上下文提供给LLM
- **生成**：LLM基于上下文生成准确、相关的回答

### 2. 文档处理
RAG的文档处理流程：
- **文档加载**：加载各种格式的文档（PDF、Word、网页等）
- **文本分割**：将文档分割成适当大小的块
- **向量化**：将文本转换为向量表示
- **索引存储**：将向量存储到向量数据库

### 3. 向量表示
向量表示的关键技术：
- **嵌入模型**：将文本转换为向量的模型
- **向量维度**：向量的维度大小
- **相似度计算**：计算向量间的相似度
- **索引结构**：高效的向量索引结构

### 4. 检索策略
常见的检索策略：
- **相似性搜索**：基于向量相似度的搜索
- **混合检索**：结合关键词和语义检索
- **重排序**：对检索结果进行重排序
- **过滤**：基于元数据过滤结果

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

### 3. 向量数据库
向量数据库的核心技术：
- **索引结构**：HNSW、IVF等索引结构
- **存储优化**：高效的向量存储
- **查询优化**：快速的相似性搜索
- **扩展性**：支持大规模数据

### 4. 检索算法
常见的检索算法：
- **精确搜索**：暴力搜索，准确但慢
- **近似搜索**：近似最近邻搜索，速度快
- **混合搜索**：结合多种搜索策略
- **重排序**：对结果进行二次排序

## 架构设计

### 1. 基础架构
```
用户查询 → 查询处理 → 向量检索 → 结果重排 → LLM生成 → 回答
                ↓
        文档处理 → 向量化 → 向量存储
```

### 2. 组件交互
```
文档加载 → 文本分割 → 嵌入生成 → 向量存储
                                    ↓
用户查询 → 查询嵌入 → 相似性搜索 → 上下文构建 → LLM生成
```

### 3. 扩展架构
```
查询理解 → 查询扩展 → 多路检索 → 结果融合 → 重排序 → LLM生成
    ↓
元数据过滤 → 向量检索 → 结果过滤
```

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
    llm=ChatOpenAI(model="gpt-3.5-turbo")
)

# 上下文压缩检索器
from langchain.retrievers.document_compressors import LLMChainExtractor
compressor = LLMChainExtractor.from_llm(ChatOpenAI(model="gpt-3.5-turbo"))
retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever()
)
```

### 5. RAG链构建
```python
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough

# 创建RAG链
def create_rag_chain(retriever):
    # 提示模板
    template = """基于以下上下文回答问题。如果上下文中没有相关信息，请说"我不知道"。

    上下文：
    {context}

    问题：
    {question}

    回答："""
    
    prompt = ChatPromptTemplate.from_template(template)
    
    # LLM
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    
    # 构建链
    rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return rag_chain

# 使用示例
retriever = vectorstore.as_retriever()
rag_chain = create_rag_chain(retriever)
answer = rag_chain.invoke("什么是机器学习？")
print(answer)
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
llm = ChatOpenAI(model="gpt-3.5-turbo")

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

- [核心概念详解](/agent/rag/core-concepts) - 深入理解RAG核心概念
- [实现与优化](/agent/rag/implementation) - RAG实现细节和优化技巧
- [高级模式](/agent/rag/advanced-patterns) - RAG高级应用模式
- [向量数据库](/agent/rag/vector-databases/) - 向量数据库详解