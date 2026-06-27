# Day 13: AI自动化基础

## 学习目标

完成今天的学习后，你将能够：
- 理解机器学习基础概念
- 使用Python进行自然语言处理
- 实现图像识别
- 构建智能决策系统

## 技术原理

### 机器学习基础

1. **监督学习**：分类、回归
2. **无监督学习**：聚类、降维
3. **强化学习**：奖励驱动

### 常用库

- **scikit-learn**：传统机器学习
- **TensorFlow/PyTorch**：深度学习
- **NLTK/spaCy**：自然语言处理
- **OpenCV**：图像处理

## 案例：智能自动化系统

构建一个智能自动化系统，实现：
1. 文本分类和情感分析
2. 图像识别和分类
3. 智能推荐
4. 异常检测

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

### 案例1：文本分类

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文本分类器
功能：使用机器学习进行文本分类
"""

import numpy as np
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

### 案例2：异常检测

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

## 课后练习

### 练习1：文本处理
1. 实现文本情感分析
2. 构建关键词提取器
3. 实现文本摘要

### 练习2：图像识别
1. 使用OpenCV进行图像处理
2. 实现简单的图像分类
3. 构建图像特征提取器

### 练习3：智能推荐
1. 实现协同过滤推荐
2. 构建内容推荐系统
3. 评估推荐效果

## 常见问题

### Q1: 如何选择机器学习模型？
A: 根据问题类型、数据量、特征数量选择。

### Q2: 如何提高模型准确率？
A: 增加数据量、特征工程、模型调参、集成学习。

### Q3: 如何处理不平衡数据？
A: 使用过采样、欠采样、调整类别权重。

## 下一步学习

完成今天的学习后，建议你：
1. 实践机器学习项目
2. 了解深度学习基础
3. 尝试AI自动化应用
4. 准备进入Day 14的学习：网页自动化

明天我们将学习如何使用Selenium进行网页自动化。