# Day 1: 爬虫基础与HTTP协议

## 学习目标

- 理解网络爬虫的基本概念和应用场景
- 掌握 HTTP 协议的工作原理
- 学会使用 requests 库发送 HTTP 请求
- 理解请求头、Cookie、Session 的作用

## 技术原理

### 1.1 什么是网络爬虫

网络爬虫（Web Crawler），也称为网络蜘蛛（Web Spider），是一种按照一定规则自动抓取互联网信息的程序。

**工作流程：**
1. 从初始 URL 队列中取出一个 URL
2. 解析 URL，获取协议、域名、路径等信息
3. 向服务器发送 HTTP 请求
4. 接收服务器响应，获取 HTML 内容
5. 解析 HTML，提取所需数据和新的 URL
6. 将新 URL 加入队列，重复上述过程

### 1.2 HTTP 协议基础

HTTP（HyperText Transfer Protocol）是互联网上应用最广泛的协议，用于传输超文本数据。

**HTTP 请求方法：**

| 方法 | 说明 | 使用场景 |
|------|------|----------|
| GET | 获取资源 | 获取网页内容 |
| POST | 提交数据 | 登录、搜索 |
| PUT | 更新资源 | 更新数据 |
| DELETE | 删除资源 | 删除数据 |
| HEAD | 获取头部信息 | 检查资源状态 |

**HTTP 状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 301 | 永久重定向 |
| 302 | 临时重定向 |
| 400 | 请求错误 |
| 403 | 禁止访问 |
| 404 | 未找到资源 |
| 500 | 服务器错误 |

### 1.3 请求头与响应头

**常见请求头：**

| 头部字段 | 说明 |
|----------|------|
| User-Agent | 浏览器标识 |
| Accept | 可接受的内容类型 |
| Cookie | 会话信息 |
| Referer | 来源页面 |

**常见响应头：**

| 头部字段 | 说明 |
|----------|------|
| Content-Type | 内容类型 |
| Set-Cookie | 设置 Cookie |
| Location | 重定向地址 |

## 案例

### 案例1：获取百度首页

```python
import requests

# 发送 GET 请求获取百度首页
response = requests.get('https://www.baidu.com')

# 打印状态码
print(f'状态码: {response.status_code}')

# 打印响应内容类型
print(f'内容类型: {response.headers["Content-Type"]}')

# 打印 HTML 内容（前500字符）
print(f'HTML内容:\n{response.text[:500]}')
```

### 案例2：携带请求头发送请求

```python
import requests

# 设置请求头，模拟浏览器访问
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

# 发送请求
response = requests.get('https://www.example.com', headers=headers)

# 打印响应状态
print(f'状态码: {response.status_code}')
print(f'响应大小: {len(response.content)} 字节')
```

## 应用场景

### 1. 搜索引擎
- 爬取网页内容建立索引
- 定期更新网页快照

### 2. 数据分析
- 采集市场数据进行分析
- 监控竞品价格变化

### 3. 信息聚合
- 聚合多个网站的新闻
- 收集行业资讯

### 4. 学术研究
- 采集研究数据
- 文献资料收集

## 代码案例

### 案例3：获取豆瓣电影Top250

```python
import requests
from bs4 import BeautifulSoup

# 豆瓣电影Top250的URL
url = 'https://movie.douban.com/top250'

# 设置请求头
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# 发送请求
response = requests.get(url, headers=headers)

# 检查请求是否成功
if response.status_code == 200:
    # 使用BeautifulSoup解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 查找所有电影条目
    movies = soup.find_all('div', class_='item')
    
    # 遍历每个电影
    for movie in movies:
        # 获取电影名称
        title = movie.find('span', class_='title').text
        
        # 获取评分
        rating = movie.find('span', class_='rating_num').text
        
        # 获取评价人数
        people = movie.find('div', class_='star').find_all('span')[-1].text
        
        # 打印电影信息
        print(f'电影: {title}')
        print(f'评分: {rating}')
        print(f'评价人数: {people}')
        print('-' * 50)
else:
    print(f'请求失败，状态码: {response.status_code}')
```

### 案例4：使用Session保持登录状态

```python
import requests

# 创建Session对象
session = requests.Session()

# 登录URL
login_url = 'https://example.com/login'

# 登录数据
login_data = {
    'username': 'your_username',
    'password': 'your_password'
}

# 设置请求头
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# 发送登录请求
response = session.post(login_url, data=login_data, headers=headers)

# 检查登录是否成功
if response.status_code == 200:
    print('登录成功')
    
    # 使用同一个Session访问需要登录的页面
    profile_url = 'https://example.com/profile'
    profile_response = session.get(profile_url)
    
    print(f'个人资料页面状态码: {profile_response.status_code}')
else:
    print(f'登录失败，状态码: {response.status_code}')
```

### 案例5：下载图片

```python
import requests
import os

# 图片URL
image_url = 'https://example.com/image.jpg'

# 设置请求头
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# 发送请求
response = requests.get(image_url, headers=headers, stream=True)

# 检查请求是否成功
if response.status_code == 200:
    # 创建保存目录
    save_dir = 'downloaded_images'
    os.makedirs(save_dir, exist_ok=True)
    
    # 保存图片
    image_path = os.path.join(save_dir, 'image.jpg')
    with open(image_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print(f'图片已保存到: {image_path}')
else:
    print(f'下载失败，状态码: {response.status_code}')
```

## 课后练习

### 练习1：获取网页标题
编写代码获取任意网页的标题（`<title>`标签内容）。

### 练习2：获取网页所有链接
编写代码获取网页中所有的超链接（`<a>`标签的href属性）。

### 练习3：模拟搜索
使用 requests 库模拟搜索引擎搜索，并获取搜索结果。

## 常见问题

### Q1: 为什么需要设置 User-Agent？
A: 很多网站会检查 User-Agent，如果不设置或使用默认的 Python User-Agent，可能会被识别为爬虫而被拒绝访问。

### Q2: 如何处理中文编码问题？
A: 使用 `response.encoding` 设置正确的编码，或者使用 `response.content.decode('utf-8')` 手动解码。

### Q3: 如何处理重定向？
A: requests 默认会自动处理重定向，可以通过 `allow_redirects=False` 参数禁用自动重定向。

## 下一步学习

- [Day 2: HTML解析与BeautifulSoup](/crawler/crawler-basics/day2/)
