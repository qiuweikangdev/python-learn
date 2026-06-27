# Day 1: Python脚本基础与自动化概述

## 学习目标

完成今天的学习后，你将能够：
- 理解自动化的核心概念和价值
- 掌握Python脚本编写基础
- 了解脚本执行和调试方法
- 认识自动化应用场景

## 技术原理

### 什么是自动化？

自动化是指使用技术手段减少人工干预的过程。在软件开发和IT运维中，自动化可以：
- 减少重复性工作
- 提高工作效率
- 降低人为错误
- 实现7×24小时无人值守

### Python自动化的优势

1. **简洁易学**：Python语法简洁，学习曲线平缓
2. **丰富的库**：拥有大量自动化相关的库和工具
3. **跨平台**：支持Windows、Linux、macOS
4. **社区活跃**：拥有庞大的开发者社区
5. **应用广泛**：从脚本到大型系统都能胜任

### Python脚本基础

#### 1. 脚本结构

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
脚本说明：这是一个简单的Python脚本示例
作者：Your Name
日期：2024-01-01
"""

# 导入必要的模块
import os
import sys

# 定义主函数
def main():
    """主函数"""
    print("Hello, Automation!")

# 脚本入口
if __name__ == "__main__":
    main()
```

#### 2. 常用模块

- **os**：操作系统接口
- **sys**：系统相关参数和函数
- **subprocess**：子进程管理
- **argparse**：命令行参数解析
- **logging**：日志记录

### 脚本执行方式

#### 1. 直接执行

```bash
python script.py
```

#### 2. 指定解释器

```bash
#!/usr/bin/env python3
./script.py
```

#### 3. 后台执行

```bash
nohup python script.py > output.log 2>&1 &
```

## 案例：第一个自动化脚本

创建一个简单的自动化脚本，用于：
1. 检查系统信息
2. 列出当前目录文件
3. 检查磁盘空间
4. 输出系统运行时间

## 应用场景

### 1. 系统管理
- 服务器监控
- 日志分析
- 备份管理
- 用户管理

### 2. 数据处理
- 数据清洗
- 格式转换
- 批量处理
- 数据验证

### 3. 网络运维
- 网络监控
- 配置管理
- 故障排查
- 性能优化

### 4. 开发辅助
- 代码生成
- 测试执行
- 部署脚本
- 文档生成

## 代码案例

### 案例1：系统信息检查脚本

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
系统信息检查脚本
功能：获取并显示系统基本信息
"""

import os
import sys
import platform
import psutil

def get_system_info():
    """获取系统信息"""
    info = {
        '系统': platform.system(),
        '版本': platform.version(),
        '架构': platform.machine(),
        '处理器': platform.processor(),
        'Python版本': platform.python_version(),
    }
    return info

def get_cpu_info():
    """获取CPU信息"""
    cpu_info = {
        '物理核心数': psutil.cpu_count(logical=False),
        '逻辑核心数': psutil.cpu_count(logical=True),
        'CPU使用率': psutil.cpu_percent(interval=1),
    }
    return cpu_info

def get_memory_info():
    """获取内存信息"""
    memory = psutil.virtual_memory()
    memory_info = {
        '总内存': f"{memory.total / (1024**3):.2f} GB",
        '已使用': f"{memory.used / (1024**3):.2f} GB",
        '使用率': f"{memory.percent}%",
    }
    return memory_info

def get_disk_info():
    """获取磁盘信息"""
    disk = psutil.disk_usage('/')
    disk_info = {
        '总空间': f"{disk.total / (1024**3):.2f} GB",
        '已使用': f"{disk.used / (1024**3):.2f} GB",
        '剩余空间': f"{disk.free / (1024**3):.2f} GB",
        '使用率': f"{disk.percent}%",
    }
    return disk_info

def main():
    """主函数"""
    print("=" * 50)
    print("系统信息检查报告")
    print("=" * 50)
    
    # 系统信息
    print("\n【系统信息】")
    sys_info = get_system_info()
    for key, value in sys_info.items():
        print(f"{key}: {value}")
    
    # CPU信息
    print("\n【CPU信息】")
    cpu_info = get_cpu_info()
    for key, value in cpu_info.items():
        print(f"{key}: {value}")
    
    # 内存信息
    print("\n【内存信息】")
    memory_info = get_memory_info()
    for key, value in memory_info.items():
        print(f"{key}: {value}")
    
    # 磁盘信息
    print("\n【磁盘信息】")
    disk_info = get_disk_info()
    for key, value in disk_info.items():
        print(f"{key}: {value}")
    
    print("\n" + "=" * 50)
    print("检查完成！")
    print("=" * 50)

if __name__ == "__main__":
    main()
```

### 案例2：目录文件统计脚本

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
目录文件统计脚本
功能：统计指定目录下的文件信息
"""

import os
from collections import defaultdict

def count_files(directory):
    """统计目录下的文件"""
    stats = {
        'total_files': 0,
        'total_dirs': 0,
        'total_size': 0,
        'file_types': defaultdict(int),
    }
    
    for root, dirs, files in os.walk(directory):
        # 统计目录数
        stats['total_dirs'] += len(dirs)
        
        # 统计文件
        for file in files:
            stats['total_files'] += 1
            
            # 获取文件扩展名
            _, ext = os.path.splitext(file)
            if ext:
                stats['file_types'][ext] += 1
            else:
                stats['file_types']['无扩展名'] += 1
            
            # 获取文件大小
            file_path = os.path.join(root, file)
            try:
                size = os.path.getsize(file_path)
                stats['total_size'] += size
            except OSError:
                pass
    
    return stats

def format_size(size):
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size < 1024:
            return f"{size:.2f} {unit}"
        size /= 1024
    return f"{size:.2f} PB"

def main():
    """主函数"""
    import sys
    
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        directory = '.'
    
    if not os.path.isdir(directory):
        print(f"错误：'{directory}' 不是有效的目录")
        return
    
    print(f"正在统计目录：{os.path.abspath(directory)}")
    print("-" * 50)
    
    stats = count_files(directory)
    
    print(f"文件总数：{stats['total_files']}")
    print(f"目录总数：{stats['total_dirs']}")
    print(f"总大小：{format_size(stats['total_size'])}")
    
    print("\n文件类型统计：")
    for ext, count in sorted(stats['file_types'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {ext}: {count} 个")

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：环境准备
1. 确保Python 3.7+已安装
2. 安装psutil库：`pip install psutil`
3. 运行系统信息检查脚本
4. 查看输出结果

### 练习2：脚本修改
1. 修改系统信息检查脚本，添加网络信息
2. 添加磁盘分区信息
3. 将输出保存到文件

### 练习3：扩展功能
1. 创建一个脚本，统计指定目录下的代码行数
2. 支持多种编程语言（.py, .js, .java等）
3. 按文件类型分组统计

## 常见问题

### Q1: 如何让脚本在后台运行？
A: 使用nohup命令：
```bash
nohup python script.py > output.log 2>&1 &
```

### Q2: 如何设置脚本为可执行？
A: 添加执行权限：
```bash
chmod +x script.py
```

### Q3: 如何在Windows上运行Python脚本？
A: 直接使用python命令：
```cmd
python script.py
```

## 下一步学习

完成今天的学习后，建议你：
1. 熟悉Python脚本的基本结构
2. 了解常用的标准库模块
3. 尝试编写简单的自动化脚本
4. 准备进入Day 2的学习：文件处理自动化

明天我们将深入学习文件和目录的自动化处理。