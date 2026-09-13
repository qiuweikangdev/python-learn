# Day 11: 电商数据爬取实战

> **版本基线**：本文基于 Python 3.12+，requests 2.x / Scrapy 2.x / Selenium 4.x，更新于 2026-09。

::: tip 实战目标站点
本章实战目标为 **[books.toscrape.com](https://books.toscrape.com/)** —— 一个由 Scrapy 官方维护的图书电商模拟站，结构稳定、合法开放，专供爬虫学习使用。下文所有选择器均已对照真实页面结构核实，代码可直接运行。
:::

## 学习目标

- 掌握电商网站的爬取策略
- 学会爬取商品列表和详情
- 实现评论数据采集
- 构建价格监控系统

## 技术原理

### 11.1 电商网站特点

**常见特点：**
- 页面结构复杂
- 动态加载内容多
- 反爬机制严格
- 数据量大

**爬取难点：**
- 需要处理分页
- 需要处理动态加载
- 需要处理登录验证
- 需要处理验证码

### 11.2 爬取策略

**列表页爬取：**
- 分析分页参数
- 提取商品链接
- 处理无限滚动

**详情页爬取：**
- 提取商品信息
- 处理图片下载
- 处理规格参数

**评论爬取：**
- 分析评论接口
- 处理分页加载
- 提取评论内容

### 11.3 反爬应对

**常见反爬：**
- User-Agent 检测
- IP 频率限制
- Cookie 验证
- 验证码

**应对策略：**
- 伪装请求头
- 使用代理 IP
- 控制请求频率
- 使用 Selenium

## 案例

### 案例1：图书列表抓取（requests + BeautifulSoup，含翻页与 CSV 存储）

```python
import csv
import time
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE_URL = 'https://books.toscrape.com/'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
}

# 评分等级：星标数量记录在 <p class="star-rating One/Two/Three/Four/Five"> 的 class 中
RATING_MAP = {'One': 1, 'Two': 2, 'Three': 3, 'Four': 4, 'Five': 5}


def parse_list_page(html, current_url):
    """解析列表页，返回 (图书列表, 下一页URL 或 None)"""
    soup = BeautifulSoup(html, 'html.parser')
    books = []

    # 每个图书条目是 <article class="product_pod">
    for product in soup.select('article.product_pod'):
        # 书名在 h3 a 的 title 属性（可见文本被截断成 "A Light in the ..."）
        title = product.select_one('h3 a')['title']
        # 详情页链接是相对路径，必须用 urljoin 拼接
        detail_url = urljoin(current_url, product.select_one('h3 a')['href'])
        # 价格，如 £51.77
        price = product.select_one('p.price_color').get_text(strip=True)
        # 库存状态：<p class="instock availability">In stock</p>
        stock = product.select_one('p.instock.availability').get_text(strip=True)
        # 评分藏在 class 里：<p class="star-rating Three">
        rating_classes = product.select_one('p.star-rating')['class']
        rating = next(RATING_MAP[c] for c in rating_classes if c in RATING_MAP)

        books.append({
            'title': title,
            'price': price,
            'rating': rating,
            'stock': stock,
            'url': detail_url,
        })

    # 翻页：<ul class="pager"> 中 <li class="next"><a href="...">next</a></li>
    # 注意：首页的下一页是相对路径 catalogue/page-2.html，
    # 第 2 页起是 page-3.html，用 urljoin(current_url, href) 统一处理
    next_link = soup.select_one('ul.pager li.next a')
    next_url = urljoin(current_url, next_link['href']) if next_link else None

    return books, next_url


def crawl(pages=3, save_path='books.csv'):
    """翻页抓取并保存为 CSV"""
    all_books = []
    url = BASE_URL

    for page in range(pages):
        if not url:
            break

        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        books, url = parse_list_page(response.text, response.url)
        all_books.extend(books)
        print(f'第 {page + 1} 页完成（{response.url}），已抓取 {len(all_books)} 本')

        # 礼貌抓取：控制请求频率
        time.sleep(1)

    # 保存为 CSV（utf-8-sig 让 Excel 正确识别中文/英镑符号）
    with open(save_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=['title', 'price', 'rating', 'stock', 'url'])
        writer.writeheader()
        writer.writerows(all_books)

    print(f'共 {len(all_books)} 条数据已保存到 {save_path}')


if __name__ == '__main__':
    crawl(pages=3)
```

::: tip 站点结构速查（已核实）
- 图书条目：`article.product_pod`
- 书名：`h3 a` 的 `title` 属性（可见文本是截断的）
- 价格：`p.price_color`（如 `£51.77`）
- 库存：`p.instock.availability`（如 `In stock`）
- 评分：`p.star-rating` 的 class 中的 `One/Two/Three/Four/Five`
- 分页：`ul.pager li.next a`（相对路径，用 `urljoin` 处理）
:::

### 案例2：接口型数据采集（思路演示）

```python
import scrapy
import json

class ReviewSpider(scrapy.Spider):
    """评论爬虫（思路演示）"""
    
    name = 'reviews'
    
    def start_requests(self):
        """生成初始请求"""
        # 注意：books.toscrape.com 并没有评论接口，本例展示的是
        # 真实电商站“评论 XHR 接口 + 分页参数”的通用模式。
        # 实际使用时请替换为目标站点的接口地址与参数，并确认你有权采集。
        api_url = 'https://books.toscrape.com/api/reviews'  # 示意地址，沙盒站并不存在
        
        for page in range(1, 10):
            yield scrapy.FormRequest(
                url=api_url,
                formdata={'page': str(page), 'product_id': '12345'},
                callback=self.parse_reviews
            )
    
    def parse_reviews(self, response):
        """解析评论数据"""
        data = json.loads(response.text)
        
        for review in data.get('reviews', []):
            yield {
                'user': review.get('username'),
                'rating': review.get('rating'),
                'content': review.get('content'),
                'time': review.get('created_at'),
            }
```

## 应用场景

### 1. 商品信息采集
- 竞品分析
- 价格监控
- 市场调研

### 2. 评论数据分析
- 用户反馈分析
- 产品改进
- 舆情监控

### 3. 价格监控
- 价格变动提醒
- 促销活动监控
- 价格趋势分析

## 代码案例

### 案例3：完整的图书爬虫（Scrapy）

```python
import re
from datetime import datetime

import scrapy
from scrapy.loader import ItemLoader
from scrapy.loader.processors import TakeFirst, Join, MapCompose

class ProductItem(scrapy.Item):
    """图书 Item"""
    name = scrapy.Field()
    price = scrapy.Field()
    rating = scrapy.Field()
    stock = scrapy.Field()
    url = scrapy.Field()
    image_urls = scrapy.Field()
    description = scrapy.Field()
    upc = scrapy.Field()
    crawl_time = scrapy.Field()

class ProductLoader(ItemLoader):
    """图书加载器"""
    default_output_processor = TakeFirst()
    
    name_in = MapCompose(str.strip)
    stock_in = MapCompose(str.strip)
    price_in = MapCompose(lambda x: re.sub(r'[^\d.]', '', x))  # '£51.77' -> '51.77'
    # 评分藏在 class 里：'star-rating Three' -> 'Three'
    rating_in = MapCompose(
        lambda x: re.search(r'(One|Two|Three|Four|Five)', x).group(1)
        if re.search(r'(One|Two|Three|Four|Five)', x) else None
    )
    description_out = Join()

class EcommerceSpider(scrapy.Spider):
    """books.toscrape.com 图书爬虫"""
    
    name = 'books_toscrape'
    allowed_domains = ['books.toscrape.com']
    start_urls = ['https://books.toscrape.com/']
    
    custom_settings = {
        'DOWNLOAD_DELAY': 1,
        'CONCURRENT_REQUESTS': 4,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 2,
    }
    
    def parse(self, response):
        """解析图书列表页"""
        # 每个条目是 <article class="product_pod">（已对照真实站点核实）
        products = response.css('article.product_pod')
        
        for product in products:
            loader = ProductLoader(item=ProductItem(), selector=product)
            
            # 列表页信息
            loader.add_css('name', 'h3 a::attr(title)')          # 书名在 title 属性
            loader.add_css('price', 'p.price_color::text')       # p.price_color
            loader.add_css('stock', 'p.instock.availability::text')
            loader.add_css('rating', 'p.star-rating::attr(class)')  # 评分在 class 中
            loader.add_value('url', response.urljoin(product.css('h3 a::attr(href)').get()))
            loader.add_value('image_urls', response.urljoin(product.css('img::attr(src)').get()))
            
            # 跟踪详情页补充描述与 UPC
            detail_url = response.urljoin(product.css('h3 a::attr(href)').get())
            yield response.follow(
                detail_url,
                callback=self.parse_detail,
                meta={'loader': loader}
            )
        
        # 处理分页：ul.pager li.next a（response.follow 会自动拼接相对路径）
        next_page = response.css('ul.pager li.next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
    
    def parse_detail(self, response):
        """解析图书详情"""
        loader = response.meta['loader']
        
        # 详情页信息
        loader.add_css('description', '#product_description + p::text', Join())
        # 商品信息表第一行是 UPC：<table class="table table-striped"> <tr><th>UPC</th><td>...</td></tr>
        loader.add_css('upc', 'table.table-striped tr:first-child td::text')
        loader.add_value('crawl_time', datetime.now().isoformat())
        
        yield loader.load_item()
```

### 案例4：价格监控系统

```python
import re
from datetime import datetime

import scrapy

class PriceMonitorSpider(scrapy.Spider):
    """价格监控爬虫（books.toscrape.com 图书价格）"""
    
    name = 'price_monitor'
    
    # 要监控的图书详情页，可换成站内任意详情页 URL
    book_urls = [
        'https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html',
        'https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html',
        'https://books.toscrape.com/catalogue/soumission_998/index.html',
    ]
    
    def start_requests(self):
        """生成初始请求"""
        for url in self.book_urls:
            # 用 URL 末段的图书 slug 作为商品标识
            product_id = url.rstrip('/').rsplit('/', 1)[-1]
            yield scrapy.Request(
                url,
                callback=self.parse_price,
                meta={'product_id': product_id}
            )
    
    def parse_price(self, response):
        """解析价格"""
        product_id = response.meta['product_id']
        
        # 提取价格：<p class="price_color">£51.77</p>
        price_text = response.css('p.price_color::text').get()
        price = self.extract_price(price_text)
        
        # 库存数量：<p class="instock availability">In stock (22 available)</p>
        stock_text = ''.join(response.css('p.instock.availability ::text').getall())
        stock_match = re.search(r'\((\d+) available\)', stock_text)
        
        yield {
            'product_id': product_id,
            'name': response.css('div.product_main h1::text').get(),
            'price': price,
            'available': int(stock_match.group(1)) if stock_match else None,
            'timestamp': datetime.now().isoformat(),
            'url': response.url,
        }
    
    def extract_price(self, price_text):
        """提取价格"""
        if not price_text:
            return None
        
        match = re.search(r'[\d.]+', price_text)
        if match:
            try:
                return float(match.group())
            except ValueError:
                pass
        
        return None
```

### 案例5：图片下载管道

```python
# pipelines.py
import scrapy
from scrapy.pipelines.images import ImagesPipeline
from urllib.parse import urlparse

class ProductImagesPipeline(ImagesPipeline):
    """商品图片管道"""
    
    def get_media_requests(self, item, info):
        """获取图片下载请求"""
        for image_url in item.get('image_urls', []):
            yield scrapy.Request(
                image_url,
                meta={'product_id': item.get('product_id')}
            )
    
    def file_path(self, request, response=None, info=None, *, item=None):
        """生成文件路径"""
        product_id = request.meta.get('product_id', 'unknown')
        
        # 从URL提取文件名
        url = urlparse(request.url)
        filename = url.path.split('/')[-1]
        
        # 按商品ID分目录
        return f'products/{product_id}/{filename}'
    
    def item_completed(self, results, item, info):
        """处理完成"""
        image_paths = [x['path'] for ok, x in results if ok]
        
        if image_paths:
            item['image_paths'] = image_paths
        
        return item

# settings.py
ITEM_PIPELINES = {
    'myproject.pipelines.ProductImagesPipeline': 300,
}

IMAGES_STORE = './images'
IMAGES_MIN_HEIGHT = 200
IMAGES_MIN_WIDTH = 200
```

### 案例6：数据存储与分析

```python
# pipelines.py
import pymysql
from datetime import datetime

class EcommercePipeline:
    """电商数据管道"""
    
    def __init__(self, db_config):
        self.db_config = db_config
        self.connection = None
    
    @classmethod
    def from_crawler(cls, crawler):
        db_config = {
            'host': crawler.settings.get('MYSQL_HOST', 'localhost'),
            'port': crawler.settings.getint('MYSQL_PORT', 3306),
            'user': crawler.settings.get('MYSQL_USER', 'root'),
            'password': crawler.settings.get('MYSQL_PASSWORD', ''),
            'database': crawler.settings.get('MYSQL_DATABASE', 'ecommerce'),
        }
        return cls(db_config)
    
    def open_spider(self, spider):
        """连接数据库"""
        self.connection = pymysql.connect(**self.db_config)
        self.create_tables()
    
    def close_spider(self, spider):
        """关闭连接"""
        if self.connection:
            self.connection.close()
    
    def create_tables(self):
        """创建表"""
        cursor = self.connection.cursor()
        
        # 商品表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id VARCHAR(50) UNIQUE,
                name VARCHAR(255),
                price DECIMAL(10,2),
                original_price DECIMAL(10,2),
                sales INT,
                rating DECIMAL(3,2),
                url VARCHAR(500),
                crawl_time DATETIME,
                INDEX idx_product_id (product_id),
                INDEX idx_crawl_time (crawl_time)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ''')
        
        # 价格历史表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS price_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id VARCHAR(50),
                price DECIMAL(10,2),
                timestamp DATETIME,
                INDEX idx_product_id (product_id),
                INDEX idx_timestamp (timestamp)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ''')
        
        self.connection.commit()
    
    def process_item(self, item, spider):
        """存储数据"""
        cursor = self.connection.cursor()
        
        # 插入或更新商品
        sql = '''
            INSERT INTO products (product_id, name, price, original_price, sales, rating, url, crawl_time)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                price = VALUES(price),
                original_price = VALUES(original_price),
                sales = VALUES(sales),
                rating = VALUES(rating),
                crawl_time = VALUES(crawl_time)
        '''
        
        cursor.execute(sql, (
            item.get('product_id'),
            item.get('name'),
            item.get('price'),
            item.get('original_price'),
            item.get('sales'),
            item.get('rating'),
            item.get('url'),
            item.get('crawl_time'),
        ))
        
        # 记录价格历史
        if item.get('price'):
            sql = '''
                INSERT INTO price_history (product_id, price, timestamp)
                VALUES (%s, %s, %s)
            '''
            cursor.execute(sql, (
                item.get('product_id'),
                item.get('price'),
                datetime.now(),
            ))
        
        self.connection.commit()
        
        return item
```

### 案例7：数据分析与可视化

```python
import pandas as pd
import matplotlib.pyplot as plt
import pymysql

class PriceAnalyzer:
    """价格分析器"""
    
    def __init__(self, db_config):
        self.connection = pymysql.connect(**db_config)
    
    def get_price_history(self, product_id):
        """获取价格历史"""
        sql = '''
            SELECT price, timestamp 
            FROM price_history 
            WHERE product_id = %s 
            ORDER BY timestamp
        '''
        
        df = pd.read_sql(sql, self.connection, params=[product_id])
        return df
    
    def plot_price_trend(self, product_id):
        """绘制价格趋势图"""
        df = self.get_price_history(product_id)
        
        if df.empty:
            print(f'没有找到商品 {product_id} 的价格数据')
            return
        
        plt.figure(figsize=(12, 6))
        plt.plot(df['timestamp'], df['price'], marker='o')
        plt.title(f'商品 {product_id} 价格趋势')
        plt.xlabel('时间')
        plt.ylabel('价格')
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        plt.savefig(f'price_trend_{product_id}.png')
        plt.show()
    
    def analyze_price_changes(self, product_id):
        """分析价格变动"""
        df = self.get_price_history(product_id)
        
        if df.empty:
            return None
        
        analysis = {
            'product_id': product_id,
            'current_price': df['price'].iloc[-1],
            'min_price': df['price'].min(),
            'max_price': df['price'].max(),
            'avg_price': df['price'].mean(),
            'price_changes': len(df) - 1,
            'first_recorded': df['timestamp'].iloc[0],
            'last_recorded': df['timestamp'].iloc[-1],
        }
        
        return analysis
    
    def close(self):
        """关闭连接"""
        self.connection.close()

# 使用示例
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'ecommerce',
}

analyzer = PriceAnalyzer(db_config)

# 分析价格变动
analysis = analyzer.analyze_price_changes('12345')
if analysis:
    print(f'商品ID: {analysis["product_id"]}')
    print(f'当前价格: ¥{analysis["current_price"]}')
    print(f'最低价格: ¥{analysis["min_price"]}')
    print(f'最高价格: ¥{analysis["max_price"]}')
    print(f'平均价格: ¥{analysis["avg_price"]:.2f}')

# 绘制价格趋势
analyzer.plot_price_trend('12345')

analyzer.close()
```

## 课后练习

### 练习1：爬取图书详情页
在案例1的基础上，跟踪每本书的详情页 URL，补充抓取库存数量（如 `In stock (22 available)` 中的 22）与 UPC 编码。

### 练习2：实现价格提醒
实现一个价格低于阈值时发送提醒的功能。

### 练习3：竞品分析
实现一个竞品价格对比分析系统。

## 常见问题

### Q1: 如何处理电商网站的反爬？
A: 使用 Selenium 模拟浏览器、使用代理 IP、控制请求频率、处理验证码。

### Q2: 如何处理商品图片？
A: 使用 Scrapy 的 ImagesPipeline，配置图片存储路径。

### Q3: 如何保证数据准确性？
A: 数据清洗、数据验证、异常处理、定期更新。

::: warning
books.toscrape.com 是专供爬虫学习的公开沙盒站（页面也自述 "This is a demo website for web scraping purposes"），可以放心练习；但请勿对真实电商平台进行高频抓取。
:::

## 下一步学习

- [Day 12: 社交媒体数据采集](/crawler/crawler-practice/day12/)
