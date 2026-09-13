# Day 1: 数据分析概述与环境搭建

> **版本基线**：本文基于 Python 3.12+ / pandas 3.x（CoW 默认开启）/ numpy 2.x，更新于 2026-09。

## 学习目标

完成今天的学习后，你将能够：
- 理解数据分析的定义和价值
- 掌握数据分析的基本流程
- 搭建Python数据分析环境
- 了解常用的数据分析工具

## 技术原理

### 什么是数据分析？

数据分析是指通过收集、处理、分析和解释数据，从中提取有价值信息和知识的过程。它结合了统计学、计算机科学和领域知识，帮助人们做出更好的决策。

### 数据分析的价值

1. **决策支持**：基于数据而非直觉做决策
2. **问题发现**：识别业务中的问题和机会
3. **趋势预测**：预测未来趋势和行为
4. **效率提升**：优化流程，提高效率

### 数据分析流程

1. **问题定义**：明确分析目标和问题
2. **数据收集**：获取相关数据
3. **数据清洗**：处理缺失值、异常值等
4. **数据探索**：了解数据的基本特征
5. **数据分析**：应用分析方法
6. **结果展示**：可视化展示分析结果
7. **决策建议**：基于分析结果提出建议

### 常用工具

1. **Python**：主要编程语言
2. **pandas**：数据处理库
3. **numpy**：数值计算库
4. **matplotlib/seaborn**：数据可视化库
5. **jupyter**：交互式开发环境
6. **scikit-learn**：机器学习库

### 现代分析工具生态

pandas 依然是数据分析的主流基础，但 2026 年的现代分析栈里还有几个值得认识的工具，它们与 pandas 互补而非替代：

- **polars**：基于 Rust 实现的新一代 DataFrame 库，天然多线程并支持惰性求值，处理大规模数据集时通常显著快于 pandas，API 也更现代化。当 pandas 遇到性能瓶颈时，它是首选替代方案。
- **duckdb**：进程内 SQL 分析引擎（可以理解为"本地就能跑的 OLAP 数据库"），无需搭建数据库服务即可直接用 SQL 查询 CSV、Parquet 等文件，与 pandas 互转方便，适合习惯 SQL 的分析场景。
- **pydantic**：Python 数据校验的事实标准，通过声明式模型（`BaseModel` + 字段约束）对数据的类型、取值范围做严格校验，常用于数据管道中"清洗结果是否合格"的质量把关。

::: tip
本系列以 pandas 为主线展开；pydantic 会在 Day 3 数据清洗中用来校验清洗结果，polars 与 duckdb 适合在你遇到性能瓶颈或偏好 SQL 时再自行扩展。
:::

## 案例：销售数据分析

假设我们有一个销售数据集，包含产品、销售额、日期等信息。通过数据分析，我们可以：
- 识别最畅销的产品
- 分析销售趋势
- 发现季节性模式
- 预测未来销售

## 应用场景

1. **商业分析**：销售分析、用户行为分析、市场分析
2. **金融分析**：股票分析、风险评估、投资组合优化
3. **医疗健康**：患者数据分析、疾病预测、治疗效果评估
4. **社交媒体**：舆情分析、用户画像、内容推荐
5. **物联网**：设备监控、预测性维护、能耗分析

## 代码案例

### 环境搭建

2026 年 Python 环境与依赖管理的事实标准是 [uv](https://docs.astral.sh/uv/)：它用 Rust 实现，创建虚拟环境和安装依赖比传统 pip/venv 快一个数量级，还能自动下载管理 Python 解释器本身。推荐按下面的流程搭建本系列所需的环境。

#### 方式一：uv（推荐）

```bash
# 1. 安装 uv
# macOS / Linux：
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows（PowerShell）：
# powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 2. 在项目目录创建虚拟环境（uv 会按需自动安装 Python 3.12+）
uv venv
source .venv/bin/activate   # Linux/Mac；Windows 执行 .venv\Scripts\activate

# 3. 一条命令安装本系列全部依赖
uv pip install pandas numpy matplotlib seaborn jupyter scikit-learn
```

::: tip 项目模式：uv add
对于长期维护的分析项目，推荐使用 uv 的项目模式：依赖写入 `pyproject.toml`，并自动生成 `uv.lock` 锁定文件，团队协作时版本完全一致。
```bash
uv init my-analysis && cd my-analysis
uv add pandas numpy matplotlib seaborn jupyter scikit-learn
uv run jupyter notebook   # uv run 会自动使用项目虚拟环境，无需手动激活
```
:::

#### 方式二：pip + venv（传统方式对照）

不使用 uv 也可以用 Python 标准库的 venv + pip 完成同样的工作：

```bash
# 创建并激活虚拟环境
python -m venv .venv
source .venv/bin/activate   # Linux/Mac；Windows 执行 .venv\Scripts\activate

# 安装本系列所需的库（对应 uv 版命令：uv pip install pandas numpy ...）
pip install pandas numpy matplotlib seaborn jupyter scikit-learn
```

::: tip 关于 Anaconda / conda
Anaconda 是面向数据科学的 Python 发行版，内置大量预编译的科学计算包，适合离线环境或依赖 conda 生态的场景，但安装包体积大、启动慢。对数据分析学习而言，轻量的 uv 方案已经足够；如果你已在用 conda，继续用 `conda install pandas numpy matplotlib seaborn jupyter scikit-learn` 也可以，不影响本系列的学习。
:::

### 验证安装

```python
# 导入必要的库并验证安装
import pandas as pd  # 导入pandas库，用于数据处理
import numpy as np  # 导入numpy库，用于数值计算
import matplotlib.pyplot as plt  # 导入matplotlib库，用于数据可视化
import seaborn as sns  # 导入seaborn库，用于高级数据可视化

# 打印版本信息，确认安装成功
print("pandas版本:", pd.__version__)
print("numpy版本:", np.__version__)
print("matplotlib版本:", plt.matplotlib.__version__)
print("seaborn版本:", sns.__version__)
```

### 创建第一个数据分析项目

```python
# 创建一个简单的销售数据分析示例

# 1. 创建示例数据
# 使用字典创建销售数据
sales_data = {
    '产品': ['A', 'B', 'C', 'D', 'E'],
    '销售额': [1000, 1500, 800, 2000, 1200],
    '数量': [10, 15, 8, 20, 12],
    '日期': ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05']
}

# 2. 创建DataFrame - pandas的核心数据结构
df = pd.DataFrame(sales_data)

# 3. 查看数据基本信息
print("数据概览:")
print(df.head())  # 显示前5行数据
print("\n数据形状:", df.shape)  # 显示数据维度
print("\n数据类型:")
print(df.dtypes)  # 显示每列的数据类型

# 4. 基本统计分析
print("\n基本统计信息:")
print(df.describe())  # 显示数值列的统计信息

# 5. 简单的数据分析
total_sales = df['销售额'].sum()  # 计算总销售额
average_sales = df['销售额'].mean()  # 计算平均销售额
max_sales = df['销售额'].max()  # 计算最大销售额

print(f"\n总销售额: {total_sales}")
print(f"平均销售额: {average_sales}")
print(f"最高销售额: {max_sales}")

# 6. 数据可视化
# 创建柱状图显示各产品销售额
plt.figure(figsize=(10, 6))  # 设置图表大小
plt.bar(df['产品'], df['销售额'], color='skyblue')  # 创建柱状图
plt.title('产品销售额对比')  # 设置图表标题
plt.xlabel('产品')  # 设置x轴标签
plt.ylabel('销售额')  # 设置y轴标签
plt.grid(axis='y', alpha=0.3)  # 添加网格线
plt.show()  # 显示图表
```

## 课后练习

### 练习1：环境搭建
1. 安装Python 3.12或更高版本（2026 年最新稳定版为 3.14，企业项目建议 3.12/3.13 起步）
2. 安装 uv，并用 `uv venv` 创建虚拟环境
3. 安装Jupyter Notebook，创建一个新的Jupyter Notebook
4. 验证所有必要的库都已安装

### 练习2：基础数据分析
1. 创建一个包含10个学生成绩的数据集
2. 计算平均分、最高分、最低分
3. 绘制成绩分布直方图
4. 找出成绩最好的学生

### 练习3：数据探索
1. 从网上下载一个公开数据集（如鸢尾花数据集）
2. 使用pandas加载数据
3. 查看数据的基本信息
4. 计算基本统计量
5. 绘制简单的图表

## 常见问题

### Q1: 安装库时出现权限错误怎么办？
A: 不要直接往系统 Python 里装库，优先使用虚拟环境：
```bash
# 推荐：uv 创建虚拟环境
uv venv
source .venv/bin/activate  # Linux/Mac
uv pip install pandas

# 传统方式：venv + pip
python -m venv myenv
source myenv/bin/activate  # Linux/Mac
myenv\Scripts\activate  # Windows
pip install pandas
```

### Q2: Jupyter Notebook无法启动怎么办？
A: 检查是否正确安装，尝试重新安装：
```bash
uv pip install --upgrade jupyter   # 传统方式：pip install --upgrade jupyter
jupyter notebook
```

### Q3: 如何选择Python版本？
A: 推荐 Python 3.12 或更高版本（2026 年最新稳定版为 3.14，企业项目建议 3.12/3.13 起步）。Python 3.8 已于 2024 年 10 月停止维护，主流数据分析库的新版本均已不再支持它。

### Q4: 数据分析需要很强的数学基础吗？
A: 基础的数据分析只需要高中数学水平。高级分析可能需要统计学和线性代数知识，但可以在学习过程中逐步掌握。

### Q5: 如何获取练习用的数据集？
A: 可以使用以下方式获取数据集：
1. scikit-learn内置数据集
2. Kaggle数据集
3. 政府公开数据
4. 公司内部数据（需授权）

## 下一步学习

完成今天的学习后，建议你：
1. 熟悉Python基础语法
2. 了解pandas的基本操作
3. 尝试加载和处理真实数据
4. 准备进入Day 2的学习：Python基础与数据处理

明天我们将深入学习Python编程基础和pandas数据处理，这是数据分析的核心技能。