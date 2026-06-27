# Day 14: 网页自动化（Selenium）

## 学习目标

完成今天的学习后，你将能够：
- 掌握Selenium基础用法
- 实现网页元素定位和操作
- 编写自动化测试脚本
- 实现网页数据采集

## 技术原理

### Selenium简介

Selenium是一个用于Web应用程序测试的工具，支持多种浏览器。

### 元素定位方式

1. **ID定位**：`find_element(By.ID, "id")`
2. **Name定位**：`find_element(By.NAME, "name")`
3. **Class定位**：`find_element(By.CLASS_NAME, "class")`
4. **CSS定位**：`find_element(By.CSS_SELECTOR, "selector")`
5. **XPath定位**：`find_element(By.XPATH, "xpath")`

### 浏览器操作

```python
from selenium import webdriver

# 创建浏览器实例
driver = webdriver.Chrome()

# 打开网页
driver.get("https://www.example.com")

# 关闭浏览器
driver.quit()
```

## 案例：网页自动化脚本

编写网页自动化脚本，实现：
1. 自动登录
2. 数据采集
3. 表单填写
4. 自动化测试

## 应用场景

### 1. 自动化测试
- UI测试
- 回归测试
- 兼容性测试

### 2. 数据采集
- 网页爬虫
- 数据抓取
- 信息聚合

### 3. 任务自动化
- 自动填表
- 自动登录
- 批量操作

## 代码案例

### 案例1：基础操作

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Selenium基础操作
功能：演示Selenium的基本用法
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class WebAutomation:
    """网页自动化类"""
    
    def __init__(self, headless=False):
        # 配置浏览器选项
        options = webdriver.ChromeOptions()
        if headless:
            options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        # 创建浏览器实例
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def open(self, url):
        """打开网页"""
        self.driver.get(url)
        print(f"打开网页: {url}")
    
    def find_element(self, by, value):
        """查找元素"""
        return self.wait.until(
            EC.presence_of_element_located((by, value))
        )
    
    def find_elements(self, by, value):
        """查找多个元素"""
        return self.wait.until(
            EC.presence_of_all_elements_located((by, value))
        )
    
    def click(self, by, value):
        """点击元素"""
        element = self.find_element(by, value)
        element.click()
        print(f"点击元素: {value}")
    
    def input_text(self, by, value, text):
        """输入文本"""
        element = self.find_element(by, value)
        element.clear()
        element.send_keys(text)
        print(f"输入文本: {text}")
    
    def get_text(self, by, value):
        """获取文本"""
        element = self.find_element(by, value)
        return element.text
    
    def take_screenshot(self, filename):
        """截图"""
        self.driver.save_screenshot(filename)
        print(f"截图保存: {filename}")
    
    def close(self):
        """关闭浏览器"""
        self.driver.quit()
        print("浏览器已关闭")

def main():
    """主函数"""
    # 创建自动化实例
    automation = WebAutomation(headless=True)
    
    try:
        # 打开网页
        automation.open("https://www.example.com")
        
        # 获取页面标题
        title = automation.driver.title
        print(f"页面标题: {title}")
        
        # 截图
        automation.take_screenshot("screenshot.png")
        
    finally:
        # 关闭浏览器
        automation.close()

if __name__ == "__main__":
    main()
```

### 案例2：数据采集

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网页数据采集
功能：使用Selenium采集网页数据
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import csv
from typing import List, Dict

class WebScraper:
    """网页爬虫"""
    
    def __init__(self, headless=True):
        options = webdriver.ChromeOptions()
        if headless:
            options.add_argument('--headless')
        
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def scrape_table(self, url: str, table_selector: str) -> List[Dict]:
        """采集表格数据"""
        self.driver.get(url)
        
        # 等待表格加载
        table = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, table_selector))
        )
        
        # 获取表头
        headers = []
        header_cells = table.find_elements(By.TAG_NAME, 'th')
        for cell in header_cells:
            headers.append(cell.text.strip())
        
        # 获取数据行
        rows = []
        data_rows = table.find_elements(By.TAG_NAME, 'tr')[1:]  # 跳过表头
        
        for row in data_rows:
            cells = row.find_elements(By.TAG_NAME, 'td')
            row_data = {}
            for i, cell in enumerate(cells):
                if i < len(headers):
                    row_data[headers[i]] = cell.text.strip()
            rows.append(row_data)
        
        return rows
    
    def scrape_links(self, url: str, link_selector: str) -> List[Dict]:
        """采集链接数据"""
        self.driver.get(url)
        
        # 等待链接加载
        links = self.wait.until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, link_selector))
        )
        
        # 提取链接信息
        results = []
        for link in links:
            results.append({
                'text': link.text.strip(),
                'href': link.get_attribute('href')
            })
        
        return results
    
    def save_to_json(self, data: List[Dict], filename: str):
        """保存为JSON文件"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"数据已保存到: {filename}")
    
    def save_to_csv(self, data: List[Dict], filename: str):
        """保存为CSV文件"""
        if not data:
            return
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        print(f"数据已保存到: {filename}")
    
    def close(self):
        """关闭浏览器"""
        self.driver.quit()

def main():
    """主函数"""
    scraper = WebScraper(headless=True)
    
    try:
        # 示例：采集表格数据
        url = "https://www.example.com/table"
        data = scraper.scrape_table(url, "table.data-table")
        
        # 保存数据
        scraper.save_to_json(data, "data.json")
        scraper.save_to_csv(data, "data.csv")
        
        print(f"采集到 {len(data)} 条数据")
        
    finally:
        scraper.close()

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：基础操作
1. 编写自动登录脚本
2. 实现页面导航
3. 处理弹窗和对话框

### 练习2：数据采集
1. 采集电商网站商品信息
2. 采集新闻网站文章
3. 处理分页数据

### 练习3：自动化测试
1. 编写UI自动化测试
2. 实现数据驱动测试
3. 生成测试报告

## 常见问题

### Q1: 如何处理动态加载的元素？
A: 使用显式等待，等待元素出现。

### Q2: 如何处理验证码？
A: 使用OCR识别、人工识别或第三方服务。

### Q3: 如何提高采集效率？
A: 使用无头模式、多线程、减少等待时间。

## 下一步学习

完成今天的学习后，建议你：
1. 实践网页自动化项目
2. 了解反爬虫策略
3. 尝试复杂的数据采集
4. 准备进入Day 15的学习：爬虫自动化

明天我们将学习如何使用Scrapy进行爬虫开发。