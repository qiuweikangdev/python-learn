# Day 12: 金融数据分析实战

## 学习目标

完成今天的学习后，你将能够：
- 分析股票数据
- 进行风险评估
- 进行投资组合分析
- 了解量化交易基础

## 技术原理

### 股票数据分析

#### 关键指标
1. **开盘价**：当日第一笔交易价格
2. **收盘价**：当日最后一笔交易价格
3. **最高价**：当日最高交易价格
4. **最低价**：当日最低交易价格
5. **成交量**：当日交易的股票数量

#### 技术指标
1. **移动平均线**：MA5、MA10、MA20
2. **相对强弱指数**：RSI
3. **移动平均收敛发散**：MACD
4. **布林带**：Bollinger Bands

### 风险评估

#### 风险指标
1. **波动率**：价格波动的剧烈程度
2. **最大回撤**：从最高点到最低点的最大跌幅
3. **夏普比率**：风险调整后的收益
4. **VaR（风险价值）**：在一定置信水平下的最大损失

### 投资组合分析

#### 现代投资组合理论
1. **分散投资**：降低非系统性风险
2. **有效前沿**：风险收益最优组合
3. **资本资产定价模型**：CAPM

### 量化交易基础

#### 策略类型
1. **趋势跟踪**：跟随市场趋势
2. **均值回归**：价格回归均值
3. **统计套利**：利用价格差异
4. **机器学习**：基于预测模型

## 案例：股票数据分析

假设我们有股票历史数据，需要：
1. 分析股票价格走势
2. 计算技术指标
3. 评估投资风险
4. 构建投资组合

## 应用场景

1. **投资决策**：股票选择、时机判断
2. **风险管理**：风险识别、风险控制
3. **资产配置**：投资组合优化
4. **量化交易**：自动化交易策略

## 代码案例

### 股票数据获取和分析

```python
# 股票数据获取和分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import yfinance as yf
from datetime import datetime, timedelta

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 获取股票数据
# 注意：需要安装yfinance库: pip install yfinance

# 获取苹果公司股票数据
symbol = 'AAPL'
start_date = datetime.now() - timedelta(days=365)
end_date = datetime.now()

# 获取数据
stock_data = yf.download(symbol, start=start_date, end=end_date)

print(f"{symbol}股票数据:")
print(stock_data.head())
print(f"\n数据形状: {stock_data.shape}")

# 2. 基本统计分析
print("\n基本统计分析:")
print("=" * 50)

# 计算每日收益率
stock_data['日收益率'] = stock_data['Close'].pct_change()

# 计算累计收益率
stock_data['累计收益率'] = (1 + stock_data['日收益率']).cumprod() - 1

# 统计指标
print(f"期间: {stock_data.index[0].date()} 至 {stock_data.index[-1].date()}")
print(f"起始价格: {stock_data['Close'].iloc[0]:.2f}")
print(f"结束价格: {stock_data['Close'].iloc[-1]:.2f}")
print(f"最高价格: {stock_data['High'].max():.2f}")
print(f"最低价格: {stock_data['Low'].min():.2f}")
print(f"总收益率: {stock_data['累计收益率'].iloc[-1]:.2%}")
print(f"年化收益率: {stock_data['日收益率'].mean() * 252:.2%}")
print(f"年化波动率: {stock_data['日收益率'].std() * np.sqrt(252):.2%}")

# 3. 可视化价格走势
fig, axes = plt.subplots(3, 1, figsize=(14, 12))

# 价格走势
axes[0].plot(stock_data.index, stock_data['Close'], 'b-', linewidth=2, label='收盘价')
axes[0].fill_between(stock_data.index, stock_data['Low'], stock_data['High'], alpha=0.3, color='skyblue')
axes[0].set_title(f'{symbol}股价走势', fontsize=16, fontweight='bold')
axes[0].set_ylabel('价格')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# 成交量
axes[1].bar(stock_data.index, stock_data['Volume'], color='lightcoral', alpha=0.7)
axes[1].set_title('成交量', fontsize=16, fontweight='bold')
axes[1].set_ylabel('成交量')
axes[1].grid(True, alpha=0.3)

# 收益率分布
axes[2].hist(stock_data['日收益率'].dropna(), bins=50, color='lightgreen', edgecolor='black', alpha=0.7)
axes[2].set_title('日收益率分布', fontsize=16, fontweight='bold')
axes[2].set_xlabel('收益率')
axes[2].set_ylabel('频数')
axes[2].axvline(x=0, color='red', linestyle='--', linewidth=2)
axes[2].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 4. 计算技术指标
print("\n技术指标计算:")
print("=" * 50)

# 移动平均线
stock_data['MA5'] = stock_data['Close'].rolling(window=5).mean()
stock_data['MA10'] = stock_data['Close'].rolling(window=10).mean()
stock_data['MA20'] = stock_data['Close'].rolling(window=20).mean()

# 布林带
stock_data['BB_middle'] = stock_data['Close'].rolling(window=20).mean()
stock_data['BB_std'] = stock_data['Close'].rolling(window=20).std()
stock_data['BB_upper'] = stock_data['BB_middle'] + 2 * stock_data['BB_std']
stock_data['BB_lower'] = stock_data['BB_middle'] - 2 * stock_data['BB_std']

# RSI
def calculate_rsi(prices, period=14):
    """计算RSI指标"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

stock_data['RSI'] = calculate_rsi(stock_data['Close'])

# MACD
exp1 = stock_data['Close'].ewm(span=12, adjust=False).mean()
exp2 = stock_data['Close'].ewm(span=26, adjust=False).mean()
stock_data['MACD'] = exp1 - exp2
stock_data['Signal'] = stock_data['MACD'].ewm(span=9, adjust=False).mean()

print("技术指标数据:")
print(stock_data[['Close', 'MA5', 'MA10', 'MA20', 'RSI', 'MACD']].tail())

# 5. 可视化技术指标
fig, axes = plt.subplots(3, 1, figsize=(14, 12))

# 价格和移动平均线
axes[0].plot(stock_data.index, stock_data['Close'], 'b-', linewidth=2, label='收盘价')
axes[0].plot(stock_data.index, stock_data['MA5'], 'r-', linewidth=1, label='MA5')
axes[0].plot(stock_data.index, stock_data['MA10'], 'g-', linewidth=1, label='MA10')
axes[0].plot(stock_data.index, stock_data['MA20'], 'm-', linewidth=1, label='MA20')
axes[0].set_title('价格和移动平均线', fontsize=16, fontweight='bold')
axes[0].set_ylabel('价格')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# 布林带
axes[1].plot(stock_data.index, stock_data['Close'], 'b-', linewidth=2, label='收盘价')
axes[1].plot(stock_data.index, stock_data['BB_upper'], 'r--', linewidth=1, label='上轨')
axes[1].plot(stock_data.index, stock_data['BB_middle'], 'g-', linewidth=1, label='中轨')
axes[1].plot(stock_data.index, stock_data['BB_lower'], 'r--', linewidth=1, label='下轨')
axes[1].fill_between(stock_data.index, stock_data['BB_upper'], stock_data['BB_lower'], alpha=0.1, color='gray')
axes[1].set_title('布林带', fontsize=16, fontweight='bold')
axes[1].set_ylabel('价格')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

# RSI
axes[2].plot(stock_data.index, stock_data['RSI'], 'b-', linewidth=2)
axes[2].axhline(y=70, color='r', linestyle='--', label='超买线(70)')
axes[2].axhline(y=30, color='g', linestyle='--', label='超卖线(30)')
axes[2].set_title('RSI指标', fontsize=16, fontweight='bold')
axes[2].set_ylabel('RSI')
axes[2].legend()
axes[2].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 风险评估

```python
# 风险评估示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟股票数据
np.random.seed(42)
n_days = 252  # 一年交易日

# 生成收益率数据
returns_a = np.random.normal(0.001, 0.02, n_days)  # 股票A
returns_b = np.random.normal(0.0008, 0.015, n_days)  # 股票B
returns_c = np.random.normal(0.0012, 0.025, n_days)  # 股票C

# 创建DataFrame
dates = pd.date_range(start='2023-01-01', periods=n_days, freq='B')
returns_df = pd.DataFrame({
    '股票A': returns_a,
    '股票B': returns_b,
    '股票C': returns_c
}, index=dates)

print("收益率数据:")
print(returns_df.head())

# 2. 计算风险指标
print("\n风险指标计算:")
print("=" * 50)

# 基本统计量
print("\n基本统计量:")
print(returns_df.describe())

# 年化收益率
annual_returns = returns_df.mean() * 252
print(f"\n年化收益率:")
print(annual_returns)

# 年化波动率
annual_volatility = returns_df.std() * np.sqrt(252)
print(f"\n年化波动率:")
print(annual_volatility)

# 相关系数
correlation_matrix = returns_df.corr()
print(f"\n相关系数矩阵:")
print(correlation_matrix)

# 3. 计算最大回撤
print("\n最大回撤计算:")
print("=" * 50)

def calculate_max_drawdown(returns):
    """计算最大回撤"""
    cumulative_returns = (1 + returns).cumprod()
    rolling_max = cumulative_returns.expanding().max()
    drawdown = (cumulative_returns - rolling_max) / rolling_max
    return drawdown.min()

for stock in returns_df.columns:
    max_drawdown = calculate_max_drawdown(returns_df[stock])
    print(f"{stock}最大回撤: {max_drawdown:.2%}")

# 4. 计算VaR（风险价值）
print("\nVaR计算:")
print("=" * 50)

confidence_level = 0.95

for stock in returns_df.columns:
    # 历史模拟法
    var_historical = np.percentile(returns_df[stock], (1 - confidence_level) * 100)
    
    # 参数法（假设正态分布）
    var_parametric = stats.norm.ppf(1 - confidence_level, returns_df[stock].mean(), returns_df[stock].std())
    
    print(f"{stock}:")
    print(f"  历史VaR({confidence_level*100}%): {var_historical:.4f}")
    print(f"  参数VaR({confidence_level*100}%): {var_parametric:.4f}")

# 5. 计算夏普比率
print("\n夏普比率计算:")
print("=" * 50)

risk_free_rate = 0.02  # 无风险利率

for stock in returns_df.columns:
    sharpe_ratio = (returns_df[stock].mean() * 252 - risk_free_rate) / (returns_df[stock].std() * np.sqrt(252))
    print(f"{stock}夏普比率: {sharpe_ratio:.4f}")

# 6. 可视化风险指标
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 收益率分布
for stock in returns_df.columns:
    axes[0, 0].hist(returns_df[stock], bins=50, alpha=0.5, label=stock)
axes[0, 0].set_title('收益率分布', fontsize=14, fontweight='bold')
axes[0, 0].set_xlabel('收益率')
axes[0, 0].set_ylabel('频数')
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# 累计收益率
cumulative_returns = (1 + returns_df).cumprod()
axes[0, 1].plot(cumulative_returns.index, cumulative_returns)
axes[0, 1].set_title('累计收益率', fontsize=14, fontweight='bold')
axes[0, 1].set_ylabel('累计收益率')
axes[0, 1].legend(returns_df.columns)
axes[0, 1].grid(True, alpha=0.3)

# 相关系数热力图
im = axes[1, 0].imshow(correlation_matrix, cmap='coolwarm', vmin=-1, vmax=1)
axes[1, 0].set_xticks(range(len(correlation_matrix.columns)))
axes[1, 0].set_yticks(range(len(correlation_matrix.columns)))
axes[1, 0].set_xticklabels(correlation_matrix.columns, rotation=45)
axes[1, 0].set_yticklabels(correlation_matrix.columns)
axes[1, 0].set_title('相关系数矩阵', fontsize=14, fontweight='bold')
plt.colorbar(im, ax=axes[1, 0])

# 最大回撤
for stock in returns_df.columns:
    cumulative = (1 + returns_df[stock]).cumprod()
    rolling_max = cumulative.expanding().max()
    drawdown = (cumulative - rolling_max) / rolling_max
    axes[1, 1].plot(drawdown.index, drawdown, label=stock)
axes[1, 1].set_title('回撤', fontsize=14, fontweight='bold')
axes[1, 1].set_ylabel('回撤')
axes[1, 1].legend()
axes[1, 1].grid(True, alpha=0.3)

plt.suptitle('风险分析', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 投资组合分析

```python
# 投资组合分析示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import minimize

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟数据
np.random.seed(42)
n_days = 252
n_assets = 4

# 生成收益率数据
returns = np.random.normal(0.001, 0.02, (n_days, n_assets))
asset_names = ['股票', '债券', '商品', '现金']

returns_df = pd.DataFrame(returns, columns=asset_names)

print("资产收益率数据:")
print(returns_df.head())

# 2. 计算资产统计量
print("\n资产统计量:")
print("=" * 50)

# 预期收益率
expected_returns = returns_df.mean() * 252
print(f"\n年化预期收益率:")
print(expected_returns)

# 协方差矩阵
cov_matrix = returns_df.cov() * 252
print(f"\n年化协方差矩阵:")
print(cov_matrix)

# 相关系数矩阵
corr_matrix = returns_df.corr()
print(f"\n相关系数矩阵:")
print(corr_matrix)

# 3. 投资组合优化
print("\n投资组合优化:")
print("=" * 50)

def portfolio_stats(weights, returns, cov_matrix):
    """计算投资组合统计量"""
    portfolio_return = np.sum(returns * weights)
    portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
    sharpe_ratio = portfolio_return / portfolio_volatility
    return portfolio_return, portfolio_volatility, sharpe_ratio

def min_variance(returns, cov_matrix):
    """最小方差组合"""
    n_assets = len(returns)
    args = (returns, cov_matrix)
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    bounds = tuple((0, 1) for _ in range(n_assets))
    
    result = minimize(lambda x: portfolio_stats(x, returns, cov_matrix)[1],
                     x0=np.ones(n_assets) / n_assets,
                     args=args,
                     method='SLSQP',
                     bounds=bounds,
                     constraints=constraints)
    return result.x

def max_sharpe(returns, cov_matrix):
    """最大夏普比率组合"""
    n_assets = len(returns)
    args = (returns, cov_matrix)
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    bounds = tuple((0, 1) for _ in range(n_assets))
    
    result = minimize(lambda x: -portfolio_stats(x, returns, cov_matrix)[2],
                     x0=np.ones(n_assets) / n_assets,
                     args=args,
                     method='SLSQP',
                     bounds=bounds,
                     constraints=constraints)
    return result.x

# 计算最优组合
min_var_weights = min_variance(expected_returns.values, cov_matrix.values)
max_sharpe_weights = max_sharpe(expected_returns.values, cov_matrix.values)

print("\n最小方差组合权重:")
for name, weight in zip(asset_names, min_var_weights):
    print(f"  {name}: {weight:.2%}")

print("\n最大夏普比率组合权重:")
for name, weight in zip(asset_names, max_sharpe_weights):
    print(f"  {name}: {weight:.2%}")

# 4. 有效前沿
print("\n有效前沿:")
print("=" * 50)

# 生成随机组合
n_portfolios = 10000
results = np.zeros((3, n_portfolios))
weights_record = []

for i in range(n_portfolios):
    weights = np.random.random(n_assets)
    weights /= np.sum(weights)
    weights_record.append(weights)
    
    portfolio_return, portfolio_volatility, sharpe = portfolio_stats(weights, expected_returns.values, cov_matrix.values)
    results[0, i] = portfolio_return
    results[1, i] = portfolio_volatility
    results[2, i] = sharpe

# 可视化有效前沿
plt.figure(figsize=(12, 8))

# 散点图
scatter = plt.scatter(results[1, :], results[0, :], c=results[2, :], cmap='viridis', marker='o', s=10, alpha=0.3)
plt.colorbar(scatter, label='夏普比率')

# 最优组合
min_var_stats = portfolio_stats(min_var_weights, expected_returns.values, cov_matrix.values)
max_sharpe_stats = portfolio_stats(max_sharpe_weights, expected_returns.values, cov_matrix.values)

plt.scatter(min_var_stats[1], min_var_stats[0], marker='*', color='red', s=500, label='最小方差组合')
plt.scatter(max_sharpe_stats[1], max_sharpe_stats[0], marker='*', color='blue', s=500, label='最大夏普比率组合')

plt.title('有效前沿', fontsize=16, fontweight='bold')
plt.xlabel('波动率')
plt.ylabel('预期收益率')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 5. 投资组合绩效分析
print("\n投资组合绩效分析:")
print("=" * 50)

# 等权重组合
equal_weights = np.ones(n_assets) / n_assets
equal_return, equal_volatility, equal_sharpe = portfolio_stats(equal_weights, expected_returns.values, cov_matrix.values)

print(f"\n等权重组合:")
print(f"  预期收益率: {equal_return:.2%}")
print(f"  波动率: {equal_volatility:.2%}")
print(f"  夏普比率: {equal_sharpe:.4f}")

print(f"\n最小方差组合:")
print(f"  预期收益率: {min_var_stats[0]:.2%}")
print(f"  波动率: {min_var_stats[1]:.2%}")
print(f"  夏普比率: {min_var_stats[2]:.4f}")

print(f"\n最大夏普比率组合:")
print(f"  预期收益率: {max_sharpe_stats[0]:.2%}")
print(f"  波动率: {max_sharpe_stats[1]:.2%}")
print(f"  夏普比率: {max_sharpe_stats[2]:.4f}")

# 6. 可视化组合权重
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 最小方差组合
axes[0].pie(min_var_weights, labels=asset_names, autopct='%1.1f%%', colors=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'])
axes[0].set_title('最小方差组合', fontsize=14, fontweight='bold')

# 最大夏普比率组合
axes[1].pie(max_sharpe_weights, labels=asset_names, autopct='%1.1f%%', colors=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'])
axes[1].set_title('最大夏普比率组合', fontsize=14, fontweight='bold')

plt.suptitle('投资组合权重分配', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 量化交易策略

```python
# 量化交易策略示例

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建模拟价格数据
np.random.seed(42)
n_days = 500
dates = pd.date_range(start='2023-01-01', periods=n_days, freq='B')

# 生成价格数据（带趋势）
trend = np.linspace(100, 150, n_days)
noise = np.random.normal(0, 2, n_days)
prices = trend + noise

df = pd.DataFrame({'价格': prices}, index=dates)

print("价格数据:")
print(df.head())

# 2. 移动平均策略
print("\n移动平均策略:")
print("=" * 50)

def moving_average_strategy(df, short_window=5, long_window=20):
    """移动平均交叉策略"""
    signals = pd.DataFrame(index=df.index)
    signals['价格'] = df['价格']
    signals['短期均线'] = df['价格'].rolling(window=short_window).mean()
    signals['长期均线'] = df['价格'].rolling(window=long_window).mean()
    
    # 生成信号
    signals['信号'] = 0
    signals.loc[signals['短期均线'] > signals['长期均线'], '信号'] = 1
    signals.loc[signals['短期均线'] <= signals['长期均线'], '信号'] = -1
    
    # 计算每日头寸变化
    signals['头寸'] = signals['信号'].diff()
    
    return signals

signals = moving_average_strategy(df)

# 计算策略收益
signals['策略收益'] = signals['信号'].shift(1) * signals['价格'].pct_change()
signals['累计策略收益'] = (1 + signals['策略收益']).cumprod()
signals['累计市场收益'] = (1 + signals['价格'].pct_change()).cumprod()

print("策略信号:")
print(signals[['价格', '短期均线', '长期均线', '信号']].tail(10))

# 可视化策略
fig, axes = plt.subplots(3, 1, figsize=(14, 12))

# 价格和均线
axes[0].plot(signals.index, signals['价格'], 'b-', linewidth=2, label='价格')
axes[0].plot(signals.index, signals['短期均线'], 'r-', linewidth=1, label='短期均线')
axes[0].plot(signals.index, signals['长期均线'], 'g-', linewidth=1, label='长期均线')

# 买卖信号
buy_signals = signals[signals['头寸'] > 0]
sell_signals = signals[signals['头寸'] < 0]
axes[0].scatter(buy_signals.index, buy_signals['价格'], marker='^', color='green', s=100, label='买入信号')
axes[0].scatter(sell_signals.index, sell_signals['价格'], marker='v', color='red', s=100, label='卖出信号')

axes[0].set_title('移动平均交叉策略', fontsize=16, fontweight='bold')
axes[0].set_ylabel('价格')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# 信号
axes[1].plot(signals.index, signals['信号'], 'b-', linewidth=2)
axes[1].set_title('交易信号', fontsize=16, fontweight='bold')
axes[1].set_ylabel('信号')
axes[1].set_ylim(-1.5, 1.5)
axes[1].grid(True, alpha=0.3)

# 累计收益
axes[2].plot(signals.index, signals['累计策略收益'], 'b-', linewidth=2, label='策略收益')
axes[2].plot(signals.index, signals['累计市场收益'], 'r-', linewidth=2, label='市场收益')
axes[2].set_title('累计收益', fontsize=16, fontweight='bold')
axes[2].set_ylabel('累计收益')
axes[2].legend()
axes[2].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 3. 策略评估
print("\n策略评估:")
print("=" * 50)

# 计算策略指标
strategy_returns = signals['策略收益'].dropna()
market_returns = signals['价格'].pct_change().dropna()

# 年化收益率
annual_strategy_return = strategy_returns.mean() * 252
annual_market_return = market_returns.mean() * 252

# 年化波动率
annual_strategy_vol = strategy_returns.std() * np.sqrt(252)
annual_market_vol = market_returns.std() * np.sqrt(252)

# 夏普比率
sharpe_strategy = annual_strategy_return / annual_strategy_vol
sharpe_market = annual_market_return / annual_market_vol

# 最大回撤
def calculate_max_drawdown(returns):
    cumulative = (1 + returns).cumprod()
    rolling_max = cumulative.expanding().max()
    drawdown = (cumulative - rolling_max) / rolling_max
    return drawdown.min()

max_drawdown_strategy = calculate_max_drawdown(strategy_returns)
max_drawdown_market = calculate_max_drawdown(market_returns)

print(f"策略年化收益率: {annual_strategy_return:.2%}")
print(f"市场年化收益率: {annual_market_return:.2%}")
print(f"策略年化波动率: {annual_strategy_vol:.2%}")
print(f"市场年化波动率: {annual_market_vol:.2%}")
print(f"策略夏普比率: {sharpe_strategy:.4f}")
print(f"市场夏普比率: {sharpe_market:.4f}")
print(f"策略最大回撤: {max_drawdown_strategy:.2%}")
print(f"市场最大回撤: {max_drawdown_market:.2%}")

# 4. RSI策略
print("\nRSI策略:")
print("=" * 50)

def rsi_strategy(df, period=14, overbought=70, oversold=30):
    """RSI策略"""
    signals = pd.DataFrame(index=df.index)
    signals['价格'] = df['价格']
    
    # 计算RSI
    delta = df['价格'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    signals['RSI'] = 100 - (100 / (1 + rs))
    
    # 生成信号
    signals['信号'] = 0
    signals.loc[signals['RSI'] < oversold, '信号'] = 1  # 超卖买入
    signals.loc[signals['RSI'] > overbought, '信号'] = -1  # 超买卖出
    
    return signals

rsi_signals = rsi_strategy(df)

# 可视化RSI策略
fig, axes = plt.subplots(2, 1, figsize=(14, 8))

# 价格
axes[0].plot(rsi_signals.index, rsi_signals['价格'], 'b-', linewidth=2)
buy_signals = rsi_signals[rsi_signals['信号'] == 1]
sell_signals = rsi_signals[rsi_signals['信号'] == -1]
axes[0].scatter(buy_signals.index, buy_signals['价格'], marker='^', color='green', s=100, label='买入信号')
axes[0].scatter(sell_signals.index, sell_signals['价格'], marker='v', color='red', s=100, label='卖出信号')
axes[0].set_title('RSI策略', fontsize=16, fontweight='bold')
axes[0].set_ylabel('价格')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# RSI
axes[1].plot(rsi_signals.index, rsi_signals['RSI'], 'b-', linewidth=2)
axes[1].axhline(y=70, color='r', linestyle='--', label='超买线(70)')
axes[1].axhline(y=30, color='g', linestyle='--', label='超卖线(30)')
axes[1].set_title('RSI指标', fontsize=16, fontweight='bold')
axes[1].set_ylabel('RSI')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

## 课后练习

### 练习1：股票数据分析
1. 获取真实股票数据
2. 计算技术指标
3. 分析价格走势
4. 进行技术分析

### 练习2：风险评估
1. 计算风险指标
2. 计算VaR
3. 计算夏普比率
4. 分析风险收益

### 练习3：投资组合分析
1. 构建投资组合
2. 进行组合优化
3. 分析有效前沿
4. 评估组合绩效

### 练习4：量化交易策略
1. 实现移动平均策略
2. 实现RSI策略
3. 回测策略表现
4. 优化策略参数

## 常见问题

### Q1: 如何选择技术指标？
A: 根据市场特点选择：
- 趋势市场：移动平均线、MACD
- 震荡市场：RSI、布林带
- 综合分析：多个指标结合

### Q2: 如何避免过拟合？
A: 可以尝试：
1. 使用样本外测试
2. 简化策略逻辑
3. 使用交叉验证
4. 控制参数数量

### Q3: 如何处理交易成本？
A: 需要考虑：
1. 手续费
2. 滑点
3. 冲击成本
4. 税费

### Q4: 如何评估策略好坏？
A: 可以使用：
1. 夏普比率
2. 最大回撤
3. 胜率
4. 盈亏比

### Q5: 量化交易需要什么技能？
A: 需要掌握：
1. 编程能力
2. 金融知识
3. 统计分析
4. 风险管理

## 下一步学习

完成今天的学习后，建议你：
1. 练习处理真实的金融数据
2. 掌握风险评估方法
3. 学习投资组合理论
4. 准备进入Day 13的学习：社交媒体数据分析实战

明天我们将学习社交媒体数据分析，这是数据分析的重要应用领域。