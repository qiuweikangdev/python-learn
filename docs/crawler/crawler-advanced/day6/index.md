# Day 6: 动态页面爬取

> **版本基线**：本文基于 Python 3.12+，requests 2.x / Scrapy 2.x / Selenium 4.x，更新于 2026-09。

## 学习目标

- 掌握 Selenium 的基本使用
- 学会使用 Playwright 爬取动态页面
- 了解无头浏览器模式
- 掌握反检测技术

## 技术原理

### 6.1 动态页面特点

现代网页大量使用 JavaScript 动态加载内容：

**常见动态加载方式：**
- AJAX 请求
- WebSocket
- DOM 操作
- 单页应用（SPA）

**传统爬虫的局限：**
- requests 只能获取初始 HTML
- 无法执行 JavaScript
- 无法获取动态加载的内容

### 6.2 浏览器自动化原理

浏览器自动化工具通过控制真实浏览器来获取动态内容：

**工作流程：**
1. 启动浏览器实例
2. 访问目标 URL
3. 等待页面加载完成
4. 执行 JavaScript
5. 获取渲染后的 DOM
6. 提取数据

### 6.3 Selenium 简介

Selenium 是最流行的浏览器自动化工具，支持多种浏览器和编程语言。

**主要特点：**
- 支持 Chrome、Firefox、Safari 等
- 支持多种编程语言
- 模拟真实用户操作
- 支持无头模式

### 6.4 Playwright 简介

Playwright 是微软开发的现代化浏览器自动化工具。

**主要特点：**
- 更快的执行速度
- 更好的稳定性
- 自动等待机制
- 支持多浏览器

## 案例

### 案例1：Selenium 基础使用

::: tip 驱动管理：Selenium Manager（Selenium 4.6+）
Selenium 4.6 起内置 **Selenium Manager**：`webdriver.Chrome()` 会自动检测浏览器版本并下载、管理匹配的驱动，**无需再手动下载 ChromeDriver/geckodriver**（旧的 chromedriver.chromium.org 手动下载流程已被 Chrome for Testing 取代）。只需 `pip install selenium` 并确保本机装有浏览器即可。
:::

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 创建 Chrome 浏览器实例（Selenium 4.6+ 自动管理驱动，无需手动下载）
driver = webdriver.Chrome()

try:
    # 访问网页
    driver.get('https://example.com')
    
    # 等待元素加载
    wait = WebDriverWait(driver, 10)
    element = wait.until(
        EC.presence_of_element_located((By.TAG_NAME, 'h1'))
    )
    
    # 获取标题
    title = driver.title
    print(f'页面标题: {title}')
    
    # 获取元素文本
    h1_text = driver.find_element(By.TAG_NAME, 'h1').text
    print(f'H1内容: {h1_text}')
    
finally:
    # 关闭浏览器
    driver.quit()
```

### 案例2：Playwright 基础使用

```python
from playwright.sync_api import sync_playwright

# 使用 Playwright
with sync_playwright() as p:
    # 启动浏览器
    browser = p.chromium.launch(headless=False)
    
    # 创建页面
    page = browser.new_page()
    
    # 访问网页
    page.goto('https://example.com')
    
    # 等待元素
    page.wait_for_selector('h1')
    
    # 获取标题
    title = page.title()
    print(f'页面标题: {title}')
    
    # 获取元素文本
    h1_text = page.locator('h1').text_content()
    print(f'H1内容: {h1_text}')
    
    # 关闭浏览器
    browser.close()
```

## 应用场景

### 1. 单页应用爬取
- React、Vue、Angular 应用
- 动态加载的内容

### 2. 需要登录的网站
- 模拟登录流程
- 维护登录状态

### 3. 交互式页面
- 需要点击、滚动
- 表单提交

### 4. 反爬严格的网站
- 需要执行 JavaScript
- 检测浏览器环境

## 代码案例

### 案例3：Selenium 等待策略

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

driver = webdriver.Chrome()

try:
    driver.get('https://example.com')
    
    # 显式等待 - 等待元素出现
    try:
        element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'dynamic-content'))
        )
        print(f'元素文本: {element.text}')
    except TimeoutException:
        print('等待超时')
    
    # 等待元素可点击
    button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '.load-more'))
    )
    button.click()
    
    # 等待文本出现
    WebDriverWait(driver, 10).until(
        EC.text_to_be_present_in_element((By.ID, 'status'), '完成')
    )
    
finally:
    driver.quit()
```

### 案例4：Selenium 模拟用户操作

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import time

driver = webdriver.Chrome()

try:
    driver.get('https://example.com')
    
    # 输入文本
    search_box = driver.find_element(By.ID, 'search-input')
    search_box.send_keys('Python 爬虫')
    
    # 按回车键
    search_box.send_keys(Keys.RETURN)
    
    # 等待搜索结果
    time.sleep(2)
    
    # 点击链接
    link = driver.find_element(By.CSS_SELECTOR, '.result-link')
    link.click()
    
    # 鼠标悬停
    element = driver.find_element(By.ID, 'menu')
    actions = ActionChains(driver)
    actions.move_to_element(element).perform()
    
    # 滚动页面
    driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')
    
    # 截图
    driver.save_screenshot('screenshot.png')
    
finally:
    driver.quit()
```

### 案例5：Playwright 自动等待

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # 访问页面
    page.goto('https://example.com')
    
    # 自动等待 - Playwright 会自动等待元素
    page.locator('#dynamic-content').click()
    
    # 等待特定状态
    page.locator('.loading').wait_for(state='hidden')
    
    # 等待网络空闲
    page.wait_for_load_state('networkidle')
    
    # 获取动态内容
    content = page.locator('.dynamic-text').text_content()
    print(f'动态内容: {content}')
    
    browser.close()
```

### 案例6：Playwright 处理弹窗

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # 处理对话框
    page.on('dialog', lambda dialog: dialog.accept())
    
    page.goto('https://example.com')
    
    # 触发弹窗
    page.locator('#alert-button').click()
    
    # 处理新窗口
    with page.expect_popup() as popup_info:
        page.locator('#new-window-link').click()
    popup = popup_info.value
    
    print(f'新窗口标题: {popup.title()}')
    
    browser.close()
```

### 案例7：反检测技术

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

def create_stealth_driver():
    """创建反检测浏览器"""
    options = Options()
    
    # 无头模式（Chrome 109+ 推荐使用新版无头模式 --headless=new，
    # 行为更接近真实浏览器，旧版 --headless 已废弃）
    options.add_argument('--headless=new')
    
    # 禁用自动化特征
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option('excludeSwitches', ['enable-automation'])
    options.add_experimental_option('useAutomationExtension', False)
    
    # 设置窗口大小
    options.add_argument('--window-size=1920,1080')
    
    # 设置 User-Agent（当前主流 Chrome UA，用时请更新版本号）
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36')
    
    # 创建驱动
    driver = webdriver.Chrome(options=options)
    
    # 修改 webdriver 属性
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver

# 使用反检测驱动
driver = create_stealth_driver()

try:
    driver.get('https://example.com')
    print(f'页面标题: {driver.title}')
finally:
    driver.quit()
```

### 案例8：Playwright 反检测

```python
from playwright.sync_api import sync_playwright

def create_stealth_browser():
    """创建反检测浏览器"""
    p = sync_playwright().start()
    
    # 启动浏览器
    browser = p.chromium.launch(
        headless=False,
        args=[
            '--disable-blink-features=AutomationControlled',
        ]
    )
    
    # 创建上下文
    context = browser.new_context(
        viewport={'width': 1920, 'height': 1080},
        # 当前主流 Chrome UA，用时请更新版本号
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    )
    
    # 添加脚本隐藏自动化特征
    context.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
    """)
    
    return p, browser, context

# 使用反检测浏览器
p, browser, context = create_stealth_browser()

try:
    page = context.new_page()
    page.goto('https://example.com')
    print(f'页面标题: {page.title()}')
finally:
    browser.close()
    p.stop()
```

::: warning 2026 反检测现状
上面两例的“手工隐身”手段（隐藏 `navigator.webdriver`、`excludeSwitches` 等基于 CDP/启动参数的补丁）对新一代指纹检测（TLS 指纹、Canvas/WebGL 指纹、行为分析）**基本失效**，只能对付最基础的检测。当前社区主流的反检测方案：

- **Selenium**：[undetected-chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) —— `pip install undetected-chromedriver`，用 `uc.Chrome()` 替换 `webdriver.Chrome()` 即可，自动修补自动化特征；
- **Playwright**：[patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright) —— Playwright 的反检测分支，API 与 Playwright 兼容，`pip install patchright` 后执行 `patchright install chromium`；或 [playwright-stealth](https://github.com/AtuboDad/playwright-stealth) —— 在现有 Playwright 代码上应用一组隐身补丁脚本。

反检测只是降低被识别的概率，并非“百毒不侵”。请把功夫优先花在降低频率、使用官方 API 与合规采集上。
:::

### 案例9：Playwright 异步 API

现代爬虫普遍基于异步编排（配合 Day 7 的 asyncio），Playwright 原生提供 async API：

```python
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # 以 toscrape 的 JS 渲染版为例：页面内容由 JavaScript 生成，
        # requests 拿不到数据，必须用真实浏览器渲染
        await page.goto('https://quotes.toscrape.com/js/')

        # 异步等待元素出现
        await page.wait_for_selector('div.quote')

        # 异步提取所有名言文本
        quotes = await page.locator('div.quote span.text').all_text_contents()
        for q in quotes[:3]:
            print(q)

        await browser.close()

asyncio.run(main())
```

### 案例10：Playwright 网络拦截与接口抓取

现代网页的数据大多来自 XHR/fetch 接口。**拦截请求、直接抓接口返回** 是 Playwright 最常用的能力，往往比解析渲染后的 DOM 更稳定：

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # 1) route 拦截：命中 **/api/** 的请求可修改、放行或中断
    def handle_route(route):
        # route.abort()               # 中断请求（如屏蔽广告/图片提速）
        # route.continue_(headers={**route.request.headers, 'X-Tag': 'crawler'})  # 修改请求头
        route.continue_()             # 放行
    page.route('**/api/**', handle_route)

    # 2) expect_response：等待某个接口的响应并直接读取返回内容
    with page.expect_response(
        lambda r: '/api/quotes' in r.url
    ) as response_info:
        # quotes.toscrape.com/scroll/ 通过 /api/quotes?page=N 接口加载名言
        page.goto('https://quotes.toscrape.com/scroll/')

    data = response_info.value.json()
    print(f'接口返回 {len(data["quotes"])} 条, has_next: {data["has_next"]}')
    print(data['quotes'][0]['text'])

    browser.close()
```

### 案例11：实际爬虫示例

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time

class DynamicSpider:
    """动态页面爬虫"""
    
    def __init__(self, headless=True):
        self.options = webdriver.ChromeOptions()
        if headless:
            # Chrome 109+ 推荐新版无头模式
            self.options.add_argument('--headless=new')
        self.driver = webdriver.Chrome(options=self.options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def crawl(self, url):
        """爬取页面"""
        self.driver.get(url)
        
        # 等待内容加载
        self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, '.content'))
        )
        
        # 提取数据
        data = self.extract_data()
        
        return data
    
    def extract_data(self):
        """提取数据"""
        items = []
        
        # 查找所有商品
        products = self.driver.find_elements(By.CSS_SELECTOR, '.product-item')
        
        for product in products:
            item = {
                'name': product.find_element(By.CSS_SELECTOR, '.name').text,
                'price': product.find_element(By.CSS_SELECTOR, '.price').text,
            }
            items.append(item)
        
        return items
    
    def scroll_to_bottom(self):
        """滚动到页面底部"""
        self.driver.execute_script(
            'window.scrollTo(0, document.body.scrollHeight)'
        )
        time.sleep(2)
    
    def close(self):
        """关闭浏览器"""
        self.driver.quit()

# 使用示例
spider = DynamicSpider(headless=False)

try:
    url = 'https://example.com/products'
    data = spider.crawl(url)
    
    print(json.dumps(data, ensure_ascii=False, indent=2))
finally:
    spider.close()
```

## 课后练习

### 练习1：爬取动态加载的评论
使用 Selenium 爬取需要滚动加载的评论数据。

### 练习2：模拟登录
使用 Playwright 模拟登录网站并获取登录后的数据。

### 练习3：处理验证码
研究常见的验证码类型和处理方法。

## 常见问题

### Q1: Selenium 和 Playwright 该选哪个？
A: 新项目推荐 Playwright，性能更好、更稳定。已有 Selenium 项目可以继续使用。

### Q2: 无头模式和有头模式有什么区别？
A: 无头模式不显示浏览器界面，速度更快，适合服务器环境。有头模式可以看到浏览器操作，适合调试。

### Q3: 如何提高动态页面爬取速度？
A: 使用无头模式、减少等待时间、禁用图片加载、使用多线程等。

## 下一步学习

- [Day 7: 多线程与异步爬虫](/crawler/crawler-advanced/day7/)
