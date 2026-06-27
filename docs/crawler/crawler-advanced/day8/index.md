# Day 8: 分布式爬虫架构

## 学习目标

- 理解分布式爬虫的概念和架构
- 掌握 Scrapy-Redis 的使用
- 了解消息队列在爬虫中的应用
- 学会设计分布式任务调度

## 技术原理

### 8.1 分布式爬虫概念

分布式爬虫是将爬虫任务分布到多台机器上执行的系统。

**主要优势：**
- 提高爬取速度
- 提高系统容错能力
- 支持大规模数据采集

### 8.2 分布式架构

**核心组件：**
- **任务队列**: 存储待爬取的 URL
- **Worker 节点**: 执行爬取任务
- **数据存储**: 存储爬取结果
- **调度器**: 分配任务给 Worker

### 8.3 Scrapy-Redis

Scrapy-Redis 是 Scrapy 的分布式扩展，使用 Redis 实现分布式任务调度。

**主要功能：**
- 去重过滤
- 请求队列
- 任务调度

### 8.4 消息队列

消息队列用于在分布式系统中传递消息：

**常见消息队列：**
- Redis: 轻量级，适合小规模
- RabbitMQ: 功能完善，适合企业级
- Kafka: 高吞吐量，适合大数据

## 案例

### 案例1：Scrapy-Redis 基础配置

```python
# settings.py

# 启用 Redis 调度器
SCHEDULER = 'scrapy_redis.scheduler.Scheduler'

# 启用 Redis 去重
DUPEFILTER_CLASS = 'scrapy_redis.dupefilter.RFPDupeFilter'

# Redis 连接配置
REDIS_URL = 'redis://localhost:6379/0'

# 队列不清理（允许暂停和恢复）
SCHEDULER_PERSIST = True

# 并发设置
CONCURRENT_REQUESTS = 16
CONCURRENT_REQUESTS_PER_DOMAIN = 8
```

### 案例2：Redis Spider

```python
from scrapy_redis.spiders import RedisSpider

class DistributedSpider(RedisSpider):
    """分布式爬虫"""
    
    name = 'distributed'
    redis_key = 'distributed:start_urls'
    
    def parse(self, response):
        """解析响应"""
        # 提取数据
        title = response.css('h1::text').get()
        
        yield {
            'url': response.url,
            'title': title,
        }
        
        # 提取新链接
        for link in response.css('a::attr(href)').getall():
            yield response.follow(link, callback=self.parse)
```

## 应用场景

### 1. 大规模数据采集
- 电商全站商品
- 新闻网站全量文章
- 社交媒体数据

### 2. 高可用爬虫系统
- 需要 7x24 小时运行
- 需要故障自动恢复

### 3. 多源数据聚合
- 从多个网站采集数据
- 统一数据格式

## 代码案例

### 案例3：完整的分布式爬虫

```python
# items.py
import scrapy

class ProductItem(scrapy.Item):
    """商品 Item"""
    name = scrapy.Field()
    price = scrapy.Field()
    url = scrapy.Field()
    spider_name = scrapy.Field()
    crawl_time = scrapy.Field()

# spiders/product_spider.py
from scrapy_redis.spiders import RedisSpider
from myproject.items import ProductItem
from datetime import datetime

class ProductSpider(RedisSpider):
    """分布式商品爬虫"""
    
    name = 'product'
    redis_key = 'product:start_urls'
    
    # 自定义设置
    custom_settings = {
        'DOWNLOAD_DELAY': 1,
        'CONCURRENT_REQUESTS': 8,
    }
    
    def parse(self, response):
        """解析商品列表"""
        products = response.css('.product-item')
        
        for product in products:
            item = ProductItem()
            item['name'] = product.css('.name::text').get()
            item['price'] = product.css('.price::text').get()
            item['url'] = product.css('a::attr(href)').get()
            item['spider_name'] = self.name
            item['crawl_time'] = datetime.now().isoformat()
            
            yield item
        
        # 跟踪下一页
        next_page = response.css('.next-page::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

# pipelines.py
import json
from datetime import datetime

class RedisPipeline:
    """Redis 管道"""
    
    def __init__(self, redis_url):
        self.redis_url = redis_url
    
    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            redis_url=crawler.settings.get('REDIS_URL', 'redis://localhost:6379/0')
        )
    
    def open_spider(self, spider):
        """爬虫启动"""
        import redis
        self.redis_client = redis.from_url(self.redis_url)
        self.key = f'{spider.name}:items'
    
    def process_item(self, item, spider):
        """处理 Item"""
        # 将 Item 转换为 JSON 并存储到 Redis
        data = json.dumps(dict(item), ensure_ascii=False)
        self.redis_client.rpush(self.key, data)
        return item
```

### 案例4：分布式任务调度器

```python
import redis
import json
from typing import List, Dict

class TaskScheduler:
    """分布式任务调度器"""
    
    def __init__(self, redis_url='redis://localhost:6379/0'):
        self.redis_client = redis.from_url(redis_url)
        self.task_queue = 'task_queue'
        self.result_queue = 'result_queue'
    
    def add_task(self, task_data: Dict):
        """添加任务"""
        self.redis_client.rpush(self.task_queue, json.dumps(task_data))
    
    def add_tasks(self, tasks: List[Dict]):
        """批量添加任务"""
        pipeline = self.redis_client.pipeline()
        for task in tasks:
            pipeline.rpush(self.task_queue, json.dumps(task))
        pipeline.execute()
    
    def get_task(self) -> Dict:
        """获取任务"""
        data = self.redis_client.lpop(self.task_queue)
        if data:
            return json.loads(data)
        return None
    
    def add_result(self, result: Dict):
        """添加结果"""
        self.redis_client.rpush(self.result_queue, json.dumps(result))
    
    def get_result(self) -> Dict:
        """获取结果"""
        data = self.redis_client.lpop(self.result_queue)
        if data:
            return json.loads(data)
        return None
    
    def get_task_count(self) -> int:
        """获取任务数量"""
        return self.redis_client.llen(self.task_queue)
    
    def get_result_count(self) -> int:
        """获取结果数量"""
        return self.redis_client.llen(self.result_queue)

# 使用示例
scheduler = TaskScheduler()

# 添加任务
urls = [f'https://example.com/page/{i}' for i in range(100)]
tasks = [{'url': url, 'priority': 1} for url in urls]
scheduler.add_tasks(tasks)

print(f'待处理任务: {scheduler.get_task_count()}')

# Worker 处理任务
while True:
    task = scheduler.get_task()
    if not task:
        break
    
    # 处理任务
    result = {
        'url': task['url'],
        'status': 'success',
        'data': '...'
    }
    
    # 保存结果
    scheduler.add_result(result)

print(f'处理完成，结果数量: {scheduler.get_result_count()}')
```

### 案例5：分布式 Worker

```python
import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor

class DistributedWorker:
    """分布式 Worker"""
    
    def __init__(self, worker_id, redis_url='redis://localhost:6379/0'):
        self.worker_id = worker_id
        self.redis_client = redis.from_url(redis_url)
        self.task_queue = 'task_queue'
        self.result_queue = 'result_queue'
        self.running = False
    
    def fetch(self, url):
        """获取URL内容"""
        try:
            response = requests.get(url, timeout=10)
            return {
                'url': url,
                'status': response.status_code,
                'content': response.text[:1000]
            }
        except Exception as e:
            return {
                'url': url,
                'error': str(e)
            }
    
    def process_task(self, task_data):
        """处理单个任务"""
        task = json.loads(task_data)
        url = task['url']
        
        # 执行爬取
        result = self.fetch(url)
        result['worker_id'] = self.worker_id
        result['task'] = task
        
        # 保存结果
        self.redis_client.rpush(self.result_queue, json.dumps(result))
        
        return result
    
    def run(self, max_workers=5):
        """运行 Worker"""
        self.running = True
        print(f'Worker {self.worker_id} 启动')
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            while self.running:
                # 获取任务
                task_data = self.redis_client.lpop(self.task_queue)
                
                if task_data:
                    # 处理任务
                    executor.submit(self.process_task, task_data)
                else:
                    # 没有任务，等待
                    time.sleep(1)
    
    def stop(self):
        """停止 Worker"""
        self.running = False
        print(f'Worker {self.worker_id} 停止')

# 使用示例
if __name__ == '__main__':
    worker = DistributedWorker(worker_id='worker-1')
    
    try:
        worker.run(max_workers=5)
    except KeyboardInterrupt:
        worker.stop()
```

### 案例6：监控和管理

```python
import redis
import json
from datetime import datetime

class CrawlerMonitor:
    """爬虫监控"""
    
    def __init__(self, redis_url='redis://localhost:6379/0'):
        self.redis_client = redis.from_url(redis_url)
    
    def get_stats(self):
        """获取统计信息"""
        stats = {
            'pending_tasks': self.redis_client.llen('task_queue'),
            'completed_results': self.redis_client.llen('result_queue'),
            'timestamp': datetime.now().isoformat(),
        }
        
        # 获取最近的结果
        recent_results = []
        for i in range(min(10, self.redis_client.llen('result_queue'))):
            data = self.redis_client.lindex('result_queue', i)
            if data:
                recent_results.append(json.loads(data))
        
        stats['recent_results'] = recent_results
        
        return stats
    
    def get_worker_stats(self):
        """获取 Worker 统计"""
        workers = {}
        
        # 扫描所有结果，统计每个 Worker 的处理数量
        results = self.redis_client.lrange('result_queue', 0, -1)
        for data in results:
            result = json.loads(data)
            worker_id = result.get('worker_id', 'unknown')
            workers[worker_id] = workers.get(worker_id, 0) + 1
        
        return workers
    
    def clear_queues(self):
        """清空队列"""
        self.redis_client.delete('task_queue')
        self.redis_client.delete('result_queue')

# 使用示例
monitor = CrawlerMonitor()

# 查看统计
stats = monitor.get_stats()
print(f'待处理任务: {stats["pending_tasks"]}')
print(f'已完成结果: {stats["completed_results"]}')

# 查看 Worker 统计
worker_stats = monitor.get_worker_stats()
for worker_id, count in worker_stats.items():
    print(f'{worker_id}: {count} 个任务')
```

### 案例7：Redis 去重过滤器

```python
import hashlib
from urllib.parse import urlparse

class URLDedup:
    """URL 去重器"""
    
    def __init__(self, redis_client, key='url_dedup'):
        self.redis_client = redis_client
        self.key = key
    
    def _get_fingerprint(self, url):
        """获取 URL 指纹"""
        # 标准化 URL
        parsed = urlparse(url)
        normalized = f'{parsed.scheme}://{parsed.netloc}{parsed.path}'
        
        # 计算 MD5
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def is_duplicate(self, url):
        """检查是否重复"""
        fingerprint = self._get_fingerprint(url)
        return self.redis_client.sismember(self.key, fingerprint)
    
    def add_url(self, url):
        """添加 URL"""
        fingerprint = self._get_fingerprint(url)
        self.redis_client.sadd(self.key, fingerprint)
    
    def get_count(self):
        """获取去重数量"""
        return self.redis_client.scard(self.key)

# 使用示例
import redis

redis_client = redis.from_url('redis://localhost:6379/0')
dedup = URLDedup(redis_client)

urls = [
    'https://example.com/page/1',
    'https://example.com/page/2',
    'https://example.com/page/1',  # 重复
]

for url in urls:
    if dedup.is_duplicate(url):
        print(f'重复: {url}')
    else:
        dedup.add_url(url)
        print(f'新增: {url}')

print(f'去重后数量: {dedup.get_count()}')
```

## 课后练习

### 练习1：搭建分布式爬虫环境
安装 Redis 和 Scrapy-Redis，搭建分布式爬虫环境。

### 练习2：实现分布式图片爬虫
实现一个分布式图片爬虫，支持多台机器同时下载。

### 练习3：实现任务优先级调度
实现一个支持任务优先级的分布式调度器。

## 常见问题

### Q1: 分布式爬虫需要多少台机器？
A: 取决于爬取规模，一般 3-5 台机器可以处理大多数场景。

### Q2: 如何保证数据一致性？
A: 使用 Redis 的原子操作，或使用数据库事务。

### Q3: 如何处理节点故障？
A: 设置任务超时，实现任务重试机制，使用心跳检测。

## 下一步学习

- [Day 9: 数据存储与清洗](/crawler/crawler-advanced/day9/)
