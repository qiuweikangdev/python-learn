# Day 12: 日志分析自动化

## 学习目标

完成今天的学习后，你将能够：
- 实现日志收集和解析
- 构建日志聚合和统计系统
- 实现异常检测
- 创建日志可视化

## 技术原理

### 日志分析流程

```
日志收集 → 日志解析 → 数据存储 → 数据分析 → 可视化展示
```

### 日志格式

1. **结构化日志**：JSON、XML
2. **非结构化日志**：文本格式
3. **半结构化日志**：自定义格式

### 分析方法

- 模式匹配
- 统计分析
- 异常检测
- 趋势分析

## 案例：日志分析平台

构建一个日志分析平台，实现：
1. 日志收集和解析
2. 数据聚合和统计
3. 异常检测
4. 可视化展示

## 应用场景

### 1. 应用日志分析
- 错误日志分析
- 访问日志分析
- 性能日志分析

### 2. 安全日志分析
- 登录日志分析
- 访问控制分析
- 异常行为检测

### 3. 业务日志分析
- 用户行为分析
- 业务指标统计
- 趋势预测

## 代码案例

### 案例1：日志解析器

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日志解析器
功能：解析各种格式的日志文件
"""

import re
import json
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
from pathlib import Path

@dataclass
class LogEntry:
    """日志条目"""
    timestamp: datetime
    level: str
    message: str
    source: str
    metadata: Dict

class LogParser:
    """日志解析器"""
    
    # 常用日志格式正则表达式
    PATTERNS = {
        'nginx': r'(?P<ip>[\d.]+) - - \[(?P<time>[^\]]+)\] "(?P<method>\w+) (?P<url>[^\s]+) (?P<protocol>[^"]+)" (?P<status>\d+) (?P<size>\d+)',
        'apache': r'(?P<ip>[\d.]+) - - \[(?P<time>[^\]]+)\] "(?P<request>[^"]+)" (?P<status>\d+) (?P<size>\d+)',
        'python': r'(?P<time>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - (?P<name>\w+) - (?P<level>\w+) - (?P<message>.*)',
        'syslog': r'(?P<time>\w{3} \d+ \d{2}:\d{2}:\d{2}) (?P<host>\w+) (?P<program>\w+)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)',
    }
    
    def __init__(self, log_format: str = 'python'):
        self.log_format = log_format
        self.pattern = self.PATTERNS.get(log_format)
        if not self.pattern:
            raise ValueError(f"不支持的日志格式: {log_format}")
    
    def parse_line(self, line: str) -> Optional[LogEntry]:
        """解析单行日志"""
        match = re.match(self.pattern, line)
        if not match:
            return None
        
        data = match.groupdict()
        
        # 解析时间
        time_str = data.get('time', '')
        timestamp = self._parse_time(time_str)
        
        # 提取字段
        level = data.get('level', 'INFO')
        message = data.get('message', line)
        source = data.get('name', data.get('program', 'unknown'))
        
        return LogEntry(
            timestamp=timestamp,
            level=level,
            message=message,
            source=source,
            metadata=data
        )
    
    def _parse_time(self, time_str: str) -> datetime:
        """解析时间字符串"""
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%d/%b/%Y:%H:%M:%S %z',
            '%b %d %H:%M:%S',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(time_str, fmt)
            except ValueError:
                continue
        
        return datetime.now()
    
    def parse_file(self, file_path: str) -> List[LogEntry]:
        """解析日志文件"""
        entries = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    entry = self.parse_line(line)
                    if entry:
                        entries.append(entry)
        
        return entries

class JsonLogParser:
    """JSON日志解析器"""
    
    def parse_line(self, line: str) -> Optional[LogEntry]:
        """解析JSON格式日志"""
        try:
            data = json.loads(line)
            
            timestamp = datetime.fromisoformat(
                data.get('timestamp', datetime.now().isoformat())
            )
            
            return LogEntry(
                timestamp=timestamp,
                level=data.get('level', 'INFO'),
                message=data.get('message', ''),
                source=data.get('source', 'unknown'),
                metadata=data
            )
        except (json.JSONDecodeError, KeyError):
            return None
    
    def parse_file(self, file_path: str) -> List[LogEntry]:
        """解析JSON日志文件"""
        entries = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    entry = self.parse_line(line)
                    if entry:
                        entries.append(entry)
        
        return entries

def main():
    """主函数"""
    # 创建示例日志文件
    sample_logs = [
        '2024-01-15 10:30:00 - app - INFO - 用户登录成功',
        '2024-01-15 10:30:05 - app - ERROR - 数据库连接失败',
        '2024-01-15 10:30:10 - app - WARNING - 内存使用率过高',
        '2024-01-15 10:30:15 - app - INFO - 请求处理完成',
    ]
    
    # 写入示例日志
    with open('sample.log', 'w') as f:
        f.write('\n'.join(sample_logs))
    
    # 解析日志
    parser = LogParser('python')
    entries = parser.parse_file('sample.log')
    
    print(f"解析到 {len(entries)} 条日志:")
    for entry in entries:
        print(f"  [{entry.level}] {entry.timestamp} - {entry.message}")

if __name__ == "__main__":
    main()
```

### 案例2：日志分析器

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日志分析器
功能：分析日志数据，生成统计报告
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class LogEntry:
    """日志条目"""
    timestamp: datetime
    level: str
    message: str
    source: str

class LogAnalyzer:
    """日志分析器"""
    
    def __init__(self, entries: List[LogEntry]):
        self.entries = entries
    
    def count_by_level(self) -> Dict[str, int]:
        """按级别统计"""
        return Counter(entry.level for entry in self.entries)
    
    def count_by_source(self) -> Dict[str, int]:
        """按来源统计"""
        return Counter(entry.source for entry in self.entries)
    
    def count_by_hour(self) -> Dict[int, int]:
        """按小时统计"""
        return Counter(entry.timestamp.hour for entry in self.entries)
    
    def get_error_entries(self) -> List[LogEntry]:
        """获取错误日志"""
        return [e for e in self.entries if e.level in ('ERROR', 'CRITICAL')]
    
    def get_entries_in_range(self, start: datetime, end: datetime) -> List[LogEntry]:
        """获取时间范围内的日志"""
        return [
            e for e in self.entries
            if start <= e.timestamp <= end
        ]
    
    def detect_anomalies(self, threshold: float = 2.0) -> List[Dict]:
        """检测异常（基于频率）"""
        hourly_counts = self.count_by_hour()
        
        if not hourly_counts:
            return []
        
        # 计算平均值和标准差
        counts = list(hourly_counts.values())
        avg = sum(counts) / len(counts)
        variance = sum((x - avg) ** 2 for x in counts) / len(counts)
        std = variance ** 0.5
        
        anomalies = []
        for hour, count in hourly_counts.items():
            if std > 0 and abs(count - avg) / std > threshold:
                anomalies.append({
                    'hour': hour,
                    'count': count,
                    'avg': avg,
                    'deviation': abs(count - avg) / std
                })
        
        return anomalies
    
    def generate_report(self) -> str:
        """生成分析报告"""
        report = []
        report.append("=" * 50)
        report.append("日志分析报告")
        report.append("=" * 50)
        
        # 基本统计
        report.append(f"\n总日志数: {len(self.entries)}")
        
        # 按级别统计
        report.append("\n【按级别统计】")
        for level, count in self.count_by_level().most_common():
            report.append(f"  {level}: {count}")
        
        # 按来源统计
        report.append("\n【按来源统计】")
        for source, count in self.count_by_source().most_common(10):
            report.append(f"  {source}: {count}")
        
        # 按小时统计
        report.append("\n【按小时统计】")
        for hour in sorted(self.count_by_hour().keys()):
            count = self.count_by_hour()[hour]
            report.append(f"  {hour:02d}:00 - {count}条")
        
        # 错误日志
        errors = self.get_error_entries()
        report.append(f"\n【错误日志】共{len(errors)}条")
        for error in errors[:5]:  # 只显示前5条
            report.append(f"  [{error.timestamp}] {error.message}")
        
        # 异常检测
        anomalies = self.detect_anomalies()
        if anomalies:
            report.append("\n【异常检测】")
            for anomaly in anomalies:
                report.append(f"  {anomaly['hour']}:00 - "
                            f"数量{anomaly['count']}，偏离{anomaly['deviation']:.2f}倍标准差")
        
        return '\n'.join(report)

def main():
    """主函数"""
    # 创建示例数据
    entries = []
    base_time = datetime(2024, 1, 15)
    
    for i in range(100):
        hour = i % 24
        entry = LogEntry(
            timestamp=base_time + timedelta(hours=hour),
            level=['INFO', 'WARNING', 'ERROR'][i % 3],
            message=f"日志消息 {i}",
            source=['app', 'web', 'db'][i % 3]
        )
        entries.append(entry)
    
    # 分析日志
    analyzer = LogAnalyzer(entries)
    report = analyzer.generate_report()
    print(report)

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：日志解析
1. 支持更多日志格式
2. 实现自定义日志格式
3. 处理多行日志

### 练习2：日志分析
1. 实现更复杂的异常检测
2. 添加趋势分析
3. 创建分析仪表板

### 练习3：日志可视化
1. 使用matplotlib创建图表
2. 实现交互式可视化
3. 生成HTML报告

## 常见问题

### Q1: 如何处理大量日志？
A: 使用流式处理、分批处理、增量分析。

### Q2: 如何提高解析效率？
A: 使用正则表达式预编译、多进程处理。

### Q3: 如何存储分析结果？
A: 使用数据库、CSV文件或数据仓库。

## 下一步学习

完成今天的学习后，建议你：
1. 构建日志分析系统
2. 实现异常检测
3. 创建可视化报告
4. 准备进入Day 13的学习：AI自动化基础

明天我们将学习如何使用AI技术进行自动化。