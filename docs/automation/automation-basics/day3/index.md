# Day 3: 系统任务自动化

## 学习目标

完成今天的学习后，你将能够：
- 使用Python执行系统命令
- 管理系统进程
- 实现定时任务
- 获取系统信息

## 技术原理

### 系统命令执行

Python提供了多种执行系统命令的方式：
- **os.system()**：简单命令执行
- **subprocess模块**：高级子进程管理
- **os.popen()**：获取命令输出

### subprocess模块

```python
import subprocess

# 执行命令并获取输出
result = subprocess.run(['ls', '-l'], capture_output=True, text=True)
print(result.stdout)

# 使用shell执行
result = subprocess.run('ls -l', shell=True, capture_output=True, text=True)
```

### 定时任务

#### 1. 使用schedule库

```python
import schedule
import time

def job():
    print("执行任务")

schedule.every(1).hours.do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
```

#### 2. 使用系统cron

```bash
# 编辑crontab
crontab -e

# 添加定时任务
0 * * * * /usr/bin/python3 /path/to/script.py
```

## 案例：系统监控脚本

创建一个系统监控脚本，实现：
1. 监控CPU、内存、磁盘使用率
2. 检查关键进程状态
3. 发送告警通知
4. 记录监控日志

## 应用场景

### 1. 服务器管理
- 服务启停管理
- 配置更新
- 性能监控

### 2. 数据库管理
- 数据备份
- 数据清理
- 性能优化

### 3. 网络管理
- 网络测试
- 连接监控
- 流量统计

### 4. 应用部署
- 代码更新
- 服务重启
- 环境配置

## 代码案例

### 案例1：进程管理脚本

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
进程管理脚本
功能：查看、启动、停止系统进程
"""

import os
import sys
import signal
import subprocess
import psutil

def list_processes(filter_name=None):
    """列出进程"""
    print(f"{'PID':<10}{'名称':<20}{'状态':<10}{'CPU%':<10}{'内存%':<10}")
    print("-" * 60)
    
    for proc in psutil.process_iter(['pid', 'name', 'status', 'cpu_percent', 'memory_percent']):
        try:
            pinfo = proc.info
            
            # 过滤进程
            if filter_name and filter_name.lower() not in pinfo['name'].lower():
                continue
            
            print(f"{pinfo['pid']:<10}{pinfo['name']:<20}{pinfo['status']:<10}"
                  f"{pinfo['cpu_percent']:<10.1f}{pinfo['memory_percent']:<10.1f}")
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

def start_process(command):
    """启动进程"""
    try:
        process = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print(f"进程已启动，PID: {process.pid}")
        return process.pid
    except Exception as e:
        print(f"启动失败: {e}")
        return None

def stop_process(pid):
    """停止进程"""
    try:
        process = psutil.Process(pid)
        process.terminate()
        print(f"进程 {pid} 已停止")
        return True
    except psutil.NoSuchProcess:
        print(f"进程 {pid} 不存在")
        return False
    except psutil.AccessDenied:
        print(f"无权限停止进程 {pid}")
        return False

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法:")
        print("  python process.py list [过滤名称]")
        print("  python process.py start <命令>")
        print("  python process.py stop <PID>")
        return
    
    action = sys.argv[1]
    
    if action == 'list':
        filter_name = sys.argv[2] if len(sys.argv) > 2 else None
        list_processes(filter_name)
    
    elif action == 'start':
        if len(sys.argv) < 3:
            print("错误：请提供要执行的命令")
            return
        command = ' '.join(sys.argv[2:])
        start_process(command)
    
    elif action == 'stop':
        if len(sys.argv) < 3:
            print("错误：请提供进程PID")
            return
        try:
            pid = int(sys.argv[2])
            stop_process(pid)
        except ValueError:
            print("错误：PID必须是数字")
    
    else:
        print(f"未知操作: {action}")

if __name__ == "__main__":
    main()
```

### 案例2：定时任务管理

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
定时任务管理脚本
功能：创建和管理定时任务
"""

import time
import schedule
from datetime import datetime

class TaskScheduler:
    """任务调度器"""
    
    def __init__(self):
        self.tasks = {}
    
    def add_task(self, name, job, interval, unit='minutes'):
        """
        添加定时任务
        
        Args:
            name: 任务名称
            job: 任务函数
            interval: 执行间隔
            unit: 时间单位（seconds, minutes, hours）
        """
        self.tasks[name] = {
            'job': job,
            'interval': interval,
            'unit': unit,
            'last_run': None,
            'run_count': 0
        }
        
        # 根据单位设置调度
        if unit == 'seconds':
            schedule.every(interval).seconds.do(self._run_task, name)
        elif unit == 'minutes':
            schedule.every(interval).minutes.do(self._run_task, name)
        elif unit == 'hours':
            schedule.every(interval).hours.do(self._run_task, name)
        
        print(f"已添加任务: {name} (每{interval}{unit})")
    
    def _run_task(self, name):
        """执行任务"""
        task = self.tasks[name]
        print(f"\n[{datetime.now()}] 执行任务: {name}")
        
        try:
            task['job']()
            task['last_run'] = datetime.now()
            task['run_count'] += 1
            print(f"任务 {name} 执行成功")
        except Exception as e:
            print(f"任务 {name} 执行失败: {e}")
    
    def run(self):
        """运行调度器"""
        print("调度器已启动，按 Ctrl+C 停止")
        print("-" * 50)
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n调度器已停止")

# 示例任务
def backup_task():
    """备份任务"""
    print("执行数据备份...")

def cleanup_task():
    """清理任务"""
    print("执行临时文件清理...")

def report_task():
    """报告任务"""
    print("生成系统报告...")

def main():
    """主函数"""
    scheduler = TaskScheduler()
    
    # 添加任务
    scheduler.add_task("数据备份", backup_task, 30, 'minutes')
    scheduler.add_task("临时文件清理", cleanup_task, 1, 'hours')
    scheduler.add_task("系统报告", report_task, 24, 'hours')
    
    # 运行调度器
    scheduler.run()

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：系统命令执行
1. 编写脚本，执行ping命令测试网络连通性
2. 支持批量测试多个主机
3. 将结果保存到文件

### 练习2：进程监控
1. 创建进程监控脚本
2. 监控指定进程的CPU和内存使用
3. 超过阈值时发送告警

### 练习3：定时备份
1. 实现文件定时备份功能
2. 支持增量备份和全量备份
3. 自动清理过期备份

## 常见问题

### Q1: 如何执行需要管理员权限的命令？
A: 使用sudo并确保脚本有权限：
```python
result = subprocess.run(['sudo', 'command'], capture_output=True)
```

### Q2: 如何避免子进程阻塞？
A: 使用Popen并设置超时：
```python
process = subprocess.Popen(['command'])
try:
    process.wait(timeout=30)
except subprocess.TimeoutExpired:
    process.kill()
```

### Q3: 如何在Windows上执行Linux命令？
A: 使用WSL或Cygwin，或者使用Python的跨平台模块。

## 下一步学习

完成今天的学习后，建议你：
1. 熟悉subprocess模块的使用
2. 了解定时任务的实现方式
3. 尝试编写系统监控脚本
4. 准备进入Day 4的学习：参数处理与配置管理

明天我们将学习如何处理命令行参数和管理配置文件。