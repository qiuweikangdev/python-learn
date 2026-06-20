# 函数调用

## 什么是函数调用？

函数调用（Function Calling）是让大语言模型（LLM）调用外部工具和API的机制。通过函数调用，LLM可以获取实时信息、执行计算、操作数据等，从而扩展其能力范围。

## 核心概念

### 1. 函数定义
函数调用需要定义函数的接口：
- **函数名称**：函数的唯一标识
- **函数描述**：函数功能的描述
- **参数定义**：函数的输入参数
- **返回值**：函数的返回结果

### 2. 调用流程
函数调用的典型流程：
1. **用户输入**：用户提出需要调用函数的请求
2. **模型决策**：LLM决定是否需要调用函数
3. **参数提取**：从用户输入中提取函数参数
4. **函数执行**：执行函数并获取结果
5. **结果处理**：将结果返回给用户

### 3. 调用模式
函数调用的不同模式：
- **自动调用**：模型自动决定是否调用函数
- **强制调用**：强制模型调用指定函数
- **禁止调用**：禁止模型调用函数

## 技术原理

### 1. 参数提取
LLM从用户输入中提取函数参数：
- **实体识别**：识别输入中的实体
- **关系抽取**：抽取实体之间的关系
- **参数映射**：将实体映射到函数参数

### 2. 函数选择
LLM选择合适的函数：
- **语义匹配**：根据用户意图匹配函数
- **上下文理解**：理解上下文选择函数
- **多函数选择**：选择多个函数组合

### 3. 结果处理
处理函数执行结果：
- **结果解析**：解析函数返回结果
- **格式转换**：转换结果格式
- **错误处理**：处理函数执行错误

## Function Calling 原理详解

### 为什么模型能调用函数？

**核心原因：训练数据中的代码和API文档**

模型在预训练阶段学习了大量的：
- 函数定义代码
- API文档
- 调用示例

这使得模型能够：
1. 理解函数签名（名称、参数、返回值）
2. 理解函数功能（通过描述）
3. 生成正确的调用参数

### 参数提取机制

**参数提取的过程**：

```
用户输入："帮我查一下北京今天天气怎么样？"

步骤1：意图识别
- 识别用户意图：查询天气
- 匹配函数：get_weather

步骤2：实体识别
- 识别实体：北京（地点）、今天（时间）

步骤3：参数映射
- 将实体映射到函数参数
- location = "北京"
- date = "今天"

步骤4：生成调用
- 生成函数调用：get_weather(location="北京", date="今天")
```

**代码示例**：

```python
from openai import OpenAI
import json

client = OpenAI()

def demonstrate_parameter_extraction():
    """
    演示参数提取过程
    
    展示模型如何从自然语言中提取函数参数
    """
    
    # 定义函数
    functions = [
        {
            "name": "search_restaurant",
            "description": "搜索餐厅",
            "parameters": {
                "type": "object",
                "properties": {
                    "cuisine": {
                        "type": "string",
                        "description": "菜系类型，如中餐、西餐、日料等"
                    },
                    "location": {
                        "type": "string",
                        "description": "地点，如北京、上海等"
                    },
                    "price_range": {
                        "type": "string",
                        "description": "价格范围，如便宜、中等、昂贵"
                    }
                },
                "required": ["cuisine", "location"]
            }
        }
    ]
    
    # 用户输入（自然语言，格式不固定）
    user_inputs = [
        "我想在北京吃便宜的中餐",
        "推荐一家上海的西餐厅，预算中等",
        "找一家日料店，在广州，价格不要太高"
    ]
    
    for user_input in user_inputs:
        print(f"\n用户输入：{user_input}")
        
        # 让模型提取参数
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": user_input}],
            functions=functions,
            function_call="auto"
        )
        
        message = response.choices[0].message
        
        if message.function_call:
            # 模型成功提取了参数
            args = json.loads(message.function_call.arguments)
            print(f"提取的参数：{json.dumps(args, ensure_ascii=False, indent=2)}")
        else:
            # 模型没有调用函数
            print(f"模型回复：{message.content}")

# 运行示例
# demonstrate_parameter_extraction()
```

### 函数选择机制

**当有多个函数可用时，模型如何选择？**

```
可用函数：
1. get_weather(location) - 查询天气
2. search_restaurant(cuisine, location) - 搜索餐厅
3. book_hototel(location, date) - 预订酒店

用户输入："北京有什么好吃的？"

模型分析：
- 关键词："好吃的" → 餐厅相关
- 地点："北京"
- 选择函数：search_restaurant

调用：search_restaurant(location="北京")
```

**代码示例**：

```python
from openai import OpenAI
import json

client = OpenAI()

def demonstrate_function_selection():
    """
    演示函数选择过程
    
    当有多个函数可用时，模型如何选择合适的函数
    """
    
    # 定义多个函数
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
        },
        {
            "name": "search_restaurant",
            "description": "搜索餐厅",
            "parameters": {
                "type": "object",
                "properties": {
                    "cuisine": {
                        "type": "string",
                        "description": "菜系类型"
                    },
                    "location": {
                        "type": "string",
                        "description": "地点"
                    }
                },
                "required": ["cuisine", "location"]
            }
        },
        {
            "name": "book_hotel",
            "description": "预订酒店",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "地点"
                    },
                    "check_in": {
                        "type": "string",
                        "description": "入住日期"
                    },
                    "check_out": {
                        "type": "string",
                        "description": "离店日期"
                    }
                },
                "required": ["location", "check_in", "check_out"]
            }
        }
    ]
    
    # 不同的用户输入，模型会选择不同的函数
    user_inputs = [
        "北京今天天气怎么样？",  # 选择 get_weather
        "我想在北京吃火锅",      # 选择 search_restaurant
        "帮我预订明天到后天北京的酒店"  # 选择 book_hotel
    ]
    
    for user_input in user_inputs:
        print(f"\n用户输入：{user_input}")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": user_input}],
            functions=functions,
            function_call="auto"
        )
        
        message = response.choices[0].message
        
        if message.function_call:
            print(f"选择的函数：{message.function_call.name}")
            args = json.loads(message.function_call.arguments)
            print(f"参数：{json.dumps(args, ensure_ascii=False)}")
        else:
            print(f"模型回复：{message.content}")

# 运行示例
# demonstrate_function_selection()
```

### 错误处理策略

**函数调用可能遇到的错误**：

1. **函数不存在**：模型调用了未定义的函数
2. **参数错误**：参数类型或格式不正确
3. **执行失败**：函数执行过程中出错
4. **超时**：函数执行超时

**错误处理代码示例**：

```python
from openai import OpenAI
import json
from typing import Dict, Any

client = OpenAI()

class FunctionCallingWithErrorHandling:
    """
    带错误处理的函数调用
    
    处理各种可能的错误情况
    """
    
    def __init__(self):
        # 注册可用函数
        self.functions = {
            "get_weather": self.get_weather,
            "calculate": self.calculate,
            "divide": self.divide
        }
        
        # 函数定义（用于模型）
        self.function_definitions = [
            {
                "name": "get_weather",
                "description": "获取天气信息",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "城市名称"}
                    },
                    "required": ["location"]
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
                "name": "divide",
                "description": "除法运算",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "a": {"type": "number", "description": "被除数"},
                        "b": {"type": "number", "description": "除数"}
                    },
                    "required": ["a", "b"]
                }
            }
        ]
    
    def get_weather(self, location: str) -> Dict[str, Any]:
        """
        获取天气信息
        
        Args:
            location: 城市名称
        
        Returns:
            天气信息字典
        """
        # 模拟天气API
        weather_data = {
            "北京": {"weather": "晴", "temperature": 25},
            "上海": {"weather": "多云", "temperature": 28}
        }
        
        if location in weather_data:
            return {"success": True, "data": weather_data[location]}
        else:
            # 错误：未找到城市
            return {"success": False, "error": f"未找到城市：{location}"}
    
    def calculate(self, expression: str) -> Dict[str, Any]:
        """
        计算数学表达式
        
        Args:
            expression: 数学表达式
        
        Returns:
            计算结果
        """
        try:
            result = eval(expression)
            return {"success": True, "result": result}
        except Exception as e:
            # 错误：表达式计算失败
            return {"success": False, "error": f"计算错误：{str(e)}"}
    
    def divide(self, a: float, b: float) -> Dict[str, Any]:
        """
        除法运算
        
        Args:
            a: 被除数
            b: 除数
        
        Returns:
            除法结果
        """
        try:
            if b == 0:
                # 错误：除数为零
                raise ValueError("除数不能为零")
            result = a / b
            return {"success": True, "result": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def call_with_error_handling(self, user_input: str, max_retries: int = 2) -> str:
        """
        带错误处理的函数调用
        
        Args:
            user_input: 用户输入
            max_retries: 最大重试次数
        
        Returns:
            处理结果
        """
        messages = [{"role": "user", "content": user_input}]
        
        for attempt in range(max_retries + 1):
            try:
                # 调用模型
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    functions=self.function_definitions,
                    function_call="auto"
                )
                
                message = response.choices[0].message
                
                if message.function_call:
                    # 执行函数
                    func_name = message.function_call.name
                    func_args = json.loads(message.function_call.arguments)
                    
                    # 检查函数是否存在
                    if func_name not in self.functions:
                        # 错误：函数不存在
                        error_msg = f"函数 {func_name} 不存在"
                        messages.append(message)
                        messages.append({
                            "role": "function",
                            "name": func_name,
                            "content": json.dumps({"success": False, "error": error_msg})
                        })
                        continue
                    
                    # 执行函数
                    result = self.functions[func_name](**func_args)
                    
                    # 检查函数执行是否成功
                    if result.get("success"):
                        # 成功：返回结果给模型
                        messages.append(message)
                        messages.append({
                            "role": "function",
                            "name": func_name,
                            "content": json.dumps(result, ensure_ascii=False)
                        })
                        
                        # 让模型基于结果生成回答
                        final_response = client.chat.completions.create(
                            model="gpt-3.5-turbo",
                            messages=messages
                        )
                        return final_response.choices[0].message.content
                    else:
                        # 失败：将错误信息返回给模型
                        error_msg = result.get("error", "未知错误")
                        messages.append(message)
                        messages.append({
                            "role": "function",
                            "name": func_name,
                            "content": json.dumps({"success": False, "error": error_msg})
                        })
                        
                        # 如果还有重试次数，继续尝试
                        if attempt < max_retries:
                            print(f"函数执行失败，重试 {attempt + 1}/{max_retries}")
                            continue
                        else:
                            return f"抱歉，函数执行失败：{error_msg}"
                else:
                    # 模型没有调用函数，直接返回回复
                    return message.content
                    
            except Exception as e:
                # 其他错误
                if attempt < max_retries:
                    print(f"发生错误，重试 {attempt + 1}/{max_retries}: {str(e)}")
                    continue
                else:
                    return f"抱歉，处理请求时发生错误：{str(e)}"
        
        return "抱歉，处理请求失败"

# 使用示例
handler = FunctionCallingWithErrorHandling()

# 测试正常情况
print(handler.call_with_error_handling("北京天气怎么样？"))

# 测试错误情况（除以零）
print(handler.call_with_error_handling("计算10除以0"))

# 测试错误情况（未知城市）
print(handler.call_with_error_handling("火星天气怎么样？"))
```

### 多函数组合调用

**有时一个任务需要调用多个函数**：

```
用户输入："北京今天天气怎么样？如果天气好，帮我预订明天的酒店"

模型分析：
1. 首先调用 get_weather("北京") 获取天气
2. 如果天气好，再调用 book_hotel("北京", "明天") 预订酒店
```

**代码示例**：

```python
from openai import OpenAI
import json

client = OpenAI()

def multi_function_calling():
    """
    多函数组合调用示例
    
    演示如何在一个任务中调用多个函数
    """
    
    # 定义函数
    functions = [
        {
            "name": "get_weather",
            "description": "获取天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "城市名称"}
                },
                "required": ["location"]
            }
        },
        {
            "name": "book_hotel",
            "description": "预订酒店",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "城市"},
                    "date": {"type": "string", "description": "日期"}
                },
                "required": ["location", "date"]
            }
        }
    ]
    
    # 模拟函数实现
    def get_weather(location):
        return {"weather": "晴", "temperature": 25}
    
    def book_hotel(location, date):
        return {"success": True, "hotel": "北京大酒店", "date": date}
    
    # 用户输入
    user_input = "北京今天天气怎么样？如果天气好，帮我预订明天的酒店"
    
    # 第一次调用：获取天气
    messages = [{"role": "user", "content": user_input}]
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        functions=functions,
        function_call="auto"
    )
    
    message = response.choices[0].message
    
    if message.function_call:
        # 执行天气查询
        weather_result = get_weather("北京")
        print(f"天气结果：{weather_result}")
        
        # 将结果添加到消息
        messages.append(message)
        messages.append({
            "role": "function",
            "name": "get_weather",
            "content": json.dumps(weather_result)
        })
        
        # 第二次调用：模型决定是否预订酒店
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            functions=functions,
            function_call="auto"
        )
        
        message = response.choices[0].message
        
        if message.function_call:
            # 执行酒店预订
            hotel_result = book_hotel("北京", "明天")
            print(f"酒店结果：{hotel_result}")
            
            # 将结果添加到消息
            messages.append(message)
            messages.append({
                "role": "function",
                "name": "book_hotel",
                "content": json.dumps(hotel_result)
            })
            
            # 最终回复
            final_response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages
            )
            print(f"最终回复：{final_response.choices[0].message.content}")
        else:
            print(f"模型回复：{message.content}")

# 运行示例
# multi_function_calling()
```

## 技术方案对比

### 函数调用 vs 工具使用 vs 插件系统

| 对比维度 | 函数调用(Function Calling) | 工具使用(Tool Use) | 插件系统(Plugins) |
|----------|---------------------------|-------------------|-------------------|
| **定义方式** | JSON Schema定义函数签名 | 自然语言描述工具 | 标准化插件接口 |
| **调用方式** | 模型生成函数调用参数 | 模型决定使用工具 | 模型触发插件 |
| **灵活性** | 高，可定义任意函数 | 中，依赖工具描述 | 低，需要遵循规范 |
| **开发成本** | 中等 | 低 | 较高 |
| **适用场景** | API集成、数据处理 | 简单工具调用 | 复杂第三方服务 |

### 如何选择方案？

**场景一：调用已有API**
- 推荐：函数调用
- 原因：可以直接映射现有API接口

**场景二：简单工具集成**
- 推荐：工具使用
- 原因：开发成本低，描述简单

**场景三：复杂第三方服务**
- 推荐：插件系统
- 原因：标准化接口，易于管理

## 设计原理与目的

### 为什么需要函数调用？

**解决的问题：**

1. **知识时效性**：模型训练数据有截止日期，无法获取实时信息
```
用户：今天北京天气怎么样？
模型（无函数调用）：抱歉，我无法获取实时天气信息。
模型（有函数调用）：调用天气API → 今天北京晴，25℃
```

2. **计算准确性**：模型不擅长精确计算
```
用户：计算 123456 × 789012
模型（无函数调用）：结果大约是974亿（不准确）
模型（有函数调用）：调用计算器 → 97400683072（准确）
```

3. **数据操作**：模型无法直接操作数据库
```
用户：查询我的订单状态
模型（无函数调用）：抱歉，我无法访问您的订单数据。
模型（有函数调用）：调用订单API → 您的订单已发货
```

### 函数调用的核心原理

**1. 函数签名理解**

模型通过JSON Schema理解函数：
```json
{
    "name": "get_weather",
    "description": "获取天气信息",
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
```

模型理解：这个函数叫get_weather，需要一个location参数，返回天气信息

**2. 参数提取过程**

```
用户输入："北京今天天气怎么样？"

模型分析：
- 意图：查询天气
- 实体：北京
- 时间：今天

参数映射：
{
    "location": "北京",
    "date": "今天"
}
```

**3. 调用决策**

模型根据上下文决定是否调用函数：
- 需要实时信息 → 调用函数
- 模型已有知识 → 直接回答
- 不确定 → 询问用户

### 为什么模型能理解函数？

**训练数据中包含大量代码和API文档**

模型在训练时学习了：
- 函数定义的模式
- 参数的语义含义
- 调用的上下文

**类比理解：**
就像人类看到"请拨打120"知道要打电话一样，模型看到函数描述知道要调用它

## 应用场景详解

### 场景一：实时信息查询

**需求：** 查询股票价格

**实现：**
```python
from openai import OpenAI
import json
import requests

client = OpenAI(api_key="your-api-key")

# 定义股票查询函数
def get_stock_price(symbol):
    """获取股票价格"""
    # 这里应该是实际的股票API
    # 示例返回
    prices = {"AAPL": 150.25, "GOOGL": 2800.50, "MSFT": 310.75}
    return {"symbol": symbol, "price": prices.get(symbol, "未找到")}

# 函数定义
functions = [
    {
        "name": "get_stock_price",
        "description": "获取指定股票的当前价格",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "股票代码，如AAPL、GOOGL"
                }
            },
            "required": ["symbol"]
        }
    }
]

def chat_with_stock(query):
    """带股票查询的对话"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": query}],
        functions=functions,
        function_call="auto"
    )
    
    message = response.choices[0].message
    
    if message.function_call:
        # 执行函数
        args = json.loads(message.function_call.arguments)
        result = get_stock_price(**args)
        
        # 将结果返回给模型
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": query},
                message,
                {"role": "function", "name": "get_stock_price", "content": json.dumps(result)}
            ]
        )
        
        return response.choices[0].message.content
    
    return message.content

# 使用示例
print(chat_with_stock("苹果公司的股价是多少？"))
```

**设计要点：**
- 函数描述要清晰明确
- 参数定义要完整
- 错误处理要完善

### 场景二：数据库操作

**需求：** 查询用户订单

**实现：**
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 模拟数据库
orders_db = {
    "user123": [
        {"id": "ORD001", "status": "已发货", "total": 299.00},
        {"id": "ORD002", "status": "待付款", "total": 159.00}
    ]
}

# 定义数据库查询函数
def query_orders(user_id, status=None):
    """查询用户订单"""
    orders = orders_db.get(user_id, [])
    if status:
        orders = [o for o in orders if o["status"] == status]
    return {"orders": orders, "count": len(orders)}

functions = [
    {
        "name": "query_orders",
        "description": "查询用户的订单信息",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "用户ID"
                },
                "status": {
                    "type": "string",
                    "enum": ["待付款", "已付款", "已发货", "已完成"],
                    "description": "订单状态筛选（可选）"
                }
            },
            "required": ["user_id"]
        }
    }
]

def chat_with_orders(query, user_id):
    """带订单查询的对话"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"当前用户ID：{user_id}"},
            {"role": "user", "content": query}
        ],
        functions=functions,
        function_call="auto"
    )
    
    message = response.choices[0].message
    
    if message.function_call:
        args = json.loads(message.function_call.arguments)
        result = query_orders(**args)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"当前用户ID：{user_id}"},
                {"role": "user", "content": query},
                message,
                {"role": "function", "name": "query_orders", "content": json.dumps(result)}
            ]
        )
        
        return response.choices[0].message.content
    
    return message.content

# 使用示例
print(chat_with_orders("查询我的待付款订单", "user123"))
```

**设计要点：**
- 在system prompt中提供用户上下文
- 函数参数支持可选筛选
- 返回结构化的数据

### 场景三：多函数组合

**需求：** 同时支持天气查询和日程管理

**实现：**
```python
from openai import OpenAI
import json
from datetime import datetime

client = OpenAI(api_key="your-api-key")

# 定义多个函数
def get_weather(location):
    """获取天气"""
    return {"location": location, "weather": "晴", "temperature": 25}

def get_schedule(date):
    """获取日程"""
    schedules = {
        "2024-01-15": [{"time": "10:00", "event": "会议"}, {"time": "14:00", "event": "拜访客户"}]
    }
    return {"date": date, "schedule": schedules.get(date, [])}

def add_schedule(date, time, event):
    """添加日程"""
    return {"success": True, "message": f"已添加{date} {time}的{event}"}

functions = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string", "description": "城市名称"}
            },
            "required": ["location"]
        }
    },
    {
        "name": "get_schedule",
        "description": "获取指定日期的日程安排",
        "parameters": {
            "type": "object",
            "properties": {
                "date": {"type": "string", "description": "日期，格式：YYYY-MM-DD"}
            },
            "required": ["date"]
        }
    },
    {
        "name": "add_schedule",
        "description": "添加新的日程",
        "parameters": {
            "type": "object",
            "properties": {
                "date": {"type": "string", "description": "日期"},
                "time": {"type": "string", "description": "时间"},
                "event": {"type": "string", "description": "事件名称"}
            },
            "required": ["date", "time", "event"]
        }
    }
]

def chat_with_assistant(query):
    """多功能助手"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": query}],
        functions=functions,
        function_call="auto"
    )
    
    message = response.choices[0].message
    
    if message.function_call:
        func_name = message.function_call.name
        args = json.loads(message.function_call.arguments)
        
        # 执行对应函数
        if func_name == "get_weather":
            result = get_weather(**args)
        elif func_name == "get_schedule":
            result = get_schedule(**args)
        elif func_name == "add_schedule":
            result = add_schedule(**args)
        else:
            result = {"error": "未知函数"}
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": query},
                message,
                {"role": "function", "name": func_name, "content": json.dumps(result)}
            ]
        )
        
        return response.choices[0].message.content
    
    return message.content

# 使用示例
print(chat_with_assistant("今天北京天气怎么样？"))
print(chat_with_assistant("明天有什么安排？"))
print(chat_with_assistant("帮我在明天下午3点添加一个会议"))
```

**设计要点：**
- 定义多个相关函数
- 模型自动选择合适的函数
- 统一的函数执行和结果处理

### 场景四：错误处理与重试

**需求：** 处理函数调用失败的情况

**实现：**
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

def unreliable_api(query):
    """可能失败的API"""
    if "错误" in query:
        raise ValueError("API调用失败")
    return {"result": f"处理结果：{query}"}

functions = [
    {
        "name": "unreliable_api",
        "description": "调用可能失败的API",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "查询内容"}
            },
            "required": ["query"]
        }
    }
]

def chat_with_retry(query, max_retries=3):
    """带重试的对话"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": query}],
                functions=functions,
                function_call="auto"
            )
            
            message = response.choices[0].message
            
            if message.function_call:
                args = json.loads(message.function_call.arguments)
                
                try:
                    result = unreliable_api(**args)
                except Exception as e:
                    # 函数执行失败，告诉模型
                    result = {"error": str(e)}
                
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "user", "content": query},
                        message,
                        {"role": "function", "name": "unreliable_api", "content": json.dumps(result)}
                    ]
                )
                
                return response.choices[0].message.content
            
            return message.content
            
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            print(f"重试 {attempt + 1}/{max_retries}")

# 使用示例
print(chat_with_retry("测试正确调用"))
print(chat_with_retry("测试错误处理"))
```

**设计要点：**
- 捕获函数执行异常
- 将错误信息返回给模型
- 实现重试机制

## 核心API

### 1. 基础函数调用
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 定义函数
functions = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "城市名称，如：北京"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "温度单位"
                }
            },
            "required": ["location"]
        }
    }
]

# 调用API
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    functions=functions,
    function_call="auto"
)

# 处理函数调用
message = response.choices[0].message
if message.function_call:
    function_name = message.function_call.name
    arguments = json.loads(message.function_call.arguments)
    print(f"调用函数: {function_name}")
    print(f"参数: {arguments}")
```

### 2. 多函数调用
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 定义多个函数
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
    },
    {
        "name": "search_restaurant",
        "description": "搜索指定城市的餐厅",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "城市名称"
                },
                "cuisine": {
                    "type": "string",
                    "description": "菜系类型"
                }
            },
            "required": ["location"]
        }
    }
]

# 调用API
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？顺便推荐几家川菜馆"}
    ],
    functions=functions,
    function_call="auto"
)

# 处理多个函数调用
message = response.choices[0].message
if message.function_call:
    print(f"调用函数: {message.function_call.name}")
    print(f"参数: {json.loads(message.function_call.arguments)}")
```

### 3. 强制函数调用
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

# 定义函数
functions = [
    {
        "name": "extract_info",
        "description": "从文本中提取信息",
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "需要提取信息的文本"
                },
                "info_type": {
                    "type": "string",
                    "enum": ["name", "date", "location"],
                    "description": "要提取的信息类型"
                }
            },
            "required": ["text", "info_type"]
        }
    }
]

# 强制调用函数
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "张三在北京参加了2024年1月15日的会议"}
    ],
    functions=functions,
    function_call={"name": "extract_info"}
)

# 处理结果
message = response.choices[0].message
if message.function_call:
    arguments = json.loads(message.function_call.arguments)
    print(f"提取的信息: {arguments}")
```

## 实践指南

### 1. 环境准备
```bash
# 安装OpenAI库
pip install openai

# 设置环境变量
export OPENAI_API_KEY="your-api-key"
```

### 2. 完整示例
```python
from openai import OpenAI
import json
import requests

client = OpenAI(api_key="your-api-key")

# 定义实际函数
def get_weather(location: str) -> dict:
    """获取天气信息"""
    # 这里应该是实际的天气API调用
    return {
        "location": location,
        "temperature": 25,
        "condition": "晴朗",
        "humidity": 60
    }

def search_restaurant(location: str, cuisine: str) -> list:
    """搜索餐厅"""
    # 这里应该是实际的餐厅API调用
    return [
        {"name": "川菜馆A", "rating": 4.5, "address": "北京市朝阳区"},
        {"name": "川菜馆B", "rating": 4.2, "address": "北京市海淀区"}
    ]

# 函数映射
function_map = {
    "get_weather": get_weather,
    "search_restaurant": search_restaurant
}

# 定义函数描述
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
    },
    {
        "name": "search_restaurant",
        "description": "搜索指定城市的餐厅",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "城市名称"
                },
                "cuisine": {
                    "type": "string",
                    "description": "菜系类型"
                }
            },
            "required": ["location"]
        }
    }
]

def chat_with_functions(user_input: str) -> str:
    """带函数调用的对话"""
    # 第一次调用
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": user_input}
        ],
        functions=functions,
        function_call="auto"
    )
    
    message = response.choices[0].message
    
    # 检查是否需要调用函数
    if message.function_call:
        function_name = message.function_call.name
        arguments = json.loads(message.function_call.arguments)
        
        # 执行函数
        if function_name in function_map:
            function_result = function_map[function_name](**arguments)
            
            # 第二次调用，将函数结果传回模型
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": user_input},
                    message,
                    {
                        "role": "function",
                        "name": function_name,
                        "content": json.dumps(function_result, ensure_ascii=False)
                    }
                ]
            )
            
            return response.choices[0].message.content
    
    return message.content

# 使用示例
response = chat_with_functions("北京今天天气怎么样？顺便推荐几家川菜馆")
print(response)
```

### 3. 错误处理
```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

def safe_function_call(user_input: str) -> str:
    """安全的函数调用"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": user_input}
            ],
            functions=functions,
            function_call="auto"
        )
        
        message = response.choices[0].message
        
        if message.function_call:
            function_name = message.function_call.name
            arguments = json.loads(message.function_call.arguments)
            
            # 验证函数是否存在
            if function_name not in function_map:
                return f"错误：函数 {function_name} 不存在"
            
            # 验证参数
            try:
                function_result = function_map[function_name](**arguments)
            except TypeError as e:
                return f"错误：函数参数不正确 - {e}"
            except Exception as e:
                return f"错误：函数执行失败 - {e}"
            
            # 将结果传回模型
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": user_input},
                    message,
                    {
                        "role": "function",
                        "name": function_name,
                        "content": json.dumps(function_result, ensure_ascii=False)
                    }
                ]
            )
            
            return response.choices[0].message.content
        
        return message.content
        
    except Exception as e:
        return f"错误：{e}"

# 使用示例
response = safe_function_call("北京天气怎么样？")
print(response)
```

## 最佳实践

### 1. 函数设计原则
- **单一职责**：每个函数只做一件事
- **清晰描述**：提供清晰的函数描述
- **参数验证**：验证函数参数
- **错误处理**：处理函数执行错误

### 2. 性能优化
- **缓存结果**：缓存函数执行结果
- **异步执行**：异步执行函数
- **批量处理**：批量处理多个函数调用
- **超时控制**：设置函数执行超时

### 3. 安全考虑
- **输入验证**：验证用户输入
- **权限控制**：控制函数调用权限
- **敏感信息**：避免暴露敏感信息
- **审计日志**：记录函数调用日志

## 常见问题

### 1. 函数调用失败
- **函数不存在**：检查函数定义
- **参数错误**：检查参数格式
- **执行超时**：优化函数执行
- **权限不足**：检查函数权限

### 2. 结果不准确
- **描述不清**：优化函数描述
- **参数提取错误**：优化参数定义
- **函数选择错误**：优化函数描述
- **结果处理错误**：优化结果处理

### 3. 性能问题
- **响应慢**：优化函数执行
- **并发限制**：优化并发策略
- **资源占用**：优化资源使用
- **成本高**：优化函数调用

## 下一步学习

- [工具使用](/agent/llm-basics/tool-use) - 扩展模型能力
- [LangChain框架](/agent/langchain/) - 学习LLM应用开发框架
- [Agent框架](/agent/agent-frameworks/) - 了解各种Agent框架