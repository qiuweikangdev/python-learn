# MCP 协议：模型上下文协议

> **版本基线**：本文基于 MCP（Model Context Protocol）2025-06-18 版协议规范与 mcp Python SDK，示例模型为 gpt-5-mini，更新于 2026-09。

## 什么是 MCP？

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 于 2024 年 11 月发布的一项**开放协议**，用于标准化大语言模型应用与外部工具、数据源之间的连接方式。

MCP 诞生之前，每个 AI 应用要接入每个工具（搜索、数据库、GitHub、文件系统……）都需要单独开发一次集成，形成 **M×N 集成难题**——M 个应用 × N 个工具 = M×N 份集成代码。

```
没有 MCP：                          有 MCP：

应用1 ──┬── 工具A                   应用1 ──┐          ┌── 工具A
应用2 ──┼── 工具B                   应用2 ──┼── MCP ──┼── 工具B
应用3 ──┴── 工具C                   应用3 ──┘          └── 工具C
   （M × N 份集成）                    （M + N 份集成）
```

有了 MCP，每个应用只需要实现一次 MCP 客户端，每个工具只需要实现一次 MCP 服务器，双方即可互相对话。2025 年起，OpenAI（Agents SDK）、Google 等主流厂商陆续宣布支持 MCP，MCP 已成为 **LLM 连接工具与数据的事实标准**。

## 核心架构

MCP 采用客户端-服务器架构，包含三个角色：

| 角色 | 说明 | 示例 |
|------|------|------|
| **Host（宿主）** | 运行 LLM 应用的程序，管理一个或多个 MCP Client | Claude Desktop、Cursor、你自己写的 Agent 应用 |
| **Client（客户端）** | 与 Server 保持 1:1 连接的协议客户端，负责转发请求 | Host 进程内的连接器 |
| **Server（服务器）** | 暴露具体能力的轻量服务，可以是一个本地子进程或远程服务 | 天气查询服务、GitHub 服务、数据库服务 |

MCP Server 向外暴露**三类能力**：

| 能力 | 说明 | 类比 |
|------|------|------|
| **Tools（工具）** | 模型可以**调用**的函数，由模型决定何时调用 | POST 请求：会产生副作用（发消息、写文件） |
| **Resources（资源）** | 应用可以**读取**的数据，如文件内容、数据库记录 | GET 请求：只读，不改变状态 |
| **Prompts（提示模板）** | 预置的提示词模板，供用户或应用选用 | 常用话术模板 |

## 用 Python 编写 MCP 服务器（FastMCP）

`mcp` Python SDK 提供了 FastMCP 高层 API：写一个普通 Python 函数、加上装饰器和 docstring，它就自动成为模型可调用的工具。

```bash
# 安装官方 Python SDK（推荐使用 uv：uv add mcp）
pip install "mcp[cli]"
```

创建 `weather_server.py`：

```python
from mcp.server.fastmcp import FastMCP

# 创建 MCP 服务器实例，名称为 "weather"
mcp = FastMCP("weather")

@mcp.tool()
def get_weather(city: str) -> str:
    """查询指定城市当前天气"""
    # 实际项目中这里可以调用真实天气 API
    return f"{city} 晴，25°C"

if __name__ == "__main__":
    mcp.run()          # 默认 stdio 传输
```

运行后，这个进程就是一个标准的 MCP Server。

### 两种传输方式

| 传输 | 说明 | 适用场景 |
|------|------|----------|
| **stdio（标准输入输出）** | Host 把 Server 作为本地子进程启动，通过 stdin/stdout 通信 | 本地工具：读文件、执行脚本 |
| **Streamable HTTP** | Server 以 HTTP 服务形式运行，支持远程调用与会话管理（2025-03 版协议起取代旧的 SSE 传输） | 远程服务：团队共享、SaaS 工具 |

本地演示用 stdio 即可；对外提供远程服务时改用 Streamable HTTP（`FastMCP` 支持 `mcp.run(transport="streamable-http")`）。

## 在客户端中消费 MCP 工具

LangChain 生态通过 `langchain-mcp-adapters` 把 MCP Server 的工具转换为 LangChain 工具，直接喂给 Agent：

```bash
pip install langchain-mcp-adapters langchain-openai
```

```python
import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent

async def main():
    # 配置要连接的 MCP Server（本地 stdio 子进程）
    client = MultiServerMCPClient({
        "weather": {"command": "python", "args": ["weather_server.py"], "transport": "stdio"}
    })

    # 获取并转换 Server 暴露的所有工具
    tools = await client.get_tools()

    # 创建 Agent：模型遇到这些问题会自动调用 MCP 工具
    agent = create_agent("openai:gpt-5-mini", tools)

    result = await agent.ainvoke({"messages": [{"role": "user", "content": "北京天气怎么样？"}]})
    print(result["messages"][-1].content)

if __name__ == "__main__":
    asyncio.run(main())
```

::: tip 关于 async
MCP 的客户端接口是**异步**的（`await client.get_tools()`），因此示例用 `asyncio.run(main())` 驱动；如果你在 Jupyter Notebook 中运行，直接 `await main()` 即可。
:::

## 生态与工具

MCP 生态已经相当成熟：

- **原生支持 MCP 的客户端**：Claude Desktop、Cursor、OpenAI Agents SDK 等，均可直接配置 MCP Server；
- **常见公共 Server**：文件系统（filesystem）、GitHub、数据库（PostgreSQL/SQLite）、浏览器自动化、Slack 等，大多可直接安装使用，不必从零开发。

给 Claude Desktop 等宿主添加一个本地 Server，通常只需在配置文件里写一行启动命令（与上面 `MultiServerMCPClient` 的配置等价）。

::: warning 安全提示
MCP 工具本质上是"让模型能执行外部操作"，使用时务必注意：

- **只安装可信的 MCP Server**：第三方 Server 拥有你授予的文件、网络等权限，恶意 Server 等于引入后门；
- **警惕提示注入**：工具的描述与返回内容都会进入模型上下文，可能携带注入指令，生产环境应对可用工具做**白名单**管控，并对工具调用保留**审计日志**；
- **最小权限**：文件系统 Server 只开放必要目录，数据库账号只授予只读权限。
:::

## 下一步学习

- [LangChain框架](/agent/langchain/) - 在 LangChain 中编排 LLM 应用与 MCP 工具
- [Agent框架](/agent/agent-frameworks/) - 了解各种 Agent 框架与工具生态
