---
layout: home
hero:
  name: Python 自动化
  actions:
    - theme: brand
      text: 开始学习
      link: /automation/automation-basics/
    - theme: alt
      text: GitHub
      link: https://github.com/qiuweikangdev/python-learn
features:
  - title: 基础篇 · Day 1-5
    details: 自动化基础入门，Python脚本、文件处理、系统任务、参数处理、错误处理
    link: /automation/automation-basics/
    icon: 🔧
  - title: 进阶篇 · Day 6-10
    details: 自动化进阶技术，日志记录、开发环境、测试自动化、部署自动化、CI/CD
    link: /automation/automation-advanced/
    icon: ⚡
  - title: 实战篇 · Day 11-15
    details: 自动化项目实战，监控告警、日志分析、AI自动化、网页自动化、爬虫自动化
    link: /automation/automation-practice/
    icon: 🚀
---

# Python 自动化系列

欢迎来到 Python 自动化学习系列！本系列课程将带你从零开始掌握Python自动化技能。

## 学习路径

### 🟢 基础篇（Day 1-5）
- **Day 1**: Python脚本基础与自动化概述
- **Day 2**: 文件处理自动化
- **Day 3**: 系统任务自动化
- **Day 4**: 参数处理与配置管理
- **Day 5**: 错误处理与异常管理

### 🟡 进阶篇（Day 6-10）
- **Day 6**: 日志记录与监控
- **Day 7**: 开发环境自动化
- **Day 8**: 测试自动化
- **Day 9**: 部署自动化
- **Day 10**: CI/CD持续集成与持续部署

### 🔴 实战篇（Day 11-15）
- **Day 11**: 系统监控与告警自动化
- **Day 12**: 日志分析自动化
- **Day 13**: AI自动化基础
- **Day 14**: 网页自动化（Selenium）
- **Day 15**: 爬虫自动化（Scrapy）

## 技术栈

- **脚本自动化**: Python标准库, argparse, configparser
- **文件处理**: os, shutil, pathlib, glob
- **系统任务**: subprocess, schedule, cron
- **日志记录**: logging, loguru
- **测试自动化**: pytest, unittest, mock
- **部署自动化**: fabric, ansible, docker
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **网页自动化**: Selenium, Playwright, BeautifulSoup
- **爬虫自动化**: Scrapy, requests, aiohttp

## 学习建议

1. **循序渐进**: 按照Day顺序学习，打好基础
2. **动手实践**: 每个案例都要亲自运行
3. **项目驱动**: 从Day 11开始进入实战阶段
4. **持续学习**: 自动化技术不断发展，保持学习

## 环境准备

```bash
# 安装必要的库
pip install selenium scrapy pytest loguru fabric docker

# 验证Python版本
python --version

# 创建虚拟环境
python -m venv automation-env
source automation-env/bin/activate  # Linux/Mac
automation-env\Scripts\activate  # Windows
```

开始你的自动化学习之旅吧！