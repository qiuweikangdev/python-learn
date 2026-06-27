# Day 5: 爬虫框架入门

## 学习目标

- 了解 Scrapy 框架的架构和核心组件
- 学会编写 Spider 爬虫
- 掌握 Item 和 Pipeline 的使用
- 了解中间件的配置和使用

## 技术原理

### 5.1 Scrapy 框架简介

Scrapy 是一个用 Python 编写的开源网络爬虫框架，用于从网页中提取结构化数据。

**主要特点：**
- 高性能异步网络库
- 内置数据提取机制
- 支持中间件扩展
- 内置数据导出功能

### 5.2 Scrapy 架构

Scrapy 的架构由以下组件组成：

**核心组件：**

| 组件 | 说明 |
|------|------|
| Engine | 引擎，控制数据流 |
| Scheduler | 调度器，管理请求队列 |
| Downloader | 下载器，发送HTTP请求 |
| Spider | 爬虫，解析响应 |
| Item Pipeline | 管道，处理数据 |
| Middleware | 中间件，扩展功能 |

**数据流：**
1. Spider 产生初始请求
2. Engine 将请求发送给 Scheduler
3. Scheduler 返回下一个请求给 Engine
4. Engine 通过 Downloader 发送请求
5. Downloader 返回响应给 Engine
6. Engine 将响应发送给 Spider
7. Spider 解析响应，产生 Item 和新请求
8. Item 通过 Pipeline 处理
9. 新请求重复上述过程

### 5.3 核心概念

**Spider**: 定义如何爬取网站，包括起始URL、解析规则等。

**Item**: 定义要抓取的数据结构，类似于 Python 字典。

**Pipeline**: 处理 Spider 提取的数据，包括清洗、验证、存储。

**Middleware**: 处理请求和响应的钩子，用于添加代理、User-Agent等。

## 案例

### 案例1：创建第一个 Scrapy 项目

```bash
# 创建项目
scrapy startproject myproject

# 项目结构
myproject/
    scrapy.cfg
    myproject/
        __init__.py
        items.py
        middlewares.py
        pipelines.py
        settings.py
        spiders/
            __init__.py
```

### 案例2：编写第一个 Spider

```python
import scrapy

class ExampleSpider(scrapy.Spider):
    """示例爬虫"""
    
    # 爬虫名称
    name = 'example'
    
    # 允许的域名
    allowed_domains = ['example.com']
    
    # 起始URL
    start_urls = ['https://example.com']
    
    def parse(self, response):
        """解析响应"""
        # 提取标题
        title = response.css('h1::text').get()
        
        # 提取所有链接
        links = response.css('a::attr(href)').getall()
        
        # 返回数据
        yield {
            'title': title,
            'links': links,
        }
```

### 案例3：定义 Item

```python
# items.py
import scrapy

class ProductItem(scrapy.Item):
    """商品 Item"""
    name = scrapy.Field()  # 商品名称
    price = scrapy.Field()  # 价格
    description = scrapy.Field()  # 描述
    image_url = scrapy.Field()  # 图片URL
```

## 应用场景

### 1. 数据采集
- 电商商品数据
- 新闻文章数据
- 社交媒体数据

### 2. 数据监控
- 价格监控
- 内容更新监控
- 竞品分析

### 3. 数据聚合
- 多源数据整合
- 行业数据汇总

## 代码案例

### 案例4：爬取豆瓣电影 Top250

```python
import scrapy

class DoubanSpider(scrapy.Spider):
    """豆瓣电影 Top250 爬虫"""
    
    name = 'douban'
    allowed_domains = ['movie.douban.com']
    start_urls = ['https://movie.douban.com/top250']
    
    def parse(self, response):
        """解析电影列表页"""
        # 获取所有电影条目
        movies = response.css('.item')
        
        for movie in movies:
            # 提取电影信息
            yield {
                'title': movie.css('.title::text').get(),
                'rating': movie.css('.rating_num::text').get(),
                'people': movie.css('.star span:last-child::text').get(),
                'info': movie.css('.bd p::text').get(),
            }
        
        # 获取下一页链接
        next_page = response.css('.next a::attr(href)').get()
        if next_page:
            # 跟踪下一页
            yield response.follow(next_page, callback=self.parse)
```

### 案例5：使用 Item 和 Pipeline

```python
# items.py
import scrapy

class ArticleItem(scrapy.Item):
    """文章 Item"""
    title = scrapy.Field()
    author = scrapy.Field()
    content = scrapy.Field()
    publish_date = scrapy.Field()
    url = scrapy.Field()

# spiders/article_spider.py
import scrapy
from myproject.items import ArticleItem

class ArticleSpider(scrapy.Spider):
    """文章爬虫"""
    
    name = 'article'
    start_urls = ['https://example.com/articles']
    
    def parse(self, response):
        """解析文章列表"""
        articles = response.css('.article-item')
        
        for article in articles:
            item = ArticleItem()
            item['title'] = article.css('.title::text').get()
            item['author'] = article.css('.author::text').get()
            item['url'] = article.css('a::attr(href)').get()
            
            # 跟踪文章详情页
            yield response.follow(
                item['url'],
                callback=self.parse_article,
                meta={'item': item}
            )
    
    def parse_article(self, response):
        """解析文章详情"""
        item = response.meta['item']
        item['content'] = response.css('.content').get()
        item['publish_date'] = response.css('.date::text').get()
        
        yield item

# pipelines.py
import json

class JsonPipeline:
    """JSON 文件管道"""
    
    def open_spider(self, spider):
        """爬虫启动时调用"""
        self.file = open('articles.json', 'w', encoding='utf-8')
        self.file.write('[\n')
        self.first_item = True
    
    def close_spider(self, spider):
        """爬虫关闭时调用"""
        self.file.write('\n]')
        self.file.close()
    
    def process_item(self, item, spider):
        """处理每个 Item"""
        if not self.first_item:
            self.file.write(',\n')
        else:
            self.first_item = False
        
        line = json.dumps(dict(item), ensure_ascii=False, indent=2)
        self.file.write(line)
        
        return item
```

### 案例6：中间件配置

```python
# middlewares.py
import random

class RandomUserAgentMiddleware:
    """随机 User-Agent 中间件"""
    
    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    ]
    
    def process_request(self, request, spider):
        """处理请求"""
        request.headers['User-Agent'] = random.choice(self.USER_AGENTS)
        return None

class ProxyMiddleware:
    """代理中间件"""
    
    PROXIES = [
        'http://proxy1:8080',
        'http://proxy2:8080',
    ]
    
    def process_request(self, request, spider):
        """处理请求"""
        proxy = random.choice(self.PROXIES)
        request.meta['proxy'] = proxy
        return None

# settings.py
DOWNLOADER_MIDDLEWARES = {
    'myproject.middlewares.RandomUserAgentMiddleware': 400,
    'myproject.middlewares.ProxyMiddleware': 410,
}
```

### 案例7：完整爬虫示例

```python
import scrapy
from scrapy.loader import ItemLoader
from scrapy.loader.processors import TakeFirst, Join, MapCompose
from w3lib.html import remove_tags

class ProductItem(scrapy.Item):
    """商品 Item"""
    name = scrapy.Field()
    price = scrapy.Field()
    description = scrapy.Field()
    category = scrapy.Field()

class ProductLoader(ItemLoader):
    """商品 Item 加载器"""
    default_output_processor = TakeFirst()
    
    name_in = MapCompose(str.strip, remove_tags)
    price_in = MapCompose(lambda x: x.replace('¥', '').strip())
    description_in = MapCompose(str.strip, remove_tags)
    description_out = Join('\n')

class ProductSpider(scrapy.Spider):
    """商品爬虫"""
    
    name = 'product'
    allowed_domains = ['example.com']
    start_urls = ['https://example.com/products']
    
    custom_settings = {
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS': 1,
    }
    
    def parse(self, response):
        """解析商品列表"""
        products = response.css('.product-item')
        
        for product in products:
            loader = ProductLoader(item=ProductItem(), selector=product)
            
            loader.add_css('name', '.product-name::text')
            loader.add_css('price', '.product-price::text')
            loader.add_css('category', '.product-category::text')
            
            # 跟踪详情页
            detail_url = product.css('a::attr(href)').get()
            if detail_url:
                yield response.follow(
                    detail_url,
                    callback=self.parse_detail,
                    meta={'loader': loader}
                )
    
    def parse_detail(self, response):
        """解析商品详情"""
        loader = response.meta['loader']
        loader.add_css('description', '.product-description::text')
        
        yield loader.load_item()
```

### 案例8：运行和调试

```python
# 运行爬虫
# scrapy crawl example

# 保存到文件
# scrapy crawl example -o output.json

# 调试爬虫
import scrapy
from scrapy.shell import inspect_response

class DebugSpider(scrapy.Spider):
    """调试爬虫"""
    
    name = 'debug'
    start_urls = ['https://example.com']
    
    def parse(self, response):
        """解析响应"""
        # 在 shell 中调试
        inspect_response(response, self)
        
        # 正常解析逻辑
        title = response.css('h1::text').get()
        yield {'title': title}
```

## 课后练习

### 练习1：爬取新闻网站
编写一个 Scrapy 爬虫，爬取新闻网站的标题、作者、发布时间。

### 练习2：爬取图片
编写一个 Scrapy 爬虫，下载网页中的图片。

### 练习3：分布式爬虫
使用 Scrapy-Redis 实现分布式爬虫。

## 常见问题

### Q1: Scrapy 和 requests 有什么区别？
A: requests 是 HTTP 库，用于发送请求；Scrapy 是爬虫框架，提供了完整的爬虫解决方案，包括请求调度、数据处理、中间件等。

### Q2: 如何处理反爬？
A: 通过中间件添加 User-Agent、代理、Cookie 等，设置下载延迟，使用 headless 浏览器等。

### Q3: 如何提高爬虫性能？
A: 调整并发请求数、使用连接池、优化解析逻辑、使用缓存等。

## 下一步学习

- [Day 6: 动态页面爬取](/crawler/crawler-advanced/day6/)
