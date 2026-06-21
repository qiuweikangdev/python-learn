# Agent核心技术详解

## 概述

本章详细介绍Agent开发中的核心技术，包括ReAct、Chain-of-Thought、Tree-of-Thought、Plan-and-Execute等推理框架，以及这些技术的实现原理和应用方法。

## 1. ReAct模式

ReAct（Reasoning and Acting）是目前最流行的Agent推理模式，它将推理和行动交替进行。

### 1.1 核心原理

ReAct的核心思想是让LLM在每一步都进行"思考-行动-观察"的循环：

```
Thought: 我需要搜索今天的天气信息
Action: search_weather
Action Input: {"city": "北京"}
Observation: 北京今天晴天，气温25°C
Thought: 我已经获取到天气信息，可以回答用户了
Final Answer: 北京今天天气晴朗，气温25°C。
```

### 1.2 完整实现

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from typing import List, Dict, Any, Tuple
import json

class ReActAgent:
    """ReAct Agent实现"""
    
    def __init__(self, llm=None, tools=None):
        self.llm = llm or ChatOpenAI(model="gpt-4")
        self.tools = {t.name: t for t in (tools or [])}
        self.max_iterations = 10
    
    def _build_system_prompt(self) -> str:
        """构建系统提示"""
        tool_descriptions = "\n".join([
            f"- {name}: {tool.description}" 
            for name, tool in self.tools.items()
        ])
        
        return f"""你是一个ReAct Agent。你需要通过思考、行动和观察来完成任务。

可用工具:
{tool_descriptions}

请严格按照以下格式回答:

Thought: 分析当前情况，思考下一步应该做什么
Action: 工具名称
Action Input: 工具参数（JSON格式）

执行工具后，你会收到Observation结果，然后继续思考。

如果任务完成或不需要使用工具，直接给出最终答案:
Thought: [总结思考过程]
Final Answer: [最终答案]

重要规则:
1. 每次只能执行一个Action
2. Action Input必须是有效的JSON
3. 必须等待Observation后才能继续思考
4. 如果工具返回错误，尝试其他方法或直接回答"""
    
    def _parse_response(self, response: str) -> Tuple[str, str, str, Dict]:
        """解析LLM响应
        
        Returns:
            (思考过程, 动作, 动作输入, 是否完成)
        """
        lines = response.strip().split("\n")
        
        thought = ""
        action = ""
        action_input = {}
        is_final = False
        
        for line in lines:
            line = line.strip()
            if line.startswith("Thought:"):
                thought = line[8:].strip()
            elif line.startswith("Action:"):
                action = line[7:].strip()
            elif line.startswith("Action Input:"):
                try:
                    input_str = line[13:].strip()
                    action_input = json.loads(input_str)
                except json.JSONDecodeError:
                    action_input = {"input": input_str}
            elif line.startswith("Final Answer:"):
                thought = thought or "任务完成"
                action = "finish"
                action_input = {"answer": line[13:].strip()}
                is_final = True
        
        return thought, action, action_input, is_final
    
    def _execute_tool(self, tool_name: str, tool_input: Dict) -> str:
        """执行工具"""
        if tool_name not in self.tools:
            return f"错误: 工具 '{tool_name}' 不存在"
        
        try:
            tool = self.tools[tool_name]
            result = tool.invoke(tool_input)
            return str(result)
        except Exception as e:
            return f"工具执行错误: {str(e)}"
    
    def run(self, task: str, verbose: bool = True) -> str:
        """运行ReAct循环
        
        Args:
            task: 用户任务
            verbose: 是否打印详细过程
        
        Returns:
            最终答案
        """
        messages = [
            SystemMessage(content=self._build_system_prompt()),
            HumanMessage(content=task)
        ]
        
        context = ""
        
        for iteration in range(self.max_iterations):
            if verbose:
                print(f"\n{'='*50}")
                print(f"迭代 {iteration + 1}")
                print(f"{'='*50}")
            
            # 调用LLM
            response = self.llm.invoke(messages)
            response_text = response.content
            
            if verbose:
                print(f"\nLLM响应:\n{response_text}")
            
            # 解析响应
            thought, action, action_input, is_final = self._parse_response(response_text)
            
            if verbose:
                print(f"\n思考: {thought}")
                print(f"动作: {action}")
                print(f"参数: {action_input}")
            
            # 如果是最终答案
            if is_final or action == "finish":
                final_answer = action_input.get("answer", thought)
                if verbose:
                    print(f"\n最终答案: {final_answer}")
                return final_answer
            
            # 执行工具
            observation = self._execute_tool(action, action_input)
            
            if verbose:
                print(f"观察: {observation}")
            
            # 更新上下文
            context += f"\n{response_text}\nObservation: {observation}\n"
            
            # 添加到消息历史
            messages.append(AIMessage(content=response_text))
            messages.append(HumanMessage(content=f"Observation: {observation}"))
        
        return "达到最大迭代次数，任务未完成"

# 使用示例
@tool
def search_web(query: str) -> str:
    """搜索互联网信息"""
    # 模拟搜索结果
    return f"搜索 '{query}' 的结果: 找到相关信息..."

@tool
def get_weather(city: str) -> str:
    """获取城市天气"""
    weather_data = {
        "北京": "晴天，25°C",
        "上海": "多云，22°C",
        "广州": "阵雨，28°C"
    }
    return weather_data.get(city, f"未找到 {city} 的天气信息")

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return f"计算结果: {result}"
    except Exception as e:
        return f"计算错误: {str(e)}"

# 创建ReAct Agent
agent = ReActAgent(
    llm=ChatOpenAI(model="gpt-4"),
    tools=[search_web, get_weather, calculate]
)

# 运行
result = agent.run("北京今天天气怎么样？如果气温超过20度，计算20+5等于多少", verbose=True)
print(f"\n最终结果: {result}")
```

### 1.3 ReAct的优势

| 特性 | 说明 |
|------|------|
| **可解释性** | 每一步都有明确的思考过程 |
| **可控性** | 可以在任意步骤中断或调整 |
| **容错性** | 工具失败时可以尝试其他方法 |
| **灵活性** | 支持多种工具组合使用 |

## 2. Chain-of-Thought（思维链）

### 2.1 核心原理

Chain-of-Thought（CoT）通过引导LLM进行逐步推理来提高复杂任务的准确性。

```
问题: 如果一个商店有15个苹果，卖掉了8个，又进了12个，现在有多少？

思维链推理:
1. 初始数量: 15个苹果
2. 卖掉8个: 15 - 8 = 7个
3. 又进了12个: 7 + 12 = 19个
答案: 现在有19个苹果
```

### 2.2 CoT实现

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List

class ReasoningStep(BaseModel):
    """推理步骤"""
    step_number: int = Field(description="步骤编号")
    thought: str = Field(description="思考内容")
    calculation: str = Field(default="", description="计算过程")
    result: str = Field(description="步骤结果")

class ChainOfThoughtResult(BaseModel):
    """思维链结果"""
    question: str = Field(description="原始问题")
    reasoning_steps: List[ReasoningStep] = Field(description="推理步骤")
    final_answer: str = Field(description="最终答案")
    confidence: float = Field(description="置信度 0-1")

class ChainOfThoughtAgent:
    """思维链Agent"""
    
    def __init__(self, llm=None):
        self.llm = llm or ChatOpenAI(model="gpt-4")
        self.structured_llm = self.llm.with_structured_output(ChainOfThoughtResult)
    
    def reason(self, question: str, context: str = "") -> ChainOfThoughtResult:
        """进行思维链推理
        
        Args:
            question: 问题
            context: 上下文信息
        
        Returns:
            推理结果
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个擅长逐步推理的AI助手。

请对问题进行详细的逐步推理，每一步都要:
1. 明确说明你的思考
2. 如果有计算，展示计算过程
3. 得出该步骤的结论

上下文信息: {context}"""),
            ("human", "请逐步推理以下问题: {question}")
        ])
        
        chain = prompt | self.structured_llm
        result = chain.invoke({"question": question, "context": context})
        
        return result

# 使用示例
cot_agent = ChainOfThoughtAgent()

result = cot_agent.reason(
    question="一个水池有两个水管，A管每小时注入3吨水，B管每小时放出1吨水。水池初始有5吨水，容量是20吨。多少小时后水池满？",
    context=""
)

print(f"问题: {result.question}")
print("\n推理步骤:")
for step in result.reasoning_steps:
    print(f"  步骤{step.step_number}: {step.thought}")
    if step.calculation:
        print(f"    计算: {step.calculation}")
    print(f"    结果: {step.result}")
print(f"\n最终答案: {result.final_answer}")
print(f"置信度: {result.confidence}")
```

### 2.3 Zero-shot CoT

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

class ZeroShotCoT:
    """零样本思维链 - 通过简单提示触发推理"""
    
    def __init__(self, llm=None):
        self.llm = llm or ChatOpenAI(model="gpt-4")
    
    def reason(self, question: str) -> str:
        """零样本思维链推理"""
        # 关键提示词: "Let's think step by step"
        prompt = f"""{question}

Let's think step by step."""
        
        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content

# 使用示例
zero_shot = ZeroShotCoT()
result = zero_shot.reason("如果所有的猫都有尾巴，Tom是一只猫，那么Tom有尾巴吗？")
print(result)
```

## 3. Tree-of-Thought（思维树）

### 3.1 核心原理

Tree-of-Thought（ToT）将推理过程组织成树结构，探索多个可能的路径，选择最优路径。

```
                    [问题]
                   /  |  \
              [思路1] [思路2] [思路3]
              /   \      |       \
         [子1a] [子1b] [子2a]   [子3a]
           |      |      |        |
         [评估] [评估] [评估]   [评估]
           ↓      ↓      ↓        ↓
         0.6    0.8    0.7      0.5
                    ↓
               [选择最优路径]
```

### 3.2 ToT实现

```python
from langchain_openai import ChatOpenAI
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List, Dict, Any, Optional
import heapq

class ThoughtNode(BaseModel):
    """思维节点"""
    id: str = Field(description="节点ID")
    content: str = Field(description="思维内容")
    parent_id: Optional[str] = Field(default=None, description="父节点ID")
    children_ids: List[str] = Field(default=[], description="子节点ID列表")
    score: float = Field(default=0.0, description="评估分数 0-1")
    depth: int = Field(default=0, description="深度")

class TreeOfThoughtAgent:
    """思维树Agent"""
    
    def __init__(self, llm=None, max_depth: int = 3, branching_factor: int = 3):
        self.llm = llm or ChatOpenAI(model="gpt-4")
        self.max_depth = max_depth
        self.branching_factor = branching_factor
        self.nodes: Dict[str, ThoughtNode] = {}
    
    def generate_thoughts(self, problem: str, 
                          current_thought: str = "",
                          num_thoughts: int = 3) -> List[str]:
        """生成多个思维分支"""
        prompt = f"""问题: {problem}

当前思考: {current_thought if current_thought else "开始思考"}

请生成 {num_thoughts} 个不同的思考方向或解决方案。每个方向用一段话描述。
格式:
1. [思考方向1]
2. [思考方向2]
3. [思考方向3]"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        
        # 解析生成的思考
        thoughts = []
        for line in response.content.split("\n"):
            line = line.strip()
            if line and line[0].isdigit() and ". " in line:
                thoughts.append(line.split(". ", 1)[1])
        
        return thoughts[:num_thoughts]
    
    def evaluate_thought(self, problem: str, thought: str) -> float:
        """评估思维的质量"""
        prompt = f"""问题: {problem}

思考方向: {thought}

请评估这个思考方向的质量，给出0-1之间的分数。
评估标准:
- 可行性 (是否能够解决问题)
- 有效性 (是否高效)
- 创新性 (是否有创意)

只返回分数，如: 0.8"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        
        try:
            score = float(response.content.strip())
            return max(0.0, min(1.0, score))
        except:
            return 0.5
    
    def solve(self, problem: str, verbose: bool = True) -> str:
        """使用思维树解决问题"""
        root = ThoughtNode(
            id="root",
            content="开始思考",
            score=0.0,
            depth=0
        )
        self.nodes["root"] = root
        
        # 使用优先队列进行最佳优先搜索
        queue = [(0.0, "root")]  # (负分数, 节点ID)
        best_solution = None
        best_score = -1
        
        while queue:
            neg_score, current_id = heapq.heappop(queue)
            current_node = self.nodes[current_id]
            
            if verbose:
                print(f"\n探索节点: {current_node.content[:50]}...")
                print(f"当前分数: {current_node.score}")
            
            # 达到最大深度，评估并返回
            if current_node.depth >= self.max_depth:
                if current_node.score > best_score:
                    best_score = current_node.score
                    best_solution = current_node.content
                continue
            
            # 生成子思考
            thoughts = self.generate_thoughts(
                problem, 
                current_node.content,
                self.branching_factor
            )
            
            for i, thought in enumerate(thoughts):
                child_id = f"{current_id}_{i}"
                
                # 评估思维质量
                score = self.evaluate_thought(problem, thought)
                
                child = ThoughtNode(
                    id=child_id,
                    content=thought,
                    parent_id=current_id,
                    score=score,
                    depth=current_node.depth + 1
                )
                
                self.nodes[child_id] = child
                current_node.children_ids.append(child_id)
                
                if verbose:
                    print(f"  生成子思考 {i+1}: {thought[:50]}... (分数: {score})")
                
                # 添加到队列
                heapq.heappush(queue, (-score, child_id))
        
        return best_solution or "无法找到解决方案"

# 使用示例
tot_agent = TreeOfThoughtAgent(max_depth=2, branching_factor=3)

problem = "设计一个创新的智能家居控制系统，要考虑用户隐私和易用性"
solution = tot_agent.solve(problem, verbose=True)

print(f"\n\n最终方案: {solution}")
```

## 4. Plan-and-Execute（先规划后执行）

### 4.1 核心原理

Plan-and-Execute模式将任务分为两个阶段：
1. **规划阶段**：生成完整的执行计划
2. **执行阶段**：按计划逐步执行，必要时重新规划

```
[用户任务] → [规划器] → [执行计划]
                           ↓
                    [执行器逐步执行]
                           ↓
                    [观察结果]
                           ↓
                [需要重新规划?] → 是 → [重新规划]
                           ↓
                         否 ↓
                    [最终结果]
```

### 4.2 完整实现

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.tools import tool
from typing import List, Dict, Any, Optional
import json

class PlanStep(BaseModel):
    """计划步骤"""
    step_id: int = Field(description="步骤ID")
    description: str = Field(description="步骤描述")
    required_tool: Optional[str] = Field(default=None, description="需要的工具")
    status: str = Field(default="pending", description="状态: pending/running/completed/failed")
    result: Optional[str] = Field(default=None, description="执行结果")

class ExecutionPlan(BaseModel):
    """执行计划"""
    goal: str = Field(description="任务目标")
    steps: List[PlanStep] = Field(description="执行步骤")
    current_step: int = Field(default=0, description="当前步骤索引")

class PlanAndExecuteAgent:
    """先规划后执行Agent"""
    
    def __init__(self, llm=None, tools=None):
        self.llm = llm or ChatOpenAI(model="gpt-4")
        self.tools = {t.name: t for t in (tools or [])}
        self.plan: Optional[ExecutionPlan] = None
    
    def create_plan(self, task: str) -> ExecutionPlan:
        """创建执行计划"""
        tool_names = list(self.tools.keys())
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个任务规划专家。请为用户任务创建详细的执行计划。

可用工具: {tools}

计划要求:
1. 将任务分解为清晰的步骤
2. 每个步骤指定需要的工具（如果有）
3. 步骤之间要有逻辑顺序
4. 考虑可能的失败情况"""),
            ("human", "请为以下任务创建执行计划: {task}")
        ])
        
        # 使用结构化输出
        class PlanOutput(BaseModel):
            goal: str = Field(description="任务目标")
            steps: List[Dict[str, Any]] = Field(description="执行步骤")
        
        structured_llm = self.llm.with_structured_output(PlanOutput)
        chain = prompt | structured_llm
        
        plan_output = chain.invoke({
            "task": task,
            "tools": ", ".join(tool_names)
        })
        
        # 转换为ExecutionPlan
        steps = [
            PlanStep(
                step_id=i,
                description=step.get("description", ""),
                required_tool=step.get("required_tool")
            )
            for i, step in enumerate(plan_output.steps)
        ]
        
        self.plan = ExecutionPlan(
            goal=plan_output.goal,
            steps=steps
        )
        
        return self.plan
    
    def execute_step(self, step: PlanStep, context: str = "") -> str:
        """执行单个步骤"""
        if step.required_tool and step.required_tool in self.tools:
            # 使用工具执行
            tool = self.tools[step.required_tool]
            try:
                result = tool.invoke({"query": step.description})
                return str(result)
            except Exception as e:
                return f"工具执行失败: {str(e)}"
        else:
            # 使用LLM执行
            prompt = f"""请执行以下任务步骤:

步骤描述: {step.description}
上下文信息: {context}

请直接给出执行结果。"""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
    
    def should_replan(self, step_result: str, original_step: PlanStep) -> bool:
        """判断是否需要重新规划"""
        prompt = f"""判断执行结果是否需要重新规划:

原始步骤: {original_step.description}
执行结果: {step_result}

如果执行失败或结果不符合预期，回答"是"，否则回答"否"。
只回答"是"或"否"。"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        return "是" in response.content
    
    def replan(self, task: str, completed_steps: List[PlanStep], 
               failed_step: PlanStep) -> ExecutionPlan:
        """重新规划"""
        completed_info = "\n".join([
            f"- {s.description}: {s.result}" 
            for s in completed_steps
        ])
        
        prompt = f"""原始任务: {task}

已完成步骤:
{completed_info}

失败步骤: {failed_step.description}
失败原因: {failed_step.result}

请重新规划剩余步骤，避免之前的错误。"""
        
        return self.create_plan(prompt)
    
    def run(self, task: str, verbose: bool = True) -> str:
        """运行Plan-and-Execute循环"""
        # 1. 创建计划
        if verbose:
            print("="*50)
            print("阶段1: 创建执行计划")
            print("="*50)
        
        self.plan = self.create_plan(task)
        
        if verbose:
            print(f"\n目标: {self.plan.goal}")
            print("执行计划:")
            for step in self.plan.steps:
                print(f"  {step.step_id + 1}. {step.description}")
                if step.required_tool:
                    print(f"     工具: {step.required_tool}")
        
        # 2. 执行计划
        if verbose:
            print("\n" + "="*50)
            print("阶段2: 执行计划")
            print("="*50)
        
        completed_steps = []
        context = ""
        
        while self.plan.current_step < len(self.plan.steps):
            step = self.plan.steps[self.plan.current_step]
            step.status = "running"
            
            if verbose:
                print(f"\n执行步骤 {step.step_id + 1}: {step.description}")
            
            # 执行步骤
            result = self.execute_step(step, context)
            step.result = result
            
            if verbose:
                print(f"结果: {result[:200]}...")
            
            # 判断是否需要重新规划
            if self.should_replan(result, step):
                step.status = "failed"
                if verbose:
                    print("执行失败，重新规划...")
                
                self.plan = self.replan(task, completed_steps, step)
                
                if verbose:
                    print("\n新计划:")
                    for s in self.plan.steps:
                        print(f"  {s.step_id + 1}. {s.description}")
                
                completed_steps = []
                context = ""
                continue
            
            # 步骤成功
            step.status = "completed"
            completed_steps.append(step)
            context += f"\n步骤{step.step_id + 1}: {step.description}\n结果: {result}\n"
            
            self.plan.current_step += 1
        
        # 3. 汇总结果
        if verbose:
            print("\n" + "="*50)
            print("执行完成")
            print("="*50)
        
        results = [s.result for s in self.plan.steps if s.result]
        final_result = "\n".join(results)
        
        # 使用LLM生成最终总结
        summary_prompt = f"""任务: {task}

执行结果:
{final_result}

请基于以上执行结果，生成一个简洁的最终答案。"""
        
        summary = self.llm.invoke([HumanMessage(content=summary_prompt)])
        
        return summary.content

# 使用示例
@tool
def search_info(query: str) -> str:
    """搜索信息"""
    return f"搜索 '{query}' 的结果: 找到相关信息..."

@tool
def analyze_data(data: str) -> str:
    """分析数据"""
    return f"数据分析结果: {data} 的分析报告..."

@tool
def generate_report(content: str) -> str:
    """生成报告"""
    return f"报告: 基于 {content} 生成的报告..."

agent = PlanAndExecuteAgent(
    llm=ChatOpenAI(model="gpt-4"),
    tools=[search_info, analyze_data, generate_report]
)

result = agent.run("搜索最新的AI发展趋势，分析关键趋势，并生成一份报告", verbose=True)
print(f"\n最终结果: {result}")
```

## 5. Reflexion（自我反思）

### 5.1 核心原理

Reflexion让Agent在执行失败后进行自我反思，从失败中学习，改进策略后重试。

```
[任务] → [执行] → [评估] → [成功?]
                ↓           ↓
              失败         成功 → [返回结果]
                ↓
           [自我反思]
                ↓
           [改进策略]
                ↓
           [重新执行]
```

### 5.2 Reflexion实现

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class Reflection:
    """反思记录"""
    attempt: int
    action: str
    result: str
    failure_reason: str
    improvement: str

class ReflexionAgent:
    """Reflexion Agent - 自我反思改进"""
    
    def __init__(self, llm=None, max_attempts: int = 3):
        self.llm = llm or ChatOpenAI(model="gpt-4")
        self.max_attempts = max_attempts
        self.reflections: List[Reflection] = []
    
    def execute(self, task: str) -> str:
        """执行任务"""
        prompt = f"""请完成以下任务:

任务: {task}

{self._get_reflection_context()}"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content
    
    def evaluate(self, task: str, result: str) -> tuple[bool, str]:
        """评估执行结果
        
        Returns:
            (是否成功, 失败原因)
        """
        prompt = f"""评估任务执行结果:

任务: {task}
执行结果: {result}

请判断:
1. 任务是否成功完成？
2. 如果失败，原因是什么？

回答格式:
成功: [是/否]
原因: [失败原因，如果成功则写"无"]"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        
        content = response.content
        is_success = "是" in content.split("\n")[0]
        reason = ""
        
        for line in content.split("\n"):
            if line.startswith("原因:"):
                reason = line[3:].strip()
        
        return is_success, reason
    
    def reflect(self, task: str, result: str, failure_reason: str) -> str:
        """进行自我反思，生成改进策略"""
        reflection_context = ""
        if self.reflections:
            reflection_context = "之前的反思记录:\n"
            for r in self.reflections:
                reflection_context += f"""
尝试 {r.attempt}:
- 执行: {r.action}
- 结果: {r.result}
- 失败原因: {r.failure_reason}
- 改进: {r.improvement}
"""
        
        prompt = f"""你是一个善于自我反思的AI。请分析失败原因并提出改进策略。

任务: {task}
执行结果: {result}
失败原因: {failure_reason}

{reflection_context}

请提出具体的改进策略，下次执行时应该如何调整。"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content
    
    def run(self, task: str, verbose: bool = True) -> str:
        """运行Reflexion循环"""
        
        for attempt in range(1, self.max_attempts + 1):
            if verbose:
                print(f"\n{'='*50}")
                print(f"尝试 {attempt}/{self.max_attempts}")
                print(f"{'='*50}")
            
            # 执行任务
            result = self.execute(task)
            
            if verbose:
                print(f"\n执行结果: {result[:200]}...")
            
            # 评估结果
            is_success, failure_reason = self.evaluate(task, result)
            
            if verbose:
                print(f"评估: {'成功' if is_success else '失败'}")
                if not is_success:
                    print(f"失败原因: {failure_reason}")
            
            # 如果成功，返回结果
            if is_success:
                if verbose:
                    print(f"\n任务在第 {attempt} 次尝试后成功完成!")
                return result
            
            # 进行反思
            improvement = self.reflect(task, result, failure_reason)
            
            # 记录反思
            self.reflections.append(Reflection(
                attempt=attempt,
                action=result[:100],
                result=result,
                failure_reason=failure_reason,
                improvement=improvement
            ))
            
            if verbose:
                print(f"\n反思和改进策略:")
                print(improvement)
        
        return f"经过 {self.max_attempts} 次尝试后仍未成功。最后的结果: {result}"

# 使用示例
agent = ReflexionAgent(max_attempts=3)

result = agent.run("写一个Python函数，实现快速排序算法", verbose=True)
print(f"\n最终结果: {result}")
```

## 6. Self-Consistency（自一致性）

### 6.1 核心原理

Self-Consistency通过多次独立推理，选择最一致的答案，提高推理的可靠性。

```
[问题] → [推理路径1] → [答案A]
       → [推理路径2] → [答案A]  ← 最一致
       → [推理路径3] → [答案B]
       → [推理路径4] → [答案A]
       → [推理路径5] → [答案C]
                           ↓
                    [选择答案A]
```

### 6.2 实现

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from typing import List, Dict, Any
from collections import Counter
import asyncio

class SelfConsistencyAgent:
    """自一致性Agent - 多次推理选择最一致的答案"""
    
    def __init__(self, llm=None, num_paths: int = 5):
        self.llm = llm or ChatOpenAI(model="gpt-4")
        self.num_paths = num_paths
    
    def single_reasoning(self, question: str, path_id: int) -> Dict[str, str]:
        """单次推理"""
        prompt = f"""请仔细思考并回答以下问题。展示你的推理过程。

问题: {question}

请按以下格式回答:
推理过程: [详细的推理步骤]
最终答案: [简洁的答案]"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        content = response.content
        
        reasoning = ""
        answer = ""
        
        for line in content.split("\n"):
            if line.startswith("推理过程:"):
                reasoning = line[5:].strip()
            elif line.startswith("最终答案:"):
                answer = line[5:].strip()
        
        return {
            "path_id": path_id,
            "reasoning": reasoning,
            "answer": answer
        }
    
    def run(self, question: str, verbose: bool = True) -> Dict[str, Any]:
        """运行自一致性推理"""
        
        if verbose:
            print(f"问题: {question}")
            print(f"生成 {self.num_paths} 条推理路径...\n")
        
        # 生成多条推理路径
        results = []
        for i in range(self.num_paths):
            result = self.single_reasoning(question, i + 1)
            results.append(result)
            
            if verbose:
                print(f"路径 {i+1}: {result['answer'][:50]}...")
        
        # 统计答案出现次数
        answers = [r["answer"] for r in results]
        answer_counts = Counter(answers)
        
        # 选择最一致的答案
        most_common_answer, count = answer_counts.most_common(1)[0]
        consistency = count / self.num_paths
        
        if verbose:
            print(f"\n答案统计:")
            for answer, count in answer_counts.most_common():
                print(f"  - {answer[:50]}... : {count}次")
            print(f"\n最一致的答案: {most_common_answer}")
            print(f"一致性: {consistency:.2%}")
        
        return {
            "question": question,
            "answer": most_common_answer,
            "consistency": consistency,
            "all_paths": results,
            "answer_distribution": dict(answer_counts)
        }

# 使用示例
agent = SelfConsistencyAgent(num_paths=5)

result = agent.run(
    "如果一个商店打8折，一件原价100元的衣服实际需要支付多少钱？",
    verbose=True
)

print(f"\n最终答案: {result['answer']}")
print(f"一致性: {result['consistency']:.2%}")
```

## 7. 技术对比与选择

### 7.1 各技术特点对比

| 技术 | 核心思想 | 优势 | 劣势 | 适用场景 |
|------|---------|------|------|---------|
| **ReAct** | 推理+行动交替 | 可解释、灵活 | 可能陷入循环 | 需要外部工具的任务 |
| **CoT** | 逐步推理 | 简单有效 | 不支持工具调用 | 逻辑推理任务 |
| **ToT** | 树搜索 | 探索多路径 | 计算成本高 | 复杂决策问题 |
| **Plan-and-Execute** | 先规划后执行 | 结构清晰 | 规划可能不准确 | 多步骤复杂任务 |
| **Reflexion** | 自我反思 | 从失败中学习 | 需要多次尝试 | 容易失败的任务 |
| **Self-Consistency** | 多路径投票 | 提高可靠性 | 成本倍增 | 需要高准确性的任务 |

### 7.2 选择建议

```python
def choose_technology(task_type: str, requirements: dict) -> str:
    """根据任务类型选择合适的技术"""
    
    decision_matrix = {
        "需要使用工具": "ReAct",
        "纯逻辑推理": "CoT",
        "需要探索多种方案": "ToT",
        "多步骤复杂任务": "Plan-and-Execute",
        "容易失败需要重试": "Reflexion",
        "需要高可靠性": "Self-Consistency"
    }
    
    for req, tech in decision_matrix.items():
        if req in task_type:
            return tech
    
    return "ReAct"  # 默认使用ReAct
```

## 总结

本章介绍了Agent开发中的6种核心技术：

| 技术 | 关键特点 | 代码实现 |
|------|---------|---------|
| **ReAct** | 推理与行动交替 | `ReActAgent` 类 |
| **CoT** | 逐步推理 | `ChainOfThoughtAgent` 类 |
| **ToT** | 树搜索多路径 | `TreeOfThoughtAgent` 类 |
| **Plan-and-Execute** | 先规划后执行 | `PlanAndExecuteAgent` 类 |
| **Reflexion** | 自我反思改进 | `ReflexionAgent` 类 |
| **Self-Consistency** | 多路径投票 | `SelfConsistencyAgent` 类 |

## 下一步学习

- [Agent核心API详解](/agent/agent-frameworks/core-apis) - 学习核心API的使用
- [LangGraph工作流](/agent/langgraph/) - 使用LangGraph实现这些技术
- [多Agent系统](/agent/multi-agent/) - 多Agent协作技术
