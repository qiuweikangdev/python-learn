# Day 3: 数据清洗与预处理

## 学习目标

完成今天的学习后，你将能够：
- 识别和处理缺失值
- 检测和处理异常值
- 进行数据类型转换
- 掌握数据标准化和归一化

## 技术原理

### 缺失值处理

#### 缺失值类型
1. **完全随机缺失（MCAR）**：缺失与任何变量无关
2. **随机缺失（MAR）**：缺失与其他变量相关
3. **非随机缺失（MNAR）**：缺失与缺失值本身相关

#### 处理方法
1. **删除**：删除包含缺失值的行或列
2. **填充**：使用均值、中位数、众数等填充
3. **插值**：使用插值方法估计缺失值
4. **模型预测**：使用机器学习模型预测缺失值

### 异常值处理

#### 异常值检测方法
1. **3σ原则**：超过3个标准差的值
2. **IQR方法**：基于四分位距
3. **Z-score**：标准化后的值
4. **可视化**：箱线图、散点图

#### 处理方法
1. **删除**：删除异常值
2. **替换**：用边界值替换
3. **转换**：对数转换、平方根转换
4. **分箱**：将连续变量分箱

### 数据类型转换

1. **数值类型**：int、float
2. **字符串类型**：str
3. **日期类型**：datetime
4. **类别类型**：category
5. **布尔类型**：bool

### 数据标准化

1. **Min-Max标准化**：缩放到[0,1]区间
2. **Z-score标准化**：均值为0，标准差为1
3. **小数定标标准化**：缩放到[-1,1]区间
4. **对数转换**：处理偏态分布

## 案例：电商用户数据清洗

假设我们有一个电商用户数据集，包含用户ID、年龄、收入、购买金额等信息。数据存在以下问题：
1. 年龄列有缺失值
2. 收入列有异常值（负值或极大值）
3. 购买金额数据类型不一致
4. 需要标准化处理

## 应用场景

1. **数据预处理**：为机器学习准备干净的数据
2. **数据质量提升**：提高数据准确性和一致性
3. **异常检测**：识别欺诈、故障等异常情况
4. **数据集成**：合并来自不同来源的数据

## 代码案例

### 缺失值处理

```python
# 缺失值处理示例

import pandas as pd
import numpy as np

# 创建包含缺失值的示例数据
data = {
    '姓名': ['张三', '李四', '王五', '赵六', '钱七'],
    '年龄': [25, 30, np.nan, 35, 28],
    '收入': [5000, 8000, 6000, np.nan, 7000],
    '城市': ['北京', '上海', '广州', np.nan, '深圳']
}
df = pd.DataFrame(data)
print("原始数据:")
print(df)

# 1. 检测缺失值
print("\n缺失值检测:")
print(df.isna())  # 显示缺失值布尔矩阵
print("\n每列缺失值数量:")
print(df.isna().sum())  # 统计每列缺失值数量
print("\n缺失值比例:")
print(df.isna().mean() * 100)  # 计算缺失值比例

# 2. 删除缺失值
# 删除包含缺失值的行
df_dropped = df.dropna()
print("\n删除缺失值后的数据:")
print(df_dropped)

# 3. 填充缺失值
# 使用均值填充数值列
df_filled = df.copy()
df_filled['年龄'].fillna(df['年龄'].mean(), inplace=True)
df_filled['收入'].fillna(df['收入'].median(), inplace=True)
df_filled['城市'].fillna('未知', inplace=True)
print("\n填充缺失值后的数据:")
print(df_filled)

# 4. 使用前向填充
df_ffill = df.fillna(method='ffill')
print("\n前向填充后的数据:")
print(df_ffill)

# 5. 使用后向填充
df_bfill = df.fillna(method='bfill')
print("\n后向填充后的数据:")
print(df_bfill)
```

### 异常值处理

```python
# 异常值处理示例

import pandas as pd
import numpy as np

# 创建包含异常值的示例数据
np.random.seed(42)  # 设置随机种子，确保结果可重现
normal_data = np.random.normal(100, 10, 100)  # 生成正态分布数据
outliers = [200, 250, 300, -50, -100]  # 添加异常值
data = np.concatenate([normal_data, outliers])

df = pd.DataFrame({'数值': data})
print("原始数据统计:")
print(df.describe())

# 1. 使用3σ原则检测异常值
mean = df['数值'].mean()
std = df['数值'].std()
lower_bound = mean - 3 * std
upper_bound = mean + 3 * std

outliers_3sigma = df[(df['数值'] < lower_bound) | (df['数值'] > upper_bound)]
print(f"\n3σ原则检测到的异常值:")
print(outliers_3sigma)

# 2. 使用IQR方法检测异常值
Q1 = df['数值'].quantile(0.25)
Q3 = df['数值'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

outliers_iqr = df[(df['数值'] < lower_bound) | (df['数值'] > upper_bound)]
print(f"\nIQR方法检测到的异常值:")
print(outliers_iqr)

# 3. 处理异常值
# 删除异常值
df_cleaned = df[(df['数值'] >= lower_bound) & (df['数值'] <= upper_bound)]
print(f"\n删除异常值后的数据形状: {df_cleaned.shape}")

# 替换异常值为边界值
df_replaced = df.copy()
df_replaced.loc[df_replaced['数值'] < lower_bound, '数值'] = lower_bound
df_replaced.loc[df_replaced['数值'] > upper_bound, '数值'] = upper_bound
print(f"\n替换异常值后的数据统计:")
print(df_replaced.describe())

# 4. 可视化异常值
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# 箱线图
axes[0].boxplot(df['数值'])
axes[0].set_title('原始数据箱线图')
axes[0].set_ylabel('数值')

# 直方图
axes[1].hist(df['数值'], bins=20, edgecolor='black')
axes[1].set_title('原始数据直方图')
axes[1].set_xlabel('数值')
axes[1].set_ylabel('频数')

# 清洗后数据的箱线图
axes[2].boxplot(df_cleaned['数值'])
axes[2].set_title('清洗后数据箱线图')
axes[2].set_ylabel('数值')

plt.tight_layout()
plt.show()
```

### 数据类型转换

```python
# 数据类型转换示例

import pandas as pd
import numpy as np

# 创建示例数据
data = {
    'ID': ['001', '002', '003', '004', '005'],
    '年龄': ['25', '30', '35', '28', '32'],
    '入职日期': ['2020-01-15', '2019-06-20', '2021-03-10', '2020-11-05', '2018-08-25'],
    '薪资': ['5000.50', '8000.75', '6000.25', '7000.00', '9000.50'],
    '是否在职': ['是', '是', '否', '是', '是']
}
df = pd.DataFrame(data)
print("原始数据:")
print(df)
print("\n原始数据类型:")
print(df.dtypes)

# 1. 转换为数值类型
df['年龄'] = pd.to_numeric(df['年龄'], errors='coerce')
df['薪资'] = pd.to_numeric(df['薪资'], errors='coerce')
print("\n转换数值类型后:")
print(df.dtypes)

# 2. 转换为日期类型
df['入职日期'] = pd.to_datetime(df['入职日期'])
print("\n转换日期类型后:")
print(df.dtypes)
print("\n日期列信息:")
print(df['入职日期'])

# 3. 转换为类别类型
df['是否在职'] = df['是否在职'].astype('category')
print("\n转换类别类型后:")
print(df.dtypes)
print("\n类别信息:")
print(df['是否在职'].cat.categories)

# 4. 转换为字符串类型
df['ID'] = df['ID'].astype('str')
print("\n转换字符串类型后:")
print(df.dtypes)

# 5. 数据类型转换的实际应用
# 从日期中提取年份、月份、星期
df['入职年份'] = df['入职日期'].dt.year
df['入职月份'] = df['入职日期'].dt.month
df['入职星期'] = df['入职日期'].dt.day_name()

print("\n提取日期信息后:")
print(df[['入职日期', '入职年份', '入职月份', '入职星期']])
```

### 数据标准化

```python
# 数据标准化示例

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler

# 创建示例数据
data = {
    '姓名': ['张三', '李四', '王五', '赵六', '钱七'],
    '年龄': [25, 30, 35, 28, 32],
    '收入': [5000, 8000, 6000, 7000, 9000],
    '消费': [2000, 3500, 2500, 3000, 4000]
}
df = pd.DataFrame(data)
print("原始数据:")
print(df)

# 1. Min-Max标准化
scaler_minmax = MinMaxScaler()
df_minmax = df.copy()
df_minmax[['年龄', '收入', '消费']] = scaler_minmax.fit_transform(df[['年龄', '收入', '消费']])
print("\nMin-Max标准化后的数据:")
print(df_minmax)

# 2. Z-score标准化
scaler_standard = StandardScaler()
df_standard = df.copy()
df_standard[['年龄', '收入', '消费']] = scaler_standard.fit_transform(df[['年龄', '收入', '消费']])
print("\nZ-score标准化后的数据:")
print(df_standard)

# 3. 手动Min-Max标准化
def manual_minmax(series):
    return (series - series.min()) / (series.max() - series.min())

df_manual = df.copy()
df_manual['年龄_normalized'] = manual_minmax(df['年龄'])
df_manual['收入_normalized'] = manual_minmax(df['收入'])
print("\n手动Min-Max标准化:")
print(df_manual)

# 4. 对数转换
df_log = df.copy()
df_log['收入_log'] = np.log1p(df['收入'])  # log1p = log(1 + x)
print("\n对数转换后的数据:")
print(df_log)

# 5. 可视化标准化效果
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 原始数据
axes[0, 0].bar(df['姓名'], df['收入'])
axes[0, 0].set_title('原始收入数据')
axes[0, 0].set_ylabel('收入')

# Min-Max标准化
axes[0, 1].bar(df['姓名'], df_minmax['收入'])
axes[0, 1].set_title('Min-Max标准化后的收入')
axes[0, 1].set_ylabel('标准化值')

# Z-score标准化
axes[1, 0].bar(df['姓名'], df_standard['收入'])
axes[1, 0].set_title('Z-score标准化后的收入')
axes[1, 0].set_ylabel('标准化值')

# 对数转换
axes[1, 1].bar(df['姓名'], df_log['收入_log'])
axes[1, 1].set_title('对数转换后的收入')
axes[1, 1].set_ylabel('对数值')

plt.tight_layout()
plt.show()
```

## 课后练习

### 练习1：缺失值处理
1. 创建一个包含缺失值的数据集
2. 检测缺失值的位置和数量
3. 使用不同的方法填充缺失值
4. 比较不同填充方法的效果

### 练习2：异常值处理
1. 生成一个包含异常值的数据集
2. 使用3σ原则和IQR方法检测异常值
3. 删除异常值并比较处理前后的统计量
4. 绘制箱线图可视化异常值

### 练习3：数据类型转换
1. 创建一个混合数据类型的数据集
2. 将字符串转换为数值类型
3. 将字符串转换为日期类型
4. 提取日期中的年、月、日信息

### 练习4：数据标准化
1. 创建一个数值范围差异较大的数据集
2. 使用Min-Max标准化
3. 使用Z-score标准化
4. 比较两种方法的适用场景

## 常见问题

### Q1: 应该删除还是填充缺失值？
A: 取决于缺失值的比例和数据特点：
- 缺失比例小（<5%）：可以删除
- 缺失比例大：考虑填充
- 数据重要：尽量填充而非删除

### Q2: 如何选择异常值处理方法？
A: 根据业务场景选择：
- 数据错误：删除或修正
- 真实异常：保留或单独分析
- 业务异常：根据业务规则处理

### Q3: 什么时候需要数据标准化？
A: 以下情况需要标准化：
- 不同量纲的特征
- 距离计算算法（如KNN、SVM）
- 梯度下降优化
- 正则化处理

### Q4: 如何处理类别型数据？
A: 可以使用以下方法：
- 标签编码：有序类别
- 独热编码：无序类别
- 目标编码：高基数类别

### Q5: 数据预处理顺序是什么？
A: 推荐顺序：
1. 数据类型转换
2. 缺失值处理
3. 异常值处理
4. 数据标准化
5. 特征工程

## 下一步学习

完成今天的学习后，建议你：
1. 练习处理真实数据中的缺失值和异常值
2. 掌握不同数据类型转换方法
3. 理解数据标准化的应用场景
4. 准备进入Day 4的学习：数据可视化基础

明天我们将学习数据可视化，这是数据分析中展示结果的重要技能。