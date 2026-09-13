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
  - title: 实战篇 · Day 11-20
    details: 自动化项目实战，监控告警、AI自动化、网页自动化、API测试、压测、UI测试、脚本自动化
    link: /automation/automation-practice/
    icon: 🚀
---

# Python 自动化系列

> **版本基线**：本系列基于 Python 3.12+，更新于 2026-09。

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

### 🔴 实战篇（Day 11-20）
- **Day 11**: 系统监控与告警自动化
- **Day 12**: 日志分析自动化
- **Day 13**: AI自动化：LLM API与传统机器学习
- **Day 14**: 网页自动化（Selenium）
- **Day 15**: 爬虫自动化（Scrapy）
- **Day 16**: API接口自动化测试
- **Day 17**: 性能测试与压测
- **Day 18**: 前端UI自动化测试
- **Day 19**: 脚本自动化实战
- **Day 20**: 企业级自动化测试实战

## 技术栈

> 以下技术栈均会在对应章节中实际讲解并给出可运行代码：loguru 见 Day 6，APScheduler 见 Day 3，uv 见 Day 7，ruff 见 Day 10，pathlib 见 Day 2，fabric/ansible 见 Day 9（介绍其定位与最小示例）。

- **环境与依赖管理**: uv（2026 事实标准，推荐）, venv, pip, Poetry
- **脚本自动化**: Python标准库, argparse, configparser
- **文件处理**: pathlib（现代路径操作主线）, os, shutil, glob
- **系统任务**: subprocess, schedule, APScheduler, cron
- **日志记录**: logging, loguru
- **代码质量**: ruff（lint + format，替代 flake8/isort/black）, mypy
- **测试自动化**: pytest, unittest, mock
- **API测试**: requests, httpx, pytest-html
- **性能测试**: locust, httpx
- **UI测试**: Playwright, Selenium
- **办公自动化**: openpyxl, python-docx, pypdf
- **部署自动化**: docker, docker compose, fabric, ansible
- **AI自动化**: OpenAI 兼容 API（openai SDK）, ollama, scikit-learn
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **爬虫自动化**: Scrapy, requests, aiohttp

## 学习建议

1. **循序渐进**: 按照Day顺序学习，打好基础
2. **动手实践**: 每个案例都要亲自运行
3. **项目驱动**: 从Day 11开始进入实战阶段
4. **持续学习**: 自动化技术不断发展，保持学习

## 环境准备

```bash
# 安装 uv（2026 事实标准，推荐）
curl -LsSf https://astral.sh/uv/install.sh | sh   # macOS / Linux
# Windows (PowerShell): powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 安装必要的库
pip install loguru apscheduler ruff fabric docker
pip install selenium scrapy pytest requests httpx locust
pip install playwright openpyxl python-docx pypdf openai scikit-learn

# 安装Playwright浏览器
playwright install

# 验证Python版本（本系列要求 3.12+，3.7 已于 2023-06 EOL）
python --version

# 创建虚拟环境（两种方式任选其一）
uv venv && uv pip install -r requirements.txt   # 推荐：uv 一条龙
python -m venv automation-env                    # 传统方式
source automation-env/bin/activate  # Linux/Mac
automation-env\Scripts\activate  # Windows
```

开始你的自动化学习之旅吧！
