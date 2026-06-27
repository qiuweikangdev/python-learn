# Day 5: 错误处理与异常管理

## 学习目标

完成今天的学习后，你将能够：
- 理解Python异常处理机制
- 实现自定义异常类
- 设计错误处理策略
- 实现重试机制和优雅降级

## 技术原理

### 异常处理基础

Python使用try-except语句处理异常：

```python
try:
    # 可能发生异常的代码
    result = 10 / 0
except ZeroDivisionError as e:
    # 处理特定异常
    print(f"除零错误: {e}")
except Exception as e:
    # 处理其他异常
    print(f"未知错误: {e}")
else:
    # 没有异常时执行
    print("执行成功")
finally:
    # 无论是否发生异常都执行
    print("清理资源")
```

### 异常层次结构

```
BaseException
 +-- KeyboardInterrupt
 +-- SystemExit
 +-- GeneratorExit
 +-- Exception
      +-- StopIteration
      +-- ArithmeticError
      |    +-- ZeroDivisionError
      |    +-- OverflowError
      +-- LookupError
      |    +-- IndexError
      |    +-- KeyError
      +-- OSError
      |    +-- FileNotFoundError
      |    +-- PermissionError
      +-- ValueError
      +-- TypeError
      +-- RuntimeError
```

### 自定义异常

```python
class CustomError(Exception):
    """自定义异常类"""
    def __init__(self, message, code=None):
        super().__init__(message)
        self.code = code
        self.message = message
    
    def __str__(self):
        if self.code:
            return f"[{self.code}] {self.message}"
        return self.message
```

## 案例：健壮的错误处理系统

创建一个健壮的错误处理系统，实现：
1. 多层异常捕获
2. 错误日志记录
3. 重试机制
4. 优雅降级

## 应用场景

### 1. 网络请求
- 网络超时处理
- 连接失败重试
- 请求限流处理

### 2. 文件操作
- 文件不存在处理
- 权限错误处理
- 磁盘空间不足处理

### 3. 数据库操作
- 连接失败处理
- 查询超时处理
- 事务回滚处理

### 4. 外部服务调用
- 服务不可用处理
- API限流处理
- 数据格式错误处理

## 代码案例

### 案例1：自定义异常体系

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自定义异常体系
功能：定义应用级别的异常类
"""

class AppError(Exception):
    """应用基础异常"""
    def __init__(self, message, code=None, details=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}
    
    def to_dict(self):
        """转换为字典"""
        return {
            'error': self.__class__.__name__,
            'message': self.message,
            'code': self.code,
            'details': self.details
        }

class ValidationError(AppError):
    """数据验证异常"""
    def __init__(self, field, message, value=None):
        super().__init__(
            message=message,
            code='VALIDATION_ERROR',
            details={'field': field, 'value': value}
        )
        self.field = field
        self.value = value

class NotFoundError(AppError):
    """资源不存在异常"""
    def __init__(self, resource, identifier):
        super().__init__(
            message=f"{resource}不存在: {identifier}",
            code='NOT_FOUND',
            details={'resource': resource, 'identifier': identifier}
        )
        self.resource = resource
        self.identifier = identifier

class PermissionError(AppError):
    """权限异常"""
    def __init__(self, action, resource=None):
        message = f"无权限执行操作: {action}"
        if resource:
            message = f"无权限访问资源: {resource}"
        super().__init__(
            message=message,
            code='PERMISSION_DENIED',
            details={'action': action, 'resource': resource}
        )

class RateLimitError(AppError):
    """限流异常"""
    def __init__(self, limit, window):
        super().__init__(
            message=f"请求频率超限: {limit}次/{window}秒",
            code='RATE_LIMIT',
            details={'limit': limit, 'window': window}
        )
        self.limit = limit
        self.window = window

class ExternalServiceError(AppError):
    """外部服务异常"""
    def __init__(self, service, message, status_code=None):
        super().__init__(
            message=f"外部服务错误 ({service}): {message}",
            code='EXTERNAL_SERVICE_ERROR',
            details={'service': service, 'status_code': status_code}
        )
        self.service = service
        self.status_code = status_code

# 使用示例
def validate_age(age):
    """验证年龄"""
    if not isinstance(age, int):
        raise ValidationError('age', '年龄必须是整数', age)
    if age < 0 or age > 150:
        raise ValidationError('age', '年龄必须在0-150之间', age)
    return True

def find_user(user_id):
    """查找用户"""
    # 模拟数据库查询
    users = {1: 'Alice', 2: 'Bob'}
    if user_id not in users:
        raise NotFoundError('用户', user_id)
    return users[user_id]

def main():
    """主函数"""
    # 测试验证异常
    try:
        validate_age(-5)
    except ValidationError as e:
        print(f"验证错误: {e}")
        print(f"错误详情: {e.to_dict()}")
    
    # 测试资源不存在异常
    try:
        find_user(999)
    except NotFoundError as e:
        print(f"\n资源错误: {e}")
        print(f"错误详情: {e.to_dict()}")

if __name__ == "__main__":
    main()
```

### 案例2：重试机制实现

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重试机制实现
功能：实现函数执行失败自动重试
"""

import time
import random
import functools
from typing import Callable, Any, Tuple, Optional

class RetryError(Exception):
    """重试失败异常"""
    def __init__(self, message, last_exception, attempts):
        super().__init__(message)
        self.last_exception = last_exception
        self.attempts = attempts

def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: Tuple = (Exception,),
    on_retry: Optional[Callable] = None
):
    """
    重试装饰器
    
    Args:
        max_attempts: 最大重试次数
        delay: 初始延迟时间（秒）
        backoff: 延迟倍数
        exceptions: 需要重试的异常类型
        on_retry: 重试时的回调函数
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            current_delay = delay
            
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_attempts:
                        raise RetryError(
                            f"函数 {func.__name__} 在 {max_attempts} 次尝试后失败",
                            last_exception,
                            max_attempts
                        )
                    
                    if on_retry:
                        on_retry(attempt, e, current_delay)
                    
                    print(f"第 {attempt} 次尝试失败: {e}, {current_delay}秒后重试...")
                    time.sleep(current_delay)
                    current_delay *= backoff
            
            raise last_exception
        
        return wrapper
    return decorator

def exponential_backoff(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0) -> float:
    """指数退避算法"""
    delay = min(base_delay * (2 ** (attempt - 1)), max_delay)
    # 添加随机抖动
    jitter = random.uniform(0, delay * 0.1)
    return delay + jitter

# 使用示例
@retry(max_attempts=3, delay=1.0, backoff=2.0, exceptions=(ConnectionError, TimeoutError))
def fetch_data(url: str) -> str:
    """获取数据（模拟网络请求）"""
    # 模拟随机失败
    if random.random() < 0.7:
        raise ConnectionError(f"连接失败: {url}")
    return f"数据来自: {url}"

@retry(max_attempts=5, delay=0.5, exceptions=(IOError,))
def read_file(path: str) -> str:
    """读取文件"""
    with open(path, 'r') as f:
        return f.read()

def on_retry_callback(attempt: int, exception: Exception, delay: float):
    """重试回调函数"""
    print(f"[回调] 第 {attempt} 次重试, 异常: {exception}, 延迟: {delay}秒")

@retry(max_attempts=3, on_retry=on_retry_callback)
def unreliable_function():
    """不可靠的函数"""
    if random.random() < 0.8:
        raise RuntimeError("随机错误")
    return "成功"

def main():
    """主函数"""
    print("测试重试机制:")
    print("-" * 50)
    
    try:
        result = fetch_data("https://api.example.com/data")
        print(f"获取数据成功: {result}")
    except RetryError as e:
        print(f"重试失败: {e}")
        print(f"最后异常: {e.last_exception}")
        print(f"尝试次数: {e.attempts}")
    
    print("\n测试文件读取重试:")
    print("-" * 50)
    
    try:
        content = read_file("不存在的文件.txt")
        print(f"文件内容: {content}")
    except RetryError as e:
        print(f"重试失败: {e}")
    
    print("\n测试回调函数:")
    print("-" * 50)
    
    try:
        result = unreliable_function()
        print(f"执行结果: {result}")
    except RetryError as e:
        print(f"重试失败: {e}")

if __name__ == "__main__":
    main()
```

### 案例3：优雅降级实现

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
优雅降级实现
功能：在服务不可用时提供降级方案
"""

import time
import random
from typing import Any, Callable, Optional
from functools import wraps

class CircuitBreaker:
    """断路器"""
    
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'closed'  # closed, open, half-open
    
    def record_failure(self):
        """记录失败"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = 'open'
            print(f"断路器打开: 连续 {self.failure_count} 次失败")
    
    def record_success(self):
        """记录成功"""
        self.failure_count = 0
        self.state = 'closed'
    
    def can_execute(self) -> bool:
        """检查是否可以执行"""
        if self.state == 'closed':
            return True
        
        if self.state == 'open':
            # 检查是否可以尝试恢复
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = 'half-open'
                print("断路器半开: 尝试恢复")
                return True
            return False
        
        # half-open状态
        return True

def circuit_breaker(breaker: CircuitBreaker, fallback: Callable = None):
    """
    断路器装饰器
    
    Args:
        breaker: 断路器实例
        fallback: 降级函数
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            if not breaker.can_execute():
                print(f"断路器打开，使用降级方案")
                if fallback:
                    return fallback(*args, **kwargs)
                raise RuntimeError("服务不可用，断路器打开")
            
            try:
                result = func(*args, **kwargs)
                breaker.record_success()
                return result
            except Exception as e:
                breaker.record_failure()
                if fallback:
                    print(f"执行失败，使用降级方案: {e}")
                    return fallback(*args, **kwargs)
                raise
        
        return wrapper
    return decorator

# 示例：外部服务调用
breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=30)

def fallback_get_user(user_id: int) -> dict:
    """降级方案：返回默认用户信息"""
    return {
        'id': user_id,
        'name': '未知用户',
        'email': 'unknown@example.com',
        'source': 'cache'
    }

@circuit_breaker(breaker, fallback=fallback_get_user)
def get_user_from_service(user_id: int) -> dict:
    """从服务获取用户信息"""
    # 模拟服务调用
    if random.random() < 0.7:
        raise ConnectionError("服务连接失败")
    
    return {
        'id': user_id,
        'name': f'用户{user_id}',
        'email': f'user{user_id}@example.com',
        'source': 'service'
    }

def main():
    """主函数"""
    print("测试断路器和优雅降级:")
    print("-" * 50)
    
    for i in range(10):
        try:
            user = get_user_from_service(i)
            print(f"获取用户 {i}: {user}")
        except Exception as e:
            print(f"获取用户 {i} 失败: {e}")
        
        time.sleep(1)

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：自定义异常
1. 定义一套业务异常类
2. 实现异常的序列化和反序列化
3. 支持异常链和上下文

### 练习2：重试机制
1. 实现带退避策略的重试机制
2. 支持配置重试条件
3. 实现重试统计和监控

### 练习3：错误处理策略
1. 设计一个错误处理中间件
2. 支持错误分类和路由
3. 实现错误恢复机制

## 常见问题

### Q1: 何时使用自定义异常？
A: 当需要区分不同类型的业务错误时，或需要携带额外错误信息时。

### Q2: 如何避免异常被吞掉？
A: 确保except块中至少记录日志，避免空的except块。

### Q3: 重试机制的最佳实践是什么？
A: 使用指数退避、设置最大重试次数、添加随机抖动、限制重试时间。

## 下一步学习

完成今天的学习后，建议你：
1. 熟悉Python异常处理机制
2. 设计适合自己项目的异常体系
3. 实现健壮的错误处理策略
4. 准备进入进阶篇的学习

明天我们将进入进阶篇，学习日志记录与监控。