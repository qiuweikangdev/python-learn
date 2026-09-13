# ChatDev详解

> **版本基线**：本文基于 LangChain 1.x / LangGraph 1.x（2025-10 GA），示例模型 gpt-5-mini，更新于 2026-09。

## 概述

ChatDev是一个基于角色的虚拟软件公司框架，模拟真实的软件开发团队。它通过角色扮演和对话协作，实现高效的软件开发。

::: warning 项目状态（2026-09）
ChatDev 是 2023 年由 OpenBMB 推出的早期探索项目，具历史价值；它是**开源项目而非 pip 库**（需克隆仓库运行），更新放缓，更适合教学演示。生产环境的多 Agent 协作建议使用 LangGraph、CrewAI 等。

## 核心概念

### 1. 虚拟公司（Virtual Company）
ChatDev的虚拟公司概念：
- **公司结构**：模拟真实的公司结构
- **角色分工**：明确的角色分工
- **工作流程**：标准化的工作流程
- **协作机制**：高效的协作机制

### 2. 角色定义（Role Definition）
ChatDev的角色定义：
- **CEO**：首席执行官，负责决策
- **CTO**：首席技术官，负责技术
- **程序员**：负责代码实现
- **测试员**：负责测试和质量保证
- **设计师**：负责UI/UX设计

### 3. 对话链（Chat Chain）
ChatDev的对话链机制：
- **阶段划分**：将开发过程划分为多个阶段
- **对话驱动**：通过对话驱动开发过程
- **任务分配**：在对话中分配任务
- **结果验证**：在对话中验证结果

### 4. 文档生成（Document Generation）
ChatDev的文档生成能力：
- **需求文档**：自动生成需求文档
- **设计文档**：自动生成设计文档
- **代码文档**：自动生成代码文档
- **测试文档**：自动生成测试文档

## 核心API

### 1. 安装和配置
```bash
# 克隆ChatDev仓库
git clone https://github.com/OpenBMB/ChatDev.git
cd ChatDev

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
export OPENAI_API_KEY="your-api-key"
```

### 2. 运行ChatDev
```bash
# 运行ChatDev
python run.py --task "开发一个简单的计算器应用" --name "CalculatorCompany"
```

### 3. 自定义配置
```python
# 配置文件
config = {
    "company_name": "MyCompany",
    "task": "开发一个Web应用",
    "roles": ["CEO", "CTO", "Programmer", "Tester"],
    "phases": ["demand", "design", "coding", "testing"]
}
```

### 4. 角色配置
```python
# 角色配置
role_config = {
    "CEO": {
        "name": "张三",
        "profile": "资深管理者，擅长决策",
        "skills": ["决策", "沟通", "协调"]
    },
    "Programmer": {
        "name": "李四",
        "profile": "全栈开发者",
        "skills": ["Python", "JavaScript", "数据库"]
    }
}
```

## 实践指南

### 1. 环境准备
```bash
# 克隆仓库
git clone https://github.com/OpenBMB/ChatDev.git
cd ChatDev

# 安装依赖
pip install -r requirements.txt

# 配置API密钥
export OPENAI_API_KEY="your-api-key"
```

### 2. 基础使用示例
```bash
# 运行ChatDev（模型通过仓库内的模型配置选择，可用 --model 指定，取值以仓库 ModelConfig 为准；
# 建议在配置中指向较新的模型，如 gpt-5-mini 系列）
python run.py \
  --task "开发一个待办事项应用" \
  --name "TodoAppCompany"
```

### 3. 自定义开发流程

ChatDev 主要通过 **CLI + 配置文件**驱动，不提供稳定的 Python 库 API（`from chatdev import ChatDev` 之类的写法不可用）。自定义流程的官方方式是修改 `company_config/` 下的配置：

- `ChatChainConfig.json`：定义对话链的阶段与顺序
- `PhaseConfig.json`：定义每个阶段（Phase）的提示词与角色分工
- `RoleConfig.json`：定义角色（CEO、CTO、Programmer 等）的提示词

用 `--config`、`--phase` 参数指定自定义配置目录即可：

```bash
python run.py \
  --task "开发一个博客系统" \
  --name "BlogCompany" \
  --config "company_config/custom"   # 自定义的对话链/阶段/角色配置
```

### 4. 角色协作

角色协作由"对话链"自动驱动：CEO 提出需求 → CTO 拆解设计 → 程序员写代码 → 测试员审查，全部通过双 Agent 对话完成，产物（文档、代码）落在 `WareHouse` 目录。想调整角色能力，编辑 `RoleConfig.json` 中对应角色的 `system_prompt` 即可。

### 5. 文档生成

文档生成是流程的副产品：每个阶段结束都会产出对应文档（需求文档、设计文档、代码文档），保存在 `WareHouse/<公司名>_默认套件/` 下，无需单独调用"文档生成器"。

## 最佳实践

### 1. 任务定义
- **明确目标**：明确开发目标
- **分解任务**：将大任务分解为小任务
- **设置约束**：设置合理的约束条件
- **验证可行性**：验证任务可行性

### 2. 角色配置
- **合理分工**：合理分配角色职责
- **技能匹配**：确保角色技能匹配任务需求
- **协作机制**：建立有效的协作机制
- **沟通渠道**：建立畅通的沟通渠道

### 3. 流程优化
- **阶段划分**：合理划分开发阶段
- **质量检查**：在每个阶段进行质量检查
- **反馈机制**：建立反馈机制
- **持续改进**：持续改进开发流程

## 常见问题

### 1. 配置问题
- **API密钥错误**：检查API密钥配置
- **依赖缺失**：检查依赖安装
- **环境问题**：检查运行环境

### 2. 执行问题
- **任务失败**：检查任务设置
- **角色冲突**：解决角色间的冲突
- **沟通障碍**：解决沟通障碍

### 3. 质量问题
- **代码质量**：加强代码审查
- **测试覆盖**：增加测试覆盖
- **文档完整性**：确保文档完整

## 下一步学习

- [CAMEL详解](/day126-130/camel) - 通信Agent框架
- [多Agent系统](/day131-135/) - 学习多Agent协作
- [Deep-Agent开发](/day136-140/) - 深度学习与Agent结合