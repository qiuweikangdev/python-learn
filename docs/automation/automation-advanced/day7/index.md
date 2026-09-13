# Day 7: 开发环境自动化

> **版本基线**：本文基于 Python 3.12+，更新于 2026-09。虚拟环境与依赖管理推荐以 uv 为主线（见下文专节），venv/pip/Poetry 作为背景知识保留。

## 学习目标

完成今天的学习后，你将能够：
- 管理Python虚拟环境
- 自动化依赖管理
- 配置开发工具
- 实现代码规范检查

## 技术原理

### 虚拟环境管理

Python虚拟环境用于隔离项目依赖：

```bash
# 创建虚拟环境
python -m venv myenv

# 激活虚拟环境
source myenv/bin/activate  # Linux/Mac
myenv\Scripts\activate  # Windows

# 停用虚拟环境
deactivate
```

### 依赖管理工具

#### 1. pip + requirements.txt

```bash
# 生成依赖文件
pip freeze > requirements.txt

# 安装依赖
pip install -r requirements.txt
```

#### 2. Poetry

```bash
# 初始化项目
poetry init

# 添加依赖
poetry add requests

# 安装依赖
poetry install
```

#### 3. Pipenv

```bash
# 安装依赖
pipenv install requests

# 激活环境
pipenv shell
```

#### 4. uv：2026 的事实标准（推荐主线）

上面三种工具分别解决了"隔离"（venv）、"版本"（pyenv）、"依赖管理"（pip/Poetry）的问题，但需要多套工具配合。**uv** 用一个 Rust 实现的单一工具统一取代了 venv + pip + pyenv 组合，是 2026 年 Python 社区的事实标准。

```bash
# 安装 uv（macOS / Linux）
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**常用命令：**

```bash
# 安装/管理 Python 版本（替代 pyenv）
uv python install 3.12

# 创建虚拟环境（替代 python -m venv，自动生成 .venv）
uv venv

# 安装依赖（替代 pip install）
uv pip install -r requirements.txt

# 项目化添加依赖（自动写入 pyproject.toml 并锁定版本）
uv add requests
uv add --dev ruff mypy        # 开发依赖

# 运行命令（自动使用项目环境，免手动 activate）
uv run python script.py
uv run pytest
```

**与 venv + pip + pyenv 组合的对照：**

| 传统组合 | uv 对应命令 | 说明 |
|---------|-------------|------|
| pyenv install / pyenv local | `uv python install` / `uv python pin` | 安装、切换 Python 版本 |
| python -m venv + activate | `uv venv` / `uv run` | 创建环境；`uv run` 免手动激活 |
| pip install | `uv pip install` / `uv add` | 安装依赖，`uv add` 同时写入 pyproject.toml |
| pip freeze / pip-tools | `uv lock` / `uv pip compile` | 统一的依赖锁定 |

**速度优势**：uv 基于 Rust 实现，采用全局缓存与并行下载解析，安装速度通常比 pip 快一个数量级以上（官方基准可达 10-100 倍），CI 流水线中的依赖安装环节收益尤其明显。

::: tip
本教程后续章节的示例命令默认以 uv 为主线（`uv run`、`uv add`）；维护遗留项目时再回看上文的 venv + pip 写法即可。另外代码质量工具链方面，ruff 一个工具即可替代 flake8 + isort + black（详见 Day 10）。
:::

### 代码规范工具

- **flake8**：代码风格检查
- **black**：代码格式化
- **isort**：导入排序
- **mypy**：类型检查
- **pylint**：代码分析

## 案例：开发环境一键配置

创建一个开发环境配置脚本，实现：
1. 自动创建虚拟环境
2. 安装项目依赖
3. 配置开发工具
4. 设置代码规范检查

## 应用场景

### 1. 团队协作
- 统一开发环境
- 简化新人入职流程
- 减少环境问题

### 2. 项目管理
- 依赖版本控制
- 环境隔离
- 快速切换项目

### 3. 持续集成
- 自动化测试环境
- 构建环境一致性
- 部署环境管理

## 代码案例

### 案例1：环境配置脚本

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
开发环境配置脚本
功能：一键配置Python开发环境
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

class DevEnvironmentSetup:
    """开发环境配置器"""
    
    def __init__(self, project_dir='.'):
        self.project_dir = Path(project_dir).resolve()
        self.venv_dir = self.project_dir / 'venv'
        self.requirements_file = self.project_dir / 'requirements.txt'
    
    def create_virtualenv(self):
        """创建虚拟环境"""
        print("创建虚拟环境...")
        
        if self.venv_dir.exists():
            print(f"虚拟环境已存在: {self.venv_dir}")
            return
        
        subprocess.run([sys.executable, '-m', 'venv', str(self.venv_dir)], check=True)
        print(f"虚拟环境创建成功: {self.venv_dir}")
    
    def get_pip_path(self):
        """获取pip路径"""
        if sys.platform == 'win32':
            return self.venv_dir / 'Scripts' / 'pip.exe'
        return self.venv_dir / 'bin' / 'pip'
    
    def install_requirements(self):
        """安装依赖"""
        print("安装项目依赖...")
        
        pip_path = self.get_pip_path()
        
        if not self.requirements_file.exists():
            print("requirements.txt 不存在，跳过依赖安装")
            return
        
        # 升级pip
        subprocess.run([str(pip_path), 'install', '--upgrade', 'pip'], check=True)
        
        # 安装依赖
        subprocess.run([str(pip_path), 'install', '-r', str(self.requirements_file)], check=True)
        print("依赖安装完成")
    
    def install_dev_tools(self):
        """安装开发工具"""
        print("安装开发工具...")
        
        pip_path = self.get_pip_path()
        
        dev_tools = [
            'flake8',      # 代码风格检查
            'black',       # 代码格式化
            'isort',       # 导入排序
            'pytest',      # 测试框架
            'pytest-cov',  # 测试覆盖率
            'mypy',        # 类型检查
        ]
        
        subprocess.run([str(pip_path), 'install'] + dev_tools, check=True)
        print("开发工具安装完成")
    
    def create_config_files(self):
        """创建配置文件"""
        print("创建配置文件...")
        
        # flake8配置
        flake8_config = self.project_dir / '.flake8'
        if not flake8_config.exists():
            flake8_config.write_text("""[flake8]
max-line-length = 88
extend-ignore = E203
exclude = .git,__pycache__,build,dist,venv
""")
        
        # black配置
        pyproject_toml = self.project_dir / 'pyproject.toml'
        if not pyproject_toml.exists():
            pyproject_toml.write_text("""[tool.black]
line-length = 88
target-version = ['py38']
include = '\\.pyi?$'
exclude = '''
/(
    \\.git
  | \\.hg
  | \\.mypy_cache
  | \\.tox
  | \\.venv
  | _build
  | buck-out
  | build
  | dist
)/
'''
""")
        
        # isort配置
        isort_config = self.project_dir / '.isort.cfg'
        if not isort_config.exists():
            isort_config.write_text("""[isort]
profile = black
line_length = 88
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true
""")
        
        print("配置文件创建完成")
    
    def create_gitignore(self):
        """创建.gitignore文件"""
        print("创建.gitignore文件...")
        
        gitignore = self.project_dir / '.gitignore'
        if not gitignore.exists():
            gitignore.write_text("""# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# PyInstaller
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/

# Translations
*.mo
*.pot

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
""")
        
        print(".gitignore创建完成")
    
    def setup(self):
        """执行完整配置"""
        print("=" * 50)
        print("开始配置开发环境")
        print("=" * 50)
        
        self.create_virtualenv()
        self.install_requirements()
        self.install_dev_tools()
        self.create_config_files()
        self.create_gitignore()
        
        print("\n" + "=" * 50)
        print("开发环境配置完成！")
        print("=" * 50)
        print(f"\n项目目录: {self.project_dir}")
        print(f"虚拟环境: {self.venv_dir}")
        print("\n激活虚拟环境:")
        if sys.platform == 'win32':
            print(f"  {self.venv_dir}\\Scripts\\activate")
        else:
            print(f"  source {self.venv_dir}/bin/activate")

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Python开发环境配置工具')
    parser.add_argument('project_dir', nargs='?', default='.', help='项目目录')
    
    args = parser.parse_args()
    
    setup = DevEnvironmentSetup(args.project_dir)
    setup.setup()

if __name__ == "__main__":
    main()
```

### 案例2：代码格式化工具

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
代码格式化工具
功能：自动格式化Python代码
"""

import os
import subprocess
import sys
from pathlib import Path

class CodeFormatter:
    """代码格式化器"""
    
    def __init__(self, project_dir='.'):
        self.project_dir = Path(project_dir).resolve()
    
    def run_command(self, cmd, description):
        """执行命令"""
        print(f"\n{description}...")
        print(f"执行命令: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_dir,
                capture_output=True,
                text=True
            )
            
            if result.stdout:
                print(result.stdout)
            if result.stderr:
                print(result.stderr)
            
            return result.returncode == 0
        except FileNotFoundError:
            print(f"错误：找不到命令 '{cmd[0]}'，请先安装")
            return False
    
    def format_with_black(self, check_only=False):
        """使用black格式化"""
        cmd = ['black']
        if check_only:
            cmd.append('--check')
        cmd.extend(['--line-length', '88', '.'])
        
        return self.run_command(cmd, "使用black格式化代码")
    
    def sort_imports(self, check_only=False):
        """使用isort排序导入"""
        cmd = ['isort']
        if check_only:
            cmd.append('--check-only')
        cmd.extend(['--profile', 'black', '.'])
        
        return self.run_command(cmd, "使用isort排序导入")
    
    def check_style(self):
        """使用flake8检查代码风格"""
        cmd = ['flake8', '--max-line-length', '88', '.']
        return self.run_command(cmd, "使用flake8检查代码风格")
    
    def check_types(self):
        """使用mypy检查类型"""
        cmd = ['mypy', '--ignore-missing-imports', '.']
        return self.run_command(cmd, "使用mypy检查类型")
    
    def run_tests(self):
        """运行测试"""
        cmd = ['pytest', '-v', '--cov=.', '--cov-report=term-missing']
        return self.run_command(cmd, "运行测试")
    
    def format_all(self, check_only=False):
        """执行所有格式化操作"""
        print("=" * 50)
        print("开始代码格式化和检查")
        print("=" * 50)
        
        results = []
        results.append(("导入排序", self.sort_imports(check_only)))
        results.append(("代码格式化", self.format_with_black(check_only)))
        results.append(("代码风格检查", self.check_style()))
        
        print("\n" + "=" * 50)
        print("执行结果汇总")
        print("=" * 50)
        
        for name, success in results:
            status = "✓ 通过" if success else "✗ 失败"
            print(f"{name}: {status}")
        
        return all(success for _, success in results)

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Python代码格式化工具')
    parser.add_argument('project_dir', nargs='?', default='.', help='项目目录')
    parser.add_argument('--check', action='store_true', help='仅检查，不修改')
    parser.add_argument('--black', action='store_true', help='仅运行black')
    parser.add_argument('--isort', action='store_true', help='仅运行isort')
    parser.add_argument('--flake8', action='store_true', help='仅运行flake8')
    parser.add_argument('--mypy', action='store_true', help='仅运行mypy')
    parser.add_argument('--test', action='store_true', help='运行测试')
    
    args = parser.parse_args()
    
    formatter = CodeFormatter(args.project_dir)
    
    if args.black:
        formatter.format_with_black(args.check)
    elif args.isort:
        formatter.sort_imports(args.check)
    elif args.flake8:
        formatter.check_style()
    elif args.mypy:
        formatter.check_types()
    elif args.test:
        formatter.run_tests()
    else:
        formatter.format_all(args.check)

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：虚拟环境管理
1. 创建一个虚拟环境管理脚本
2. 支持创建、激活、删除环境
3. 支持环境克隆和导出

### 练习2：依赖管理
1. 实现依赖版本锁定
2. 支持依赖更新和回滚
3. 检测依赖冲突

### 练习3：代码规范
1. 配置代码规范检查工具
2. 集成到Git提交流程
3. 生成规范检查报告

## 常见问题

### Q1: 如何选择虚拟环境工具？
A: 新项目首选 uv（2026 事实标准，一个工具覆盖环境+版本+依赖管理）；需要零外部依赖时用内置 venv；重度项目管理需求可考虑 Poetry。

### Q2: 如何处理依赖冲突？
A: 使用pip check检查冲突，或使用Poetry自动解决。

### Q3: 如何在团队中统一代码风格？
A: 使用pre-commit钩子自动检查和格式化。

## 下一步学习

完成今天的学习后，建议你：
1. 熟悉虚拟环境和依赖管理
2. 配置代码规范检查工具
3. 尝试自动化开发环境配置
4. 准备进入Day 8的学习：测试自动化

明天我们将学习如何编写自动化测试。