# Day 2: 文件处理自动化

> **版本基线**：本文基于 Python 3.12+，更新于 2026-09。新项目推荐以 pathlib 为主进行路径操作（见下文专节）。

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

::: tip
`os.walk` 是老代码中非常常见的写法，本文的案例也会沿用；但**新项目建议优先使用 pathlib**（见下一小节），代码更简洁、更不易出错。
:::

#### 3. 路径操作

```python
from pathlib import Path
p = Path('directory')
p.mkdir(parents=True, exist_ok=True)
```

### pathlib 现代路径操作

`pathlib.Path` 是面向对象的路径 API（Python 3.12+ 的首选写法），用 `/` 运算符拼接路径，读写、遍历、建目录一气呵成。

**常用操作对照表（os/os.path → pathlib）：**

| 任务 | os / os.path 写法 | pathlib 写法 |
|------|-------------------|--------------|
| 拼接路径 | `os.path.join(root, file)` | `root / file` |
| 递归遍历目录 | `os.walk(dir)` | `Path(dir).rglob("*")` |
| 列出目录内容 | `os.listdir(dir)` | `Path(dir).iterdir()` |
| 按模式匹配文件 | `glob.glob("*.csv")` | `Path(".").glob("*.csv")` |
| 创建目录 | `os.makedirs(p, exist_ok=True)` | `Path(p).mkdir(parents=True, exist_ok=True)` |
| 读 / 写文本 | `open()` + `f.read()/f.write()` | `Path.read_text() / write_text()` |
| 取扩展名 / 改名 | `os.path.splitext(f)` | `Path(f).suffix / with_suffix()` |
| 判断是否存在 | `os.path.exists(p)` | `Path(p).exists()` |
| 取绝对路径 | `os.path.abspath(p)` | `Path(p).resolve()` |

**基础用法示例：**

```python
from pathlib import Path

# 创建目录（含父级，已存在不报错）
config = Path("config/app.yaml")
config.parent.mkdir(parents=True, exist_ok=True)

# 读写文件：一行搞定，无需手动 open/close
config.write_text("name: demo\n", encoding="utf-8")
text = config.read_text(encoding="utf-8")

# 单层匹配：当前目录所有 csv
for csv_file in Path("data").glob("*.csv"):
    print(csv_file.name, csv_file.stat().st_size)

# 递归匹配：src 下所有 py 文件（等价于 os.walk 的常见用途）
for py_file in Path("src").rglob("*.py"):
    print(py_file)
```

> 与 `os.walk` 相比，`rglob("*")` 直接产出 `Path` 对象，不用再手工 `os.path.join(root, file)`；配合 `file_path.suffix`、`file_path.stat()` 等属性，批量处理代码量能减少一半左右。

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

### 案例3：pathlib 版批量重命名（推荐写法）

前面案例1（批量重命名）的核心逻辑用 pathlib 重写如下——对比可见 `os.walk + os.path.join + os.rename` 被压缩为 `rglob + with_name + rename`：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pathlib 版批量重命名
功能：递归重命名目录下匹配正则的文件（案例1 的 pathlib 版本）
"""

import re
from pathlib import Path

def rename_files(directory, pattern, replacement, dry_run=False):
    """批量重命名文件（递归），pathlib 写法"""
    renamed_count = 0

    # rglob("*") 递归遍历，直接得到 Path 对象，无需 os.walk + os.path.join
    for file_path in Path(directory).rglob("*"):
        if not file_path.is_file():
            continue
        if re.search(pattern, file_path.name):
            # with_name：只替换文件名，目录部分保持不变
            new_path = file_path.with_name(re.sub(pattern, replacement, file_path.name))
            if dry_run:
                print(f"[试运行] {file_path.name} -> {new_path.name}")
            else:
                try:
                    file_path.rename(new_path)
                    print(f"[重命名] {file_path.name} -> {new_path.name}")
                    renamed_count += 1
                except OSError as e:
                    print(f"[错误] 无法重命名 {file_path.name}: {e}")

    return renamed_count

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("用法: python rename_pathlib.py <目录> <匹配模式> [替换文本]")
        sys.exit(1)

    count = rename_files(sys.argv[1], sys.argv[2],
                         sys.argv[3] if len(sys.argv) > 3 else '', dry_run=True)
    print(f"试运行完成，将重命名 {count} 个文件（去掉 dry_run=True 正式执行）")
```

::: tip
老项目里大量 `os.path` 代码可以逐步迁移到 pathlib：两者可以混用（`str(path_obj)` 可随时转回字符串路径），迁移成本很低。
:::

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