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

## 技术方案对比

### RAG vs 微调 vs 提示工程

| 对比维度 | RAG | 微调(Fine-tuning) | 提示工程(Prompt Engineering) |
|----------|-----|-------------------|------------------------------|
| **原理** | 检索外部知识增强生成 | 在特定数据上训练模型 | 设计提示引导模型 |
| **知识更新** | 实时更新，修改文档即可 | 需要重新训练 | 依赖模型已有知识 |
| **成本** | 中等（需要向量数据库） | 高（需要GPU训练） | 低（只调用API） |
| **效果** | 知识准确，可追溯 | 特定任务效果好 | 简单任务效果好 |
| **适用场景** | 知识库问答、文档搜索 | 特定领域任务 | 简单任务、快速原型 |

### 如何选择方案？

**场景一：企业知识库问答**
- 推荐：RAG
- 原因：知识需要实时更新，需要可追溯的来源

**场景二：特定领域任务（如医疗诊断）**
- 推荐：微调 + RAG
- 原因：微调让模型理解领域知识，RAG提供最新信息

**场景三：简单问答**
- 推荐：提示工程
- 原因：成本低，开发快

**场景四：需要引用来源的场景**
- 推荐：RAG
- 原因：RAG可以提供知识来源，便于验证

### RAG技术栈对比

| 组件 | 方案选择 | 优点 | 缺点 |
|------|----------|------|------|
| **嵌入模型** | OpenAI Embeddings | 效果好，易用 | 需要API调用，有成本 |
| | BGE/M3E | 开源免费，中文优化 | 需要自己部署 |
| **向量数据库** | Pinecone | 全托管，易维护 | 成本较高 |
| | Chroma | 轻量级，易上手 | 性能有限 |
| | Milvus | 高性能，可扩展 | 部署复杂 |
| **检索策略** | 纯向量检索 | 简单，语义理解好 | 可能漏掉关键词 |
| | 混合检索 | 兼顾语义和关键词 | 复杂度高 |

## 设计原理与目的

### 为什么需要RAG？

**解决的核心问题：**

1. **知识时效性**
```
问题：模型训练数据有截止日期
示例：问"2024年诺贝尔奖得主是谁？"
- 无RAG：模型不知道（训练数据截止到2023年）
- 有RAG：检索最新信息 → 准确回答
```

2. **幻觉问题**
```
问题：模型可能编造不存在的信息
示例：问"张三的电话号码是多少？"
- 无RAG：模型可能编造一个号码
- 有RAG：检索不到 → 回答"未找到相关信息"
```

3. **私有数据**
```
问题：模型没有企业内部数据
示例：问"公司的报销流程是什么？"
- 无RAG：模型不知道
- 有RAG：检索内部文档 → 准确回答
```

4. **可追溯性**
```
问题：需要知道答案来源
示例：问"这个结论的依据是什么？"
- 无RAG：无法提供来源
- 有RAG：提供原始文档引用
```

### RAG的核心原理

**1. 检索增强生成的流程**

```
用户问题："公司的年假政策是什么？"

步骤1：查询理解
- 识别关键词：公司、年假、政策
- 生成查询向量

步骤2：知识检索
- 在向量数据库中搜索相似文档
- 找到《员工手册》中关于年假的章节

步骤3：上下文构建
- 将检索到的文档片段作为上下文
- 构建提示词

步骤4：答案生成
- LLM基于上下文生成答案
- "根据公司员工手册，年假政策如下..."
```

**2. 为什么向量检索有效？**

**语义相似性原理：**
```
"苹果好吃" → 向量A [0.2, 0.8, 0.1, ...]
"水果味道好" → 向量B [0.3, 0.7, 0.2, ...]
"今天天气" → 向量C [0.9, 0.1, 0.5, ...]

计算相似度：
sim(A, B) = 0.95  # 高相似度（语义相近）
sim(A, C) = 0.30  # 低相似度（语义不同）
```

**3. 为什么需要文本分块？**

**问题：** 文档太长，无法直接放入上下文

**解决方案：** 将文档分割成小块
```
原始文档：10000字
↓ 分块
块1：500字（关于年假）
块2：500字（关于工资）
块3：500字（关于考勤）
...

检索时只返回相关的块，而不是整个文档
```

**分块策略对比：**

| 策略 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **固定长度** | 按字符数分割 | 简单 | 可能切断语义 |
| **按段落** | 按段落分割 | 保持语义完整 | 块大小不一致 |
| **递归分割** | 先大块再小块 | 平衡语义和大小 | 复杂度高 |
| **语义分割** | 按语义边界分割 | 语义最完整 | 实现复杂 |

### 嵌入模型的工作原理

**什么是嵌入（Embedding）？**

嵌入是将文本转换为数值向量的过程：
```
文本："人工智能是未来"
     ↓ 嵌入模型
向量：[0.12, -0.34, 0.56, 0.78, ...] （1536维）
```

**为什么嵌入能表示语义？**

训练过程中，模型学习到：
- 语义相似的文本 → 向量距离近
- 语义不同的文本 → 向量距离远

**类比理解：**
把嵌入想象成"语义GPS坐标"：
- "猫"和"狗"的坐标很近（都是宠物）
- "猫"和"汽车"的坐标很远（语义不同）

## 应用场景详解

### 场景一：企业知识库问答

**需求背景：**
企业有大量内部文档（员工手册、产品文档、FAQ等），员工需要快速查询。

**解决方案：**
```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.chains import RetrievalQA

# 1. 加载文档
loader = DirectoryLoader(
    "./company_docs",
    glob="**/*.txt",
    loader_cls=TextLoader
)
documents = loader.load()

# 2. 文本分割
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
chunks = text_splitter.split_documents(documents)

# 3. 创建向量数据库
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    chunks,
    embeddings,
    persist_directory="./chroma_db"
)

# 4. 创建问答链
llm = ChatOpenAI(model="gpt-4o-mini")
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
)

# 5. 使用
answer = qa_chain.invoke("公司的年假政策是什么？")
print(answer["result"])
```

**实现要点：**
- 文档需要定期更新
- 分块大小需要根据文档特点调整
- 返回答案时最好附带来源

### 场景二：智能客服系统

**需求背景：**
客服需要回答产品相关问题，但产品信息经常更新。

**解决方案：**
```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough

# 1. 准备产品文档
product_docs = [
    "产品A：价格100元，功能包括...",
    "产品B：价格200元，功能包括...",
    "售后政策：7天无理由退货..."
]

# 2. 创建向量数据库
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_texts(product_docs, embeddings)

# 3. 创建RAG提示模板
template = """基于以下产品信息回答客户问题。
如果信息中没有相关内容，请说"抱歉，我需要转接人工客服"。

产品信息：
{context}

客户问题：
{question}

回答："""

prompt = ChatPromptTemplate.from_template(template)

# 4. 构建RAG链
llm = ChatOpenAI(model="gpt-4o-mini")
retriever = vectorstore.as_retriever()

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 5. 使用
answer = rag_chain.invoke("产品A多少钱？")
print(answer)
```

**实现要点：**
- 产品信息需要及时更新
- 提示模板要引导模型友好回答
- 无法回答时要转接人工

### 场景三：文档搜索与摘要

**需求背景：**
用户上传大量文档，需要快速搜索和生成摘要。

**解决方案：**
```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.summarize import load_summarize_chain

# 1. 加载和分割文档
def process_document(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100
    )
    chunks = text_splitter.create_documents([text])
    
    return chunks

# 2. 创建向量数据库
def create_vectorstore(chunks):
    embeddings = OpenAIEmbeddings()
    vectorstore = FAISS.from_documents(chunks, embeddings)
    return vectorstore

# 3. 搜索相关文档
def search_documents(vectorstore, query, k=3):
    results = vectorstore.similarity_search_with_score(query, k=k)
    return results

# 4. 生成摘要
def generate_summary(chunks):
    llm = ChatOpenAI(model="gpt-4o-mini")
    chain = load_summarize_chain(llm, chain_type="map_reduce")
    summary = chain.invoke(chunks)
    return summary["output_text"]

# 使用示例
chunks = process_document("report.txt")
vectorstore = create_vectorstore(chunks)

# 搜索
results = search_documents(vectorstore, "主要结论是什么？")
for doc, score in results:
    print(f"相关度: {score:.2f}")
    print(f"内容: {doc.page_content[:100]}...")
    print()

# 摘要
summary = generate_summary(chunks)
print(f"摘要: {summary}")
```

**实现要点：**
- 支持多种文档格式
- 搜索结果要排序
- 摘要要简洁明了

### 场景四：多语言知识库

**需求背景：**
企业有中英文文档，需要统一检索。

**解决方案：**
```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 1. 准备多语言文档
documents = {
    "zh": ["人工智能是计算机科学的一个分支...", "机器学习是AI的子领域..."],
    "en": ["Artificial intelligence is a branch of computer science...", "Machine learning is a subfield of AI..."]
}

# 2. 创建多语言向量数据库
embeddings = OpenAIEmbeddings()  # OpenAI嵌入支持多语言

all_chunks = []
for lang, docs in documents.items():
    for doc in docs:
        # 添加语言元数据
        all_chunks.append({
            "text": doc,
            "metadata": {"language": lang}
        })

# 3. 创建向量数据库
vectorstore = Chroma.from_texts(
    [c["text"] for c in all_chunks],
    embeddings,
    metadatas=[c["metadata"] for c in all_chunks]
)

# 4. 搜索（支持跨语言）
results = vectorstore.similarity_search(
    "什么是AI？",  # 中文查询
    k=3,
    filter={"language": "en"}  # 只返回英文结果
)

for doc in results:
    print(f"语言: {doc.metadata['language']}")
    print(f"内容: {doc.page_content}")
    print()
```

**实现要点：**
- 使用支持多语言的嵌入模型
- 添加语言元数据便于过滤
- 支持跨语言检索

### 场景五：实时知识更新

**需求背景：**
知识库需要实时更新，如新闻、股票信息等。

**解决方案：**
```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from datetime import datetime

class RealtimeKnowledgeBase:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            embedding_function=self.embeddings,
            persist_directory="./realtime_kb"
        )
    
    def add_document(self, text, metadata=None):
        """添加新文档"""
        if metadata is None:
            metadata = {}
        
        metadata["timestamp"] = datetime.now().isoformat()
        
        self.vectorstore.add_texts(
            [text],
            metadatas=[metadata]
        )
    
    def search(self, query, time_filter=None, k=5):
        """搜索文档"""
        filter_dict = {}
        
        if time_filter:
            # 只搜索最近N天的文档
            filter_dict["timestamp"] = {"$gte": time_filter}
        
        results = self.vectorstore.similarity_search(
            query,
            k=k,
            filter=filter_dict if filter_dict else None
        )
        
        return results
    
    def update_document(self, doc_id, new_text):
        """更新文档"""
        # Chroma支持更新
        self.vectorstore.update_document(doc_id, new_text)

# 使用示例
kb = RealtimeKnowledgeBase()

# 添加新闻
kb.add_document(
    "2024年1月15日，OpenAI发布了GPT-4 Turbo...",
    {"category": "tech", "source": "news"}
)

# 搜索最新信息
results = kb.search("GPT-4有什么新功能？")
for doc in results:
    print(doc.page_content)
```

**实现要点：**
- 支持增量更新
- 添加时间戳元数据
- 支持时间范围过滤

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
    llm = ChatOpenAI(model="gpt-4o-mini")
    
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