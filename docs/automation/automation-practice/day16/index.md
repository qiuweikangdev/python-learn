# Day 16: API 接口自动化测试

## 学习目标

完成今天的学习后，你将能够：
- 使用 requests 库进行 HTTP 接口测试
- 结合 pytest 构建接口测试框架
- 实现数据驱动和参数化测试
- 处理接口依赖和认证
- 生成专业的测试报告

## 技术原理

### 接口测试基础

API 接口测试是验证后端服务正确性的重要手段：

```
请求 → 服务器 → 响应 → 断言验证
```

### HTTP 方法

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 获取资源 | 获取用户列表 |
| POST | 创建资源 | 创建新用户 |
| PUT | 更新资源 | 更新用户信息 |
| DELETE | 删除资源 | 删除用户 |

### 测试金字塔

```
        /  E2E  \
       /  集成测试  \
      /   单元测试    \
     ─────────────────
```

## 代码案例

### 案例1：API 测试基础框架

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API测试基础框架
功能：演示如何使用requests和pytest测试REST API
"""

import requests
import pytest
from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class APIResponse:
    """API响应数据类"""
    status_code: int
    data: Dict
    headers: Dict
    elapsed: float


class APIClient:
    """API客户端"""
    
    def __init__(self, base_url: str, timeout: int = 10):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.timeout = timeout
        self.token = None
    
    def set_auth_token(self, token: str):
        """设置认证令牌"""
        self.token = token
        self.session.headers['Authorization'] = f'Bearer {token}'
    
    def request(self, method: str, endpoint: str, **kwargs) -> APIResponse:
        """发送请求"""
        url = f"{self.base_url}{endpoint}"
        kwargs.setdefault('timeout', self.timeout)
        
        response = self.session.request(method, url, **kwargs)
        
        return APIResponse(
            status_code=response.status_code,
            data=response.json() if response.content else {},
            headers=dict(response.headers),
            elapsed=response.elapsed.total_seconds()
        )
    
    def get(self, endpoint: str, params: Optional[Dict] = None) -> APIResponse:
        """GET请求"""
        return self.request('GET', endpoint, params=params)
    
    def post(self, endpoint: str, data: Optional[Dict] = None) -> APIResponse:
        """POST请求"""
        return self.request('API', endpoint, json=data)
    
    def put(self, endpoint: str, data: Optional[Dict] = None) -> APIResponse:
        """PUT请求"""
        return self.request('PUT', endpoint, json=data)
    
    def delete(self, endpoint: str) -> APIResponse:
        """DELETE请求"""
        return self.request('DELETE', endpoint)


@pytest.fixture(scope="session")
def api_client():
    """创建API客户端fixture"""
    client = APIClient("https://jsonplaceholder.typicode.com")
    return client


class TestGetEndpoints:
    """GET接口测试"""
    
    def test_get_posts(self, api_client):
        """测试获取文章列表"""
        response = api_client.get("/posts")
        
        assert response.status_code == 200
        assert isinstance(response.data, list)
        assert len(response.data) > 0
        
        # 验证数据结构
        post = response.data[0]
        assert 'userId' in post
        assert 'id' in post
        assert 'title' in post
        assert 'body' in post
    
    def test_get_single_post(self, api_client):
        """测试获取单篇文章"""
        response = api_client.get("/posts/1")
        
        assert response.status_code == 200
        assert response.data['id'] == 1
        assert response.data['userId'] == 1
    
    def test_get_post_comments(self, api_client):
        """测试获取文章评论"""
        response = api_client.get("/posts/1/comments")
        
        assert response.status_code == 200
        assert isinstance(response.data, list)
        assert len(response.data) > 0
        
        # 验证评论属于该文章
        for comment in response.data:
            assert comment['postId'] == 1
    
    def test_get_users(self, api_client):
        """测试获取用户列表"""
        response = api_client.get("/users")
        
        assert response.status_code == 200
        assert len(response.data) == 10  # JSONPlaceholder有10个用户
        
        # 验证用户数据结构
        user = response.data[0]
        assert 'name' in user
        assert 'email' in user
        assert 'username' in user


class TestPostEndpoints:
    """POST接口测试"""
    
    def test_create_post(self, api_client):
        """测试创建文章"""
        new_post = {
            'title': '测试文章',
            'body': '这是测试内容',
            'userId': 1
        }
        
        response = api_client.post("/posts", data=new_post)
        
        assert response.status_code == 201
        assert response.data['title'] == new_post['title']
        assert response.data['body'] == new_post['body']
        assert response.data['userId'] == new_post['userId']
        assert 'id' in response.data
    
    def test_create_post_with_invalid_data(self, api_client):
        """测试使用无效数据创建文章"""
        invalid_post = {
            'title': '',  # 空标题
        }
        
        response = api_client.post("/posts", data=invalid_post)
        
        # JSONPlaceholder不会真正验证，实际项目中应返回400
        assert response.status_code == 201


class TestResponsePerformance:
    """响应性能测试"""
    
    def test_response_time(self, api_client):
        """测试响应时间"""
        response = api_client.get("/posts")
        
        assert response.status_code == 200
        assert response.elapsed < 2.0  # 响应时间应小于2秒
    
    def test_concurrent_requests(self, api_client):
        """测试并发请求"""
        import concurrent.futures
        
        def make_request():
            return api_client.get("/posts/1")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(5)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # 所有请求都应成功
        for result in results:
            assert result.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
```

### 案例2：数据驱动测试

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据驱动测试
功能：使用参数化测试多组数据
"""

import pytest
import requests
from typing import List, Tuple


class TestDataDrivenTests:
    """数据驱动测试类"""
    
    @pytest.mark.parametrize("post_id,expected_user_id", [
        (1, 1),
        (2, 2),
        (3, 3),
        (10, 1),
        (50, 5),
        (100, 10),
    ])
    def test_post_user_id(self, post_id: int, expected_user_id: int):
        """参数化测试文章用户ID"""
        response = requests.get(
            f"https://jsonplaceholder.typicode.com/posts/{post_id}"
        )
        
        assert response.status_code == 200
        assert response.json()['userId'] == expected_user_id
    
    @pytest.mark.parametrize("user_id,expected_email", [
        (1, "Sincere@april.biz"),
        (2, "Shanna@melissa.tv"),
        (3, "Nathan@yesenia.net"),
    ])
    def test_user_email(self, user_id: int, expected_email: str):
        """参数化测试用户邮箱"""
        response = requests.get(
            f"https://jsonplaceholder.typicode.com/users/{user_id}"
        )
        
        assert response.status_code == 200
        assert response.json()['email'] == expected_email
    
    @pytest.mark.parametrize("endpoint,expected_status", [
        ("/posts", 200),
        ("/users", 200),
        ("/comments", 200),
        ("/albums", 200),
        ("/todos", 200),
        ("/nonexistent", 404),
    ])
    def test_endpoint_status(self, endpoint: str, expected_status: int):
        """参数化测试端点状态码"""
        response = requests.get(
            f"https://jsonplaceholder.typicode.com{endpoint}"
        )
        
        assert response.status_code == expected_status
    
    @pytest.mark.parametrize("query_params,expected_count", [
        ({"userId": 1}, 10),
        ({"userId": 2}, 10),
        ({"userId": 3}, 10),
    ])
    def test_filtered_posts(self, query_params: dict, expected_count: int):
        """参数化测试筛选结果"""
        response = requests.get(
            "https://jsonplaceholder.typicode.com/posts",
            params=query_params
        )
        
        assert response.status_code == 200
        assert len(response.json()) == expected_count


# 使用fixture的参数化测试
@pytest.fixture(params=[
    {"id": 1, "name": "Leanne Graham"},
    {"id": 2, "name": "Ervin Howell"},
    {"id": 3, "name": "Clementine Bauch"},
])
def user_data(request):
    """用户数据fixture"""
    return request.param


def test_user_details(user_data):
    """测试用户详情"""
    response = requests.get(
        f"https://jsonplaceholder.typicode.com/users/{user_data['id']}"
    )
    
    assert response.status_code == 200
    assert response.json()['name'] == user_data['name']


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
```

### 案例3：接口测试框架

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
接口测试框架
功能：完整的API测试框架设计
"""

import pytest
import requests
import json
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict


@dataclass
class TestConfig:
    """测试配置"""
    base_url: str = "https://jsonplaceholder.typicode.com"
    timeout: int = 10
    retry_count: int = 3


class APIValidator:
    """API验证器"""
    
    @staticmethod
    def validate_status_code(response: requests.Response, expected: int):
        """验证状态码"""
        assert response.status_code == expected, \
            f"状态码不匹配: 期望{expected}, 实际{response.status_code}"
    
    @staticmethod
    def validate_json_structure(data: dict, required_fields: list):
        """验证JSON结构"""
        for field in required_fields:
            assert field in data, f"缺少必需字段: {field}"
    
    @staticmethod
    def validate_response_time(response: requests.Response, max_seconds: float):
        """验证响应时间"""
        assert response.elapsed.total_seconds() < max_seconds, \
            f"响应时间过长: {response.elapsed.total_seconds()}s > {max_seconds}s"
    
    @staticmethod
    def validate_list_response(data: list, min_length: int = 0, max_length: int = None):
        """验证列表响应"""
        assert isinstance(data, list), "响应不是列表"
        assert len(data) >= min_length, f"列表长度不足: {len(data)} < {min_length}"
        if max_length:
            assert len(data) <= max_length, f"列表长度超限: {len(data)} > {max_length}"


class APITestCase:
    """API测试用例基类"""
    
    def __init__(self):
        self.config = TestConfig()
        self.session = requests.Session()
        self.validator = APIValidator()
    
    def setup_method(self):
        """每个测试方法前执行"""
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'APITestFramework/1.0'
        })
    
    def teardown_method(self):
        """每个测试方法后执行"""
        self.session.close()
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """发送请求"""
        url = f"{self.config.base_url}{endpoint}"
        return self.session.request(method, url, timeout=self.config.timeout, **kwargs)


class TestUserAPI(APITestCase):
    """用户API测试"""
    
    def test_get_all_users(self):
        """测试获取所有用户"""
        response = self.make_request('GET', '/users')
        
        self.validator.validate_status_code(response, 200)
        self.validator.validate_response_time(response, 2.0)
        
        data = response.json()
        self.validator.validate_list_response(data, min_length=1)
        
        # 验证用户结构
        user = data[0]
        self.validator.validate_json_structure(user, ['id', 'name', 'email', 'username'])
    
    def test_get_user_by_id(self):
        """测试根据ID获取用户"""
        response = self.make_request('GET', '/users/1')
        
        self.validator.validate_status_code(response, 200)
        
        data = response.json()
        self.validator.validate_json_structure(data, ['id', 'name', 'email'])
        assert data['id'] == 1
    
    def test_get_user_posts(self):
        """测试获取用户的文章"""
        response = self.make_request('GET', '/users/1/posts')
        
        self.validator.validate_status_code(response, 200)
        
        data = response.json()
        self.validator.validate_list_response(data, min_length=1)
        
        # 验证所有文章属于该用户
        for post in data:
            assert post['userId'] == 1


class TestPostAPI(APITestCase):
    """文章API测试"""
    
    def test_create_post(self):
        """测试创建文章"""
        payload = {
            'title': '自动化测试文章',
            'body': '这是通过API测试框架创建的文章',
            'userId': 1
        }
        
        response = self.make_request('POST', '/posts', json=payload)
        
        self.validator.validate_status_code(response, 201)
        
        data = response.json()
        self.validator.validate_json_structure(data, ['id', 'title', 'body', 'userId'])
        assert data['title'] == payload['title']
    
    def test_update_post(self):
        """测试更新文章"""
        payload = {
            'title': '更新后的标题',
            'body': '更新后的内容',
            'userId': 1
        }
        
        response = self.make_request('PUT', '/posts/1', json=payload)
        
        self.validator.validate_status_code(response, 200)
        
        data = response.json()
        assert data['title'] == payload['title']
    
    def test_delete_post(self):
        """测试删除文章"""
        response = self.make_request('DELETE', '/posts/1')
        
        self.validator.validate_status_code(response, 200)


class TestCommentAPI(APITestCase):
    """评论API测试"""
    
    def test_get_comments_by_post(self):
        """测试获取文章评论"""
        response = self.make_request('GET', '/posts/1/comments')
        
        self.validator.validate_status_code(response, 200)
        
        data = response.json()
        self.validator.validate_list_response(data, min_length=1)
        
        # 验证评论结构
        comment = data[0]
        self.validator.validate_json_structure(
            comment, ['postId', 'id', 'name', 'email', 'body']
        )
    
    def test_create_comment(self):
        """测试创建评论"""
        payload = {
            'postId': 1,
            'name': '测试评论',
            'email': 'test@example.com',
            'body': '这是测试评论内容'
        }
        
        response = self.make_request('POST', '/comments', json=payload)
        
        self.validator.validate_status_code(response, 201)
        
        data = response.json()
        assert data['postId'] == payload['postId']


# 测试报告生成
class TestReportGenerator:
    """测试报告生成器"""
    
    @staticmethod
    def generate_summary(test_results: list) -> dict:
        """生成测试摘要"""
        total = len(test_results)
        passed = sum(1 for r in test_results if r['status'] == 'passed')
        failed = sum(1 for r in test_results if r['status'] == 'failed')
        error = sum(1 for r in test_results if r['status'] == 'error')
        
        return {
            'total': total,
            'passed': passed,
            'failed': failed,
            'error': error,
            'pass_rate': f"{(passed / total * 100):.2f}%" if total > 0 else "0%",
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def save_report(results: dict, filename: str):
        """保存测试报告"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"测试报告已保存: {filename}")


if __name__ == "__main__":
    pytest.main([__file__, '-v', '--tb=short'])
```

### 案例4：接口依赖处理

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
接口依赖处理
功能：处理接口之间的依赖关系
"""

import pytest
import requests
from typing import Dict, Any


class DependentAPITest:
    """有依赖关系的API测试"""
    
    def __init__(self):
        self.base_url = "https://jsonplaceholder.typicode.com"
        self.shared_data: Dict[str, Any] = {}
    
    def test_step1_create_post(self):
        """步骤1：创建文章"""
        payload = {
            'title': '依赖测试文章',
            'body': '用于测试接口依赖',
            'userId': 1
        }
        
        response = requests.post(
            f"{self.base_url}/posts",
            json=payload
        )
        
        assert response.status_code == 201
        
        # 保存创建的文章ID供后续测试使用
        self.shared_data['post_id'] = response.json()['id']
        self.shared_data['post_title'] = response.json()['title']
    
    def test_step2_get_created_post(self):
        """步骤2：获取创建的文章"""
        # 使用步骤1创建的文章ID
        post_id = self.shared_data.get('post_id', 1)
        
        response = requests.get(f"{self.base_url}/posts/{post_id}")
        
        assert response.status_code == 200
        assert response.json()['title'] == self.shared_data['post_title']
    
    def test_step3_update_post(self):
        """步骤3：更新文章"""
        post_id = self.shared_data.get('post_id', 1)
        
        payload = {
            'title': '更新后的标题',
            'body': '更新后的内容',
            'userId': 1
        }
        
        response = requests.put(
            f"{self.base_url}/posts/{post_id}",
            json=payload
        )
        
        assert response.status_code == 200
        assert response.json()['title'] == payload['title']
    
    def test_step4_delete_post(self):
        """步骤4：删除文章"""
        post_id = self.shared_data.get('post_id', 1)
        
        response = requests.delete(f"{self.base_url}/posts/{post_id}")
        
        assert response.status_code == 200


class TestAPIChaining:
    """接口链式调用测试"""
    
    def __init__(self):
        self.base_url = "https://jsonplaceholder.typicode.com"
    
    def test_user_post_comments_chain(self):
        """测试用户-文章-评论链式调用"""
        # 1. 获取用户
        user_response = requests.get(f"{self.base_url}/users/1")
        assert user_response.status_code == 200
        user = user_response.json()
        
        # 2. 获取用户的文章
        posts_response = requests.get(
            f"{self.base_url}/posts",
            params={'userId': user['id']}
        )
        assert posts_response.status_code == 200
        posts = posts_response.json()
        assert len(posts) > 0
        
        # 3. 获取第一篇文章的评论
        first_post = posts[0]
        comments_response = requests.get(
            f"{self.base_url}/posts/{first_post['id']}/comments"
        )
        assert comments_response.status_code == 200
        comments = comments_response.json()
        
        # 4. 验证评论属于该文章
        for comment in comments:
            assert comment['postId'] == first_post['id']
        
        print(f"用户 {user['name']} 有 {len(posts)} 篇文章")
        print(f"第一篇文章有 {len(comments)} 条评论")


# 使用fixture管理测试数据
class TestWithFixtures:
    """使用fixture的测试"""
    
    @pytest.fixture(scope="class")
    def api_session(self):
        """创建API会话"""
        session = requests.Session()
        session.headers.update({
            'Content-Type': 'application/json'
        })
        yield session
        session.close()
    
    @pytest.fixture(scope="class")
    def test_data(self, api_session):
        """创建测试数据"""
        base_url = "https://jsonplaceholder.typicode.com"
        
        # 创建文章
        post_data = {
            'title': 'Fixture测试文章',
            'body': '通过fixture创建',
            'userId': 1
        }
        post_response = api_session.post(f"{base_url}/posts", json=post_data)
        post_id = post_response.json()['id']
        
        yield {
            'base_url': base_url,
            'post_id': post_id,
            'post_data': post_data
        }
        
        # 清理测试数据
        api_session.delete(f"{base_url}/posts/{post_id}")
    
    def test_with_fixture_data(self, api_session, test_data):
        """使用fixture数据的测试"""
        response = api_session.get(
            f"{test_data['base_url']}/posts/{test_data['post_id']}"
        )
        
        assert response.status_code == 200
        assert response.json()['title'] == test_data['post_data']['title']


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
```

## 课后练习

### 练习1：基础接口测试
1. 为一个公开API编写完整的测试套件
2. 覆盖GET、POST、PUT、DELETE操作
3. 验证响应结构和数据类型

### 练习2：数据驱动测试
1. 设计至少10组测试数据
2. 测试边界条件和异常情况
3. 生成测试数据报告

### 练习3：接口测试框架
1. 封装可复用的测试工具类
2. 实现测试报告生成
3. 集成到CI/CD流程

## 常见问题

### Q1: 如何处理接口认证？
A: 使用session管理token，或在header中添加认证信息。

### Q2: 如何测试需要登录的接口？
A: 先调用登录接口获取token，然后在后续请求中携带token。

### Q3: 如何处理接口依赖？
A: 使用fixture或类变量共享数据，确保测试顺序正确。

## 下一步学习

完成今天的学习后，建议你：
1. 为自己的项目编写API测试
2. 搭建完整的测试框架
3. 准备进入Day 17的学习：性能测试与压测

明天我们将学习如何进行接口性能测试和压测。
