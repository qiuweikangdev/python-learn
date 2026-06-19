# Deep-Agent API参考手册

## 概述

本章提供Deep-Agent框架的详细API参考，包括核心模块、类和方法的说明。

## 核心模块

### 1. torch.nn模块
PyTorch神经网络模块。

#### 基础层
```python
import torch.nn as nn

# 线性层
nn.Linear(in_features, out_features, bias=True)

# 卷积层
nn.Conv1d(in_channels, out_channels, kernel_size)
nn.Conv2d(in_channels, out_channels, kernel_size)

# 循环层
nn.RNN(input_size, hidden_size, num_layers)
nn.LSTM(input_size, hidden_size, num_layers)
nn.GRU(input_size, hidden_size, num_layers)

# 注意力层
nn.MultiheadAttention(embed_dim, num_heads)
```

#### 激活函数
```python
import torch.nn as nn

# ReLU
nn.ReLU()

# Sigmoid
nn.Sigmoid()

# Tanh
nn.Tanh()

# Softmax
nn.Softmax(dim=None)

# LeakyReLU
nn.LeakyReLU(negative_slope=0.01)
```

#### 损失函数
```python
import torch.nn as nn

# 均方误差损失
nn.MSELoss()

# 交叉熵损失
nn.CrossEntropyLoss()

# 二元交叉熵损失
nn.BCELoss()

# KL散度损失
nn.KLDivLoss()
```

### 2. torch.optim模块
PyTorch优化器模块。

#### 优化器
```python
import torch.optim as optim

# SGD优化器
optim.SGD(params, lr=0.01, momentum=0.9)

# Adam优化器
optim.Adam(params, lr=0.001, betas=(0.9, 0.999))

# AdamW优化器
optim.AdamW(params, lr=0.001, weight_decay=0.01)

# RMSprop优化器
optim.RMSprop(params, lr=0.01)
```

#### 学习率调度器
```python
import torch.optim.lr_scheduler as lr_scheduler

# 步长调度器
lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.1)

# 余弦退火调度器
lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)

# ReduceLROnPlateau
lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=10)
```

### 3. 自定义模块

#### 感知模块
```python
import torch
import torch.nn as nn

class PerceptionModule(nn.Module):
    """感知模块"""
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim)
        )
    
    def forward(self, x):
        return self.encoder(x)
```

#### 记忆模块
```python
import torch
import torch.nn as nn

class MemoryModule(nn.Module):
    """记忆模块"""
    def __init__(self, memory_size, embedding_dim):
        super().__init__()
        self.memory_size = memory_size
        self.embedding_dim = embedding_dim
        self.memory = nn.Parameter(torch.randn(memory_size, embedding_dim))
    
    def read(self, query):
        """读取记忆"""
        attention = torch.softmax(
            torch.mm(query, self.memory.t()), dim=-1
        )
        return torch.mm(attention, self.memory)
    
    def write(self, value):
        """写入记忆"""
        with torch.no_grad():
            # 简单的写入策略
            self.memory = torch.roll(self.memory, 1, dims=0)
            self.memory[0] = value
```

#### 决策模块
```python
import torch
import torch.nn as nn

class DecisionModule(nn.Module):
    """决策模块"""
    def __init__(self, state_dim, action_dim, hidden_dim=128):
        super().__init__()
        self.policy = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
            nn.Softmax(dim=-1)
        )
        
        self.value = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )
    
    def forward(self, state):
        action_probs = self.policy(state)
        state_value = self.value(state)
        return action_probs, state_value
```

#### 规划模块
```python
import torch
import torch.nn as nn

class PlanningModule(nn.Module):
    """规划模块"""
    def __init__(self, state_dim, action_dim, plan_length):
        super().__init__()
        self.plan_length = plan_length
        
        self.planner = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, plan_length * action_dim)
        )
    
    def forward(self, state):
        plan = self.planner(state)
        plan = plan.view(-1, self.plan_length, plan.size(-1) // self.plan_length)
        return plan
```

## 常用方法

### 1. 模型训练
```python
import torch
import torch.nn as nn
import torch.optim as optim

def train_model(model, train_loader, epochs=10, lr=0.001):
    """训练模型"""
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        
        for batch_idx, (data, target) in enumerate(train_loader):
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        avg_loss = total_loss / len(train_loader)
        print(f'Epoch [{epoch+1}/{epochs}], Loss: {avg_loss:.4f}')
```

### 2. 模型评估
```python
import torch

def evaluate_model(model, test_loader):
    """评估模型"""
    model.eval()
    correct = 0
    total = 0
    
    with torch.no_grad():
        for data, target in test_loader:
            output = model(data)
            _, predicted = torch.max(output.data, 1)
            total += target.size(0)
            correct += (predicted == target).sum().item()
    
    accuracy = 100 * correct / total
    print(f'Accuracy: {accuracy:.2f}%')
    return accuracy
```

### 3. 模型保存和加载
```python
import torch

def save_model(model, path):
    """保存模型"""
    torch.save(model.state_dict(), path)

def load_model(model, path):
    """加载模型"""
    model.load_state_dict(torch.load(path))
    model.eval()
    return model
```

### 4. 设备管理
```python
import torch

def get_device():
    """获取设备"""
    if torch.cuda.is_available():
        return torch.device('cuda')
    else:
        return torch.device('cpu')

def to_device(model, device):
    """将模型移到设备"""
    return model.to(device)
```

## 配置选项

### 1. 模型配置
```python
model_config = {
    'input_dim': 10,
    'hidden_dim': 128,
    'output_dim': 5,
    'num_layers': 3,
    'dropout': 0.1
}

model = PerceptionModule(**model_config)
```

### 2. 训练配置
```python
train_config = {
    'epochs': 100,
    'batch_size': 32,
    'learning_rate': 0.001,
    'weight_decay': 0.01,
    'scheduler': 'cosine'
}
```

### 3. 记忆配置
```python
memory_config = {
    'memory_size': 1000,
    'embedding_dim': 128,
    'read_heads': 4,
    'write_heads': 1
}
```

## 错误处理

### 1. 模型错误
```python
try:
    output = model(input)
except RuntimeError as e:
    print(f"Runtime error: {e}")
except Exception as e:
    print(f"Error: {e}")
```

### 2. 训练错误
```python
try:
    loss.backward()
except RuntimeError as e:
    if "out of memory" in str(e):
        # 处理内存不足
        torch.cuda.empty_cache()
    else:
        raise e
```

## 最佳实践

### 1. 模型设计
- **模块化设计**：将模型设计为模块化组件
- **可配置性**：使用配置文件管理参数
- **可扩展性**：设计可扩展的架构
- **可测试性**：设计可测试的接口

### 2. 训练优化
- **梯度累积**：处理大batch size
- **混合精度训练**：使用FP16加速训练
- **分布式训练**：使用多GPU训练
- **早停策略**：防止过拟合

### 3. 部署优化
- **模型量化**：减少模型大小
- **模型剪枝**：减少计算量
- **模型导出**：使用ONNX导出
- **服务化部署**：使用TorchServe部署

## 常见问题

### 1. 训练问题
- **不收敛**：调整学习率、优化器
- **过拟合**：增加数据、正则化
- **梯度消失/爆炸**：使用残差连接、梯度裁剪
- **训练不稳定**：调整超参数

### 2. 性能问题
- **推理慢**：优化模型结构、使用GPU
- **内存占用高**：减少模型大小、使用量化
- **计算资源不足**：使用分布式训练

### 3. 部署问题
- **模型导出失败**：检查模型结构
- **服务化部署问题**：检查依赖和配置
- **边缘部署问题**：使用模型压缩

## 下一步学习

- [架构设计](/day136-140/architecture) - Deep-Agent架构设计
- [Agent平台与服务](/day141-145/) - Agent系统的部署和运维
- [向量数据库](/day121-125/) - 向量数据库详解