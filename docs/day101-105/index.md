# LLM应用开发基础

## 概述

大语言模型（LLM）应用开发是构建AI Agent的基础。本章将介绍LLM应用开发的核心概念、技术原理和实践方法。

## 核心概念

### 1. 大语言模型（LLM）
大语言模型是基于Transformer架构的深度学习模型，通过大规模文本数据训练，能够理解和生成自然语言。主要特点包括：
- **规模巨大**：通常包含数十亿甚至数千亿参数
- **通用能力**：能够处理多种自然语言任务
- **上下文理解**：能够理解长文本的上下文信息
- **生成能力**：能够生成连贯、有逻辑的文本

### 2. 提示工程（Prompt Engineering）
提示工程是设计有效Prompt以引导模型行为的技术。关键要素包括：
- **指令清晰**：明确告诉模型需要做什么
- **上下文提供**：提供必要的背景信息
- **格式要求**：指定输出格式
- **示例展示**：通过示例引导模型行为

### 3. 函数调用（Function Calling）
函数调用是让LLM调用外部工具和API的机制。主要特点：
- **工具集成**：让模型能够使用外部工具
- **参数提取**：从用户输入中提取函数参数
- **结果处理**：处理函数执行结果
- **错误处理**：处理函数调用失败的情况

### 4. 工具使用（Tool Use）
工具使用是扩展LLM能力的重要方式。常见工具类型：
- **搜索工具**：互联网搜索、数据库查询
- **计算工具**：数学计算、数据分析
- **文件操作**：读写文件、处理文档
- **API调用**：调用第三方服务API

## 四种AI应用形态

在开始学习Agent开发之前，需要理解四种不同的AI应用形态，它们代表了不同的复杂度和能力水平：

### 1. Chatbot（聊天机器人）

**定义**：基于LLM的简单问答系统，通过对话与用户交互。

**核心特点**：
- 无状态或简单的会话状态
- 单轮或多轮对话
- 无法执行外部操作
- 响应完全依赖模型能力

**适用场景**：
- FAQ问答
- 客服助手
- 闲聊陪伴
- 简单信息查询

**代码示例**：
```python
from openai import OpenAI

client = OpenAI()

def simple_chatbot():
    """
    简单的聊天机器人示例
    特点：无状态，每次对话独立
    """
    # 维护对话历史（会话记忆）
    messages = [
        {"role": "system", "content": "你是一个友好的助手。"}
    ]
    
    while True:
        # 获取用户输入
        user_input = input("用户：")
        if user_input.lower() == "quit":
            break
        
        # 添加用户消息到历史
        messages.append({"role": "user", "content": user_input})
        
        # 调用LLM获取响应
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        
        # 获取助手回复
        assistant_message = response.choices[0].message.content
        messages.append({"role": "assistant", "content": assistant_message})
        
        print(f"助手：{assistant_message}")

# 运行聊天机器人
# simple_chatbot()
```

**局限性**：
- 无法获取实时信息
- 无法执行操作
- 无法访问外部数据

---

### 2. Workflow（工作流）

**定义**：预定义的执行流程，按照固定的步骤执行任务。

**核心特点**：
- 确定性执行
- 预定义的步骤
- 可预测的结果
- 适合重复性任务

**适用场景**：
- 数据处理管道
- 文档审批流程
- 自动化报告生成
- 批量任务处理

**代码示例**：
```python
from openai import OpenAI
from typing import List, Dict

client = OpenAI()

def document_processing_workflow(document: str) -> Dict:
    """
    文档处理工作流示例
    特点：固定的处理步骤，可预测的流程
    
    流程：提取摘要 -> 翻译 -> 格式化
    """
    
    # 步骤1：提取摘要
    def extract_summary(doc: str) -> str:
        """提取文档摘要"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "请提取以下文档的摘要，不超过100字。"},
                {"role": "user", "content": doc}
            ],
            temperature=0.3  # 低温度保证稳定性
        )
        return response.choices[0].message.content
    
    # 步骤2：翻译
    def translate_text(text: str, target_lang: str = "英文") -> str:
        """翻译文本"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"请将以下文本翻译成{target_lang}。"},
                {"role": "user", "content": text}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    
    # 步骤3：格式化
    def format_output(summary: str, translation: str) -> Dict:
        """格式化输出"""
        return {
            "original_length": len(document),
            "summary": summary,
            "translation": translation,
            "status": "completed"
        }
    
    # 执行工作流（固定步骤）
    summary = extract_summary(document)
    translation = translate_text(summary)
    result = format_output(summary, translation)
    
    return result

# 使用示例
document = "人工智能（AI）是计算机科学的一个分支，致力于创建能够模拟人类智能的系统..."
result = document_processing_workflow(document)
print(result)
```

**局限性**：
- 无法处理意外情况
- 流程固定，不够灵活
- 无法根据上下文调整

---

### 3. Agent（智能代理）

**定义**：能够自主决策、使用工具、完成任务的智能系统。

**核心特点**：
- 自主性：能够独立决策
- 适应性：能够根据情况调整策略
- 工具使用：能够调用外部工具
- 持续运行：能够持续执行直到完成任务

**适用场景**：
- 复杂研究任务
- 数据分析和报告
- 代码生成和调试
- 多步骤任务处理

**代码示例**：
```python
from openai import OpenAI
from typing import List, Dict, Callable
import json

client = OpenAI()

class SimpleAgent:
    """
    简单的Agent示例
    特点：能够自主决策、使用工具、循环执行
    """
    
    def __init__(self):
        # 定义可用工具
        self.tools = {
            "search": self.search,
            "calculate": self.calculate,
            "save_note": self.save_note
        }
        self.notes = []  # 存储笔记
    
    def search(self, query: str) -> str:
        """搜索工具"""
        # 模拟搜索
        return f"搜索结果：关于'{query}'的相关信息..."
    
    def calculate(self, expression: str) -> str:
        """计算工具"""
        try:
            result = eval(expression)
            return f"计算结果：{result}"
        except Exception as e:
            return f"计算错误：{e}"
    
    def save_note(self, content: str) -> str:
        """保存笔记工具"""
        self.notes.append(content)
        return f"笔记已保存，当前共{len(self.notes)}条笔记"
    
    def run(self, task: str, max_iterations: int = 5) -> str:
        """
        执行任务的主循环
        这是Agent的核心：Observe -> Think -> Act 循环
        """
        messages = [
            {"role": "system", "content": """你是一个有用的助手。你可以使用以下工具：
- search(query): 搜索信息
- calculate(expression): 计算数学表达式
- save_note(content): 保存笔记

请根据任务需求选择合适的工具。"""},
            {"role": "user", "content": task}
        ]
        
        # Agent循环：最多执行max_iterations次
        for iteration in range(max_iterations):
            print(f"\n--- 迭代 {iteration + 1} ---")
            
            # Think：让LLM决定下一步行动
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                functions=[
                    {
                        "name": "search",
                        "description": "搜索互联网信息",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "query": {"type": "string", "description": "搜索关键词"}
                            },
                            "required": ["query"]
                        }
                    },
                    {
                        "name": "calculate",
                        "description": "计算数学表达式",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "expression": {"type": "string", "description": "数学表达式"}
                            },
                            "required": ["expression"]
                        }
                    },
                    {
                        "name": "save_note",
                        "description": "保存笔记",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "content": {"type": "string", "description": "笔记内容"}
                            },
                            "required": ["content"]
                        }
                    }
                ]
            )
            
            message = response.choices[0].message
            
            # 检查是否需要调用工具
            if message.function_call:
                # Act：执行工具
                func_name = message.function_call.name
                func_args = json.loads(message.function_call.arguments)
                
                print(f"调用工具：{func_name}")
                print(f"参数：{func_args}")
                
                # 执行工具
                if func_name in self.tools:
                    result = self.tools[func_name](**func_args)
                else:
                    result = f"未知工具：{func_name}"
                
                print(f"结果：{result}")
                
                # Observe：将结果添加到消息历史
                messages.append(message)
                messages.append({
                    "role": "function",
                    "name": func_name,
                    "content": result
                })
            else:
                # 没有工具调用，返回最终结果
                return message.content
        
        return "达到最大迭代次数"

# 使用示例
agent = SimpleAgent()
result = agent.run("帮我搜索人工智能的最新进展，并计算一下相关的数据指标")
print(f"\n最终结果：{result}")
```

**优势**：
- 能够自主决策
- 能够使用工具
- 能够处理复杂任务

---

### 4. Multi-Agent（多智能体）

**定义**：多个Agent协作完成任务的系统。

**核心特点**：
- 分工协作
- 能力互补
- 并行处理
- 复杂任务处理

**适用场景**：
- 软件开发团队
- 研究项目协作
- 复杂业务流程
- 大规模任务处理

**代码示例**：
```python
from openai import OpenAI
from typing import List, Dict
from dataclasses import dataclass

client = OpenAI()

@dataclass
class AgentRole:
    """Agent角色定义"""
    name: str
    description: str
    skills: List[str]

class MultiAgentSystem:
    """
    多Agent系统示例
    特点：多个Agent分工协作
    """
    
    def __init__(self):
        # 定义不同的Agent角色
        self.agents = {
            "researcher": AgentRole(
                name="研究员",
                description="负责信息收集和研究",
                skills=["搜索", "资料收集", "文献分析"]
            ),
            "analyst": AgentRole(
                name="分析师",
                description="负责数据分析和洞察",
                skills=["数据分析", "趋势识别", "报告撰写"]
            ),
            "writer": AgentRole(
                name="作家",
                description="负责内容撰写和润色",
                skills=["写作", "编辑", "内容优化"]
            )
        }
    
    def execute_task(self, task: str) -> Dict:
        """
        执行任务：多个Agent协作完成
        
        流程：
        1. 研究员收集信息
        2. 分析师分析数据
        3. 作家撰写报告
        """
        results = {}
        
        # 阶段1：研究员收集信息
        print("阶段1：研究员收集信息...")
        researcher_prompt = f"作为研究员，请收集关于以下主题的信息：{task}"
        research_result = self._call_agent("researcher", researcher_prompt)
        results["research"] = research_result
        
        # 阶段2：分析师分析数据
        print("阶段2：分析师分析数据...")
        analyst_prompt = f"作为分析师，请分析以下研究结果并提取关键洞察：\n{research_result}"
        analysis_result = self._call_agent("analyst", analyst_prompt)
        results["analysis"] = analysis_result
        
        # 阶段3：作家撰写报告
        print("阶段3：作家撰写报告...")
        writer_prompt = f"作为作家，请基于以下分析结果撰写一份报告：\n{analysis_result}"
        report = self._call_agent("writer", writer_prompt)
        results["report"] = report
        
        return results
    
    def _call_agent(self, role: str, prompt: str) -> str:
        """调用指定角色的Agent"""
        agent = self.agents[role]
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"你是{agent.name}，{agent.description}。你的技能包括：{', '.join(agent.skills)}"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        return response.choices[0].message.content

# 使用示例
multi_agent = MultiAgentSystem()
result = multi_agent.execute_task("人工智能在医疗领域的应用")
print("\n最终报告：")
print(result["report"])
```

**优势**：
- 能力互补
- 并行处理
- 专业化分工

---

### 形态对比总结

| 特性 | Chatbot | Workflow | Agent | Multi-Agent |
|------|---------|----------|-------|-------------|
| **自主性** | 低 | 无 | 高 | 高 |
| **灵活性** | 中 | 低 | 高 | 高 |
| **确定性** | 高 | 高 | 低 | 低 |
| **复杂度** | 低 | 中 | 高 | 很高 |
| **适用场景** | 简单问答 | 流程任务 | 复杂任务 | 团队协作 |
| **工具使用** | 无 | 有限 | 丰富 | 丰富 |
| **学习曲线** | 低 | 中 | 高 | 很高 |

### 什么时候不该用Agent？

**不适合使用Agent的场景**：

1. **任务可预测**
   - 流程固定、步骤明确
   - 结果可预测
   - 例：数据格式转换、文件批量处理

2. **流程稳定**
   - 不需要根据上下文调整
   - 不需要处理意外情况
   - 例：定时任务、批处理作业

3. **普通脚本能解决**
   - 逻辑简单、规则明确
   - 不需要AI能力
   - 例：简单的数据处理、文件操作

4. **确定性要求高**
   - 需要100%准确的结果
   - 不能接受不确定性
   - 例：财务计算、医疗诊断

5. **成本敏感**
   - Agent调用LLM成本较高
   - 简单任务用脚本更经济
   - 例：高频简单任务

**Agent vs 脚本对比**：
```python
# 场景：根据用户输入查询天气

# 方案1：脚本实现（简单、确定、低成本）
def get_weather_script(city: str) -> str:
    """脚本方式：直接调用API"""
    weather_data = {
        "北京": "晴，25℃",
        "上海": "多云，28℃"
    }
    return weather_data.get(city, "未知城市")

# 方案2：Agent实现（灵活、能处理复杂输入、高成本）
def get_weather_agent(user_input: str) -> str:
    """Agent方式：理解自然语言、处理模糊输入"""
    # Agent能理解："今天北京天气怎么样？"
    # 而不只是精确的"北京"
    agent = SimpleAgent()
    return agent.run(f"查询天气：{user_input}")

# 选择建议：
# - 输入格式固定 → 用脚本
# - 输入是自然语言 → 用Agent
```

## 技术原理

### 1. Transformer架构
LLM基于Transformer架构，核心组件包括：
- **自注意力机制**：捕捉序列内部依赖关系
- **多头注意力**：并行处理多个注意力模式
- **前馈网络**：非线性变换
- **位置编码**：编码序列位置信息

### 2. 预训练与微调
LLM的训练过程包括：
- **预训练**：在大规模文本数据上学习语言模式
- **指令微调**：在指令数据上微调以遵循指令
- **RLHF**：通过人类反馈强化学习优化行为

### 3. 推理优化
LLM推理的关键技术：
- **KV缓存**：缓存注意力计算结果
- **批处理**：并行处理多个请求
- **量化**：降低模型精度以提升速度
- **模型并行**：将模型分布到多个设备

## 核心API

### OpenAI API
OpenAI API是最常用的LLM API，主要接口包括：

#### 1. Chat Completions API
```python
import openai

response = openai.ChatCompletion.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ],
    temperature=0.7,
    max_tokens=1000
)
```

#### 2. Function Calling API
```python
import openai

functions = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "城市名称"
                }
            },
            "required": ["location"]
        }
    }
]

response = openai.ChatCompletion.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "北京天气怎么样？"}],
    functions=functions,
    function_call="auto"
)
```

### 其他LLM API
#### 1. Anthropic Claude API
```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "你好！"}
    ]
)
```

#### 2. Google Gemini API
```python
import google.generativeai as genai

genai.configure(api_key="your-api-key")
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content("你好！")
```

## 实践指南

### 1. 环境准备
```bash
# 安装必要的库
pip install openai anthropic google-generativeai

# 设置API密钥
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export GOOGLE_API_KEY="your-google-key"
```

### 2. 基础调用示例
```python
import os
from openai import OpenAI

# 初始化客户端
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 简单对话
def chat_with_gpt(prompt):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# 使用示例
response = chat_with_gpt("解释什么是机器学习")
print(response)
```

### 3. 错误处理
```python
import openai
from openai import OpenAI

client = OpenAI()

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "你好！"}]
    )
    print(response.choices[0].message.content)
except openai.APIError as e:
    print(f"API错误: {e}")
except openai.RateLimitError as e:
    print(f"速率限制: {e}")
except Exception as e:
    print(f"未知错误: {e}")
```

## 最佳实践

### 1. 提示设计原则
- **明确具体**：避免模糊指令
- **分步骤**：复杂任务分解为简单步骤
- **提供示例**：通过示例引导模型行为
- **设置约束**：明确输出格式和限制

### 2. 性能优化
- **缓存结果**：避免重复计算
- **批量处理**：减少API调用次数
- **异步调用**：提升并发性能
- **模型选择**：根据任务选择合适的模型

### 3. 成本控制
- **监控使用量**：跟踪API调用次数和费用
- **设置限制**：设置每日/每月使用上限
- **优化提示**：减少不必要的token消耗
- **使用缓存**：缓存常见问题的回答

## 常见问题

### 1. API调用失败
- **检查API密钥**：确保密钥正确且有效
- **检查网络**：确保网络连接正常
- **检查配额**：确保API配额充足
- **查看错误信息**：根据错误信息排查问题

### 2. 模型输出质量差
- **优化提示**：改进提示设计
- **调整参数**：调整temperature等参数
- **提供示例**：添加Few-shot示例
- **使用更高级模型**：考虑使用GPT-4等更高级模型

### 3. 响应速度慢
- **减少token数量**：精简输入输出
- **使用流式响应**：使用stream参数
- **异步处理**：使用异步API调用
- **选择更快的模型**：根据需求选择模型

## 下一步学习

- [OpenAI API详解](/agent/llm-basics/openai-api) - 深入学习OpenAI API
- [提示工程](/agent/llm-basics/prompt-engineering) - 掌握提示设计技巧
- [函数调用](/agent/llm-basics/function-calling) - 学习工具集成
- [工具使用](/agent/llm-basics/tool-use) - 扩展模型能力