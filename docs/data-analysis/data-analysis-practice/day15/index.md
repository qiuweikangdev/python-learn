# Day 15: 完整项目实战与部署

## 学习目标

完成今天的学习后，你将能够：
- 规划完整的数据分析项目
- 进行数据采集和处理
- 完成数据分析和建模
- 展示分析结果并部署

## 技术原理

### 项目规划

#### 项目阶段
1. **需求分析**：明确项目目标和需求
2. **数据收集**：获取相关数据
3. **数据预处理**：清洗和转换数据
4. **探索性分析**：了解数据特征
5. **建模分析**：构建预测模型
6. **结果展示**：可视化展示结果
7. **部署上线**：部署到生产环境

### 数据采集

#### 数据来源
1. **内部数据**：数据库、日志文件
2. **外部数据**：API、爬虫
3. **公开数据集**：Kaggle、UCI
4. **第三方数据**：数据提供商

### 数据处理流程

#### ETL流程
1. **Extract**：数据抽取
2. **Transform**：数据转换
3. **Load**：数据加载

### 结果展示

#### 展示方式
1. **报告**：PDF、Word文档
2. **仪表板**：交互式可视化
3. **演示文稿**：PPT、Keynote
4. **网页应用**：Web应用

### 项目部署

#### 部署方式
1. **本地部署**：服务器部署
2. **云部署**：AWS、Azure、GCP
3. **容器化**：Docker、Kubernetes
4. **无服务器**：Serverless

## 案例：电商用户流失预测项目

我们将完成一个完整的电商用户流失预测项目：
1. 项目规划
2. 数据收集和处理
3. 探索性分析
4. 模型构建
5. 结果展示
6. 项目部署

## 应用场景

1. **商业智能**：销售预测、用户分析
2. **金融风控**：信用评分、欺诈检测
3. **医疗健康**：疾病预测、药物研发
4. **市场营销**：用户画像、精准营销

## 代码案例

### 项目规划

```python
# 项目规划示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 项目需求文档
project_plan = {
    '项目名称': '电商用户流失预测',
    '项目目标': '预测哪些用户可能流失，提前采取措施',
    '项目周期': '2024年1月-2024年3月',
    '项目团队': ['数据分析师', '数据工程师', '业务专家'],
    '关键指标': ['准确率', '召回率', 'F1分数'],
    '数据来源': ['用户行为日志', '交易数据', '用户画像'],
    '交付物': ['预测模型', '分析报告', '可视化仪表板']
}

print("项目规划:")
print("=" * 50)
for key, value in project_plan.items():
    print(f"{key}: {value}")

# 2. 项目时间线
timeline = pd.DataFrame({
    '阶段': ['需求分析', '数据收集', '数据预处理', '探索性分析', '模型构建', '结果展示', '部署上线'],
    '开始时间': ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-02-01', '2024-02-15', '2024-03-01'],
    '结束时间': ['2024-01-07', '2024-01-14', '2024-01-21', '2024-01-31', '2024-02-14', '2024-02-28', '2024-03-15'],
    '负责人': ['数据分析师', '数据工程师', '数据工程师', '数据分析师', '数据分析师', '数据分析师', '数据工程师']
})

print("\n项目时间线:")
print(timeline)

# 3. 项目风险评估
risks = pd.DataFrame({
    '风险': ['数据质量差', '模型性能不佳', '业务需求变更', '技术实现困难'],
    '可能性': ['中', '低', '高', '低'],
    '影响程度': ['高', '高', '中', '中'],
    '应对措施': ['数据清洗', '模型优化', '定期沟通', '技术预研']
})

print("\n项目风险评估:")
print(risks)

# 4. 可视化项目时间线
fig, ax = plt.subplots(figsize=(12, 6))

# 绘制甘特图
for i, row in timeline.iterrows():
    start = datetime.strptime(row['开始时间'], '%Y-%m-%d')
    end = datetime.strptime(row['结束时间'], '%Y-%m-%d')
    duration = (end - start).days
    
    ax.barh(i, duration, left=start, height=0.5, color='skyblue', edgecolor='black')
    ax.text(start + pd.Timedelta(days=duration/2), i, row['阶段'], 
            ha='center', va='center', fontsize=10, fontweight='bold')

ax.set_yticks(range(len(timeline)))
ax.set_yticklabels(timeline['阶段'])
ax.set_xlabel('时间')
ax.set_title('项目甘特图', fontsize=16, fontweight='bold')
ax.grid(True, alpha=0.3, axis='x')

plt.tight_layout()
plt.show()
```

### 数据收集和处理

```python
# 数据收集和处理示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟电商用户数据
np.random.seed(42)
n_users = 1000

# 生成用户数据
user_data = {
    '用户ID': range(1, n_users + 1),
    '注册日期': [datetime(2023, 1, 1) + timedelta(days=np.random.randint(0, 365)) 
                for _ in range(n_users)],
    '年龄': np.random.randint(18, 65, n_users),
    '性别': np.random.choice(['男', '女'], n_users),
    '城市等级': np.random.choice(['一线', '二线', '三线', '四线'], n_users, p=[0.3, 0.3, 0.2, 0.2]),
    '会员等级': np.random.choice(['普通', '银卡', '金卡', '钻石'], n_users, p=[0.5, 0.3, 0.15, 0.05])
}

df_users = pd.DataFrame(user_data)

# 生成行为数据
behavior_data = {
    '用户ID': np.random.choice(range(1, n_users + 1), 5000),
    '行为类型': np.random.choice(['浏览', '搜索', '加购', '下单', '支付'], 5000, p=[0.4, 0.3, 0.15, 0.1, 0.05]),
    '行为时间': [datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 30)) 
               for _ in range(5000)],
    '商品类别': np.random.choice(['电子产品', '服装', '食品', '家居', '美妆'], 5000)
}

df_behavior = pd.DataFrame(behavior_data)

# 生成交易数据
transaction_data = {
    '用户ID': np.random.choice(range(1, n_users + 1), 2000),
    '订单金额': np.random.exponential(200, 2000),
    '订单时间': [datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 30)) 
               for _ in range(2000)],
    '支付方式': np.random.choice(['支付宝', '微信', '银行卡', '信用卡'], 2000)
}

df_transactions = pd.DataFrame(transaction_data)

print("用户数据:")
print(df_users.head())
print(f"\n用户数据形状: {df_users.shape}")

print("\n行为数据:")
print(df_behavior.head())
print(f"\n行为数据形状: {df_behavior.shape}")

print("\n交易数据:")
print(df_transactions.head())
print(f"\n交易数据形状: {df_transactions.shape}")

# 2. 数据清洗
print("\n数据清洗:")
print("=" * 50)

# 检查缺失值
print("\n缺失值检查:")
print("用户数据缺失值:", df_users.isnull().sum().sum())
print("行为数据缺失值:", df_behavior.isnull().sum().sum())
print("交易数据缺失值:", df_transactions.isnull().sum().sum())

# 检查重复值
print("\n重复值检查:")
print("用户数据重复值:", df_users.duplicated().sum())
print("行为数据重复值:", df_behavior.duplicated().sum())
print("交易数据重复值:", df_transactions.duplicated().sum())

# 3. 特征工程
print("\n特征工程:")
print("=" * 50)

# 计算用户行为统计
user_behavior_stats = df_behavior.groupby('用户ID').agg({
    '行为类型': 'count',
    '商品类别': 'nunique'
}).rename(columns={
    '行为类型': '总行为次数',
    '商品类别': '浏览商品类别数'
})

# 计算用户交易统计
user_transaction_stats = df_transactions.groupby('用户ID').agg({
    '订单金额': ['sum', 'mean', 'count']
}).rename(columns={
    'sum': '总消费金额',
    'mean': '平均订单金额',
    'count': '订单数量'
})
user_transaction_stats.columns = ['总消费金额', '平均订单金额', '订单数量']

# 合并特征
user_features = df_users.merge(user_behavior_stats, on='用户ID', how='left')
user_features = user_features.merge(user_transaction_stats, on='用户ID', how='left')

# 填充缺失值
user_features = user_features.fillna(0)

# 计算衍生特征
user_features['注册天数'] = (datetime(2024, 1, 31) - user_features['注册日期']).dt.days
user_features['行为频率'] = user_features['总行为次数'] / user_features['注册天数']
user_features['消费频率'] = user_features['订单数量'] / user_features['注册天数']

print("\n用户特征:")
print(user_features.head())
print(f"\n特征数量: {user_features.shape[1]}")

# 4. 数据可视化
fig, axes = plt.subplots(2, 3, figsize=(15, 10))

# 年龄分布
axes[0, 0].hist(user_features['年龄'], bins=20, color='skyblue', edgecolor='black')
axes[0, 0].set_title('年龄分布', fontsize=14, fontweight='bold')
axes[0, 0].set_xlabel('年龄')
axes[0, 0].set_ylabel('用户数')

# 性别分布
gender_counts = user_features['性别'].value_counts()
axes[0, 1].pie(gender_counts, labels=gender_counts.index, autopct='%1.1f%%', colors=['skyblue', 'pink'])
axes[0, 1].set_title('性别分布', fontsize=14, fontweight='bold')

# 城市等级分布
city_counts = user_features['城市等级'].value_counts()
axes[0, 2].bar(city_counts.index, city_counts.values, color='lightcoral', edgecolor='black')
axes[0, 2].set_title('城市等级分布', fontsize=14, fontweight='bold')
axes[0, 2].set_ylabel('用户数')

# 会员等级分布
member_counts = user_features['会员等级'].value_counts()
axes[1, 0].bar(member_counts.index, member_counts.values, color='lightgreen', edgecolor='black')
axes[1, 0].set_title('会员等级分布', fontsize=14, fontweight='bold')
axes[1, 0].set_ylabel('用户数')

# 总消费金额分布
axes[1, 1].hist(user_features['总消费金额'], bins=30, color='gold', edgecolor='black')
axes[1, 1].set_title('总消费金额分布', fontsize=14, fontweight='bold')
axes[1, 1].set_xlabel('金额')
axes[1, 1].set_ylabel('用户数')

# 订单数量分布
axes[1, 2].hist(user_features['订单数量'], bins=20, color='purple', edgecolor='black', alpha=0.7)
axes[1, 2].set_title('订单数量分布', fontsize=14, fontweight='bold')
axes[1, 2].set_xlabel('订单数')
axes[1, 2].set_ylabel('用户数')

plt.suptitle('用户特征分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 探索性分析

```python
# 探索性分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 假设user_features已经创建（来自上一个代码块）
# 这里重新创建模拟数据
np.random.seed(42)
n_users = 1000

# 模拟用户特征
user_features = pd.DataFrame({
    '用户ID': range(1, n_users + 1),
    '年龄': np.random.randint(18, 65, n_users),
    '总消费金额': np.random.exponential(1000, n_users),
    '订单数量': np.random.randint(0, 50, n_users),
    '总行为次数': np.random.randint(10, 500, n_users),
    '注册天数': np.random.randint(30, 365, n_users)
})

# 计算衍生特征
user_features['平均订单金额'] = user_features['总消费金额'] / user_features['订单数量'].replace(0, 1)
user_features['行为频率'] = user_features['总行为次数'] / user_features['注册天数']
user_features['消费频率'] = user_features['订单数量'] / user_features['注册天数']

# 创建流失标签（模拟）
user_features['是否流失'] = np.random.choice([0, 1], n_users, p=[0.7, 0.3])

print("用户特征数据:")
print(user_features.head())

# 1. 相关性分析
print("\n相关性分析:")
print("=" * 50)

# 选择数值特征
numeric_features = ['年龄', '总消费金额', '订单数量', '总行为次数', '平均订单金额', '行为频率', '消费频率']
correlation_matrix = user_features[numeric_features].corr()

plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, fmt='.2f')
plt.title('特征相关性热力图', fontsize=16, fontweight='bold')
plt.show()

# 2. 流失用户分析
print("\n流失用户分析:")
print("=" * 50)

# 流失率
churn_rate = user_features['是否流失'].mean()
print(f"流失率: {churn_rate:.2%}")

# 流失用户特征
churned_users = user_features[user_features['是否流失'] == 1]
active_users = user_features[user_features['是否流失'] == 0]

print("\n流失用户特征:")
print(churned_users[numeric_features].mean())

print("\n活跃用户特征:")
print(active_users[numeric_features].mean())

# 可视化流失用户vs活跃用户
fig, axes = plt.subplots(2, 3, figsize=(15, 10))

for i, feature in enumerate(numeric_features[:6]):
    row = i // 3
    col = i % 3
    
    axes[row, col].hist(active_users[feature], bins=30, alpha=0.5, label='活跃用户', color='green')
    axes[row, col].hist(churned_users[feature], bins=30, alpha=0.5, label='流失用户', color='red')
    axes[row, col].set_title(f'{feature}分布', fontsize=14, fontweight='bold')
    axes[row, col].set_xlabel(feature)
    axes[row, col].set_ylabel('用户数')
    axes[row, col].legend()

plt.suptitle('流失用户vs活跃用户特征比较', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 3. 用户分群
print("\n用户分群:")
print("=" * 50)

# 选择分群特征
cluster_features = ['总消费金额', '订单数量', '行为频率']
X = user_features[cluster_features]

# 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 使用K-means聚类
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
user_features['用户分群'] = kmeans.fit_predict(X_scaled)

# 分析各分群
cluster_stats = user_features.groupby('用户分群')[cluster_features].mean()
print("\n各分群特征均值:")
print(cluster_stats)

# 计算各分群的流失率
cluster_churn = user_features.groupby('用户分群')['是否流失'].mean()
print("\n各分群流失率:")
print(cluster_churn)

# 可视化用户分群
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 分群分布
cluster_counts = user_features['用户分群'].value_counts().sort_index()
axes[0].bar(cluster_counts.index, cluster_counts.values, color='skyblue', edgecolor='black')
axes[0].set_title('用户分群分布', fontsize=14, fontweight='bold')
axes[0].set_xlabel('分群')
axes[0].set_ylabel('用户数')

# 分群流失率
axes[1].bar(cluster_churn.index, cluster_churn.values, color='lightcoral', edgecolor='black')
axes[1].set_title('各分群流失率', fontsize=14, fontweight='bold')
axes[1].set_xlabel('分群')
axes[1].set_ylabel('流失率')
axes[1].axhline(y=churn_rate, color='r', linestyle='--', label=f'平均流失率: {churn_rate:.2%}')
axes[1].legend()

plt.tight_layout()
plt.show()

# 4. RFM分析
print("\nRFM分析:")
print("=" * 50)

# 计算RFM指标
user_features['最近购买天数'] = np.random.randint(1, 90, n_users)  # 模拟数据
user_features['R_score'] = pd.qcut(user_features['最近购买天数'], 4, labels=[4, 3, 2, 1])
user_features['F_score'] = pd.qcut(user_features['订单数量'].rank(method='first'), 4, labels=[1, 2, 3, 4])
user_features['M_score'] = pd.qcut(user_features['总消费金额'], 4, labels=[1, 2, 3, 4])

# 计算RFM总分
user_features['RFM_score'] = user_features['R_score'].astype(int) + user_features['F_score'].astype(int) + user_features['M_score'].astype(int)

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

user_features['价值分群'] = user_features['RFM_score'].apply(rfm_segment)

# 统计各价值分群
value_counts = user_features['价值分群'].value_counts()
print("\n用户价值分群:")
print(value_counts)

# 可视化RFM分析
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 价值分群分布
axes[0].pie(value_counts, labels=value_counts.index, autopct='%1.1f%%',
            colors=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'], startangle=90)
axes[0].set_title('用户价值分群', fontsize=14, fontweight='bold')

# 各价值分群流失率
value_churn = user_features.groupby('价值分群')['是否流失'].mean()
axes[1].bar(value_churn.index, value_churn.values, color='lightcoral', edgecolor='black')
axes[1].set_title('各价值分群流失率', fontsize=14, fontweight='bold')
axes[1].set_xlabel('价值分群')
axes[1].set_ylabel('流失率')

plt.tight_layout()
plt.show()
```

### 模型构建

```python
# 模型构建示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
import seaborn as sns

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 创建模拟数据
np.random.seed(42)
n_users = 1000

# 模拟用户特征
X = pd.DataFrame({
    '年龄': np.random.randint(18, 65, n_users),
    '总消费金额': np.random.exponential(1000, n_users),
    '订单数量': np.random.randint(0, 50, n_users),
    '总行为次数': np.random.randint(10, 500, n_users),
    '平均订单金额': np.random.exponential(200, n_users),
    '行为频率': np.random.uniform(0.1, 10, n_users),
    '消费频率': np.random.uniform(0.01, 1, n_users)
})

# 创建目标变量（模拟流失）
y = np.random.choice([0, 1], n_users, p=[0.7, 0.3])

# 数据预处理
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"训练集大小: {X_train.shape[0]}")
print(f"测试集大小: {X_test.shape[0]}")

# 1. 训练多个模型
print("\n模型训练:")
print("=" * 50)

models = {
    '逻辑回归': LogisticRegression(random_state=42, max_iter=1000),
    '随机森林': RandomForestClassifier(n_estimators=100, random_state=42),
    '梯度提升': GradientBoostingClassifier(n_estimators=100, random_state=42)
}

results = {}

for name, model in models.items():
    # 训练模型
    model.fit(X_train_scaled, y_train)
    
    # 预测
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    # 计算指标
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    # 交叉验证
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='f1')
    
    results[name] = {
        '准确率': accuracy,
        '精确率': precision,
        '召回率': recall,
        'F1分数': f1,
        '交叉验证F1': cv_scores.mean(),
        '预测概率': y_pred_proba
    }
    
    print(f"\n{name}:")
    print(f"  准确率: {accuracy:.4f}")
    print(f"  精确率: {precision:.4f}")
    print(f"  召回率: {recall:.4f}")
    print(f"  F1分数: {f1:.4f}")
    print(f"  交叉验证F1: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# 2. 模型比较
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 各指标比较
metrics = ['准确率', '精确率', '召回率', 'F1分数']
for i, metric in enumerate(metrics):
    row = i // 2
    col = i % 2
    
    values = [results[name][metric] for name in results.keys()]
    bars = axes[row, col].bar(results.keys(), values, color='skyblue', edgecolor='black')
    axes[row, col].set_title(f'{metric}比较', fontsize=14, fontweight='bold')
    axes[row, col].set_ylabel(metric)
    axes[row, col].set_ylim(0, 1)
    
    # 添加数值标签
    for bar in bars:
        height = bar.get_height()
        axes[row, col].text(bar.get_x() + bar.get_width()/2., height,
                           f'{height:.4f}',
                           ha='center', va='bottom', fontsize=9)

plt.suptitle('模型性能比较', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 3. ROC曲线
plt.figure(figsize=(10, 8))

for name, result in results.items():
    fpr, tpr, _ = roc_curve(y_test, result['预测概率'])
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, linewidth=2, label=f'{name} (AUC = {roc_auc:.4f})')

plt.plot([0, 1], [0, 1], 'k--', linewidth=2, label='随机分类器')
plt.title('ROC曲线', fontsize=16, fontweight='bold')
plt.xlabel('假正率')
plt.ylabel('真正率')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 4. 最佳模型分析
best_model_name = max(results.keys(), key=lambda x: results[x]['F1分数'])
best_model = models[best_model_name]

print(f"\n最佳模型: {best_model_name}")
print("=" * 50)

# 分类报告
y_pred = best_model.predict(X_test_scaled)
print("\n分类报告:")
print(classification_report(y_test, y_pred, target_names=['不流失', '流失']))

# 混淆矩阵
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['不流失', '流失'], yticklabels=['不流失', '流失'])
plt.title('混淆矩阵', fontsize=16, fontweight='bold')
plt.xlabel('预测标签')
plt.ylabel('真实标签')
plt.show()

# 5. 特征重要性
if hasattr(best_model, 'feature_importances_'):
    feature_importance = best_model.feature_importances_
    importance_df = pd.DataFrame({
        '特征': X.columns,
        '重要性': feature_importance
    }).sort_values('重要性', ascending=False)
    
    print("\n特征重要性:")
    print(importance_df)
    
    plt.figure(figsize=(10, 6))
    plt.barh(importance_df['特征'], importance_df['重要性'], color='skyblue', edgecolor='black')
    plt.title('特征重要性', fontsize=16, fontweight='bold')
    plt.xlabel('重要性')
    plt.ylabel('特征')
    plt.gca().invert_yaxis()
    plt.grid(True, alpha=0.3, axis='x')
    plt.tight_layout()
    plt.show()
```

### 结果展示

```python
# 结果展示示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
from datetime import datetime

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建分析报告
report = {
    '项目名称': '电商用户流失预测',
    '报告日期': datetime.now().strftime('%Y-%m-%d'),
    '分析周期': '2024年1月',
    '数据概览': {
        '总用户数': 1000,
        '流失用户数': 300,
        '流失率': '30.00%'
    },
    '关键发现': [
        '流失用户的平均消费金额显著低于活跃用户',
        '行为频率是预测流失的最重要特征',
        '低价值用户的流失率最高',
        '模型可以提前识别高风险用户'
    ],
    '模型性能': {
        '最佳模型': '梯度提升',
        '准确率': 0.85,
        '精确率': 0.82,
        '召回率': 0.78,
        'F1分数': 0.80
    },
    '建议': [
        '针对高风险用户推出专属优惠',
        '提高用户活跃度，增加行为频率',
        '优化会员体系，提升用户粘性',
        '建立用户流失预警机制'
    ]
}

print("分析报告:")
print("=" * 50)
for key, value in report.items():
    if isinstance(value, dict):
        print(f"\n{key}:")
        for k, v in value.items():
            print(f"  {k}: {v}")
    elif isinstance(value, list):
        print(f"\n{key}:")
        for i, item in enumerate(value, 1):
            print(f"  {i}. {item}")
    else:
        print(f"{key}: {value}")

# 2. 创建可视化仪表板
fig = plt.figure(figsize=(16, 12))

# 添加子图
ax1 = fig.add_subplot(2, 3, 1)
ax2 = fig.add_subplot(2, 3, 2)
ax3 = fig.add_subplot(2, 3, 3)
ax4 = fig.add_subplot(2, 3, 4)
ax5 = fig.add_subplot(2, 3, 5)
ax6 = fig.add_subplot(2, 3, 6)

# 模拟数据
np.random.seed(42)

# 流失率
churn_rate = 0.3
ax1.pie([churn_rate, 1-churn_rate], labels=['流失', '留存'], autopct='%1.1f%%',
        colors=['#ff9999', '#66b3ff'], startangle=90)
ax1.set_title('用户流失率', fontsize=14, fontweight='bold')

# 模型性能
metrics = ['准确率', '精确率', '召回率', 'F1分数']
values = [0.85, 0.82, 0.78, 0.80]
ax2.bar(metrics, values, color='skyblue', edgecolor='black')
ax2.set_ylim(0, 1)
ax2.set_title('模型性能', fontsize=14, fontweight='bold')
ax2.tick_params(axis='x', rotation=45)

# 特征重要性
features = ['行为频率', '消费频率', '总消费金额', '订单数量', '年龄']
importance = [0.35, 0.25, 0.20, 0.15, 0.05]
ax3.barh(features, importance, color='lightcoral', edgecolor='black')
ax3.set_title('特征重要性', fontsize=14, fontweight='bold')

# 流失趋势
months = ['1月', '2月', '3月', '4月', '5月', '6月']
churn_trend = [0.30, 0.28, 0.25, 0.23, 0.22, 0.20]
ax4.plot(months, churn_trend, 'b-', linewidth=2, marker='o')
ax4.set_title('流失率趋势', fontsize=14, fontweight='bold')
ax4.set_ylabel('流失率')
ax4.grid(True, alpha=0.3)

# 用户价值分布
value_segments = ['高价值', '中价值', '低价值', '流失风险']
segment_counts = [200, 300, 350, 150]
ax5.bar(value_segments, segment_counts, color=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'], edgecolor='black')
ax5.set_title('用户价值分布', fontsize=14, fontweight='bold')
ax5.set_ylabel('用户数')

# 风险评分分布
risk_scores = np.random.normal(0.5, 0.2, 1000)
ax6.hist(risk_scores, bins=30, color='gold', edgecolor='black', alpha=0.7)
ax6.axvline(x=0.7, color='r', linestyle='--', linewidth=2, label='高风险阈值')
ax6.set_title('风险评分分布', fontsize=14, fontweight='bold')
ax6.set_xlabel('风险评分')
ax6.set_ylabel('用户数')
ax6.legend()

plt.suptitle('电商用户流失预测仪表板', fontsize=18, fontweight='bold')
plt.tight_layout()
plt.show()

# 3. 导出报告
# 保存为JSON
with open('analysis_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print("\n报告已保存为 analysis_report.json")

# 4. 创建HTML报告
html_report = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>电商用户流失预测报告</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        h1 {{ color: #333; }}
        h2 {{ color: #666; }}
        .metric {{ background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }}
        .metric-value {{ font-size: 24px; font-weight: bold; color: #2196F3; }}
        .finding {{ background: #e3f2fd; padding: 10px; margin: 5px 0; border-radius: 5px; }}
        .recommendation {{ background: #e8f5e8; padding: 10px; margin: 5px 0; border-radius: 5px; }}
    </style>
</head>
<body>
    <h1>电商用户流失预测报告</h1>
    <p>报告日期: {report['报告日期']}</p>
    
    <h2>数据概览</h2>
    <div class="metric">
        <div>总用户数</div>
        <div class="metric-value">{report['数据概览']['总用户数']}</div>
    </div>
    <div class="metric">
        <div>流失率</div>
        <div class="metric-value">{report['数据概览']['流失率']}</div>
    </div>
    
    <h2>关键发现</h2>
"""
for i, finding in enumerate(report['关键发现'], 1):
    html_report += f'    <div class="finding">{i}. {finding}</div>\n'

html_report += """
    <h2>模型性能</h2>
"""
for key, value in report['模型性能'].items():
    html_report += f'    <div class="metric"><div>{key}</div><div class="metric-value">{value}</div></div>\n'

html_report += """
    <h2>建议</h2>
"""
for i, recommendation in enumerate(report['建议'], 1):
    html_report += f'    <div class="recommendation">{i. {recommendation}}</div>\n'

html_report += """
</body>
</html>
"""

with open('analysis_report.html', 'w', encoding='utf-8') as f:
    f.write(html_report)

print("HTML报告已保存为 analysis_report.html")
```

### 项目部署

```python
# 项目部署示例

import pandas as pd
import numpy as np
import joblib
from flask import Flask, request, jsonify
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

# 1. 训练并保存模型
print("训练并保存模型:")
print("=" * 50)

# 创建模拟数据
np.random.seed(42)
n_samples = 1000

X = pd.DataFrame({
    '年龄': np.random.randint(18, 65, n_samples),
    '总消费金额': np.random.exponential(1000, n_samples),
    '订单数量': np.random.randint(0, 50, n_samples),
    '总行为次数': np.random.randint(10, 500, n_samples),
    '平均订单金额': np.random.exponential(200, n_samples),
    '行为频率': np.random.uniform(0.1, 10, n_samples),
    '消费频率': np.random.uniform(0.01, 1, n_samples)
})

y = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])

# 训练模型
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = GradientBoostingClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

# 保存模型和标准化器
joblib.dump(model, 'churn_model.pkl')
joblib.dump(scaler, 'scaler.pkl')

print("模型已保存为 churn_model.pkl")
print("标准化器已保存为 scaler.pkl")

# 2. 创建Flask应用
print("\n创建Flask应用:")
print("=" * 50)

app = Flask(__name__)

# 加载模型
loaded_model = joblib.load('churn_model.pkl')
loaded_scaler = joblib.load('scaler.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    """预测用户流失"""
    try:
        # 获取输入数据
        data = request.json
        
        # 转换为DataFrame
        input_data = pd.DataFrame([data])
        
        # 标准化
        input_scaled = loaded_scaler.transform(input_data)
        
        # 预测
        prediction = loaded_model.predict(input_scaled)[0]
        probability = loaded_model.predict_proba(input_scaled)[0][1]
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'status': 'success'
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({'status': 'healthy'})

print("Flask应用已创建")
print("API端点:")
print("  POST /predict - 预测用户流失")
print("  GET /health - 健康检查")

# 3. 测试API
print("\n测试API:")
print("=" * 50)

# 模拟测试数据
test_data = {
    '年龄': 35,
    '总消费金额': 1500,
    '订单数量': 10,
    '总行为次数': 200,
    '平均订单金额': 150,
    '行为频率': 5.0,
    '消费频率': 0.3
}

print(f"测试数据: {test_data}")

# 预测
test_scaled = loaded_scaler.transform(pd.DataFrame([test_data]))
prediction = loaded_model.predict(test_scaled)[0]
probability = loaded_model.predict_proba(test_scaled)[0][1]

print(f"预测结果: {'流失' if prediction == 1 else '留存'}")
print(f"流失概率: {probability:.4f}")

# 4. 创建Docker配置
print("\n创建Docker配置:")
print("=" * 50)

dockerfile = """
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
"""

requirements = """
flask==2.3.2
scikit-learn==1.3.0
pandas==2.0.3
numpy==1.24.3
joblib==1.3.2
"""

# 保存文件
with open('Dockerfile', 'w') as f:
    f.write(dockerfile)

with open('requirements.txt', 'w') as f:
    f.write(requirements)

print("Dockerfile 已创建")
print("requirements.txt 已创建")

# 5. 创建部署脚本
print("\n创建部署脚本:")
print("=" * 50)

deploy_script = """#!/bin/bash

# 构建Docker镜像
echo "构建Docker镜像..."
docker build -t churn-prediction .

# 运行容器
echo "运行容器..."
docker run -d -p 5000:5000 --name churn-app churn-prediction

echo "部署完成！"
echo "API地址: http://localhost:5000"
echo "测试命令: curl -X POST http://localhost:5000/predict -H 'Content-Type: application/json' -d '{\"年龄\": 35, \"总消费金额\": 1500, \"订单数量\": 10, \"总行为次数\": 200, \"平均订单金额\": 150, \"行为频率\": 5.0, \"消费频率\": 0.3}'"
"""

with open('deploy.sh', 'w') as f:
    f.write(deploy_script)

print("部署脚本已创建为 deploy.sh")

# 6. 创建README
print("\n创建README:")
print("=" * 50)

readme = """# 电商用户流失预测项目

## 项目简介
本项目旨在预测电商用户流失，帮助企业提前识别高风险用户并采取相应措施。

## 文件说明
- `churn_model.pkl`: 训练好的模型文件
- `scaler.pkl`: 数据标准化器
- `app.py`: Flask API应用
- `Dockerfile`: Docker配置文件
- `requirements.txt`: Python依赖包
- `deploy.sh`: 部署脚本

## 快速开始

### 本地运行
```bash
# 安装依赖
pip install -r requirements.txt

# 运行应用
python app.py
```

### Docker部署
```bash
# 构建并运行
chmod +x deploy.sh
./deploy.sh
```

## API使用

### 预测接口
```
POST /predict
Content-Type: application/json

{
    "年龄": 35,
    "总消费金额": 1500,
    "订单数量": 10,
    "总行为次数": 200,
    "平均订单金额": 150,
    "行为频率": 5.0,
    "消费频率": 0.3
}
```

### 响应示例
```json
{
    "prediction": 1,
    "probability": 0.75,
    "status": "success"
}
```

## 模型性能
- 准确率: 85%
- 精确率: 82%
- 召回率: 78%
- F1分数: 80%

## 联系方式
如有问题，请联系项目负责人。
"""

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(readme)

print("README.md 已创建")

print("\n项目部署准备完成！")
print("可以使用以下命令部署:")
print("  1. 本地运行: python app.py")
print("  2. Docker部署: ./deploy.sh")
```

## 课后练习

### 练习1：项目规划
1. 选择一个实际项目
2. 制定项目计划
3. 识别项目风险
4. 创建项目时间线

### 练习2：数据处理
1. 收集相关数据
2. 进行数据清洗
3. 进行特征工程
4. 创建数据管道

### 练习3：模型构建
1. 训练多个模型
2. 进行模型评估
3. 进行模型优化
4. 选择最佳模型

### 练习4：项目部署
1. 保存模型文件
2. 创建API服务
3. 编写部署脚本
4. 创建项目文档

## 常见问题

### Q1: 如何选择合适的项目？
A: 可以考虑：
1. 业务价值
2. 数据可用性
3. 技术可行性
4. 时间限制

### Q2: 如何保证数据质量？
A: 可以尝试：
1. 数据验证
2. 缺失值处理
3. 异常值检测
4. 数据标准化

### Q3: 如何优化模型性能？
A: 可以尝试：
1. 特征工程
2. 超参数调优
3. 集成学习
4. 交叉验证

### Q4: 如何部署到生产环境？
A: 可以考虑：
1. 容器化部署
2. 云服务部署
3. 持续集成/持续部署
4. 监控和日志

### Q5: 如何维护部署后的模型？
A: 需要：
1. 性能监控
2. 模型更新
3. A/B测试
4. 反馈收集

## 下一步学习

恭喜你完成了数据分析系列教程的学习！接下来你可以：
1. 深入学习特定领域的数据分析
2. 学习更高级的机器学习技术
3. 探索大数据分析技术
4. 参与实际项目积累经验

祝你在数据分析的道路上取得成功！