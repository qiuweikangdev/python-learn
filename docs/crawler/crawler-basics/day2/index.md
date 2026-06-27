# Day 2: HTML解析与BeautifulSoup

## 学习目标

- 理解 HTML 文档结构和 DOM 树
- 掌握 BeautifulSoup 库的基本使用
- 学会使用 CSS 选择器提取数据
- 了解 XPath 基础语法

## 技术原理

### 2.1 HTML 文档结构

HTML（HyperText Markup Language）是网页的标准标记语言，由一系列标签组成。

**基本结构：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网页标题</title>
</head>
<body>
    <header>
        <nav>导航栏</nav>
    </header>
    <main>
        <article>
            <h1>文章标题</h1>
            <p>段落内容</p>
        </article>
    </main>
    <footer>
        <p>页脚内容</p>
    </footer>
</body>
</html>
```

### 2.2 DOM 树结构

DOM（Document Object Model）是 HTML 文档的编程接口，将文档表示为节点树。

**节点类型：**
- **元素节点**: HTML 标签（如 `<div>`、`<p>`）
- **文本节点**: 标签内的文本内容
- **属性节点**: 标签的属性（如 class、id）

### 2.3 BeautifulSoup 简介

BeautifulSoup 是一个用于解析 HTML 和 XML 的 Python 库，提供了简单的方式来导航、搜索和修改解析树。

**主要特点：**
- 容错性强，能处理格式不规范的 HTML
- 提供多种解析器（html.parser、lxml、html5lib）
- 支持 CSS 选择器和 XPath
- API 简单易用

## 案例

### 案例1：基本解析

```python
from bs4 import BeautifulSoup

# HTML 文档
html_doc = """
<html>
<head><title>测试页面</title></head>
<body>
    <div class="container">
        <h1 id="title">欢迎访问</h1>
        <p class="content">这是一个段落</p>
        <p class="content">这是另一个段落</p>
    </div>
</body>
</html>
"""

# 创建 BeautifulSoup 对象
soup = BeautifulSoup(html_doc, 'html.parser')

# 获取标题
title = soup.title.text
print(f'标题: {title}')

# 获取 h1 标签
h1 = soup.find('h1')
print(f'H1: {h1.text}')

# 获取所有 p 标签
paragraphs = soup.find_all('p')
for p in paragraphs:
    print(f'段落: {p.text}')
```

### 案例2：通过属性查找

```python
from bs4 import BeautifulSoup

html_doc = """
<div class="product">
    <h2 class="name">商品名称</h2>
    <span class="price">¥99.00</span>
    <p class="desc">商品描述</p>
</div>
"""

soup = BeautifulSoup(html_doc, 'html.parser')

# 通过 class 查找
product_name = soup.find('h2', class_='name')
print(f'商品名: {product_name.text}')

# 通过 id 查找（如果有id属性）
# element = soup.find('div', id='product-1')

# 通过属性查找
price = soup.find('span', attrs={'class': 'price'})
print(f'价格: {price.text}')
```

## 应用场景

### 1. 网页数据提取
- 提取文章标题和内容
- 获取商品信息
- 采集新闻数据

### 2. 网页结构分析
- 分析网页布局
- 提取导航链接
- 获取页面元数据

### 3. 数据清洗
- 去除 HTML 标签
- 提取纯文本
- 格式化数据

## 代码案例

### 案例3：提取所有链接

```python
from bs4 import BeautifulSoup
import requests

# 获取网页内容
url = 'https://example.com'
response = requests.get(url)

# 解析 HTML
soup = BeautifulSoup(response.text, 'html.parser')

# 查找所有 a 标签
links = soup.find_all('a')

# 提取链接
for link in links:
    href = link.get('href')
    text = link.text.strip()
    if href:
        print(f'链接文本: {text}')
        print(f'链接地址: {href}')
        print('-' * 50)
```

### 案例4：提取表格数据

```python
from bs4 import BeautifulSoup

html_doc = """
<table class="data-table">
    <thead>
        <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>城市</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>25</td>
            <td>北京</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>30</td>
            <td>上海</td>
        </tr>
    </tbody>
</table>
"""

soup = BeautifulSoup(html_doc, 'html.parser')

# 查找表格
table = soup.find('table', class_='data-table')

# 获取表头
headers = []
for th in table.find('thead').find_all('th'):
    headers.append(th.text)

# 获取数据行
rows = []
for tr in table.find('tbody').find_all('tr'):
    row = []
    for td in tr.find_all('td'):
        row.append(td.text)
    rows.append(dict(zip(headers, row)))

# 打印结果
for row in rows:
    print(row)
```

### 案例5：使用 CSS 选择器

```python
from bs4 import BeautifulSoup

html_doc = """
<div class="container">
    <div class="card">
        <h2 class="card-title">标题1</h2>
        <p class="card-text">内容1</p>
    </div>
    <div class="card">
        <h2 class="card-title">标题2</h2>
        <p class="card-text">内容2</p>
    </div>
</div>
"""

soup = BeautifulSoup(html_doc, 'html.parser')

# 使用 CSS 选择器查找
cards = soup.select('.card')

for card in cards:
    title = card.select_one('.card-title').text
    text = card.select_one('.card-text').text
    print(f'标题: {title}')
    print(f'内容: {text}')
    print('-' * 50)

# 嵌套选择
container_cards = soup.select('div.container > div.card')
print(f'找到 {len(container_cards)} 个卡片')
```

### 案例6：提取嵌套数据

```python
from bs4 import BeautifulSoup

html_doc = """
<article class="post">
    <header>
        <h1 class="title">文章标题</h1>
        <div class="meta">
            <span class="author">作者</span>
            <span class="date">2024-01-01</span>
        </div>
    </header>
    <div class="content">
        <p>第一段内容</p>
        <p>第二段内容</p>
        <ul>
            <li>列表项1</li>
            <li>列表项2</li>
        </ul>
    </div>
</article>
"""

soup = BeautifulSoup(html_doc, 'html.parser')

# 提取文章信息
article = soup.find('article', class_='post')

# 标题
title = article.find('h1', class_='title').text
print(f'标题: {title}')

# 作者和日期
author = article.find('span', class_='author').text
date = article.find('span', class_='date').text
print(f'作者: {author}')
print(f'日期: {date}')

# 内容段落
content_div = article.find('div', class_='content')
paragraphs = content_div.find_all('p')
for p in paragraphs:
    print(f'段落: {p.text}')

# 列表项
list_items = content_div.find_all('li')
for li in list_items:
    print(f'列表项: {li.text}')
```

## 课后练习

### 练习1：提取新闻标题
从新闻网站首页提取所有新闻标题和链接。

### 练习2：提取商品列表
从电商网站提取商品名称、价格、销量等信息。

### 练习3：提取评论数据
从论坛或评论区提取用户名、评论内容、发布时间。

## 常见问题

### Q1: 如何选择解析器？
A: 推荐使用 `lxml` 解析器，速度快且容错性好。如果处理格式不规范的 HTML，可以使用 `html5lib`。

### Q2: find() 和 find_all() 有什么区别？
A: `find()` 返回第一个匹配的元素，`find_all()` 返回所有匹配的元素列表。

### Q3: 如何处理动态加载的内容？
A: BeautifulSoup 只能解析静态 HTML，动态加载的内容需要使用 Selenium 或 Playwright。

## 下一步学习

- [Day 3: 数据提取与正则表达式](/crawler/crawler-basics/day3/)
