# Day 2: Python基础与数据处理

## 学习目标

完成今天的学习后，你将能够：
- 掌握Python基础语法和数据类型
- 理解pandas的核心数据结构
- 使用pandas进行数据读取和保存
- 掌握数据筛选、排序和聚合操作

## 技术原理

### Python基础回顾

#### 数据类型
1. **数值类型**：int（整数）、float（浮点数）
2. **字符串类型**：str（文本数据）
3. **布尔类型**：bool（True/False）
4. **容器类型**：list（列表）、dict（字典）、tuple（元组）、set（集合）

#### 控制结构
1. **条件语句**：if-elif-else
2. **循环语句**：for循环、while循环
3. **列表推导式**：简洁创建列表

### pandas核心概念

#### Series
- 一维标签数组
- 可以包含任何类型的数据
- 具有索引

#### DataFrame
- 二维表格数据结构
- 列可以有不同的数据类型
- 具有行索引和列索引

### 数据读写

pandas支持多种数据格式：
1. **CSV**：逗号分隔值文件
2. **Excel**：Excel文件
3. **JSON**：JSON格式
4. **SQL**：数据库查询
5. **HTML**：网页表格

## 案例：学生成绩分析

假设我们有一个学生成绩数据集，包含学生姓名、科目、成绩等信息。我们需要：
1. 读取数据
2. 清洗数据
3. 计算每个学生的平均成绩
4. 找出成绩最好的科目
5. 保存处理后的数据

## 应用场景

1. **数据导入导出**：从各种格式读取数据，保存为不同格式
2. **数据清洗**：处理缺失值、重复值、异常值
3. **数据转换**：数据类型转换、列操作
4. **数据聚合**：分组统计、透视表
5. **数据合并**：多个数据集的合并操作

## 代码案例

### Python基础语法

```python
# Python基础语法示例

# 1. 变量和数据类型
name = "张三"  # 字符串类型
age = 20  # 整数类型
score = 88.5  # 浮点数类型
is_student = True  # 布尔类型

# 打印变量和类型
print(f"姓名: {name}, 类型: {type(name)}")
print(f"年龄: {age}, 类型: {type(age)}")
print(f"成绩: {score}, 类型: {type(score)}")
print(f"是否学生: {is_student}, 类型: {type(is_student)}")

# 2. 列表操作
scores = [85, 92, 78, 96, 88]  # 创建列表
print(f"成绩列表: {scores}")
print(f"第一个成绩: {scores[0]}")  # 索引访问
print(f"成绩数量: {len(scores)}")  # 列表长度
print(f"平均成绩: {sum(scores)/len(scores)}")  # 计算平均值

# 3. 字典操作
student = {
    '姓名': '李四',
    '年龄': 21,
    '成绩': [85, 92, 78]
}
print(f"学生信息: {student}")
print(f"学生姓名: {student['姓名']}")  # 访问字典值

# 4. 条件语句
score = 85
if score >= 90:
    grade = 'A'
elif score >= 80:
    grade = 'B'
elif score >= 70:
    grade = 'C'
else:
    grade = 'D'
print(f"成绩{score}对应等级: {grade}")

# 5. 循环语句
# for循环遍历列表
for i, score in enumerate(scores):
    print(f"第{i+1}个成绩: {score}")

# 列表推导式
squared_scores = [score**2 for score in scores]
print(f"成绩的平方: {squared_scores}")
```

### pandas基础操作

```python
# pandas基础操作示例

import pandas as pd  # 导入pandas库
import numpy as np  # 导入numpy库

# 1. 创建Series
# 从列表创建Series
scores_series = pd.Series([85, 92, 78, 96, 88], 
                         index=['语文', '数学', '英语', '物理', '化学'],
                         name='成绩')
print("成绩Series:")
print(scores_series)

# 2. 创建DataFrame
# 从字典创建DataFrame
student_data = {
    '姓名': ['张三', '李四', '王五', '赵六', '钱七'],
    '语文': [85, 92, 78, 96, 88],
    '数学': [90, 88, 95, 85, 92],
    '英语': [78, 85, 88, 90, 78],
    '班级': ['一班', '二班', '一班', '二班', '一班']
}
df = pd.DataFrame(student_data)
print("\n学生DataFrame:")
print(df)

# 3. 查看数据基本信息
print("\n数据形状:", df.shape)
print("\n数据类型:")
print(df.dtypes)
print("\n数据信息:")
print(df.info())

# 4. 数据选择
# 选择单列
print("\n姓名列:")
print(df['姓名'])

# 选择多列
print("\n姓名和语文成绩:")
print(df[['姓名', '语文']])

# 选择行（使用iloc）
print("\n前3行数据:")
print(df.iloc[:3])

# 选择行（使用loc）
print("\n姓名为张三的数据:")
print(df[df['姓名'] == '张三'])

# 5. 数据排序
# 按语文成绩排序
print("\n按语文成绩排序:")
print(df.sort_values('语文', ascending=False))

# 6. 数据聚合
# 计算每科平均分
print("\n各科平均分:")
print(df[['语文', '数学', '英语']].mean())

# 按班级分组计算平均分
print("\n各班级平均分:")
print(df.groupby('班级'][['语文', '数学', '英语']].mean())
```

### 数据读取和保存

```python
# 数据读取和保存示例

import pandas as pd
import os

# 1. 创建示例数据并保存为CSV
data = {
    '产品': ['A', 'B', 'C', 'D', 'E'],
    '价格': [100, 200, 150, 300, 250],
    '销量': [50, 30, 45, 20, 35]
}
df = pd.DataFrame(data)

# 保存为CSV文件
df.to_csv('products.csv', index=False, encoding='utf-8-sig')
print("数据已保存到products.csv")

# 2. 读取CSV文件
df_loaded = pd.read_csv('products.csv')
print("\n从CSV加载的数据:")
print(df_loaded)

# 3. 保存为Excel文件
df.to_excel('products.xlsx', index=False, sheet_name='产品数据')
print("\n数据已保存到products.xlsx")

# 4. 读取Excel文件
df_excel = pd.read_excel('products.xlsx')
print("\n从Excel加载的数据:")
print(df_excel)

# 5. 保存为JSON文件
df.to_json('products.json', orient='records', force_ascii=False, indent=2)
print("\n数据已保存到products.json")

# 6. 读取JSON文件
df_json = pd.read_json('products.json')
print("\n从JSON加载的数据:")
print(df_json)

# 7. 清理临时文件
os.remove('products.csv')
os.remove('products.xlsx')
os.remove('products.json')
print("\n临时文件已清理")
```

## 课后练习

### 练习1：Python基础
1. 创建一个包含5个学生信息的字典（姓名、年龄、成绩）
2. 使用循环打印每个学生的信息
3. 计算所有学生的平均成绩
4. 找出成绩最高的学生

### 练习2：pandas操作
1. 创建一个包含10行数据的DataFrame
2. 查看数据的基本信息
3. 选择特定的行和列
4. 对数据进行排序
5. 计算基本统计量

### 练习3：数据读写
1. 从网上下载一个CSV数据集
2. 使用pandas读取数据
3. 查看数据的前10行
4. 将数据保存为Excel格式
5. 重新读取保存的数据

## 常见问题

### Q1: pandas中Series和DataFrame有什么区别？
A: Series是一维数据结构，类似于带标签的数组；DataFrame是二维表格数据结构，由多个Series组成。

### Q2: 如何处理大型数据集？
A: 可以使用以下方法：
1. 使用`chunksize`参数分块读取
2. 选择需要的数据列
3. 优化数据类型
4. 使用更高效的数据格式（如parquet）

### Q3: 数据读取时出现编码错误怎么办？
A: 尝试指定编码格式：
```python
df = pd.read_csv('file.csv', encoding='utf-8')
# 或者
df = pd.read_csv('file.csv', encoding='gbk')
```

### Q4: 如何处理缺失值？
A: 可以使用以下方法：
1. `dropna()`删除缺失值
2. `fillna()`填充缺失值
3. `isna()`检测缺失值

### Q5: 数据类型不匹配怎么办？
A: 使用`astype()`方法转换数据类型：
```python
df['column'] = df['column'].astype('int')
```

## 下一步学习

完成今天的学习后，建议你：
1. 熟练掌握pandas的基本操作
2. 尝试处理真实的数据集
3. 学习数据清洗的基本方法
4. 准备进入Day 3的学习：数据清洗与预处理

明天我们将学习数据清洗和预处理，这是数据分析中非常重要的一步。