---
layout: home
hero:
  name: Python 数据分析
  actions:
    - theme: brand
      text: 开始学习
      link: /data-analysis/data-analysis-basics/
    - theme: alt
      text: GitHub
      link: https://github.com/qiuweikangdev/python-learn
features:
  - title: 基础篇 · Day 1-5
    details: 数据分析基础入门，环境搭建、Python基础、数据清洗、可视化、EDA
    link: /data-analysis/data-analysis-basics/
    icon: 📊
  - title: 进阶篇 · Day 6-10
    details: 高级数据分析技术，统计分析、时间序列、文本分析、地理数据、机器学习
    link: /data-analysis/data-analysis-advanced/
    icon: ⚡
  - title: 实战篇 · Day 11-15
    details: 数据分析项目实战，电商、金融、社交媒体、医疗、完整项目
    link: /data-analysis/data-analysis-practice/
    icon: 🚀
---

# Python 数据分析系列

> **版本基线**：本文基于 Python 3.12+ / pandas 3.x（CoW 默认开启）/ numpy 2.x，更新于 2026-09。

欢迎来到 Python 数据分析学习系列！本系列课程将带你从零开始掌握数据分析技能。

::: tip 深入篇
完成本系列 15 天课程后，可以继续阅读《[Day66-80 数据分析（深入篇）](/day66-80/66)》，更细致地掌握 NumPy、pandas 与数据可视化。
:::


## 学习路径

### 🟢 基础篇（Day 1-5）
- **Day 1**: 数据分析概述与环境搭建
- **Day 2**: Python基础与数据处理
- **Day 3**: 数据清洗与预处理
- **Day 4**: 数据可视化基础
- **Day 5**: 探索性数据分析(EDA)

### 🟡 进阶篇（Day 6-10）
- **Day 6**: 统计分析基础
- **Day 7**: 时间序列分析
- **Day 8**: 文本数据分析
- **Day 9**: 地理数据分析
- **Day 10**: 机器学习入门

### 🔴 实战篇（Day 11-15）
- **Day 11**: 电商数据分析实战
- **Day 12**: 金融数据分析实战
- **Day 13**: 社交媒体数据分析实战
- **Day 14**: 医疗数据分析实战
- **Day 15**: 完整项目实战与部署

## 技术栈

- **Python**: 3.12+（2026 年最新稳定版为 3.14，企业项目建议 3.12/3.13 起步）
- **数据处理**: pandas 3.x（CoW 默认开启）, numpy 2.x；大规模数据集可配合 polars / duckdb
- **数据可视化**: matplotlib, seaborn, plotly
- **统计分析**: scipy, statsmodels
- **机器学习**: scikit-learn 1.9+, xgboost
- **数据校验**: pydantic
- **开发环境**: Jupyter Notebook/Lab + uv（环境与依赖管理）

## 学习建议

1. **循序渐进**: 按照Day顺序学习，打好基础
2. **动手实践**: 每个案例都要亲自运行
3. **项目驱动**: 从Day 11开始进入实战阶段
4. **持续学习**: 数据分析是一个不断发展的领域

## 环境准备

```bash
# 推荐：使用 uv 管理环境与依赖（2026 年事实标准）
uv venv
uv pip install pandas numpy matplotlib seaborn scikit-learn jupyter

# 传统方式（对照）：pip install pandas numpy matplotlib seaborn scikit-learn jupyter

# 启动Jupyter Notebook
jupyter notebook
```

开始你的数据分析之旅吧！
