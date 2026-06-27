# Day 8: 文本数据分析

## 学习目标

完成今天的学习后，你将能够：
- 掌握文本预处理技术
- 进行词频分析
- 进行情感分析
- 进行文本可视化

## 技术原理

### 文本预处理

#### 基本步骤
1. **分词**：将文本分割成词语
2. **去除停用词**：去除无意义的词
3. **词形还原**：将词语还原为基本形式
4. **去除标点符号和数字**

#### 中文分词
1. **基于规则**：词典匹配
2. **基于统计**：HMM、CRF
3. **深度学习**：BiLSTM、BERT

### 词频分析

#### 基本概念
1. **词频（TF）**：词在文档中出现的频率
2. **文档频率（DF）**：包含词的文档比例
3. **TF-IDF**：词频-逆文档频率

#### 分析方法
1. **词频统计**：统计词出现次数
2. **词云可视化**：可视化词频
3. **关键词提取**：提取重要词语

### 情感分析

#### 方法
1. **基于词典**：使用情感词典
2. **机器学习**：训练分类模型
3. **深度学习**：使用神经网络

#### 情感分类
1. **二分类**：正面/负面
2. **多分类**：非常正面、正面、中性、负面、非常负面
3. **情感强度**：情感的强烈程度

### 文本可视化

#### 可视化方法
1. **词云**：可视化词频
2. **条形图**：显示高频词
3. **网络图**：显示词共现关系
4. **时间线**：显示文本时间分布

## 案例：电影评论分析

假设我们有一个电影评论数据集，需要：
1. 预处理文本数据
2. 进行词频分析
3. 进行情感分析
4. 可视化分析结果

## 应用场景

1. **舆情监控**：社交媒体情感分析
2. **客户反馈**：产品评论分析
3. **市场研究**：品牌声誉分析
4. **内容推荐**：基于文本的推荐
5. **文本分类**：新闻分类、垃圾邮件检测

## 代码案例

### 文本预处理

```python
# 文本预处理示例

import pandas as pd
import numpy as np
import re
import jieba
import matplotlib.pyplot as plt

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建示例文本数据
texts = [
    "这部电影真是太棒了！演员的表演非常出色，剧情也很精彩。",
    "电影一般般，没有预期的那么好看，有些失望。",
    "非常感动，这是一部值得一看的好电影，强烈推荐！",
    "剧情拖沓，演员演技也很差，浪费时间。",
    "画面很美，音乐也很动听，整体感觉不错。",
    "故事老套，没有新意，看了一半就想走了。",
    "导演的功力很深，每个镜头都很有深意。",
    "特效很棒，但剧情太弱了，有点华而不实。",
    "这是一部经典之作，值得反复观看。",
    "演员阵容强大，但剧情改编不太成功。"
]

df = pd.DataFrame({'评论': texts})
print("原始文本数据:")
print(df)

# 2. 文本清洗函数
def clean_text(text):
    """清洗文本"""
    # 去除标点符号
    text = re.sub(r'[^\w\s]', '', text)
    # 去除数字
    text = re.sub(r'\d+', '', text)
    # 去除多余空格
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# 3. 中文分词函数
def segment_chinese(text):
    """中文分词"""
    # 使用jieba分词
    words = jieba.cut(text)
    return ' '.join(words)

# 4. 去除停用词
# 常用中文停用词
stopwords = set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'])

def remove_stopwords(text):
    """去除停用词"""
    words = text.split()
    filtered_words = [word for word in words if word not in stopwords and len(word) > 1]
    return ' '.join(filtered_words)

# 5. 应用预处理
df['清洗后'] = df['评论'].apply(clean_text)
df['分词后'] = df['清洗后'].apply(segment_chinese)
df['去停用词后'] = df['分词后'].apply(remove_stopwords)

print("\n预处理后的数据:")
print(df[['评论', '去停用词后']])

# 6. 词频统计
from collections import Counter

# 合并所有文本
all_words = ' '.join(df['去停用词后']).split()
word_counts = Counter(all_words)

# 显示前20个高频词
print("\n前20个高频词:")
for word, count in word_counts.most_common(20):
    print(f"{word}: {count}")

# 7. 可视化词频
top_words = word_counts.most_common(20)
words, counts = zip(*top_words)

plt.figure(figsize=(12, 6))
plt.bar(words, counts, color='skyblue', edgecolor='black')
plt.title('前20个高频词', fontsize=16, fontweight='bold')
plt.xlabel('词语')
plt.ylabel('频次')
plt.xticks(rotation=45, ha='right')
plt.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.show()
```

### 词频分析

```python
# 词频分析示例

import pandas as pd
import numpy as np
import jieba
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
import matplotlib.pyplot as plt

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建示例数据
documents = [
    "机器学习是人工智能的一个分支",
    "深度学习是机器学习的一个子领域",
    "自然语言处理是人工智能的重要应用",
    "计算机视觉是人工智能的另一个重要应用",
    "机器学习算法可以从数据中学习模式",
    "深度学习使用神经网络进行学习",
    "自然语言处理涉及文本分析和理解",
    "计算机视觉涉及图像识别和处理"
]

# 2. 中文分词
def chinese_segment(text):
    """中文分词"""
    return ' '.join(jieba.cut(text))

segmented_docs = [chinese_segment(doc) for doc in documents]
print("分词后的文档:")
for i, doc in enumerate(segmented_docs):
    print(f"文档{i+1}: {doc}")

# 3. 词频统计
# 合并所有文档
all_words = ' '.join(segmented_docs).split()
word_counts = Counter(all_words)

print("\n词频统计:")
for word, count in word_counts.most_common(20):
    print(f"{word}: {count}")

# 4. TF-IDF分析
# 创建TF-IDF向量化器
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(segmented_docs)

# 获取特征名称
feature_names = vectorizer.get_feature_names_out()

# 显示TF-IDF矩阵
print("\nTF-IDF矩阵:")
print(pd.DataFrame(tfidf_matrix.toarray(), columns=feature_names))

# 5. 文档关键词提取
print("\n文档关键词提取:")
for i, doc in enumerate(segmented_docs):
    # 获取当前文档的TF-IDF值
    tfidf_scores = tfidf_matrix[i].toarray()[0]
    # 创建词-TF-IDF分数对
    word_scores = list(zip(feature_names, tfidf_scores))
    # 按TF-IDF值排序
    word_scores.sort(key=lambda x: x[1], reverse=True)
    # 显示前5个关键词
    print(f"\n文档{i+1}:")
    for word, score in word_scores[:5]:
        if score > 0:
            print(f"  {word}: {score:.4f}")

# 6. 可视化TF-IDF
# 选择第一个文档进行可视化
doc_tfidf = tfidf_matrix[0].toarray()[0]
word_tfidf = list(zip(feature_names, doc_tfidf))
word_tfidf.sort(key=lambda x: x[1], reverse=True)

# 过滤掉TF-IDF值为0的词
word_tfidf = [(word, score) for word, score in word_tfidf if score > 0][:10]

if word_tfidf:
    words, scores = zip(*word_tfidf)
    
    plt.figure(figsize=(10, 6))
    plt.barh(range(len(words)), scores, color='skyblue', edgecolor='black')
    plt.yticks(range(len(words)), words)
    plt.title('文档1的TF-IDF关键词', fontsize=16, fontweight='bold')
    plt.xlabel('TF-IDF值')
    plt.ylabel('词语')
    plt.grid(True, alpha=0.3, axis='x')
    plt.tight_layout()
    plt.show()

# 7. 词共现分析
# 创建词共现矩阵
def create_cooccurrence_matrix(texts, window_size=2):
    """创建词共现矩阵"""
    cooccurrence = Counter()
    
    for text in texts:
        words = text.split()
        for i in range(len(words)):
            for j in range(i + 1, min(i + window_size + 1, len(words))):
                word_pair = tuple(sorted([words[i], words[j]]))
                cooccurrence[word_pair] += 1
    
    return cooccurrence

cooccurrence = create_cooccurrence_matrix(segmented_docs, window_size=2)
print("\n词共现频率:")
for pair, count in cooccurrence.most_common(10):
    print(f"{pair}: {count}")
```

### 情感分析

```python
# 情感分析示例

import pandas as pd
import numpy as np
import jieba
from snownlp import SnowNLP
import matplotlib.pyplot as plt

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建示例数据
reviews = [
    "这部电影真是太棒了！演员的表演非常出色，剧情也很精彩。",
    "电影一般般，没有预期的那么好看，有些失望。",
    "非常感动，这是一部值得一看的好电影，强烈推荐！",
    "剧情拖沓，演员演技也很差，浪费时间。",
    "画面很美，音乐也很动听，整体感觉不错。",
    "故事老套，没有新意，看了一半就想走了。",
    "导演的功力很深，每个镜头都很有深意。",
    "特效很棒，但剧情太弱了，有点华而不实。",
    "这是一部经典之作，值得反复观看。",
    "演员阵容强大，但剧情改编不太成功。"
]

df = pd.DataFrame({'评论': reviews})
print("原始评论数据:")
print(df)

# 2. 使用SnowNLP进行情感分析
def get_sentiment(text):
    """获取情感分数"""
    s = SnowNLP(text)
    return s.sentiments

df['情感分数'] = df['评论'].apply(get_sentiment)
df['情感标签'] = df['情感分数'].apply(lambda x: '正面' if x > 0.5 else '负面')

print("\n情感分析结果:")
print(df[['评论', '情感分数', '情感标签']])

# 3. 情感分布统计
sentiment_counts = df['情感标签'].value_counts()
print("\n情感分布:")
print(sentiment_counts)

# 4. 可视化情感分布
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# 饼图
axes[0].pie(sentiment_counts, labels=sentiment_counts.index, autopct='%1.1f%%',
            colors=['#ff9999', '#66b3ff'], startangle=90)
axes[0].set_title('情感分布', fontsize=14, fontweight='bold')

# 柱状图
axes[1].bar(sentiment_counts.index, sentiment_counts.values, color=['#ff9999', '#66b3ff'], edgecolor='black')
axes[1].set_title('情感计数', fontsize=14, fontweight='bold')
axes[1].set_xlabel('情感')
axes[1].set_ylabel('数量')
axes[1].grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.show()

# 5. 情感分数分布
plt.figure(figsize=(10, 6))
plt.hist(df['情感分数'], bins=10, edgecolor='black', alpha=0.7, color='skyblue')
plt.axvline(0.5, color='red', linestyle='--', label='分界线(0.5)')
plt.title('情感分数分布', fontsize=16, fontweight='bold')
plt.xlabel('情感分数')
plt.ylabel('频数')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 6. 基于词典的情感分析
# 简单的情感词典
positive_words = set(['棒', '出色', '精彩', '感动', '好', '推荐', '美', '动听', '不错', '经典', '强大'])
negative_words = set(['差', '失望', '拖沓', '浪费', '老套', '弱', '失败'])

def dictionary_sentiment(text):
    """基于词典的情感分析"""
    words = set(jieba.cut(text))
    positive_count = len(words & positive_words)
    negative_count = len(words & negative_words)
    
    if positive_count > negative_count:
        return '正面', positive_count - negative_count
    elif negative_count > positive_count:
        return '负面', negative_count - positive_count
    else:
        return '中性', 0

df['词典情感'], df['情感强度'] = zip(*df['评论'].apply(dictionary_sentiment))

print("\n基于词典的情感分析:")
print(df[['评论', '词典情感', '情感强度']])

# 7. 情感分析结果比较
print("\n情感分析方法比较:")
comparison = df[['评论', '情感标签', '词典情感']].copy()
comparison['一致'] = comparison['情感标签'] == comparison['词典情感']
print(comparison)
print(f"\n一致率: {comparison['一致'].mean() * 100:.2f}%")
```

### 文本可视化

```python
# 文本可视化示例

import pandas as pd
import numpy as np
import jieba
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from collections import Counter

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建示例数据
texts = [
    "机器学习是人工智能的一个分支，它使用算法从数据中学习模式。",
    "深度学习是机器学习的一个子领域，它使用多层神经网络。",
    "自然语言处理是人工智能的重要应用，它处理人类语言。",
    "计算机视觉是人工智能的另一个重要应用，它处理图像和视频。",
    "机器学习算法可以从数据中学习模式，并做出预测。",
    "深度学习使用神经网络进行学习，可以处理复杂的数据。",
    "自然语言处理涉及文本分析和理解，包括分词和情感分析。",
    "计算机视觉涉及图像识别和处理，包括目标检测和图像分割。"
]

# 2. 中文分词
def chinese_segment(text):
    """中文分词"""
    return ' '.join(jieba.cut(text))

segmented_texts = [chinese_segment(text) for text in texts]
all_words = ' '.join(segmented_texts).split()

# 3. 词频统计
word_counts = Counter(all_words)
print("词频统计:")
for word, count in word_counts.most_common(20):
    print(f"{word}: {count}")

# 4. 创建词云
# 合并所有文本
all_text = ' '.join(segmented_texts)

# 创建词云对象
wordcloud = WordCloud(
    font_path='/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',  # 中文字体路径
    width=800,
    height=400,
    background_color='white',
    max_words=100,
    max_font_size=100,
    random_state=42
)

# 生成词云
wordcloud.generate(all_text)

# 显示词云
plt.figure(figsize=(12, 8))
plt.imshow(wordcloud, interpolation='bilinear')
plt.axis('off')
plt.title('词云可视化', fontsize=16, fontweight='bold')
plt.show()

# 5. 词频条形图
top_words = word_counts.most_common(15)
words, counts = zip(*top_words)

plt.figure(figsize=(12, 6))
plt.bar(words, counts, color='skyblue', edgecolor='black')
plt.title('前15个高频词', fontsize=16, fontweight='bold')
plt.xlabel('词语')
plt.ylabel('频次')
plt.xticks(rotation=45, ha='right')
plt.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.show()

# 6. 词共现网络图
import networkx as nx

def create_cooccurrence_network(texts, window_size=2):
    """创建词共现网络"""
    cooccurrence = Counter()
    
    for text in texts:
        words = text.split()
        for i in range(len(words)):
            for j in range(i + 1, min(i + window_size + 1, len(words))):
                word_pair = tuple(sorted([words[i], words[j]]))
                cooccurrence[word_pair] += 1
    
    return cooccurrence

cooccurrence = create_cooccurrence_network(segmented_texts, window_size=2)

# 创建网络图
G = nx.Graph()

# 添加边
for (word1, word2), weight in cooccurrence.items():
    if weight >= 2:  # 只显示共现次数大于等于2的边
        G.add_edge(word1, word2, weight=weight)

# 设置节点大小（基于词频）
node_sizes = [word_counts.get(node, 0) * 100 for node in G.nodes()]

# 设置边宽度（基于共现频率）
edge_weights = [G[u][v]['weight'] for u, v in G.edges()]

# 绘制网络图
plt.figure(figsize=(12, 8))
pos = nx.spring_layout(G, k=2, iterations=50)

# 绘制边
nx.draw_networkx_edges(G, pos, width=edge_weights, alpha=0.5, edge_color='gray')

# 绘制节点
nx.draw_networkx_nodes(G, pos, node_size=node_sizes, node_color='skyblue', alpha=0.8)

# 绘制标签
nx.draw_networkx_labels(G, pos, font_size=10, font_family='SimHei')

plt.title('词共现网络图', fontsize=16, fontweight='bold')
plt.axis('off')
plt.show()

# 7. 文档相似度可视化
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 创建TF-IDF向量化器
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(segmented_texts)

# 计算余弦相似度
similarity_matrix = cosine_similarity(tfidf_matrix)

# 可视化相似度矩阵
plt.figure(figsize=(10, 8))
plt.imshow(similarity_matrix, cmap='YlOrRd', interpolation='nearest')
plt.colorbar(label='相似度')
plt.title('文档相似度矩阵', fontsize=16, fontweight='bold')
plt.xlabel('文档')
plt.ylabel('文档')
plt.xticks(range(len(texts)), [f'文档{i+1}' for i in range(len(texts))], rotation=45)
plt.yticks(range(len(texts)), [f'文档{i+1}' for i in range(len(texts))])
plt.tight_layout()
plt.show()
```

## 课后练习

### 练习1：文本预处理
1. 收集一些文本数据
2. 进行文本清洗
3. 进行中文分词
4. 去除停用词

### 练习2：词频分析
1. 统计词频
2. 计算TF-IDF
3. 提取关键词
4. 可视化词频

### 练习3：情感分析
1. 使用SnowNLP进行情感分析
2. 创建简单的情感词典
3. 比较不同方法的结果
4. 可视化情感分布

### 练习4：文本可视化
1. 创建词云
2. 绘制词共现网络
3. 计算文档相似度
4. 可视化分析结果

## 常见问题

### Q1: 中文分词不准确怎么办？
A: 可以尝试：
1. 添加自定义词典
2. 使用不同的分词工具
3. 后处理修正错误

### Q2: 如何选择停用词表？
A: 可以使用：
1. 通用停用词表
2. 领域特定停用词表
3. 自定义停用词表

### Q3: 情感分析准确率不高怎么办？
A: 可以尝试：
1. 使用更复杂的模型
2. 增加训练数据
3. 使用预训练模型
4. 结合多种方法

### Q4: 如何处理多语言文本？
A: 可以使用：
1. 语言检测
2. 多语言分词工具
3. 多语言预训练模型

### Q5: 文本分析需要大量计算资源吗？
A: 取决于数据量和方法：
- 传统方法：计算资源较少
- 深度学习：需要GPU
- 大数据：需要分布式计算

## 下一步学习

完成今天的学习后，建议你：
1. 练习处理真实的文本数据
2. 掌握中文分词技术
3. 学习情感分析方法
4. 准备进入Day 9的学习：地理数据分析

明天我们将学习地理数据分析，这是处理空间数据的重要技能。