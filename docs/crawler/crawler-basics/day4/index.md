# Day 4: 反爬机制与应对策略

## 学习目标

- 了解常见的反爬虫机制
- 掌握 User-Agent 伪装技术
- 学会使用代理 IP 池
- 了解验证码识别基础

## 技术原理

### 4.1 常见反爬机制

网站为了保护数据和服务器资源，会采用各种反爬虫机制：

**1. User-Agent 检测**
- 检查请求头中的 User-Agent
- 识别爬虫特征（如 Python-requests/xxx）

**2. IP 频率限制**
- 限制单 IP 请求频率
- 封禁异常 IP 地址

**3. Cookie 验证**
- 要求携带特定 Cookie
- 检查会话有效性

**4. 验证码**
- 图形验证码
- 滑动验证码
- 点选验证码

**5. JavaScript 渲染**
- 动态加载内容
- 反调试代码

**6. 数据加密**
- 字体加密
- CSS 混淆
- 参数加密

### 4.2 应对策略概述

| 反爬机制 | 应对策略 |
|----------|----------|
| User-Agent 检测 | 伪装 User-Agent |
| IP 频率限制 | 使用代理 IP |
| Cookie 验证 | 维护 Cookie 池 |
| 验证码 | 验证码识别服务 |
| JavaScript 渲染 | 使用浏览器自动化 |
| 数据加密 | 分析加密算法 |

## 案例

### 案例1：User-Agent 伪装

```python
import requests
import random

# User-Agent 池
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

def get_random_headers():
    """获取随机请求头"""
    return {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
    }

# 使用示例
url = 'https://example.com'
response = requests.get(url, headers=get_random_headers())
print(f'状态码: {response.status_code}')
```

### 案例2：使用代理 IP

```python
import requests
import random

# 代理 IP 池
PROXY_POOL = [
    'http://proxy1:8080',
    'http://proxy2:8080',
    'http://proxy3:8080',
]

def get_random_proxy():
    """获取随机代理"""
    proxy = random.choice(PROXY_POOL)
    return {
        'http': proxy,
        'https': proxy,
    }

# 使用代理发送请求
url = 'https://example.com'
try:
    response = requests.get(
        url,
        headers=get_random_headers(),
        proxies=get_random_proxy(),
        timeout=10
    )
    print(f'状态码: {response.status_code}')
except requests.exceptions.ProxyError as e:
    print(f'代理错误: {e}')
except Exception as e:
    print(f'请求错误: {e}')
```

## 应用场景

### 1. 数据采集
- 绕过网站限制采集数据
- 大规模数据抓取

### 2. 竞品监控
- 监控竞品价格变化
- 采集市场信息

### 3. 舆情监控
- 采集社交媒体数据
- 监控品牌声誉

## 代码案例

### 案例3：自动重试机制

```python
import requests
import time
from functools import wraps

def retry(max_retries=3, delay=1):
    """重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise e
                    print(f'重试 {attempt + 1}/{max_retries}: {e}')
                    time.sleep(delay)
            return None
        return wrapper
    return decorator

@retry(max_retries=3, delay=2)
def fetch_url(url):
    """获取URL内容"""
    headers = get_random_headers()
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    return response.text

# 使用示例
try:
    content = fetch_url('https://example.com')
    print('获取成功')
except Exception as e:
    print(f'获取失败: {e}')
```

### 案例4：Cookie 管理

```python
import requests

class CookieManager:
    """Cookie 管理器"""
    
    def __init__(self):
        self.session = requests.Session()
        self.cookies = {}
    
    def login(self, login_url, login_data):
        """登录获取 Cookie"""
        headers = get_random_headers()
        response = self.session.post(
            login_url,
            data=login_data,
            headers=headers
        )
        
        if response.status_code == 200:
            self.cookies = dict(self.session.cookies)
            return True
        return False
    
    def get(self, url):
        """使用 Cookie 发送请求"""
        headers = get_random_headers()
        response = self.session.get(
            url,
            headers=headers,
            cookies=self.cookies
        )
        return response
    
    def update_cookies(self, new_cookies):
        """更新 Cookie"""
        self.cookies.update(new_cookies)

# 使用示例
cookie_manager = CookieManager()

# 登录
login_url = 'https://example.com/login'
login_data = {
    'username': 'your_username',
    'password': 'your_password'
}

if cookie_manager.login(login_url, login_data):
    print('登录成功')
    
    # 访问需要登录的页面
    profile_url = 'https://example.com/profile'
    response = cookie_manager.get(profile_url)
    print(f'状态码: {response.status_code}')
else:
    print('登录失败')
```

### 案例5：请求频率控制

```python
import requests
import time
from collections import deque

class RateLimiter:
    """请求频率限制器"""
    
    def __init__(self, max_requests=10, time_window=60):
        """
        初始化频率限制器
        
        Args:
            max_requests: 时间窗口内最大请求数
            time_window: 时间窗口（秒）
        """
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()
    
    def wait_if_needed(self):
        """如果需要，等待以满足频率限制"""
        now = time.time()
        
        # 清理过期的请求记录
        while self.requests and self.requests[0] < now - self.time_window:
            self.requests.popleft()
        
        # 如果达到限制，等待
        if len(self.requests) >= self.max_requests:
            sleep_time = self.requests[0] + self.time_window - now
            if sleep_time > 0:
                print(f'等待 {sleep_time:.2f} 秒...')
                time.sleep(sleep_time)
        
        # 记录当前请求
        self.requests.append(now)
    
    def get(self, url, **kwargs):
        """发送请求"""
        self.wait_if_needed()
        return requests.get(url, **kwargs)

# 使用示例
limiter = RateLimiter(max_requests=5, time_window=60)

urls = [
    'https://example.com/page1',
    'https://example.com/page2',
    'https://example.com/page3',
]

for url in urls:
    response = limiter.get(url, headers=get_random_headers())
    print(f'{url}: {response.status_code}')
```

### 案例6：代理 IP 验证

```python
import requests
from concurrent.futures import ThreadPoolExecutor

class ProxyValidator:
    """代理 IP 验证器"""
    
    def __init__(self, test_url='https://httpbin.org/ip'):
        self.test_url = test_url
        self.valid_proxies = []
    
    def validate_proxy(self, proxy):
        """验证单个代理"""
        try:
            response = requests.get(
                self.test_url,
                proxies={'http': proxy, 'https': proxy},
                timeout=10
            )
            if response.status_code == 200:
                return proxy
        except:
            pass
        return None
    
    def validate_proxies(self, proxy_list, max_workers=10):
        """批量验证代理"""
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            results = executor.map(self.validate_proxy, proxy_list)
            
        self.valid_proxies = [p for p in results if p]
        return self.valid_proxies

# 使用示例
proxy_list = [
    'http://proxy1:8080',
    'http://proxy2:8080',
    'http://proxy3:8080',
]

validator = ProxyValidator()
valid_proxies = validator.validate_proxies(proxy_list)
print(f'有效代理数量: {len(valid_proxies)}')
```

### 案例7：完整反爬策略

```python
import requests
import random
import time

class AntiCrawler:
    """反爬策略封装"""
    
    def __init__(self):
        self.session = requests.Session()
        self.proxies = []
        self.request_count = 0
        self.last_request_time = 0
    
    def setup_proxies(self, proxy_list):
        """设置代理池"""
        self.proxies = proxy_list
    
    def get_random_proxy(self):
        """获取随机代理"""
        if not self.proxies:
            return None
        proxy = random.choice(self.proxies)
        return {'http': proxy, 'https': proxy}
    
    def add_delay(self, min_delay=1, max_delay=3):
        """添加随机延迟"""
        delay = random.uniform(min_delay, max_delay)
        time.sleep(delay)
    
    def get_headers(self):
        """获取随机请求头"""
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        ]
        
        return {
            'User-Agent': random.choice(user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
    
    def request(self, url, method='GET', **kwargs):
        """发送请求"""
        # 添加延迟
        self.add_delay()
        
        # 设置请求头
        if 'headers' not in kwargs:
            kwargs['headers'] = self.get_headers()
        
        # 设置代理
        if self.proxies:
            kwargs['proxies'] = self.get_random_proxy()
        
        # 设置超时
        if 'timeout' not in kwargs:
            kwargs['timeout'] = 15
        
        # 发送请求
        response = self.session.request(method, url, **kwargs)
        
        # 更新计数
        self.request_count += 1
        
        return response
    
    def get(self, url, **kwargs):
        """GET 请求"""
        return self.request(url, 'GET', **kwargs)
    
    def post(self, url, **kwargs):
        """POST 请求"""
        return self.request(url, 'POST', **kwargs)

# 使用示例
crawler = AntiCrawler()

# 设置代理（如果有）
# crawler.setup_proxies(['http://proxy1:8080', 'http://proxy2:8080'])

# 发送请求
url = 'https://example.com'
response = crawler.get(url)
print(f'状态码: {response.status_code}')
print(f'请求数: {crawler.request_count}')
```

## 课后练习

### 练习1：IP 代理池
实现一个简单的代理 IP 池，支持添加、验证、获取代理。

### 练习2：请求频率控制
实现一个支持不同网站不同频率限制的控制器。

### 练习3：反爬策略测试
测试不同反爬策略的效果，记录成功率。

## 常见问题

### Q1: 免费代理好用吗？
A: 免费代理通常不稳定、速度慢、存活时间短。建议使用付费代理或自建代理池。

### Q2: 如何判断是否被反爬？
A: 常见信号包括：返回403状态码、要求验证码、返回空数据、IP被封禁等。

### Q3: 使用代理违法吗？
A: 使用代理本身不违法，但使用代理进行非法活动（如攻击网站、窃取数据）是违法的。

## 下一步学习

- [Day 5: 爬虫框架入门](/crawler/crawler-basics/day5/)
