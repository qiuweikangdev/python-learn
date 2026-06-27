# Day 4: 参数处理与配置管理

## 学习目标

完成今天的学习后，你将能够：
- 使用argparse处理命令行参数
- 管理配置文件（JSON、YAML、INI）
- 使用环境变量
- 实现配置热更新

## 技术原理

### 命令行参数处理

Python提供了多种参数处理方式：
- **sys.argv**：原始参数列表
- **argparse模块**：高级参数解析
- **click库**：第三方参数处理库

### argparse模块

```python
import argparse

parser = argparse.ArgumentParser(description='示例程序')
parser.add_argument('input', help='输入文件')
parser.add_argument('-o', '--output', help='输出文件')
parser.add_argument('-v', '--verbose', action='store_true', help='详细输出')

args = parser.parse_args()
print(f"输入: {args.input}")
print(f"输出: {args.output}")
```

### 配置文件格式

#### 1. JSON格式

```json
{
    "database": {
        "host": "localhost",
        "port": 3306,
        "user": "root",
        "password": "password"
    },
    "debug": true
}
```

#### 2. YAML格式

```yaml
database:
  host: localhost
  port: 3306
  user: root
  password: password
debug: true
```

#### 3. INI格式

```ini
[database]
host = localhost
port = 3306
user = root
password = password

[settings]
debug = true
```

## 案例：配置管理工具

创建一个配置管理工具，实现：
1. 支持多种配置格式
2. 配置读取和修改
3. 配置验证
4. 配置热更新

## 应用场景

### 1. 应用配置
- 数据库连接配置
- 服务端口配置
- 日志级别配置

### 2. 环境管理
- 开发环境配置
- 测试环境配置
- 生产环境配置

### 3. 部署配置
- 服务器地址配置
- 部署路径配置
- 版本配置

### 4. 用户配置
- 用户偏好设置
- 界面配置
- 功能开关

## 代码案例

### 案例1：高级参数解析

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高级参数解析脚本
功能：演示argparse的高级用法
"""

import argparse
import sys

def create_parser():
    """创建参数解析器"""
    parser = argparse.ArgumentParser(
        description='文件处理工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s process input.txt -o output.txt
  %(prog)s batch ./input_dir -o ./output_dir -j 4
  %(prog)s validate config.json
        """
    )
    
    # 创建子命令
    subparsers = parser.add_subparsers(dest='command', help='可用命令')
    
    # process命令
    process_parser = subparsers.add_parser('process', help='处理单个文件')
    process_parser.add_argument('input', help='输入文件路径')
    process_parser.add_argument('-o', '--output', help='输出文件路径')
    process_parser.add_argument('-f', '--format', choices=['json', 'csv', 'txt'],
                               default='txt', help='输出格式')
    process_parser.add_argument('-v', '--verbose', action='store_true',
                               help='详细输出')
    
    # batch命令
    batch_parser = subparsers.add_parser('batch', help='批量处理文件')
    batch_parser.add_argument('input_dir', help='输入目录')
    batch_parser.add_argument('-o', '--output-dir', help='输出目录')
    batch_parser.add_argument('-j', '--jobs', type=int, default=1,
                             help='并行任务数')
    batch_parser.add_argument('--include', nargs='+', help='包含的文件类型')
    batch_parser.add_argument('--exclude', nargs='+', help='排除的文件类型')
    
    # validate命令
    validate_parser = subparsers.add_parser('validate', help='验证配置文件')
    validate_parser.add_argument('config', help='配置文件路径')
    validate_parser.add_argument('--strict', action='store_true',
                                help='严格模式')
    
    return parser

def process_file(args):
    """处理单个文件"""
    print(f"处理文件: {args.input}")
    if args.output:
        print(f"输出到: {args.output}")
    print(f"输出格式: {args.format}")
    if args.verbose:
        print("详细模式已启用")

def batch_process(args):
    """批量处理"""
    print(f"输入目录: {args.input_dir}")
    if args.output_dir:
        print(f"输出目录: {args.output_dir}")
    print(f"并行任务数: {args.jobs}")
    if args.include:
        print(f"包含类型: {args.include}")
    if args.exclude:
        print(f"排除类型: {args.exclude}")

def validate_config(args):
    """验证配置"""
    print(f"验证配置文件: {args.config}")
    if args.strict:
        print("严格模式已启用")

def main():
    """主函数"""
    parser = create_parser()
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # 根据命令执行相应函数
    commands = {
        'process': process_file,
        'batch': batch_process,
        'validate': validate_config,
    }
    
    commands[args.command](args)

if __name__ == "__main__":
    main()
```

### 案例2：配置文件管理

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置文件管理脚本
功能：支持多种格式的配置文件管理
"""

import json
import os
import configparser
from pathlib import Path

class ConfigManager:
    """配置管理器"""
    
    def __init__(self, config_path=None):
        self.config_path = config_path
        self.config = {}
        
        if config_path:
            self.load(config_path)
    
    def load(self, config_path):
        """加载配置文件"""
        self.config_path = config_path
        path = Path(config_path)
        
        if not path.exists():
            raise FileNotFoundError(f"配置文件不存在: {config_path}")
        
        suffix = path.suffix.lower()
        
        if suffix == '.json':
            self._load_json(config_path)
        elif suffix in ['.yml', '.yaml']:
            self._load_yaml(config_path)
        elif suffix == '.ini':
            self._load_ini(config_path)
        else:
            raise ValueError(f"不支持的配置格式: {suffix}")
    
    def _load_json(self, path):
        """加载JSON配置"""
        with open(path, 'r', encoding='utf-8') as f:
            self.config = json.load(f)
    
    def _load_yaml(self, path):
        """加载YAML配置"""
        try:
            import yaml
            with open(path, 'r', encoding='utf-8') as f:
                self.config = yaml.safe_load(f)
        except ImportError:
            raise ImportError("需要安装pyyaml库: pip install pyyaml")
    
    def _load_ini(self, path):
        """加载INI配置"""
        parser = configparser.ConfigParser()
        parser.read(path, encoding='utf-8')
        self.config = {section: dict(parser[section]) for section in parser.sections()}
    
    def get(self, key, default=None):
        """获取配置值"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key, value):
        """设置配置值"""
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value
    
    def save(self, path=None):
        """保存配置"""
        save_path = path or self.config_path
        if not save_path:
            raise ValueError("未指定保存路径")
        
        path = Path(save_path)
        suffix = path.suffix.lower()
        
        if suffix == '.json':
            self._save_json(save_path)
        elif suffix in ['.yml', '.yaml']:
            self._save_yaml(save_path)
        elif suffix == '.ini':
            self._save_ini(save_path)
        else:
            raise ValueError(f"不支持的配置格式: {suffix}")
    
    def _save_json(self, path):
        """保存JSON配置"""
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
    
    def _save_yaml(self, path):
        """保存YAML配置"""
        try:
            import yaml
            with open(path, 'w', encoding='utf-8') as f:
                yaml.dump(self.config, f, default_flow_style=False, allow_unicode=True)
        except ImportError:
            raise ImportError("需要安装pyyaml库: pip install pyyaml")
    
    def _save_ini(self, path):
        """保存INI配置"""
        parser = configparser.ConfigParser()
        for section, values in self.config.items():
            parser[section] = values
        with open(path, 'w', encoding='utf-8') as f:
            parser.write(f)
    
    def display(self):
        """显示配置"""
        print(json.dumps(self.config, indent=2, ensure_ascii=False))

def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 2:
        print("用法:")
        print("  python config.py load <配置文件>")
        print("  python config.py get <配置文件> <键>")
        print("  python config.py set <配置文件> <键> <值>")
        print("  python config.py display <配置文件>")
        return
    
    action = sys.argv[1]
    
    if action == 'load':
        if len(sys.argv) < 3:
            print("错误：请提供配置文件路径")
            return
        
        config_path = sys.argv[2]
        try:
            manager = ConfigManager(config_path)
            print(f"配置文件加载成功: {config_path}")
            manager.display()
        except Exception as e:
            print(f"加载失败: {e}")
    
    elif action == 'get':
        if len(sys.argv) < 4:
            print("错误：请提供配置文件路径和键名")
            return
        
        config_path = sys.argv[2]
        key = sys.argv[3]
        
        try:
            manager = ConfigManager(config_path)
            value = manager.get(key)
            print(f"{key} = {value}")
        except Exception as e:
            print(f"获取失败: {e}")
    
    elif action == 'set':
        if len(sys.argv) < 5:
            print("错误：请提供配置文件路径、键名和值")
            return
        
        config_path = sys.argv[2]
        key = sys.argv[3]
        value = sys.argv[4]
        
        try:
            manager = ConfigManager(config_path)
            manager.set(key, value)
            manager.save()
            print(f"配置已更新: {key} = {value}")
        except Exception as e:
            print(f"设置失败: {e}")
    
    elif action == 'display':
        if len(sys.argv) < 3:
            print("错误：请提供配置文件路径")
            return
        
        config_path = sys.argv[2]
        try:
            manager = ConfigManager(config_path)
            manager.display()
        except Exception as e:
            print(f"显示失败: {e}")
    
    else:
        print(f"未知操作: {action}")

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：参数处理
1. 创建一个文件搜索工具
2. 支持按名称、大小、日期过滤
3. 支持递归搜索和排除目录

### 练习2：配置管理
1. 实现一个应用配置管理器
2. 支持配置加密和解密
3. 支持配置版本管理

### 练习3：环境管理
1. 创建一个环境切换工具
2. 支持开发、测试、生产环境
3. 自动设置环境变量

## 常见问题

### Q1: 如何处理参数中的特殊字符？
A: 使用引号或转义：
```bash
python script.py "argument with spaces"
python script.py argument\ with\ spaces
```

### Q2: 如何在配置文件中使用环境变量？
A: 使用os.environ：
```python
import os
config = {
    'database_url': os.environ.get('DATABASE_URL', 'default_url')
}
```

### Q3: 如何保护敏感配置？
A: 使用环境变量或加密存储：
```python
import os
password = os.environ.get('DB_PASSWORD')
# 或使用加密库
```

## 下一步学习

完成今天的学习后，建议你：
1. 熟悉argparse的各种用法
2. 了解不同配置格式的特点
3. 尝试实现配置管理工具
4. 准备进入Day 5的学习：错误处理与异常管理

明天我们将学习如何处理程序中的错误和异常。