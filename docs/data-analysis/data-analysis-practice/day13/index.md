# Day 13: 社交媒体数据分析实战

## 学习目标

完成今天的学习后，你将能够：
- 进行社交网络分析
- 进行舆情分析
- 分析影响力
- 分析内容传播

## 技术原理

### 社交网络分析

#### 基本概念
1. **节点**：用户、组织、设备
2. **边**：关注、转发、评论
3. **网络密度**：连接的紧密程度
4. **中心性**：节点的重要程度

#### 分析方法
1. **度中心性**：直接连接数
2. **介数中心性**：控制信息流的能力
3. **接近中心性**：到达其他节点的速度
4. **特征向量中心性**：连接的重要性

### 舆情分析

#### 分析维度
1. **情感分析**：正面、负面、中性
2. **话题分析**：热点话题识别
3. **趋势分析**：舆情变化趋势
4. **传播分析**：信息传播路径

### 影响力分析

#### 影响力指标
1. **粉丝数**：关注者数量
2. **互动率**：点赞、评论、转发
3. **传播范围**：信息覆盖人数
4. **影响力得分**：综合影响力

### 内容传播分析

#### 传播模型
1. **级联模型**：信息逐层传播
2. **扩散模型**：信息随机传播
3. **病毒传播**：指数级增长

## 案例：社交媒体数据分析

假设我们有一个社交媒体数据集，需要：
1. 分析社交网络结构
2. 进行舆情分析
3. 识别关键影响者
4. 分析内容传播

## 应用场景

1. **品牌监控**：品牌声誉管理
2. **营销优化**：精准营销、KOL合作
3. **危机管理**：舆情预警、危机处理
4. **用户洞察**：用户画像、行为分析

## 代码案例

### 社交网络分析

```python
# 社交网络分析示例

import pandas as pd
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from collections import Counter

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟社交网络数据
np.random.seed(42)
n_users = 50

# 生成用户数据
users = [f'用户{i+1}' for i in range(n_users)]

# 生成关注关系（边）
edges = []
for i in range(n_users):
    # 每个用户随机关注3-8个其他用户
    n_follows = np.random.randint(3, 9)
    follows = np.random.choice([u for u in users if u != users[i]], n_follows, replace=False)
    for follow in follows:
        edges.append((users[i], follow))

# 创建图
G = nx.DiGraph()
G.add_nodes_from(users)
G.add_edges_from(edges)

print(f"社交网络信息:")
print(f"节点数: {G.number_of_nodes()}")
print(f"边数: {G.number_of_edges()}")
print(f"网络密度: {nx.density(G):.4f}")

# 2. 计算中心性指标
print("\n中心性指标:")
print("=" * 50)

# 度中心性
degree_centrality = nx.degree_centrality(G)
in_degree_centrality = nx.in_degree_centrality(G)
out_degree_centrality = nx.out_degree_centrality(G)

# 介数中心性
betweenness_centrality = nx.betweenness_centrality(G)

# 接近中心性
closeness_centrality = nx.closeness_centrality(G)

# 特征向量中心性
try:
    eigenvector_centrality = nx.eigenvector_centrality(G, max_iter=1000)
except:
    eigenvector_centrality = {node: 0 for node in G.nodes()}

# 创建中心性DataFrame
centrality_df = pd.DataFrame({
    '用户': list(degree_centrality.keys()),
    '度中心性': list(degree_centrality.values()),
    '入度中心性': list(in_degree_centrality.values()),
    '出度中心性': list(out_degree_centrality.values()),
    '介数中心性': list(betweenness_centrality.values()),
    '接近中心性': list(closeness_centrality.values()),
    '特征向量中心性': list(eigenvector_centrality.values())
})

# 显示前10个用户
print("\n前10个用户的中心性指标:")
print(centrality_df.head(10))

# 3. 可视化网络
plt.figure(figsize=(12, 10))

# 节点大小基于度中心性
node_sizes = [v * 3000 for v in degree_centrality.values()]

# 节点颜色基于介数中心性
node_colors = list(betweenness_centrality.values())

# 布局
pos = nx.spring_layout(G, k=2, iterations=50)

# 绘制边
nx.draw_networkx_edges(G, pos, alpha=0.3, arrows=True, arrowsize=10)

# 绘制节点
nodes = nx.draw_networkx_nodes(G, pos, node_size=node_sizes, node_color=node_colors, 
                               cmap=plt.cm.YlOrRd, alpha=0.8)

# 绘制标签
nx.draw_networkx_labels(G, pos, font_size=8, font_family='SimHei')

plt.colorbar(nodes, label='介数中心性')
plt.title('社交网络图', fontsize=16, fontweight='bold')
plt.axis('off')
plt.show()

# 4. 网络社区检测
print("\n社区检测:")
print("=" * 50)

# 使用Louvain方法检测社区
from community import community_louvain

# 转换为无向图进行社区检测
G_undirected = G.to_undirected()
partition = community_louvain.best_partition(G_undirected)

# 统计社区
community_counts = Counter(partition.values())
print(f"社区数量: {len(community_counts)}")
print(f"各社区大小: {community_counts}")

# 可视化社区
plt.figure(figsize=(12, 10))

# 节点颜色基于社区
node_colors = [partition[node] for node in G.nodes()]

# 绘制
pos = nx.spring_layout(G, k=2, iterations=50)
nx.draw_networkx_edges(G, pos, alpha=0.3, arrows=True, arrowsize=10)
nodes = nx.draw_networkx_nodes(G, pos, node_size=500, node_color=node_colors, 
                               cmap=plt.cm.Set3, alpha=0.8)
nx.draw_networkx_labels(G, pos, font_size=8, font_family='SimHei')

plt.colorbar(nodes, label='社区')
plt.title('社交网络社区检测', fontsize=16, fontweight='bold')
plt.axis('off')
plt.show()

# 5. 关键节点识别
print("\n关键节点识别:")
print("=" * 50)

# 综合评分
centrality_df['综合得分'] = (
    centrality_df['度中心性'] * 0.3 +
    centrality_df['介数中心性'] * 0.3 +
    centrality_df['接近中心性'] * 0.2 +
    centrality_df['特征向量中心性'] * 0.2
)

# 排序
key_nodes = centrality_df.sort_values('综合得分', ascending=False).head(10)
print("\n前10个关键节点:")
print(key_nodes[['用户', '综合得分']])
```

### 舆情分析

```python
# 舆情分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import jieba
from snownlp import SnowNLP
from collections import Counter
from datetime import datetime, timedelta

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟社交媒体数据
np.random.seed(42)
n_posts = 1000

# 生成帖子数据
users = [f'用户{np.random.randint(1, 101)}' for _ in range(n_posts)]
topics = np.random.choice(['科技', '娱乐', '体育', '政治', '经济'], n_posts)
dates = [datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 30)) 
         for _ in range(n_posts)]

# 生成模拟文本
positive_texts = [
    "这个产品真是太棒了，强烈推荐！",
    "服务态度很好，非常满意！",
    "质量很好，物超所值！",
    "体验非常棒，下次还会购买！"
]

negative_texts = [
    "质量太差了，非常失望！",
    "服务态度很差，不推荐！",
    "价格太贵，不值得！"
    "体验很差，不会再来了！"
]

neutral_texts = [
    "产品一般，没什么特别的。",
    "还可以吧，中规中矩。",
    "普通产品，没有惊喜。"
]

texts = []
for _ in range(n_posts):
    rand = np.random.random()
    if rand < 0.5:
        texts.append(np.random.choice(positive_texts))
    elif rand < 0.8:
        texts.append(np.random.choice(negative_texts))
    else:
        texts.append(np.random.choice(neutral_texts))

df = pd.DataFrame({
    '用户': users,
    '文本': texts,
    '话题': topics,
    '日期': dates
})

print("社交媒体数据:")
print(df.head())
print(f"\n数据形状: {df.shape}")

# 2. 情感分析
print("\n情感分析:")
print("=" * 50)

def get_sentiment(text):
    """获取情感分数"""
    try:
        s = SnowNLP(text)
        return s.sentiments
    except:
        return 0.5

df['情感分数'] = df['文本'].apply(get_sentiment)
df['情感标签'] = df['情感分数'].apply(lambda x: '正面' if x > 0.6 else ('负面' if x < 0.4 else '中性'))

# 情感分布
sentiment_counts = df['情感标签'].value_counts()
print("\n情感分布:")
print(sentiment_counts)

# 可视化情感分布
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 饼图
axes[0].pie(sentiment_counts, labels=sentiment_counts.index, autopct='%1.1f%%',
            colors=['#ff9999', '#66b3ff', '#99ff99'], startangle=90)
axes[0].set_title('情感分布', fontsize=14, fontweight='bold')

# 柱状图
axes[1].bar(sentiment_counts.index, sentiment_counts.values, 
            color=['#ff9999', '#66b3ff', '#99ff99'], edgecolor='black')
axes[1].set_title('情感计数', fontsize=14, fontweight='bold')
axes[1].set_ylabel('数量')

plt.tight_layout()
plt.show()

# 3. 话题分析
print("\n话题分析:")
print("=" * 50)

# 按话题统计
topic_stats = df.groupby('话题').agg({
    '用户': 'count',
    '情感分数': 'mean'
}).rename(columns={'用户': '帖子数', '情感分数': '平均情感'})

print("\n话题统计:")
print(topic_stats)

# 可视化话题分析
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 话题分布
axes[0].bar(topic_stats.index, topic_stats['帖子数'], color='skyblue', edgecolor='black')
axes[0].set_title('话题分布', fontsize=14, fontweight='bold')
axes[0].set_ylabel('帖子数')
axes[0].tick_params(axis='x', rotation=45)

# 话题情感
axes[1].bar(topic_stats.index, topic_stats['平均情感'], color='lightcoral', edgecolor='black')
axes[1].axhline(y=0.5, color='r', linestyle='--', label='中性线')
axes[1].set_title('话题平均情感', fontsize=14, fontweight='bold')
axes[1].set_ylabel('平均情感')
axes[1].tick_params(axis='x', rotation=45)
axes[1].legend()

plt.tight_layout()
plt.show()

# 4. 时间趋势分析
print("\n时间趋势分析:")
print("=" * 50)

# 按日期统计
daily_stats = df.groupby('日期').agg({
    '用户': 'count',
    '情感分数': 'mean'
}).rename(columns={'用户': '帖子数', '情感分数': '平均情感'})

# 可视化时间趋势
fig, axes = plt.subplots(2, 1, figsize=(14, 10))

axes[0].plot(daily_stats.index, daily_stats['帖子数'], 'b-', linewidth=2)
axes[0].set_title('每日帖子数', fontsize=14, fontweight='bold')
axes[0].set_ylabel('帖子数')
axes[0].grid(True, alpha=0.3)

axes[1].plot(daily_stats.index, daily_stats['平均情感'], 'r-', linewidth=2)
axes[1].axhline(y=0.5, color='g', linestyle='--', label='中性线')
axes[1].set_title('每日平均情感', fontsize=14, fontweight='bold')
axes[1].set_ylabel('平均情感')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 5. 词频分析
print("\n词频分析:")
print("=" * 50)

# 分词
def chinese_segment(text):
    return ' '.join(jieba.cut(text))

df['分词后'] = df['文本'].apply(chinese_segment)

# 合并所有文本
all_words = ' '.join(df['分词后']).split()
word_counts = Counter(all_words)

# 停用词
stopwords = set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'])

# 过滤停用词
filtered_words = [word for word in all_words if word not in stopwords and len(word) > 1]
filtered_counts = Counter(filtered_words)

print("\n前20个高频词:")
for word, count in filtered_counts.most_common(20):
    print(f"{word}: {count}")

# 可视化词频
top_words = filtered_counts.most_common(15)
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
```

### 影响力分析

```python
# 影响力分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import networkx as nx

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟用户数据
np.random.seed(42)
n_users = 100

# 生成用户数据
user_data = {
    '用户ID': [f'用户{i+1}' for i in range(n_users)],
    '粉丝数': np.random.exponential(1000, n_users).astype(int),
    '关注数': np.random.exponential(500, n_users).astype(int),
    '帖子数': np.random.randint(10, 1000, n_users),
    '获赞数': np.random.exponential(5000, n_users).astype(int),
    '评论数': np.random.exponential(1000, n_users).astype(int),
    '转发数': np.random.exponential(500, n_users).astype(int)
}

df = pd.DataFrame(user_data)

# 计算衍生指标
df['互动数'] = df['获赞数'] + df['评论数'] + df['转发数']
df['互动率'] = df['互动数'] / df['粉丝数']
df['内容频率'] = df['帖子数'] / 30  # 假设30天

print("用户数据:")
print(df.head())
print(f"\n数据形状: {df.shape}")

# 2. 影响力评分
print("\n影响力评分:")
print("=" * 50)

# 标准化指标
from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler()
features = ['粉丝数', '互动数', '互动率', '内容频率']
df_scaled = pd.DataFrame(scaler.fit_transform(df[features]), columns=features)

# 计算综合影响力得分
weights = {
    '粉丝数': 0.3,
    '互动数': 0.3,
    '互动率': 0.2,
    '内容频率': 0.2
}

df['影响力得分'] = sum(df_scaled[feature] * weight for feature, weight in weights.items())

# 排序
top_influencers = df.sort_values('影响力得分', ascending=False).head(20)

print("\n前20个影响力用户:")
print(top_influencers[['用户ID', '粉丝数', '互动数', '互动率', '影响力得分']])

# 3. 可视化影响力分布
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 粉丝数分布
axes[0, 0].hist(df['粉丝数'], bins=30, color='skyblue', edgecolor='black')
axes[0, 0].set_title('粉丝数分布', fontsize=14, fontweight='bold')
axes[0, 0].set_xlabel('粉丝数')
axes[0, 0].set_ylabel('用户数')

# 互动数分布
axes[0, 1].hist(df['互动数'], bins=30, color='lightcoral', edgecolor='black')
axes[0, 1].set_title('互动数分布', fontsize=14, fontweight='bold')
axes[0, 1].set_xlabel('互动数')
axes[0, 1].set_ylabel('用户数')

# 互动率分布
axes[1, 0].hist(df['互动率'], bins=30, color='lightgreen', edgecolor='black')
axes[1, 0].set_title('互动率分布', fontsize=14, fontweight='bold')
axes[1, 0].set_xlabel('互动率')
axes[1, 0].set_ylabel('用户数')

# 影响力得分分布
axes[1, 1].hist(df['影响力得分'], bins=30, color='gold', edgecolor='black')
axes[1, 1].set_title('影响力得分分布', fontsize=14, fontweight='bold')
axes[1, 1].set_xlabel('影响力得分')
axes[1, 1].set_ylabel('用户数')

plt.suptitle('用户影响力分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 4. 影响力与粉丝数关系
plt.figure(figsize=(10, 8))
plt.scatter(df['粉丝数'], df['影响力得分'], alpha=0.6, color='skyblue', edgecolors='black')
plt.title('粉丝数与影响力关系', fontsize=16, fontweight='bold')
plt.xlabel('粉丝数')
plt.ylabel('影响力得分')
plt.grid(True, alpha=0.3)
plt.show()

# 5. 用户分群
from sklearn.cluster import KMeans

# 选择分群特征
cluster_features = ['粉丝数', '互动数', '互动率']
X = df[cluster_features]

# 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# K-means聚类
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
df['用户分群'] = kmeans.fit_predict(X_scaled)

# 分析各分群
cluster_stats = df.groupby('用户分群')[cluster_features].mean()
print("\n用户分群统计:")
print(cluster_stats)

# 可视化分群
plt.figure(figsize=(10, 8))
colors = ['red', 'blue', 'green', 'orange']
for i in range(4):
    mask = df['用户分群'] == i
    plt.scatter(df.loc[mask, '粉丝数'], df.loc[mask, '影响力得分'], 
                c=colors[i], label=f'分群{i}', alpha=0.6, edgecolors='black')

plt.title('用户分群', fontsize=16, fontweight='bold')
plt.xlabel('粉丝数')
plt.ylabel('影响力得分')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 6. 关键意见领袖(KOL)识别
print("\n关键意见领袖(KOL)识别:")
print("=" * 50)

# 定义KOL标准
def identify_kol(row):
    """识别KOL"""
    if row['粉丝数'] > df['粉丝数'].quantile(0.9) and row['影响力得分'] > df['影响力得分'].quantile(0.8):
        return '头部KOL'
    elif row['粉丝数'] > df['粉丝数'].quantile(0.7) and row['影响力得分'] > df['影响力得分'].quantile(0.6):
        return '腰部KOL'
    elif row['粉丝数'] > df['粉丝数'].quantile(0.5) and row['影响力得分'] > df['影响力得分'].quantile(0.4):
        return '尾部KOL'
    else:
        return '普通用户'

df['用户类型'] = df.apply(identify_kol, axis=1)

# 统计各类型用户
user_type_counts = df['用户类型'].value_counts()
print("\n用户类型分布:")
print(user_type_counts)

# 可视化用户类型
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 饼图
axes[0].pie(user_type_counts, labels=user_type_counts.index, autopct='%1.1f%%',
            colors=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'], startangle=90)
axes[0].set_title('用户类型分布', fontsize=14, fontweight='bold')

# 柱状图
axes[1].bar(user_type_counts.index, user_type_counts.values, 
            color=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'], edgecolor='black')
axes[1].set_title('用户类型计数', fontsize=14, fontweight='bold')
axes[1].set_ylabel('数量')

plt.tight_layout()
plt.show()
```

### 内容传播分析

```python
# 内容传播分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import networkx as nx
from datetime import datetime, timedelta

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟传播数据
np.random.seed(42)
n_events = 1000

# 生成传播事件
event_data = {
    '事件ID': range(1, n_events + 1),
    '原始用户': [f'用户{np.random.randint(1, 51)}' for _ in range(n_events)],
    '转发用户': [f'用户{np.random.randint(1, 101)}' for _ in range(n_events)],
    '时间': [datetime(2024, 1, 1) + timedelta(hours=np.random.randint(0, 720)) 
             for _ in range(n_events)],
    '内容类型': np.random.choice(['科技', '娱乐', '体育', '政治', '经济'], n_events)
}

df = pd.DataFrame(event_data)

# 计算传播深度
df['传播深度'] = np.random.randint(1, 6, n_events)  # 1-5层传播

print("传播数据:")
print(df.head())
print(f"\n数据形状: {df.shape}")

# 2. 传播网络构建
print("\n传播网络构建:")
print("=" * 50)

# 创建传播图
G = nx.DiGraph()

# 添加边
for _, row in df.iterrows():
    G.add_edge(row['原始用户'], row['转发用户'], 
               time=row['时间'], depth=row['传播深度'])

print(f"节点数: {G.number_of_nodes()}")
print(f"边数: {G.number_of_edges()}")

# 3. 传播路径分析
print("\n传播路径分析:")
print("=" * 50)

# 计算传播深度分布
depth_counts = df['传播深度'].value_counts().sort_index()
print("\n传播深度分布:")
print(depth_counts)

# 可视化传播深度
plt.figure(figsize=(10, 6))
plt.bar(depth_counts.index, depth_counts.values, color='skyblue', edgecolor='black')
plt.title('传播深度分布', fontsize=16, fontweight='bold')
plt.xlabel('传播深度')
plt.ylabel('事件数')
plt.grid(True, alpha=0.3, axis='y')
plt.show()

# 4. 传播速度分析
print("\n传播速度分析:")
print("=" * 50)

# 计算传播速度（事件/小时）
df['时间小时'] = df['时间'].dt.hour
hourly_counts = df.groupby('时间小时').size()

plt.figure(figsize=(10, 6))
plt.plot(hourly_counts.index, hourly_counts.values, 'b-', linewidth=2, marker='o')
plt.title('每小时传播事件数', fontsize=16, fontweight='bold')
plt.xlabel('小时')
plt.ylabel('事件数')
plt.grid(True, alpha=0.3)
plt.show()

# 5. 内容类型传播分析
print("\n内容类型传播分析:")
print("=" * 50)

# 按内容类型统计
content_stats = df.groupby('内容类型').agg({
    '事件ID': 'count',
    '传播深度': 'mean'
}).rename(columns={'事件ID': '事件数', '传播深度': '平均传播深度'})

print("\n内容类型统计:")
print(content_stats)

# 可视化内容类型分析
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 事件数
axes[0].bar(content_stats.index, content_stats['事件数'], color='skyblue', edgecolor='black')
axes[0].set_title('各内容类型事件数', fontsize=14, fontweight='bold')
axes[0].set_ylabel('事件数')
axes[0].tick_params(axis='x', rotation=45)

# 平均传播深度
axes[1].bar(content_stats.index, content_stats['平均传播深度'], color='lightcoral', edgecolor='black')
axes[1].set_title('各内容类型平均传播深度', fontsize=14, fontweight='bold')
axes[1].set_ylabel('平均传播深度')
axes[1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.show()

# 6. 关键传播节点
print("\n关键传播节点:")
print("=" * 50)

# 计算出度（转发次数）
out_degree = dict(G.out_degree())
top_spreaders = sorted(out_degree.items(), key=lambda x: x[1], reverse=True)[:10]

print("\n前10个关键传播节点:")
for user, degree in top_spreaders:
    print(f"{user}: 转发次数 {degree}")

# 7. 传播级联分析
print("\n传播级联分析:")
print("=" * 50)

# 找到传播树
def get_cascade_size(G, start_node):
    """获取传播级联大小"""
    visited = set()
    queue = [start_node]
    while queue:
        node = queue.pop(0)
        if node not in visited:
            visited.add(node)
            queue.extend(G.successors(node))
    return len(visited)

# 找到最大的传播级联
cascade_sizes = {}
for node in G.nodes():
    if G.in_degree(node) == 0:  # 原始节点
        cascade_sizes[node] = get_cascade_size(G, node)

top_cascades = sorted(cascade_sizes.items(), key=lambda x: x[1], reverse=True)[:5]
print("\n最大的传播级联:")
for node, size in top_cascades:
    print(f"{node}: 级联大小 {size}")

# 8. 可视化传播网络
plt.figure(figsize=(14, 10))

# 节点大小基于出度
node_sizes = [out_degree.get(node, 0) * 50 + 100 for node in G.nodes()]

# 节点颜色基于入度
in_degree = dict(G.in_degree())
node_colors = [in_degree.get(node, 0) for node in G.nodes()]

# 布局
pos = nx.spring_layout(G, k=1, iterations=50)

# 绘制
nx.draw_networkx_edges(G, pos, alpha=0.2, arrows=True, arrowsize=5)
nodes = nx.draw_networkx_nodes(G, pos, node_size=node_sizes, node_color=node_colors, 
                               cmap=plt.cm.YlOrRd, alpha=0.8)
nx.draw_networkx_labels(G, pos, font_size=6, font_family='SimHei')

plt.colorbar(nodes, label='入度')
plt.title('传播网络图', fontsize=16, fontweight='bold')
plt.axis('off')
plt.show()
```

## 课后练习

### 练习1：社交网络分析
1. 构建社交网络图
2. 计算中心性指标
3. 进行社区检测
4. 识别关键节点

### 练习2：舆情分析
1. 进行情感分析
2. 进行话题分析
3. 分析时间趋势
4. 进行词频分析

### 练习3：影响力分析
1. 计算影响力指标
2. 进行用户分群
3. 识别KOL
4. 分析影响力分布

### 练习4：内容传播分析
1. 构建传播网络
2. 分析传播路径
3. 分析传播速度
4. 识别关键传播节点

## 常见问题

### Q1: 如何处理大规模社交网络数据？
A: 可以尝试：
1. 使用采样方法
2. 使用分布式计算
3. 使用图数据库
4. 优化算法复杂度

### Q2: 如何提高情感分析准确率？
A: 可以尝试：
1. 使用预训练模型
2. 增加训练数据
3. 使用领域特定词典
4. 结合多种方法

### Q3: 如何识别水军？
A: 可以尝试：
1. 分析行为模式
2. 检测异常账号
3. 分析内容相似度
4. 使用机器学习

### Q4: 如何处理虚假信息？
A: 可以尝试：
1. 事实核查
2. 来源验证
3. 传播模式分析
4. 用户举报

### Q5: 社交媒体分析需要什么技能？
A: 需要掌握：
1. 网络分析
2. 文本分析
3. 机器学习
4. 可视化技术

## 下一步学习

完成今天的学习后，建议你：
1. 练习处理真实的社交媒体数据
2. 掌握网络分析技术
3. 学习舆情分析方法
4. 准备进入Day 14的学习：医疗数据分析实战

明天我们将学习医疗数据分析，这是数据分析的重要应用领域。