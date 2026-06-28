# Day 20: 企业级自动化测试实战

## 学习目标

完成今天的学习后，你将能够：
- 设计完整的企业级测试项目架构
- 实现测试配置管理和数据驱动
- 集成CI/CD持续集成流程
- 生成专业的测试报告

## 技术原理

### 测试金字塔

```
           /  E2E  \
          /  集成测试  \
         /   单元测试    \
        ─────────────────
```

### 企业级测试架构

```
project/
├── tests/
│   ├── unit/           # 单元测试
│   ├── integration/    # 集成测试
│   ├── api/            # API测试
│   ├── ui/             # UI测试
│   └── performance/    # 性能测试
├── conftest.py         # pytest配置
├── pytest.ini          # pytest配置
├── requirements.txt    # 依赖
└── reports/            # 测试报告
```

## 代码案例

### 案例1：项目结构设计

```python
# conftest.py
"""
pytest全局配置
功能：定义全局fixture和配置
"""

import pytest
import json
from pathlib import Path
from typing import Dict, Any
from datetime import datetime


# 项目根目录
ROOT_DIR = Path(__file__).parent
CONFIG_DIR = ROOT_DIR / "config"
DATA_DIR = ROOT_DIR / "data"
REPORT_DIR = ROOT_DIR / "reports"


@pytest.fixture(scope="session")
def config() -> Dict[str, Any]:
    """加载测试配置"""
    config_file = CONFIG_DIR / "test_config.json"
    
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # 默认配置
    return {
        'environment': 'test',
        'base_url': 'https://jsonplaceholder.typicode.com',
        'timeout': 30,
        'retry_count': 3
    }


@pytest.fixture(scope="session")
def test_data() -> Dict[str, Any]:
    """加载测试数据"""
    data_file = DATA_DIR / "test_data.json"
    
    if data_file.exists():
        with open(data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    return {}


@pytest.fixture(scope="function")
def test_name(request):
    """获取测试名称"""
    return request.node.name


@pytest.fixture(scope="function")
def test_timestamp():
    """获取测试时间戳"""
    return datetime.now().strftime("%Y%m%d_%H%M%S")


@pytest.fixture(scope="session", autouse=True)
def setup_report_dir():
    """创建报告目录"""
    REPORT_DIR.mkdir(exist_ok=True)
    yield
    print(f"\n测试报告目录: {REPORT_DIR}")


# pytest配置
def pytest_configure(config):
    """pytest配置钩子"""
    # 添加自定义标记
    config.addinivalue_line("markers", "smoke: 冒烟测试")
    config.addinivalue_line("markers", "regression: 回归测试")
    config.addinivalue_line("markers", "slow: 慢速测试")


def pytest_collection_modifyitems(items):
    """修改测试收集"""
    # 为慢速测试添加标记
    for item in items:
        if "slow" in item.nodeid:
            item.add_marker(pytest.mark.slow)
```

```ini
# pytest.ini
[pytest]
# 测试路径
testpaths = tests

# 命令行参数
addopts = 
    -v
    --tb=short
    --strict-markers
    -m "not slow"

# 标记
markers =
    smoke: 冒烟测试
    regression: 回归测试
    slow: 慢速测试

# 日志
log_cli = true
log_cli_level = INFO
log_cli_format = %(asctime)s [%(levelname)8s] %(message)s (%(filename)s:%(lineno)s)
log_cli_date_format = %Y-%m-%d %H:%M:%S

# 报告
junitxml = reports/test-results.xml
```

### 案例2：API 测试框架

```python
# tests/api/test_posts.py
"""
API测试用例
功能：测试文章相关API
"""

import pytest
import requests
from typing import Dict, List


class TestPostsAPI:
    """文章API测试"""
    
    @pytest.fixture(autouse=True)
    def setup(self, config):
        """初始化"""
        self.base_url = config['base_url']
        self.timeout = config['timeout']
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })
    
    def teardown_method(self):
        """清理"""
        self.session.close()
    
    @pytest.mark.smoke
    def test_get_all_posts(self):
        """测试获取所有文章"""
        response = self.session.get(
            f"{self.base_url}/posts",
            timeout=self.timeout
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # 验证数据结构
        post = data[0]
        assert 'userId' in post
        assert 'id' in post
        assert 'title' in post
        assert 'body' in post
    
    @pytest.mark.smoke
    def test_get_post_by_id(self):
        """测试根据ID获取文章"""
        post_id = 1
        
        response = self.session.get(
            f"{self.base_url}/posts/{post_id}",
            timeout=self.timeout
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data['id'] == post_id
        assert 'title' in data
        assert 'body' in data
    
    @pytest.mark.regression
    @pytest.mark.parametrize("post_id", [1, 2, 3, 5, 10])
    def test_get_multiple_posts(self, post_id: int):
        """参数化测试多篇文章"""
        response = self.session.get(
            f"{self.base_url}/posts/{post_id}",
            timeout=self.timeout
        )
        
        assert response.status_code == 200
        assert response.json()['id'] == post_id
    
    @pytest.mark.regression
    def test_create_post(self):
        """测试创建文章"""
        payload = {
            'title': '测试文章',
            'body': '测试内容',
            'userId': 1
        }
        
        response = self.session.post(
            f"{self.base_url}/posts",
            json=payload,
            timeout=self.timeout
        )
        
        assert response.status_code == 201
        
        data = response.json()
        assert data['title'] == payload['title']
        assert data['body'] == payload['body']
        assert 'id' in data
    
    @pytest.mark.regression
    def test_update_post(self):
        """测试更新文章"""
        post_id = 1
        payload = {
            'title': '更新后的标题',
            'body': '更新后的内容',
            'userId': 1
        }
        
        response = self.session.put(
            f"{self.base_url}/posts/{post_id}",
            json=payload,
            timeout=self.timeout
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == payload['title']
    
    @pytest.mark.regression
    def test_delete_post(self):
        """测试删除文章"""
        post_id = 1
        
        response = self.session.delete(
            f"{self.base_url}/posts/{post_id}",
            timeout=self.timeout
        )
        
        assert response.status_code == 200
    
    def test_get_post_comments(self):
        """测试获取文章评论"""
        post_id = 1
        
        response = self.session.get(
            f"{self.base_url}/posts/{post_id}/comments",
            timeout=self.timeout
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # 验证评论属于该文章
        for comment in data:
            assert comment['postId'] == post_id
    
    def test_filter_posts_by_user(self):
        """测试按用户筛选文章"""
        user_id = 1
        
        response = self.session.get(
            f"{self.base_url}/posts",
            params={'userId': user_id},
            timeout=self.timeout
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert all(post['userId'] == user_id for post in data)


class TestPostsAPIEdgeCases:
    """API边界条件测试"""
    
    @pytest.fixture(autouse=True)
    def setup(self, config):
        self.base_url = config['base_url']
        self.timeout = config['timeout']
    
    def test_get_nonexistent_post(self):
        """测试获取不存在的文章"""
        response = requests.get(
            f"{self.base_url}/posts/99999",
            timeout=self.timeout
        )
        
        assert response.status_code == 404
    
    def test_create_post_invalid_data(self):
        """测试使用无效数据创建文章"""
        payload = {}  # 空数据
        
        response = requests.post(
            f"{self.base_url}/posts",
            json=payload,
            timeout=self.timeout
        )
        
        # JSONPlaceholder不会验证，实际项目应返回400
        assert response.status_code == 201


# tests/api/conftest.py
"""
API测试配置
"""

import pytest
import requests


@pytest.fixture(scope="session")
def api_client(config):
    """创建API客户端"""
    class APIClient:
        def __init__(self, base_url: str, timeout: int = 10):
            self.base_url = base_url
            self.session = requests.Session()
            self.timeout = timeout
        
        def get(self, endpoint: str, **kwargs):
            return self.session.get(
                f"{self.base_url}{endpoint}",
                timeout=self.timeout,
                **kwargs
            )
        
        def post(self, endpoint: str, **kwargs):
            return self.session.post(
                f"{self.base_url}{endpoint}",
                timeout=self.timeout,
                **kwargs
            )
        
        def put(self, endpoint: str, **kwargs):
            return self.session.put(
                f"{self.base_url}{endpoint}",
                timeout=self.timeout,
                **kwargs
            )
        
        def delete(self, endpoint: str, **kwargs):
            return self.session.delete(
                f"{self.base_url}{endpoint}",
                timeout=self.timeout,
                **kwargs
            )
        
        def close(self):
            self.session.close()
    
    client = APIClient(config['base_url'], config['timeout'])
    yield client
    client.close()
```

### 案例3：测试配置管理

```python
# config/test_config.json
"""
测试配置文件
"""

{
    "environment": "test",
    "base_url": "https://jsonplaceholder.typicode.com",
    "timeout": 30,
    "retry_count": 3,
    "browser": {
        "type": "chromium",
        "headless": true,
        "viewport": {
            "width": 1920,
            "height": 1080
        }
    },
    "database": {
        "host": "localhost",
        "port": 5432,
        "name": "test_db"
    },
    "report": {
        "format": "html",
        "output_dir": "reports"
    }
}
```

```python
# config/__init__.py
"""
配置管理模块
"""

import json
from pathlib import Path
from typing import Any, Optional
from dataclasses import dataclass
import os


@dataclass
class BrowserConfig:
    """浏览器配置"""
    type: str = "chromium"
    headless: bool = True
    viewport_width: int = 1920
    viewport_height: int = 1080


@dataclass
class DatabaseConfig:
    """数据库配置"""
    host: str = "localhost"
    port: int = 5432
    name: str = "test_db"
    user: str = ""
    password: str = ""


class TestConfig:
    """测试配置管理器"""
    
    _instance = None
    _config = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def load(self, config_path: str = None):
        """加载配置"""
        if config_path is None:
            config_path = Path(__file__).parent / "test_config.json"
        
        with open(config_path, 'r', encoding='utf-8') as f:
            self._config = json.load(f)
        
        # 环境变量覆盖
        self._apply_env_overrides()
        
        return self
    
    def _apply_env_overrides(self):
        """应用环境变量覆盖"""
        env_mappings = {
            'TEST_BASE_URL': 'base_url',
            'TEST_TIMEOUT': 'timeout',
            'TEST_ENVIRONMENT': 'environment'
        }
        
        for env_key, config_key in env_mappings.items():
            env_value = os.getenv(env_key)
            if env_value:
                # 类型转换
                if config_key == 'timeout':
                    self._config[config_key] = int(env_value)
                else:
                    self._config[config_key] = env_value
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取配置项"""
        if self._config is None:
            self.load()
        return self._config.get(key, default)
    
    @property
    def base_url(self) -> str:
        return self.get('base_url', 'https://jsonplaceholder.typicode.com')
    
    @property
    def timeout(self) -> int:
        return self.get('timeout', 30)
    
    @property
    def environment(self) -> str:
        return self.get('environment', 'test')
    
    @property
    def browser(self) -> BrowserConfig:
        browser_data = self.get('browser', {})
        return BrowserConfig(
            type=browser_data.get('type', 'chromium'),
            headless=browser_data.get('headless', True),
            viewport_width=browser_data.get('viewport', {}).get('width', 1920),
            viewport_height=browser_data.get('viewport', {}).get('height', 1080)
        )
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return self._config or {}


# 全局配置实例
config = TestConfig()
```

### 案例4：测试报告生成

```python
# reports/report_generator.py
"""
测试报告生成器
功能：生成HTML和JSON格式的测试报告
"""

import json
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path
from dataclasses import dataclass, asdict


@dataclass
class TestCaseResult:
    """测试用例结果"""
    name: str
    status: str  # passed, failed, error, skipped
    duration: float
    message: str = ""
    traceback: str = ""


@dataclass
class TestSuiteResult:
    """测试套件结果"""
    name: str
    tests: List[TestCaseResult]
    start_time: str
    end_time: str
    duration: float
    
    @property
    def total(self) -> int:
        return len(self.tests)
    
    @property
    def passed(self) -> int:
        return sum(1 for t in self.tests if t.status == 'passed')
    
    @property
    def failed(self) -> int:
        return sum(1 for t in self.tests if t.status == 'failed')
    
    @property
    def error(self) -> int:
        return sum(1 for t in self.tests if t.status == 'error')
    
    @property
    def skipped(self) -> int:
        return sum(1 for t in self.tests if t.status == 'skipped')
    
    @property
    def pass_rate(self) -> str:
        if self.total == 0:
            return "0%"
        return f"{(self.passed / self.total * 100):.1f}%"


class ReportGenerator:
    """测试报告生成器"""
    
    def __init__(self, output_dir: str = "reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def generate_json_report(self, suite: TestSuiteResult, 
                           filename: str = None) -> str:
        """生成JSON报告"""
        if filename is None:
            filename = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        filepath = self.output_dir / filename
        
        report_data = {
            'summary': {
                'total': suite.total,
                'passed': suite.passed,
                'failed': suite.failed,
                'error': suite.error,
                'skipped': suite.skipped,
                'pass_rate': suite.pass_rate,
                'duration': f"{suite.duration:.2f}s"
            },
            'start_time': suite.start_time,
            'end_time': suite.end_time,
            'tests': [asdict(t) for t in suite.tests]
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"JSON报告已生成: {filepath}")
        return str(filepath)
    
    def generate_html_report(self, suite: TestSuiteResult,
                           filename: str = None) -> str:
        """生成HTML报告"""
        if filename is None:
            filename = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        
        filepath = self.output_dir / filename
        
        html_content = self._generate_html_content(suite)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"HTML报告已生成: {filepath}")
        return str(filepath)
    
    def _generate_html_content(self, suite: TestSuiteResult) -> str:
        """生成HTML内容"""
        test_rows = ""
        for test in suite.tests:
            status_class = f"status-{test.status}"
            test_rows += f"""
            <tr>
                <td>{test.name}</td>
                <td class="{status_class}">{test.status.upper()}</td>
                <td>{test.duration:.3f}s</td>
                <td>{test.message}</td>
            </tr>
            """
        
        return f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试报告</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
        }}
        .summary {{
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 20px;
            padding: 30px;
        }}
        .summary-item {{
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }}
        .summary-item h3 {{
            margin: 0;
            font-size: 2em;
            color: #333;
        }}
        .summary-item p {{
            margin: 5px 0 0;
            color: #666;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 0 30px 30px;
            width: calc(100% - 60px);
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }}
        th {{
            background: #f8f9fa;
            font-weight: 600;
        }}
        .status-passed {{ color: #28a745; font-weight: bold; }}
        .status-failed {{ color: #dc3545; font-weight: bold; }}
        .status-error {{ color: #fd7e14; font-weight: bold; }}
        .status-skipped {{ color: #6c757d; font-weight: bold; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>自动化测试报告</h1>
            <p>生成时间: {suite.end_time}</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <h3>{suite.total}</h3>
                <p>总用例数</p>
            </div>
            <div class="summary-item">
                <h3 style="color: #28a745">{suite.passed}</h3>
                <p>通过</p>
            </div>
            <div class="summary-item">
                <h3 style="color: #dc3545">{suite.failed}</h3>
                <p>失败</p>
            </div>
            <div class="summary-item">
                <h3 style="color: #fd7e14">{suite.error}</h3>
                <p>错误</p>
            </div>
            <div class="summary-item">
                <h3>{suite.pass_rate}</h3>
                <p>通过率</p>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>测试用例</th>
                    <th>状态</th>
                    <th>耗时</th>
                    <th>信息</th>
                </tr>
            </thead>
            <tbody>
                {test_rows}
            </tbody>
        </table>
    </div>
</body>
</html>
"""


def demo_report_generation():
    """演示报告生成"""
    # 创建测试结果
    tests = [
        TestCaseResult("test_get_posts", "passed", 0.123),
        TestCaseResult("test_create_post", "passed", 0.234),
        TestCaseResult("test_update_post", "passed", 0.156),
        TestCaseResult("test_delete_post", "failed", 0.089, "状态码不匹配"),
        TestCaseResult("test_get_comments", "passed", 0.167),
    ]
    
    suite = TestSuiteResult(
        name="API测试套件",
        tests=tests,
        start_time=datetime.now().isoformat(),
        end_time=datetime.now().isoformat(),
        duration=0.769
    )
    
    # 生成报告
    generator = ReportGenerator("reports")
    json_path = generator.generate_json_report(suite)
    html_path = generator.generate_html_report(suite)
    
    print(f"\n测试摘要:")
    print(f"  总用例: {suite.total}")
    print(f"  通过: {suite.passed}")
    print(f"  失败: {suite.failed}")
    print(f"  通过率: {suite.pass_rate}")


if __name__ == "__main__":
    demo_report_generation()
```

### 案例5：CI/CD 集成

```yaml
# .github/workflows/test.yml
"""
GitHub Actions测试工作流
"""

name: 自动化测试

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        python-version: [3.9, 3.10, 3.11]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: 设置Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: 安装依赖
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest pytest-cov pytest-html
    
    - name: 运行单元测试
      run: |
        pytest tests/unit/ -v --cov=src --cov-report=xml
    
    - name: 运行API测试
      run: |
        pytest tests/api/ -v --html=reports/api-report.html
    
    - name: 上传测试报告
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-reports
        path: reports/
    
    - name: 上传覆盖率报告
      uses: codecov/codecov-action@v3
      if: always()
      with:
        file: ./coverage.xml
```

```txt
# requirements.txt
# 测试依赖
pytest>=7.0.0
pytest-cov>=4.0.0
pytest-html>=3.2.0
pytest-ordering>=0.6
pytest-xdist>=3.0.0

# API测试
requests>=2.28.0
httpx>=0.24.0

# 压测
locust>=2.13.0

# UI测试
playwright>=1.40.0
selenium>=4.10.0

# 报告
jinja2>=3.1.0
```

## 课后练习

### 练习1：项目架构
1. 设计一个完整的测试项目结构
2. 实现配置管理模块
3. 编写测试数据管理

### 练习2：测试套件
1. 编写至少10个测试用例
2. 实现数据驱动测试
3. 添加测试标记和筛选

### 练习3：CI/CD集成
1. 配置GitHub Actions工作流
2. 实现自动化测试执行
3. 集成测试报告生成

## 常见问题

### Q1: 如何组织测试用例？
A: 按功能模块组织，使用测试类分组，遵循Arrange-Act-Assert模式。

### Q2: 如何管理测试数据？
A: 使用JSON/YAML文件存储，通过fixture加载，支持环境切换。

### Q3: 如何提高测试执行速度？
A: 使用pytest-xdist并行执行，优化测试依赖，减少I/O操作。

## 总结

恭喜你完成了Python自动化系列的全部学习！

### 学习成果

通过20天的学习，你已经掌握了：

1. **基础自动化**：Python脚本、文件处理、系统任务
2. **进阶自动化**：日志记录、测试、部署、CI/CD
3. **实战自动化**：监控告警、日志分析、AI自动化、网页自动化、爬虫
4. **API测试**：接口自动化测试框架
5. **性能测试**：压测和性能分析
6. **UI测试**：Playwright和Selenium
7. **脚本自动化**：文件批处理、办公自动化
8. **企业级实践**：完整测试项目架构

### 下一步建议

1. **项目实践**：将所学应用到实际项目
2. **深入学习**：选择感兴趣的领域深入研究
3. **社区参与**：参与开源项目，分享经验
4. **持续学习**：关注新技术，保持学习

### 推荐资源

- [pytest官方文档](https://docs.pytest.org/)
- [Playwright文档](https://playwright.dev/python/)
- [Selenium文档](https://www.selenium.dev/)
- [Locust文档](https://docs.locust.io/)

祝你在自动化的道路上越走越远！
