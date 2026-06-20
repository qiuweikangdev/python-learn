# Transformer原理详解

## 概述

Transformer是现代大语言模型的核心架构，由Google在2017年的论文《Attention Is All You Need》中提出。理解Transformer的原理对于掌握LLM应用开发至关重要。

## 为什么需要Transformer？

### 传统RNN/LSTM的局限

**RNN（循环神经网络）的问题**：

```
输入序列：x1 → x2 → x3 → x4

RNN处理方式：
h1 = f(x1)
h2 = f(x2, h1)
h3 = f(x3, h2)
h4 = f(x4, h3)

问题：
1. 串行处理，无法并行 → 训练慢
2. 长距离依赖问题 → 难以捕捉远距离关系
3. 梯度消失/爆炸 → 深层网络训练困难
```

**LSTM的改进**：
- 添加门控机制（遗忘门、输入门、输出门）
- 缓解梯度消失问题
- 但仍然是串行处理，效率低

### Transformer的突破

**核心创新：自注意力机制（Self-Attention）**

```
Transformer处理方式：
输入：x1, x2, x3, x4

自注意力计算：
- 每个位置可以同时关注所有其他位置
- 并行计算，效率高
- 直接捕捉长距离依赖

优势：
1. 并行处理 → 训练快
2. 直接连接 → 长距离依赖
3. 灵活的注意力模式 → 更强的表达能力
```

## Transformer架构

### 整体架构

```
┌─────────────────────────────────────────┐
│              Transformer                │
│                                         │
│  ┌─────────────┐    ┌─────────────┐    │
│  │   Encoder   │    │   Decoder   │    │
│  │  (编码器)    │    │  (解码器)    │    │
│  └─────────────┘    └─────────────┘    │
│         ↑                   ↑           │
│         │                   │           │
│    ┌────┴────┐         ┌────┴────┐      │
│    │ 输入嵌入 │         │ 输出嵌入 │      │
│    └─────────┘         └─────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

**编码器（Encoder）**：
- 将输入序列编码为隐藏表示
- 捕捉输入序列的语义信息
- 用于理解任务（如BERT）

**解码器（Decoder）**：
- 基于编码器的输出生成目标序列
- 自回归生成，逐步预测下一个token
- 用于生成任务（如GPT）

### 编码器结构

```
┌─────────────────────────────┐
│         Encoder Layer       │
│                             │
│  ┌───────────────────────┐  │
│  │  Multi-Head Attention │  │
│  └───────────────────────┘  │
│              ↓              │
│  ┌───────────────────────┐  │
│  │  Add & Norm           │  │
│  └───────────────────────┘  │
│              ↓              │
│  ┌───────────────────────┐  │
│  │  Feed Forward Network │  │
│  └───────────────────────┘  │
│              ↓              │
│  ┌───────────────────────┐  │
│  │  Add & Norm           │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### 解码器结构

```
┌─────────────────────────────┐
│         Decoder Layer       │
│                             │
│  ┌───────────────────────┐  │
│  │  Masked Multi-Head    │  │
│  │  Attention            │  │
│  └───────────────────────┘  │
│              ↓              │
│  ┌───────────────────────┐  │
│  │  Add & Norm           │  │
│  └───────────────────────┘  │
│              ↓              │
│  ┌───────────────────────┐  │
│  │  Multi-Head Attention │  │  ← 与编码器连接
│  │  (Encoder-Decoder)    │  │
│  └───────────────────────┘  │
│              ↓              │
│  ┌───────────────────────┐  │
│  │  Add & Norm           │  │
│  └───────────────────────┘  │
│              ↓              │
│  ┌───────────────────────┐  │
│  │  Feed Forward Network │  │
│  └───────────────────────┘  │
│              ↓              │
│  ┌───────────────────────┐  │
│  │  Add & Norm           │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

## 核心机制详解

### 1. 自注意力机制（Self-Attention）

**核心思想**：让每个位置能够关注序列中的所有其他位置。

**计算过程**：

```
输入：X = [x1, x2, x3, ...]  (每个xi是一个向量)

步骤1：生成Query、Key、Value
Q = X × Wq  (查询向量)
K = X × Wk  (键向量)
V = X × Wv  (值向量)

步骤2：计算注意力分数
Scores = Q × K^T / √dk

步骤3：应用Softmax
Attention = Softmax(Scores)

步骤4：加权求和
Output = Attention × V
```

**代码实现**：

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class SelfAttention(nn.Module):
    """
    自注意力机制实现
    
    核心思想：让每个位置能够关注序列中的所有其他位置
    
    输入：形状为 (batch_size, seq_len, d_model) 的张量
    输出：形状为 (batch_size, seq_len, d_model) 的张量
    """
    
    def __init__(self, d_model: int, d_k: int):
        """
        初始化自注意力层
        
        Args:
            d_model: 模型维度（输入和输出维度）
            d_k: Query和Key的维度
        """
        super().__init__()
        self.d_k = d_k
        
        # 线性变换矩阵
        self.W_q = nn.Linear(d_model, d_k)  # Query变换
        self.W_k = nn.Linear(d_model, d_k)  # Key变换
        self.W_v = nn.Linear(d_model, d_k)  # Value变换
    
    def forward(self, X):
        """
        前向传播
        
        Args:
            X: 输入张量，形状 (batch_size, seq_len, d_model)
        
        Returns:
            输出张量，形状 (batch_size, seq_len, d_k)
        """
        # 步骤1：生成Q、K、V
        Q = self.W_q(X)  # (batch_size, seq_len, d_k)
        K = self.W_k(X)  # (batch_size, seq_len, d_k)
        V = self.W_v(X)  # (batch_size, seq_len, d_k)
        
        # 步骤2：计算注意力分数
        # Q × K^T，然后除以 √dk 进行缩放
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        # scores 形状：(batch_size, seq_len, seq_len)
        
        # 步骤3：应用Softmax
        attention_weights = F.softmax(scores, dim=-1)
        # attention_weights 形状：(batch_size, seq_len, seq_len)
        
        # 步骤4：加权求和
        output = torch.matmul(attention_weights, V)
        # output 形状：(batch_size, seq_len, d_k)
        
        return output

# 使用示例
batch_size = 2
seq_len = 4
d_model = 512
d_k = 64

# 创建输入
X = torch.randn(batch_size, seq_len, d_model)

# 创建自注意力层
attention = SelfAttention(d_model, d_k)

# 前向传播
output = attention(X)
print(f"输入形状：{X.shape}")
print(f"输出形状：{output.shape}")
```

**为什么需要缩放（除以√dk）？**

```python
# 如果不缩放，当dk很大时，点积值会很大
# 大的点积值会导致Softmax梯度很小，训练困难

# 示例：
# dk = 64 时
# 点积值范围：[-8, 8] （假设Q、K是标准正态分布）
# Softmax梯度：适中

# dk = 512 时
# 点积值范围：[-22, 22]
# Softmax梯度：非常小，训练困难

# 解决方案：除以 √dk
# 缩放后点积值范围：[-1, 1]
# Softmax梯度：适中
```

### 2. 多头注意力（Multi-Head Attention）

**核心思想**：使用多个注意力头，让模型能够关注不同方面的信息。

```
多头注意力：

输入 X
    ↓
┌───────────────────────────────────────┐
│  头1：Q1, K1, V1 → Attention1         │
│  头2：Q2, K2, V2 → Attention2         │
│  头3：Q3, K3, V3 → Attention3         │
│  ...                                  │
│  头h：Qh, Kh, Vh → Attentionh         │
└───────────────────────────────────────┘
    ↓
Concat(Attention1, Attention2, ..., Attentionh)
    ↓
线性变换 → 输出
```

**代码实现**：

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class MultiHeadAttention(nn.Module):
    """
    多头注意力机制
    
    核心思想：使用多个注意力头，让模型能够关注不同方面的信息
    例如：一个头关注语法结构，另一个头关注语义关系
    """
    
    def __init__(self, d_model: int, num_heads: int):
        """
        初始化多头注意力层
        
        Args:
            d_model: 模型维度
            num_heads: 注意力头的数量
        """
        super().__init__()
        
        assert d_model % num_heads == 0, "d_model必须能被num_heads整除"
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads  # 每个头的维度
        
        # 线性变换矩阵
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)  # 输出变换
    
    def forward(self, Q, K, V, mask=None):
        """
        前向传播
        
        Args:
            Q: Query张量，形状 (batch_size, seq_len, d_model)
            K: Key张量，形状 (batch_size, seq_len, d_model)
            V: Value张量，形状 (batch_size, seq_len, d_model)
            mask: 可选的掩码张量
        
        Returns:
            输出张量，形状 (batch_size, seq_len, d_model)
        """
        batch_size = Q.size(0)
        
        # 步骤1：线性变换
        Q = self.W_q(Q)  # (batch_size, seq_len, d_model)
        K = self.W_k(K)  # (batch_size, seq_len, d_model)
        V = self.W_v(V)  # (batch_size, seq_len, d_model)
        
        # 步骤2：分割成多个头
        # (batch_size, seq_len, d_model) -> (batch_size, num_heads, seq_len, d_k)
        Q = Q.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = K.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = V.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # 步骤3：计算注意力
        # scores = Q × K^T / √dk
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        # 应用掩码（如果有）
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        # Softmax
        attention_weights = F.softmax(scores, dim=-1)
        
        # 加权求和
        attention_output = torch.matmul(attention_weights, V)
        # attention_output 形状：(batch_size, num_heads, seq_len, d_k)
        
        # 步骤4：合并多个头
        # (batch_size, num_heads, seq_len, d_k) -> (batch_size, seq_len, d_model)
        attention_output = attention_output.transpose(1, 2).contiguous()
        attention_output = attention_output.view(batch_size, -1, self.d_model)
        
        # 步骤5：输出线性变换
        output = self.W_o(attention_output)
        
        return output

# 使用示例
batch_size = 2
seq_len = 4
d_model = 512
num_heads = 8

# 创建输入
Q = torch.randn(batch_size, seq_len, d_model)
K = torch.randn(batch_size, seq_len, d_model)
V = torch.randn(batch_size, seq_len, d_model)

# 创建多头注意力层
multi_head_attention = MultiHeadAttention(d_model, num_heads)

# 前向传播
output = multi_head_attention(Q, K, V)
print(f"输入形状：{Q.shape}")
print(f"输出形状：{output.shape}")
```

### 3. 位置编码（Positional Encoding）

**问题**：Transformer没有循环结构，无法感知位置信息。

**解决方案**：添加位置编码，让模型知道每个token的位置。

```
位置编码公式：

PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

其中：
- pos：位置
- i：维度索引
- d_model：模型维度
```

**代码实现**：

```python
import torch
import torch.nn as nn
import math

class PositionalEncoding(nn.Module):
    """
    位置编码
    
    为Transformer提供位置信息，因为Transformer本身没有位置感知能力
    
    使用正弦和余弦函数生成位置编码，具有以下特点：
    1. 每个位置的编码是唯一的
    2. 可以推广到更长的序列
    3. 编码之间的相对位置关系可以通过线性变换捕捉
    """
    
    def __init__(self, d_model: int, max_len: int = 5000):
        """
        初始化位置编码
        
        Args:
            d_model: 模型维度
            max_len: 最大序列长度
        """
        super().__init__()
        
        # 创建位置编码矩阵
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        
        # 计算正弦和余弦位置编码
        pe[:, 0::2] = torch.sin(position * div_term)  # 偶数维度
        pe[:, 1::2] = torch.cos(position * div_term)  # 奇数维度
        
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        
        # 注册为缓冲区（不参与梯度计算）
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        """
        前向传播
        
        Args:
            x: 输入张量，形状 (batch_size, seq_len, d_model)
        
        Returns:
            添加位置编码后的张量
        """
        # 将位置编码添加到输入
        x = x + self.pe[:, :x.size(1), :]
        return x

# 使用示例
batch_size = 2
seq_len = 10
d_model = 512

# 创建输入
x = torch.randn(batch_size, seq_len, d_model)

# 创建位置编码
pos_encoding = PositionalEncoding(d_model)

# 添加位置编码
output = pos_encoding(x)
print(f"输入形状：{x.shape}")
print(f"输出形状：{output.shape}")

# 可视化位置编码
import matplotlib.pyplot as plt
import numpy as np

pe = pos_encoding.pe[0].numpy()
plt.figure(figsize=(10, 5))
plt.imshow(pe[:50, :64].T, aspect='auto', cmap='RdBu')
plt.xlabel('位置')
plt.ylabel('维度')
plt.title('位置编码可视化')
plt.colorbar()
plt.show()
```

### 4. 前馈网络（Feed-Forward Network）

**作用**：对每个位置的表示进行非线性变换。

```
前馈网络结构：

输入 x
    ↓
线性变换1：x × W1 + b1
    ↓
激活函数（ReLU/GELU）
    ↓
线性变换2：x × W2 + b2
    ↓
输出
```

**代码实现**：

```python
import torch
import torch.nn as nn

class FeedForward(nn.Module):
    """
    前馈网络
    
    对每个位置的表示进行非线性变换，增强模型的表达能力
    
    结构：Linear -> Activation -> Dropout -> Linear -> Dropout
    """
    
    def __init__(self, d_model: int, d_ff: int, dropout: float = 0.1):
        """
        初始化前馈网络
        
        Args:
            d_model: 模型维度
            d_ff: 前馈网络的隐藏层维度（通常是d_model的4倍）
            dropout: Dropout比率
        """
        super().__init__()
        
        # 两层线性变换
        self.linear1 = nn.Linear(d_model, d_ff)  # 升维
        self.linear2 = nn.Linear(d_ff, d_model)  # 降维
        
        # 激活函数（GELU比ReLU效果更好）
        self.activation = nn.GELU()
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x):
        """
        前向传播
        
        Args:
            x: 输入张量，形状 (batch_size, seq_len, d_model)
        
        Returns:
            输出张量，形状 (batch_size, seq_len, d_model)
        """
        # 第一层：升维 + 激活
        x = self.linear1(x)  # (batch_size, seq_len, d_ff)
        x = self.activation(x)  # 激活函数
        x = self.dropout(x)  # Dropout
        
        # 第二层：降维
        x = self.linear2(x)  # (batch_size, seq_len, d_model)
        x = self.dropout(x)  # Dropout
        
        return x

# 使用示例
batch_size = 2
seq_len = 4
d_model = 512
d_ff = 2048

# 创建输入
x = torch.randn(batch_size, seq_len, d_model)

# 创建前馈网络
ffn = FeedForward(d_model, d_ff)

# 前向传播
output = ffn(x)
print(f"输入形状：{x.shape}")
print(f"输出形状：{output.shape}")
```

## 从Transformer到GPT/BERT

### GPT：Decoder-Only架构

```
GPT架构特点：
- 只使用解码器
- 自回归生成（从左到右）
- 使用Masked Attention（只能看到之前的token）

应用：
- 文本生成
- 对话系统
- 代码生成
```

### BERT：Encoder-Only架构

```
BERT架构特点：
- 只使用编码器
- 双向注意力（可以看到所有token）
- 使用Masked Language Model训练

应用：
- 文本分类
- 命名实体识别
- 问答系统
```

### T5：Encoder-Decoder架构

```
T5架构特点：
- 同时使用编码器和解码器
- 将所有任务转化为文本到文本格式
- 统一的训练框架

应用：
- 翻译
- 摘要
- 问答
```

## 完整的Transformer实现

```python
import torch
import torch.nn as nn
import math

class TransformerBlock(nn.Module):
    """
    Transformer块
    
    包含多头注意力和前馈网络，是Transformer的基本构建单元
    """
    
    def __init__(self, d_model: int, num_heads: int, d_ff: int, dropout: float = 0.1):
        """
        初始化Transformer块
        
        Args:
            d_model: 模型维度
            num_heads: 注意力头数
            d_ff: 前馈网络隐藏层维度
            dropout: Dropout比率
        """
        super().__init__()
        
        # 多头注意力
        self.attention = MultiHeadAttention(d_model, num_heads)
        
        # 前馈网络
        self.ffn = FeedForward(d_model, d_ff, dropout)
        
        # 层归一化
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        """
        前向传播
        
        Args:
            x: 输入张量
            mask: 可选掩码
        
        Returns:
            输出张量
        """
        # 多头注意力 + 残差连接 + 层归一化
        attention_output = self.attention(x, x, x, mask)
        x = self.norm1(x + self.dropout(attention_output))
        
        # 前馈网络 + 残差连接 + 层归一化
        ffn_output = self.ffn(x)
        x = self.norm2(x + self.dropout(ffn_output))
        
        return x

class Transformer(nn.Module):
    """
    完整的Transformer模型
    """
    
    def __init__(self, vocab_size: int, d_model: int, num_heads: int, 
                 num_layers: int, d_ff: int, max_len: int, dropout: float = 0.1):
        """
        初始化Transformer
        
        Args:
            vocab_size: 词表大小
            d_model: 模型维度
            num_heads: 注意力头数
            num_layers: Transformer层数
            d_ff: 前馈网络隐藏层维度
            max_len: 最大序列长度
            dropout: Dropout比率
        """
        super().__init__()
        
        # 词嵌入
        self.embedding = nn.Embedding(vocab_size, d_model)
        
        # 位置编码
        self.positional_encoding = PositionalEncoding(d_model, max_len)
        
        # Transformer层
        self.layers = nn.ModuleList([
            TransformerBlock(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        
        # 输出层
        self.output_layer = nn.Linear(d_model, vocab_size)
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        """
        前向传播
        
        Args:
            x: 输入token序列，形状 (batch_size, seq_len)
            mask: 可选掩码
        
        Returns:
            输出logits，形状 (batch_size, seq_len, vocab_size)
        """
        # 词嵌入
        x = self.embedding(x)  # (batch_size, seq_len, d_model)
        
        # 添加位置编码
        x = self.positional_encoding(x)
        
        # Dropout
        x = self.dropout(x)
        
        # 通过Transformer层
        for layer in self.layers:
            x = layer(x, mask)
        
        # 输出层
        output = self.output_layer(x)
        
        return output

# 使用示例
vocab_size = 10000
d_model = 512
num_heads = 8
num_layers = 6
d_ff = 2048
max_len = 100

# 创建模型
model = Transformer(vocab_size, d_model, num_heads, num_layers, d_ff, max_len)

# 创建输入
batch_size = 2
seq_len = 10
x = torch.randint(0, vocab_size, (batch_size, seq_len))

# 前向传播
output = model(x)
print(f"输入形状：{x.shape}")
print(f"输出形状：{output.shape}")

# 计算参数数量
total_params = sum(p.numel() for p in model.parameters())
print(f"总参数数量：{total_params:,}")
```

## 总结

### Transformer的核心创新

1. **自注意力机制**：让每个位置能够关注所有其他位置
2. **多头注意力**：同时关注不同方面的信息
3. **位置编码**：为模型提供位置信息
4. **残差连接**：缓解梯度消失问题
5. **层归一化**：稳定训练过程

### 为什么Transformer适合LLM？

1. **并行计算**：训练效率高
2. **长距离依赖**：能够捕捉远距离关系
3. **可扩展性**：容易扩展到更大规模
4. **通用性**：适用于各种NLP任务

## 下一步学习

- [OpenAI API详解](/day101-105/openai-api) - 学习使用GPT模型
- [提示工程](/day101-105/prompt-engineering) - 掌握提示设计技巧
- [模型微调](/day101-105/fine-tuning) - 学习如何微调模型
