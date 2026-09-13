# Day 13: 新闻网站爬取

> **版本基线**：本文基于 Python 3.12+，requests 2.x / Scrapy 2.x / Selenium 4.x，更新于 2026-09。

::: tip 实战目标站点
本章保留"资讯内容采集"主题，但演示站点改用 **[quotes.toscrape.com](https://quotes.toscrape.com/)** —— 一个由 Scrapy 官方维护的名言内容站，结构稳定、合法开放。新闻站与内容站的采集流程完全一致（列表页 → 详情页 → 清洗 → 存储 → 统计），下文所有选择器均已对照真实页面结构核实。
:::

## 学习目标

- 掌握新闻网站的爬取策略
- 学会提取新闻标题、正文、图片
- 实现自动更新机制
- 了解新闻数据的存储和分析

## 技术原理

### 13.1 新闻网站特点

**页面特点：**
- 结构相对规范
- 更新频繁
- 包含多媒体内容
- 分类清晰

**数据特点：**
- 时效性强
- 内容结构化
- 包含元数据（时间、来源、作者）

### 13.2 爬取策略

**列表页爬取：**
- 提取新闻链接
- 处理分页
- 处理分类

**详情页爬取：**
- 提取标题
- 提取正文
- 提取图片
- 提取元数据

### 13.3 增量爬取

**策略：**
- 基于时间戳
- 基于 URL 去重
- 基于内容哈希

## 案例

### 案例1：名言列表爬取（quotes.toscrape.com）

```python
import scrapy

class QuoteListSpider(scrapy.Spider):
    """名言列表爬虫（对应新闻站的“新闻列表爬取”）"""
    
    name = 'quotes_list'
    allowed_domains = ['quotes.toscrape.com']
    start_urls = ['https://quotes.toscrape.com/']
    
    def parse(self, response):
        """解析列表页"""
        # 每条名言是 <div class="quote">（已对照真实站点核实）
        quotes = response.css('div.quote')
        
        for quote in quotes:
            yield {
                # 名言内容：<span class="text">…</span>
                'text': quote.css('span.text::text').get(),
                # 作者：<small class="author">Albert Einstein</small>
                'author': quote.css('small.author::text').get(),
                # 标签：<div class="tags"> 内的 <a class="tag">
                'tags': quote.css('div.tags a.tag::text').getall(),
                # 作者详情页链接（(about) 链接，如 /author/Albert-Einstein/）
                'author_url': response.urljoin(
                    quote.css('small.author + a::attr(href)').get()
                ),
            }
        
        # 处理分页：<ul class="pager"> 中 <li class="next"><a href="/page/2/">Next →</a></li>
        next_page = response.css('ul.pager li.next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
```

::: tip 站点结构速查（已核实）
- 名言条目：`div.quote`
- 名言内容：`span.text`
- 作者：`small.author`
- 标签：`div.tags a.tag`
- 分页：`ul.pager li.next a`（绝对路径 `/page/2/`，`response.follow` 会自动拼接）
:::

### 案例2：作者详情爬取（对应新闻详情页）

```python
import scrapy
from bs4 import BeautifulSoup

class QuoteDetailSpider(scrapy.Spider):
    """作者详情爬虫：从列表页跟踪“about”链接，进入作者详情页"""
    
    name = 'quotes_detail'
    allowed_domains = ['quotes.toscrape.com']
    start_urls = ['https://quotes.toscrape.com/']
    
    def parse(self, response):
        """解析列表页并跟踪详情页链接"""
        for quote in response.css('div.quote'):
            # (about) 链接指向作者详情页，如 /author/Albert-Einstein/
            author_url = response.urljoin(
                quote.css('small.author + a::attr(href)').get()
            )
            yield response.follow(author_url, callback=self.parse_detail)
        
        # 翻页
        next_page = response.css('ul.pager li.next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
    
    def parse_detail(self, response):
        """解析作者详情页"""
        # 标题：<h3 class="author-title">Albert Einstein</h3>
        title = response.css('h3.author-title::text').get()
        
        # 简介：<div class="author-description">…</div>
        description_html = response.css('div.author-description').get()
        description_text = self.extract_text(description_html)
        
        # 元数据
        born_date = response.css('span.author-born-date::text').get()
        born_location = response.css('span.author-born-location::text').get()
        
        yield {
            'url': response.url,
            'title': title.strip() if title else None,
            'content': description_text,
            'content_html': description_html,
            'born_date': born_date,
            'born_location': born_location,
        }
    
    def extract_text(self, html):
        """从HTML中提取纯文本"""
        if not html:
            return ''
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # 去除script和style标签
        for script in soup(['script', 'style']):
            script.decompose()
        
        # 获取文本
        text = soup.get_text()
        
        # 清理空白
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split('  '))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
```

## 应用场景

### 1. 新闻聚合
- 多源新闻聚合
- 个性化推荐
- 热点追踪

### 2. 舆情监控
- 新闻舆情分析
- 事件追踪
- 传播分析

### 3. 内容分析
- 新闻分类
- 关键词提取
- 情感分析

## 代码案例

### 案例3：增量爬取

```python
import scrapy
import hashlib
from datetime import datetime

class IncrementalQuoteSpider(scrapy.Spider):
    """增量内容爬虫：基于 URL 去重，避免重复抓取"""
    
    name = 'incremental_quotes'
    allowed_domains = ['quotes.toscrape.com']
    start_urls = ['https://quotes.toscrape.com/']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.seen_urls = set()
        self.load_seen_urls()
    
    def load_seen_urls(self):
        """加载已爬取的URL"""
        try:
            with open('seen_urls.txt', 'r') as f:
                self.seen_urls = set(line.strip() for line in f)
        except FileNotFoundError:
            self.seen_urls = set()
    
    def save_seen_urls(self):
        """保存已爬取的URL"""
        with open('seen_urls.txt', 'w') as f:
            for url in self.seen_urls:
                f.write(url + '\n')
    
    def parse(self, response):
        """解析列表页"""
        quotes = response.css('div.quote')
        
        for quote in quotes:
            # 详情页 URL（作者页）
            url = response.urljoin(
                quote.css('small.author + a::attr(href)').get()
            )
            
            # 检查是否已爬取
            if url in self.seen_urls:
                self.logger.info(f'跳过已爬取: {url}')
                continue
            
            # 记录URL
            self.seen_urls.add(url)
            
            # 跟踪详情页
            yield response.follow(url, callback=self.parse_detail)
        
        # 保存已爬取URL
        self.save_seen_urls()
    
    def parse_detail(self, response):
        """解析详情页"""
        # 计算内容哈希（用于检测内容是否变化）
        content = response.css('div.author-description').get()
        content_hash = hashlib.md5(content.encode()).hexdigest() if content else ''
        
        yield {
            'url': response.url,
            'title': response.css('h3.author-title::text').get(),
            'content': response.css('span.author-born-date::text').get(),
            'description': content,
            'content_hash': content_hash,
            'crawl_time': datetime.now().isoformat(),
        }
    
    def closed(self, reason):
        """爬虫关闭时保存"""
        self.save_seen_urls()
```

### 案例4：多源内容爬虫

```python
import scrapy

class MultiSourceSpider(scrapy.Spider):
    """多源内容爬虫：每个来源一套选择器配置"""
    
    name = 'multi_source'
    
    def __init__(self, sources=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.sources = sources.split(',') if sources else ['quotes', 'books']
    
    def start_requests(self):
        """根据来源生成请求"""
        # 多源爬虫的核心思想：每个站点各自维护一份
        # “起始 URL + 选择器”配置，调度与存储逻辑完全复用
        source_configs = {
            'quotes': {
                'url': 'https://quotes.toscrape.com/',
                'callback': self.parse_quotes,
            },
            'books': {
                'url': 'https://books.toscrape.com/',
                'callback': self.parse_books,
            },
        }
        
        for source in self.sources:
            if source in source_configs:
                config = source_configs[source]
                yield scrapy.Request(
                    config['url'],
                    callback=config['callback'],
                    meta={'source': source}
                )
    
    def parse_quotes(self, response):
        """解析名言站（quotes.toscrape.com）"""
        for quote in response.css('div.quote'):
            yield {
                'source': response.meta['source'],
                'title': quote.css('span.text::text').get(),
                'url': response.url,
                'summary': quote.css('small.author::text').get(),
                'tags': quote.css('div.tags a.tag::text').getall(),
            }
    
    def parse_books(self, response):
        """解析图书站（books.toscrape.com）"""
        for product in response.css('article.product_pod'):
            yield {
                'source': response.meta['source'],
                'title': product.css('h3 a::attr(title)').get(),
                'url': response.urljoin(product.css('h3 a::attr(href)').get()),
                'summary': product.css('p.price_color::text').get(),
            }
```

### 案例5：新闻数据存储

```python
# pipelines.py
import pymysql
from datetime import datetime

class NewsPipeline:
    """新闻数据管道"""
    
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
            'database': crawler.settings.get('MYSQL_DATABASE', 'news'),
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
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS news (
                id INT AUTO_INCREMENT PRIMARY KEY,
                url VARCHAR(500) UNIQUE,
                title VARCHAR(255),
                content TEXT,
                source VARCHAR(100),
                author VARCHAR(100),
                publish_time DATETIME,
                category VARCHAR(50),
                images JSON,
                crawl_time DATETIME,
                content_hash VARCHAR(32),
                INDEX idx_url (url),
                INDEX idx_publish_time (publish_time),
                INDEX idx_source (source),
                INDEX idx_category (category)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ''')
        
        self.connection.commit()
    
    def process_item(self, item, spider):
        """存储数据"""
        cursor = self.connection.cursor()
        
        # 检查是否已存在
        sql = 'SELECT id FROM news WHERE url = %s'
        cursor.execute(sql, (item.get('url'),))
        if cursor.fetchone():
            spider.logger.info(f'新闻已存在: {item.get("url")}')
            return item
        
        # 插入数据
        sql = '''
            INSERT INTO news (url, title, content, source, author, publish_time, 
                            category, images, crawl_time, content_hash)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        '''
        
        import json
        
        cursor.execute(sql, (
            item.get('url'),
            item.get('title'),
            item.get('content'),
            item.get('source'),
            item.get('author'),
            item.get('publish_time'),
            item.get('category'),
            json.dumps(item.get('images', [])),
            item.get('crawl_time'),
            item.get('content_hash'),
        ))
        
        self.connection.commit()
        
        return item

# settings.py
ITEM_PIPELINES = {
    'myproject.pipelines.NewsPipeline': 300,
}

MYSQL_HOST = 'localhost'
MYSQL_PORT = 3306
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'password'
MYSQL_DATABASE = 'news'
```

### 案例6：定时爬取

```python
# 定时任务配置
# 使用 scrapyd 或 cron 实现定时爬取

# scrapyd 部署
# scrapyd-deploy local -p myproject

# 定时任务脚本
import subprocess
import schedule
import time

def run_spider():
    """运行爬虫"""
    subprocess.run(['scrapy', 'crawl', 'quotes_list', '-o', 'quotes.json'])

# 每小时运行一次
schedule.every(1).hours.do(run_spider)

while True:
    schedule.run_pending()
    time.sleep(60)
```

### 案例7：新闻数据分析

```python
import pandas as pd
from collections import Counter
import jieba

class NewsAnalyzer:
    """新闻数据分析器"""
    
    def __init__(self, db_config):
        import pymysql
        self.connection = pymysql.connect(**db_config)
    
    def load_news(self, days=7):
        """加载最近N天的新闻"""
        sql = '''
            SELECT * FROM news 
            WHERE publish_time >= DATE_SUB(NOW(), INTERVAL %s DAY)
            ORDER BY publish_time DESC
        '''
        
        df = pd.read_sql(sql, self.connection, params=[days])
        return df
    
    def analyze_categories(self, df):
        """分析分类分布"""
        category_counts = df['category'].value_counts()
        return category_counts
    
    def analyze_sources(self, df):
        """分析来源分布"""
        source_counts = df['source'].value_counts()
        return source_counts
    
    def extract_keywords(self, df, top_k=20):
        """提取关键词"""
        all_text = ' '.join(df['title'].tolist() + df['content'].tolist())
        
        # 分词
        words = jieba.cut(all_text)
        
        # 过滤
        stop_words = {'的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一'}
        filtered_words = [w for w in words if len(w) > 1 and w not in stop_words]
        
        # 统计
        word_counts = Counter(filtered_words)
        
        return word_counts.most_common(top_k)
    
    def analyze_time_distribution(self, df):
        """分析时间分布"""
        df['hour'] = pd.to_datetime(df['publish_time']).dt.hour
        hour_counts = df['hour'].value_counts().sort_index()
        return hour_counts
    
    def close(self):
        """关闭连接"""
        self.connection.close()

# 使用示例
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'news',
}

analyzer = NewsAnalyzer(db_config)

# 加载数据
df = analyzer.load_news(days=7)
print(f'加载 {len(df)} 条新闻')

# 分析分类
categories = analyzer.analyze_categories(df)
print(f'分类分布:\n{categories}')

# 提取关键词
keywords = analyzer.extract_keywords(df)
print(f'关键词: {keywords}')

analyzer.close()
```

## 课后练习

### 练习1：统计作者与标签
爬取 quotes.toscrape.com 前 5 页，统计作者出现次数排行与最高频的 10 个标签。

### 练习2：实现内容推荐
基于标签匹配实现简单的相关内容推荐。

### 练习3：内容摘要生成
使用 NLP 技术对作者简介生成摘要。

## 常见问题

### Q1: 如何处理新闻网站的反爬？
A: 使用代理 IP、控制请求频率、伪装请求头、使用 Selenium。

### Q2: 如何处理新闻图片？
A: 使用 Scrapy 的 ImagesPipeline，或自定义下载逻辑。

### Q3: 如何保证新闻的时效性？
A: 使用增量爬取、定时任务、监控更新频率。

::: warning
quotes.toscrape.com 与 books.toscrape.com 均为专供爬虫学习的公开沙盒站，可放心练习；真实新闻站请注意遵守版权与 robots.txt，控制抓取频率。
:::

## 下一步学习

- [Day 14: API 数据抓取](/crawler/crawler-practice/day14/)
