# Day 6: 日志记录与监控

## 学习目标

完成今天的学习后，你将能够：
- 掌握Python日志模块的使用
- 配置专业的日志系统
- 实现日志轮转和归档
- 构建实时监控和告警系统

## 技术原理

### Python日志模块

Python的logging模块提供了灵活的日志系统：

```python
import logging

# 基本配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("这是一条信息日志")
logger.error("这是一条错误日志")
```

### 日志级别

| 级别 | 数值 | 说明 |
|------|------|------|
| DEBUG | 10 | 详细调试信息 |
| INFO | 20 | 一般信息 |
| WARNING | 30 | 警告信息 |
| ERROR | 40 | 错误信息 |
| CRITICAL | 50 | 严重错误 |

### 日志处理器

- **StreamHandler**：输出到控制台
- **FileHandler**：输出到文件
- **RotatingFileHandler**：轮转日志文件
- **TimedRotatingFileHandler**：按时间轮转
- **SMTPHandler**：发送邮件告警
- **SysLogHandler**：发送到系统日志

## 案例：企业级日志系统

创建一个企业级日志系统，实现：
1. 多级别日志记录
2. 日志格式化和美化
3. 日志轮转和归档
4. 异步日志处理
5. 日志分析和统计

## 应用场景

### 1. 应用监控
- 错误追踪
- 性能监控
- 用户行为分析

### 2. 系统运维
- 服务器监控
- 服务状态检查
- 资源使用统计

### 3. 安全审计
- 访问日志
- 操作审计
- 异常检测

### 4. 业务分析
- 业务指标统计
- 用户行为分析
- 趋势预测

## 代码案例

### 案例1：高级日志配置

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高级日志配置
功能：实现企业级日志配置
"""

import os
import logging
import logging.handlers
from datetime import datetime

class LogManager:
    """日志管理器"""
    
    def __init__(self, log_dir='logs', app_name='app'):
        self.log_dir = log_dir
        self.app_name = app_name
        self.loggers = {}
        
        # 创建日志目录
        os.makedirs(log_dir, exist_ok=True)
    
    def get_logger(self, name, level=logging.DEBUG):
        """获取日志记录器"""
        if name in self.loggers:
            return self.loggers[name]
        
        logger = logging.getLogger(name)
        logger.setLevel(level)
        
        # 避免重复添加处理器
        if not logger.handlers:
            # 控制台处理器
            console_handler = logging.StreamHandler()
            console_handler.setLevel(logging.INFO)
            console_format = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            console_handler.setFormatter(console_format)
            
            # 文件处理器（按大小轮转）
            file_handler = logging.handlers.RotatingFileHandler(
                os.path.join(self.log_dir, f'{self.app_name}.log'),
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5,
                encoding='utf-8'
            )
            file_handler.setLevel(logging.DEBUG)
            file_format = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            file_handler.setFormatter(file_format)
            
            # 错误日志处理器
            error_handler = logging.handlers.RotatingFileHandler(
                os.path.join(self.log_dir, f'{self.app_name}_error.log'),
                maxBytes=10*1024*1024,
                backupCount=5,
                encoding='utf-8'
            )
            error_handler.setLevel(logging.ERROR)
            error_handler.setFormatter(file_format)
            
            # 按时间轮转的处理器
            time_handler = logging.handlers.TimedRotatingFileHandler(
                os.path.join(self.log_dir, f'{self.app_name}_daily.log'),
                when='midnight',
                interval=1,
                backupCount=30,
                encoding='utf-8'
            )
            time_handler.setLevel(logging.INFO)
            time_handler.setFormatter(file_format)
            
            # 添加处理器
            logger.addHandler(console_handler)
            logger.addHandler(file_handler)
            logger.addHandler(error_handler)
            logger.addHandler(time_handler)
        
        self.loggers[name] = logger
        return logger

def main():
    """主函数"""
    # 创建日志管理器
    manager = LogManager(log_dir='logs', app_name='myapp')
    
    # 获取日志记录器
    logger = manager.get_logger('main')
    
    # 测试不同级别的日志
    logger.debug("这是调试信息")
    logger.info("这是一般信息")
    logger.warning("这是警告信息")
    logger.error("这是错误信息")
    logger.critical("这是严重错误信息")
    
    # 测试异常日志
    try:
        result = 1 / 0
    except Exception as e:
        logger.exception("发生异常:")
    
    print("日志已写入到 logs 目录")

if __name__ == "__main__":
    main()
```

### 案例2：结构化日志

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
结构化日志
功能：实现JSON格式的结构化日志
"""

import json
import logging
from datetime import datetime

class StructuredLogger:
    """结构化日志记录器"""
    
    def __init__(self, name, log_file=None):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # 创建处理器
        if log_file:
            handler = logging.FileHandler(log_file, encoding='utf-8')
        else:
            handler = logging.StreamHandler()
        
        # 设置格式化器
        formatter = logging.Formatter('%(message)s')
        handler.setFormatter(formatter)
        
        self.logger.addHandler(handler)
    
    def log(self, level, message, **kwargs):
        """记录结构化日志"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': level,
            'message': message,
            **kwargs
        }
        
        self.logger.log(
            getattr(logging, level),
            json.dumps(log_entry, ensure_ascii=False)
        )
    
    def info(self, message, **kwargs):
        """信息日志"""
        self.log('INFO', message, **kwargs)
    
    def error(self, message, **kwargs):
        """错误日志"""
        self.log('ERROR', message, **kwargs)
    
    def warning(self, message, **kwargs):
        """警告日志"""
        self.log('WARNING', message, **kwargs)
    
    def debug(self, message, **kwargs):
        """调试日志"""
        self.log('DEBUG', message, **kwargs)

def main():
    """主函数"""
    logger = StructuredLogger('myapp', 'structured.log')
    
    # 记录不同类型的日志
    logger.info("用户登录", user_id=123, ip='192.168.1.1')
    logger.error("数据库连接失败", host='localhost', port=3306)
    logger.warning("内存使用率过高", usage=85.5)
    
    print("结构化日志已写入到 structured.log")

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：日志配置
1. 配置一个支持多级别的日志系统
2. 实现日志文件轮转
3. 添加邮件告警功能

### 练习2：日志分析
1. 编写日志分析脚本
2. 统计错误类型和频率
3. 生成分析报告

### 练习3：监控系统
1. 实现简单的系统监控
2. 监控CPU、内存、磁盘使用率
3. 超过阈值时发送告警

## 常见问题

### Q1: 如何避免日志重复？
A: 使用propagate=False避免向上传播。

### Q2: 如何处理日志文件过大？
A: 使用RotatingFileHandler或TimedRotatingFileHandler。

### Q3: 如何在多进程环境中记录日志？
A: 使用QueueHandler或使用专门的日志服务。

## 下一步学习

完成今天的学习后，建议你：
1. 熟悉logging模块的各种用法
2. 设计适合自己项目的日志方案
3. 实现基本的监控和告警
4. 准备进入Day 7的学习：开发环境自动化

明天我们将学习如何自动化配置开发环境。