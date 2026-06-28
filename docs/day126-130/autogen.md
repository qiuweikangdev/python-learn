# Microsoft AutoGen详解

## 概述

Microsoft AutoGen是微软开发的多Agent对话框架，支持复杂的多Agent协作场景。它提供了灵活的对话管理和Agent协作机制，适合企业级应用。

## 核心概念

### 1. Agent类型
AutoGen支持多种Agent类型：
- **AssistantAgent**：AI助手Agent
- **UserProxyAgent**：用户代理Agent
- **GroupChatManager**：群聊管理Agent
- **自定义Agent**：自定义Agent类型

### 2. 对话模式
AutoGen支持多种对话模式：
- **双人对话**：两个Agent之间的对话
- **群聊对话**：多个Agent之间的对话
- **嵌套对话**：对话中包含子对话
- **顺序对话**：按顺序进行的对话

### 3. 代码执行
AutoGen的代码执行能力：
- **代码生成**：Agent生成代码
- **代码执行**：在安全环境中执行代码
- **结果反馈**：将执行结果反馈给Agent
- **错误处理**：处理代码执行错误

### 4. 人类参与
AutoGen的人类参与机制：
- **人工审批**：在关键节点等待人工审批
- **人工输入**：在需要时获取人工输入
- **人工反馈**：获取人工反馈
- **人工干预**：在必要时进行人工干预

## 核心API

### 1. 安装和配置
```bash
# 安装AutoGen
pip install pyautogen

# 配置环境变量
export OPENAI_API_KEY="your-api-key"
```

### 2. 创建Agent
```python
import autogen

# 配置LLM
llm_config = {
    "model": "gpt-4o-mini",
    "api_key": "your-api-key"
}

# 创建助手Agent
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message="你是一个有用的AI助手。"
)

# 创建用户代理Agent
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",  # 在结束时等待人工输入
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
    code_execution_config={"work_dir": "coding"},
    llm_config=llm_config
)
```

### 3. 双人对话
```python
# 启动双人对话
user_proxy.initiate_chat(
    assistant,
    message="请帮我写一个Python函数，计算斐波那契数列。"
)
```

### 4. 群聊对话
```python
import autogen

# 创建多个Agent
coder = autogen.AssistantAgent(
    name="coder",
    llm_config=llm_config,
    system_message="你是一个Python程序员。"
)

reviewer = autogen.AssistantAgent(
    name="reviewer",
    llm_config=llm_config,
    system_message="你是一个代码审查专家。"
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    code_execution_config={"work_dir": "coding"}
)

# 创建群聊
groupchat = autogen.GroupChat(
    agents=[user_proxy, coder, reviewer],
    messages=[],
    max_round=10
)

# 创建群聊管理器
manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config
)

# 启动群聊
user_proxy.initiate_chat(
    manager,
    message="请编写一个Web爬虫程序，并进行代码审查。"
)
```

### 5. 代码执行
```python
import autogen

# 配置代码执行
code_execution_config = {
    "work_dir": "coding",  # 代码执行目录
    "use_docker": True,  # 使用Docker执行
    "timeout": 60  # 超时时间
}

# 创建用户代理
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    code_execution_config=code_execution_config
)

# 启动对话
user_proxy.initiate_chat(
    assistant,
    message="请写一个Python脚本，分析CSV文件并生成图表。"
)
```

### 6. 自定义Agent
```python
import autogen

class CustomAgent(autogen.Agent):
    def __init__(self, name, **kwargs):
        super().__init__(name, **kwargs)
        self.custom_data = {}
    
    def generate_reply(self, messages, sender, **kwargs):
        # 自定义回复逻辑
        last_message = messages[-1]["content"]
        
        # 处理消息
        reply = f"自定义回复: {last_message}"
        
        return reply

# 使用自定义Agent
custom_agent = CustomAgent(name="custom")
```

## 实践指南

### 1. 环境准备
```bash
# 安装AutoGen
pip install pyautogen

# 配置API密钥
export OPENAI_API_KEY="your-api-key"
```

### 2. 基础使用示例
```python
import autogen

# 配置LLM
llm_config = {
    "model": "gpt-4o-mini",
    "api_key": "your-api-key"
}

# 创建助手
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message="你是一个有用的AI助手，擅长编写Python代码。"
)

# 创建用户代理
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    max_consecutive_auto_reply=10,
    code_execution_config={"work_dir": "coding"}
)

# 启动对话
user_proxy.initiate_chat(
    assistant,
    message="请帮我写一个Python函数，实现快速排序算法。"
)
```

### 3. 群聊协作
```python
import autogen

# 配置LLM
llm_config = {
    "model": "gpt-4o-mini",
    "api_key": "your-api-key"
}

# 创建产品经理
pm = autogen.AssistantAgent(
    name="product_manager",
    llm_config=llm_config,
    system_message="你是产品经理，负责需求分析。"
)

# 创建架构师
architect = autogen.AssistantAgent(
    name="architect",
    llm_config=llm_config,
    system_message="你是架构师，负责系统设计。"
)

# 创建开发者
developer = autogen.AssistantAgent(
    name="developer",
    llm_config=llm_config,
    system_message="你是开发者，负责代码实现。"
)

# 创建用户代理
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    code_execution_config={"work_dir": "project"}
)

# 创建群聊
groupchat = autogen.GroupChat(
    agents=[user_proxy, pm, architect, developer],
    messages=[],
    max_round=20
)

# 创建群聊管理器
manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config
)

# 启动群聊
user_proxy.initiate_chat(
    manager,
    message="请帮我设计和实现一个简单的博客系统。"
)
```

### 4. 嵌套对话
```python
import autogen

# 创建子任务Agent
subtask_agent = autogen.AssistantAgent(
    name="subtask_agent",
    llm_config=llm_config,
    system_message="你负责处理子任务。"
)

# 创建主任务Agent
main_agent = autogen.AssistantAgent(
    name="main_agent",
    llm_config=llm_config,
    system_message="你负责协调主任务。"
)

# 创建用户代理
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE"
)

# 启动主任务对话
user_proxy.initiate_chat(
    main_agent,
    message="请帮我完成一个复杂的数据分析任务。"
)
```

## 最佳实践

### 1. Agent设计
- **明确角色**：为每个Agent设定明确的角色
- **清晰指令**：提供清晰的系统指令
- **合理配置**：合理配置LLM参数
- **工具集成**：为Agent集成合适的工具

### 2. 对话管理
- **控制轮次**：设置合理的对话轮次
- **处理终止**：正确处理对话终止
- **错误处理**：处理对话中的错误
- **日志记录**：记录对话日志

### 3. 代码执行
- **安全环境**：使用安全的代码执行环境
- **超时控制**：设置合理的超时时间
- **错误处理**：处理代码执行错误
- **结果验证**：验证代码执行结果

## 常见问题

### 1. 配置问题
- **API密钥错误**：检查API密钥配置
- **模型不可用**：检查模型可用性
- **依赖缺失**：检查依赖安装

### 2. 执行问题
- **对话卡住**：检查对话轮次设置
- **代码执行失败**：检查代码执行环境
- **内存不足**：优化内存使用

### 3. 协作问题
- **Agent冲突**：解决Agent间的冲突
- **任务重复**：避免任务重复执行
- **输出质量**：提高输出质量

## 下一步学习

- [ChatDev详解](/day126-130/chatdev) - 基于角色的开发框架
- [CAMEL详解](/day126-130/camel) - 通信Agent框架
- [多Agent系统](/day131-135/) - 学习多Agent协作