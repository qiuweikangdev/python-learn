# Day 2: 文件处理自动化

## 学习目标

完成今天的学习后，你将能够：
- 掌握Python文件读写操作
- 学会目录遍历和管理
- 实现文件批量处理
- 了解文件监控和同步

## 技术原理

### 文件操作基础

Python提供了多种文件操作方式：
- **open()**：内置函数，打开文件
- **os模块**：操作系统接口
- **shutil模块**：高级文件操作
- **pathlib模块**：面向对象的路径操作

### 文件读写模式

| 模式 | 说明 |
|------|------|
| 'r' | 只读模式（默认） |
| 'w' | 写入模式，覆盖原文件 |
| 'a' | 追加模式 |
| 'x' | 创建新文件 |
| 'b' | 二进制模式 |
| 't' | 文本模式（默认） |

### 目录操作

#### 1. 创建目录

```python
import os
os.makedirs('path/to/dir', exist_ok=True)
```

#### 2. 遍历目录

```python
import os
for root, dirs, files in os.walk('directory'):
    print(root, dirs, files)
```

#### 3. 路径操作

```python
from pathlib import Path
p = Path('directory')
p.mkdir(parents=True, exist_ok=True)
```

## 案例：批量文件处理

创建一个批量文件处理脚本，实现：
1. 遍历指定目录
2. 按文件类型分类
3. 统计文件信息
4. 生成处理报告

## 应用场景

### 1. 日志管理
- 日志文件轮转
- 日志归档压缩
- 日志清理

### 2. 数据处理
- CSV文件处理
- JSON数据转换
- 文本文件分析

### 3. 文件整理
- 文件分类整理
- 重复文件查找
- 文件重命名

### 4. 备份管理
- 增量备份
- 差异备份
- 备份验证

## 代码案例

### 案例1：文件批量重命名

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件批量重命名脚本
功能：批量重命名指定目录下的文件
"""

import os
import re
from pathlib import Path

def rename_files(directory, pattern, replacement, dry_run=False):
    """
    批量重命名文件
    
    Args:
        directory: 目标目录
        pattern: 匹配模式（正则表达式）
        replacement: 替换文本
        dry_run: 是否为试运行
    """
    renamed_count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if re.search(pattern, file):
                new_name = re.sub(pattern, replacement, file)
                old_path = os.path.join(root, file)
                new_path = os.path.join(root, new_name)
                
                if dry_run:
                    print(f"[试运行] {file} -> {new_name}")
                else:
                    try:
                        os.rename(old_path, new_path)
                        print(f"[重命名] {file} -> {new_name}")
                        renamed_count += 1
                    except OSError as e:
                        print(f"[错误] 无法重命名 {file}: {e}")
    
    return renamed_count

def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 3:
        print("用法: python rename.py <目录> <匹配模式> [替换文本]")
        print("示例: python rename.py ./files 'old' 'new'")
        return
    
    directory = sys.argv[1]
    pattern = sys.argv[2]
    replacement = sys.argv[3] if len(sys.argv) > 3 else ''
    
    if not os.path.isdir(directory):
        print(f"错误：'{directory}' 不是有效的目录")
        return
    
    print(f"目标目录：{directory}")
    print(f"匹配模式：{pattern}")
    print(f"替换文本：{replacement}")
    print("-" * 50)
    
    # 试运行
    print("\n【试运行预览】")
    rename_files(directory, pattern, replacement, dry_run=True)
    
    # 确认执行
    confirm = input("\n确认执行重命名？(y/n): ")
    if confirm.lower() == 'y':
        print("\n【执行重命名】")
        count = rename_files(directory, pattern, replacement)
        print(f"\n完成！共重命名 {count} 个文件")
    else:
        print("\n已取消操作")

if __name__ == "__main__":
    main()
```

### 案例2：文件分类整理

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件分类整理脚本
功能：根据文件扩展名自动分类整理文件
"""

import os
import shutil
from pathlib import Path

# 文件类型分类
FILE_CATEGORIES = {
    '图片': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
    '文档': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.md'],
    '表格': ['.xls', '.xlsx', '.csv', '.ods'],
    '演示': ['.ppt', '.pptx', '.odp'],
    '视频': ['.mp4', '.avi', '.mkv', '.mov', '.wmv'],
    '音频': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
    '压缩': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    '代码': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c'],
}

def get_category(extension):
    """根据扩展名获取分类"""
    ext = extension.lower()
    for category, extensions in FILE_CATEGORIES.items():
        if ext in extensions:
            return category
    return '其他'

def organize_files(source_dir, target_dir, dry_run=False):
    """
    整理文件
    
    Args:
        source_dir: 源目录
        target_dir: 目标目录
        dry_run: 是否为试运行
    """
    organized_count = 0
    
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            # 获取文件扩展名
            _, ext = os.path.splitext(file)
            if not ext:
                continue
            
            # 获取分类
            category = get_category(ext)
            
            # 创建分类目录
            category_dir = os.path.join(target_dir, category)
            
            # 源文件路径
            source_path = os.path.join(root, file)
            
            # 目标文件路径
            target_path = os.path.join(category_dir, file)
            
            # 处理文件名冲突
            if os.path.exists(target_path):
                name, ext = os.path.splitext(file)
                counter = 1
                while os.path.exists(target_path):
                    new_name = f"{name}_{counter}{ext}"
                    target_path = os.path.join(category_dir, new_name)
                    counter += 1
            
            if dry_run:
                print(f"[试运行] {file} -> {category}/")
            else:
                try:
                    os.makedirs(category_dir, exist_ok=True)
                    shutil.move(source_path, target_path)
                    print(f"[移动] {file} -> {category}/")
                    organized_count += 1
                except OSError as e:
                    print(f"[错误] 无法移动 {file}: {e}")
    
    return organized_count

def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python organize.py <源目录> [目标目录]")
        print("示例: python organize.py ./downloads ./organized")
        return
    
    source_dir = sys.argv[1]
    target_dir = sys.argv[2] if len(sys.argv) > 2 else './organized'
    
    if not os.path.isdir(source_dir):
        print(f"错误：'{source_dir}' 不是有效的目录")
        return
    
    print(f"源目录：{source_dir}")
    print(f"目标目录：{target_dir}")
    print("-" * 50)
    
    # 试运行
    print("\n【试运行预览】")
    organize_files(source_dir, target_dir, dry_run=True)
    
    # 确认执行
    confirm = input("\n确认执行整理？(y/n): ")
    if confirm.lower() == 'y':
        print("\n【执行整理】")
        count = organize_files(source_dir, target_dir)
        print(f"\n完成！共整理 {count} 个文件")
    else:
        print("\n已取消操作")

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：基础文件操作
1. 创建一个脚本，读取文本文件并统计行数
2. 将统计结果保存到新的文件
3. 支持多种编码格式

### 练习2：批量处理
1. 编写脚本，批量转换图片格式
2. 支持jpg转png，png转jpg
3. 添加进度显示

### 练习3：文件监控
1. 使用watchdog库监控目录变化
2. 记录文件创建、修改、删除事件
3. 将监控日志保存到文件

## 常见问题

### Q1: 如何处理大文件？
A: 使用分块读取：
```python
def read_large_file(file_path, chunk_size=8192):
    with open(file_path, 'r') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk
```

### Q2: 如何处理文件编码问题？
A: 指定编码格式：
```python
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()
```

### Q3: 如何安全删除文件？
A: 先检查再删除：
```python
import os
if os.path.exists('file.txt'):
    os.remove('file.txt')
```

## 下一步学习

完成今天的学习后，建议你：
1. 熟悉Python文件操作的各种方法
2. 尝试编写文件批量处理脚本
3. 了解文件监控的实现方式
4. 准备进入Day 3的学习：系统任务自动化

明天我们将学习如何使用Python执行系统任务和管理进程。