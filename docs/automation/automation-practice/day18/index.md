# Day 18: 前端 UI 自动化测试

## 学习目标

完成今天的学习后，你将能够：
- 使用 Playwright 进行现代前端自动化测试
- 掌握 Selenium 进阶用法
- 实现页面对象模式 (Page Object Model)
- 进行跨浏览器测试和视觉回归测试

## 技术原理

### Playwright vs Selenium

| 特性 | Playwright | Selenium |
|------|-----------|----------|
| 速度 | 快 | 较慢 |
| 安装 | 简单 | 需要驱动 |
| 浏览器 | Chromium/Firefox/WebKit | 所有主流 |
| 自动等待 | 内置 | 需手动处理 |
| 网络拦截 | 支持 | 有限 |

### 页面对象模式

```
测试用例 → 页面对象 → 元素定位
                ↓
            业务方法
```

## 代码案例

### 案例1：Playwright 基础用法

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Playwright基础用法
功能：演示Playwright的基本操作
"""

from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext
import pytest
from typing import Optional


class PlaywrightTest:
    """Playwright测试类"""
    
    def __init__(self):
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
    
    def setup(self, headless: bool = True):
        """初始化浏览器"""
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=headless)
        self.context = self.browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
        )
        self.page = self.context.new_page()
    
    def teardown(self):
        """关闭浏览器"""
        if self.context:
            self.context.close()
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
    
    def navigate(self, url: str):
        """导航到页面"""
        self.page.goto(url)
        print(f"已导航到: {url}")
    
    def click(self, selector: str):
        """点击元素"""
        self.page.click(selector)
        print(f"已点击: {selector}")
    
    def fill(self, selector: str, value: str):
        """填写表单"""
        self.page.fill(selector, value)
        print(f"已填写: {selector} = {value}")
    
    def get_text(self, selector: str) -> str:
        """获取文本"""
        return self.page.text_content(selector)
    
    def screenshot(self, filename: str):
        """截图"""
        self.page.screenshot(path=filename)
        print(f"截图已保存: {filename}")


class TestPlaywrightBasic:
    """Playwright基础测试"""
    
    def setup_method(self):
        """每个测试方法前执行"""
        self.test = PlaywrightTest()
        self.test.setup(headless=True)
    
    def teardown_method(self):
        """每个测试方法后执行"""
        self.test.teardown()
    
    def test_page_navigation(self):
        """测试页面导航"""
        self.test.navigate("https://example.com")
        
        # 验证页面标题
        assert "Example" in self.test.page.title()
        
        # 验证页面内容
        content = self.test.page.text_content("h1")
        assert "Example Domain" in content
    
    def test_page_elements(self):
        """测试页面元素"""
        self.test.navigate("https://example.com")
        
        # 检查元素存在
        assert self.test.page.locator("h1").is_visible()
        assert self.test.page.locator("p").count() > 0
        
        # 获取元素属性
        link = self.test.page.locator("a")
        href = link.get_attribute("href")
        assert href is not None
    
    def test_screenshot(self):
        """测试截图"""
        self.test.navigate("https://example.com")
        self.test.screenshot("test_screenshot.png")
        
        assert self.test.page.screenshot() is not None


class TestPlaywrightAdvanced:
    """Playwright高级用法"""
    
    def setup_method(self):
        self.test = PlaywrightTest()
        self.test.setup(headless=True)
    
    def teardown_method(self):
        self.test.teardown()
    
    def test_wait_for_selector(self):
        """测试等待元素"""
        self.test.navigate("https://example.com")
        
        # 等待元素出现
        self.test.page.wait_for_selector("h1")
        assert self.test.page.locator("h1").is_visible()
    
    def test_form_interaction(self):
        """测试表单交互"""
        self.test.navigate("https://example.com")
        
        # Playwright示例页面没有表单，这里演示方法
        # 实际项目中：
        # self.test.page.fill("input[name='username']", "testuser")
        # self.test.page.fill("input[name='password']", "password")
        # self.test.page.click("button[type='submit']")
        
        assert True  # 占位测试
    
    def test_javascript_execution(self):
        """测试JavaScript执行"""
        self.test.navigate("https://example.com")
        
        # 执行JavaScript
        title = self.test.page.evaluate("document.title")
        assert title == "Example Domain"
        
        # 修改页面
        self.test.page.evaluate("document.title = 'Modified Title'")
        assert self.test.page.title() == "Modified Title"
    
    def test_network_interception(self):
        """测试网络拦截"""
        self.test.navigate("https://example.com")
        
        # 拦截请求
        def handle_route(route):
            route.continue_()
        
        self.test.page.route("**/*", handle_route)
        
        # 刷新页面
        self.test.page.reload()
        assert self.test.page.title() == "Example Domain"


# pytest fixtures
@pytest.fixture(scope="session")
def playwright_browser():
    """Playwright浏览器fixture"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture(scope="function")
def page(playwright_browser):
    """页面fixture"""
    context = playwright_browser.new_context()
    page = context.new_page()
    yield page
    context.close()


class TestWithFixtures:
    """使用fixture的测试"""
    
    def test_example_with_fixture(self, page):
        """使用fixture的测试"""
        page.goto("https://example.com")
        assert page.title() == "Example Domain"


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
```

### 案例2：Page Object Model

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
页面对象模式
功能：实现Page Object Model设计模式
"""

from playwright.sync_api import Page, Locator
from dataclasses import dataclass
from typing import Optional


@dataclass
class UserData:
    """用户数据"""
    username: str
    password: str
    email: str


class BasePage:
    """基础页面类"""
    
    def __init__(self, page: Page):
        self.page = page
    
    def navigate(self, url: str):
        """导航"""
        self.page.goto(url)
    
    def get_title(self) -> str:
        """获取标题"""
        return self.page.title()
    
    def screenshot(self, filename: str):
        """截图"""
        self.page.screenshot(path=filename)


class LoginPage(BasePage):
    """登录页面"""
    
    # 元素定位器
    URL = "https://example.com/login"
    
    # 使用data-testid定位更稳定
    USERNAME_INPUT = "[data-testid='username']"
    PASSWORD_INPUT = "[data-testid='password']"
    LOGIN_BUTTON = "[data-testid='login-button']"
    ERROR_MESSAGE = "[data-testid='error-message']"
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def open(self):
        """打开登录页面"""
        self.navigate(self.URL)
        return self
    
    def fill_username(self, username: str):
        """填写用户名"""
        self.page.fill(self.USERNAME_INPUT, username)
        return self
    
    def fill_password(self, password: str):
        """填写密码"""
        self.page.fill(self.PASSWORD_INPUT, password)
        return self
    
    def click_login(self):
        """点击登录按钮"""
        self.page.click(self.LOGIN_BUTTON)
        return self
    
    def login(self, username: str, password: str):
        """登录操作"""
        self.fill_username(username)
        self.fill_password(password)
        self.click_login()
        return self
    
    def get_error_message(self) -> Optional[str]:
        """获取错误消息"""
        try:
            error = self.page.locator(self.ERROR_MESSAGE)
            if error.is_visible():
                return error.text_content()
        except:
            pass
        return None
    
    def is_login_successful(self) -> bool:
        """检查登录是否成功"""
        # 假设登录成功后会跳转到仪表盘
        return "dashboard" in self.page.url


class DashboardPage(BasePage):
    """仪表盘页面"""
    
    URL = "https://example.com/dashboard"
    
    # 元素定位器
    USER_MENU = "[data-testid='user-menu']"
    LOGOUT_BUTTON = "[data-testid='logout-button']"
    WELCOME_TEXT = "[data-testid='welcome-text']"
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def open(self):
        """打开仪表盘"""
        self.navigate(self.URL)
        return self
    
    def get_welcome_text(self) -> str:
        """获取欢迎文本"""
        return self.page.text_content(self.WELCOME_TEXT)
    
    def click_user_menu(self):
        """点击用户菜单"""
        self.page.click(self.USER_MENU)
        return self
    
    def logout(self):
        """退出登录"""
        self.click_user_menu()
        self.page.click(self.LOGOUT_BUTTON)
        return self
    
    def is_loaded(self) -> bool:
        """检查页面是否加载完成"""
        try:
            self.page.wait_for_selector(self.WELCOME_TEXT, timeout=5000)
            return True
        except:
            return False


class ProductPage(BasePage):
    """产品页面"""
    
    URL = "https://example.com/products"
    
    # 元素定位器
    PRODUCT_LIST = "[data-testid='product-list']"
    PRODUCT_ITEM = "[data-testid='product-item']"
    SEARCH_INPUT = "[data-testid='search-input']"
    SEARCH_BUTTON = "[data-testid='search-button']"
    ADD_TO_CART_BUTTON = "[data-testid='add-to-cart']"
    CART_COUNT = "[data-testid='cart-count']"
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def open(self):
        """打开产品页面"""
        self.navigate(self.URL)
        return self
    
    def search_product(self, keyword: str):
        """搜索产品"""
        self.page.fill(self.SEARCH_INPUT, keyword)
        self.page.click(self.SEARCH_BUTTON)
        return self
    
    def get_product_count(self) -> int:
        """获取产品数量"""
        return self.page.locator(self.PRODUCT_ITEM).count()
    
    def add_product_to_cart(self, index: int = 0):
        """添加产品到购物车"""
        products = self.page.locator(self.PRODUCT_ITEM)
        if products.count() > index:
            products.nth(index).locator(self.ADD_TO_CART_BUTTON).click()
        return self
    
    def get_cart_count(self) -> int:
        """获取购物车数量"""
        count_text = self.page.text_content(self.CART_COUNT)
        return int(count_text) if count_text else 0


# 使用Page Object的测试
class TestLoginPage:
    """登录页面测试"""
    
    def test_successful_login(self, page):
        """测试成功登录"""
        login_page = LoginPage(page)
        login_page.open()
        
        login_page.login("testuser", "password123")
        
        assert login_page.is_login_successful()
    
    def test_failed_login(self, page):
        """测试失败登录"""
        login_page = LoginPage(page)
        login_page.open()
        
        login_page.login("wronguser", "wrongpass")
        
        error = login_page.get_error_message()
        assert error is not None
        assert "Invalid" in error


class TestDashboardPage:
    """仪表盘页面测试"""
    
    def test_dashboard_loads(self, page):
        """测试仪表盘加载"""
        dashboard = DashboardPage(page)
        dashboard.open()
        
        assert dashboard.is_loaded()
        assert "Welcome" in dashboard.get_welcome_text()


class TestProductPage:
    """产品页面测试"""
    
    def test_product_search(self, page):
        """测试产品搜索"""
        product_page = ProductPage(page)
        product_page.open()
        
        product_page.search_product("phone")
        
        # 等待搜索结果
        page.wait_for_selector("[data-testid='product-item']")
        assert product_page.get_product_count() > 0
    
    def test_add_to_cart(self, page):
        """测试添加到购物车"""
        product_page = ProductPage(page)
        product_page.open()
        
        initial_count = product_page.get_cart_count()
        product_page.add_product_to_cart(0)
        
        # 等待购物车更新
        page.wait_for_timeout(1000)
        assert product_page.get_cart_count() == initial_count + 1


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
```

### 案例3：Selenium 进阶用法

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Selenium进阶用法
功能：演示Selenium的高级特性
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
import pytest
from typing import Optional


class SeleniumAdvanced:
    """Selenium高级用法"""
    
    def __init__(self, headless: bool = True):
        self.options = Options()
        if headless:
            self.options.add_argument('--headless')
        self.options.add_argument('--no-sandbox')
        self.options.add_argument('--disable-dev-shm-usage')
        self.options.add_argument('--window-size=1920,1080')
        
        self.driver = webdriver.Chrome(options=self.options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def quit(self):
        """关闭浏览器"""
        self.driver.quit()
    
    def find_element_safe(self, by: By, value: str, timeout: int = 10) -> Optional[object]:
        """安全查找元素"""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
        except TimeoutException:
            return None
    
    def click_when_ready(self, by: By, value: str, timeout: int = 10):
        """等待元素可点击后点击"""
        element = WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        element.click()
    
    def scroll_to_element(self, by: By, value: str):
        """滚动到元素"""
        element = self.driver.find_element(by, value)
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
    
    def take_screenshot(self, filename: str):
        """截图"""
        self.driver.save_screenshot(filename)
    
    def execute_javascript(self, script: str, *args):
        """执行JavaScript"""
        return self.driver.execute_script(script, *args)


class TestSeleniumAdvanced:
    """Selenium高级测试"""
    
    def setup_method(self):
        self.selenium = SeleniumAdvanced(headless=True)
    
    def teardown_method(self):
        self.selenium.quit()
    
    def test_page_with_wait(self):
        """测试带等待的页面"""
        self.selenium.driver.get("https://example.com")
        
        # 等待元素出现
        h1 = self.selenium.find_element_safe(By.TAG_NAME, "h1")
        assert h1 is not None
        assert "Example" in h1.text
    
    def test_javascript_execution(self):
        """测试JavaScript执行"""
        self.selenium.driver.get("https://example.com")
        
        # 获取页面标题
        title = self.selenium.execute_javascript("return document.title")
        assert title == "Example Domain"
        
        # 修改页面内容
        self.selenium.execute_javascript(
            "document.querySelector('h1').textContent = 'Modified'"
        )
        
        h1 = self.selenium.driver.find_element(By.TAG_NAME, "h1")
        assert h1.text == "Modified"
    
    def test_screenshot(self):
        """测试截图"""
        self.selenium.driver.get("https://example.com")
        self.selenium.take_screenshot("selenium_screenshot.png")
        
        # 验证截图文件存在
        import os
        assert os.path.exists("selenium_screenshot.png")
        
        # 清理
        os.remove("selenium_screenshot.png")


# 多浏览器测试
class CrossBrowserTest:
    """跨浏览器测试"""
    
    @staticmethod
    def get_chrome_driver(headless: bool = True):
        """获取Chrome驱动"""
        options = Options()
        if headless:
            options.add_argument('--headless')
        return webdriver.Chrome(options=options)
    
    @staticmethod
    def get_firefox_driver(headless: bool = True):
        """获取Firefox驱动"""
        options = webdriver.FirefoxOptions()
        if headless:
            options.add_argument('--headless')
        return webdriver.Firefox(options=options)
    
    def test_chrome(self):
        """Chrome浏览器测试"""
        driver = self.get_chrome_driver()
        try:
            driver.get("https://example.com")
            assert "Example" in driver.title
        finally:
            driver.quit()
    
    def test_firefox(self):
        """Firefox浏览器测试"""
        try:
            driver = self.get_firefox_driver()
            try:
                driver.get("https://example.com")
                assert "Example" in driver.title
            finally:
                driver.quit()
        except Exception as e:
            pytest.skip(f"Firefox不可用: {e}")


# 页面对象模式（Selenium版本）
class SeleniumLoginPage:
    """Selenium登录页面"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def open(self, url: str):
        """打开页面"""
        self.driver.get(url)
        return self
    
    def login(self, username: str, password: str):
        """登录"""
        username_input = self.wait.until(
            EC.presence_of_element_located((By.NAME, "username"))
        )
        username_input.clear()
        username_input.send_keys(username)
        
        password_input = self.driver.find_element(By.NAME, "password")
        password_input.clear()
        password_input.send_keys(password)
        
        submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        return self
    
    def is_logged_in(self) -> bool:
        """检查是否登录成功"""
        try:
            self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".dashboard"))
            )
            return True
        except TimeoutException:
            return False


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
```

### 案例4：视觉回归测试

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
视觉回归测试
功能：比较页面截图，检测视觉变化
"""

from playwright.sync_api import Page
import hashlib
import os
from PIL import Image
import numpy as np
from typing import Tuple


class VisualRegression:
    """视觉回归测试"""
    
    def __init__(self, baseline_dir: str = "baseline", current_dir: str = "current"):
        self.baseline_dir = baseline_dir
        self.current_dir = current_dir
        os.makedirs(baseline_dir, exist_ok=True)
        os.makedirs(current_dir, exist_ok=True)
    
    def capture_screenshot(self, page: Page, name: str, full_page: bool = True) -> str:
        """截图并保存"""
        filepath = os.path.join(self.current_dir, f"{name}.png")
        page.screenshot(path=filepath, full_page=full_page)
        return filepath
    
    def compare_images(self, baseline_path: str, current_path: str, 
                      threshold: float = 0.95) -> Tuple[bool, float]:
        """比较两张图片"""
        if not os.path.exists(baseline_path):
            return False, 0.0
        
        baseline = Image.open(baseline_path)
        current = Image.open(current_path)
        
        # 调整大小以匹配
        if baseline.size != current.size:
            current = current.resize(baseline.size)
        
        # 转换为numpy数组
        baseline_array = np.array(baseline)
        current_array = np.array(current)
        
        # 计算相似度
        if baseline_array.shape != current_array.shape:
            return False, 0.0
        
        # 计算像素差异
        diff = np.abs(baseline_array.astype(float) - current_array.astype(float))
        similarity = 1 - (diff.mean() / 255)
        
        return similarity >= threshold, similarity
    
    def update_baseline(self, name: str):
        """更新基准图片"""
        current_path = os.path.join(self.current_dir, f"{name}.png")
        baseline_path = os.path.join(self.baseline_dir, f"{name}.png")
        
        if os.path.exists(current_path):
            import shutil
            shutil.copy(current_path, baseline_path)
            print(f"基准图片已更新: {baseline_path}")
    
    def check_visual_regression(self, page: Page, name: str, 
                               update_baseline: bool = False) -> dict:
        """检查视觉回归"""
        # 截图
        current_path = self.capture_screenshot(page, name)
        baseline_path = os.path.join(self.baseline_dir, f"{name}.png")
        
        # 更新基准
        if update_baseline:
            self.update_baseline(name)
            return {'passed': True, 'similarity': 1.0, 'message': '基准已更新'}
        
        # 比较
        passed, similarity = self.compare_images(baseline_path, current_path)
        
        return {
            'passed': passed,
            'similarity': similarity,
            'baseline': baseline_path,
            'current': current_path,
            'message': '视觉检查通过' if passed else f'视觉差异: {similarity:.2%}'
        }


class TestVisualRegression:
    """视觉回归测试"""
    
    def setup_method(self):
        self.visual = VisualRegression()
    
    def test_example_page_visual(self, page):
        """测试示例页面视觉"""
        page.goto("https://example.com")
        
        result = self.visual.check_visual_regression(page, "example_page")
        
        assert result['passed'], result['message']
    
    def test_update_baseline(self, page):
        """更新基准图片"""
        page.goto("https://example.com")
        
        result = self.visual.check_visual_regression(
            page, "example_page", update_baseline=True
        )
        
        assert result['passed']


# 使用方法
"""
1. 首次运行，更新基准图片：
   pytest --update-baseline

2. 后续运行，检查视觉回归：
   pytest

3. 查看差异：
   - 基准图片在 baseline/ 目录
   - 当前图片在 current/ 目录
"""
```

## 课后练习

### 练习1：Playwright 测试
1. 编写一个完整的页面交互测试
2. 实现表单提交和验证
3. 测试动态加载内容

### 练习2：Page Object 实现
1. 为一个真实网站设计Page Object
2. 实现至少3个页面对象
3. 编写对应的测试用例

### 练习3：视觉回归测试
1. 为项目页面创建基准截图
2. 实现自动化视觉检查
3. 配置CI/CD集成

## 常见问题

### Q1: Playwright和Selenium如何选择？
A: 新项目推荐Playwright，旧项目维护可继续使用Selenium。

### Q2: 如何处理动态内容？
A: 使用等待机制，如Playwright的自动等待或Selenium的显式等待。

### Q3: 视觉测试如何处理动态内容？
A: 对动态区域进行屏蔽或使用更宽松的阈值。

## 下一步学习

完成今天的学习后，建议你：
1. 为自己的项目编写UI测试
2. 实现Page Object模式
3. 准备进入Day 19的学习：脚本自动化实战

明天我们将学习如何使用Python进行文件批处理和办公自动化。
