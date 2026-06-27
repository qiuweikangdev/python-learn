# Day 10: 爬虫中间件与管道

## 学习目标

- 掌握 Scrapy 中间件的使用
- 学会设计和实现管道
- 了解错误处理机制
- 掌握爬虫配置和优化

## 技术原理

### 10.1 中间件概述

中间件是 Scrapy 处理请求和响应的钩子：

**下载中间件：**
- 处理请求（添加代理、User-Agent）
- 处理响应（重试、错误处理）
- 处理异常

**爬虫中间件：**
- 处理 Spider 的输入输出
- 处理 Item 和请求
- 处理异常

### 10.2 管道概述

管道用于处理 Spider 提取的数据：

**主要功能：**
- 数据清洗
- 数据验证
- 数据存储

### 10.3 配置和优化

**主要配置项：**
- 并发请求数
- 下载延迟
- 超时设置
- 重试策略

## 案例

### 案例1：下载中间件

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
    
    def process_response(self, request, response, spider):
        """处理响应"""
        return response
    
    def process_exception(self, request, exception, spider):
        """处理异常"""
        spider.logger.error(f'请求异常: {request.url}, {exception}')
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

class RetryMiddleware:
    """重试中间件"""
    
    def __init__(self, max_retry=3):
        self.max_retry = max_retry
    
    @classmethod
    def from_crawler(cls, crawler):
        max_retry = crawler.settings.getint('RETRY_TIMES', 3)
        return cls(max_retry)
    
    def process_response(self, request, response, spider):
        """处理响应"""
        if response.status in [500, 502, 503, 504]:
            retry_times = request.meta.get('retry_times', 0)
            
            if retry_times < self.max_retry:
                retry_request = request.copy()
                retry_request.meta['retry_times'] = retry_times + 1
                retry_request.dont_filter = True
                
                spider.logger.info(f'重试请求: {request.url}, 第{retry_times + 1}次')
                return retry_request
            
            spider.logger.error(f'重试失败: {request.url}')
        
        return response
```

### 案例2：爬虫中间件

```python
# middlewares.py
class SpiderMiddleware:
    """爬虫中间件"""
    
    def process_spider_input(self, response, spider):
        """处理 Spider 输入"""
        # 可以在这里检查响应
        if response.status != 200:
            spider.logger.warning(f'非200响应: {response.url}')
        return None
    
    def process_spider_output(self, response, result, spider):
        """处理 Spider 输出"""
        # 可以过滤或修改 Item
        for item in result:
            yield item
    
    def process_spider_exception(self, response, exception, spider):
        """处理 Spider 异常"""
        spider.logger.error(f'Spider 异常: {response.url}, {exception}')
        return None
    
    def process_start_requests(self, start_requests, spider):
        """处理初始请求"""
        for request in start_requests:
            yield request
```

## 应用场景

### 1. 反爬处理
- User-Agent 伪装
- 代理 IP 管理
- Cookie 管理

### 2. 数据处理
- 数据清洗
- 数据验证
- 数据存储

### 3. 错误处理
- 请求重试
- 异常捕获
- 日志记录

## 代码案例

### 案例3：完整的管道实现

```python
# pipelines.py
import json
import csv
from datetime import datetime

class CleanPipeline:
    """清洗管道"""
    
    def process_item(self, item, spider):
        """清洗数据"""
        # 去除空白
        for key, value in item.items():
            if isinstance(value, str):
                item[key] = value.strip()
        
        # 添加爬取时间
        item['crawl_time'] = datetime.now().isoformat()
        
        # 添加爬虫名称
        item['spider'] = spider.name
        
        return item

class ValidationPipeline:
    """验证管道"""
    
    def process_item(self, item, spider):
        """验证数据"""
        # 检查必填字段
        required_fields = ['name', 'price']
        for field in required_fields:
            if field not in item or not item[field]:
                raise ValueError(f'缺少必填字段: {field}')
        
        # 验证价格
        try:
            price = float(item['price'])
            if price < 0:
                raise ValueError(f'价格不能为负数: {price}')
            item['price'] = price
        except (ValueError, TypeError) as e:
            raise ValueError(f'价格格式错误: {item["price"]}')
        
        return item

class DuplicatesPipeline:
    """去重管道"""
    
    def __init__(self):
        self.seen_urls = set()
    
    def process_item(self, item, spider):
        """去重"""
        url = item.get('url')
        
        if url in self.seen_urls:
            raise ValueError(f'重复URL: {url}')
        
        self.seen_urls.add(url)
        return item

class JsonWriterPipeline:
    """JSON 写入管道"""
    
    def __init__(self):
        self.items = []
    
    def process_item(self, item, spider):
        """收集 Item"""
        self.items.append(dict(item))
        return item
    
    def close_spider(self, spider):
        """爬虫关闭时保存"""
        filename = f'{spider.name}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.items, f, ensure_ascii=False, indent=2)
        
        spider.logger.info(f'保存 {len(self.items)} 条数据到 {filename}')

class CsvWriterPipeline:
    """CSV 写入管道"""
    
    def __init__(self):
        self.items = []
        self.fields = None
    
    def process_item(self, item, spider):
        """收集 Item"""
        if self.fields is None:
            self.fields = list(item.keys())
        
        self.items.append(dict(item))
        return item
    
    def close_spider(self, spider):
        """爬虫关闭时保存"""
        filename = f'{spider.name}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        
        with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=self.fields)
            writer.writeheader()
            writer.writerows(self.items)
        
        spider.logger.info(f'保存 {len(self.items)} 条数据到 {filename}')
```

### 案例4：MySQL 管道

```python
# pipelines.py
import pymysql

class MySQLPipeline:
    """MySQL 管道"""
    
    def __init__(self, host, port, user, password, database):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
        self.cursor = None
    
    @classmethod
    def from_crawler(cls, crawler):
        """从配置创建"""
        return cls(
            host=crawler.settings.get('MYSQL_HOST', 'localhost'),
            port=crawler.settings.getint('MYSQL_PORT', 3306),
            user=crawler.settings.get('MYSQL_USER', 'root'),
            password=crawler.settings.get('MYSQL_PASSWORD', ''),
            database=crawler.settings.get('MYSQL_DATABASE', 'crawler')
        )
    
    def open_spider(self, spider):
        """爬虫启动时连接数据库"""
        self.connection = pymysql.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            database=self.database,
            charset='utf8mb4'
        )
        self.cursor = self.connection.cursor()
        
        # 创建表
        self.create_table(spider.name)
    
    def close_spider(self, spider):
        """爬虫关闭时关闭连接"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
    
    def create_table(self, table_name):
        """创建表"""
        sql = f'''
        CREATE TABLE IF NOT EXISTS {table_name} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            price DECIMAL(10,2),
            url VARCHAR(500),
            crawl_time DATETIME,
            INDEX idx_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        '''
        self.cursor.execute(sql)
        self.connection.commit()
    
    def process_item(self, item, spider):
        """插入数据"""
        sql = f'''
        INSERT INTO {spider.name} (name, price, url, crawl_time)
        VALUES (%s, %s, %s, %s)
        '''
        
        self.cursor.execute(sql, (
            item.get('name'),
            item.get('price'),
            item.get('url'),
            item.get('crawl_time')
        ))
        self.connection.commit()
        
        return item

# settings.py
ITEM_PIPELINES = {
    'myproject.pipelines.CleanPipeline': 100,
    'myproject.pipelines.ValidationPipeline': 200,
    'myproject.pipelines.DuplicatesPipeline': 300,
    'myproject.pipelines.MySQLPipeline': 400,
}

MYSQL_HOST = 'localhost'
MYSQL_PORT = 3306
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'password'
MYSQL_DATABASE = 'crawler'
```

### 案例5：MongoDB 管道

```python
# pipelines.py
from pymongo import MongoClient

class MongoDBPipeline:
    """MongoDB 管道"""
    
    def __init__(self, host, port, database, collection):
        self.host = host
        self.port = port
        self.database = database
        self.collection = collection
        self.client = None
        self.db = None
        self.coll = None
    
    @classmethod
    def from_crawler(cls, crawler):
        """从配置创建"""
        return cls(
            host=crawler.settings.get('MONGO_HOST', 'localhost'),
            port=crawler.settings.getint('MONGO_PORT', 27017),
            database=crawler.settings.get('MONGO_DATABASE', 'crawler'),
            collection=crawler.settings.get('MONGO_COLLECTION', 'items')
        )
    
    def open_spider(self, spider):
        """爬虫启动时连接数据库"""
        self.client = MongoClient(self.host, self.port)
        self.db = self.client[self.database]
        self.coll = self.db[self.collection]
        
        # 创建索引
        self.coll.create_index('url', unique=True)
    
    def close_spider(self, spider):
        """爬虫关闭时关闭连接"""
        if self.client:
            self.client.close()
    
    def process_item(self, item, spider):
        """插入或更新数据"""
        # 使用 upsert 避免重复
        self.coll.update_one(
            {'url': item.get('url')},
            {'$set': dict(item)},
            upsert=True
        )
        
        return item

# settings.py
ITEM_PIPELINES = {
    'myproject.pipelines.CleanPipeline': 100,
    'myproject.pipelines.MongoDBPipeline': 500,
}

MONGO_HOST = 'localhost'
MONGO_PORT = 27017
MONGO_DATABASE = 'crawler'
MONGO_COLLECTION = 'items'
```

### 案例6：图片管道

```python
# pipelines.py
import scrapy
from scrapy.pipelines.images import ImagesPipeline
from urllib.parse import urlparse

class CustomImagesPipeline(ImagesPipeline):
    """自定义图片管道"""
    
    def get_media_requests(self, item, info):
        """获取图片下载请求"""
        for image_url in item.get('image_urls', []):
            yield scrapy.Request(image_url)
    
    def file_path(self, request, response=None, info=None, *, item=None):
        """生成文件路径"""
        # 从URL提取文件名
        url = urlparse(request.url)
        filename = url.path.split('/')[-1]
        
        # 按日期分目录
        from datetime import datetime
        date_dir = datetime.now().strftime('%Y%m%d')
        
        return f'{date_dir}/{filename}'
    
    def item_completed(self, results, item, info):
        """处理完成后的回调"""
        # 获取下载结果
        image_paths = [x['path'] for ok, x in results if ok]
        
        if not image_paths:
            raise ValueError('图片下载失败')
        
        item['image_paths'] = image_paths
        
        return item

# settings.py
ITEM_PIPELINES = {
    'myproject.pipelines.CustomImagesPipeline': 300,
}

IMAGES_STORE = './images'
IMAGES_MIN_HEIGHT = 100
IMAGES_MIN_WIDTH = 100
```

### 案例7：错误处理管道

```python
# pipelines.py
import logging
from datetime import datetime

class ErrorHandlingPipeline:
    """错误处理管道"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.errors = []
    
    def process_item(self, item, spider):
        """处理 Item，捕获异常"""
        try:
            # 尝试处理 Item
            processed = self.process_item_logic(item)
            return processed
        except Exception as e:
            # 记录错误
            error_info = {
                'item': dict(item),
                'error': str(e),
                'time': datetime.now().isoformat()
            }
            self.errors.append(error_info)
            
            self.logger.error(f'处理 Item 失败: {e}')
            
            # 返回原始 Item，继续处理
            return item
    
    def process_item_logic(self, item):
        """处理逻辑"""
        # 这里可以添加具体的处理逻辑
        # 如果处理失败，会抛出异常
        
        # 示例：验证价格
        price = item.get('price')
        if price is not None:
            try:
                item['price'] = float(price)
            except (ValueError, TypeError):
                raise ValueError(f'价格格式错误: {price}')
        
        return item
    
    def close_spider(self, spider):
        """爬虫关闭时保存错误日志"""
        if self.errors:
            import json
            
            filename = f'errors_{spider.name}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.errors, f, ensure_ascii=False, indent=2)
            
            self.logger.warning(f'发现 {len(self.errors)} 个错误，已保存到 {filename}')
```

### 案例8：统计管道

```python
# pipelines.py
from collections import defaultdict
from datetime import datetime

class StatsPipeline:
    """统计管道"""
    
    def __init__(self):
        self.stats = defaultdict(int)
        self.start_time = None
    
    def open_spider(self, spider):
        """爬虫启动"""
        self.start_time = datetime.now()
        self.stats['start_time'] = self.start_time.isoformat()
    
    def process_item(self, item, spider):
        """统计 Item"""
        self.stats['total_items'] += 1
        
        # 按爬虫统计
        self.stats[f'spider_{spider.name}'] += 1
        
        # 按字段统计
        for key in item.keys():
            self.stats[f'field_{key}'] += 1
        
        return item
    
    def close_spider(self, spider):
        """爬虫关闭时输出统计"""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        self.stats['end_time'] = end_time.isoformat()
        self.stats['duration_seconds'] = duration
        
        # 输出统计信息
        spider.logger.info('='*50)
        spider.logger.info('爬虫统计信息:')
        spider.logger.info(f'总耗时: {duration:.2f} 秒')
        spider.logger.info(f'总 Item 数: {self.stats["total_items"]}')
        
        if duration > 0:
            speed = self.stats['total_items'] / duration
            spider.logger.info(f'平均速度: {speed:.2f} 条/秒')
        
        spider.logger.info('='*50)

# settings.py
ITEM_PIPELINES = {
    'myproject.pipelines.CleanPipeline': 100,
    'myproject.pipelines.ValidationPipeline': 200,
    'myproject.pipelines.StatsPipeline': 900,
}
```

## 课后练习

### 练习1：实现一个缓存中间件
实现一个支持本地文件缓存的中间件。

### 练习2：实现一个限流中间件
实现一个支持不同域名不同限流策略的中间件。

### 练习3：实现一个数据导出管道
实现一个支持导出到 Excel 的管道。

## 常见问题

### Q1: 中间件的执行顺序是怎样的？
A: 数字越小，优先级越高。下载中间件先处理请求，再处理响应。

### Q2: 管道的执行顺序是怎样的？
A: 数字越小，优先级越高。通常清洗管道在前，存储管道在后。

### Q3: 如何调试中间件？
A: 使用 spider.logger 输出日志，或使用 scrapy shell 测试。

## 下一步学习

- [Day 11: 电商数据爬取实战](/crawler/crawler-practice/day11/)
