# Day 11: 电商数据爬取实战

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

### 案例1：商品列表爬取

```python
import scrapy

class ProductListSpider(scrapy.Spider):
    """商品列表爬虫"""
    
    name = 'product_list'
    allowed_domains = ['example.com']
    start_urls = ['https://example.com/products']
    
    def parse(self, response):
        """解析商品列表"""
        # 提取商品卡片
        products = response.css('.product-card')
        
        for product in products:
            # 提取商品信息
            item = {
                'name': product.css('.product-name::text').get(),
                'price': product.css('.product-price::text').get(),
                'url': product.css('a::attr(href)').get(),
                'image': product.css('img::attr(src)').get(),
            }
            
            # 跟踪详情页
            detail_url = item['url']
            if detail_url:
                yield response.follow(
                    detail_url,
                    callback=self.parse_detail,
                    meta={'item': item}
                )
        
        # 处理分页
        next_page = response.css('.next-page::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
    
    def parse_detail(self, response):
        """解析商品详情"""
        item = response.meta['item']
        
        # 提取详情信息
        item['description'] = response.css('.product-description::text').get()
        item['specs'] = response.css('.product-specs').get()
        item['images'] = response.css('.product-image::attr(src)').getall()
        
        yield item
```

### 案例2：评论数据采集

```python
import scrapy
import json

class ReviewSpider(scrapy.Spider):
    """评论爬虫"""
    
    name = 'reviews'
    
    def start_requests(self):
        """生成初始请求"""
        # 假设评论接口
        api_url = 'https://example.com/api/reviews'
        
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

### 案例3：完整的电商爬虫

```python
import scrapy
from scrapy.loader import ItemLoader
from scrapy.loader.processors import TakeFirst, Join, MapCompose
import re

class ProductItem(scrapy.Item):
    """商品 Item"""
    name = scrapy.Field()
    price = scrapy.Field()
    original_price = scrapy.Field()
    sales = scrapy.Field()
    reviews_count = scrapy.Field()
    rating = scrapy.Field()
    url = scrapy.Field()
    image_urls = scrapy.Field()
    description = scrapy.Field()
    specs = scrapy.Field()
    crawl_time = scrapy.Field()

class ProductLoader(ItemLoader):
    """商品加载器"""
    default_output_processor = TakeFirst()
    
    name_in = MapCompose(str.strip)
    price_in = MapCompose(lambda x: re.sub(r'[^\d.]', '', x))
    original_price_in = MapCompose(lambda x: re.sub(r'[^\d.]', '', x))
    sales_in = MapCompose(lambda x: re.sub(r'[^\d]', '', x))

class EcommerceSpider(scrapy.Spider):
    """电商爬虫"""
    
    name = 'ecommerce'
    allowed_domains = ['example.com']
    start_urls = ['https://example.com/products']
    
    custom_settings = {
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS': 4,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 2,
    }
    
    def parse(self, response):
        """解析商品列表"""
        products = response.css('.product-item')
        
        for product in products:
            loader = ProductLoader(item=ProductItem(), selector=product)
            
            # 提取列表页信息
            loader.add_css('name', '.product-name::text')
            loader.add_css('price', '.current-price::text')
            loader.add_css('original_price', '.original-price::text')
            loader.add_css('sales', '.sales-count::text')
            loader.add_css('url', 'a::attr(href)')
            loader.add_css('image_urls', 'img::attr(src)')
            
            item = loader.load_item()
            
            # 跟踪详情页
            if item.get('url'):
                yield response.follow(
                    item['url'],
                    callback=self.parse_detail,
                    meta={'item': item}
                )
        
        # 处理分页
        next_page = response.css('.pagination .next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
    
    def parse_detail(self, response):
        """解析商品详情"""
        item = response.meta['item']
        
        # 提取详情信息
        item['description'] = response.css('.product-description').get()
        item['specs'] = response.css('.product-specs').get()
        item['reviews_count'] = response.css('.reviews-count::text').get()
        item['rating'] = response.css('.rating::text').get()
        item['crawl_time'] = datetime.now().isoformat()
        
        yield item
```

### 案例4：价格监控系统

```python
import scrapy
import json
from datetime import datetime

class PriceMonitorSpider(scrapy.Spider):
    """价格监控爬虫"""
    
    name = 'price_monitor'
    
    def __init__(self, product_ids=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.product_ids = product_ids.split(',') if product_ids else []
    
    def start_requests(self):
        """生成初始请求"""
        for product_id in self.product_ids:
            url = f'https://example.com/product/{product_id}'
            yield scrapy.Request(
                url,
                callback=self.parse_price,
                meta={'product_id': product_id}
            )
    
    def parse_price(self, response):
        """解析价格"""
        product_id = response.meta['product_id']
        
        # 提取价格
        price_text = response.css('.current-price::text').get()
        price = self.extract_price(price_text)
        
        # 提取原价
        original_price_text = response.css('.original-price::text').get()
        original_price = self.extract_price(original_price_text)
        
        # 计算折扣
        discount = None
        if price and original_price and original_price > 0:
            discount = round(price / original_price * 100, 2)
        
        yield {
            'product_id': product_id,
            'price': price,
            'original_price': original_price,
            'discount': discount,
            'timestamp': datetime.now().isoformat(),
            'url': response.url,
        }
    
    def extract_price(self, price_text):
        """提取价格"""
        if not price_text:
            return None
        
        import re
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

### 练习1：爬取京东商品
实现一个爬取京东商品信息的爬虫。

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

## 下一步学习

- [Day 12: 社交媒体数据采集](/crawler/crawler-practice/day12/)
