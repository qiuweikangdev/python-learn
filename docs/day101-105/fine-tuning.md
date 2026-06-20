# 模型微调详解

## 概述

模型微调（Fine-tuning）是在预训练模型的基础上，使用特定任务的数据进行进一步训练，使模型适应特定领域或任务的技术。微调是LLM应用开发中的重要技术，可以让通用模型在特定场景下表现更好。

## 为什么需要微调？

### 预训练模型的局限

```
预训练模型（如GPT）的特点：

优势：
- 通用能力强
- 知识面广
- 语言理解好

局限：
- 不了解特定领域知识
- 输出格式可能不符合要求
- 对特定任务的指令理解不够精准
```

### 微调的目的

```
微调可以解决的问题：

1. 领域适配
   - 医疗领域：理解医学术语
   - 法律领域：理解法律条文
   - 金融领域：理解金融概念

2. 格式控制
   - 输出特定格式（JSON、表格等）
   - 遵循特定的输出规范
   - 保持一致的输出风格

3. 行为调整
   - 更好的指令遵循
   - 更少的幻觉
   - 更符合用户期望
```

## 微调方法对比

### 1. 全量微调（Full Fine-tuning）

**原理**：更新模型的所有参数。

```
全量微调过程：

预训练模型参数：θ
训练数据：D
学习率：η

更新规则：
θ_new = θ - η × ∇L(θ, D)

特点：
- 更新所有参数
- 需要大量计算资源
- 效果最好
- 容易过拟合
```

**代码示例**：

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments
from datasets import Dataset

def full_fine_tuning():
    """
    全量微调示例
    
    特点：
    - 更新模型所有参数
    - 需要大量GPU内存
    - 训练时间长
    - 效果最好
    """
    
    # 步骤1：加载预训练模型
    model_name = "gpt2"
    model = AutoModelForCausalLM.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # 设置padding token
    tokenizer.pad_token = tokenizer.eos_token
    
    # 步骤2：准备训练数据
    train_data = [
        {"text": "问题：什么是人工智能？回答：人工智能是计算机科学的一个分支。"},
        {"text": "问题：什么是机器学习？回答：机器学习是AI的子领域。"},
        {"text": "问题：什么是深度学习？回答：深度学习是机器学习的一种方法。"},
    ]
    
    dataset = Dataset.from_list(train_data)
    
    # 步骤3：数据预处理
    def preprocess_function(examples):
        """将文本转换为模型输入格式"""
        inputs = tokenizer(
            examples["text"],
            truncation=True,
            padding="max_length",
            max_length=128
        )
        inputs["labels"] = inputs["input_ids"].copy()
        return inputs
    
    tokenized_dataset = dataset.map(preprocess_function, batched=True)
    
    # 步骤4：设置训练参数
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        warmup_steps=100,
        weight_decay=0.01,
        logging_dir="./logs",
        logging_steps=10,
        save_strategy="epoch",
    )
    
    # 步骤5：创建Trainer并训练
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
    )
    
    # 开始训练
    trainer.train()
    
    # 保存模型
    trainer.save_model("./fine_tuned_model")
    tokenizer.save_pretrained("./fine_tuned_model")
    
    print("全量微调完成！")

# 运行示例
# full_fine_tuning()
```

**优缺点**：

| 优点 | 缺点 |
|------|------|
| 效果最好 | 需要大量GPU内存 |
| 能充分适配任务 | 训练时间长 |
| 灵活性高 | 容易过拟合 |
| | 存储开销大 |

---

### 2. LoRA（Low-Rank Adaptation）

**原理**：在原始权重矩阵旁边添加低秩矩阵，只训练低秩矩阵。

```
LoRA的核心思想：

原始权重矩阵：W (d × d)
LoRA分解：W + ΔW = W + B × A

其中：
- A: (r × d) 低秩矩阵
- B: (d × r) 低秩矩阵
- r << d (秩很小)

参数量对比：
- 全量微调：d × d 个参数
- LoRA：2 × r × d 个参数 (r << d)

示例：
- d = 4096, r = 8
- 全量：4096 × 4096 = 16,777,216 参数
- LoRA：2 × 8 × 4096 = 65,536 参数 (减少99.6%)
```

**代码示例**：

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, TaskType
from transformers import TrainingArguments, Trainer
from datasets import Dataset

def lora_fine_tuning():
    """
    LoRA微调示例
    
    特点：
    - 只训练低秩矩阵
    - 参数量大大减少
    - 训练速度快
    - 效果接近全量微调
    """
    
    # 步骤1：加载预训练模型
    model_name = "gpt2"
    model = AutoModelForCausalLM.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    # 步骤2：配置LoRA
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,  # 任务类型
        r=8,  # LoRA秩（越小参数越少）
        lora_alpha=32,  # LoRA缩放因子
        lora_dropout=0.1,  # Dropout比率
        target_modules=["c_attn", "c_proj"],  # 应用LoRA的模块
    )
    
    # 步骤3：应用LoRA
    model = get_peft_model(model, lora_config)
    
    # 打印可训练参数量
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"可训练参数：{trainable_params:,} / {total_params:,} ({100 * trainable_params / total_params:.2f}%)")
    
    # 步骤4：准备训练数据
    train_data = [
        {"text": "问题：什么是人工智能？回答：人工智能是计算机科学的一个分支。"},
        {"text": "问题：什么是机器学习？回答：机器学习是AI的子领域。"},
    ]
    
    dataset = Dataset.from_list(train_data)
    
    def preprocess_function(examples):
        inputs = tokenizer(examples["text"], truncation=True, padding="max_length", max_length=128)
        inputs["labels"] = inputs["input_ids"].copy()
        return inputs
    
    tokenized_dataset = dataset.map(preprocess_function, batched=True)
    
    # 步骤5：设置训练参数
    training_args = TrainingArguments(
        output_dir="./lora_results",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        warmup_steps=50,
        weight_decay=0.01,
        logging_steps=10,
        save_strategy="epoch",
    )
    
    # 步骤6：创建Trainer并训练
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
    )
    
    trainer.train()
    
    # 保存LoRA权重（只保存增量参数）
    model.save_pretrained("./lora_model")
    
    print("LoRA微调完成！")

# 运行示例
# lora_fine_tuning()
```

**LoRA的优势**：

| 对比维度 | 全量微调 | LoRA |
|----------|----------|------|
| 参数量 | 100% | 0.1% ~ 1% |
| GPU内存 | 很大 | 较小 |
| 训练时间 | 长 | 短 |
| 效果 | 最好 | 接近最好 |
| 存储开销 | 大 | 小 |

---

### 3. QLoRA（Quantized LoRA）

**原理**：在LoRA基础上，将基础模型量化为4bit，进一步减少内存占用。

```
QLoRA = 4bit量化 + LoRA

内存对比：
- 全量微调：16GB+ GPU内存
- LoRA：8GB GPU内存
- QLoRA：4GB GPU内存
```

**代码示例**：

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, TaskType, prepare_model_for_kbit_training

def qlora_fine_tuning():
    """
    QLoRA微调示例
    
    特点：
    - 基础模型量化为4bit
    - LoRA参数保持高精度
    - 内存占用极小
    - 适合消费级GPU
    """
    
    # 步骤1：配置量化参数
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,  # 启用4bit量化
        bnb_4bit_quant_type="nf4",  # 量化类型
        bnb_4bit_compute_dtype=torch.float16,  # 计算精度
        bnb_4bit_use_double_quant=True,  # 双重量化
    )
    
    # 步骤2：加载量化模型
    model_name = "gpt2"
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",  # 自动分配设备
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    # 步骤3：准备模型用于kbit训练
    model = prepare_model_for_kbit_training(model)
    
    # 步骤4：配置LoRA
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=8,
        lora_alpha=32,
        lora_dropout=0.1,
        target_modules=["c_attn", "c_proj"],
    )
    
    # 步骤5：应用LoRA
    model = get_peft_model(model, lora_config)
    
    # 打印可训练参数量
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"可训练参数：{trainable_params:,} / {total_params:,} ({100 * trainable_params / total_params:.2f}%)")
    
    # 后续训练步骤与LoRA相同
    print("QLoRA配置完成！")

# 运行示例
# qlora_fine_tuning()
```

---

### 4. Prefix Tuning

**原理**：在输入前添加可学习的前缀向量，只训练前缀参数。

```
Prefix Tuning：

输入：[prefix1, prefix2, ..., prefix_n, token1, token2, ...]
       ↑
       可学习的前缀

特点：
- 只训练前缀参数
- 不改变模型结构
- 参数量很小
```

**代码示例**：

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PrefixTuningConfig, get_peft_model, TaskType

def prefix_tuning_example():
    """
    Prefix Tuning示例
    
    特点：
    - 在输入前添加可学习的前缀
    - 只训练前缀参数
    - 参数量极小
    """
    
    # 步骤1：加载模型
    model_name = "gpt2"
    model = AutoModelForCausalLM.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    # 步骤2：配置Prefix Tuning
    prefix_config = PrefixTuningConfig(
        task_type=TaskType.CAUSAL_LM,
        num_virtual_tokens=20,  # 前缀token数量
    )
    
    # 步骤3：应用Prefix Tuning
    model = get_peft_model(model, prefix_config)
    
    # 打印可训练参数量
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"可训练参数：{trainable_params:,} / {total_params:,} ({100 * trainable_params / total_params:.2f}%)")
    
    print("Prefix Tuning配置完成！")

# 运行示例
# prefix_tuning_example()
```

---

### 5. Prompt Tuning

**原理**：在输入embedding层添加可学习的prompt向量。

```
Prompt Tuning：

输入embedding = token_embedding + prompt_embedding

特点：
- 只训练prompt参数
- 参数量最小
- 适合少样本场景
```

**代码示例**：

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PromptTuningConfig, get_peft_model, TaskType, PromptTuningInit

def prompt_tuning_example():
    """
    Prompt Tuning示例
    
    特点：
    - 在embedding层添加可学习的prompt
    - 参数量最小
    - 适合少样本学习
    """
    
    # 步骤1：加载模型
    model_name = "gpt2"
    model = AutoModelForCausalLM.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    # 步骤2：配置Prompt Tuning
    prompt_config = PromptTuningConfig(
        task_type=TaskType.CAUSAL_LM,
        prompt_tuning_init=PromptTuningInit.RANDOM,  # 随机初始化
        num_virtual_tokens=10,  # prompt token数量
    )
    
    # 步骤3：应用Prompt Tuning
    model = get_peft_model(model, prompt_config)
    
    # 打印可训练参数量
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"可训练参数：{trainable_params:,} / {total_params:,} ({100 * trainable_params / total_params:.2f}%)")
    
    print("Prompt Tuning配置完成！")

# 运行示例
# prompt_tuning_example()
```

---

## 微调方法对比总结

| 方法 | 原理 | 参数量 | GPU内存 | 效果 | 适用场景 |
|------|------|--------|---------|------|----------|
| **全量微调** | 更新所有参数 | 100% | 很大 | 最好 | 充足资源、追求最佳效果 |
| **LoRA** | 低秩分解 | 0.1%~1% | 中等 | 接近最好 | 资源有限、快速迭代 |
| **QLoRA** | 4bit量化+LoRA | 0.1%~1% | 很小 | 接近最好 | 消费级GPU、资源紧张 |
| **Prefix Tuning** | 添加前缀 | <1% | 小 | 良好 | 少样本、快速适配 |
| **Prompt Tuning** | 添加prompt | <0.1% | 最小 | 良好 | 极少样本、轻量级 |

## 微调流程

### 完整的微调流程

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, TaskType
from datasets import Dataset
from trl import SFTTrainer

def complete_fine_tuning_pipeline():
    """
    完整的微调流程
    
    流程：
    1. 准备数据
    2. 加载模型
    3. 配置微调方法
    4. 训练
    5. 评估
    6. 保存和部署
    """
    
    # ==================== 1. 准备数据 ====================
    
    def prepare_dataset():
        """
        准备训练数据
        
        数据格式：
        - 指令格式：{"instruction": "...", "input": "...", "output": "..."}
        - 对话格式：{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
        """
        # 示例数据
        data = [
            {
                "instruction": "解释什么是人工智能",
                "input": "",
                "output": "人工智能（AI）是计算机科学的一个分支，致力于创建能够模拟人类智能的系统。"
            },
            {
                "instruction": "将以下文本翻译成英文",
                "input": "人工智能是未来的发展方向",
                "output": "Artificial intelligence is the future direction of development."
            },
        ]
        
        return Dataset.from_list(data)
    
    # ==================== 2. 加载模型 ====================
    
    def load_model(model_name: str):
        """加载预训练模型和tokenizer"""
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto",
        )
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        tokenizer.pad_token = tokenizer.eos_token
        return model, tokenizer
    
    # ==================== 3. 配置微调方法 ====================
    
    def configure_lora(model):
        """配置LoRA"""
        lora_config = LoraConfig(
            task_type=TaskType.CAUSAL_LM,
            r=16,
            lora_alpha=32,
            lora_dropout=0.1,
            target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
        )
        model = get_peft_model(model, lora_config)
        model.print_trainable_parameters()
        return model
    
    # ==================== 4. 训练 ====================
    
    def train_model(model, tokenizer, dataset):
        """训练模型"""
        # 数据预处理
        def preprocess_function(examples):
            # 格式化为训练格式
            texts = []
            for i in range(len(examples["instruction"])):
                text = f"指令：{examples['instruction'][i]}\n输入：{examples['input'][i]}\n输出：{examples['output'][i]}"
                texts.append(text)
            
            inputs = tokenizer(texts, truncation=True, padding="max_length", max_length=256)
            inputs["labels"] = inputs["input_ids"].copy()
            return inputs
        
        tokenized_dataset = dataset.map(preprocess_function, batched=True)
        
        # 训练参数
        training_args = TrainingArguments(
            output_dir="./results",
            num_train_epochs=3,
            per_device_train_batch_size=4,
            gradient_accumulation_steps=4,
            warmup_steps=100,
            weight_decay=0.01,
            logging_steps=10,
            save_strategy="steps",
            save_steps=200,
            evaluation_strategy="steps",
            eval_steps=200,
            load_best_model_at_end=True,
        )
        
        # 创建Trainer
        trainer = SFTTrainer(
            model=model,
            args=training_args,
            train_dataset=tokenized_dataset,
            tokenizer=tokenizer,
            max_seq_length=256,
        )
        
        # 开始训练
        trainer.train()
        
        return trainer
    
    # ==================== 5. 评估 ====================
    
    def evaluate_model(model, tokenizer, test_prompts):
        """评估模型"""
        model.eval()
        
        for prompt in test_prompts:
            inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
            
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=100,
                    temperature=0.7,
                    do_sample=True,
                )
            
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            print(f"输入：{prompt}")
            print(f"输出：{response}")
            print("-" * 50)
    
    # ==================== 6. 保存和部署 ====================
    
    def save_model(model, tokenizer, save_path):
        """保存模型"""
        model.save_pretrained(save_path)
        tokenizer.save_pretrained(save_path)
        print(f"模型已保存到：{save_path}")
    
    # 执行完整流程
    dataset = prepare_dataset()
    model, tokenizer = load_model("gpt2")
    model = configure_lora(model)
    trainer = train_model(model, tokenizer, dataset)
    
    # 评估
    test_prompts = ["指令：解释什么是机器学习\n输入：\n输出："]
    evaluate_model(model, tokenizer, test_prompts)
    
    # 保存
    save_model(model, tokenizer, "./fine_tuned_model")

# 运行示例
# complete_fine_tuning_pipeline()
```

## 使用OpenAI微调API

### OpenAI微调流程

```python
import openai
import json

def openai_fine_tuning():
    """
    使用OpenAI API进行微调
    
    流程：
    1. 准备训练数据
    2. 上传数据
    3. 创建微调任务
    4. 监控训练
    5. 使用微调模型
    """
    
    # 步骤1：准备训练数据
    # 格式：{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
    training_data = [
        {
            "messages": [
                {"role": "system", "content": "你是一个专业的医疗助手。"},
                {"role": "user", "content": "什么是高血压？"},
                {"role": "assistant", "content": "高血压是指血液在血管中流动时对血管壁产生的压力持续高于正常值的状态。"}
            ]
        },
        {
            "messages": [
                {"role": "system", "content": "你是一个专业的医疗助手。"},
                {"role": "user", "content": "如何预防糖尿病？"},
                {"role": "assistant", "content": "预防糖尿病的方法包括：保持健康饮食、定期运动、控制体重、定期体检等。"}
            ]
        },
    ]
    
    # 保存为JSONL文件
    with open("training_data.jsonl", "w", encoding="utf-8") as f:
        for data in training_data:
            f.write(json.dumps(data, ensure_ascii=False) + "\n")
    
    # 步骤2：上传数据
    client = openai.OpenAI()
    
    with open("training_data.jsonl", "rb") as f:
        file = client.files.create(
            file=f,
            purpose="fine-tune"
        )
    
    print(f"文件已上传，文件ID：{file.id}")
    
    # 步骤3：创建微调任务
    job = client.fine_tuning.jobs.create(
        training_file=file.id,
        model="gpt-3.5-turbo",
        hyperparameters={
            "n_epochs": 3,
        }
    )
    
    print(f"微调任务已创建，任务ID：{job.id}")
    
    # 步骤4：监控训练
    # 可以通过API查询训练状态
    # job = client.fine_tuning.jobs.retrieve(job.id)
    
    # 步骤5：使用微调模型
    # model_name = job.fine_tuned_model
    # response = client.chat.completions.create(
    #     model=model_name,
    #     messages=[{"role": "user", "content": "什么是高血压？"}]
    # )

# 运行示例
# openai_fine_tuning()
```

## 微调最佳实践

### 1. 数据准备

```python
def prepare_high_quality_data():
    """
    高质量数据准备指南
    
    数据质量 > 数据数量
    """
    
    # 好的数据示例
    good_data = [
        {
            "instruction": "将以下文本分类为正面或负面情感",
            "input": "这个产品太棒了，强烈推荐！",
            "output": "正面情感"
        },
        {
            "instruction": "将以下文本分类为正面或负面情感",
            "input": "质量很差，非常失望。",
            "output": "负面情感"
        },
    ]
    
    # 数据要求：
    # 1. 指令清晰明确
    # 2. 输出格式一致
    # 3. 覆盖各种情况
    # 4. 避免噪声数据
    
    return good_data
```

### 2. 超参数调优

```python
def get_optimal_hyperparameters():
    """
    推荐的超参数配置
    """
    
    # LoRA推荐配置
    lora_config = {
        "r": 16,  # 秩，8-64之间
        "lora_alpha": 32,  # 缩放因子，通常是r的2倍
        "lora_dropout": 0.1,  # Dropout比率
        "target_modules": ["q_proj", "v_proj", "k_proj", "o_proj"],  # 目标模块
    }
    
    # 训练参数推荐
    training_args = {
        "num_train_epochs": 3,  # 训练轮数
        "per_device_train_batch_size": 4,  # 批次大小
        "gradient_accumulation_steps": 4,  # 梯度累积
        "learning_rate": 2e-4,  # 学习率
        "warmup_steps": 100,  # 预热步数
        "weight_decay": 0.01,  # 权重衰减
    }
    
    return lora_config, training_args
```

## 总结

### 选择微调方法的建议

```
资源充足 + 追求最佳效果 → 全量微调
资源有限 + 快速迭代 → LoRA
消费级GPU + 资源紧张 → QLoRA
少样本 + 轻量级 → Prefix Tuning / Prompt Tuning
```

### 微调的注意事项

1. **数据质量**：高质量数据比大量数据更重要
2. **过拟合**：使用验证集监控过拟合
3. **评估**：使用多个指标评估模型效果
4. **成本**：考虑训练和推理成本

## 下一步学习

- [Transformer原理](/day101-105/transformer) - 理解模型架构
- [OpenAI API详解](/day101-105/openai-api) - 学习使用模型
- [提示工程](/day101-105/prompt-engineering) - 不微调也能优化效果
