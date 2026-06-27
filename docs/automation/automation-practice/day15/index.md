# Day 15: 爬虫自动化（Scrapy）

## 学习目标

完成今天的学习后，你将能够：
- 掌握Scrapy框架基础
- 开发完整的爬虫项目
- 实现数据管道处理
- 了解分布式爬虫

## 技术原理

### Scrapy架构

```
Spider → Scheduler → Downloader → Spider Middlewares → Pipeline
```

### 核心组件

1. **Spider**：定义爬取逻辑
2. **Item**：定义数据结构
3. **Pipeline**：处理和存储数据
4. **Middleware**：请求/响应处理
5. **Settings**：配置选项

### Scrapy命令

```bash
# 创建项目
scrapy startproject project_name

# 创建爬虫
scrapy genspider spider_name domain.com

# 运行爬虫
scrapy crawl spider_name
```

## 案例：完整爬虫项目

开发一个完整的爬虫项目，实现：
1. 网站爬取
2. 数据解析
3. 数据存储
4. 反爬处理

## 应用场景

### 1. 数据采集
- 新闻聚合
- 商品价格监控
- 社交媒体数据

### 2. 市场研究
- 竞品分析
- 价格比较
- 趋势分析

### 3. 内容聚合
- 信息聚合
- 内容推荐
- 数据分析

## 代码案例

### 案例1：基础爬虫

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scrapy基础爬虫
功能：爬取网站数据
"""

# items.py
import scrapy

class ArticleItem(scrapy.Item):
    """文章数据项"""
    title = scrapy.Field()      # 标题
    author = scrapy.Field()     # 作者
    content = scrapy.Field()    # 内容
    url = scrapy.Field()        # 链接
    publish_time = scrapy.Field()  # 发布时间

# spiders/article_spider.py
import scrapy
from ..items import ArticleItem

class ArticleSpider(scrapy.Spider):
    """文章爬虫"""
    
    name = 'article'
    allowed_domains = ['example.com']
    start_urls = ['https://www.example.com/articles']
    
    def parse(self, response):
        """解析文章列表"""
        # 获取文章列表
        articles = response.css('div.article-item')
        
        for article in articles:
            # 提取文章链接
            link = article.css('a::attr(href)').get()
            
            # 跟随链接
            yield response.follow(link, self.parse_article)
        
        # 获取下一页
        next_page = response.css('a.next-page::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)
    
    def parse_article(self, response):
        """解析文章详情"""
        item = ArticleItem()
        
        item['title'] = response.css('h1::text').get()
        item['author'] = response.css('span.author::text').get()
        item['content'] = response.css('div.content').get()
        item['url'] = response.url
        item['publish_time'] = response.css('span.time::text').get()
        
        yield item

# pipelines.py
import json

class JsonPipeline:
    """JSON存储管道"""
    
    def __init__(self):
        self.file = open('articles.json', 'w', encoding='utf-8')
        self.items = []
    
    def process_item(self, item, spider):
        """处理数据项"""
        self.items.append(dict(item))
        return item
    
    def close_spider(self, spider):
        """关闭爬虫时保存数据"""
        json.dump(self.items, self.file, ensure_ascii=False, indent=2)
        self.file.close()

class CsvPipeline:
    """CSV存储管道"""
    
    def __init__(self):
        self.file = open('articles.csv', 'w', newline='', encoding='utf-8')
        self.writer = None
    
    def process_item(self, item, spider):
        """处理数据项"""
        import csv
        
        if self.writer is None:
            self.writer = csv.DictWriter(self.file, fieldnames=item.keys())
            self.writer.writeheader()
        
        self.writer.writerow(dict(item))
        return item
    
    def close_spider(self, spider):
        """关闭爬虫"""
        self.file.close()

# settings.py
BOT_NAME = 'mybot'
SPIDER_MODULES = ['mybot.spiders']
NEWSPIDER_MODULE = 'mybot.spiders'

# 遵守robots.txt
ROBOTSTXT_OBEY = True

# 下载延迟
DOWNLOAD_DELAY = 1

# 并发请求
CONCURRENT_REQUESTS = 16

# 管道配置
ITEM_PIPELINES = {
    'mybot.pipelines.JsonPipeline': 300,
    'mybot.pipelines.CsvPipeline': 400,
}

# 用户代理
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
```

### 案例2：反爬处理

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
反爬虫处理
功能：处理常见的反爬虫机制
"""

# middlewares.py
import random
from scrapy import signals

class RandomUserAgentMiddleware:
    """随机用户代理中间件"""
    
    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    ]
    
    def process_request(self, request, spider):
        """处理请求"""
        request.headers['User-Agent'] = random.choice(self.USER_AGENTS)

class ProxyMiddleware:
    """代理中间件"""
    
    PROXIES = [
        'http://proxy1:8080',
        'http://proxy2:8080',
        'http://proxy3:8080',
    ]
    
    def process_request(self, request, spider):
        """处理请求"""
        request.meta['proxy'] = random.choice(self.PROXIES)

class RetryMiddleware:
    """重试中间件"""
    
    def __init__(self, max_retry=3):
        self.max_retry = max_retry
    
    @classmethod
    def from_crawler(cls, crawler):
        """从爬虫创建"""
        return cls(
            max_retry=crawler.settings.getint('RETRY_TIMES', 3)
        )
    
    def process_response(self, request, response, spider):
        """处理响应"""
        if response.status == 200:
            return response
        
        # 重试
        retry_times = request.meta.get('retry_times', 0)
        if retry_times < self.max_retry:
            retry_request = request.copy()
            retry_request.meta['retry_times'] = retry_times + 1
            retry_request.dont_filter = True
            return retry_request
        
        return response

# settings.py配置
DOWNLOADER_MIDDLEWARES = {
    'mybot.middlewares.RandomUserAgentMiddleware': 400,
    'mybot.middlewares.ProxyMiddleware': 410,
    'mybot.middlewares.RetryMiddleware': 420,
}
```

### 案例3：分布式爬虫

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
分布式爬虫
功能：使用Redis实现分布式爬虫
"""

# 使用scrapy-redis实现分布式
# settings.py

# 调度器
SCHEDULER = "scrapy_redis.scheduler.Scheduler"

# 去重过滤器
DUPEFILTER_CLASS = "scrapy_redis.dupefilter.RFPDupeFilter"

# Redis连接
REDIS_URL = 'redis://localhost:6379'

# 持久化
SCHEDULER_PERSIST = True

# 管道
ITEM_PIPELINES = {
    'scrapy_redis.pipelines.RedisPipeline': 300,
}

# spiders/distributed_spider.py
from scrapy_redis.spiders import RedisSpider

class DistributedSpider(RedisSpider):
    """分布式爬虫"""
    
    name = 'distributed'
    redis_key = 'distributed:start_urls'
    
    def parse(self, response):
        """解析响应"""
        # 解析逻辑
        for item in response.css('div.item'):
            yield {
                'title': item.css('h2::text').get(),
                'url': item.css('a::attr(href)').get(),
            }
        
        # 获取下一页
        next_page = response.css('a.next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

## 课后练习

### 练习1：基础爬虫
1. 创建一个简单的爬虫项目
2. 爬取新闻网站数据
3. 保存到数据库

### 练习2：数据处理
1. 实现数据清洗管道
2. 处理重复数据
3. 数据验证和转换

### 练习3：高级功能
1. 实现分布式爬虫
2. 处理JavaScript渲染
3. 实现增量爬取

## 常见问题

### Q1: 如何处理反爬虫？
A: 使用代理、随机User-Agent、控制爬取频率。

### Q2: 如何提高爬取效率？
A: 使用异步、多线程、分布式爬虫。

### Q3: 如何存储大量数据？
A: 使用数据库、分布式存储、数据压缩。

## 总结

恭喜你完成了Python自动化系列的学习！

### 学习成果

通过15天的学习，你已经掌握了：

1. **基础自动化**：Python脚本、文件处理、系统任务
2. **进阶自动化**：日志记录、测试、部署、CI/CD
3. **实战自动化**：监控告警、日志分析、AI自动化、网页自动化、爬虫

### 下一步建议

1. **项目实践**：将所学应用到实际项目
2. **深入学习**：选择感兴趣的领域深入研究
3. **社区参与**：参与开源项目，分享经验
4. **持续学习**：关注新技术，保持学习

### 推荐资源

- [Python官方文档](https://docs.python.org/3/)
- [Scrapy文档](https://docs.scrapy.org/)
- [Selenium文档](https://www.selenium.dev/)
- [GitHub Actions文档](https://docs.github.com/en/actions)

祝你在自动化的道路上越走越远！