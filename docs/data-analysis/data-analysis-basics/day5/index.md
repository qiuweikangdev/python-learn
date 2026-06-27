# Day 5: 探索性数据分析(EDA)

## 学习目标

完成今天的学习后，你将能够：
- 理解EDA的概念和流程
- 进行单变量分析
- 进行多变量分析
- 掌握相关性分析方法

## 技术原理

### 什么是探索性数据分析？

探索性数据分析（Exploratory Data Analysis, EDA）是一种数据分析方法，通过总结数据的主要特征、发现数据中的模式、异常和关系，为后续的建模和分析提供基础。

### EDA的目标

1. **了解数据**：数据的形状、类型、质量
2. **发现模式**：趋势、周期、异常
3. **验证假设**：检验初步假设
4. **指导后续分析**：为特征工程和建模提供方向

### EDA流程

1. **数据概览**：查看数据基本信息
2. **单变量分析**：分析单个变量的分布
3. **多变量分析**：分析变量之间的关系
4. **异常检测**：识别异常值
5. **特征工程**：基于EDA结果创建新特征

### 分析方法

#### 单变量分析
1. **数值变量**：均值、中位数、标准差、分布
2. **类别变量**：频数、占比、众数

#### 多变量分析
1. **数值-数值**：相关性、散点图
2. **类别-类别**：交叉表、卡方检验
3. **数值-类别**：分组统计、箱线图

## 案例：鸢尾花数据集EDA

我们将对经典的鸢尾花数据集进行探索性数据分析，包括：
1. 数据概览
2. 单变量分析
3. 多变量分析
4. 相关性分析
5. 结论总结

## 应用场景

1. **数据理解**：在建模前理解数据
2. **数据质量检查**：发现数据问题
3. **特征发现**：发现有用的特征
4. **假设生成**：生成可检验的假设
5. **报告生成**：生成数据报告

## 代码案例

### 数据概览

```python
# 数据概览示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 加载鸢尾花数据集
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['species'] = pd.Categorical.from_codes(iris.target, iris.target_names)

print("数据概览:")
print(f"数据形状: {df.shape}")
print(f"\n前5行数据:")
print(df.head())

# 2. 数据基本信息
print("\n数据基本信息:")
print(df.info())

# 3. 数据类型
print("\n数据类型:")
print(df.dtypes)

# 4. 缺失值检查
print("\n缺失值检查:")
print(df.isnull().sum())

# 5. 数值列统计信息
print("\n数值列统计信息:")
print(df.describe())

# 6. 类别列统计信息
print("\n类别列统计信息:")
print(df['species'].value_counts())

# 7. 数据分布可视化
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 各特征的直方图
for i, col in enumerate(iris.feature_names):
    row = i // 2
    col_idx = i % 2
    axes[row, col_idx].hist(df[col], bins=20, edgecolor='black', alpha=0.7)
    axes[row, col_idx].set_title(f'{col}分布')
    axes[row, col_idx].set_xlabel(col)
    axes[row, col_idx].set_ylabel('频数')

plt.suptitle('鸢尾花数据集特征分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 单变量分析

```python
# 单变量分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 加载数据
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['species'] = pd.Categorical.from_codes(iris.target, iris.target_names)

# 1. 数值变量分析
print("数值变量分析:")
print("=" * 50)

for col in iris.feature_names:
    print(f"\n{col}:")
    print(f"  均值: {df[col].mean():.2f}")
    print(f"  中位数: {df[col].median():.2f}")
    print(f"  标准差: {df[col].std():.2f}")
    print(f"  最小值: {df[col].min():.2f}")
    print(f"  最大值: {df[col].max():.2f}")
    print(f"  偏度: {df[col].skew():.2f}")
    print(f"  峰度: {df[col].kurtosis():.2f}")

# 2. 数值变量可视化
fig, axes = plt.subplots(2, 4, figsize=(16, 8))

for i, col in enumerate(iris.feature_names):
    # 直方图
    axes[0, i].hist(df[col], bins=20, edgecolor='black', alpha=0.7, color='skyblue')
    axes[0, i].axvline(df[col].mean(), color='red', linestyle='--', label=f'均值: {df[col].mean():.2f}')
    axes[0, i].axvline(df[col].median(), color='green', linestyle='--', label=f'中位数: {df[col].median():.2f}')
    axes[0, i].set_title(f'{col}分布')
    axes[0, i].legend()
    
    # 箱线图
    axes[1, i].boxplot(df[col], vert=False)
    axes[1, i].set_title(f'{col}箱线图')

plt.suptitle('数值变量单变量分析', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 3. 类别变量分析
print("\n类别变量分析:")
print("=" * 50)

species_counts = df['species'].value_counts()
print(f"\n各类别数量:")
print(species_counts)
print(f"\n各类别占比:")
print(species_counts / len(df) * 100)

# 类别变量可视化
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# 柱状图
species_counts.plot(kind='bar', ax=axes[0], color=['#FF9999', '#66B2FF', '#99FF99'])
axes[0].set_title('鸢尾花种类分布')
axes[0].set_xlabel('种类')
axes[0].set_ylabel('数量')
axes[0].tick_params(axis='x', rotation=0)

# 饼图
axes[1].pie(species_counts, labels=species_counts.index, autopct='%1.1f%%',
            colors=['#FF9999', '#66B2FF', '#99FF99'], startangle=90)
axes[1].set_title('鸢尾花种类占比')
axes[1].axis('equal')

plt.tight_layout()
plt.show()

# 4. 分布检验
from scipy import stats

print("\n正态性检验 (Shapiro-Wilk):")
print("=" * 50)
for col in iris.feature_names:
    stat, p_value = stats.shapiro(df[col])
    print(f"{col}: 统计量={stat:.4f}, p值={p_value:.4f}")
    if p_value > 0.05:
        print(f"  -> 不能拒绝正态分布假设")
    else:
        print(f"  -> 拒绝正态分布假设")
```

### 多变量分析

```python
# 多变量分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 加载数据
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['species'] = pd.Categorical.from_codes(iris.target, iris.target_names)

# 1. 数值-数值关系分析
print("数值-数值关系分析:")
print("=" * 50)

# 相关性矩阵
correlation_matrix = df[iris.feature_names].corr()
print("\n相关性矩阵:")
print(correlation_matrix)

# 热力图可视化
plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0,
            square=True, linewidths=0.5)
plt.title('特征相关性热力图', fontsize=16, fontweight='bold')
plt.show()

# 2. 散点图矩阵
print("\n散点图矩阵:")
sns.pairplot(df, hue='species', markers=['o', 's', 'D'])
plt.suptitle('鸢尾花数据集散点图矩阵', y=1.02, fontsize=16, fontweight='bold')
plt.show()

# 3. 数值-类别关系分析
print("\n数值-类别关系分析:")
print("=" * 50)

# 按类别分组统计
grouped_stats = df.groupby('species')[iris.feature_names].agg(['mean', 'std', 'min', 'max'])
print("\n按类别分组统计:")
print(grouped_stats)

# 箱线图比较
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

for i, col in enumerate(iris.feature_names):
    row = i // 2
    col_idx = i % 2
    sns.boxplot(x='species', y=col, data=df, ax=axes[row, col_idx])
    axes[row, col_idx].set_title(f'{col}按种类分布')

plt.suptitle('各类别特征分布比较', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 4. 小提琴图
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

for i, col in enumerate(iris.feature_names):
    row = i // 2
    col_idx = i % 2
    sns.violinplot(x='species', y=col, data=df, ax=axes[row, col_idx])
    axes[row, col_idx].set_title(f'{col}按种类分布')

plt.suptitle('各类别特征分布（小提琴图）', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 5. 类别-类别关系分析
print("\n类别-类别关系分析:")
print("=" * 50)

# 创建一个新特征：花瓣大小类别
df['petal_size'] = pd.cut(df['petal length (cm)'], 
                          bins=[0, 2, 4, 7], 
                          labels=['小', '中', '大'])

# 交叉表
cross_tab = pd.crosstab(df['species'], df['petal_size'])
print("\n物种与花瓣大小交叉表:")
print(cross_tab)

# 卡方检验
from scipy.stats import chi2_contingency
chi2, p_value, dof, expected = chi2_contingency(cross_tab)
print(f"\n卡方检验结果:")
print(f"卡方统计量: {chi2:.4f}")
print(f"p值: {p_value:.4f}")
print(f"自由度: {dof}")

# 可视化交叉表
cross_tab.plot(kind='bar', stacked=True, figsize=(10, 6))
plt.title('物种与花瓣大小关系', fontsize=16, fontweight='bold')
plt.xlabel('物种')
plt.ylabel('数量')
plt.legend(title='花瓣大小')
plt.xticks(rotation=0)
plt.show()
```

### 高级EDA技巧

```python
# 高级EDA技巧示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 加载数据
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['species'] = pd.Categorical.from_codes(iris.target, iris.target_names)

# 1. 特征工程
df['sepal_ratio'] = df['sepal length (cm)'] / df['sepal width (cm)']
df['petal_ratio'] = df['petal length (cm)'] / df['petal width (cm)']
df['sepal_area'] = df['sepal length (cm)'] * df['sepal width (cm)']
df['petal_area'] = df['petal length (cm)'] * df['petal width (cm)']

print("特征工程后的数据:")
print(df.head())

# 2. 新特征分析
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 萼片比例
sns.boxplot(x='species', y='sepal_ratio', data=df, ax=axes[0, 0])
axes[0, 0].set_title('萼片比例按种类分布')

# 花瓣比例
sns.boxplot(x='species', y='petal_ratio', data=df, ax=axes[0, 1])
axes[0, 1].set_title('花瓣比例按种类分布')

# 萼片面积
sns.boxplot(x='species', y='sepal_area', data=df, ax=axes[1, 0])
axes[1, 0].set_title('萼片面积按种类分布')

# 花瓣面积
sns.boxplot(x='species', y='petal_area', data=df, ax=axes[1, 1])
axes[1, 1].set_title('花瓣面积按种类分布')

plt.suptitle('新特征分析', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 3. 聚类分析可视化
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 标准化数据
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[iris.feature_names])

# K-means聚类
kmeans = KMeans(n_clusters=3, random_state=42)
df['cluster'] = kmeans.fit_predict(X_scaled)

# 聚类结果可视化
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 实际类别
scatter1 = axes[0].scatter(df['petal length (cm)'], df['petal width (cm)'], 
                          c=df['species'].cat.codes, cmap='viridis', alpha=0.6)
axes[0].set_title('实际类别')
axes[0].set_xlabel('花瓣长度')
axes[0].set_ylabel('花瓣宽度')
legend1 = axes[0].legend(*scatter1.legend_elements(), title="类别")

# 聚类结果
scatter2 = axes[1].scatter(df['petal length (cm)'], df['petal width (cm)'], 
                          c=df['cluster'], cmap='viridis', alpha=0.6)
axes[1].set_title('聚类结果')
axes[1].set_xlabel('花瓣长度')
axes[1].set_ylabel('花瓣宽度')
legend2 = axes[1].legend(*scatter2.legend_elements(), title="聚类")

plt.suptitle('聚类分析可视化', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 4. 聚类评估
from sklearn.metrics import silhouette_score, adjusted_rand_score

# 轮廓系数
silhouette_avg = silhouette_score(X_scaled, df['cluster'])
print(f"\n轮廓系数: {silhouette_avg:.4f}")

# 调整兰德指数
ari = adjusted_rand_score(df['species'].cat.codes, df['cluster'])
print(f"调整兰德指数: {ari:.4f}")

# 5. EDA报告生成
print("\n" + "=" * 60)
print("鸢尾花数据集EDA报告")
print("=" * 60)

print("\n1. 数据集概述:")
print(f"   - 样本数量: {len(df)}")
print(f"   - 特征数量: {len(iris.feature_names)}")
print(f"   - 类别数量: {len(iris.target_names)}")
print(f"   - 类别分布: {dict(df['species'].value_counts())}")

print("\n2. 主要发现:")
print("   - 花瓣特征比萼片特征更能区分不同种类")
print("   - setosa种类与其他两种有明显区别")
print("   - versicolor和virginica有一定重叠")

print("\n3. 特征重要性:")
print("   - 花瓣长度和花瓣宽度是最具区分性的特征")
print("   - 萼片长度和萼片宽度区分性相对较弱")

print("\n4. 建议:")
print("   - 后续建模可以重点关注花瓣特征")
print("   - 可以考虑创建花瓣比例等新特征")
print("   - 对于versicolor和virginica的区分需要更复杂的模型")
```

## 课后练习

### 练习1：数据概览
1. 选择一个数据集（如泰坦尼克号数据集）
2. 查看数据的基本信息
3. 检查缺失值
4. 查看数据类型

### 练习2：单变量分析
1. 分析数值变量的分布
2. 计算统计量（均值、中位数、标准差）
3. 绘制直方图和箱线图
4. 进行正态性检验

### 练习3：多变量分析
1. 计算相关性矩阵
2. 绘制热力图
3. 分析类别变量之间的关系
4. 进行卡方检验

### 练习4：综合EDA
1. 选择一个完整数据集
2. 进行完整的EDA流程
3. 特征工程
4. 生成EDA报告

## 常见问题

### Q1: EDA需要多长时间？
A: 取决于数据集大小和复杂度，通常需要1-3小时。大型数据集可能需要更长时间。

### Q2: 如何选择分析方法？
A: 根据数据类型选择：
- 数值变量：直方图、箱线图、散点图
- 类别变量：柱状图、饼图、交叉表
- 混合分析：分组统计、小提琴图

### Q3: 如何处理高维数据？
A: 可以使用：
- 降维技术（PCA、t-SNE）
- 特征选择
- 成对关系图（选择部分特征）

### Q4: EDA和统计检验有什么区别？
A: EDA是探索性的，目的是发现模式；统计检验是验证性的，目的是检验假设。

### Q5: 如何记录EDA过程？
A: 可以使用：
- Jupyter Notebook
- 数据报告
- 可视化仪表板

## 下一步学习

完成今天的学习后，建议你：
1. 练习对不同数据集进行EDA
2. 掌握各种分析方法
3. 学习特征工程技巧
4. 准备进入第二阶段的学习：数据分析进阶

恭喜你完成了数据分析基础阶段的学习！明天我们将进入数据分析进阶阶段，学习统计分析基础。