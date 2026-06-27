# Day 6: 统计分析基础

## 学习目标

完成今天的学习后，你将能够：
- 掌握描述性统计分析
- 理解概率分布
- 进行假设检验
- 计算置信区间

## 技术原理

### 描述性统计

#### 集中趋势
1. **均值**：数据的平均值
2. **中位数**：数据的中间值
3. **众数**：出现次数最多的值

#### 离散程度
1. **方差**：数据的离散程度
2. **标准差**：方差的平方根
3. **极差**：最大值与最小值之差
4. **四分位距**：上四分位数与下四分位数之差

#### 分布形状
1. **偏度**：分布的对称性
2. **峰度**：分布的尖锐程度

### 概率分布

#### 离散分布
1. **伯努利分布**：二元结果
2. **二项分布**：n次伯努利试验
3. **泊松分布**：单位时间/空间内事件发生次数

#### 连续分布
1. **正态分布**：最常见的分布
2. **均匀分布**：等概率分布
3. **指数分布**：事件间隔时间

### 假设检验

#### 基本概念
1. **原假设（H0）**：默认假设
2. **备择假设（H1）**：研究假设
3. **p值**：在原假设下观察到当前结果的概率
4. **显著性水平（α）**：通常为0.05

#### 常用检验
1. **t检验**：均值检验
2. **卡方检验**：独立性检验
3. **ANOVA**：方差分析
4. **非参数检验**：不假设分布

### 置信区间

#### 定义
在一定置信水平下，包含总体参数的区间。

#### 计算方法
1. **已知标准差**：使用正态分布
2. **未知标准差**：使用t分布
3. **比例**：使用二项分布

## 案例：A/B测试分析

假设我们进行了一次网站A/B测试，需要分析：
1. 两组用户的点击率是否有显著差异
2. 计算点击率的置信区间
3. 确定最佳方案

## 应用场景

1. **质量控制**：产品检验、过程控制
2. **医学研究**：临床试验、药物效果评估
3. **市场研究**：用户调研、满意度分析
4. **金融分析**：风险评估、投资决策

## 代码案例

### 描述性统计

```python
# 描述性统计示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 创建示例数据
np.random.seed(42)
data = {
    '数学': np.random.normal(75, 10, 100),
    '语文': np.random.normal(80, 8, 100),
    '英语': np.random.normal(70, 12, 100),
    '物理': np.random.normal(65, 15, 100)
}
df = pd.DataFrame(data)

# 1. 集中趋势
print("集中趋势:")
print("=" * 50)
for col in df.columns:
    print(f"\n{col}:")
    print(f"  均值: {df[col].mean():.2f}")
    print(f"  中位数: {df[col].median():.2f}")
    print(f"  众数: {df[col].mode().values[0]:.2f}")

# 2. 离散程度
print("\n离散程度:")
print("=" * 50)
for col in df.columns:
    print(f"\n{col}:")
    print(f"  方差: {df[col].var():.2f}")
    print(f"  标准差: {df[col].std():.2f}")
    print(f"  极差: {df[col].max() - df[col].min():.2f}")
    print(f"  四分位距: {df[col].quantile(0.75) - df[col].quantile(0.25):.2f}")

# 3. 分布形状
print("\n分布形状:")
print("=" * 50)
for col in df.columns:
    print(f"\n{col}:")
    print(f"  偏度: {df[col].skew():.2f}")
    print(f"  峰度: {df[col].kurtosis():.2f}")

# 4. 完整描述性统计
print("\n完整描述性统计:")
print(df.describe())

# 5. 可视化
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

for i, col in enumerate(df.columns):
    row = i // 2
    col_idx = i % 2
    
    # 直方图
    axes[row, col_idx].hist(df[col], bins=20, edgecolor='black', alpha=0.7, color='skyblue')
    axes[row, col_idx].axvline(df[col].mean(), color='red', linestyle='--', label=f'均值: {df[col].mean():.2f}')
    axes[row, col_idx].axvline(df[col].median(), color='green', linestyle='--', label=f'中位数: {df[col].median():.2f}')
    axes[row, col_idx].set_title(f'{col}分布')
    axes[row, col_idx].legend()

plt.suptitle('各科成绩分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 6. 箱线图比较
plt.figure(figsize=(10, 6))
df.boxplot()
plt.title('各科成绩箱线图比较', fontsize=16, fontweight='bold')
plt.ylabel('分数')
plt.show()
```

### 概率分布

```python
# 概率分布示例

import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 正态分布
fig, axes = plt.subplots(2, 3, figsize=(15, 10))

# 不同参数的正态分布
x = np.linspace(-5, 5, 1000)
params = [(0, 1), (0, 0.5), (0, 2), (1, 1), (-1, 1), (0, 0.2)]

for i, (mu, sigma) in enumerate(params):
    row = i // 3
    col = i % 3
    y = stats.norm.pdf(x, mu, sigma)
    axes[row, col].plot(x, y, linewidth=2)
    axes[row, col].fill_between(x, y, alpha=0.3)
    axes[row, col].set_title(f'μ={mu}, σ={sigma}')
    axes[row, col].set_xlabel('x')
    axes[row, col].set_ylabel('概率密度')
    axes[row, col].grid(True, alpha=0.3)

plt.suptitle('不同参数的正态分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 2. 二项分布
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

n_values = [10, 20, 30]
p_values = [0.3, 0.5, 0.7]

for i, (n, p) in enumerate(zip(n_values, p_values)):
    x = np.arange(0, n + 1)
    y = stats.binom.pmf(x, n, p)
    axes[i].bar(x, y, color='skyblue', edgecolor='black')
    axes[i].set_title(f'n={n}, p={p}')
    axes[i].set_xlabel('成功次数')
    axes[i].set_ylabel('概率')
    axes[i].grid(True, alpha=0.3)

plt.suptitle('二项分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 3. 泊松分布
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

lambda_values = [1, 5, 10]

for i, lam in enumerate(lambda_values):
    x = np.arange(0, 20)
    y = stats.poisson.pmf(x, lam)
    axes[i].bar(x, y, color='lightcoral', edgecolor='black')
    axes[i].set_title(f'λ={lam}')
    axes[i].set_xlabel('事件次数')
    axes[i].set_ylabel('概率')
    axes[i].grid(True, alpha=0.3)

plt.suptitle('泊松分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 4. 指数分布
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

lambda_values = [0.5, 1, 2]

for i, lam in enumerate(lambda_values):
    x = np.linspace(0, 5, 1000)
    y = stats.expon.pdf(x, scale=1/lam)
    axes[i].plot(x, y, linewidth=2, color='green')
    axes[i].fill_between(x, y, alpha=0.3, color='green')
    axes[i].set_title(f'λ={lam}')
    axes[i].set_xlabel('x')
    axes[i].set_ylabel('概率密度')
    axes[i].grid(True, alpha=0.3)

plt.suptitle('指数分布', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 5. 分布拟合
# 生成正态分布数据
np.random.seed(42)
data = np.random.normal(100, 15, 1000)

# 拟合正态分布
mu, sigma = stats.norm.fit(data)
print(f"拟合的正态分布参数: μ={mu:.2f}, σ={sigma:.2f}")

# 绘制拟合结果
plt.figure(figsize=(10, 6))
plt.hist(data, bins=30, density=True, alpha=0.7, color='skyblue', edgecolor='black', label='实际数据')
x = np.linspace(data.min(), data.max(), 100)
y = stats.norm.pdf(x, mu, sigma)
plt.plot(x, y, 'r-', linewidth=2, label=f'正态分布拟合 (μ={mu:.2f}, σ={sigma:.2f})')
plt.title('正态分布拟合', fontsize=16, fontweight='bold')
plt.xlabel('值')
plt.ylabel('概率密度')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 6. 正态性检验
print("\n正态性检验:")
print("=" * 50)

# Shapiro-Wilk检验
stat, p_value = stats.shapiro(data)
print(f"Shapiro-Wilk检验:")
print(f"  统计量: {stat:.4f}")
print(f"  p值: {p_value:.4f}")
if p_value > 0.05:
    print("  -> 不能拒绝正态分布假设")
else:
    print("  -> 拒绝正态分布假设")

# K-S检验
stat, p_value = stats.kstest(data, 'norm', args=(mu, sigma))
print(f"\nK-S检验:")
print(f"  统计量: {stat:.4f}")
print(f"  p值: {p_value:.4f}")
if p_value > 0.05:
    print("  -> 不能拒绝正态分布假设")
else:
    print("  -> 拒绝正态分布假设")
```

### 假设检验

```python
# 假设检验示例

import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 单样本t检验
print("单样本t检验:")
print("=" * 50)

# 假设某班级平均成绩为75分
np.random.seed(42)
sample_scores = np.random.normal(78, 10, 30)  # 样本数据

# 进行单样本t检验
t_stat, p_value = stats.ttest_1samp(sample_scores, 75)
print(f"样本均值: {sample_scores.mean():.2f}")
print(f"t统计量: {t_stat:.4f}")
print(f"p值: {p_value:.4f}")
if p_value < 0.05:
    print("结论: 拒绝原假设，样本均值与75分有显著差异")
else:
    print("结论: 不能拒绝原假设，样本均值与75分无显著差异")

# 2. 双样本t检验
print("\n双样本t检验:")
print("=" * 50)

# 两组学生的成绩
group_a = np.random.normal(75, 10, 30)
group_b = np.random.normal(80, 10, 30)

# 进行双样本t检验
t_stat, p_value = stats.ttest_ind(group_a, group_b)
print(f"A组均值: {group_a.mean():.2f}")
print(f"B组均值: {group_b.mean():.2f}")
print(f"t统计量: {t_stat:.4f}")
print(f"p值: {p_value:.4f}")
if p_value < 0.05:
    print("结论: 拒绝原假设，两组成绩有显著差异")
else:
    print("结论: 不能拒绝原假设，两组成绩无显著差异")

# 3. 配对t检验
print("\n配对t检验:")
print("=" * 50)

# 同一组学生前后两次测试成绩
before = np.random.normal(70, 10, 30)
after = before + np.random.normal(5, 3, 30)  # 假设有所提高

# 进行配对t检验
t_stat, p_value = stats.ttest_rel(before, after)
print(f"前测均值: {before.mean():.2f}")
print(f"后测均值: {after.mean():.2f}")
print(f"t统计量: {t_stat:.4f}")
print(f"p值: {p_value:.4f}")
if p_value < 0.05:
    print("结论: 拒绝原假设，前后成绩有显著差异")
else:
    print("结论: 不能拒绝原假设，前后成绩无显著差异")

# 4. 卡方检验
print("\n卡方检验:")
print("=" * 50)

# 创建列联表
# 假设调查不同性别的购买偏好
data = pd.DataFrame({
    '性别': ['男', '男', '男', '女', '女', '女'],
    '偏好': ['A', 'B', 'C', 'A', 'B', 'C'],
    '数量': [20, 30, 50, 40, 40, 20]
})

# 创建列联表
contingency_table = data.pivot(index='性别', columns='偏好', values='数量')
print("列联表:")
print(contingency_table)

# 进行卡方检验
chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
print(f"\n卡方统计量: {chi2:.4f}")
print(f"p值: {p_value:.4f}")
print(f"自由度: {dof}")
if p_value < 0.05:
    print("结论: 拒绝原假设，性别与购买偏好有关")
else:
    print("结论: 不能拒绝原假设，性别与购买偏好无关")

# 5. ANOVA（方差分析）
print("\nANOVA（方差分析）:")
print("=" * 50)

# 三组学生的成绩
group1 = np.random.normal(75, 10, 30)
group2 = np.random.normal(80, 10, 30)
group3 = np.random.normal(85, 10, 30)

# 进行单因素方差分析
f_stat, p_value = stats.f_oneway(group1, group2, group3)
print(f"组1均值: {group1.mean():.2f}")
print(f"组2均值: {group2.mean():.2f}")
print(f"组3均值: {group3.mean():.2f}")
print(f"F统计量: {f_stat:.4f}")
print(f"p值: {p_value:.4f}")
if p_value < 0.05:
    print("结论: 拒绝原假设，至少有一组与其他组有显著差异")
else:
    print("结论: 不能拒绝原假设，各组之间无显著差异")

# 6. 可视化假设检验结果
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 单样本t检验可视化
axes[0, 0].hist(sample_scores, bins=15, edgecolor='black', alpha=0.7, color='skyblue')
axes[0, 0].axvline(75, color='red', linestyle='--', label='假设均值=75')
axes[0, 0].axvline(sample_scores.mean(), color='green', linestyle='--', label=f'样本均值={sample_scores.mean():.2f}')
axes[0, 0].set_title('单样本t检验')
axes[0, 0].legend()

# 双样本t检验可视化
axes[0, 1].hist(group_a, bins=15, alpha=0.7, label='A组', color='skyblue')
axes[0, 1].hist(group_b, bins=15, alpha=0.7, label='B组', color='lightcoral')
axes[0, 1].set_title('双样本t检验')
axes[0, 1].legend()

# 配对t检验可视化
x = np.arange(len(before))
axes[1, 0]..scatter(x, before, alpha=0.7, label='前测', color='skyblue')
axes[1, 0].scatter(x, after, alpha=0.7, label='后测', color='lightcoral')
axes[1, 0].set_title('配对t检验')
axes[1, 0].legend()

# ANOVA可视化
data_anova = [group1, group2, group3]
axes[1, 1].boxplot(data_anova, labels=['组1', '组2', '组3'])
axes[1, 1].set_title('ANOVA')

plt.suptitle('假设检验可视化', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 置信区间

```python
# 置信区间示例

import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 已知标准差的置信区间
print("已知标准差的置信区间:")
print("=" * 50)

np.random.seed(42)
data = np.random.normal(100, 15, 100)
n = len(data)
sigma = 15  # 已知总体标准差
confidence_level = 0.95

# 计算置信区间
z_score = stats.norm.ppf(1 - (1 - confidence_level) / 2)
margin_of_error = z_score * sigma / np.sqrt(n)
ci_lower = data.mean() - margin_of_error
ci_upper = data.mean() + margin_of_error

print(f"样本均值: {data.mean():.2f}")
print(f"置信水平: {confidence_level * 100}%")
print(f"置信区间: [{ci_lower:.2f}, {ci_upper:.2f}]")
print(f"误差范围: {margin_of_error:.2f}")

# 2. 未知标准差的置信区间（使用t分布）
print("\n未知标准差的置信区间:")
print("=" * 50)

# 使用t分布
t_score = stats.t.ppf(1 - (1 - confidence_level) / 2, df=n-1)
margin_of_error_t = t_score * data.std() / np.sqrt(n)
ci_lower_t = data.mean() - margin_of_error_t
ci_upper_t = data.mean() + margin_of_error_t

print(f"样本均值: {data.mean():.2f}")
print(f"样本标准差: {data.std():.2f}")
print(f"置信水平: {confidence_level * 100}%")
print(f"置信区间: [{ci_lower_t:.2f}, {ci_upper_t:.2f}]")
print(f"误差范围: {margin_of_error_t:.2f}")

# 3. 比例的置信区间
print("\n比例的置信区间:")
print("=" * 50)

# 假设调查1000人，600人支持某政策
n = 1000
x = 600
p_hat = x / n
confidence_level = 0.95

# 计算置信区间
z_score = stats.norm.ppf(1 - (1 - confidence_level) / 2)
margin_of_error = z_score * np.sqrt(p_hat * (1 - p_hat) / n)
ci_lower = p_hat - margin_of_error
ci_upper = p_hat + margin_of_error

print(f"样本比例: {p_hat:.4f}")
print(f"置信水平: {confidence_level * 100}%")
print(f"置信区间: [{ci_lower:.4f}, {ci_upper:.4f}]")
print(f"误差范围: {margin_of_error:.4f}")

# 4. 不同置信水平的比较
print("\n不同置信水平的比较:")
print("=" * 50)

confidence_levels = [0.90, 0.95, 0.99]
for cl in confidence_levels:
    z_score = stats.norm.ppf(1 - (1 - cl) / 2)
    margin_of_error = z_score * sigma / np.sqrt(n)
    ci_lower = data.mean() - margin_of_error
    ci_upper = data.mean() + margin_of_error
    print(f"{cl*100}%置信区间: [{ci_lower:.2f}, {ci_upper:.2f}], 误差范围: {margin_of_error:.2f}")

# 5. 可视化置信区间
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# 不同样本量的置信区间
sample_sizes = [30, 100, 300]
for i, n in enumerate(sample_sizes):
    sample = np.random.normal(100, 15, n)
    se = sample.std() / np.sqrt(n)
    ci_lower = sample.mean() - 1.96 * se
    ci_upper = sample.mean() + 1.96 * se
    
    axes[i].errorbar(0, sample.mean(), yerr=[[sample.mean() - ci_lower], [ci_upper - sample.mean()]], 
                     fmt='o', capsize=5, capthick=2, markersize=10)
    axes[i].axhline(100, color='red', linestyle='--', label='总体均值=100')
    axes[i].set_title(f'样本量={n}')
    axes[i].set_ylabel('均值')
    axes[i].legend()
    axes[i].set_xlim(-0.5, 0.5)
    axes[i].grid(True, alpha=0.3)

plt.suptitle('不同样本量的95%置信区间', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 6. 置信区间与假设检验的关系
print("\n置信区间与假设检验的关系:")
print("=" * 50)

# 如果置信区间不包含假设值，则拒绝原假设
hypothesized_mean = 105
ci_lower, ci_upper = data.mean() - 1.96 * data.std() / np.sqrt(n), data.mean() + 1.96 * data.std() / np.sqrt(n)

print(f"假设均值: {hypothesized_mean}")
print(f"95%置信区间: [{ci_lower:.2f}, {ci_upper:.2f}]")
if ci_lower <= hypothesized_mean <= ci_upper:
    print("结论: 置信区间包含假设值，不能拒绝原假设")
else:
    print("结论: 置信区间不包含假设值，拒绝原假设")
```

## 课后练习

### 练习1：描述性统计
1. 选择一个数据集
2. 计算集中趋势指标
3. 计算离散程度指标
4. 分析分布形状

### 练习2：概率分布
1. 生成不同参数的正态分布数据
2. 绘制概率密度函数
3. 进行分布拟合
4. 进行正态性检验

### 练习3：假设检验
1. 进行单样本t检验
2. 进行双样本t检验
3. 进行卡方检验
4. 进行方差分析

### 练习4：置信区间
1. 计算均值的置信区间
2. 计算比例的置信区间
3. 比较不同置信水平
4. 分析样本量的影响

## 常见问题

### Q1: 如何选择合适的检验方法？
A: 根据数据类型和研究问题选择：
- 均值比较：t检验
- 比例比较：卡方检验
- 多组比较：ANOVA
- 非参数数据：非参数检验

### Q2: p值小于0.05就一定有意义吗？
A: 不一定。p值只表示统计显著性，还需要考虑效应大小和实际意义。

### Q3: 置信区间越窄越好吗？
A: 是的，窄置信区间表示估计更精确。可以通过增加样本量来缩小置信区间。

### Q4: 如何处理多重比较问题？
A: 可以使用校正方法，如Bonferroni校正、FDR校正等。

### Q5: 假设检验的前提条件有哪些？
A: 主要包括：
- 数据独立性
- 正态性（对于参数检验）
- 方差齐性（对于t检验和ANOVA）

## 下一步学习

完成今天的学习后，建议你：
1. 练习各种统计检验方法
2. 理解不同检验的适用条件
3. 学习如何解释检验结果
4. 准备进入Day 7的学习：时间序列分析

明天我们将学习时间序列分析，这是处理时间相关数据的重要技能。