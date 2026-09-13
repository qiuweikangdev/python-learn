# Day 13: AI 自动化：LLM API 与传统机器学习

> **版本基线**：本文基于 Python 3.12+，更新于 2026-09。LLM 示例基于 OpenAI 兼容 API（openai SDK ≥ 1.x），本地模型使用 ollama。

## 学习目标

完成今天的学习后，你将能够：
- 用 LLM API 实现批量文本分类、摘要与信息抽取
- 掌握 API 调用的工程化处理（重试、限速、Key 管理）
- 使用 ollama 接入本地模型，满足隐私合规场景
- 理解传统机器学习方案（TF-IDF + 朴素贝叶斯、异常检测）的适用场景
- 设计"LLM + 传统工具组合"的企业自动化流程

## 技术原理

### 两条技术路线

AI 自动化有两条主流路线，各有适用场景：

1. **LLM API 路线**：调用大语言模型接口（云端 API 或本地 ollama），用自然语言描述任务，零训练完成分类、摘要、抽取等通用文本任务
2. **传统机器学习路线**：用 scikit-learn 等工具训练专用模型（如 TF-IDF + 朴素贝叶斯文本分类、IsolationForest 异常检测），适合数据不能出域、成本敏感、任务边界固定的场景

| 维度 | LLM API | 传统 ML（scikit-learn） |
|------|---------|------------------------|
| 上手成本 | 零训练、零标注，写好 Prompt 即可 | 需要标注数据 + 训练调参 |
| 通用能力 | 强，覆盖未见过的表达方式 | 弱，局限于训练分布 |
| 成本模型 | 按调用量付费（token 计费） | 私有化部署，推理成本可控 |
| 数据合规 | 数据出域，合规需评估 | 数据不出本地，易过审 |
| 延迟与稳定 | 网络往返，秒级且偶发波动 | 本地推理，毫秒级且确定 |

### 常用库

- **openai**（SDK ≥ 1.x）：调用 OpenAI 兼容接口（云端 API、ollama、vLLM 等均兼容）
- **ollama**：本地运行开源模型（如 qwen3:8b），提供 OpenAI 兼容接口
- **scikit-learn**：传统机器学习（文本分类、异常检测等）
- **NLTK/spaCy**：传统自然语言处理
- **OpenCV**：图像处理

## 案例：智能客服工单自动化

构建一个智能客服自动化系统，实现：
1. 用户评论/工单的自动分类（正面/负面/其他）
2. 客服对话的关键信息抽取
3. 长文本自动摘要
4. 异常工单检测

## 应用场景

### 1. 智能客服
- 意图识别
- 自动回复
- 问题分类

### 2. 数据分析
- 模式识别
- 趋势预测
- 异常检测

### 3. 自动化测试
- 测试用例生成
- 缺陷预测
- 代码审查

## 代码案例

### 案例1：用 LLM API 做智能自动化（批量文本分类）

先安装 SDK 并准备 Key：

```bash
pip install openai   # 或 uv add openai
export OPENAI_API_KEY="sk-..."   # 从环境变量读取，不要硬编码进代码
```

下面是完整可运行的示例：封装一个带**重试 + 简单限速**的客户端，把用户评论批量分类为"正面 / 负面 / 其他"：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
用户评论批量分类（LLM API 版）
功能：调用 OpenAI 兼容接口，把用户评论分类为 正面 / 负面 / 其他
依赖：pip install openai
"""

import json
import os
import time
from pathlib import Path

from openai import OpenAI

MODEL = "gpt-5-mini"


class LLMClient:
    """带重试与简单限速的 OpenAI 兼容客户端封装"""

    def __init__(self, model: str = MODEL):
        # OpenAI() 默认读取 OPENAI_API_KEY 环境变量；密钥绝不写进代码
        self.client = OpenAI()
        self.model = model
        self._min_interval = 1.0   # 简单限速：两次请求最小间隔（秒）
        self._last_call = 0.0

    def _rate_limit(self):
        """简单限速：间隔不足就等待。
        生产环境可换令牌桶（token bucket）算法精细控制 QPS。"""
        elapsed = time.time() - self._last_call
        if elapsed < self._min_interval:
            time.sleep(self._min_interval - elapsed)
        self._last_call = time.time()

    def chat(self, messages, max_retries=3):
        """调用对话接口：失败自动重试（指数退避）"""
        for attempt in range(1, max_retries + 1):
            self._rate_limit()
            try:
                resp = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                )
                return resp.choices[0].message.content.strip()
            except Exception as e:
                wait = 2 ** attempt   # 指数退避：2s、4s、8s
                print(f"[重试 {attempt}/{max_retries}] 调用失败: {e}，{wait}s 后重试")
                time.sleep(wait)
        raise RuntimeError("LLM 调用连续失败，请检查网络与 API Key")


CLASSIFY_PROMPT = """你是评论分析助手。把用户评论分类为：正面、负面、其他。
只输出类别名称，不要输出任何解释。

评论：{comment}
类别："""


def classify_comments(comments):
    """批量分类：循环调用 + 容错兜底"""
    llm = LLMClient()
    results = []
    for comment in comments:
        answer = llm.chat([
            {"role": "user", "content": CLASSIFY_PROMPT.format(comment=comment)}
        ])
        # 容错：模型输出不在预期标签内时归入"其他"
        label = answer if answer in ("正面", "负面", "其他") else "其他"
        results.append({"comment": comment, "label": label})
        print(f"[{label}] {comment}")
    return results


def main():
    comments = [
        "这个产品质量很好，非常满意",
        "服务态度差，再也不来了",
        "周三下午三点请给我回电话",
        "物流很快，包装也很仔细",
        "发票可以开增值税专用发票吗？",
    ]

    results = classify_comments(comments)

    out_file = Path("comment_labels.json")
    out_file.write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n结果已保存到 {out_file}")


if __name__ == "__main__":
    main()
```

::: warning 工程要点
批量处理成百上千条文本时，三个工程细节必不可少：**重试**（网络/限流失败自动退避重试）、**限速**（`time.sleep` 控制最小间隔即可起步，量大时用令牌桶控制 QPS）、**容错**（Prompt 要求只输出标签，并对非法输出兜底）。
:::

### 案例2：批量摘要与信息抽取（简短示例）

在案例1的 `LLMClient` 基础上，换个 Prompt 就能完成其他任务。

**批量摘要**（比如每天自动摘要当天工单/日志/资讯）：

```python
def summarize(llm: LLMClient, text: str) -> str:
    return llm.chat([
        {"role": "system", "content": "你是摘要助手，用不超过50字输出要点。"},
        {"role": "user", "content": text},
    ])

# 批量处理
# summaries = [summarize(llm, doc) for doc in documents]
```

**信息抽取**（从客服对话中抽取结构化字段，供后续流程使用）：

```python
EXTRACT_PROMPT = """从下面的客服对话中抽取信息，输出JSON，
字段：产品、问题类型、紧急程度(高/中/低)。只输出JSON。
对话：{dialog}
JSON："""

def extract_info(llm: LLMClient, dialog: str) -> dict:
    raw = llm.chat([{"role": "user", "content": EXTRACT_PROMPT.format(dialog=dialog)}])
    return json.loads(raw)   # 生产环境建议对解析失败做兜底重试
```

### 案例3：用 ollama 跑本地模型（隐私场景）

数据不能出内网时，用 [ollama](https://ollama.com) 在本地跑开源模型。它提供 OpenAI 兼容接口，代码只需换 `base_url` 和模型名：

```bash
ollama pull qwen3:8b   # 先下载本地模型
```

```python
from openai import OpenAI

# base_url 指向本地 ollama 服务，api_key 填任意占位符即可
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

resp = client.chat.completions.create(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "把这句话分类为正面/负面/其他，只输出类别：物流太慢了"}],
)
print(resp.choices[0].message.content)
```

::: tip
本地模型的核心优势是**数据不出机器/内网**（评论、工单等敏感业务数据无需发给第三方），且没有按量计费；代价是需要本机算力，模型通用能力通常弱于旗舰云端模型。案例1的 `LLMClient` 只需在构造时传入 `base_url` 即可无缝切换到 ollama。
:::

### 案例4：传统机器学习方案（离线/私有化场景）

LLM API 之外，任务边界固定、数据必须私有化、调用量极大的场景，传统机器学习依然是最优解。

**取舍说明**：
- **LLM API**：通用能力强、零训练零标注、上线快；但按量付费、数据出域（合规需评估）、推理延迟与成本随量线性增长
- **传统 ML**：私有化部署、单次推理成本近乎为零、延迟低；但需要标注数据、模型能力局限于训练分布

**文本分类（TF-IDF + 朴素贝叶斯）**：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文本分类器
功能：使用 TF-IDF + 朴素贝叶斯进行文本分类
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

class TextClassifier:
    """文本分类器"""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000)
        self.model = MultinomialNB()
        self.is_trained = False

    def train(self, texts, labels):
        """训练模型"""
        # 转换文本为特征向量
        X = self.vectorizer.fit_transform(texts)

        # 划分训练集和测试集
        X_train, X_test, y_train, y_test = train_test_split(
            X, labels, test_size=0.2, random_state=42
        )

        # 训练模型
        self.model.fit(X_train, y_train)
        self.is_trained = True

        # 评估模型
        y_pred = self.model.predict(X_test)
        print("模型评估报告:")
        print(classification_report(y_test, y_pred))

    def predict(self, text):
        """预测文本类别"""
        if not self.is_trained:
            raise RuntimeError("模型未训练")

        # 转换文本
        X = self.vectorizer.transform([text])

        # 预测
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]

        return {
            'prediction': prediction,
            'probabilities': dict(zip(self.model.classes_, probabilities))
        }

def main():
    """主函数"""
    # 示例数据
    texts = [
        "这个产品质量很好，非常满意",
        "服务态度差，再也不来了",
        "价格合理，性价比高",
        "物流太慢了，等了很久",
        "包装精美，商品完好",
        "客服态度很好，解答详细",
        "商品有质量问题，要求退款",
        "物超所值，推荐购买",
    ]

    labels = [
        "正面", "负面", "正面", "负面",
        "正面", "正面", "负面", "正面"
    ]

    # 创建分类器
    classifier = TextClassifier()

    # 训练模型
    print("训练模型...")
    classifier.train(texts, labels)

    # 测试预测
    test_texts = [
        "这个产品不错，值得购买",
        "质量太差了，很失望",
    ]

    print("\n预测结果:")
    for text in test_texts:
        result = classifier.predict(text)
        print(f"\n文本: {text}")
        print(f"预测: {result['prediction']}")
        print(f"概率: {result['probabilities']}")

if __name__ == "__main__":
    main()
```

**异常检测（IsolationForest）**——工单/交易流水中自动发现离群点：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
异常检测器
功能：使用机器学习检测数据异常
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class AnomalyDetector:
    """异常检测器"""

    def __init__(self, contamination=0.1):
        self.scaler = StandardScaler()
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42
        )
        self.is_trained = False

    def train(self, data):
        """训练模型"""
        # 数据标准化
        scaled_data = self.scaler.fit_transform(data)

        # 训练模型
        self.model.fit(scaled_data)
        self.is_trained = True

        # 统计信息
        predictions = self.model.predict(scaled_data)
        n_anomalies = sum(1 for p in predictions if p == -1)
        print(f"训练完成，发现 {n_anomalies} 个异常点")

    def predict(self, data):
        """预测异常"""
        if not self.is_trained:
            raise RuntimeError("模型未训练")

        # 数据标准化
        scaled_data = self.scaler.transform(data)

        # 预测
        predictions = self.model.predict(scaled_data)
        scores = self.model.decision_function(scaled_data)

        return [
            {
                'is_anomaly': pred == -1,
                'score': score
            }
            for pred, score in zip(predictions, scores)
        ]

def main():
    """主函数"""
    # 生成示例数据
    np.random.seed(42)

    # 正常数据
    normal_data = np.random.randn(100, 2) * 0.5 + [5, 5]

    # 异常数据
    anomaly_data = np.random.randn(10, 2) * 0.5 + [10, 10]

    # 合并数据
    data = np.vstack([normal_data, anomaly_data])

    # 创建检测器
    detector = AnomalyDetector(contamination=0.1)

    # 训练模型
    print("训练异常检测模型...")
    detector.train(data)

    # 测试预测
    test_data = np.array([
        [5, 5],    # 正常
        [10, 10],  # 异常
        [6, 6],    # 正常
        [15, 15],  # 异常
    ])

    print("\n预测结果:")
    results = detector.predict(test_data)
    for i, (point, result) in enumerate(zip(test_data, results)):
        status = "异常" if result['is_anomaly'] else "正常"
        print(f"点 {point}: {status} (分数: {result['score']:.3f})")

if __name__ == "__main__":
    main()
```

## LLM + 传统工具组合的企业自动化思路

企业实践中，LLM 很少单独成链路，典型组合是"**LLM 分类 → 规则引擎路由 → 自动执行**"：

```
用户反馈/工单
    │
    ▼
LLM 批量分类/抽取（案例1）          ← 通用语义理解，零标注
    │
    ▼
规则引擎路由                        ← 传统规则，确定可控
    ├─ label=负面 且 紧急程度=高 → 创建 P1 工单，短信告警值班
    ├─ label=负面 → 转人工客服队列，附摘要（案例2）
    ├─ label=其他（咨询/发票）→ 命中 FAQ 库自动回复
    └─ label=正面 → 归档，进入满意度统计（传统 ML 聚合报表）
    │
    ▼
结果写库 + 日报（openpyxl/pypdf，见 Day 19）
```

设计原则：**让 LLM 做"理解"（分类、摘要、抽取），让传统工具做"决策与执行"（规则路由、自动回复、报表）**——前者发挥通用语义能力，后者保证流程确定、可审计、易回滚。

## 课后练习

### 练习1：LLM API 智能自动化
1. 运行案例1，把自己的 10 条真实评论分类并保存为 JSON
2. 给 `LLMClient` 增加超时参数与调用耗时统计
3. 用 ollama + qwen3:8b 跑通同一分类任务，对比两者输出差异

### 练习2：文本处理
1. 实现文本情感分析
2. 构建关键词提取器
3. 实现文本摘要

### 练习3：图像识别
1. 使用OpenCV进行图像处理
2. 实现简单的图像分类
3. 构建图像特征提取器

### 练习4：智能推荐
1. 实现协同过滤推荐
2. 构建内容推荐系统
3. 评估推荐效果

## 常见问题

### Q1: 如何在 LLM API 与传统 ML 之间选择？
A: 任务通用、样本少、需要理解复杂语义 → LLM API；任务固定、有标注数据、调用量大或数据不能出域 → 传统 ML。两者也可以组合（见"LLM + 传统工具组合"一节）。

### Q2: 如何提高传统模型准确率？
A: 增加数据量、特征工程、模型调参、集成学习。

### Q3: 如何处理不平衡数据？
A: 使用过采样、欠采样、调整类别权重。

### Q4: 如何保护 API Key 并控制调用成本？
A: Key 一律放环境变量或密钥管理服务，绝不提交到代码仓库；批量任务先小样本试跑估算 token 用量，再上全量，并配合限速与失败重试。

## 下一步学习

完成今天的学习后，建议你：
1. 分别用云端 API 和本地 ollama 跑通一个分类任务
2. 用 scikit-learn 完成一次完整的训练-评估流程
3. 尝试设计一条"LLM 分类 + 规则路由"的自动化链路
4. 准备进入Day 14的学习：网页自动化

明天我们将学习如何使用Selenium进行网页自动化。
