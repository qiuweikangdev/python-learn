# Day 14: API 数据抓取

## 学习目标

- 掌握 RESTful API 的爬取方法
- 了解 GraphQL API 的爬取
- 学会处理 API 认证和限流
- 掌握 API 数据的解析和处理

## 技术原理

### 14.1 API 简介

API（Application Programming Interface）是应用程序编程接口，用于不同软件系统之间的通信。

**RESTful API 特点：**
- 基于 HTTP 协议
- 使用标准方法（GET、POST、PUT、DELETE）
- 返回 JSON 或 XML 格式数据
- 无状态

**GraphQL API 特点：**
- 单一端点
- 按需查询
- 强类型系统
- 减少过度获取

### 14.2 API 认证

**常见认证方式：**
- API Key
- OAuth 2.0
- JWT Token
- Basic Auth

### 14.3 API 限流

**限流策略：**
- 请求频率限制
- 并发请求限制
- 配额限制

## 案例

### 案例1：RESTful API 爬取

```python
import requests

class APIClient:
    """API 客户端"""
    
    def __init__(self, base_url, api_key=None):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        
        # 设置认证头
        if api_key:
            self.session.headers['Authorization'] = f'Bearer {api_key}'
        
        self.session.headers['Content-Type'] = 'application/json'
    
    def get(self, endpoint, params=None):
        """GET 请求"""
        url = f'{self.base_url}{endpoint}'
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    def post(self, endpoint, data=None):
        """POST 请求"""
        url = f'{self.base_url}{endpoint}'
        response = self.session.post(url, json=data)
        response.raise_for_status()
        return response.json()
    
    def put(self, endpoint, data=None):
        """PUT 请求"""
        url = f'{self.base_url}{endpoint}'
        response = self.session.put(url, json=data)
        response.raise_for_status()
        return response.json()
    
    def delete(self, endpoint):
        """DELETE 请求"""
        url = f'{self.base_url}{endpoint}'
        response = self.session.delete(url)
        response.raise_for_status()
        return response.json()

# 使用示例
client = APIClient('https://api.example.com', api_key='your-api-key')

# 获取用户列表
users = client.get('/users', params={'page': 1, 'limit': 10})
print(users)

# 获取单个用户
user = client.get('/users/123')
print(user)
```

### 案例2：分页 API 爬取

```python
import requests
import time

class PaginatedAPIClient:
    """分页 API 客户端"""
    
    def __init__(self, base_url, api_key=None):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers['Authorization'] = f'Bearer {api_key}'
    
    def fetch_all(self, endpoint, params=None, max_pages=None):
        """获取所有分页数据"""
        all_data = []
        page = 1
        
        while True:
            # 构建请求参数
            request_params = params or {}
            request_params['page'] = page
            request_params['limit'] = 100
            
            # 发送请求
            url = f'{self.base_url}{endpoint}'
            response = self.session.get(url, params=request_params)
            response.raise_for_status()
            
            data = response.json()
            
            # 检查是否有数据
            items = data.get('data', [])
            if not items:
                break
            
            all_data.extend(items)
            
            # 检查是否达到最大页数
            if max_pages and page >= max_pages:
                break
            
            # 检查是否还有下一页
            total_pages = data.get('total_pages', 1)
            if page >= total_pages:
                break
            
            page += 1
            
            # 限流
            time.sleep(0.5)
        
        return all_data

# 使用示例
client = PaginatedAPIClient('https://api.example.com', api_key='your-api-key')

# 获取所有用户
users = client.fetch_all('/users', params={'status': 'active'})
print(f'获取 {len(users)} 个用户')
```

## 应用场景

### 1. 数据采集
- 公开数据 API
- 第三方数据服务
- 内部系统数据

### 2. 数据同步
- 多系统数据同步
- 数据备份
- 数据迁移

### 3. 数据分析
- 数据聚合
- 数据挖掘
- 报表生成

## 代码案例

### 案例3：GraphQL API 爬取

```python
import requests

class GraphQLClient:
    """GraphQL 客户端"""
    
    def __init__(self, endpoint, headers=None):
        self.endpoint = endpoint
        self.session = requests.Session()
        
        if headers:
            self.session.headers.update(headers)
    
    def execute(self, query, variables=None):
        """执行 GraphQL 查询"""
        payload = {
            'query': query,
            'variables': variables or {}
        }
        
        response = self.session.post(self.endpoint, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        if 'errors' in result:
            raise Exception(f'GraphQL 错误: {result["errors"]}')
        
        return result.get('data')

# 使用示例
client = GraphQLClient('https://api.example.com/graphql')

# 查询用户
query = '''
    query GetUser($id: ID!) {
        user(id: $id) {
            id
            name
            email
            posts {
                id
                title
            }
        }
    }
'''

variables = {'id': '123'}
result = client.execute(query, variables)
print(result)
```

### 案例4：GitHub API 爬取

```python
import requests
import time

class GitHubClient:
    """GitHub API 客户端"""
    
    def __init__(self, token=None):
        self.base_url = 'https://api.github.com'
        self.session = requests.Session()
        
        if token:
            self.session.headers['Authorization'] = f'token {token}'
        
        self.session.headers['Accept'] = 'application/vnd.github.v3+json'
    
    def get_user(self, username):
        """获取用户信息"""
        return self._get(f'/users/{username}')
    
    def get_user_repos(self, username, per_page=100):
        """获取用户仓库"""
        return self._get_all_pages(f'/users/{username}/repos', per_page=per_page)
    
    def get_repo(self, owner, repo):
        """获取仓库信息"""
        return self._get(f'/repos/{owner}/{repo}')
    
    def get_repo_issues(self, owner, repo, state='open', per_page=100):
        """获取仓库 Issues"""
        return self._get_all_pages(
            f'/repos/{owner}/{repo}/issues',
            params={'state': state},
            per_page=per_page
        )
    
    def search_repositories(self, query, per_page=30):
        """搜索仓库"""
        return self._get('/search/repositories', params={'q': query, 'per_page': per_page})
    
    def _get(self, endpoint, params=None):
        """GET 请求"""
        url = f'{self.base_url}{endpoint}'
        response = self.session.get(url, params=params)
        
        # 处理限流
        if response.status_code == 403:
            reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
            sleep_time = max(reset_time - time.time(), 0)
            print(f'限流，等待 {sleep_time} 秒...')
            time.sleep(sleep_time)
            return self._get(endpoint, params)
        
        response.raise_for_status()
        return response.json()
    
    def _get_all_pages(self, endpoint, params=None, per_page=100):
        """获取所有分页数据"""
        all_data = []
        page = 1
        
        while True:
            request_params = params or {}
            request_params['page'] = page
            request_params['per_page'] = per_page
            
            data = self._get(endpoint, request_params)
            
            if not data:
                break
            
            all_data.extend(data)
            
            # 检查是否还有下一页
            if len(data) < per_page:
                break
            
            page += 1
            
            # 限流
            time.sleep(0.5)
        
        return all_data

# 使用示例
client = GitHubClient(token='your-github-token')

# 获取用户信息
user = client.get_user('octocat')
print(f'用户名: {user["login"]}')
print(f'仓库数: {user["public_repos"]}')

# 获取用户仓库
repos = client.get_user_repos('octocat')
print(f'获取 {len(repos)} 个仓库')

# 搜索仓库
results = client.search_repositories('python web framework')
print(f'搜索到 {results["total_count"]} 个仓库')
```

### 案例5：API 数据处理

```python
import pandas as pd
from datetime import datetime

class APIDataProcessor:
    """API 数据处理器"""
    
    def __init__(self):
        self.data = []
    
    def add_data(self, items):
        """添加数据"""
        self.data.extend(items)
    
    def to_dataframe(self):
        """转换为 DataFrame"""
        return pd.DataFrame(self.data)
    
    def filter_by_date(self, start_date, end_date, date_field='created_at'):
        """按日期过滤"""
        df = self.to_dataframe()
        
        if date_field in df.columns:
            df[date_field] = pd.to_datetime(df[date_field])
            mask = (df[date_field] >= start_date) & (df[date_field] <= end_date)
            return df[mask]
        
        return df
    
    def filter_by_field(self, field, value):
        """按字段过滤"""
        df = self.to_dataframe()
        
        if field in df.columns:
            return df[df[field] == value]
        
        return df
    
    def aggregate(self, group_field, agg_field, agg_func='count'):
        """聚合统计"""
        df = self.to_dataframe()
        
        if group_field in df.columns and agg_field in df.columns:
            return df.groupby(group_field)[agg_field].agg(agg_func)
        
        return None
    
    def export_csv(self, filename):
        """导出 CSV"""
        df = self.to_dataframe()
        df.to_csv(filename, index=False, encoding='utf-8-sig')
    
    def export_json(self, filename):
        """导出 JSON"""
        import json
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

# 使用示例
processor = APIDataProcessor()

# 添加数据
data = [
    {'name': '项目1', 'stars': 100, 'language': 'Python', 'created_at': '2024-01-01'},
    {'name': '项目2', 'stars': 200, 'language': 'JavaScript', 'created_at': '2024-01-15'},
    {'name': '项目3', 'stats': 150, 'language': 'Python', 'created_at': '2024-02-01'},
]

processor.add_data(data)

# 过滤
python_projects = processor.filter_by_field('language', 'Python')
print(f'Python 项目: {len(python_projects)}')

# 聚合
language_stats = processor.aggregate('language', 'stars', 'sum')
print(f'语言统计:\n{language_stats}')

# 导出
processor.export_csv('projects.csv')
processor.export_json('projects.json')
```

### 案例6：API 限流处理

```python
import requests
import time
from threading import Lock

class RateLimitedClient:
    """限流 API 客户端"""
    
    def __init__(self, base_url, requests_per_minute=60):
        self.base_url = base_url
        self.requests_per_minute = requests_per_minute
        self.session = requests.Session()
        self.lock = Lock()
        self.request_times = []
    
    def _wait_if_needed(self):
        """等待以满足限流要求"""
        with self.lock:
            now = time.time()
            
            # 清理一分钟前的请求记录
            self.request_times = [t for t in self.request_times if now - t < 60]
            
            # 如果达到限制，等待
            if len(self.request_times) >= self.requests_per_minute:
                sleep_time = 60 - (now - self.request_times[0])
                if sleep_time > 0:
                    time.sleep(sleep_time)
            
            # 记录当前请求
            self.request_times.append(time.time())
    
    def get(self, endpoint, params=None):
        """GET 请求"""
        self._wait_if_needed()
        
        url = f'{self.base_url}{endpoint}'
        response = self.session.get(url, params=params)
        
        # 处理 429 状态码
        if response.status_code == 429:
            retry_after = int(response.headers.get('Retry-After', 60))
            time.sleep(retry_after)
            return self.get(endpoint, params)
        
        response.raise_for_status()
        return response.json()

# 使用示例
client = RateLimitedClient('https://api.example.com', requests_per_minute=30)

# 批量请求
for i in range(100):
    data = client.get(f'/items/{i}')
    print(f'获取项目 {i}: {data}')
```

### 案例7：完整 API 爬虫

```python
import scrapy
import json

class APIBaseSpider(scrapy.Spider):
    """API 基础爬虫"""
    
    name = 'api_spider'
    
    custom_settings = {
        'DOWNLOAD_DELAY': 1,
        'CONCURRENT_REQUESTS': 4,
    }
    
    def __init__(self, api_key=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.api_key = api_key
        self.base_url = 'https://api.example.com'
    
    def start_requests(self):
        """生成初始请求"""
        # 获取第一页
        yield scrapy.Request(
            url=f'{self.base_url}/items?page=1&limit=100',
            headers={'Authorization': f'Bearer {self.api_key}'},
            callback=self.parse,
            meta={'page': 1}
        )
    
    def parse(self, response):
        """解析响应"""
        data = json.loads(response.text)
        page = response.meta['page']
        
        # 处理数据
        for item in data.get('data', []):
            yield {
                'id': item.get('id'),
                'name': item.get('name'),
                'description': item.get('description'),
                'created_at': item.get('created_at'),
            }
        
        # 处理分页
        total_pages = data.get('total_pages', 1)
        if page < total_pages:
            next_page = page + 1
            yield scrapy.Request(
                url=f'{self.base_url}/items?page={next_page}&limit=100',
                headers={'Authorization': f'Bearer {self.api_key}'},
                callback=self.parse,
                meta={'page': next_page}
            )
```

## 课后练习

### 练习1：爬取公开 API
选择一个公开 API（如 OpenWeatherMap），实现数据爬取。

### 练习2：实现 API 缓存
实现一个支持本地缓存的 API 客户端。

### 练习3：API 数据同步
实现一个定时同步 API 数据的系统。

## 常见问题

### Q1: 如何获取 API Key？
A: 通常需要在 API 提供方的网站上注册并申请。

### Q2: 如何处理 API 限流？
A: 使用 Rate Limiter 控制请求频率，处理 429 状态码，使用指数退避。

### Q3: 如何处理 API 版本变化？
A: 关注 API 文档更新，实现版本兼容，使用适配器模式。

## 下一步学习

- [Day 15: 综合项目实战](/crawler/crawler-practice/day15/)
