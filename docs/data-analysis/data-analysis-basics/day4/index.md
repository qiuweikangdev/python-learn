# Day 4: 数据可视化基础

## 学习目标

完成今天的学习后，你将能够：
- 掌握matplotlib的基本使用
- 使用seaborn创建统计图表
- 选择合适的图表类型
- 美化和定制图表

## 技术原理

### 数据可视化的重要性

1. **数据探索**：发现数据中的模式和趋势
2. **结果展示**：清晰地传达分析结果
3. **决策支持**：帮助决策者理解数据
4. **故事讲述**：用数据讲述有说服力的故事

### 常用图表类型

#### 比较类图表
1. **柱状图**：比较不同类别的数值
2. **条形图**：水平柱状图
3. **雷达图**：多维度比较

#### 分布类图表
1. **直方图**：显示数据分布
2. **箱线图**：显示数据分布和异常值
3. **小提琴图**：结合箱线图和密度图

#### 关系类图表
1. **散点图**：显示两个变量的关系
2. **气泡图**：三个变量的关系
3. **热力图**：显示矩阵数据的关系

#### 趋势类图表
1. **折线图**：显示时间序列趋势
2. **面积图**：强调数量变化
3. **瀑布图**：显示累积变化

### 图表设计原则

1. **简洁性**：避免不必要的装饰
2. **准确性**：准确表示数据
3. **可读性**：标签、标题清晰
4. **一致性**：颜色、字体统一

## 案例：销售数据可视化

假设我们有一个销售数据集，包含产品、销售额、日期、地区等信息。我们需要创建以下图表：
1. 各产品销售额柱状图
2. 销售趋势折线图
3. 地区销售占比饼图
4. 销售额与数量散点图

## 应用场景

1. **业务报告**：月度、季度销售报告
2. **数据仪表板**：实时监控关键指标
3. **学术论文**：研究结果可视化
4. **新闻报道**：数据新闻可视化
5. **产品展示**：产品功能和数据展示

## 代码案例

### matplotlib基础

```python
# matplotlib基础示例

import matplotlib.pyplot as plt
import numpy as np

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签
plt.rcParams['axes.unicode_minus'] = False  # 用来正常显示负号

# 1. 基本折线图
x = np.linspace(0, 10, 100)  # 生成0到10的100个点
y1 = np.sin(x)  # 计算正弦值
y2 = np.cos(x)  # 计算余弦值

plt.figure(figsize=(10, 6))  # 设置图表大小
plt.plot(x, y1, label='sin(x)', color='blue', linewidth=2)  # 绘制正弦曲线
plt.plot(x, y2, label='cos(x)', color='red', linewidth=2, linestyle='--')  # 绘制余弦曲线
plt.title('正弦和余弦函数')  # 设置标题
plt.xlabel('x')  # 设置x轴标签
plt.ylabel('y')  # 设置y轴标签
plt.legend()  # 显示图例
plt.grid(True, alpha=0.3)  # 显示网格
plt.show()  # 显示图表

# 2. 柱状图
categories = ['A', 'B', 'C', 'D', 'E']
values = [25, 40, 30, 55, 45]

plt.figure(figsize=(8, 6))
bars = plt.bar(categories, values, color=['#FF9999', '#66B2FF', '#99FF99', '#FFCC99', '#FF99CC'])
plt.title('类别分布')  # 设置标题
plt.xlabel('类别')  # 设置x轴标签
plt.ylabel('数值')  # 设置y轴标签

# 在柱状图上显示数值
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
             f'{height}',
             ha='center', va='bottom')

plt.show()

# 3. 散点图
np.random.seed(42)
x = np.random.randn(100)
y = 2 * x + np.random.randn(100) * 0.5

plt.figure(figsize=(8, 6))
plt.scatter(x, y, alpha=0.6, c='blue', edgecolors='black', s=50)
plt.title('散点图示例')
plt.xlabel('X')
plt.ylabel('Y')
plt.grid(True, alpha=0.3)
plt.show()

# 4. 饼图
labels = ['A', 'B', 'C', 'D']
sizes = [15, 30, 45, 10]
colors = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99']
explode = (0, 0.1, 0, 0)  # 突出显示第二块

plt.figure(figsize=(8, 6))
plt.pie(sizes, explode=explode, labels=labels, colors=colors,
        autopct='%1.1f%%', shadow=True, startangle=90)
plt.title('饼图示例')
plt.axis('equal')  # 确保饼图是圆形
plt.show()

# 5. 子图
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 第一个子图：折线图
axes[0, 0].plot([1, 2, 3, 4], [1, 4, 2, 3])
axes[0, 0].set_title('折线图')

# 第二个子图：柱状图
axes[0, 1].bar(['A', 'B', 'C'], [3, 2, 1])
axes[0, 1].set_title('柱状图')

# 第三个子图：散点图
axes[1, 0].scatter([1, 2, 3, 4], [1, 4, 2, 3])
axes[1, 0].set_title('散点图')

# 第四个子图：饼图
axes[1, 1].pie([30, 40, 30], labels=['A', 'B', 'C'])
axes[1, 1].set_title('饼图')

plt.tight_layout()  # 自动调整子图间距
plt.show()
```

### seaborn基础

```python
# seaborn基础示例

import seaborn as sns
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 创建示例数据
np.random.seed(42)
data = {
    'x': np.random.randn(100),
    'y': np.random.randn(100),
    'category': np.random.choice(['A', 'B', 'C'], 100),
    'value': np.random.randn(100) * 10 + 50
}
df = pd.DataFrame(data)

# 1. 散点图（带回归线）
plt.figure(figsize=(10, 6))
sns.regplot(x='x', y='y', data=df, scatter_kws={'alpha':0.5})
plt.title('带回归线的散点图')
plt.show()

# 2. 箱线图
plt.figure(figsize=(10, 6))
sns.boxplot(x='category', y='value', data=df)
plt.title('箱线图')
plt.show()

# 3. 小提琴图
plt.figure(figsize=(10, 6))
sns.violinplot(x='category', y='value', data=df)
plt.title('小提琴图')
plt.show()

# 4. 热力图
# 创建相关性矩阵
corr_matrix = df[['x', 'y', 'value']].corr()

plt.figure(figsize=(8, 6))
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0)
plt.title('相关性热力图')
plt.show()

# 5. 分布图
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# 直方图
sns.histplot(df['value'], bins=20, kde=True, ax=axes[0])
axes[0].set_title('直方图')

# 核密度图
sns.kdeplot(df['value'], ax=axes[1])
axes[1].set_title('核密度图')

# 经验累积分布函数图
sns.ecdfplot(df['value'], ax=axes[2])
axes[2].set_title('经验累积分布函数图')

plt.tight_layout()
plt.show()

# 6. 成对关系图
sns.pairplot(df[['x', 'y', 'value', 'category']], hue='category')
plt.suptitle('成对关系图', y=1.02)
plt.show()
```

### 图表美化

```python
# 图表美化示例

import matplotlib.pyplot as plt
import numpy as np

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 创建示例数据
months = ['1月', '2月', '3月', '4月', '5月', '6月']
sales_2023 = [120, 135, 148, 160, 175, 190]
sales_2024 = [130, 145, 160, 175, 190, 210]

# 1. 基础图表
plt.figure(figsize=(10, 6))
plt.plot(months, sales_2023, marker='o', label='2023年')
plt.plot(months, sales_2024, marker='s', label='2024年')
plt.title('销售趋势对比')
plt.xlabel('月份')
plt.ylabel('销售额（万元）')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 2. 美化后的图表
plt.figure(figsize=(10, 6))

# 使用更专业的颜色
colors = ['#2E86AB', '#A23B72']
markers = ['o', 's']

# 绘制线条
for i, (sales, year, color, marker) in enumerate(zip(
    [sales_2023, sales_2024], 
    ['2023年', '2024年'],
    colors,
    markers
)):
    plt.plot(months, sales, marker=marker, color=color, 
             linewidth=2.5, markersize=8, label=year)
    
    # 添加数据标签
    for x, y in zip(months, sales):
        plt.annotate(f'{y}', (x, y), textcoords="offset points", 
                    xytext=(0, 10), ha='center', fontsize=9)

# 设置标题和标签
plt.title('销售趋势对比', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('月份', fontsize=12)
plt.ylabel('销售额（万元）', fontsize=12)

# 设置刻度
plt.xticks(fontsize=10)
plt.yticks(fontsize=10)

# 设置图例
plt.legend(loc='upper left', fontsize=10, framealpha=0.9)

# 设置网格
plt.grid(True, linestyle='--', alpha=0.3)

# 设置背景色
plt.gca().set_facecolor('#f8f9fa')
plt.gcf().set_facecolor('white')

# 添加水印
plt.text(0.5, 0.5, '数据分析报告', transform=plt.gca().transAxes,
         fontsize=40, color='gray', alpha=0.1, ha='center', va='center')

plt.tight_layout()
plt.show()

# 3. 使用seaborn样式
plt.style.use('seaborn-v0_8-darkgrid')

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 子图1：柱状图
x = np.arange(5)
width = 0.35
axes[0, 0].bar(x - width/2, [20, 35, 30, 35, 27], width, label='产品A', color='#2E86AB')
axes[0, 0].bar(x + width/2, [25, 32, 34, 20, 25], width, label='产品B', color='#A23B72')
axes[0, 0].set_title('产品销售对比')
axes[0, 0].set_xticks(x)
axes[0, 0].set_xticklabels(['周一', '周二', '周三', '周四', '周五'])
axes[0, 0].legend()

# 子图2：饼图
sizes = [35, 30, 20, 15]
labels = ['A', 'B', 'C', 'D']
colors = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99']
axes[0, 1].pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
axes[0, 1].set_title('市场份额')

# 子图3：散点图
np.random.seed(42)
x = np.random.randn(50)
y = 2 * x + np.random.randn(50) * 0.5
axes[1, 0].scatter(x, y, alpha=0.6, c='#2E86AB', edgecolors='black')
axes[1, 0].set_title('相关性分析')
axes[1, 0].set_xlabel('X')
axes[1, 0].set_ylabel('Y')

# 子图4：箱线图
data = [np.random.normal(0, std, 100) for std in range(1, 4)]
axes[1, 1].boxplot(data, labels=['A', 'B', 'C'])
axes[1, 1].set_title('数据分布')

plt.suptitle('数据可视化仪表板', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 恢复默认样式
plt.style.use('default')
```

## 课后练习

### 练习1：matplotlib基础
1. 绘制一个包含正弦和余弦函数的折线图
2. 创建一个柱状图显示5个产品的销售额
3. 绘制一个散点图显示两个变量的关系
4. 创建一个饼图显示数据占比

### 练习2：seaborn使用
1. 使用seaborn创建箱线图
2. 创建热力图显示相关性
3. 绘制小提琴图
4. 创建成对关系图

### 练习3：图表美化
1. 选择一个图表进行美化
2. 添加标题、标签、图例
3. 调整颜色和样式
4. 添加数据标签

### 练习4：综合练习
1. 创建一个包含4个子图的图表
2. 使用不同类型的图表
3. 统一图表风格
4. 添加整体标题

## 常见问题

### Q1: 如何显示中文？
A: 设置字体：
```python
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False
```

### Q2: 如何保存图表？
A: 使用`savefig`方法：
```python
plt.savefig('figure.png', dpi=300, bbox_inches='tight')
```

### Q3: 如何选择图表类型？
A: 根据数据特点选择：
- 比较：柱状图、条形图
- 分布：直方图、箱线图
- 关系：散点图、热力图
- 趋势：折线图、面积图

### Q4: 如何调整图表大小？
A: 使用`figsize`参数：
```python
plt.figure(figsize=(10, 6))
```

### Q5: 如何设置颜色？
A: 可以使用：
- 颜色名称：'red', 'blue'
- 十六进制：'#FF0000'
- RGB元组：(1, 0, 0)
- 颜色映射：'viridis', 'plasma'

## 下一步学习

完成今天的学习后，建议你：
1. 练习创建不同类型的图表
2. 掌握图表美化技巧
3. 学习选择合适的图表类型
4. 准备进入Day 5的学习：探索性数据分析(EDA)

明天我们将学习探索性数据分析，这是数据分析中非常重要的一步。