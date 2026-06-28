# Day 8: 测试自动化

## 学习目标

完成今天的学习后，你将能够：
- 编写单元测试和集成测试
- 使用pytest高级功能
- 测量测试覆盖率
- 使用Mock和桩进行测试

## 技术原理

### 测试类型

1. **单元测试**：测试单个函数或类
2. **集成测试**：测试多个组件的交互
3. **功能测试**：测试完整功能
4. **性能测试**：测试系统性能

### pytest框架

pytest是Python最流行的测试框架：

```python
# test_example.py
def test_addition():
    assert 1 + 1 == 2

def test_string():
    assert "hello".upper() == "HELLO"
```

### 测试覆盖率

使用pytest-cov测量测试覆盖率：

```bash
pytest --cov=myproject --cov-report=html
```

## 案例：完整测试套件

创建一个完整的测试套件，实现：
1. 单元测试编写
2. 集成测试
3. 测试覆盖率报告
4. Mock和桩的使用

## 应用场景

### 1. 代码质量保证
- 回归测试
- 代码审查
- 持续集成

### 2. 开发流程
- 测试驱动开发(TDD)
- 行为驱动开发(BDD)
- 重构支持

### 3. 部署验证
- 冒烟测试
- 验收测试
- 部署后验证

## 代码案例

### 案例1：pytest高级用法

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pytest高级用法示例
功能：演示pytest的各种功能
"""

import pytest

# 被测试的类
class Calculator:
    """计算器类"""
    
    def add(self, a, b):
        """加法"""
        return a + b
    
    def subtract(self, a, b):
        """减法"""
        return a - b
    
    def multiply(self, a, b):
        """乘法"""
        return a * b
    
    def divide(self, a, b):
        """除法"""
        if b == 0:
            raise ValueError("除数不能为零")
        return a / b

# fixture
@pytest.fixture
def calculator():
    """创建计算器实例"""
    return Calculator()

# 基本测试
def test_add(calculator):
    """测试加法"""
    assert calculator.add(1, 2) == 3
    assert calculator.add(-1, 1) == 0
    assert calculator.add(0, 0) == 0

def test_subtract(calculator):
    """测试减法"""
    assert calculator.subtract(5, 3) == 2
    assert calculator.subtract(3, 5) == -2

def test_multiply(calculator):
    """测试乘法"""
    assert calculator.multiply(2, 3) == 6
    assert calculator.multiply(-2, 3) == -6

def test_divide(calculator):
    """测试除法"""
    assert calculator.divide(6, 2) == 3
    assert calculator.divide(5, 2) == 2.5

def test_divide_by_zero(calculator):
    """测试除零异常"""
    with pytest.raises(ValueError, match="除数不能为零"):
        calculator.divide(1, 0)

# 参数化测试
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add_parametrize(calculator, a, b, expected):
    """参数化测试加法"""
    assert calculator.add(a, b) == expected

# 标记测试
@pytest.mark.slow
def test_slow_operation():
    """慢速测试"""
    import time
    time.sleep(2)
    assert True

@pytest.mark.skip(reason="功能尚未实现")
def test_future_feature():
    """跳过的测试"""
    pass

@pytest.mark.skipif(
    not pytest.importorskip("numpy"),
    reason="需要numpy库"
)
def test_numpy_integration():
    """条件跳过的测试"""
    import numpy as np
    assert np.array([1, 2, 3]).sum() == 6

# 测试类
class TestCalculatorAdvanced:
    """高级测试类"""
    
    def test_chaining(self, calculator):
        """测试链式操作"""
        result = calculator.add(1, 2)
        result = calculator.multiply(result, 3)
        assert result == 9
    
    def test_negative_numbers(self, calculator):
        """测试负数"""
        assert calculator.add(-1, -2) == -3
        assert calculator.multiply(-2, -3) == 6

# conftest.py示例
"""
# conftest.py
import pytest

@pytest.fixture(scope="session")
def db_connection():
    """数据库连接fixture"""
    # 创建连接
    conn = create_connection()
    yield conn
    # 清理
    conn.close()

@pytest.fixture(autouse=True)
def setup_teardown():
    """自动执行的setup和teardown"""
    # setup
    print("\nSetup")
    yield
    # teardown
    print("\nTeardown")
"""

if __name__ == "__main__":
    pytest.main([__file__, '-v'])
```

### 案例2：Mock和桩

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mock和桩测试示例
功能：演示如何使用Mock进行测试
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import requests

# 被测试的类
class WeatherService:
    """天气服务"""
    
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.weather.com"
    
    def get_temperature(self, city):
        """获取城市温度"""
        response = requests.get(
            f"{self.base_url}/temperature",
            params={'city': city, 'key': self.api_key}
        )
        data = response.json()
        return data['temperature']
    
    def get_forecast(self, city, days=3):
        """获取天气预报"""
        response = requests.get(
            f"{self.base_url}/forecast",
            params={'city': city, 'days': days, 'key': self.api_key}
        )
        return response.json()

# 使用Mock测试
class TestWeatherService:
    """天气服务测试"""
    
    def test_get_temperature_with_mock(self):
        """使用Mock测试获取温度"""
        # 创建Mock对象
        mock_response = Mock()
        mock_response.json.return_value = {'temperature': 25}
        
        # 使用patch替换requests.get
        with patch('requests.get', return_value=mock_response) as mock_get:
            service = WeatherService('test_key')
            temp = service.get_temperature('Beijing')
            
            # 验证结果
            assert temp == 25
            
            # 验证调用
            mock_get.assert_called_once_with(
                f"https://api.weather.com/temperature",
                params={'city': 'Beijing', 'key': 'test_key'}
            )
    
    def test_get_forecast_with_mock(self):
        """使用Mock测试获取预报"""
        mock_response = Mock()
        mock_response.json.return_value = {
            'forecast': [
                {'day': 1, 'temp': 25},
                {'day': 2, 'temp': 26},
                {'day': 3, 'temp': 24},
            ]
        }
        
        with patch('requests.get', return_value=mock_response):
            service = WeatherService('test_key')
            forecast = service.get_forecast('Beijing', days=3)
            
            assert len(forecast['forecast']) == 3
            assert forecast['forecast'][0]['temp'] == 25
    
    def test_get_temperature_error(self):
        """测试获取温度失败"""
        with patch('requests.get', side_effect=requests.RequestException("网络错误")):
            service = WeatherService('test_key')
            
            with pytest.raises(requests.RequestException):
                service.get_temperature('Beijing')

# 使用MagicMock
class TestWithMagicMock:
    """使用MagicMock测试"""
    
    def test_magic_mock(self):
        """MagicMock示例"""
        mock = MagicMock()
        mock.__len__.return_value = 5
        
        assert len(mock) == 5
        mock.__len__.assert_called_once()

# 使用spec限制Mock
class TestWithSpec:
    """使用spec限制Mock"""
    
    def test_spec(self):
        """spec示例"""
        mock_service = Mock(spec=WeatherService)
        
        # 可以调用存在的方法
        mock_service.get_temperature.return_value = 25
        assert mock_service.get_temperature('Beijing') == 25
        
        # 调用不存在的方法会抛出AttributeError
        with pytest.raises(AttributeError):
            mock_service.non_existent_method()

if __name__ == "__main__":
    pytest.main([__file__, '-v'])
```

### 案例3：测试覆盖率

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试覆盖率示例
功能：演示如何测量和提高测试覆盖率
"""

# 被测试的模块
class StringUtils:
    """字符串工具类"""
    
    @staticmethod
    def reverse(s):
        """反转字符串"""
        return s[::-1]
    
    @staticmethod
    def is_palindrome(s):
        """检查是否为回文"""
        s = s.lower().replace(' ', '')
        return s == s[::-1]
    
    @staticmethod
    def count_words(s):
        """统计单词数"""
        if not s:
            return 0
        return len(s.split())
    
    @staticmethod
    def capitalize_words(s):
        """首字母大写"""
        return ' '.join(word.capitalize() for word in s.split())
    
    @staticmethod
    def truncate(s, max_length, suffix='...'):
        """截断字符串"""
        if len(s) <= max_length:
            return s
        return s[:max_length - len(suffix)] + suffix

# 测试用例
class TestStringUtils:
    """字符串工具测试"""
    
    def test_reverse(self):
        """测试反转"""
        assert StringUtils.reverse('hello') == 'olleh'
        assert StringUtils.reverse('') == ''
        assert StringUtils.reverse('a') == 'a'
    
    def test_is_palindrome(self):
        """测试回文检查"""
        assert StringUtils.is_palindrome('racecar') is True
        assert StringUtils.is_palindrome('A man a plan a canal Panama') is True
        assert StringUtils.is_palindrome('hello') is False
        assert StringUtils.is_palindrome('') is True
    
    def test_count_words(self):
        """测试单词统计"""
        assert StringUtils.count_words('hello world') == 2
        assert StringUtils.count_words('') == 0
        assert StringUtils.count_words('single') == 1
        assert StringUtils.count_words('  spaces  ') == 1
    
    def test_capitalize_words(self):
        """测试首字母大写"""
        assert StringUtils.capitalize_words('hello world') == 'Hello World'
        assert StringUtils.capitalize_words('python') == 'Python'
        assert StringUtils.capitalize_words('') == ''
    
    def test_truncate(self):
        """测试截断"""
        assert StringUtils.truncate('Hello World', 5) == 'He...'
        assert StringUtils.truncate('Hi', 5) == 'Hi'
        assert StringUtils.truncate('Hello World', 5, '...') == 'He...'

# 运行覆盖率测试命令
"""
# 运行测试并生成覆盖率报告
pytest --cov=string_utils --cov-report=term-missing

# 生成HTML报告
pytest --cov=string_utils --cov-report=html

# 查看报告
open htmlcov/index.html
"""

if __name__ == "__main__":
    pytest.main([__file__, '-v', '--cov=.', '--cov-report=term-missing'])
```

## 课后练习

### 练习1：单元测试
1. 为现有项目编写单元测试
2. 达到80%以上的测试覆盖率
3. 使用参数化测试减少重复代码

### 练习2：集成测试
1. 编写数据库集成测试
2. 编写API集成测试
3. 使用fixtures管理测试数据

### 练习3：测试自动化
1. 配置pytest.ini
2. 创建conftest.py
3. 设置测试标记和慢速测试

## 常见问题

### Q1: 何时使用Mock？
A: 当测试依赖外部服务、数据库或复杂对象时使用Mock。

### Q2: 测试覆盖率多少合适？
A: 一般建议80%以上，但更重要的是测试质量而非数量。

### Q3: 如何测试私有方法？
A: 通常不测试私有方法，而是通过公共接口间接测试。

## 下一步学习

完成今天的学习后，建议你：
1. 为项目编写完整的测试套件
2. 配置测试覆盖率报告
3. 将测试集成到CI流程
4. 准备进入Day 9的学习：部署自动化

明天我们将学习如何自动化部署应用。