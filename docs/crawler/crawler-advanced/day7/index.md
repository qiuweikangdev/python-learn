# Day 7: 多线程与异步爬虫

## 学习目标

- 掌握多线程爬虫的实现
- 了解多进程爬虫的使用
- 学会使用 asyncio 和 aiohttp 实现异步爬虫
- 理解不同并发方案的性能差异

## 技术原理

### 7.1 并发与并行

**并发（Concurrency）：**
- 多个任务交替执行
- 适合 I/O 密集型任务
- 在单核 CPU 上也能实现

**并行（Parallelism）：**
- 多个任务同时执行
- 适合 CPU 密集型任务
- 需要多核 CPU

### 7.2 多线程基础

Python 的 threading 模块提供了多线程支持：

**GIL（全局解释器锁）：**
- CPython 的限制，同一时刻只能执行一个线程
- 对 I/O 密集型任务影响不大
- CPU 密集型任务建议使用多进程

### 7.3 异步编程

异步编程是一种非阻塞的编程模型：

**核心概念：**
- **协程（Coroutine）**: 可暂停和恢复的函数
- **事件循环（Event Loop）**: 管理协程的执行
- **await**: 暂停协程，等待结果

### 7.4 asyncio 框架

Python 的 asyncio 模块提供了异步编程支持：

**主要组件：**
- `async/await`: 定义和等待协程
- `asyncio.gather()`: 并发执行多个协程
- `asyncio.Semaphore`: 限制并发数量

## 案例

### 案例1：多线程爬虫基础

```python
import threading
import requests
import time

class MultiThreadSpider:
    """多线程爬虫"""
    
    def __init__(self, max_threads=5):
        self.max_threads = max_threads
        self.lock = threading.Lock()
        self.results = []
    
    def fetch(self, url):
        """获取单个URL"""
        try:
            response = requests.get(url, timeout=10)
            return {
                'url': url,
                'status': response.status_code,
                'length': len(response.text)
            }
        except Exception as e:
            return {
                'url': url,
                'error': str(e)
            }
    
    def worker(self, urls):
        """工作线程"""
        for url in urls:
            result = self.fetch(url)
            
            # 线程安全地保存结果
            with self.lock:
                self.results.append(result)
    
    def crawl(self, urls):
        """并发爬取"""
        # 将URL分配给各线程
        chunk_size = len(urls) // self.max_threads
        threads = []
        
        for i in range(self.max_threads):
            start = i * chunk_size
            end = start + chunk_size if i < self.max_threads - 1 else len(urls)
            chunk = urls[start:end]
            
            thread = threading.Thread(target=self.worker, args=(chunk,))
            threads.append(thread)
            thread.start()
        
        # 等待所有线程完成
        for thread in threads:
            thread.join()
        
        return self.results

# 使用示例
urls = [f'https://example.com/page/{i}' for i in range(20)]

spider = MultiThreadSpider(max_threads=5)
start_time = time.time()

results = spider.crawl(urls)

elapsed = time.time() - start_time
print(f'爬取 {len(urls)} 个URL，耗时: {elapsed:.2f}秒')
print(f'成功: {sum(1 for r in results if "error" not in r)}')
```

### 案例2：线程池爬虫

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

class ThreadPoolSpider:
    """线程池爬虫"""
    
    def __init__(self, max_workers=5):
        self.max_workers = max_workers
    
    def fetch(self, url):
        """获取单个URL"""
        try:
            response = requests.get(url, timeout=10)
            return {
                'url': url,
                'status': response.status_code,
                'length': len(response.text)
            }
        except Exception as e:
            return {
                'url': url,
                'error': str(e)
            }
    
    def crawl(self, urls):
        """并发爬取"""
        results = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # 提交所有任务
            future_to_url = {
                executor.submit(self.fetch, url): url 
                for url in urls
            }
            
            # 获取结果
            for future in as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    results.append({
                        'url': url,
                        'error': str(e)
                    })
        
        return results

# 使用示例
urls = [f'https://example.com/page/{i}' for i in range(20)]

spider = ThreadPoolSpider(max_workers=5)
results = spider.crawl(urls)

print(f'爬取完成，共 {len(results)} 个结果')
```

## 应用场景

### 1. 大规模数据采集
- 需要爬取大量页面
- 对速度有要求

### 2. I/O 密集型任务
- 网络请求等待时间长
- CPU 利用率低

### 3. 实时数据监控
- 需要快速获取最新数据
- 频繁请求多个数据源

## 代码案例

### 案例3：asyncio + aiohttp 异步爬虫

```python
import asyncio
import aiohttp
import time

class AsyncSpider:
    """异步爬虫"""
    
    def __init__(self, max_concurrent=10):
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.results = []
    
    async def fetch(self, session, url):
        """异步获取单个URL"""
        async with self.semaphore:
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    text = await response.text()
                    return {
                        'url': url,
                        'status': response.status,
                        'length': len(text)
                    }
            except Exception as e:
                return {
                    'url': url,
                    'error': str(e)
                }
    
    async def crawl(self, urls):
        """并发爬取"""
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch(session, url) for url in urls]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            return results

# 使用示例
async def main():
    urls = [f'https://example.com/page/{i}' for i in range(20)]
    
    spider = AsyncSpider(max_concurrent=10)
    start_time = time.time()
    
    results = await spider.crawl(urls)
    
    elapsed = time.time() - start_time
    print(f'爬取 {len(urls)} 个URL，耗时: {elapsed:.2f}秒')

# 运行异步程序
asyncio.run(main())
```

### 案例4：异步爬虫带重试

```python
import asyncio
import aiohttp
from tenacity import retry, stop_after_attempt, wait_exponential

class AsyncSpiderWithRetry:
    """带重试的异步爬虫"""
    
    def __init__(self, max_concurrent=10, max_retries=3):
        self.max_concurrent = max_concurrent
        self.max_retries = max_retries
        self.semaphore = asyncio.Semaphore(max_concurrent)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    async def fetch_with_retry(self, session, url):
        """带重试的异步获取"""
        async with self.semaphore:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                return await response.text()
    
    async def fetch(self, session, url):
        """异步获取单个URL"""
        try:
            text = await self.fetch_with_retry(session, url)
            return {
                'url': url,
                'status': 'success',
                'length': len(text)
            }
        except Exception as e:
            return {
                'url': url,
                'status': 'error',
                'error': str(e)
            }
    
    async def crawl(self, urls):
        """并发爬取"""
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch(session, url) for url in urls]
            return await asyncio.gather(*tasks)

# 使用示例
async def main():
    urls = [f'https://example.com/page/{i}' for i in range(20)]
    
    spider = AsyncSpiderWithRetry(max_concurrent=10)
    results = await spider.crawl(urls)
    
    success_count = sum(1 for r in results if r['status'] == 'success')
    print(f'成功: {success_count}/{len(urls)}')

asyncio.run(main())
```

### 案例5：多进程爬虫

```python
from multiprocessing import Pool, Manager
import requests

class MultiProcessSpider:
    """多进程爬虫"""
    
    def __init__(self, max_processes=4):
        self.max_processes = max_processes
    
    @staticmethod
    def fetch(url):
        """获取单个URL"""
        try:
            response = requests.get(url, timeout=10)
            return {
                'url': url,
                'status': response.status_code,
                'length': len(response.text)
            }
        except Exception as e:
            return {
                'url': url,
                'error': str(e)
            }
    
    def crawl(self, urls):
        """并发爬取"""
        with Pool(processes=self.max_processes) as pool:
            results = pool.map(self.fetch, urls)
        return results

# 使用示例
if __name__ == '__main__':
    urls = [f'https://example.com/page/{i}' for i in range(20)]
    
    spider = MultiProcessSpider(max_processes=4)
    results = spider.crawl(urls)
    
    print(f'爬取完成，共 {len(results)} 个结果')
```

### 案例6：混合并发爬虫

```python
import asyncio
import aiohttp
from concurrent.futures import ProcessPoolExecutor
import requests

class HybridSpider:
    """混合并发爬虫"""
    
    def __init__(self, max_workers=4, max_concurrent=10):
        self.max_workers = max_workers
        self.max_concurrent = max_concurrent
    
    @staticmethod
    def cpu_intensive_task(data):
        """CPU密集型任务"""
        # 模拟CPU密集型处理
        result = sum(range(1000000))
        return result
    
    async def fetch(self, session, url):
        """异步获取URL"""
        async with session.get(url) as response:
            return await response.text()
    
    async def crawl(self, urls):
        """混合并发爬取"""
        # 使用异步进行网络请求
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch(session, url) for url in urls]
            html_contents = await asyncio.gather(*tasks)
        
        # 使用多进程进行CPU密集型处理
        with ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            results = list(executor.map(self.cpu_intensive_task, html_contents))
        
        return results

# 使用示例
async def main():
    urls = [f'https://example.com/page/{i}' for i in range(20)]
    
    spider = HybridSpider(max_workers=4, max_concurrent=10)
    results = await spider.crawl(urls)
    
    print(f'处理完成，共 {len(results)} 个结果')

asyncio.run(main())
```

### 案例7：性能对比测试

```python
import time
import requests
from concurrent.futures import ThreadPoolExecutor
import asyncio
import aiohttp

def sync_crawl(urls):
    """同步爬取"""
    results = []
    for url in urls:
        try:
            response = requests.get(url, timeout=10)
            results.append(response.status_code)
        except:
            results.append(None)
    return results

def thread_crawl(urls, max_workers=5):
    """多线程爬取"""
    def fetch(url):
        try:
            response = requests.get(url, timeout=10)
            return response.status_code
        except:
            return None
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(fetch, urls))
    return results

async def async_crawl(urls, max_concurrent=10):
    """异步爬取"""
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def fetch(session, url):
        async with semaphore:
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    return response.status
            except:
                return None
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks)

# 性能测试
async def performance_test():
    urls = [f'https://httpbin.org/delay/1' for _ in range(10)]
    
    # 同步测试
    start = time.time()
    sync_crawl(urls)
    sync_time = time.time() - start
    
    # 多线程测试
    start = time.time()
    thread_crawl(urls, max_workers=5)
    thread_time = time.time() - start
    
    # 异步测试
    start = time.time()
    await async_crawl(urls, max_concurrent=10)
    async_time = time.time() - start
    
    print(f'同步爬取: {sync_time:.2f}秒')
    print(f'多线程爬取: {thread_time:.2f}秒')
    print(f'异步爬取: {async_time:.2f}秒')

asyncio.run(performance_test())
```

## 课后练习

### 练习1：实现一个带进度条的多线程爬虫
使用 tqdm 库显示爬取进度。

### 练习2：实现一个支持断点续传的异步爬虫
记录已爬取的URL，支持中断后继续爬取。

### 练习3：对比不同并发方案的性能
测试不同并发数对爬取速度的影响。

## 常见问题

### Q1: 多线程和异步哪个更好？
A: 异步更适合 I/O 密集型任务，性能更好；多线程更简单，适合快速实现。

### Q2: 如何控制并发数量？
A: 使用线程池的 max_workers 参数，或异步编程的 Semaphore。

### Q3: GIL 对爬虫有影响吗？
A: 对 I/O 密集型的爬虫任务影响不大，因为线程在等待 I/O 时会释放 GIL。

## 下一步学习

- [Day 8: 分布式爬虫架构](/crawler/crawler-advanced/day8/)
