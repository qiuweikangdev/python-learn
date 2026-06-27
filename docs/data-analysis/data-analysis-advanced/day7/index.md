# Day 7: 时间序列分析

## 学习目标

完成今天的学习后，你将能够：
- 理解时间序列数据的特点
- 进行时间序列分解
- 使用移动平均方法
- 识别季节性模式

## 技术原理

### 时间序列数据特点

#### 组成成分
1. **趋势（Trend）**：长期上升或下降趋势
2. **季节性（Seasonality）**：固定周期的重复模式
3. **周期性（Cyclicity）**：非固定周期的波动
4. **随机性（Noise）**：不可预测的随机波动

#### 数据类型
1. **时间点数据**：特定时间点的观测值
2. **时间段数据**：一段时间内的累积值
3. **计数数据**：事件发生的次数

### 时间序列分解

#### 分解方法
1. **加法模型**：Y = T + S + R
2. **乘法模型**：Y = T × S × R

#### 分解步骤
1. 估计趋势成分
2. 去除趋势
3. 估计季节性成分
4. 剩余为随机成分

### 移动平均

#### 简单移动平均（SMA）
对最近n个值取平均

#### 加权移动平均（WMA）
对不同时间点赋予不同权重

#### 指数移动平均（EMA）
指数衰减权重

### 平稳性

#### 定义
统计特性不随时间变化

#### 检验方法
1. **可视化**：观察时间序列图
2. **ADF检验**：单位根检验
3. **KPSS检验**：平稳性检验

#### 平稳化方法
1. **差分**：一阶差分、二阶差分
2. **对数转换**：处理异方差
3. **季节性差分**：去除季节性

## 案例：股票价格分析

假设我们有一只股票的历史价格数据，需要：
1. 分析价格趋势
2. 识别季节性模式
3. 使用移动平均平滑数据
4. 进行简单的预测

## 应用场景

1. **金融分析**：股票价格、汇率预测
2. **销售预测**：产品销量、收入预测
3. **气象分析**：温度、降雨量预测
4. **网站流量**：访问量、用户数预测
5. **生产计划**：需求预测、库存管理

## 代码案例

### 时间序列数据处理

```python
# 时间序列数据处理示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建时间序列数据
# 生成日期范围
dates = pd.date_range(start='2020-01-01', end='2023-12-31', freq='D')

# 生成模拟股票价格
np.random.seed(42)
n = len(dates)
trend = np.linspace(100, 150, n)  # 上升趋势
seasonal = 10 * np.sin(2 * np.pi * np.arange(n) / 365)  # 年度季节性
noise = np.random.normal(0, 5, n)  # 随机噪声
prices = trend + seasonal + noise

# 创建DataFrame
df = pd.DataFrame({'日期': dates, '价格': prices})
df.set_index('日期', inplace=True)

print("时间序列数据:")
print(df.head())
print(f"\n数据形状: {df.shape}")
print(f"时间范围: {df.index.min()} 到 {df.index.max()}")

# 2. 时间序列基本操作
# 重采样 - 月度平均
monthly_avg = df.resample('M').mean()
print("\n月度平均价格:")
print(monthly_avg.head())

# 重采样 - 季度平均
quarterly_avg = df.resample('Q').mean()
print("\n季度平均价格:")
print(quarterly_avg.head())

# 3. 移动平均
# 简单移动平均
df['SMA_7'] = df['价格'].rolling(window=7).mean()  # 7日移动平均
df['SMA_30'] = df['价格'].rolling(window=30).mean()  # 30日移动平均
df['SMA_90'] = df['价格'].rolling(window=90).mean()  # 90日移动平均

print("\n移动平均数据:")
print(df.head(10))

# 4. 可视化
plt.figure(figsize=(14, 8))

# 原始数据和移动平均
plt.plot(df.index, df['价格'], alpha=0.5, label='原始价格', color='gray')
plt.plot(df.index, df['SMA_7'], label='7日移动平均', color='blue', linewidth=2)
plt.plot(df.index, df['SMA_30'], label='30日移动平均', color='red', linewidth=2)
plt.plot(df.index, df['SMA_90'], label='90日移动平均', color='green', linewidth=2)

plt.title('股票价格与移动平均', fontsize=16, fontweight='bold')
plt.xlabel('日期')
plt.ylabel('价格')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 5. 月度和季度数据可视化
fig, axes = plt.subplots(2, 1, figsize=(14, 10))

# 月度平均
axes[0].plot(monthly_avg.index, monthly_avg['价格'], marker='o', linewidth=2)
axes[0].set_title('月度平均价格', fontsize=14, fontweight='bold')
axes[0].set_xlabel('日期')
axes[0].set_ylabel('价格')
axes[0].grid(True, alpha=0.3)

# 季度平均
axes[1].plot(quarterly_avg.index, quarterly_avg['价格'], marker='s', linewidth=2, color='orange')
axes[1].set_title('季度平均价格', fontsize=14, fontweight='bold')
axes[1].set_xlabel('日期')
axes[1].set_ylabel('价格')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 时间序列分解

```python
# 时间序列分解示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.seasonal import seasonal_decompose

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建具有明显季节性的时间序列
dates = pd.date_range(start='2018-01-01', end='2023-12-31', freq='M')
n = len(dates)

# 生成模拟销售数据
np.random.seed(42)
trend = np.linspace(100, 200, n)  # 上升趋势
seasonal = 20 * np.sin(2 * np.pi * np.arange(n) / 12)  # 年度季节性
noise = np.random.normal(0, 10, n)  # 随机噪声
sales = trend + seasonal + noise

# 创建DataFrame
df = pd.DataFrame({'日期': dates, '销售额': sales})
df.set_index('日期', inplace=True)

print("时间序列数据:")
print(df.head())

# 2. 加法分解
print("\n加法分解:")
decomposition_add = seasonal_decompose(df['销售额'], model='additive', period=12)

fig, axes = plt.subplots(4, 1, figsize=(14, 12))

# 原始数据
axes[0].plot(decomposition_add.observed)
axes[0].set_title('原始数据', fontsize=14, fontweight='bold')
axes[0].set_ylabel('销售额')

# 趋势
axes[1].plot(decomposition_add.trend)
axes[1].set_title('趋势', fontsize=14, fontweight='bold')
axes[1].set_ylabel('销售额')

# 季节性
axes[2].plot(decomposition_add.seasonal)
axes[2].set_title('季节性', fontsize=14, fontweight='bold')
axes[2].set_ylabel('销售额')

# 残差
axes[3].plot(decomposition_add.resid)
axes[3].set_title('残差', fontsize=14, fontweight='bold')
axes[3].set_ylabel('销售额')

plt.suptitle('时间序列加法分解', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 3. 乘法分解
print("\n乘法分解:")
decomposition_mult = seasonal_decompose(df['销售额'], model='multiplicative', period=12)

fig, axes = plt.subplots(4, 1, figsize=(14, 12))

# 原始数据
axes[0].plot(decomposition_mult.observed)
axes[0].set_title('原始数据', fontsize=14, fontweight='bold')
axes[0].set_ylabel('销售额')

# 趋势
axes[1].plot(decomposition_mult.trend)
axes[1].set_title('趋势', fontsize=14, fontweight='bold')
axes[1].set_ylabel('销售额')

# 季节性
axes[2].plot(decomposition_mult.seasonal)
axes[2].set_title('季节性', fontsize=14, fontweight='bold')
axes[2].set_ylabel('销售额')

# 残差
axes[3].plot(decomposition_mult.resid)
axes[3].set_title('残差', fontsize=14, fontweight='bold')
axes[3].set_ylabel('销售额')

plt.suptitle('时间序列乘法分解', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 4. 季节性模式分析
print("\n季节性模式分析:")
seasonal_pattern = decomposition_add.seasonal[:12]
months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

plt.figure(figsize=(10, 6))
plt.bar(months, seasonal_pattern, color='skyblue', edgecolor='black')
plt.title('月度季节性模式', fontsize=16, fontweight='bold')
plt.xlabel('月份')
plt.ylabel('季节性效应')
plt.grid(True, alpha=0.3, axis='y')
plt.show()

# 5. 分解结果统计
print("\n分解结果统计:")
print(f"趋势范围: [{decomposition_add.trend.min():.2f}, {decomposition_add.trend.max():.2f}]")
print(f"季节性范围: [{decomposition_add.seasonal.min():.2f}, {decomposition_add.seasonal.max():.2f}]")
print(f"残差标准差: {decomposition_add.resid.std():.2f}")
```

### 平稳性检验和平稳化

```python
# 平稳性检验和平稳化示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.stattools import adfuller, kpss
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建非平稳时间序列
np.random.seed(42)
n = 200
dates = pd.date_range(start='2020-01-01', periods=n, freq='D')

# 带趋势的非平稳序列
trend = np.linspace(0, 10, n)
noise = np.random.normal(0, 1, n)
non_stationary = trend + noise

# 带季节性的非平稳序列
seasonal = 5 * np.sin(2 * np.pi * np.arange(n) / 30)
stationary_with_season = noise + seasonal

df = pd.DataFrame({
    '非平稳序列': non_stationary,
    '季节性序列': stationary_with_season
}, index=dates)

print("原始数据:")
print(df.head())

# 2. 可视化原始序列
fig, axes = plt.subplots(2, 1, figsize=(14, 8))

axes[0].plot(df.index, df['非平稳序列'])
axes[0].set_title('非平稳序列（带趋势）', fontsize=14, fontweight='bold')
axes[0].set_ylabel('值')
axes[0].grid(True, alpha=0.3)

axes[1].plot(df.index, df['季节性序列'])
axes[1].set_title('季节性序列', fontsize=14, fontweight='bold')
axes[1].set_ylabel('值')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 3. ADF检验
print("\nADF检验:")
print("=" * 50)

def adf_test(series, title=''):
    result = adfuller(series, autolag='AIC')
    print(f'\n{title}:')
    print(f'  ADF统计量: {result[0]:.4f}')
    print(f'  p值: {result[1]:.4f}')
    print(f'  滞后阶数: {result[2]}')
    print(f'  临界值:')
    for key, value in result[4].items():
        print(f'    {key}: {value:.4f}')
    if result[1] < 0.05:
        print('  结论: 序列是平稳的')
    else:
        print('  结论: 序列是非平稳的')

adf_test(df['非平稳序列'], '非平稳序列')
adf_test(df['季节性序列'], '季节性序列')

# 4. KPSS检验
print("\nKPSS检验:")
print("=" * 50)

def kpss_test(series, title=''):
    result = kpss(series, regression='c')
    print(f'\n{title}:')
    print(f'  KPSS统计量: {result[0]:.4f}')
    print(f'  p值: {result[1]:.4f}')
    print(f'  滞后阶数: {result[2]}')
    print(f'  临界值:')
    for key, value in result[3].items():
        print(f'    {key}: {value:.4f}')
    if result[1] > 0.05:
        print('  结论: 序列是平稳的')
    else:
        print('  结论: 序列是非平稳的')

kpss_test(df['非平稳序列'], '非平稳序列')
kpss_test(df['季节性序列'], '季节性序列')

# 5. 平稳化方法
print("\n平稳化方法:")
print("=" * 50)

# 一阶差分
df['非平稳_一阶差分'] = df['非平稳序列'].diff()
df['季节性_一阶差分'] = df['季节性序列'].diff()

# 季节性差分（周期为30）
df['季节性_季节差分'] = df['季节性序列'].diff(30)

# 对数转换
df['非平稳_对数'] = np.log1p(df['非平稳序列'])
df['非平稳_对数差分'] = df['非平稳_对数'].diff()

# 6. 可视化平稳化结果
fig, axes = plt.subplots(3, 2, figsize=(14, 12))

# 原始序列
axes[0, 0].plot(df.index, df['非平稳序列'])
axes[0, 0].set_title('原始非平稳序列')

axes[0, 1].plot(df.index, df['季节性序列'])
axes[0, 1].set_title('原始季节性序列')

# 一阶差分
axes[1, 0].plot(df.index, df['非平稳_一阶差分'])
axes[1, 0].set_title('一阶差分（非平稳）')

axes[1, 1].plot(df.index, df['季节性_一阶差分'])
axes[1, 1].set_title('一阶差分（季节性）')

# 季节性差分
axes[2, 0].plot(df.index, df['季节性_季节差分'])
axes[2, 0].set_title('季节性差分')

# 对数差分
axes[2, 1].plot(df.index, df['非平稳_对数差分'])
axes[2, 1].set_title('对数差分')

plt.suptitle('平稳化方法比较', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# 7. ACF和PACF分析
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 原始序列的ACF和PACF
plot_acf(df['非平稳序列'].dropna(), ax=axes[0, 0], lags=40)
axes[0, 0].set_title('原始序列ACF')

plot_pacf(df['非平稳序列'].dropna(), ax=axes[0, 1], lags=40)
axes[0, 1].set_title('原始序列PACF')

# 差分后序列的ACF和PACF
plot_acf(df['非平稳_一阶差分'].dropna(), ax=axes[1, 0], lags=40)
axes[1, 0].set_title('差分后序列ACF')

plot_pacf(df['非平稳_一阶差分'].dropna(), ax=axes[1, 1], lags=40)
axes[1, 1].set_title('差分后序列PACF')

plt.suptitle('自相关和偏自相关分析', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 简单预测方法

```python
# 简单预测方法示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error, mean_absolute_error

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建时间序列数据
np.random.seed(42)
n = 100
dates = pd.date_range(start='2020-01-01', periods=n, freq='M')

# 生成模拟数据
trend = np.linspace(100, 150, n)
seasonal = 10 * np.sin(2 * np.pi * np.arange(n) / 12)
noise = np.random.normal(0, 5, n)
sales = trend + seasonal + noise

df = pd.DataFrame({'日期': dates, '销售额': sales})
df.set_index('日期', inplace=True)

# 2. 划分训练集和测试集
train_size = int(len(df) * 0.8)
train = df[:train_size]
test = df[train_size:]

print(f"训练集大小: {len(train)}")
print(f"测试集大小: {len(test)}")

# 3. 简单移动平均预测
def moving_average_forecast(series, window):
    """移动平均预测"""
    forecasts = []
    for i in range(len(series)):
        if i < window:
            forecasts.append(series[:i+1].mean())
        else:
            forecasts.append(series[i-window+1:i+1].mean())
    return np.array(forecasts)

# 使用不同窗口大小
windows = [3, 6, 12]
ma_forecasts = {}
for w in windows:
    ma_forecasts[w] = moving_average_forecast(train['销售额'], w)

# 4. 指数平滑预测
def exponential_smoothing(series, alpha):
    """指数平滑预测"""
    forecasts = [series[0]]
    for i in range(1, len(series)):
        forecasts.append(alpha * series[i] + (1 - alpha) * forecasts[-1])
    return np.array(forecasts)

# 使用不同alpha值
alphas = [0.1, 0.3, 0.5]
es_forecasts = {}
for a in alphas:
    es_forecasts[a] = exponential_smoothing(train['销售额'].values, a)

# 5. 季节性预测
def seasonal_forecast(series, period=12):
    """季节性预测"""
    # 计算季节性模式
    seasonal_pattern = []
    for i in range(period):
        seasonal_values = series[i::period]
        seasonal_pattern.append(seasonal_values.mean())
    
    # 计算趋势
    trend = np.linspace(series[0], series[-1], len(series))
    
    # 组合趋势和季节性
    forecasts = []
    for i in range(len(series)):
        forecasts.append(trend[i] + seasonal_pattern[i % period] - np.mean(seasonal_pattern))
    
    return np.array(forecasts)

seasonal_pred = seasonal_forecast(train['销售额'].values)

# 6. 可视化预测结果
plt.figure(figsize=(14, 8))

# 原始数据
plt.plot(train.index, train['销售额'], label='训练数据', color='blue')
plt.plot(test.index, test['销售额'], label='测试数据', color='green')

# 移动平均预测
for w, forecast in ma_forecasts.items():
    plt.plot(train.index, forecast, '--', label=f'MA({w})预测', alpha=0.7)

# 指数平滑预测
for a, forecast in es_forecasts.items():
    plt.plot(train.index, forecast, ':', label=f'ES(α={a})预测', alpha=0.7)

# 季节性预测
plt.plot(train.index, seasonal_pred, '-.', label='季节性预测', color='red')

plt.title('不同预测方法比较', fontsize=16, fontweight='bold')
plt.xlabel('日期')
plt.ylabel('销售额')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 7. 预测误差评估
print("\n预测误差评估:")
print("=" * 50)

actual = train['销售额'].values

for w, forecast in ma_forecasts.items():
    mse = mean_squared_error(actual, forecast)
    mae = mean_absolute_error(actual, forecast)
    print(f"MA({w}): MSE={mse:.2f}, MAE={mae:.2f}")

for a, forecast in es_forecasts.items():
    mse = mean_squared_error(actual, forecast)
    mae = mean_absolute_error(actual, forecast)
    print(f"ES(α={a}): MSE={mse:.2f}, MAE={mae:.2f}")

mse = mean_squared_error(actual, seasonal_pred)
mae = mean_absolute_error(actual, seasonal_pred)
print(f"季节性预测: MSE={mse:.2f}, MAE={mae:.2f}")
```

## 课后练习

### 练习1：时间序列数据处理
1. 创建一个时间序列数据集
2. 进行重采样操作
3. 计算移动平均
4. 可视化时间序列

### 练习2：时间序列分解
1. 使用加法模型分解时间序列
2. 使用乘法模型分解时间序列
3. 分析季节性模式
4. 比较不同分解方法

### 练习3：平稳性检验
1. 进行ADF检验
2. 进行KPSS检验
3. 使用差分方法平稳化
4. 分析ACF和PACF

### 练习4：简单预测
1. 使用移动平均进行预测
2. 使用指数平滑进行预测
3. 比较不同预测方法
4. 评估预测误差

## 常见问题

### Q1: 如何判断时间序列是否平稳？
A: 可以使用以下方法：
1. 可视化观察
2. ADF检验（p值<0.05表示平稳）
3. KPSS检验（p值>0.05表示平稳）

### Q2: 如何选择移动平均窗口大小？
A: 根据数据特点选择：
- 短期趋势：小窗口（3-7）
- 长期趋势：大窗口（30-90）
- 季节性数据：使用季节周期

### Q3: 加法模型和乘法模型如何选择？
A: 根据季节性特点选择：
- 季节性波动幅度恒定：加法模型
- 季节性波动幅度随趋势变化：乘法模型

### Q4: 如何处理缺失的时间序列数据？
A: 可以使用以下方法：
1. 前向填充
2. 后向填充
3. 线性插值
4. 季节性插值

### Q5: 时间序列预测的难点是什么？
A: 主要难点包括：
1. 趋势变化
2. 季节性识别
3. 异常值处理
4. 模型选择

## 下一步学习

完成今天的学习后，建议你：
1. 练习处理不同类型的时间序列数据
2. 掌握时间序列分解方法
3. 学习平稳性检验和平稳化
4. 准备进入Day 8的学习：文本数据分析

明天我们将学习文本数据分析，这是处理非结构化数据的重要技能。