# Day 10: 机器学习入门

## 学习目标

完成今天的学习后，你将能够：
- 理解机器学习的基本概念
- 掌握监督学习方法
- 了解无监督学习方法
- 掌握模型评估方法

## 技术原理

### 机器学习概念

#### 定义
机器学习是人工智能的一个分支，它使计算机能够从数据中学习，而不需要明确编程。

#### 学习类型
1. **监督学习**：有标签数据
2. **无监督学习**：无标签数据
3. **强化学习**：通过奖励学习

### 监督学习

#### 分类
1. **逻辑回归**：二分类
2. **决策树**：多分类
3. **随机森林**：集成学习
4. **支持向量机**：高维分类
5. **K近邻**：基于距离

#### 回归
1. **线性回归**：连续值预测
2. **多项式回归**：非线性关系
3. **岭回归**：正则化
4. **Lasso回归**：特征选择

### 无监督学习

#### 聚类
1. **K-means**：基于距离的聚类
2. **DBSCAN**：密度聚类
3. **层次聚类**：层次结构

#### 降维
1. **PCA**：主成分分析
2. **t-SNE**：非线性降维
3. **LDA**：线性判别分析

### 模型评估

#### 分类指标
1. **准确率**：正确预测比例
2. **精确率**：预测为正的正样本比例
3. **召回率**：实际为正的预测比例
4. **F1分数**：精确率和召回率的调和平均

#### 回归指标
1. **均方误差（MSE）**
2. **均方根误差（RMSE）**
3. **平均绝对误差（MAE）**
4. **R²分数**

## 案例：鸢尾花分类

使用经典的鸢尾花数据集进行分类：
1. 数据预处理
2. 模型训练
3. 模型评估
4. 结果可视化

## 应用场景

1. **推荐系统**：用户喜好预测
2. **图像识别**：物体检测、人脸识别
3. **自然语言处理**：文本分类、情感分析
4. **金融风控**：信用评分、欺诈检测
5. **医疗诊断**：疾病预测、药物发现

## 代码案例

### 监督学习：分类

```python
# 监督学习分类示例

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import seaborn as sns

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 加载数据
iris = load_iris()
X = iris.data
y = iris.target
feature_names = iris.feature_names
target_names = iris.target_names

print("数据集信息:")
print(f"特征名称: {feature_names}")
print(f"目标类别: {target_names}")
print(f"数据形状: {X.shape}")
print(f"类别分布: {np.bincount(y)}")

# 2. 数据预处理
# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

print(f"\n训练集大小: {X_train.shape[0]}")
print(f"测试集大小: {X_test.shape[0]}")

# 标准化
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. 训练多个模型
models = {
    'K近邻': KNeighborsClassifier(n_neighbors=5),
    '逻辑回归': LogisticRegression(max_iter=200),
    '决策树': DecisionTreeClassifier(random_state=42),
    '随机森林': RandomForestClassifier(n_estimators=100, random_state=42),
    '支持向量机': SVC(kernel='rbf', random_state=42)
}

results = {}

for name, model in models.items():
    # 训练模型
    model.fit(X_train_scaled, y_train)
    
    # 预测
    y_pred = model.predict(X_test_scaled)
    
    # 计算准确率
    accuracy = accuracy_score(y_test, y_pred)
    results[name] = accuracy
    
    print(f"\n{name}:")
    print(f"  准确率: {accuracy:.4f}")

# 4. 比较模型
plt.figure(figsize=(10, 6))
bars = plt.bar(results.keys(), results.values(), color='skyblue', edgecolor='black')
plt.title('不同模型准确率比较', fontsize=16, fontweight='bold')
plt.xlabel('模型')
plt.ylabel('准确率')
plt.ylim(0.9, 1.0)

# 添加数值标签
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
             f'{height:.4f}',
             ha='center', va='bottom')

plt.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.show()

# 5. 详细评估最佳模型
best_model_name = max(results, key=results.get)
best_model = models[best_model_name]

print(f"\n最佳模型: {best_model_name}")
print("=" * 50)

y_pred = best_model.predict(X_test_scaled)

# 分类报告
print("\n分类报告:")
print(classification_report(y_test, y_pred, target_names=target_names))

# 混淆矩阵
cm = confusion_matrix(y_test, y_pred)

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=target_names, yticklabels=target_names)
plt.title('混淆矩阵', fontsize=16, fontweight='bold')
plt.xlabel('预测标签')
plt.ylabel('真实标签')
plt.show()

# 6. 特征重要性（对于随机森林）
if best_model_name == '随机森林':
    feature_importance = best_model.feature_importances_
    
    plt.figure(figsize=(10, 6))
    plt.barh(feature_names, feature_importance, color='skyblue', edgecolor='black')
    plt.title('特征重要性', fontsize=16, fontweight='bold')
    plt.xlabel('重要性')
    plt.ylabel('特征')
    plt.grid(True, alpha=0.3, axis='x')
    plt.tight_layout()
    plt.show()
```

### 监督学习：回归

```python
# 监督学习回归示例

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 生成回归数据
np.random.seed(42)
X, y = make_regression(n_samples=200, n_features=5, noise=10, random_state=42)

# 创建特征名称
feature_names = [f'特征{i+1}' for i in range(X.shape[1])]

print("数据集信息:")
print(f"特征数量: {X.shape[1]}")
print(f"样本数量: {X.shape[0]}")

# 2. 数据预处理
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 标准化
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. 训练多个模型
models = {
    '线性回归': LinearRegression(),
    '岭回归': Ridge(alpha=1.0),
    'Lasso回归': Lasso(alpha=1.0),
    '随机森林': RandomForestRegressor(n_estimators=100, random_state=42)
}

results = {}

for name, model in models.items():
    # 训练模型
    model.fit(X_train_scaled, y_train)
    
    # 预测
    y_pred = model.predict(X_test_scaled)
    
    # 计算指标
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    results[name] = {
        'MSE': mse,
        'RMSE': rmse,
        'MAE': mae,
        'R²': r2
    }
    
    print(f"\n{name}:")
    print(f"  MSE: {mse:.4f}")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  MAE: {mae:.4f}")
    print(f"  R²: {r2:.4f}")

# 4. 比较模型
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

metrics = ['MSE', 'RMSE', 'MAE', 'R²']
for i, metric in enumerate(metrics):
    row = i // 2
    col = i % 2
    
    values = [results[name][metric] for name in results.keys()]
    bars = axes[row, col].bar(results.keys(), values, color='skyblue', edgecolor='black')
    axes[row, col].set_title(f'{metric}比较', fontsize=14, fontweight='bold')
    axes[row, col].set_ylabel(metric)
    axes[row, col].tick_params(axis='x', rotation=45)
    
    # 添加数值标签
    for bar in bars:
        height = bar.get_height()
        axes[row, col].text(bar.get_x() + bar.get_width()/2., height,
                           f'{height:.4f}',
                           ha='center', va='bottom', fontsize=9)

plt.suptitle('不同回归模型性能比较', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 5. 最佳模型详细分析
best_model_name = max(results.keys(), key=lambda x: results[x]['R²'])
best_model = models[best_model_name]

print(f"\n最佳模型: {best_model_name}")
print("=" * 50)

y_pred = best_model.predict(X_test_scaled)

# 预测值vs实际值散点图
plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred, alpha=0.6, color='skyblue', edgecolors='black')
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', linewidth=2)
plt.title('预测值 vs 实际值', fontsize=16, fontweight='bold')
plt.xlabel('实际值')
plt.ylabel('预测值')
plt.grid(True, alpha=0.3)
plt.show()

# 残差图
residuals = y_test - y_pred

plt.figure(figsize=(10, 6))
plt.scatter(y_pred, residuals, alpha=0.6, color='skyblue', edgecolors='black')
plt.axhline(y=0, color='r', linestyle='--', linewidth=2)
plt.title('残差图', fontsize=16, fontweight='bold')
plt.xlabel('预测值')
plt.ylabel('残差')
plt.grid(True, alpha=0.3)
plt.show()

# 6. 特征重要性（对于随机森林）
if best_model_name == '随机森林':
    feature_importance = best_model.feature_importances_
    
    plt.figure(figsize=(10, 6))
    plt.barh(feature_names, feature_importance, color='skyblue', edgecolor='black')
    plt.title('特征重要性', fontsize=16, fontweight='bold')
    plt.xlabel('重要性')
    plt.ylabel('特征')
    plt.grid(True, alpha=0.3, axis='x')
    plt.tight_layout()
    plt.show()
```

### 无监督学习：聚类

```python
# 无监督学习聚类示例

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, adjusted_rand_score
import seaborn as sns

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 生成聚类数据
np.random.seed(42)
X, y_true = make_blobs(n_samples=300, centers=4, cluster_std=0.60, random_state=42)

print("数据集信息:")
print(f"样本数量: {X.shape[0]}")
print(f"特征数量: {X.shape[1]}")
print(f"真实类别数: {len(np.unique(y_true))}")

# 2. 数据预处理
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. K-means聚类
print("\nK-means聚类:")
print("=" * 50)

# 使用肘部法则确定最佳K值
inertias = []
silhouette_scores = []
K_range = range(2, 10)

for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    inertias.append(kmeans.inertia_)
    silhouette_scores.append(silhouette_score(X_scaled, kmeans.labels_))

# 绘制肘部法则图
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].plot(K_range, inertias, 'bo-')
axes[0].set_title('肘部法则', fontsize=14, fontweight='bold')
axes[0].set_xlabel('K值')
axes[0].set_ylabel('惯性')
axes[0].grid(True, alpha=0.3)

axes[1].plot(K_range, silhouette_scores, 'ro-')
axes[1].set_title('轮廓系数', fontsize=14, fontweight='bold')
axes[1].set_xlabel('K值')
axes[1].set_ylabel('轮廓系数')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 选择最佳K值
best_k = K_range[np.argmax(silhouette_scores)]
print(f"最佳K值: {best_k}")

# 使用最佳K值进行聚类
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
y_kmeans = kmeans.fit_predict(X_scaled)

# 计算评估指标
silhouette_avg = silhouette_score(X_scaled, y_kmeans)
ari = adjusted_rand_score(y_true, y_kmeans)

print(f"轮廓系数: {silhouette_avg:.4f}")
print(f"调整兰德指数: {ari:.4f}")

# 4. DBSCAN聚类
print("\nDBSCAN聚类:")
print("=" * 50)

# 使用DBSCAN
dbscan = DBSCAN(eps=0.3, min_samples=5)
y_dbscan = dbscan.fit_predict(X_scaled)

# 计算评估指标
n_clusters = len(set(y_dbscan)) - (1 if -1 in y_dbscan else 0)
n_noise = list(y_dbscan).count(-1)

print(f"聚类数量: {n_clusters}")
print(f"噪声点数量: {n_noise}")

if n_clusters > 1:
    silhouette_avg = silhouette_score(X_scaled, y_dbscan)
    print(f"轮廓系数: {silhouette_avg:.4f}")

# 5. 层次聚类
print("\n层次聚类:")
print("=" * 50)

# 使用层次聚类
hierarchical = AgglomerativeClustering(n_clusters=best_k)
y_hierarchical = hierarchical.fit_predict(X_scaled)

# 计算评估指标
silhouette_avg = silhouette_score(X_scaled, y_hierarchical)
ari = adjusted_rand_score(y_true, y_hierarchical)

print(f"轮廓系数: {silhouette_avg:.4f}")
print(f"调整兰德指数: {ari:.4f}")

# 6. 可视化聚类结果
fig, axes = plt.subplots(2, 2, figsize=(14, 12))

# 真实标签
scatter1 = axes[0, 0].scatter(X[:, 0], X[:, 1], c=y_true, cmap='viridis', alpha=0.6)
axes[0, 0].set_title('真实标签', fontsize=14, fontweight='bold')
axes[0, 0].set_xlabel('特征1')
axes[0, 0].set_ylabel('特征2')

# K-means结果
scatter2 = axes[0, 1].scatter(X[:, 0], X[:, 1], c=y_kmeans, cmap='viridis', alpha=0.6)
axes[0, 1].set_title('K-means聚类', fontsize=14, fontweight='bold')
axes[0, 1].set_xlabel('特征1')
axes[0, 1].set_ylabel('特征2')

# DBSCAN结果
scatter3 = axes[1, 0].scatter(X[:, 0], X[:, 1], c=y_dbscan, cmap='viridis', alpha=0.6)
axes[1, 0].set_title('DBSCAN聚类', fontsize=14, fontweight='bold')
axes[1, 0].set_xlabel('特征1')
axes[1, 0].set_ylabel('特征2')

# 层次聚类结果
scatter4 = axes[1, 1].scatter(X[:, 0], X[:, 1], c=y_hierarchical, cmap='viridis', alpha=0.6)
axes[1, 1].set_title('层次聚类', fontsize=14, fontweight='bold')
axes[1, 1].set_xlabel('特征1')
axes[1, 1].set_ylabel('特征2')

plt.suptitle('不同聚类方法比较', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 7. 聚类结果统计
print("\n聚类结果统计:")
print("=" * 50)

for name, labels in [('K-means', y_kmeans), ('DBSCAN', y_dbscan), ('层次聚类', y_hierarchical)]:
    print(f"\n{name}:")
    print(f"  聚类数量: {len(set(labels)) - (1 if -1 in labels else 0)}")
    print(f"  各聚类样本数: {np.bincount(labels[labels >= 0])}")
```

### 无监督学习：降维

```python
# 无监督学习降维示例

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import seaborn as sns

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 加载数据
iris = load_iris()
X = iris.data
y = iris.target
target_names = iris.target_names

print("原始数据形状:", X.shape)

# 2. 数据标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. PCA降维
print("\nPCA降维:")
print("=" * 50)

# 降到2维
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

print(f"解释方差比例: {pca.explained_variance_ratio_}")
print(f"累计解释方差比例: {np.cumsum(pca.explained_variance_ratio_)}")

# 可视化PCA结果
plt.figure(figsize=(10, 8))
colors = ['red', 'green', 'blue']

for i, target_name in enumerate(target_names):
    mask = y == i
    plt.scatter(X_pca[mask, 0], X_pca[mask, 1], 
                c=colors[i], label=target_name, alpha=0.7, edgecolors='black')

plt.title('PCA降维结果', fontsize=16, fontweight='bold')
plt.xlabel(f'主成分1 ({pca.explained_variance_ratio_[0]:.2%})')
plt.ylabel(f'主成分2 ({pca.explained_variance_ratio_[1]:.2%})')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 4. t-SNE降维
print("\nt-SNE降维:")
print("=" * 50)

# 降到2维
tsne = TSNE(n_components=2, random_state=42, perplexity=30)
X_tsne = tsne.fit_transform(X_scaled)

# 可视化t-SNE结果
plt.figure(figsize=(10, 8))

for i, target_name in enumerate(target_names):
    mask = y == i
    plt.scatter(X_tsne[mask, 0], X_tsne[mask, 1], 
                c=colors[i], label=target_name, alpha=0.7, edgecolors='black')

plt.title('t-SNE降维结果', fontsize=16, fontweight='bold')
plt.xlabel('t-SNE维度1')
plt.ylabel('t-SNE维度2')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 5. 比较PCA和t-SNE
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# PCA
for i, target_name in enumerate(target_names):
    mask = y == i
    axes[0].scatter(X_pca[mask, 0], X_pca[mask, 1], 
                    c=colors[i], label=target_name, alpha=0.7, edgecolors='black')
axes[0].set_title('PCA降维', fontsize=14, fontweight='bold')
axes[0].set_xlabel('主成分1')
axes[0].set_ylabel('主成分2')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# t-SNE
for i, target_name in enumerate(target_names):
    mask = y == i
    axes[1].scatter(X_tsne[mask, 0], X_tsne[mask, 1], 
                    c=colors[i], label=target_name, alpha=0.7, edgecolors='black')
axes[1].set_title('t-SNE降维', fontsize=14, fontweight='bold')
axes[1].set_xlabel('t-SNE维度1')
axes[1].set_ylabel('t-SNE维度2')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.suptitle('降维方法比较', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 6. PCA主成分分析
print("\nPCA主成分分析:")
print("=" * 50)

# 计算所有主成分
pca_full = PCA()
X_pca_full = pca_full.fit_transform(X_scaled)

# 解释方差比例
print("各主成分解释方差比例:")
for i, ratio in enumerate(pca_full.explained_variance_ratio_):
    print(f"  主成分{i+1}: {ratio:.4f} ({ratio:.2%})")

# 累计解释方差比例
cumulative_ratio = np.cumsum(pca_full.explained_variance_ratio_)
print(f"\n累计解释方差比例:")
for i, ratio in enumerate(cumulative_ratio):
    print(f"  前{i+1}个主成分: {ratio:.4f} ({ratio:.2%})")

# 绘制解释方差比例图
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# 各主成分解释方差比例
axes[0].bar(range(1, len(pca_full.explained_variance_ratio_) + 1), 
            pca_full.explained_variance_ratio_, color='skyblue', edgecolor='black')
axes[0].set_title('各主成分解释方差比例', fontsize=14, fontweight='bold')
axes[0].set_xlabel('主成分')
axes[0].set_ylabel('解释方差比例')
axes[0].grid(True, alpha=0.3, axis='y')

# 累计解释方差比例
axes[1].plot(range(1, len(cumulative_ratio) + 1), cumulative_ratio, 'ro-')
axes[1].axhline(y=0.95, color='g', linestyle='--', label='95%阈值')
axes[1].set_title('累计解释方差比例', fontsize=14, fontweight='bold')
axes[1].set_xlabel('主成分数量')
axes[1].set_ylabel('累计解释方差比例')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 7. 特征重要性分析
print("\n特征重要性分析:")
print("=" * 50)

# 获取主成分载荷
loadings = pca_full.components_.T

# 创建载荷DataFrame
loadings_df = pd.DataFrame(loadings, 
                          index=iris.feature_names,
                          columns=[f'PC{i+1}' for i in range(len(loadings[0]))])

print("主成分载荷:")
print(loadings_df)

# 可视化载荷
plt.figure(figsize=(10, 8))
sns.heatmap(loadings_df, annot=True, cmap='coolwarm', center=0)
plt.title('主成分载荷热力图', fontsize=16, fontweight='bold')
plt.xlabel('主成分')
plt.ylabel('特征')
plt.tight_layout()
plt.show()
```

## 课后练习

### 练习1：监督学习分类
1. 选择一个分类数据集
2. 训练多个分类模型
3. 比较模型性能
4. 选择最佳模型

### 练习2：监督学习回归
1. 选择一个回归数据集
2. 训练多个回归模型
3. 评估模型性能
4. 分析特征重要性

### 练习3：无监督学习聚类
1. 选择一个聚类数据集
2. 使用K-means聚类
3. 使用DBSCAN聚类
4. 比较不同聚类方法

### 练习4：无监督学习降维
1. 选择一个高维数据集
2. 使用PCA降维
3. 使用t-SNE降维
4. 比较降维效果

## 常见问题

### Q1: 如何选择机器学习算法？
A: 根据问题类型选择：
- 分类：逻辑回归、决策树、随机森林
- 回归：线性回归、岭回归、随机森林
- 聚类：K-means、DBSCAN
- 降维：PCA、t-SNE

### Q2: 如何处理过拟合？
A: 可以尝试：
1. 增加训练数据
2. 使用正则化
3. 使用交叉验证
4. 简化模型

### Q3: 如何选择超参数？
A: 可以使用：
1. 网格搜索
2. 随机搜索
3. 贝叶斯优化
4. 交叉验证

### Q4: 特征工程重要吗？
A: 非常重要。好的特征工程可以显著提高模型性能。

### Q5: 如何评估模型性能？
A: 使用合适的评估指标：
- 分类：准确率、精确率、召回率、F1分数
- 回归：MSE、RMSE、MAE、R²
- 聚类：轮廓系数、调整兰德指数

## 下一步学习

完成今天的学习后，建议你：
1. 练习使用不同的机器学习算法
2. 掌握模型评估方法
3. 学习特征工程技巧
4. 准备进入第三阶段的学习：数据分析实战

恭喜你完成了数据分析进阶阶段的学习！明天我们将进入数据分析实战阶段，开始处理真实的项目。