# RAG高级模式

## 概述

本章介绍RAG（Retrieval-Augmented Generation）的高级应用模式，包括多模态RAG、自适应RAG、多步RAG、图RAG等。

## 多模态RAG

### 1. 图像RAG
处理图像数据的RAG：
```python
from langchain_community.document_loaders import ImageCaptionLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# 图像描述加载器
loader = ImageCaptionLoader(
    path_or_url="./images",
    blip_model="Salesforce/blip-image-captioning-base"
)
documents = loader.load()

# 使用多模态嵌入
embeddings = HuggingFaceEmbeddings(
    model_name="clip-ViT-B-32"
)

# 创建向量存储
vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings
)
```

### 2. 表格RAG
处理表格数据的RAG：
```python
import pandas as pd
from langchain_community.document_loaders import DataFrameLoader

# 加载CSV文件
df = pd.read_csv("data.csv")

# 转换为文档
loader = DataFrameLoader(df, page_content_column="description")
documents = loader.load()

# 创建向量存储
vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings
)
```

### 3. 音频RAG
处理音频数据的RAG：
```python
from langchain_community.document_loaders import (
    AudioLoader,
    YoutubeAudioLoader
)
from langchain_community.document_loaders.parsers.audio import OpenAIWhisperParser

# 加载音频文件
loader = AudioLoader("./audio/")
documents = loader.load()

# 使用Whisper解析
parser = OpenAIWhisperParser()
parsed_docs = parser.parse(documents)
```

## 自适应RAG

### 1. 查询路由
根据查询类型路由到不同的处理流程：
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class QueryState(TypedDict):
    query: str
    query_type: str
    result: str

# 定义节点
def classify_query(state: QueryState) -> QueryState:
    """分类查询"""
    query = state["query"].lower()
    if "天气" in query:
        query_type = "weather"
    elif "新闻" in query:
        query_type = "news"
    else:
        query_type = "knowledge"
    return {"query_type": query_type}

def handle_weather(state: QueryState) -> QueryState:
    """处理天气查询"""
    return {"result": f"天气查询结果: {state['query']}"}

def handle_news(state: QueryState) -> QueryState:
    """处理新闻查询"""
    return {"result": f"新闻查询结果: {state['query']}"}

def handle_knowledge(state: QueryState) -> QueryState:
    """处理知识查询"""
    # 这里使用RAG
    return {"result": f"知识查询结果: {state['query']}"}

# 创建图
graph = StateGraph(QueryState)
graph.add_node("classify", classify_query)
graph.add_node("weather", handle_weather)
graph.add_node("news", handle_news)
graph.add_node("knowledge", handle_knowledge)

# 设置条件边
def route_function(state: QueryState) -> str:
    return state["query_type"]

graph.add_conditional_edges(
    "classify",
    route_function,
    {
        "weather": "weather",
        "news": "news",
        "knowledge": "knowledge"
    }
)

# 设置出口
graph.add_edge("weather", END)
graph.add_edge("news", END)
graph.add_edge("knowledge", END)

# 编译和执行
graph.set_entry_point("classify")
app = graph.compile()
```

### 2. 自适应检索
根据查询复杂度选择检索策略：
```python
from typing import List, Dict
from langchain_openai import ChatOpenAI

class AdaptiveRetriever:
    def __init__(self, simple_retriever, complex_retriever):
        self.simple_retriever = simple_retriever
        self.complex_retriever = complex_retriever
        self.llm = ChatOpenAI(model="gpt-3.5-turbo")
    
    def classify_complexity(self, query: str) -> str:
        """分类查询复杂度"""
        # 使用LLM分类
        response = self.llm.invoke(
            f"判断以下查询的复杂度（简单/复杂）：{query}"
        )
        if "简单" in response.content:
            return "simple"
        return "complex"
    
    def retrieve(self, query: str) -> List[Dict]:
        """自适应检索"""
        complexity = self.classify_complexity(query)
        if complexity == "simple":
            return self.simple_retriever.invoke(query)
        else:
            return self.complex_retriever.invoke(query)
```

## 多步RAG

### 1. 迭代检索
多次迭代检索以提高质量：
```python
from langchain_openai import ChatOpenAI
from typing import List

class IterativeRAG:
    def __init__(self, vectorstore, max_iterations=3):
        self.vectorstore = vectorstore
        self.max_iterations = max_iterations
        self.llm = ChatOpenAI(model="gpt-3.5-turbo")
    
    def retrieve(self, query: str) -> List[str]:
        """迭代检索"""
        all_docs = []
        current_query = query
        
        for i in range(self.max_iterations):
            # 检索
            docs = self.vectorstore.similarity_search(current_query, k=3)
            all_docs.extend(docs)
            
            # 生成新查询
            if i < self.max_iterations - 1:
                current_query = self.generate_new_query(query, all_docs)
        
        return all_docs
    
    def generate_new_query(self, original_query: str, docs: List[str]) -> str:
        """生成新查询"""
        context = "\n".join([doc.page_content for doc in docs])
        response = self.llm.invoke(
            f"基于以下上下文，生成一个更具体的查询：\n"
            f"原始查询：{original_query}\n"
            f"上下文：{context}"
        )
        return response.content
```

### 2. 分层检索
使用分层策略进行检索：
```python
from typing import List, Dict
from langchain_community.vectorstores import Chroma

class HierarchicalRetriever:
    def __init__(self, vectorstores: List[Chroma]):
        self.vectorstores = vectorstores
    
    def retrieve(self, query: str, k: int = 5) -> List[Dict]:
        """分层检索"""
        results = []
        
        # 从粗粒度到细粒度检索
        for i, vectorstore in enumerate(self.vectorstores):
            docs = vectorstore.similarity_search(query, k=k)
            for doc in docs:
                doc.metadata["level"] = i
                results.append(doc)
        
        # 去重和排序
        unique_results = self.deduplicate(results)
        return unique_results[:k]
    
    def deduplicate(self, docs: List[Dict]) -> List[Dict]:
        """去重"""
        seen = set()
        unique_docs = []
        for doc in docs:
            if doc.page_content not in seen:
                seen.add(doc.page_content)
                unique_docs.append(doc)
        return unique_docs
```

## 图RAG

### 1. 知识图谱RAG
结合知识图谱的RAG：
```python
from typing import List, Dict, Tuple
import networkx as nx

class KnowledgeGraphRAG:
    def __init__(self):
        self.graph = nx.DiGraph()
    
    def add_entity(self, entity: str, properties: Dict):
        """添加实体"""
        self.graph.add_node(entity, **properties)
    
    def add_relation(self, source: str, target: str, relation: str):
        """添加关系"""
        self.graph.add_edge(source, target, relation=relation)
    
    def retrieve(self, query: str, max_hops: int = 2) -> List[Dict]:
        """从知识图谱检索"""
        # 提取查询中的实体
        entities = self.extract_entities(query)
        
        # 检索相关实体和关系
        results = []
        for entity in entities:
            if entity in self.graph:
                # 获取邻居节点
                neighbors = list(self.graph.neighbors(entity))
                for neighbor in neighbors[:3]:  # 限制数量
                    edge_data = self.graph[entity][neighbor]
                    results.append({
                        "source": entity,
                        "target": neighbor,
                        "relation": edge_data.get("relation", "")
                    })
        
        return results
    
    def extract_entities(self, query: str) -> List[str]:
        """提取实体"""
        # 这里可以使用NER模型
        return [query]  # 简化实现
```

### 2. 图嵌入RAG
使用图嵌入的RAG：
```python
from typing import List, Dict
import numpy as np

class GraphEmbeddingRAG:
    def __init__(self, graph, embedding_dim=128):
        self.graph = graph
        self.embedding_dim = embedding_dim
        self.embeddings = {}
    
    def train_embeddings(self):
        """训练图嵌入"""
        # 这里可以使用Node2Vec等算法
        nodes = list(self.graph.nodes())
        for i, node in enumerate(nodes):
            # 简化的嵌入生成
            self.embeddings[node] = np.random.random(self.embedding_dim)
    
    def retrieve(self, query_embedding: np.ndarray, k: int = 5) -> List[Dict]:
        """基于图嵌入检索"""
        similarities = []
        
        for node, embedding in self.embeddings.items():
            # 计算相似度
            similarity = np.dot(query_embedding, embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(embedding)
            )
            similarities.append((node, similarity))
        
        # 排序并返回top-k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [{"node": node, "similarity": sim} for node, sim in similarities[:k]]
```

## 上下文增强RAG

### 1. 上下文压缩
压缩上下文以减少token使用：
```python
from typing import List
from langchain_openai import ChatOpenAI

class ContextCompressor:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo")
    
    def compress(self, query: str, context: List[str], max_length: int = 1000) -> str:
        """压缩上下文"""
        # 合并上下文
        full_context = "\n".join(context)
        
        if len(full_context) <= max_length:
            return full_context
        
        # 使用LLM压缩
        response = self.llm.invoke(
            f"请将以下上下文压缩到{max_length}字以内，保留与查询相关的关键信息：\n"
            f"查询：{query}\n"
            f"上下文：{full_context}"
        )
        
        return response.content
```

### 2. 上下文增强
增强上下文以提供更多信息：
```python
from typing import List, Dict
from langchain_openai import ChatOpenAI

class ContextEnhancer:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo")
    
    def enhance(self, query: str, context: List[str]) -> List[str]:
        """增强上下文"""
        enhanced_context = []
        
        for ctx in context:
            # 生成相关问题
            questions = self.generate_questions(ctx)
            
            # 检索相关信息
            for question in questions:
                # 这里可以检索更多信息
                enhanced_context.append(f"问题：{question}")
            
            enhanced_context.append(ctx)
        
        return enhanced_context
    
    def generate_questions(self, context: str) -> List[str]:
        """生成相关问题"""
        response = self.llm.invoke(
            f"基于以下上下文，生成3个相关问题：\n{context}"
        )
        return response.content.split("\n")[:3]
```

## 多智能体RAG

### 1. 协作式RAG
多个智能体协作完成RAG：
```python
from typing import List, Dict
from langchain_openai import ChatOpenAI

class CollaborativeRAG:
    def __init__(self):
        self.retriever_llm = ChatOpenAI(model="gpt-3.5-turbo")
        self.analyzer_llm = ChatOpenAI(model="gpt-4")
        self.generator_llm = ChatOpenAI(model="gpt-3.5-turbo")
    
    def retrieve(self, query: str) -> List[str]:
        """检索智能体"""
        # 检索文档
        docs = vectorstore.similarity_search(query, k=5)
        return [doc.page_content for doc in docs]
    
    def analyze(self, query: str, docs: List[str]) -> Dict:
        """分析智能体"""
        context = "\n".join(docs)
        response = self.analyzer_llm.invoke(
            f"分析以下查询和文档的相关性：\n"
            f"查询：{query}\n"
            f"文档：{context}"
        )
        return {"analysis": response.content}
    
    def generate(self, query: str, docs: List[str], analysis: Dict) -> str:
        """生成智能体"""
        context = "\n".join(docs)
        response = self.generator_llm.invoke(
            f"基于以下信息生成回答：\n"
            f"查询：{query}\n"
            f"文档：{context}\n"
            f"分析：{analysis['analysis']}"
        )
        return response.content
    
    def process(self, query: str) -> str:
        """多智能体协作处理"""
        docs = self.retrieve(query)
        analysis = self.analyze(query, docs)
        answer = self.generate(query, docs, analysis)
        return answer
```

### 2. 竞争式RAG
多个智能体竞争生成最佳答案：
```python
from typing import List, Dict
from langchain_openai import ChatOpenAI

class CompetitiveRAG:
    def __init__(self, num_agents=3):
        self.agents = [ChatOpenAI(model="gpt-3.5-turbo") for _ in range(num_agents)]
        self.judge = ChatOpenAI(model="gpt-4")
    
    def generate_candidates(self, query: str, context: str) -> List[str]:
        """生成候选答案"""
        candidates = []
        for agent in self.agents:
            response = agent.invoke(
                f"基于以下上下文回答问题：\n"
                f"上下文：{context}\n"
                f"问题：{query}"
            )
            candidates.append(response.content)
        return candidates
    
    def judge_answers(self, query: str, candidates: List[str]) -> str:
        """评判答案"""
        candidates_text = "\n".join([f"答案{i+1}: {c}" for i, c in enumerate(candidates)])
        response = self.judge.invoke(
            f"请评判以下答案，选择最佳答案：\n"
            f"问题：{query}\n"
            f"{candidates_text}"
        )
        return response.content
    
    def process(self, query: str, context: str) -> str:
        """竞争式处理"""
        candidates = self.generate_candidates(query, context)
        best_answer = self.judge_answers(query, candidates)
        return best_answer
```

## 评估和优化

### 1. 自动评估
自动评估RAG系统：
```python
from typing import List, Dict
from langchain_openai import ChatOpenAuto评估RAG系统：
```python
from typing import List, Dict
from langchain_openai import ChatOpenAI

class RAGEvaluator:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4")
    
    def evaluate_relevance(self, query: str, context: str) -> float:
        """评估相关性"""
        response = self.llm.invoke(
            f"评估以下上下文与查询的相关性（0-10分）：\n"
            f"查询：{query}\n"
            f"上下文：{context}"
        )
        # 提取分数
        try:
            score = float(response.content) / 10
        except:
            score = 0.5
        return score
    
    def evaluate_faithfulness(self, answer: str, context: str) -> float:
        """评估忠实度"""
        response = self.llm.invoke(
            f"评估以下回答是否忠实于上下文（0-10分）：\n"
            f"回答：{answer}\n"
            f"上下文：{context}"
        )
        try:
            score = float(response.content) / 10
        except:
            score = 0.5
        return score
    
    def evaluate_completeness(self, query: str, answer: str) -> float:
        """评估完整性"""
        response = self.llm.invoke(
            f"评估以下回答是否完整地回答了查询（0-10分）：\n"
            f"查询：{query}\n"
            f"回答：{answer}"
        )
        try:
            score = float(response.content) / 10
        except:
            score = 0.5
        return score
```

### 2. 优化策略
基于评估结果优化RAG系统：
```python
from typing import List, Dict

class RAGOptimizer:
    def __init__(self, rag_system):
        self.rag_system = rag_system
        self.evaluator = RAGEvaluator()
    
    def optimize(self, queries: List[str]) -> Dict:
        """优化RAG系统"""
        results = []
        
        for query in queries:
            # 获取当前结果
            current_result = self.rag_system.process(query)
            
            # 评估
            relevance = self.evaluator.evaluate_relevance(query, current_result["context"])
            faithfulness = self.evaluator.evaluate_faithfulness(current_result["answer"], current_result["context"])
            completeness = self.evaluator.evaluate_completeness(query, current_result["answer"])
            
            results.append({
                "query": query,
                "relevance": relevance,
                "faithfulness": faithfulness,
                "completeness": completeness
            })
        
        # 分析结果并提出优化建议
        return self.analyze_and_suggest(results)
    
    def analyze_and_suggest(self, results: List[Dict]) -> Dict:
        """分析结果并提出优化建议"""
        avg_relevance = sum(r["relevance"] for r in results) / len(results)
        avg_faithfulness = sum(r["faithfulness"] for r in results) / len(results)
        avg_completeness = sum(r["completeness"] for r in results) / len(results)
        
        suggestions = []
        if avg_relevance < 0.7:
            suggestions.append("提高检索相关性：优化嵌入模型或使用重排序")
        if avg_faithfulness < 0.7:
            suggestions.append("提高忠实度：加强上下文约束或使用引用")
        if avg_completeness < 0.7:
            suggestions.append("提高完整性：优化提示模板或增加上下文")
        
        return {
            "avg_relevance": avg_relevance,
            "avg_faithfulness": avg_faithfulness,
            "avg_completeness": avg_completeness,
            "suggestions": suggestions
        }
```

## 最佳实践

### 1. 模式选择
- **多模态RAG**：处理多种类型的数据
- **自适应RAG**：根据查询类型选择策略
- **多步RAG**：复杂查询需要多步处理
- **图RAG**：处理关系型数据

### 2. 性能优化
- **缓存机制**：缓存常见查询结果
- **异步处理**：使用异步提升并发性能
- **批量处理**：批量处理多个查询
- **资源管理**：合理分配计算资源

### 3. 质量保证
- **自动评估**：使用自动评估监控质量
- **人工审核**：关键场景需要人工审核
- **持续优化**：基于反馈持续优化
- **版本管理**：管理不同版本的RAG系统

## 常见问题

### 1. 复杂性问题
- **系统复杂**：模块化设计，降低复杂性
- **调试困难**：添加详细日志，使用调试工具
- **维护困难**：文档完善，代码规范

### 2. 性能问题
- **响应慢**：优化检索和生成，使用缓存
- **资源占用高**：优化模型选择，使用量化
- **并发限制**：使用异步处理，优化架构

### 3. 质量问题
- **准确性低**：优化检索策略，使用重排序
- **一致性差**：加强上下文约束，使用引用
- **可解释性差**：添加引用来源，提供推理过程

## 下一步学习

- [向量数据库](/agent/rag/vector-databases/) - 向量数据库详解
- [Agent框架](/agent/agent-frameworks/) - 了解各种Agent框架
- [多Agent系统](/agent/multi-agent/) - 学习多Agent协作