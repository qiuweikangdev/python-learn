## 现代 Python 工程化入门（uv / 类型标注 / Ruff / pytest）

> **说明**：本篇是全站统一的"工程化基线"章节。前面 Day01-20 的课程教会了你 Python 语言本身，但要写出**可靠、可维护、能上手企业级项目**的代码，还需要掌握一套现代工程工具链。本篇所有内容基于 Python 3.12+（2026 年 9 月最新稳定版为 Python 3.14），工具链以 **uv** 为主线。

### 为什么需要工程化

在企业项目里，代码不是"能跑就行"，还需要满足：

1. **依赖可复现**：同一份代码在任何机器上装出的依赖版本完全一致；
2. **风格统一**：团队成员写出的代码像同一个人写的；
3. **类型可查**：在运行之前就发现大部分低级错误；
4. **测试可跑**：每次改动都有自动化测试兜底；
5. **环境隔离**：项目之间互不污染。

Python 社区在 2023-2025 年间完成了工具链的大换代：**uv** 取代 pip/virtualenv/pyenv 的组合成为事实标准，**Ruff** 取代 flake8/isort/black 成为 lint+格式化的统一入口，**类型标注**和 **pytest** 则早已是企业项目的标配。下面我们逐个上手。

### uv：新一代包与环境管理器

[uv](https://docs.astral.sh/uv/) 是 Astral 公司（Ruff 的作者团队）用 Rust 编写的 Python 包管理和项目管理工具，一个命令替代了 pip、virtualenv、pyenv、pipx 等一整套工具，速度比 pip 快一个数量级。2026 年它已经是社区事实标准——包括 LangChain、FastAPI 在内的主流项目官方文档都把它列为首选安装方式。

安装（macOS / Linux）：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Windows（PowerShell）：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

如果不想用脚本安装，`pip install uv` 也可以。

#### 管理 Python 解释器

uv 可以直接安装和管理多个 Python 版本，不再需要 pyenv：

```bash
uv python list              # 查看可安装的版本
uv python install 3.12      # 安装 Python 3.12
uv python install 3.14      # 安装 Python 3.14
```

#### 管理项目依赖

在项目目录下初始化并添加依赖：

```bash
uv init hello-app           # 创建项目（生成 pyproject.toml、main.py）
cd hello-app
uv add requests             # 添加依赖并写入 pyproject.toml
uv add "pandas>=2.3"        # 支持版本约束
uv remove requests          # 移除依赖
uv sync                     # 按 uv.lock 精确还原依赖（同事拿到代码后只需这一条）
uv run main.py              # 在项目虚拟环境中运行脚本
```

`uv add` 会自动创建虚拟环境（`.venv` 目录）、解析依赖并生成 `uv.lock` 锁文件。**把 `uv.lock` 提交到 Git，把 `.venv` 加入 `.gitignore`**，这是团队协作的基础约定：

```gitignore
.venv/
__pycache__/
*.pyc
```

#### 与传统 pip + venv 的对照

| 传统方式 | uv 方式 | 说明 |
| --- | --- | --- |
| `python -m venv .venv` + `source .venv/bin/activate` | `uv venv`（自动创建，`uv run` 无需激活） | uv 运行命令时自动使用项目环境 |
| `pip install requests` | `uv pip install requests` 或 `uv add requests` | `uv add` 会同时更新 pyproject.toml 与锁文件 |
| `pip freeze > requirements.txt` | `uv.lock` 自动生成 | 锁文件由 uv 维护，解析更快、更精确 |
| `pyenv install 3.12.10` | `uv python install 3.12` | 解释器版本管理一体化 |
| `pipx run black` | `uvx black` | 临时运行 CLI 工具，不污染环境 |

> **提示**：`uv pip install`/`uv pip freeze` 等 `uv pip` 系列命令兼容 pip 的用法，老项目可以零成本迁移；新项目建议直接用 `uv init` + `uv add` 的项目模式。传统的 `python -m venv` 和 `pip` 并没有消失，老代码里遇到它们能看懂即可。

### 类型标注（Type Hints）

类型标注（PEP 484）让你在函数签名中声明参数和返回值的类型。它**不影响运行时性能**，但配合 IDE 和静态检查工具能提前抓住大量错误，是企业 Python 项目的标配。Day14 中我们写过的函数：

```python
def is_prime(n):
    ...
```

加上类型标注后：

```python
def is_prime(n: int) -> bool:
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True
```

`n: int` 表示参数是整数，`-> bool` 表示返回布尔值。常用的标注写法：

```python
# 变量标注
name: str = '骆昊'
age: int = 40
scores: list[float] = [95.0, 88.5]

# 容器与字典
def average(nums: list[int]) -> float:
    return sum(nums) / len(nums)

def make_headers(token: str) -> dict[str, str]:
    return {'Authorization': f'Bearer {token}'}

# 可能为 None 的值：用 | None（Python 3.10+ 写法，等价于旧版 Optional[str]）
def find_user(uid: int) -> str | None:
    ...
```

企业项目的函数签名建议**全部**写标注；配合下面的 mypy 或 IDE 检查，`float` 传给 `int` 这类错误在写代码时就会被标红。

#### Pydantic：用类型做数据校验

企业开发中大量工作是对"外部传入的数据"做校验（HTTP 请求体、配置文件、爬虫抓取的结构化数据）。[Pydantic](https://docs.pydantic.dev/) 是这一场景的事实标准，它直接用类型标注完成校验和转换：

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    username: str
    age: int = Field(ge=0, le=150)      # 约束：0 <= age <= 150
    email: str | None = None            # 可选字段

# 校验通过，自动完成类型转换（'18' -> 18）
user = User(username='骆昊', age='18')
print(user.age, type(user.age))         # 18 <class 'int'>

# 校验失败会抛出详细的 ValidationError
User(username='骆昊', age=200)          # ValidationError: age ≤ 150
```

FastAPI、LangChain 等主流框架都把 Pydantic 作为底层数据模型，学会它一举多得。

#### dataclasses：轻量数据类

只是想"把一组字段打包"而不需要校验时，标准库的 `dataclasses` 更轻量：

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float = 0.0      # 支持默认值

p = Point(1.5, 2.5)
print(p)                # Point(x=1.5, y=2.5)，__init__ 和 __repr__ 自动生成
```

### Ruff：一个工具搞定 Lint 和格式化

[Ruff](https://docs.astral.sh/ruff/) 用 Rust 编写，把 flake8、isort、pyflakes 等几十个检查工具和 black 的格式化能力收进一个命令，速度极快，2026 年已是 Python 社区的默认选择：

```bash
uv add --dev ruff           # 作为开发依赖安装
uv run ruff check .         # 静态检查（未使用的变量、导入顺序、常见 bug 等）
uv run ruff check --fix .   # 检查并自动修复
uv run ruff format .        # 统一格式化（对齐 black 风格）
```

在 `pyproject.toml` 中追加常用配置：

```toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]   # E/F 基础错误、I 导入排序、B 常见陷阱、UP 现代化升级建议
```

其中 `UP` 规则会提示你把老写法升级成现代写法（如 `%` 格式化改 f-string、`typing.List` 改 `list`），正好呼应本站各章的"现代写法"要求。

类型检查可以再加一个 mypy：

```bash
uv add --dev mypy
uv run mypy .               # 对全项目做静态类型检查
```

### pytest：企业级单元测试

测试是"可靠"二字的技术保障。Python 标准库自带 `unittest`，但企业项目几乎都用 [pytest](https://docs.pytest.org/)：断言就是普通的 `assert`，写起来最自然。

```bash
uv add --dev pytest
```

为 `is_prime` 写一个测试文件 `test_math_utils.py`：

```python
from math_utils import is_prime

def test_small_primes():
    assert is_prime(2)
    assert is_prime(3)
    assert is_prime(97)

def test_not_prime():
    assert not is_prime(1)
    assert not is_prime(100)

# 参数化：一个测试函数覆盖多组数据
import pytest

@pytest.mark.parametrize('n, expected', [(2, True), (4, False), (13, True)])
def test_many(n, expected):
    assert is_prime(n) == expected
```

运行：

```bash
uv run pytest -v
```

pytest 的 fixture 机制可以管理"测试前准备/测试后清理"（如临时数据库、临时文件），配合 Day59 和 Day96 的内容可以在真实项目中构建完整测试体系。

### pathlib：现代路径操作

Day21 中文件操作使用 `os.path` 拼接路径，现代 Python 更推荐标准库的 `pathlib`——面向对象、跨平台、不易出错：

```python
from pathlib import Path

# 路径拼接：用 / 运算符，Windows/Linux 通用
config = Path('config') / 'settings.json'

# 常用操作
p = Path('data/scores.csv')
p.exists()                  # 是否存在
p.suffix                    # '.csv'
p.stem                      # 'scores'
p.parent                    # Path('data')
p.read_text(encoding='utf-8')           # 一行读全文
Path('out.txt').write_text('hello')     # 一行写文件
Path('.').glob('*.csv')                 # 通配符遍历
Path('.').rglob('*.py')                 # 递归遍历所有子目录
```

新代码请统一使用 `pathlib`，遇到老代码中的 `os.path.join` / `os.listdir` 能看懂即可。

### Python 3.12 ~ 3.14 值得了解的新特性

本站教程以 Python 3.12 为基线，以下是 3.12 之后几个对你有感知的版本变化：

- **3.12**：类支持泛型语法 `class Stack[T]: ...`；f-string 表达式能力大幅放宽（PEP 701）；错误提示进一步友好（会指出"是不是忘了 import"）。
- **3.13**：全新的交互式解释器 REPL（多行编辑、彩色提示）；**实验性自由线程**（free-threading，PEP 703）和实验性 JIT 编译器——Python 正在摆脱 GIL 的限制。
- **3.14**：自由线程构建获得**官方正式支持**（PEP 779），多线程程序无需依赖 GIL 假设；错误消息继续增强。3.10 中我们学过的 `match-case`、结构化模式匹配在新版本中完全兼容。

> **提示**：企业项目选版本看"生态兼容"而不只看"新"。2026 年的主流选择是 3.12/3.13 起步，等关键依赖（如 PyTorch、pandas）宣布支持后再升级到 3.14。

### 工程化起步清单

新建任何 Python 项目时，按下面清单走一遍，就是一个合格的企业级起点：

1. `uv init` 创建项目，`uv python install 3.12` 固定解释器；
2. `uv add` 添加运行依赖，`uv add --dev` 添加开发依赖（ruff、pytest、mypy）；
3. 提交 `uv.lock`，忽略 `.venv/`、`__pycache__/`；
4. 所有函数签名写类型标注，数据边界用 Pydantic 模型；
5. 提交前跑 `ruff check --fix . && ruff format . && pytest`；
6. 路径操作用 `pathlib`，文件读写显式指定 `encoding='utf-8'`；
7. 把上述检查放进 CI（参见《自动化》系列的 CI/CD 章节）。

### 总结

语言学会之后，决定你能否"快速上手企业级项目"的，往往是这套工程化基本功：**uv 管环境、类型标注 + Pydantic 管数据、Ruff 管风格、pytest 管质量、pathlib 管路径**。后面《Agent 开发》《数据分析》《自动化》各系列的示例都会默认遵循本篇的约定。
