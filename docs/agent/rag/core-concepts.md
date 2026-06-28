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
# 导入LangChain的文档加载器
# langchain_community.document_loaders：社区贡献的文档加载器
# PyPDFLoader：加载PDF文档
# TextLoader：加载纯文本文件
# UnstructuredMarkdownLoader：加载Markdown文件
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader
)

# 导入文本分割器
# langchain.text_splitter.RecursiveCharacterTextSplitter：递归字符文本分割器
# 按照递归的规则分割文本，保持语义完整性
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 加载文档
# PyPDFLoader：加载PDF文件
# load()方法：加载文档并返回Document对象列表
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 文本分割
# RecursiveCharacterTextSplitter：递归字符文本分割器
# 参数：
#   chunk_size：每个文本块的最大字符数
#   chunk_overlap：相邻文本块之间的重叠字符数
#   length_function：计算长度的函数
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # 每个块最多1000个字符
    chunk_overlap=200,  # 相邻块重叠200个字符
    length_function=len  # 使用len()函数计算长度
)

# 分割文档
# split_documents()方法：将文档分割成多个文本块
# 返回值：Document对象列表
chunks = text_splitter.split_documents(documents)
```

### 2. 嵌入生成
```python
# 导入嵌入模型
# langchain_openai.OpenAIEmbeddings：OpenAI的嵌入模型
# 用于将文本转换为向量表示
from langchain_openai import OpenAIEmbeddings

# 导入Hugging Face嵌入模型
# langchain_community.embeddings.HuggingFaceEmbeddings：Hugging Face的嵌入模型
# 支持开源的句子嵌入模型
from langchain_community.embeddings import HuggingFaceEmbeddings

# 创建OpenAI嵌入模型实例
# OpenAIEmbeddings类：封装了OpenAI的嵌入API
# 参数：
#   model：嵌入模型名称
#   openai_api_key：OpenAI API密钥
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",  # 使用text-embedding-3-small嵌入模型（推荐）
    openai_api_key="your-api-key"  # 替换为真实的API密钥
)

# 创建Hugging Face嵌入模型实例
# HuggingFaceEmbeddings类：封装了Hugging Face的嵌入模型
# 参数：
#   model_name：模型名称或路径
# 这里使用的是all-MiniLM-L6-v2模型，适合英文文本
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 生成嵌入向量
# embed_query()方法：将单个文本转换为向量
# 参数：要嵌入的文本
# 返回值：浮点数列表，表示文本的向量
text = "这是一段测试文本"
vector = embeddings.embed_query(text)
```

### 3. 向量存储
```python
# 导入向量存储
# langchain_community.vectorstores：社区贡献的向量存储
# Chroma：ChromaDB向量数据库
# FAISS：Facebook的向量相似性搜索库
# Pinecone：Pinecone向量数据库
# Weaviate：Weaviate向量数据库
# Milvus：Milvus向量数据库
from langchain_community.vectorstores import (
    Chroma,
    FAISS,
    Pinecone,
    Weaviate,
    Milvus
)

# 创建Chroma向量存储
# Chroma.from_documents()：从文档创建向量存储
# 参数：
#   documents：文档列表（Document对象）
#   embedding：嵌入模型实例
#   persist_directory：持久化目录（可选）
# 返回值：Chroma向量存储实例
vectorstore = Chroma.from_documents(
    documents=chunks,  # 文档块列表
    embedding=embeddings,  # 嵌入模型
    persist_directory="./chroma_db"  # 持久化目录
)

# 创建FAISS向量存储
# FAISS.from_documents()：从文档创建FAISS向量存储
# FAISS是内存中的向量存储，适合小规模数据
vectorstore = FAISS.from_documents(
    documents=chunks,  # 文档块列表
    embedding=embeddings  # 嵌入模型
)

# 相似性搜索
# similarity_search()方法：搜索与查询最相似的文档
# 参数：
#   query：查询文本
#   k：返回的文档数量
# 返回值：Document对象列表
results = vectorstore.similarity_search(
    query="查询内容",  # 查询文本
    k=5  # 返回前5个最相似的文档
)
```

### 4. 检索器
```python
# 导入检索器
# langchain.retrievers：检索器模块
# VectorStoreRetriever：向量存储检索器
# MultiQueryRetriever：多查询检索器
# ContextualCompressionRetriever：上下文压缩检索器
from langchain.retrievers import (
    VectorStoreRetriever,
    MultiQueryRetriever,
    ContextualCompressionRetriever
)

# 创建基础检索器
# as_retriever()方法：将向量存储转换为检索器
# 参数：
#   search_type：搜索类型
#       "similarity"：相似性搜索（默认）
#       "mmr"：最大边际相关性搜索
#   search_kwargs：搜索参数
#       k：返回的文档数量
retriever = vectorstore.as_retriever(
    search_type="similarity",  # 使用相似性搜索
    search_kwargs={"k": 5}  # 返回前5个最相似的文档
)

# 创建多查询检索器
# MultiQueryRetriever.from_llm()：使用LLM生成多个查询
# 优点：通过多个查询提高召回率
# 参数：
#   retriever：基础检索器
#   llm：语言模型实例
retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(),  # 基础检索器
    llm=ChatOpenAI(model="gpt-4o-mini")  # 用于生成查询的LLM
)

# 创建上下文压缩检索器
# ContextualCompressionRetriever：压缩检索结果
# 优点：减少噪声，提高相关性
from langchain.retrievers.document_compressors import LLMChainExtractor

# 创建压缩器
# LLMChainExtractor.from_llm()：使用LLM提取关键信息
compressor = LLMChainExtractor.from_llm(ChatOpenAI(model="gpt-4o-mini"))

# 创建压缩检索器
retriever = ContextualCompressionRetriever(
    base_compressor=compressor,  # 压缩器
    base_retriever=vectorstore.as_retriever()  # 基础检索器
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
# 导入必要的组件
from langchain_openai import ChatOpenAI, OpenAIEmbeddings  # OpenAI模型和嵌入
from langchain_community.document_loaders import TextLoader  # 文本加载器
from langchain.text_splitter import RecursiveCharacterTextSplitter  # 文本分割器
from langchain_community.vectorstores import Chroma  # 向量存储
from langchain.prompts import ChatPromptTemplate  # 提示模板
from langchain.schema.output_parser import StrOutputParser  # 输出解析器
from langchain.schema.runnable import RunnablePassthrough  # 透传组件

# 1. 加载文档
# TextLoader：加载纯文本文件
# 参数：
#   file_path：文件路径
#   encoding：文件编码
loader = TextLoader("document.txt", encoding="utf-8")
documents = loader.load()

# 2. 文本分割
# RecursiveCharacterTextSplitter：递归字符文本分割器
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # 每个块最多1000个字符
    chunk_overlap=200  # 相邻块重叠200个字符
)
chunks = text_splitter.split_documents(documents)

# 3. 创建向量存储
# OpenAIEmbeddings：OpenAI嵌入模型
embeddings = OpenAIEmbeddings()

# Chroma.from_documents()：从文档创建向量存储
vectorstore = Chroma.from_documents(
    documents=chunks,  # 文档块列表
    embedding=embeddings,  # 嵌入模型
    persist_directory="./chroma_db"  # 持久化目录
)

# 4. 创建检索器
# as_retriever()：将向量存储转换为检索器
# search_kwargs={"k": 3}：返回前3个最相似的文档
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 5. 创建RAG链
# RAG提示模板
# {context}：检索到的文档内容
# {question}：用户的问题
template = """基于以下上下文回答问题：

上下文：
{context}

问题：
{question}

回答："""

# 创建提示模板
prompt = ChatPromptTemplate.from_template(template)

# 创建语言模型
llm = ChatOpenAI(model="gpt-4o-mini")

# 创建RAG链
# 使用管道操作符连接组件
# 数据流向：
#   1. 用户问题 -> 检索器 -> 获取相关文档
#   2. 用户问题 + 文档 -> 提示模板 -> 格式化提示
#   3. 格式化提示 -> 语言模型 -> 生成回答
#   4. 回答 -> 输出解析器 -> 字符串
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}  # 检索和透传
    | prompt  # 提示模板
    | llm  # 语言模型
    | StrOutputParser()  # 输出解析器
)

# 6. 使用RAG
# invoke()方法：执行RAG链
# 参数：用户问题
# 返回值：模型生成的回答
answer = rag_chain.invoke("文档的主要内容是什么？")
print(answer)
```

### 3. 多文档RAG示例
```python
# 导入多文档加载器
from langchain_community.document_loaders import (
    DirectoryLoader,  # 目录加载器
    PyPDFLoader,  # PDF加载器
    TextLoader,  # 文本加载器
    UnstructuredMarkdownLoader  # Markdown加载器
)

# 加载目录中的所有PDF文档
# DirectoryLoader：加载目录中的文件
# 参数：
#   path：目录路径
#   glob：文件匹配模式
#       "**/*.pdf"：匹配所有PDF文件（包括子目录）
#   loader_cls：加载器类
loader = DirectoryLoader(
    "./documents",  # 文档目录
    glob="**/*.pdf",  # 匹配所有PDF文件
    loader_cls=PyPDFLoader  # 使用PDF加载器
)
documents = loader.load()

# 添加更多文档类型
# 加载TXT文件
text_loader = DirectoryLoader(
    "./documents",  # 文档目录
    glob="**/*.txt",  # 匹配所有TXT文件
    loader_cls=TextLoader  # 使用文本加载器
)
# 将TXT文档添加到文档列表
documents.extend(text_loader.load())

# 后续处理同上
# 1. 文本分割
# 2. 创建嵌入
# 3. 创建向量存储
# 4. 创建检索器
# 5. 创建RAG链
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