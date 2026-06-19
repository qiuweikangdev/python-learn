# LangGraph API参考手册

## 概述

本章提供LangGraph框架的详细API参考，包括核心模块、类和方法的说明。

## 核心模块

### 1. langgraph.graph
LangGraph的核心图模块。

#### StateGraph类
```python
from langgraph.graph import StateGraph, END

class StateGraph:
    def __init__(self, schema: Type[TypedDict]):
        """初始化状态图
        
        Args:
            schema: 状态的类型定义
        """
        pass
    
    def add_node(self, name: str, action: Callable) -> None:
        """添加节点
        
        Args:
            name: 节点名称
            action: 节点执行的函数
        """
        pass
    
    def add_edge(self, start_key: str, end_key: str) -> None:
        """添加边
        
        Args:
            start_key: 起始节点
            end_key: 结束节点
        """
        pass
    
    def add_conditional_edges(
        self,
        source: str,
        path: Callable,
        path_map: Optional[Dict[str, str]] = None
    ) -> None:
        """添加条件边
        
        Args:
            source: 源节点
            path: 条件函数
            path_map: 条件到节点的映射
        """
        pass
    
    def set_entry_point(self, key: str) -> None:
        """设置入口点
        
        Args:
            key: 入口节点名称
        """
        pass
    
    def set_finish_point(self, key: str) -> None:
        """设置结束点
        
        Args:
            key: 结束节点名称
        """
        pass
    
    def compile(self, checkpointer=None, interrupt_before=None, interrupt_after=None) -> CompiledGraph:
        """编译图
        
        Args:
            checkpointer: 检查点管理器
            interrupt_before: 在哪些节点前中断
            interrupt_after: 在哪些节点后中断
        
        Returns:
            编译后的图
        """
        pass
```

#### CompiledGraph类
```python
class CompiledGraph:
    def invoke(self, input: Any, config: Optional[Dict] = None) -> Any:
        """执行图
        
        Args:
            input: 输入数据
            config: 配置选项
        
        Returns:
            执行结果
        """
        pass
    
    def stream(self, input: Any, config: Optional[Dict] = None) -> Iterator:
        """流式执行图
        
        Args:
            input: 输入数据
            config: 配置选项
        
        Returns:
            事件流
        """
        pass
    
    async def ainvoke(self, input: Any, config: Optional[Dict] = None) -> Any:
        """异步执行图
        
        Args:
            input: 输入数据
            config: 配置选项
        
        Returns:
            执行结果
        """
        pass
    
    async def astream(self, input: Any, config: Optional[Dict] = None) -> AsyncIterator:
        """异步流式执行图
        
        Args:
            input: 输入数据
            config: 配置选项
        
        Returns:
            事件流
        """
        pass
    
    def get_graph(self) -> Graph:
        """获取图结构
        
        Returns:
            图结构
        """
        pass
```

#### 常量
```python
from langgraph.graph import END

# END常量表示图的结束
END = "__end__"
```

### 2. langgraph.checkpoint
检查点模块。

#### BaseCheckpointSaver
```python
from langgraph.checkpoint.base import BaseCheckpointSaver

class BaseCheckpointSaver:
    def get(self, config: Dict) -> Optional[Checkpoint]:
        """获取检查点
        
        Args:
            config: 配置选项
        
        Returns:
            检查点数据
        """
        pass
    
    def put(self, config: Dict, checkpoint: Checkpoint) -> Dict:
        """保存检查点
        
        Args:
            config: 配置选项
            checkpoint: 检查点数据
        
        Returns:
            更新后的配置
        """
        pass
```

#### MemorySaver
```python
from langgraph.checkpoint.memory import MemorySaver

class MemorySaver(BaseCheckpointSaver):
    """内存检查点存储"""
    
    def __init__(self):
        """初始化内存存储"""
        pass
```

#### SqliteSaver
```python
from langgraph.checkpoint.sqlite import SqliteSaver

class SqliteSaver(BaseCheckpointSaver):
    """SQLite检查点存储"""
    
    def __init__(self, conn: sqlite3.Connection):
        """初始化SQLite存储
        
        Args:
            conn: SQLite连接
        """
        pass
```

### 3. langgraph.prebuilt
预构建组件模块。

#### ToolNode
```python
from langgraph.prebuilt import ToolNode

class ToolNode:
    """工具节点"""
    
    def __init__(self, tools: List[BaseTool]):
        """初始化工具节点
        
        Args:
            tools: 工具列表
        """
        pass
    
    def __call__(self, state: Dict) -> Dict:
        """执行工具
        
        Args:
            state: 当前状态
        
        Returns:
            更新后的状态
        """
        pass
```

#### ToolExecutor
```python
from langgraph.prebuilt import ToolExecutor

class ToolExecutor:
    """工具执行器"""
    
    def __init__(self, tools: List[BaseTool]):
        """初始化工具执行器
        
        Args:
            tools: 工具列表
        """
        pass
    
    def invoke(self, input: Any) -> Any:
        """执行工具
        
        Args:
            input: 输入数据
        
        Returns:
            执行结果
        """
        pass
```

## 常用方法

### 1. 图构建方法
```python
# 创建状态图
graph = StateGraph(State)

# 添加节点
graph.add_node("node_name", node_function)

# 添加普通边
graph.add_edge("start_node", "end_node")

# 添加条件边
graph.add_conditional_edges(
    "source_node",
    condition_function,
    {
        "condition1": "node1",
        "condition2": "node2"
    }
)

# 设置入口点
graph.set_entry_point("start_node")

# 设置结束点
graph.set_finish_point("end_node")

# 编译图
app = graph.compile()
```

### 2. 图执行方法
```python
# 同步执行
result = app.invoke(input_data)

# 流式执行
for event in app.stream(input_data):
    print(event)

# 异步执行
result = await app.ainvoke(input_data)

# 异步流式执行
async for event in app.astream(input_data):
    print(event)
```

### 3. 检查点方法
```python
from langgraph.checkpoint.memory import MemorySaver

# 创建检查点存储
checkpointer = MemorySaver()

# 编译图时使用检查点
app = graph.compile(checkpointer=checkpointer)

# 执行时指定配置
config = {"configurable": {"thread_id": "thread_1"}}
result = app.invoke(input_data, config)

# 获取检查点
checkpoint = checkpointer.get(config)
```

### 4. 可视化方法
```python
# 获取图结构
graph_structure = app.get_graph()

# 可视化图
print(graph_structure.draw_ascii())

# 导出图
graph_structure.draw_png("graph.png")
```

## 配置选项

### 1. 图配置
```python
app = graph.compile(
    checkpointer=checkpointer,           # 检查点存储
    interrupt_before=["node1", "node2"],  # 在指定节点前中断
    interrupt_after=["node3"],            # 在指定节点后中断
    debug=True                            # 启用调试模式
)
```

### 2. 执行配置
```python
config = {
    "configurable": {
        "thread_id": "thread_1",          # 线程ID
        "checkpoint_id": "checkpoint_1"   # 检查点ID
    },
    "recursion_limit": 25,                # 递归限制
    "run_name": "my_graph",              # 运行名称
    "tags": ["production"],               # 标签
    "metadata": {"version": "1.0"}        # 元数据
}

result = app.invoke(input_data, config)
```

### 3. 状态配置
```python
from typing import TypedDict, Annotated
from operator import add

class State(TypedDict):
    # 使用Annotated添加操作
    messages: Annotated[list, add]  # 消息列表，使用add操作合并
    current_step: str               # 当前步骤
    results: dict                   # 结果
```

## 错误处理

### 1. 图构建错误
```python
from langgraph.graph import StateGraph

try:
    graph = StateGraph(State)
    graph.add_node("node1", node_function)
    graph.add_edge("node1", "node2")  # node2不存在
except ValueError as e:
    print(f"图构建错误: {e}")
except Exception as e:
    print(f"未知错误: {e}")
```

### 2. 执行错误
```python
try:
    result = app.invoke(input_data)
except Exception as e:
    print(f"执行错误: {e}")
    
    # 获取最后的检查点
    checkpoint = checkpointer.get(config)
    if checkpoint:
        print(f"最后检查点: {checkpoint}")
```

### 3. 状态验证错误
```python
from pydantic import ValidationError

try:
    result = app.invoke(invalid_state)
except ValidationError as e:
    print(f"状态验证错误: {e}")
```

## 最佳实践

### 1. 状态定义
```python
from typing import TypedDict, Annotated
from operator import add

class State(TypedDict):
    # 使用Annotated定义状态操作
    messages: Annotated[list, add]  # 消息列表
    current_step: str               # 当前步骤
    results: dict                   # 结果
    
    # 可选字段
    error: Optional[str] = None     # 错误信息
```

### 2. 节点设计
```python
def node_function(state: State) -> State:
    """节点函数
    
    Args:
        state: 当前状态
    
    Returns:
        更新后的状态
    """
    try:
        # 执行节点逻辑
        result = process(state)
        
        # 返回状态更新
        return {
            "messages": [result],
            "current_step": "completed"
        }
    except Exception as e:
        # 错误处理
        return {
            "error": str(e),
            "current_step": "error"
        }
```

### 3. 条件边设计
```python
def condition_function(state: State) -> str:
    """条件函数
    
    Args:
        state: 当前状态
    
    Returns:
        下一个节点的名称
    """
    if state.get("error"):
        return "error_handler"
    elif state["current_step"] == "completed":
        return "end"
    else:
        return "continue"
```

## 常见问题

### 1. 图构建问题
- **节点不存在**：检查节点名称是否正确
- **循环依赖**：确保图没有循环依赖
- **状态不一致**：确保所有节点返回正确的状态格式

### 2. 执行问题
- **死循环**：设置递归限制
- **状态丢失**：使用检查点持久化状态
- **并发问题**：使用异步执行处理并发

### 3. 性能问题
- **执行慢**：优化节点函数
- **内存占用高**：减少状态大小
- **扩展性差**：使用分布式检查点存储

## 下一步学习

- [工作流模式](/agent/langgraph/workflow-patterns) - 常见工作流模式
- [RAG技术](/agent/rag/) - 掌握知识增强技术
- [Agent框架](/agent/agent-frameworks/) - 了解各种Agent框架