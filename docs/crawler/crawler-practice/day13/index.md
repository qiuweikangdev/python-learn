# Day 13: 新闻网站爬取

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

### 案例1：新闻列表爬取

```python
import scrapy

class NewsListSpider(scrapy.Spider):
    """新闻列表爬虫"""
    
    name = 'news_list'
    allowed_domains = ['news.example.com']
    start_urls = ['https://news.example.com']
    
    def parse(self, response):
        """解析新闻列表"""
        articles = response.css('.article-item')
        
        for article in articles:
            yield {
                'title': article.css('.article-title a::text').get(),
                'url': article.css('.article-title a::attr(href)').get(),
                'summary': article.css('.article-summary::text').get(),
                'source': article.css('.article-source::text').get(),
                'time': article.css('.article-time::text').get(),
                'category': article.css('.article-category::text').get(),
            }
        
        # 处理分页
        next_page = response.css('.pagination .next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
```

### 案例2：新闻详情爬取

```python
import scrapy
from bs4 import BeautifulSoup

class NewsDetailSpider(scrapy.Spider):
    """新闻详情爬虫"""
    
    name = 'news_detail'
    
    def start_requests(self):
        """从已爬取的列表中获取详情页URL"""
        # 假设从数据库或文件中读取URL列表
        urls = [
            'https://news.example.com/article/1',
            'https://news.example.com/article/2',
        ]
        
        for url in urls:
            yield scrapy.Request(url, callback=self.parse_detail)
    
    def parse_detail(self, response):
        """解析新闻详情"""
        # 提取标题
        title = response.css('h1.article-title::text').get()
        
        # 提取正文
        content_html = response.css('.article-content').get()
        content_text = self.extract_text(content_html)
        
        # 提取图片
        images = response.css('.article-content img::attr(src)').getall()
        
        # 提取元数据
        author = response.css('.article-author::text').get()
        source = response.css('.article-source::text').get()
        publish_time = response.css('.article-time::text').get()
        category = response.css('.article-category::text').get()
        
        yield {
            'url': response.url,
            'title': title,
            'content': content_text,
            'content_html': content_html,
            'images': images,
            'author': author,
            'source': source,
            'publish_time': publish_time,
            'category': category,
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

class IncrementalNewsSpider(scrapy.Spider):
    """增量新闻爬虫"""
    
    name = 'incremental_news'
    
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
        """解析新闻列表"""
        articles = response.css('.article-item')
        
        for article in articles:
            url = article.css('a::attr(href)').get()
            
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
        # 计算内容哈希
        content = response.css('.article-content').get()
        content_hash = hashlib.md5(content.encode()).hexdigest() if content else ''
        
        yield {
            'url': response.url,
            'title': response.css('h1::text').get(),
            'content': content,
            'content_hash': content_hash,
            'crawl_time': datetime.now().isoformat(),
        }
    
    def closed(self, reason):
        """爬虫关闭时保存"""
        self.save_seen_urls()
```

### 案例4：多源新闻爬虫

```python
import scrapy

class MultiSourceNewsSpider(scrapy.Spider):
    """多源新闻爬虫"""
    
    name = 'multi_source_news'
    
    def __init__(self, sources=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.sources = sources.split(',') if sources else ['source1', 'source2']
    
    def start_requests(self):
        """根据来源生成请求"""
        source_configs = {
            'source1': {
                'url': 'https://news1.example.com',
                'callback': self.parse_source1,
            },
            'source2': {
                'url': 'https://news2.example.com',
                'callback': self.parse_source2,
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
    
    def parse_source1(self, response):
        """解析来源1"""
        articles = response.css('.news-item')
        
        for article in articles:
            yield {
                'source': response.meta['source'],
                'title': article.css('h2 a::text').get(),
                'url': article.css('h2 a::attr(href)').get(),
                'summary': article.css('p::text').get(),
                'time': article.css('.time::text').get(),
            }
    
    def parse_source2(self, response):
        """解析来源2"""
        articles = response.css('.article')
        
        for article in articles:
            yield {
                'source': response.meta['source'],
                'title': article.css('.title::text').get(),
                'url': article.css('.title a::attr(href)').get(),
                'summary': article.css('.desc::text').get(),
                'time': article.css('.date::text').get(),
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
    subprocess.run(['scrapy', 'crawl', 'news_spider', '-o', 'output.json'])

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

### 练习1：爬取今日头条
实现一个爬取今日头条新闻的爬虫。

### 练习2：实现新闻推荐
基于关键词匹配实现简单的新闻推荐。

### 练习3：新闻摘要生成
使用 NLP 技术生成新闻摘要。

## 常见问题

### Q1: 如何处理新闻网站的反爬？
A: 使用代理 IP、控制请求频率、伪装请求头、使用 Selenium。

### Q2: 如何处理新闻图片？
A: 使用 Scrapy 的 ImagesPipeline，或自定义下载逻辑。

### Q3: 如何保证新闻的时效性？
A: 使用增量爬取、定时任务、监控更新频率。

## 下一步学习

- [Day 14: API 数据抓取](/crawler/crawler-practice/day14/)
