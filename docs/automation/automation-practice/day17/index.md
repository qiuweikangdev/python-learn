# Day 17: 性能测试与压测

## 学习目标

完成今天的学习后，你将能够：
- 使用 httpx 进行异步 HTTP 请求
- 使用 locust 进行分布式压测
- 理解性能指标 (QPS、响应时间、并发数)
- 生成压测报告和可视化图表

## 技术原理

### 性能指标

| 指标 | 说明 | 健康范围 |
|------|------|---------|
| QPS/TPS | 每秒请求数 | 依业务而定 |
| 响应时间 | 请求到响应的时间 | < 200ms |
| 并发数 | 同时处理的请求数 | 依服务器配置 |
| 错误率 | 失败请求占比 | < 1% |
| P95/P99 | 95%/99%响应时间 | < 500ms |

### 压测类型

1. **负载测试**：逐步增加压力，观察系统表现
2. **压力测试**：超过正常负载，测试系统极限
3. **并发测试**：测试多用户同时访问
4. **稳定性测试**：长时间运行，测试系统稳定性

## 代码案例

### 案例1：httpx 异步请求

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
httpx异步请求
功能：使用httpx进行高性能HTTP请求
"""

import httpx
import asyncio
import time
from typing import List, Dict
from dataclasses import dataclass


@dataclass
class RequestResult:
    """请求结果"""
    url: str
    status_code: int
    response_time: float
    content_length: int
    success: bool


class AsyncHTTPClient:
    """异步HTTP客户端"""
    
    def __init__(self, base_url: str, timeout: float = 10.0):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.results: List[RequestResult] = []
    
    async def request(self, client: httpx.AsyncClient, method: str, 
                     endpoint: str, **kwargs) -> RequestResult:
        """发送单个请求"""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            response = await client.request(method, url, **kwargs)
            response_time = time.time() - start_time
            
            result = RequestResult(
                url=url,
                status_code=response.status_code,
                response_time=response_time,
                content_length=len(response.content),
                success=200 <= response.status_code < 300
            )
        except Exception as e:
            response_time = time.time() - start_time
            result = RequestResult(
                url=url,
                status_code=0,
                response_time=response_time,
                content_length=0,
                success=False
            )
        
        self.results.append(result)
        return result
    
    async def batch_request(self, requests_config: List[Dict]) -> List[RequestResult]:
        """批量发送请求"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            tasks = []
            for config in requests_config:
                task = self.request(
                    client,
                    config.get('method', 'GET'),
                    config['endpoint'],
                    **config.get('kwargs', {})
                )
                tasks.append(task)
            
            results = await asyncio.gather(*tasks)
            return results
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        if not self.results:
            return {}
        
        success_results = [r for r in self.results if r.success]
        failed_results = [r for r in self.results if not r.success]
        
        response_times = [r.response_time for r in self.results]
        
        return {
            'total_requests': len(self.results),
            'successful_requests': len(success_results),
            'failed_requests': len(failed_results),
            'success_rate': f"{len(success_results) / len(self.results) * 100:.2f}%",
            'avg_response_time': f"{sum(response_times) / len(response_times):.3f}s",
            'min_response_time': f"{min(response_times):.3f}s",
            'max_response_time': f"{max(response_times):.3f}s",
            'total_time': f"{sum(response_times):.3f}s"
        }


async def main():
    """主函数"""
    client = AsyncHTTPClient("https://jsonplaceholder.typicode.com")
    
    # 批量请求配置
    requests_config = [
        {'endpoint': '/posts'},
        {'endpoint': '/users'},
        {'endpoint': '/comments'},
        {'endpoint': '/albums'},
        {'endpoint': '/todos'},
        {'endpoint': '/posts/1'},
        {'endpoint': '/users/1'},
        {'endpoint': '/posts/1/comments'},
    ] * 10  # 重复10次，共80个请求
    
    print(f"开始批量请求，共 {len(requests_config)} 个请求...")
    start_time = time.time()
    
    results = await client.batch_request(requests_config)
    
    total_time = time.time() - start_time
    print(f"批量请求完成，总耗时: {total_time:.3f}s")
    
    # 打印统计信息
    stats = client.get_statistics()
    print("\n=== 统计信息 ===")
    for key, value in stats.items():
        print(f"{key}: {value}")
    
    # 计算QPS
    qps = len(results) / total_time
    print(f"\nQPS: {qps:.2f} 请求/秒")


if __name__ == "__main__":
    asyncio.run(main())
```

### 案例2：locust 压测脚本

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
locust压测脚本
功能：使用locust进行分布式压测
"""

from locust import HttpUser, task, between, events
from locust.runners import MasterRunner, WorkerRunner
import json
import time
from datetime import datetime


class WebsiteUser(HttpUser):
    """模拟用户行为"""
    
    # 用户等待时间（秒）
    wait_time = between(1, 3)
    
    def on_start(self):
        """用户启动时执行"""
        print(f"用户 {self.environment.runner.user_count} 开始测试")
    
    def on_stop(self):
        """用户停止时执行"""
        print(f"用户停止测试")
    
    @task(3)  # 权重为3，执行频率更高
    def view_posts(self):
        """查看文章列表"""
        with self.client.get("/posts", name="GET /posts") as response:
            if response.status_code == 200:
                posts = response.json()
                assert len(posts) > 0
    
    @task(2)
    def view_single_post(self):
        """查看单篇文章"""
        post_id = self.environment.parsed_options.post_id if hasattr(
            self.environment.parsed_options, 'post_id') else 1
        
        with self.client.get(f"/posts/{post_id}", name="GET /posts/:id") as response:
            if response.status_code == 200:
                post = response.json()
                assert 'title' in post
    
    @task(2)
    def view_users(self):
        """查看用户列表"""
        with self.client.get("/users", name="GET /users") as response:
            if response.status_code == 200:
                users = response.json()
                assert len(users) > 0
    
    @task(1)
    def view_comments(self):
        """查看评论"""
        with self.client.get("/posts/1/comments", name="GET /posts/:id/comments") as response:
            if response.status_code == 200:
                comments = response.json()
                assert len(comments) > 0
    
    @task(1)
    def create_post(self):
        """创建文章"""
        payload = {
            'title': f'测试文章 {time.time()}',
            'body': '压测创建的文章',
            'userId': 1
        }
        
        with self.client.post("/posts", json=payload, name="POST /posts") as response:
            if response.status_code == 201:
                post = response.json()
                assert 'id' in post
    
    @task(1)
    def search_posts(self):
        """搜索文章"""
        with self.client.get(
            "/posts",
            params={'userId': 1},
            name="GET /posts?userId=1"
        ) as response:
            if response.status_code == 200:
                posts = response.json()
                assert all(p['userId'] == 1 for p in posts)


class QuickStartUser(HttpUser):
    """快速入门用户"""
    
    wait_time = between(0.5, 1.5)
    
    @task
    def index(self):
        """访问首页"""
        self.client.get("/")


# 自定义事件处理
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """测试开始"""
    print("=" * 50)
    print("压测开始")
    print(f"目标地址: {environment.host}")
    print("=" * 50)


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """测试结束"""
    print("=" * 50)
    print("压测结束")
    print("=" * 50)


@events.request.add_listener
def on_request(request_type, name, response_time, response_length, 
               response, context, exception, **kwargs):
    """请求完成"""
    if exception:
        print(f"请求失败: {name} - {exception}")


# 运行配置说明
"""
运行locust的命令：

1. 单机模式：
   locust -f locustfile.py --host=https://jsonplaceholder.typicode.com

2. 分布式模式（主节点）：
   locust -f locustfile.py --master --host=https://jsonplaceholder.typicode.com

3. 分布式模式（工作节点）：
   locust -f locustfile.py --worker --master-host=127.0.0.1

4. 无Web界面运行：
   locust -f locustfile.py --headless -u 100 -r 10 --run-time 1m

5. 生成CSV报告：
   locust -f locustfile.py --headless -u 100 -r 10 --run-time 1m --csv=report
"""
```

### 案例3：性能数据收集与分析

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
性能数据收集与分析
功能：收集和分析压测数据
"""

import time
import statistics
from dataclasses import dataclass, field
from typing import List, Dict
from datetime import datetime
import json


@dataclass
class RequestMetric:
    """请求指标"""
    timestamp: float
    url: str
    method: str
    status_code: int
    response_time: float
    request_size: int
    response_size: int
    success: bool


class PerformanceCollector:
    """性能数据收集器"""
    
    def __init__(self):
        self.metrics: List[RequestMetric] = []
        self.start_time = None
        self.end_time = None
    
    def start(self):
        """开始收集"""
        self.start_time = time.time()
        self.metrics.clear()
    
    def stop(self):
        """停止收集"""
        self.end_time = time.time()
    
    def record(self, metric: RequestMetric):
        """记录指标"""
        self.metrics.append(metric)
    
    def get_response_times(self) -> List[float]:
        """获取所有响应时间"""
        return [m.response_time for m in self.metrics]
    
    def calculate_percentile(self, data: List[float], percentile: float) -> float:
        """计算百分位数"""
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        if not self.metrics:
            return {}
        
        response_times = self.get_response_times()
        success_count = sum(1 for m in self.metrics if m.success)
        failed_count = len(self.metrics) - success_count
        
        total_duration = (self.end_time or time.time()) - (self.start_time or time.time())
        
        return {
            'summary': {
                'total_requests': len(self.metrics),
                'successful_requests': success_count,
                'failed_requests': failed_count,
                'success_rate': f"{success_count / len(self.metrics) * 100:.2f}%",
                'total_duration': f"{total_duration:.2f}s",
                'qps': f"{len(self.metrics) / total_duration:.2f}"
            },
            'response_time': {
                'min': f"{min(response_times):.3f}s",
                'max': f"{max(response_times):.3f}s",
                'avg': f"{statistics.mean(response_times):.3f}s",
                'median': f"{statistics.median(response_times):.3f}s",
                'p90': f"{self.calculate_percentile(response_times, 90):.3f}s",
                'p95': f"{self.calculate_percentile(response_times, 95):.3f}s",
                'p99': f"{self.calculate_percentile(response_times, 99):.3f}s",
                'std_dev': f"{statistics.stdev(response_times):.3f}s" if len(response_times) > 1 else "0s"
            },
            'throughput': {
                'bytes_sent': sum(m.request_size for m in self.metrics),
                'bytes_received': sum(m.response_size for m in self.metrics),
                'avg_request_size': sum(m.request_size for m in self.metrics) // len(self.metrics),
                'avg_response_size': sum(m.response_size for m in self.metrics) // len(self.metrics)
            }
        }
    
    def save_report(self, filename: str):
        """保存报告"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'statistics': self.get_statistics(),
            'metrics': [
                {
                    'timestamp': m.timestamp,
                    'url': m.url,
                    'method': m.method,
                    'status_code': m.status_code,
                    'response_time': m.response_time,
                    'success': m.success
                }
                for m in self.metrics
            ]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"报告已保存: {filename}")


class PerformanceAnalyzer:
    """性能分析器"""
    
    @staticmethod
    def analyze_bottlenecks(collector: PerformanceCollector) -> List[str]:
        """分析性能瓶颈"""
        issues = []
        stats = collector.get_statistics()
        
        # 检查响应时间
        avg_response_time = float(stats['response_time']['avg'].rstrip('s'))
        if avg_response_time > 1.0:
            issues.append(f"平均响应时间过长: {stats['response_time']['avg']}")
        
        p95_response_time = float(stats['response_time']['p95'].rstrip('s'))
        if p95_response_time > 2.0:
            issues.append(f"P95响应时间过长: {stats['response_time']['p95']}")
        
        # 检查成功率
        success_rate = float(stats['summary']['success_rate'].rstrip('%'))
        if success_rate < 99:
            issues.append(f"成功率过低: {stats['summary']['success_rate']}")
        
        # 检查QPS
        qps = float(stats['summary']['qps'])
        if qps < 10:
            issues.append(f"QPS过低: {stats['summary']['qps']}")
        
        return issues
    
    @staticmethod
    def generate_recommendations(issues: List[str]) -> List[str]:
        """生成优化建议"""
        recommendations = []
        
        for issue in issues:
            if '响应时间' in issue:
                recommendations.append("建议: 优化数据库查询、增加缓存、减少网络延迟")
            elif '成功率' in issue:
                recommendations.append("建议: 检查错误日志、增加重试机制、优化异常处理")
            elif 'QPS' in issue:
                recommendations.append("建议: 增加服务器资源、优化代码性能、使用负载均衡")
        
        return recommendations


# 模拟压测演示
def simulate_load_test():
    """模拟压测"""
    import random
    
    collector = PerformanceCollector()
    collector.start()
    
    print("开始模拟压测...")
    
    for i in range(100):
        # 模拟请求
        response_time = random.uniform(0.1, 1.0)
        success = random.random() > 0.05  # 5%失败率
        
        metric = RequestMetric(
            timestamp=time.time(),
            url="/api/test",
            method="GET",
            status_code=200 if success else 500,
            response_time=response_time,
            request_size=100,
            response_size=random.randint(500, 5000),
            success=success
        )
        
        collector.record(metric)
        time.sleep(0.01)  # 模拟请求间隔
    
    collector.stop()
    
    # 打印统计信息
    stats = collector.get_statistics()
    print("\n=== 压测统计 ===")
    print(json.dumps(stats, indent=2, ensure_ascii=False))
    
    # 分析瓶颈
    issues = PerformanceAnalyzer.analyze_bottlenecks(collector)
    if issues:
        print("\n=== 发现问题 ===")
        for issue in issues:
            print(f"- {issue}")
        
        recommendations = PerformanceAnalyzer.generate_recommendations(issues)
        print("\n=== 优化建议 ===")
        for rec in recommendations:
            print(f"- {rec}")
    
    # 保存报告
    collector.save_report("performance_report.json")


if __name__ == "__main__":
    simulate_load_test()
```

## 课后练习

### 练习1：httpx 异步请求
1. 实现并发请求测试
2. 测量不同并发数下的QPS
3. 生成性能对比报告

### 练习2：locust 压测
1. 编写模拟真实用户行为的压测脚本
2. 进行负载测试，找到系统瓶颈
3. 生成压测报告

### 练习3：性能分析
1. 收集详细的性能指标
2. 分析性能瓶颈
3. 提出优化建议

## 常见问题

### Q1: 如何选择压测工具？
A: 简单场景用httpx，复杂场景用locust，需要分布式用locust集群模式。

### Q2: 压测时如何避免影响线上环境？
A: 使用独立的测试环境，或在低峰期进行压测。

### Q3: 如何解读压测报告？
A: 关注QPS、响应时间、错误率、P95/P99等关键指标。

## 下一步学习

完成今天的学习后，建议你：
1. 为自己的项目编写压测脚本
2. 分析性能瓶颈并优化
3. 准备进入Day 18的学习：前端UI自动化测试

明天我们将学习如何使用Playwright和Selenium进行前端UI自动化测试。
