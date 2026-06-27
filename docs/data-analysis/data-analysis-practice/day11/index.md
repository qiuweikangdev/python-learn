# Day 11: 电商数据分析实战

## 学习目标

完成今天的学习后，你将能够：
- 分析电商用户行为数据
- 进行销售数据分析
- 构建用户画像
- 了解推荐系统基础

## 技术原理

### 用户行为分析

#### 关键指标
1. **PV（页面浏览量）**：页面被访问的次数
2. **UV（独立访客数）**：访问网站的独立用户数
3. **转化率**：完成目标行为的用户比例
4. **留存率**：在特定时间段内返回的用户比例

#### 用户行为漏斗
1. **浏览**：用户访问页面
2. **点击**：用户点击商品
3. **加购**：用户将商品加入购物车
4. **下单**：用户提交订单
5. **支付**：用户完成支付

### 销售数据分析

#### 关键指标
1. **GMV（商品交易总额）**：所有订单的总金额
2. **客单价**：平均每个订单的金额
3. **复购率**：重复购买的用户比例
4. **退货率**：退货订单的比例

### 用户画像

#### 维度
1. **人口统计**：年龄、性别、地域
2. **行为特征**：浏览、购买、偏好
3. **价值特征**：消费金额、频率、最近购买时间
4. **兴趣特征**：品类偏好、品牌偏好

### 推荐系统基础

#### 方法
1. **基于内容**：推荐相似内容
2. **协同过滤**：基于用户行为
3. **混合推荐**：结合多种方法

## 案例：电商数据分析

假设我们有一个电商数据集，需要：
1. 分析用户行为
2. 分析销售趋势
3. 构建用户画像
4. 实现简单的推荐

## 应用场景

1. **运营优化**：提高转化率、降低流失率
2. **精准营销**：个性化推荐、定向促销
3. **库存管理**：需求预测、库存优化
4. **用户体验**：个性化界面、优化流程

## 代码案例

### 用户行为分析

```python
# 用户行为分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟电商数据
np.random.seed(42)
n_users = 1000
n_events = 10000

# 生成用户数据
user_ids = np.random.randint(1, n_users + 1, n_events)
event_types = np.random.choice(['浏览', '点击', '加购', '下单', '支付'], 
                               n_events, p=[0.5, 0.3, 0.1, 0.07, 0.03])
categories = np.random.choice(['电子产品', '服装', '食品', '家居', '美妆'], n_events)
dates = [datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 30)) 
         for _ in range(n_events)]

# 创建DataFrame
df = pd.DataFrame({
    '用户ID': user_ids,
    '事件类型': event_types,
    '商品类别': categories,
    '日期': dates
})

print("用户行为数据:")
print(df.head())
print(f"\n数据形状: {df.shape}")

# 2. 用户行为统计
print("\n用户行为统计:")
print("=" * 50)

# 各事件类型统计
event_counts = df['事件类型'].value_counts()
print("\n各事件类型数量:")
print(event_counts)

# 可视化事件分布
plt.figure(figsize=(10, 6))
bars = plt.bar(event_counts.index, event_counts.values, color='skyblue', edgecolor='black')
plt.title('用户行为分布', fontsize=16, fontweight='bold')
plt.xlabel('事件类型')
plt.ylabel('数量')

# 添加数值标签
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
             f'{height}',
             ha='center', va='bottom')

plt.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.show()

# 3. 用户行为漏斗
print("\n用户行为漏斗:")
print("=" * 50)

# 计算各阶段用户数
funnel_data = {}
for event in ['浏览', '点击', '加购', '下单', '支付']:
    funnel_data[event] = df[df['事件类型'] == event]['用户ID'].nunique()

# 计算转化率
funnel_df = pd.DataFrame({
    '阶段': list(funnel_data.keys()),
    '用户数': list(funnel_data.values())
})
funnel_df['转化率'] = funnel_df['用户数'] / funnel_df['用户数'].iloc[0] * 100
funnel_df['阶段转化率'] = funnel_df['用户数'] / funnel_df['用户数'].shift(1) * 100

print(funnel_df)

# 可视化漏斗
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 漏斗图
axes[0].barh(funnel_df['阶段'][::-1], funnel_df['用户数'][::-1], color='skyblue', edgecolor='black')
axes[0].set_title('用户行为漏斗', fontsize=14, fontweight='bold')
axes[0].set_xlabel('用户数')

# 转化率图
axes[1].plot(funnel_df['阶段'], funnel_df['转化率'], 'ro-', linewidth=2, markersize=8)
axes[1].set_title('转化率趋势', fontsize=14, fontweight='bold')
axes[1].set_ylabel('转化率 (%)')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 4. 按类别分析
print("\n按类别分析:")
print("=" * 50)

category_stats = df.groupby('商品类别').agg({
    '用户ID': 'nunique',
    '事件类型': 'count'
}).rename(columns={'用户ID': '独立用户数', '事件类型': '事件总数'})

print(category_stats)

# 可视化类别分布
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 独立用户数
axes[0].bar(category_stats.index, category_stats['独立用户数'], color='skyblue', edgecolor='black')
axes[0].set_title('各类别独立用户数', fontsize=14, fontweight='bold')
axes[0].set_ylabel('用户数')
axes[0].tick_params(axis='x', rotation=45)

# 事件总数
axes[1].bar(category_stats.index, category_stats['事件总数'], color='lightcoral', edgecolor='black')
axes[1].set_title('各类别事件总数', fontsize=14, fontweight='bold')
axes[1].set_ylabel('事件数')
axes[1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.show()

# 5. 时间趋势分析
print("\n时间趋势分析:")
print("=" * 50)

# 按日期统计
daily_stats = df.groupby('日期').agg({
    '用户ID': 'nunique',
    '事件类型': 'count'
}).rename(columns={'用户ID': '独立用户数', '事件类型': '事件总数'})

# 可视化时间趋势
fig, axes = plt.subplots(2, 1, figsize=(14, 10))

axes[0].plot(daily_stats.index, daily_stats['独立用户数'], 'b-', linewidth=2)
axes[0].set_title('每日独立用户数', fontsize=14, fontweight='bold')
axes[0].set_ylabel('用户数')
axes[0].grid(True, alpha=0.3)

axes[1].plot(daily_stats.index, daily_stats['事件总数'], 'r-', linewidth=2)
axes[1].set_title('每日事件总数', fontsize=14, fontweight='bold')
axes[1].set_ylabel('事件数')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 销售数据分析

```python
# 销售数据分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟销售数据
np.random.seed(42)
n_orders = 5000

# 生成订单数据
order_ids = range(1, n_orders + 1)
user_ids = np.random.randint(1, 501, n_orders)
products = np.random.choice(['手机', '电脑', '平板', '耳机', '手表'], n_orders)
categories = np.random.choice(['电子产品', '配件'], n_prices = np.random.uniform(100, 5000, n_orders)
quantities = np.random.randint(1, 6, n_orders)
dates = [datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 365)) 
         for _ in range(n_orders)]

df = pd.DataFrame({
    '订单ID': order_ids,
    '用户ID': user_ids,
    '商品': products,
    '类别': categories,
    '单价': prices,
    '数量': quantities,
    '日期': dates
})

# 计算订单金额
df['订单金额'] = df['单价'] * df['数量']

print("销售数据:")
print(df.head())
print(f"\n数据形状: {df.shape}")

# 2. 销售概览
print("\n销售概览:")
print("=" * 50)

total_orders = len(df)
total_revenue = df['订单金额'].sum()
avg_order_value = df['订单金额'].mean()
unique_customers = df['用户ID'].nunique()

print(f"总订单数: {total_orders}")
print(f"总收入: {total_revenue:,.2f}")
printf"平均订单金额: {avg_order_value:,.2f}")
print(f"独立客户数: {unique_customers}")

# 3. 按产品分析
print("\n按产品分析:")
print("=" * 50)

product_stats = df.groupby('商品').agg({
    '订单ID': 'count',
    '订单金额': 'sum',
    '数量': 'sum'
}).rename(columns={'订单ID': '订单数', '订单金额': '总收入', '数量': '总销量'})

product_stats['平均订单金额'] = product_stats['总收入'] / product_stats['订单数']
product_stats = product_stats.sort_values('总收入', ascending=False)

print(product_stats)

# 可视化产品销售
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 订单数
axes[0, 0].bar(product_stats.index, product_stats['订单数'], color='skyblue', edgecolor='black')
axes[0, 0].set_title('各产品订单数', fontsize=14, fontweight='bold')
axes[0, 0].set_ylabel('订单数')
axes[0, 0].tick_params(axis='x', rotation=45)

# 总收入
axes[0, 1].bar(product_stats.index, product_stats['总收入'], color='lightcoral', edgecolor='black')
axes[0, 1].set_title('各产品总收入', fontsize=14, fontweight='bold')
axes[0, 1].set_ylabel('收入')
axes[0, 1].tick_params(axis='x', rotation=45)

# 总销量
axes[1, 0].bar(product_stats.index, product_stats['总销量'], color='lightgreen', edgecolor='black')
axes[1, 0].set_title('各产品总销量', fontsize=14, fontweight='bold')
axes[1, 0].set_ylabel('销量')
axes[1, 0].tick_params(axis='x', rotation=45)

# 平均订单金额
axes[1, 1].bar(product_stats.index, product_stats['平均订单金额'], color='gold', edgecolor='black')
axes[1, 1].set_title('各产品平均订单金额', fontsize=14, fontweight='bold')
axes[1, 1].set_ylabel('金额')
axes[1, 1].tick_params(axis='x', rotation=45)

plt.suptitle('产品销售分析', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 4. 按时间分析
print("\n按时间分析:")
print("=" * 50)

# 按月统计
df['月份'] = df['日期'].dt.to_period('M')
monthly_stats = df.groupby('月份').agg({
    '订单ID': 'count',
    '订单金额': 'sum',
    '用户ID': 'nunique'
}).rename(columns={'订单ID': '订单数', '订单金额': '收入', '用户ID': '客户数'})

print(monthly_stats)

# 可视化月度趋势
fig, axes = plt.subplots(3, 1, figsize=(14, 12))

axes[0].plot(monthly_stats.index.astype(str), monthly_stats['订单数'], 'b-', linewidth=2)
axes[0].set_title('月度订单数', fontsize=14, fontweight='bold')
axes[0].set_ylabel('订单数')
axes[0].tick_params(axis='x', rotation=45)
axes[0].grid(True, alpha=0.3)

axes[1].plot(monthly_stats.index.astype(str), monthly_stats['收入'], 'r-', linewidth=2)
axes[1].set_title('月度收入', fontsize=14, fontweight='bold')
axes[1].set_ylabel('收入')
axes[1].tick_params(axis='x', rotation=45)
axes[1].grid(True, alpha=0.3)

axes[2].plot(monthly_stats.index.astype(str), monthly_stats['客户数'], 'g-', linewidth=2)
axes[2].set_title('月度客户数', fontsize=14, fontweight='bold')
axes[2].set_ylabel('客户数')
axes[2].tick_params(axis='x', rotation=45)
axes[2].grid(True, alpha=0.3)

plt.suptitle('月度销售趋势', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 5. 客户价值分析
print("\n客户价值分析:")
print("=" * 50)

# 计算RFM指标
current_date = df['日期'].max() + timedelta(days=1)

rfm = df.groupby('用户ID').agg({
    '日期': lambda x: (current_date - x.max()).days,  # 最近购买天数
    '订单ID': 'count',  # 购买次数
    '订单金额': 'sum'  # 总消费金额
}).rename(columns={
    '日期': 'R',
    '订单ID': 'F',
    '订单金额': 'M'
})

print("RFM统计:")
print(rfm.describe())

# 可视化RFM分布
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

axes[0].hist(rfm['R'], bins=20, color='skyblue', edgecolor='black')
axes[0].set_title('最近购买天数分布', fontsize=14, fontweight='bold')
axes[0].set_xlabel('天数')
axes[0].set_ylabel('客户数')

axes[1].hist(rfm['F'], bins=20, color='lightcoral', edgecolor='black')
axes[1].set_title('购买次数分布', fontsize=14, fontweight='bold')
axes[1].set_xlabel('次数')
axes[1].set_ylabel('客户数')

axes[2].hist(rfm['M'], bins=20, color='lightgreen', edgecolor='black')
axes[2].set_title('消费金额分布', fontsize=14, fontweight='bold')
axes[2].set_xlabel('金额')
axes[2].set_ylabel('客户数')

plt.suptitle('客户RFM分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 用户画像构建

```python
# 用户画像构建示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟用户数据
np.random.seed(42)
n_users = 500

# 生成用户数据
user_data = {
    '用户ID': range(1, n_users + 1),
    '年龄': np.random.randint(18, 65, n_users),
    '性别': np.random.choice(['男', '女'], n_users),
    '注册天数': np.random.randint(30, 1000, n_users),
    '总消费': np.random.exponential(5000, n_users),
    '购买次数': np.random.randint(1, 50, n_users),
    '浏览时长': np.random.uniform(10, 300, n_users),
    '收藏商品数': np.random.randint(0, 50, n_users)
}

df = pd.DataFrame(user_data)

# 计算衍生指标
df['平均订单金额'] = df['总消费'] / df['购买次数']
df['购买频率'] = df['购买次数'] / df['注册天数'] * 30  # 月均购买次数

print("用户数据:")
print(df.head())
print(f"\n数据形状: {df.shape}")

# 2. 用户分群
print("\n用户分群:")
print("=" * 50)

# 选择分群特征
features = ['总消费', '购买次数', '浏览时长', '收藏商品数']
X = df[features]

# 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 使用K-means聚类
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
df['用户分群'] = kmeans.fit_predict(X_scaled)

# 分析各分群特征
cluster_stats = df.groupby('用户分群')[features].mean()
print("\n各分群特征均值:")
print(cluster_stats)

# 可视化分群结果
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

for i, feature in enumerate(features):
    row = i // 2
    col = i % 2
    
    for cluster in range(4):
        mask = df['用户分群'] == cluster
        axes[row, col].hist(df.loc[mask, feature], bins=20, alpha=0.5, label=f'分群{cluster}')
    
    axes[row, col].set_title(f'{feature}分布', fontsize=14, fontweight='bold')
    axes[row, col].set_xlabel(feature)
    axes[row, col].set_ylabel('用户数')
    axes[row, col].legend()

plt.suptitle('用户分群特征分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 3. 用户价值分析
print("\n用户价值分析:")
print("=" * 50)

# 计算RFM指标
df['最近购买天数'] = np.random.randint(1, 90, n_users)  # 模拟数据
df['R_score'] = pd.qcut(df['最近购买天数'], 4, labels=[4, 3, 2, 1])
df['F_score'] = pd.qcut(df['购买次数'].rank(method='first'), 4, labels=[1, 2, 3, 4])
df['M_score'] = pd.qcut(df['总消费'], 4, labels=[1, 2, 3, 4])

# 计算RFM总分
df['RFM_score'] = df['R_score'].astype(int) + df['F_score'].astype(int) + df['M_score'].astype(int)

# 用户价值分群
def rfm_segment(score):
    if score >= 10:
        return '高价值'
    elif score >= 7:
        return '中价值'
    elif score >= 4:
        return '低价值'
    else:
        return '流失风险'

df['价值分群'] = df['RFM_score'].apply(rfm_segment)

# 统计各价值分群
value_counts = df['价值分群'].value_counts()
print("\n用户价值分群:")
print(value_counts)

# 可视化价值分群
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 饼图
axes[0].pie(value_counts, labels=value_counts.index, autopct='%1.1f%%',
            colors=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'], startangle=90)
axes[0].set_title('用户价值分群占比', fontsize=14, fontweight='bold')

# 柱状图
axes[1].bar(value_counts.index, value_counts.values, 
            color=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'], edgecolor='black')
axes[1].set_title('用户价值分群数量', fontsize=14, fontweight='bold')
axes[1].set_ylabel('用户数')

plt.tight_layout()
plt.show()

# 4. 用户画像标签
print("\n用户画像标签:")
print("=" * 50)

# 年龄分段
df['年龄段'] = pd.cut(df['年龄'], bins=[0, 25, 35, 45, 55, 100], 
                     labels=['18-25', '26-35', '36-45', '46-55', '55+'])

# 消费能力
df['消费能力'] = pd.cut(df['总消费'], bins=[0, 1000, 3000, 6000, 10000, float('inf')],
                       labels=['低', '中低', '中', '中高', '高'])

# 活跃度
df['活跃度'] = pd.cut(df['浏览时长'], bins=[0, 50, 100, 200, 300],
                      labels=['低', '中', '高', '非常高'])

print("\n用户画像示例:")
sample_users = df.head(10)[['用户ID', '年龄', '性别', '总消费', '购买次数', 
                            '用户分群', '价值分群', '年龄段', '消费能力', '活跃度']]
print(sample_users)

# 5. 画像分析
print("\n画像分析:")
print("=" * 50)

# 按性别分析
gender_stats = df.groupby('性别').agg({
    '总消费': 'mean',
    '购买次数': 'mean',
    '浏览时长': 'mean'
}).round(2)

print("\n按性别分析:")
print(gender_stats)

# 按年龄段分析
age_stats = df.groupby('年龄段').agg({
    '总消费': 'mean',
    '购买次数': 'mean',
    '浏览时长': 'mean'
}).round(2)

print("\n按年龄段分析:")
print(age_stats)

# 可视化画像分析
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 按性别消费
axes[0, 0].bar(gender_stats.index, gender_stats['总消费'], color=['skyblue', 'pink'], edgecolor='black')
axes[0, 0].set_title('不同性别平均消费', fontsize=14, fontweight='bold')
axes[0, 0].set_ylabel('平均消费')

# 按年龄段消费
axes[0, 1].bar(age_stats.index, age_stats['总消费'], color='lightcoral', edgecolor='black')
axes[0, 1].set_title('不同年龄段平均消费', fontsize=14, fontweight='bold')
axes[0, 1].set_ylabel('平均消费')
axes[0, 1].tick_params(axis='x', rotation=45)

# 消费能力分布
consumption_counts = df['消费能力'].value_counts()
axes[1, 0].bar(consumption_counts.index, consumption_counts.values, color='lightgreen', edgecolor='black')
axes[1, 0].set_title('消费能力分布', fontsize=14, fontweight='bold')
axes[1, 0].set_ylabel('用户数')

# 活跃度分布
activity_counts = df['活跃度'].value_counts()
axes[1, 1].bar(activity_counts.index, activity_counts.values, color='gold', edgecolor='black')
axes[1, 1].set_title('活跃度分布', fontsize=14, fontweight='bold')
axes[1, 1].set_ylabel('用户数')

plt.suptitle('用户画像分析', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 推荐系统基础

```python
# 推荐系统基础示例

import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split

# 1. 创建模拟评分数据
np.random.seed(42)
n_users = 100
n_items = 50

# 生成用户-物品评分矩阵
ratings = np.random.randint(0, 6, (n_users, n_items))
# 设置一些缺失值（0表示未评分）
mask = np.random.random((n_users, n_items)) > 0.3
ratings = ratings * mask

# 创建DataFrame
user_ids = [f'用户{i+1}' for i in range(n_users)]
item_ids = [f'商品{i+1}' for i in range(n_items)]

df = pd.DataFrame(ratings, index=user_ids, columns=item_ids)

print("用户-物品评分矩阵:")
print(df.head())
print(f"\n矩阵形状: {df.shape}")

# 2. 基于用户的协同过滤
print("\n基于用户的协同过滤:")
print("=" * 50)

# 计算用户相似度
user_similarity = cosine_similarity(df)
user_similarity_df = pd.DataFrame(user_similarity, index=user_ids, columns=user_ids)

print("用户相似度矩阵（前5x5）:")
print(user_similarity_df.iloc[:5, :5])

# 为用户推荐商品
def recommend_items(user_id, n_recommendations=5):
    """为用户推荐商品"""
    # 获取用户相似度
    similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:11]
    
    # 获取用户未评分的商品
    user_ratings = df.loc[user_id]
    unrated_items = user_ratings[user_ratings == 0].index
    
    # 计算预测评分
    predictions = {}
    for item in unrated_items:
        # 加权平均
        weighted_sum = 0
        similarity_sum = 0
        
        for similar_user, similarity in similar_users.items():
            if df.loc[similar_user, item] > 0:
                weighted_sum += similarity * df.loc[similar_user, item]
                similarity_sum += abs(similarity)
        
        if similarity_sum > 0:
            predictions[item] = weighted_sum / similarity_sum
    
    # 返回推荐结果
    recommendations = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
    return recommendations[:n_recommendations]

# 测试推荐
test_user = '用户1'
recommendations = recommend_items(test_user)
print(f"\n为{test_user}推荐的商品:")
for item, score in recommendations:
    print(f"  {item}: 预测评分 {score:.2f}")

# 3. 基于物品的协同过滤
print("\n基于物品的协同过滤:")
print("=" * 50)

# 计算物品相似度
item_similarity = cosine_similarity(df.T)
item_similarity_df = pd.DataFrame(item_similarity, index=item_ids, columns=item_ids)

print("物品相似度矩阵（前5x5）:")
print(item_similarity_df.iloc[:5, :5])

# 基于物品的推荐
def recommend_items_item_based(user_id, n_recommendations=5):
    """基于物品相似度推荐"""
    user_ratings = df.loc[user_id]
    rated_items = user_ratings[user_ratings > 0].index
    unrated_items = user_ratings[user_ratings == 0].index
    
    predictions = {}
    for item in unrated_items:
        weighted_sum = 0
        similarity_sum = 0
        
        for rated_item in rated_items:
            similarity = item_similarity_df.loc[item, rated_item]
            weighted_sum += similarity * user_ratings[rated_item]
            similarity_sum += abs(similarity)
        
        if similarity_sum > 0:
            predictions[item] = weighted_sum / similarity_sum
    
    recommendations = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
    return recommendations[:n_recommendations]

# 测试推荐
recommendations = recommend_items_item_based(test_user)
print(f"\n基于物品相似度为{test_user}推荐的商品:")
for item, score in recommendations:
    print(f"  {item}: 预测评分 {score:.2f}")

# 4. 推荐系统评估
print("\n推荐系统评估:")
print("=" * 50)

# 划分训练集和测试集
train_data = df.copy()
test_ratio = 0.2

# 随机选择一些评分作为测试集
test_mask = np.random.random(df.shape) < test_ratio
test_data = train_data * test_mask
train_data = train_data * (~test_mask)

print(f"训练集非零评分数量: {np.count_nonzero(train_data.values)}")
print(f"测试集非零评分数量: {np.count_nonzero(test_data.values)}")

# 计算均方根误差
def rmse(predictions, targets):
    """计算RMSE"""
    non_zero_mask = targets > 0
    return np.sqrt(np.mean((predictions[non_zero_mask] - targets[non_zero_mask]) ** 2))

# 简单预测（使用用户平均评分）
user_means = train_data.replace(0, np.nan).mean(axis=1)
predictions = np.tile(user_means.values.reshape(-1, 1), (1, n_items))

rmse_score = rmse(predictions, test_data.values)
print(f"\n基于用户平均评分的RMSE: {rmse_score:.4f}")
```

## 课后练习

### 练习1：用户行为分析
1. 分析用户行为漏斗
2. 计算转化率
3. 分析用户留存
4. 可视化用户行为

### 练习2：销售数据分析
1. 分析销售趋势
2. 计算关键指标
3. 进行产品分析
4. 进行客户分析

### 练习3：用户画像构建
1. 计算RFM指标
2. 进行用户分群
3. 创建用户标签
4. 分析用户画像

### 练习4：推荐系统
1. 实现基于用户的协同过滤
2. 实现基于物品的协同过滤
3. 评估推荐效果
4. 优化推荐算法

## 常见问题

### Q1: 如何提高用户转化率？
A: 可以尝试：
1. 优化用户体验
2. 个性化推荐
3. 精准营销
4. 优化流程

### Q2: 如何处理冷启动问题？
A: 可以尝试：
1. 基于内容的推荐
2. 热门商品推荐
3. 用户注册信息
4. 探索与利用

### Q3: 如何评估推荐系统效果？
A: 可以使用：
1. 准确率、召回率
2. RMSE、MAE
3. 点击率、转化率
4. A/B测试

### Q4: 如何处理稀疏数据？
A: 可以尝试：
1. 矩阵分解
2. 深度学习
3. 特征工程
4. 降维技术

### Q5: 如何保护用户隐私？
A: 可以尝试：
1. 数据脱敏
2. 差分隐私
3. 联邦学习
4. 匿名化处理

## 下一步学习

完成今天的学习后，建议你：
1. 练习处理真实的电商数据
2. 掌握用户行为分析方法
3. 学习推荐系统技术
4. 准备进入Day 12的学习：金融数据分析实战

明天我们将学习金融数据分析，这是数据分析的重要应用领域。