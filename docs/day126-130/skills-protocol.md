# Skills、协议与能力打包

## 概述

Skills（技能）是Agent能力的模块化封装，通过标准化的协议和接口，让Agent能够快速集成和使用各种能力。本章将深入介绍Skills的设计模式、协议规范和能力打包方法。

## 什么是Skills？

### 定义

```
Skills = 可复用的能力模块

类比：
- Skills = 手机App
- Agent = 手机
- 协议 = App Store规范

特点：
1. 模块化：独立的功能单元
2. 可复用：可在多个Agent中使用
3. 标准化：遵循统一的协议
4. 可组合：多个Skills组合使用
```

### Skills的作用

```
为什么需要Skills？

1. 能力复用
   - 一次开发，多处使用
   - 减少重复开发

2. 快速集成
   - 标准化接口
   - 即插即用

3. 社区共享
   - 开源社区贡献
   - 生态系统建设

4. 版本管理
   - 独立版本控制
   - 平滑升级
```

## Skills设计模式

### 1. 内置Skills

**定义**：框架自带的基础Skills

**示例**：

```python
from typing import Dict, Any

class BuiltinSkills:
    """
    内置Skills示例
    
    这些是Agent框架自带的基础技能
    """
    
    @staticmethod
    def search(query: str) -> str:
        """
        搜索技能
        
        Args:
            query: 搜索关键词
        
        Returns:
            搜索结果
        """
        # 实际实现会调用搜索API
        return f"搜索结果：{query}"
    
    @staticmethod
    def calculate(expression: str) -> str:
        """
        计算技能
        
        Args:
            expression: 数学表达式
        
        Returns:
            计算结果
        """
        try:
            result = eval(expression)
            return f"计算结果：{result}"
        except Exception as e:
            return f"计算错误：{e}"
    
    @staticmethod
    def read_file(filepath: str) -> str:
        """
        读取文件技能
        
        Args:
            filepath: 文件路径
        
        Returns:
            文件内容
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"读取失败：{e}"
    
    @staticmethod
    def write_file(filepath: str, content: str) -> str:
        """
        写入文件技能
        
        Args:
            filepath: 文件路径
            content: 文件内容
        
        Returns:
            操作结果
        """
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return f"写入成功：{filepath}"
        except Exception as e:
            return f"写入失败：{e}"

# 使用示例
skills = BuiltinSkills()
print(skills.search("人工智能"))
print(skills.calculate("1 + 1"))
```

### 2. 自定义Skills

**定义**：用户自己开发的Skills

**代码示例**：

```python
from typing import Dict, Any, Callable
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class SkillMetadata:
    """Skill元数据"""
    name: str
    version: str
    description: str
    author: str
    dependencies: list = None

class BaseSkill(ABC):
    """
    Skill基类
    
    所有自定义Skill都应该继承这个基类
    """
    
    @abstractmethod
    def get_metadata(self) -> SkillMetadata:
        """获取Skill元数据"""
        pass
    
    @abstractmethod
    def execute(self, **kwargs) -> Any:
        """执行Skill"""
        pass
    
    def validate_input(self, **kwargs) -> bool:
        """验证输入参数"""
        return True

class WeatherSkill(BaseSkill):
    """
    天气查询Skill
    
    示例：展示如何创建自定义Skill
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key
    
    def get_metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="weather",
            version="1.0.0",
            description="查询天气信息",
            author="Agent Team",
            dependencies=["requests"]
        )
    
    def validate_input(self, **kwargs) -> bool:
        """验证输入"""
        if "location" not in kwargs:
            return False
        return True
    
    def execute(self, **kwargs) -> Any:
        """
        执行天气查询
        
        Args:
            location: 城市名称
        
        Returns:
            天气信息
        """
        if not self.validate_input(**kwargs):
            return {"error": "缺少location参数"}
        
        location = kwargs["location"]
        
        # 模拟天气API调用
        weather_data = {
            "北京": {"weather": "晴", "temperature": 25, "humidity": 60},
            "上海": {"weather": "多云", "temperature": 28, "humidity": 70},
            "广州": {"weather": "阵雨", "temperature": 30, "humidity": 80}
        }
        
        if location in weather_data:
            return {
                "success": True,
                "location": location,
                "data": weather_data[location]
            }
        else:
            return {
                "success": False,
                "error": f"未找到城市：{location}"
            }

# 使用示例
weather_skill = WeatherSkill()
result = weather_skill.execute(location="北京")
print(result)
```

### 3. 第三方Skills

**定义**：社区或第三方开发的Skills

**代码示例**：

```python
from typing import Dict, Any, List
import importlib

class ThirdPartySkillLoader:
    """
    第三方Skill加载器
    
    动态加载和管理第三方Skills
    """
    
    def __init__(self):
        self.skills: Dict[str, Any] = {}
    
    def load_skill(self, skill_name: str, module_path: str):
        """
        加载第三方Skill
        
        Args:
            skill_name: Skill名称
            module_path: 模块路径
        """
        try:
            module = importlib.import_module(module_path)
            skill_class = getattr(module, skill_name)
            self.skills[skill_name] = skill_class()
            print(f"成功加载Skill：{skill_name}")
        except Exception as e:
            print(f"加载Skill失败：{skill_name} - {e}")
    
    def get_skill(self, skill_name: str):
        """获取Skill"""
        return self.skills.get(skill_name)
    
    def list_skills(self) -> List[str]:
        """列出所有已加载的Skills"""
        return list(self.skills.keys())

# 使用示例
loader = ThirdPartySkillLoader()

# 加载第三方Skill（示例）
# loader.load_skill("WebSearchSkill", "skills.web_search")
# loader.load_skill("DatabaseSkill", "skills.database")

# 获取Skill
# skill = loader.get_skill("WebSearchSkill")
# if skill:
#     result = skill.execute(query="人工智能")
```

## 协议与接口

### 1. 工具协议

**定义**：工具调用的标准协议

```python
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class ToolProtocol(Enum):
    """工具协议类型"""
    FUNCTION_CALL = "function_call"  # 函数调用
    TOOL_USE = "tool_use"  # 工具使用
    PLUGIN = "plugin"  # 插件

@dataclass
class ToolRequest:
    """工具请求"""
    tool_name: str
    parameters: Dict[str, Any]
    request_id: str
    timeout: int = 30

@dataclass
class ToolResponse:
    """工具响应"""
    request_id: str
    success: bool
    result: Any
    error: Optional[str] = None
    execution_time: float = 0.0

class ToolProtocolHandler:
    """
    工具协议处理器
    
    处理工具调用的协议
    """
    
    def __init__(self, protocol: ToolProtocol = ToolProtocol.FUNCTION_CALL):
        self.protocol = protocol
    
    def create_request(self, tool_name: str, **kwargs) -> ToolRequest:
        """创建工具请求"""
        import uuid
        return ToolRequest(
            tool_name=tool_name,
            parameters=kwargs,
            request_id=str(uuid.uuid4())
        )
    
    def process_response(self, response: ToolResponse) -> Dict:
        """处理工具响应"""
        if response.success:
            return {
                "status": "success",
                "result": response.result
            }
        else:
            return {
                "status": "error",
                "error": response.error
            }

# 使用示例
handler = ToolProtocolHandler(ToolProtocol.FUNCTION_CALL)

# 创建请求
request = handler.create_request("search", query="人工智能")
print(f"请求ID：{request.request_id}")
print(f"工具名称：{request.tool_name}")
print(f"参数：{request.parameters}")
```

### 2. 通信协议

**定义**：Agent间通信的标准协议

```python
from typing import Dict, Any, List
from dataclasses import dataclass
from datetime import datetime
import json

@dataclass
class Message:
    """消息"""
    sender: str
    receiver: str
    content: Any
    message_type: str  # text, tool_call, tool_result, etc.
    timestamp: datetime = None
    metadata: Dict = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.metadata is None:
            self.metadata = {}

class CommunicationProtocol:
    """
    通信协议
    
    处理Agent间的通信
    """
    
    def __init__(self):
        self.message_queue: List[Message] = []
    
    def send(self, message: Message):
        """发送消息"""
        self.message_queue.append(message)
        print(f"[{message.timestamp}] {message.sender} -> {message.receiver}: {message.content}")
    
    def receive(self, receiver: str) -> List[Message]:
        """接收消息"""
        messages = [m for m in self.message_queue if m.receiver == receiver]
        return messages
    
    def broadcast(self, sender: str, content: Any, receivers: List[str]):
        """广播消息"""
        for receiver in receivers:
            message = Message(
                sender=sender,
                receiver=receiver,
                content=content,
                message_type="broadcast"
            )
            self.send(message)

# 使用示例
protocol = CommunicationProtocol()

# 发送消息
protocol.send(Message(
    sender="agent_1",
    receiver="agent_2",
    content="请帮我查询天气",
    message_type="text"
))

# 接收消息
messages = protocol.receive("agent_2")
for msg in messages:
    print(f"收到消息：{msg.content}")
```

### 3. 能力描述协议

**定义**：描述Agent能力的标准协议

```python
from typing import Dict, Any, List
from dataclasses import dataclass

@dataclass
class Capability:
    """能力描述"""
    name: str
    description: str
    version: str
    parameters: Dict[str, Any]
    examples: List[Dict] = None

class CapabilityRegistry:
    """
    能力注册表
    
    管理和查询Agent的能力
    """
    
    def __init__(self):
        self.capabilities: Dict[str, Capability] = {}
    
    def register(self, capability: Capability):
        """注册能力"""
        self.capabilities[capability.name] = capability
        print(f"注册能力：{capability.name}")
    
    def unregister(self, name: str):
        """注销能力"""
        if name in self.capabilities:
            del self.capabilities[name]
            print(f"注销能力：{name}")
    
    def get(self, name: str) -> Capability:
        """获取能力"""
        return self.capabilities.get(name)
    
    def list(self) -> List[Capability]:
        """列出所有能力"""
        return list(self.capabilities.values())
    
    def query(self, keyword: str) -> List[Capability]:
        """查询能力"""
        results = []
        for cap in self.capabilities.values():
            if keyword in cap.name or keyword in cap.description:
                results.append(cap)
        return results

# 使用示例
registry = CapabilityRegistry()

# 注册能力
registry.register(Capability(
    name="search",
    description="搜索互联网信息",
    version="1.0.0",
    parameters={
        "query": {"type": "string", "description": "搜索关键词"}
    },
    examples=[
        {"input": {"query": "人工智能"}, "output": "搜索结果..."}
    ]
))

registry.register(Capability(
    name="calculate",
    description="计算数学表达式",
    version="1.0.0",
    parameters={
        "expression": {"type": "string", "description": "数学表达式"}
    }
))

# 查询能力
results = registry.query("搜索")
for cap in results:
    print(f"能力：{cap.name} - {cap.description}")
```

## 能力打包与发布

### 1. Skill包结构

```
my_skill/
├── __init__.py          # 包初始化
├── skill.py             # Skill实现
├── metadata.json        # 元数据
├── requirements.txt     # 依赖
├── README.md           # 文档
└── tests/              # 测试
    └── test_skill.py
```

### 2. 元数据定义

```json
{
    "name": "weather_skill",
    "version": "1.0.0",
    "description": "查询天气信息的Skill",
    "author": "Agent Team",
    "license": "MIT",
    "dependencies": [
        "requests>=2.28.0"
    ],
    "capabilities": [
        "weather_query",
        "weather_forecast"
    ],
    "parameters": {
        "location": {
            "type": "string",
            "description": "城市名称",
            "required": true
        }
    },
    "examples": [
        {
            "input": {"location": "北京"},
            "output": {"weather": "晴", "temperature": 25}
        }
    ]
}
```

### 3. Skill实现模板

```python
"""
天气查询Skill

提供天气信息查询功能
"""

from typing import Dict, Any
from dataclasses import dataclass

@dataclass
class SkillInfo:
    """Skill信息"""
    name: str = "weather_skill"
    version: str = "1.0.0"
    description: str = "查询天气信息"
    author: str = "Agent Team"

class WeatherSkill:
    """
    天气查询Skill
    
    功能：
    1. 查询当前天气
    2. 查询天气预报
    3. 支持多城市查询
    """
    
    def __init__(self, api_key: str = None):
        """
        初始化
        
        Args:
            api_key: 天气API密钥（可选）
        """
        self.api_key = api_key
        self.info = SkillInfo()
    
    def get_info(self) -> SkillInfo:
        """获取Skill信息"""
        return self.info
    
    def execute(self, action: str, **kwargs) -> Dict[str, Any]:
        """
        执行Skill
        
        Args:
            action: 操作类型
            **kwargs: 参数
        
        Returns:
            执行结果
        """
        if action == "query":
            return self.query_weather(**kwargs)
        elif action == "forecast":
            return self.get_forecast(**kwargs)
        else:
            return {"error": f"未知操作：{action}"}
    
    def query_weather(self, location: str) -> Dict[str, Any]:
        """
        查询天气
        
        Args:
            location: 城市名称
        
        Returns:
            天气信息
        """
        # 模拟天气数据
        weather_data = {
            "北京": {"weather": "晴", "temperature": 25, "humidity": 60},
            "上海": {"weather": "多云", "temperature": 28, "humidity": 70},
            "广州": {"weather": "阵雨", "temperature": 30, "humidity": 80}
        }
        
        if location in weather_data:
            return {
                "success": True,
                "location": location,
                "data": weather_data[location]
            }
        else:
            return {
                "success": False,
                "error": f"未找到城市：{location}"
            }
    
    def get_forecast(self, location: str, days: int = 3) -> Dict[str, Any]:
        """
        获取天气预报
        
        Args:
            location: 城市名称
            days: 预报天数
        
        Returns:
            天气预报
        """
        # 模拟预报数据
        forecast = [
            {"date": "2024-01-16", "weather": "晴", "temp_high": 26, "temp_low": 15},
            {"date": "2024-01-17", "weather": "多云", "temp_high": 24, "temp_low": 14},
            {"date": "2024-01-18", "weather": "小雨", "temp_high": 22, "temp_low": 13}
        ]
        
        return {
            "success": True,
            "location": location,
            "forecast": forecast[:days]
        }

# 导出
__all__ = ["WeatherSkill"]

# 使用示例
if __name__ == "__main__":
    skill = WeatherSkill()
    
    # 查询天气
    result = skill.execute("query", location="北京")
    print(f"天气查询：{result}")
    
    # 获取预报
    result = skill.execute("forecast", location="上海", days=3)
    print(f"天气预报：{result}")
```

### 4. 发布到Skill仓库

```python
class SkillRegistry:
    """
    Skill注册表
    
    管理Skill的发布和发现
    """
    
    def __init__(self):
        self.skills: Dict[str, Dict] = {}
    
    def publish(self, skill_name: str, skill_info: Dict, skill_path: str):
        """
        发布Skill
        
        Args:
            skill_name: Skill名称
            skill_info: Skill信息
            skill_path: Skill路径
        """
        self.skills[skill_name] = {
            "info": skill_info,
            "path": skill_path,
            "published_at": "2024-01-15"
        }
        print(f"发布Skill：{skill_name}")
    
    def search(self, keyword: str) -> List[Dict]:
        """
        搜索Skill
        
        Args:
            keyword: 搜索关键词
        
        Returns:
            搜索结果
        """
        results = []
        for name, info in self.skills.items():
            if keyword in name or keyword in info["info"].get("description", ""):
                results.append({"name": name, **info})
        return results
    
    def install(self, skill_name: str) -> bool:
        """
        安装Skill
        
        Args:
            skill_name: Skill名称
        
        Returns:
            是否成功
        """
        if skill_name in self.skills:
            print(f"安装Skill：{skill_name}")
            return True
        else:
            print(f"未找到Skill：{skill_name}")
            return False

# 使用示例
registry = SkillRegistry()

# 发布Skill
registry.publish(
    skill_name="weather_skill",
    skill_info={
        "version": "1.0.0",
        "description": "查询天气信息"
    },
    skill_path="./skills/weather"
)

# 搜索Skill
results = registry.search("天气")
print(f"搜索结果：{results}")

# 安装Skill
registry.install("weather_skill")
```

## Skills集成示例

### 1. 与LangChain集成

```python
from langchain.tools import tool
from typing import Dict, Any

# 将Skill转换为LangChain工具
def skill_to_langchain_tool(skill):
    """
    将Skill转换为LangChain工具
    
    Args:
        skill: Skill实例
    
    Returns:
        LangChain工具
    """
    @tool
    def tool_func(input_str: str) -> str:
        """Skill工具"""
        result = skill.execute(**eval(input_str))
        return str(result)
    
    return tool_func

# 使用示例
weather_skill = WeatherSkill()
weather_tool = skill_to_langchain_tool(weather_skill)

# 在LangChain Agent中使用
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-3.5-turbo")
tools = [weather_tool]

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手。"),
    ("user", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

# result = agent_executor.invoke({"input": "北京天气怎么样？"})
```

## 最佳实践

### 1. Skill设计原则

```
1. 单一职责
   - 每个Skill只做一件事
   - 功能明确，易于理解

2. 接口标准化
   - 统一的输入输出格式
   - 便于集成和组合

3. 可配置性
   - 支持参数配置
   - 适应不同场景

4. 错误处理
   - 完善的错误处理
   - 友好的错误信息
```

### 2. Skill管理建议

```
1. 版本管理
   - 使用语义化版本号
   - 记录变更日志

2. 依赖管理
   - 明确声明依赖
   - 版本兼容性检查

3. 测试覆盖
   - 单元测试
   - 集成测试

4. 文档完善
   - 使用说明
   - 示例代码
```

## 下一步学习

- [Agent Harness](/day126-130/agent-harness) - 了解Agent运行环境
- [多Agent系统](/day131-135/) - 学习多Agent协作
- [Agent平台](/day141-145/) - 了解部署和运维
