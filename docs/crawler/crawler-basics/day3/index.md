# Day 3: 数据提取与正则表达式

## 学习目标

- 掌握正则表达式的基本语法
- 学会使用 Python re 模块处理文本
- 掌握常见的数据提取模式
- 学会数据清洗与格式化

## 技术原理

### 3.1 正则表达式基础

正则表达式（Regular Expression）是一种用于匹配字符串模式的工具，由普通字符和特殊字符组成。

**常用元字符：**

| 元字符 | 说明 | 示例 |
|--------|------|------|
| `.` | 匹配任意字符（除换行符） | `a.c` 匹配 `abc`、`adc` |
| `^` | 匹配字符串开头 | `^hello` 匹配以 hello 开头的字符串 |
| `$` | 匹配字符串结尾 | `world$` 匹配以 world 结尾的字符串 |
| `*` | 匹配前一个字符0次或多次 | `ab*c` 匹配 `ac`、`abc`、`abbc` |
| `+` | 匹配前一个字符1次或多次 | `ab+c` 匹配 `abc`、`abbc` |
| `?` | 匹配前一个字符0次或1次 | `ab?c` 匹配 `ac`、`abc` |
| `\d` | 匹配数字 | `\d+` 匹配一个或多个数字 |
| `\w` | 匹配字母、数字、下划线 | `\w+` 匹配一个或多个单词字符 |
| `\s` | 匹配空白字符 | `\s+` 匹配一个或多个空白字符 |

**常用限定符：**

| 限定符 | 说明 | 示例 |
|--------|------|------|
| `{n}` | 匹配n次 | `\d{3}` 匹配3个数字 |
| `{n,}` | 匹配至少n次 | `\d{2,}` 匹配至少2个数字 |
| `{n,m}` | 匹配n到m次 | `\d{2,4}` 匹配2到4个数字 |

**字符类：**

| 字符类 | 说明 | 示例 |
|--------|------|------|
| `[abc]` | 匹配a、b或c | `[aeiou]` 匹配元音字母 |
| `[^abc]` | 匹配除a、b、c外的字符 | `[^0-9]` 匹配非数字字符 |
| `[a-z]` | 匹配a到z | `[a-zA-Z]` 匹配所有字母 |

### 3.2 Python re 模块

Python 的 re 模块提供了正则表达式操作的核心功能。

**常用函数：**

| 函数 | 说明 |
|------|------|
| `re.match()` | 从字符串开头匹配 |
| `re.search()` | 搜索整个字符串 |
| `re.findall()` | 查找所有匹配项 |
| `re.sub()` | 替换匹配项 |
| `re.split()` | 分割字符串 |

### 3.3 分组与捕获

正则表达式使用小括号 `()` 进行分组，可以捕获匹配的内容。

**分组类型：**

| 类型 | 说明 | 示例 |
|------|------|------|
| `(...)` | 捕获分组 | `(\d{4})-(\d{2})` |
| `(?P<name>...)` | 命名分组 | `(?P<year>\d{4})` |
| `(?:...)` | 非捕获分组 | `(?:abc)+` |

## 案例

### 案例1：提取邮箱地址

```python
import re

# 示例文本
text = """
联系我们：
邮箱1: user@example.com
邮箱2: admin@company.org
邮箱3: test.user@domain.co.uk
"""

# 邮箱正则表达式
pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

# 查找所有邮箱
emails = re.findall(pattern, text)

# 打印结果
for email in emails:
    print(f'邮箱: {email}')
```

### 案例2：提取电话号码

```python
import re

# 示例文本
text = """
联系电话：
手机: 138-1234-5678
座机: 010-12345678
国际: +86-138-1234-5678
"""

# 手机号正则
mobile_pattern = r'1[3-9]\d{9}'
# 座机正则
phone_pattern = r'0\d{2,3}-\d{7,8}'

# 查找手机号
mobiles = re.findall(mobile_pattern, text.replace('-', ''))
print(f'手机号: {mobiles}')

# 查找座机
phones = re.findall(phone_pattern, text)
print(f'座机: {phones}')
```

## 应用场景

### 1. 数据清洗
- 去除 HTML 标签
- 提取特定格式的数据
- 格式化日期时间

### 2. 数据验证
- 验证邮箱格式
- 验证手机号格式
- 验证身份证号

### 3. 日志分析
- 提取错误信息
- 解析访问日志
- 统计特定模式

## 代码案例

### 案例3：提取日期时间

```python
import re

# 示例文本
text = """
会议安排：
日期1: 2024-01-15 14:30:00
日期2: 2024/02/20 09:00
日期3: 2024年3月25日
"""

# 日期正则表达式
date_patterns = [
    r'\d{4}-\d{2}-\d{2}',  # 2024-01-15
    r'\d{4}/\d{2}/\d{2}',  # 2024/02/20
    r'\d{4}年\d{1,2}月\d{1,2}日',  # 2024年3月25日
]

# 时间正则
time_pattern = r'\d{2}:\d{2}(:\d{2})?'

# 提取日期
for pattern in date_patterns:
    dates = re.findall(pattern, text)
    print(f'匹配到的日期: {dates}')

# 提取时间
times = re.findall(time_pattern, text)
print(f'匹配到的时间: {times}')
```

### 案例4：提取URL链接

```python
import re

# 示例文本
text = """
访问以下链接：
https://www.example.com
http://test.org/path?param=value
https://sub.domain.co.uk/page#section
"""

# URL正则表达式
url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'

# 查找所有URL
urls = re.findall(url_pattern, text)

# 打印结果
for url in urls:
    print(f'URL: {url}')
```

### 案例5：提取HTML标签内容

```python
import re

# 示例HTML
html = """
<div class="content">
    <h1>标题</h1>
    <p>第一段</p>
    <p>第二段</p>
    <a href="https://example.com">链接</a>
</div>
"""

# 提取标签内容
# 提取h1标签内容
h1_pattern = r'<h1>(.*?)</h1>'
h1_content = re.findall(h1_pattern, html)
print(f'H1内容: {h1_content}')

# 提取所有p标签内容
p_pattern = r'<p>(.*?)</p>'
p_contents = re.findall(p_pattern, html)
print(f'P标签内容: {p_contents}')

# 提取a标签的href和文本
a_pattern = r'<a\s+href="(.*?)">(.*?)</a>'
a_data = re.findall(a_pattern, html)
for href, text in a_data:
    print(f'链接: {href}, 文本: {text}')
```

### 案例6：使用命名分组

```python
import re

# 示例文本
text = """
订单信息：
订单号: ORD-2024-001
金额: ¥1,234.56
日期: 2024-01-15
"""

# 使用命名分组提取订单信息
pattern = r'订单号:\s*(?P<order_id>\S+)\s*金额:\s*¥(?P<amount>[\d,.]+)\s*日期:\s*(?P<date>\d{4}-\d{2}-\d{2})'

# 匹配
match = re.search(pattern, text)

if match:
    print(f'订单号: {match.group("order_id")}')
    print(f'金额: {match.group("amount")}')
    print(f'日期: {match.group("date")}')
```

### 案例7：数据清洗与格式化

```python
import re

# 原始数据
raw_data = """
  产品名称：  iPhone 15 Pro  
  价格：  ¥8,999.00  
  库存：  100件  
  描述：  这是一款  非常棒的  手机！
"""

# 清洗数据
def clean_text(text):
    # 去除多余空白
    text = re.sub(r'\s+', ' ', text)
    # 去除首尾空白
    text = text.strip()
    return text

# 提取数据
product_name = re.search(r'产品名称：\s*(.+?)\s*$', raw_data, re.MULTILINE)
price = re.search(r'价格：\s*¥([\d,.]+)', raw_data)
stock = re.search(r'库存：\s*(\d+)', raw_data)

if product_name:
    print(f'产品名称: {clean_text(product_name.group(1))}')
if price:
    print(f'价格: {price.group(1)}')
if stock:
    print(f'库存: {stock.group(1)}件')
```

## 课后练习

### 练习1：提取身份证号
编写正则表达式提取18位身份证号。

### 练习2：提取IP地址
编写正则表达式提取IPv4地址。

### 练习3：解析CSV数据
使用正则表达式解析CSV格式的数据。

## 常见问题

### Q1: 贪婪匹配和非贪婪匹配有什么区别？
A: 贪婪匹配（默认）会匹配尽可能多的字符，非贪婪匹配（加`?`）会匹配尽可能少的字符。例如 `.*` 是贪婪，`.*?` 是非贪婪。

### Q2: 如何匹配特殊字符？
A: 使用反斜杠 `\` 转义特殊字符，如 `\.` 匹配点号，`\*` 匹配星号。

### Q3: 正则表达式性能如何优化？
A: 避免使用过多的 `.*`，尽量使用具体的字符类，编译常用的正则表达式。

## 下一步学习

- [Day 4: 反爬机制与应对策略](/crawler/crawler-basics/day4/)
