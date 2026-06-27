# Day 11: 系统监控与告警自动化

## 学习目标

完成今天的学习后，你将能够：
- 实现系统指标收集
- 构建监控数据存储
- 配置告警规则
- 集成通知渠道

## 技术原理

### 监控指标

1. **系统指标**：CPU、内存、磁盘、网络
2. **应用指标**：请求量、响应时间、错误率
3. **业务指标**：用户数、订单量、转化率

### 监控架构

```
数据采集 → 数据存储 → 数据分析 → 告警通知
```

### 告警方式

- 邮件通知
- 短信通知
- 钉钉/企业微信
- Slack/Telegram

## 案例：完整监控系统

构建一个完整的监控系统，实现：
1. 系统指标采集
2. 数据存储和分析
3. 告警规则配置
4. 多渠道通知

## 应用场景

### 1. 服务器监控
- 资源使用监控
- 服务状态监控
- 性能监控

### 2. 应用监控
- 错误监控
- 性能监控
- 用户行为监控

### 3. 业务监控
- 业务指标监控
- 异常检测
- 趋势分析

## 代码案例

### 案例1：系统指标收集器

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
系统指标收集器
功能：收集CPU、内存、磁盘、网络等系统指标
"""

import psutil
import time
from datetime import datetime
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class SystemMetrics:
    """系统指标数据类"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_sent: int
    network_recv: int
    
    def to_dict(self) -> Dict:
        return {
            'timestamp': self.timestamp.isoformat(),
            'cpu_percent': self.cpu_percent,
            'memory_percent': self.memory_percent,
            'disk_percent': self.disk_percent,
            'network_sent': self.network_sent,
            'network_recv': self.network_recv
        }

class MetricsCollector:
    """指标收集器"""
    
    def __init__(self):
        self.history: List[SystemMetrics] = []
    
    def collect(self) -> SystemMetrics:
        """收集系统指标"""
        # CPU使用率
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # 内存使用率
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        
        # 磁盘使用率
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        
        # 网络流量
        network = psutil.net_io_counters()
        
        metrics = SystemMetrics(
            timestamp=datetime.now(),
            cpu_percent=cpu_percent,
            memory_percent=memory_percent,
            disk_percent=disk_percent,
            network_sent=network.bytes_sent,
            network_recv=network.bytes_recv
        )
        
        self.history.append(metrics)
        return metrics
    
    def collect_continuous(self, interval=5, duration=60):
        """持续收集指标"""
        print(f"开始收集指标，间隔{interval}秒，持续{duration}秒")
        
        start_time = time.time()
        
        while time.time() - start_time < duration:
            metrics = self.collect()
            print(f"[{metrics.timestamp}] CPU: {metrics.cpu_percent}% | "
                  f"内存: {metrics.memory_percent}% | "
                  f"磁盘: {metrics.disk_percent}%")
            time.sleep(interval)
        
        return self.history
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        if not self.history:
            return {}
        
        cpu_values = [m.cpu_percent for m in self.history]
        memory_values = [m.memory_percent for m in self.history]
        
        return {
            'cpu': {
                'min': min(cpu_values),
                'max': max(cpu_values),
                'avg': sum(cpu_values) / len(cpu_values)
            },
            'memory': {
                'min': min(memory_values),
                'max': max(memory_values),
                'avg': sum(memory_values) / len(memory_values)
            }
        }

def main():
    """主函数"""
    collector = MetricsCollector()
    
    # 收集指标
    metrics = collector.collect()
    print(f"当前系统状态:")
    print(f"  CPU使用率: {metrics.cpu_percent}%")
    print(f"  内存使用率: {metrics.memory_percent}%")
    print(f"  磁盘使用率: {metrics.disk_percent}%")
    
    # 持续收集
    collector.collect_continuous(interval=2, duration=10)
    
    # 统计信息
    stats = collector.get_statistics()
    print(f"\n统计信息:")
    print(f"  CPU - 最小: {stats['cpu']['min']:.1f}%, 最大: {stats['cpu']['max']:.1f}%, "
          f"平均: {stats['cpu']['avg']:.1f}%")

if __name__ == "__main__":
    main()
```

### 案例2：告警系统

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
告警系统
功能：根据规则触发告警并发送通知
"""

import json
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
from typing import Dict, List, Callable
from dataclasses import dataclass
from enum import Enum

class AlertLevel(Enum):
    """告警级别"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class Alert:
    """告警数据类"""
    timestamp: datetime
    level: AlertLevel
    title: str
    message: str
    metric: str
    value: float
    threshold: float

class AlertRule:
    """告警规则"""
    
    def __init__(self, name: str, metric: str, threshold: float,
                 level: AlertLevel, condition: str = "greater"):
        self.name = name
        self.metric = metric
        self.threshold = threshold
        self.level = level
        self.condition = condition
    
    def check(self, value: float) -> bool:
        """检查是否触发告警"""
        if self.condition == "greater":
            return value > self.threshold
        elif self.condition == "less":
            return value < self.threshold
        elif self.condition == "equal":
            return value == self.threshold
        return False

class AlertManager:
    """告警管理器"""
    
    def __init__(self):
        self.rules: List[AlertRule] = []
        self.alerts: List[Alert] = []
        self.handlers: List[Callable] = []
    
    def add_rule(self, rule: AlertRule):
        """添加告警规则"""
        self.rules.append(rule)
    
    def add_handler(self, handler: Callable):
        """添加告警处理器"""
        self.handlers.append(handler)
    
    def check_metrics(self, metrics: Dict):
        """检查指标"""
        for rule in self.rules:
            if rule.metric in metrics:
                value = metrics[rule.metric]
                if rule.check(value):
                    alert = Alert(
                        timestamp=datetime.now(),
                        level=rule.level,
                        title=f"{rule.name}触发",
                        message=f"{rule.metric}当前值{value}超过阈值{rule.threshold}",
                        metric=rule.metric,
                        value=value,
                        threshold=rule.threshold
                    )
                    self.trigger_alert(alert)
    
    def trigger_alert(self, alert: Alert):
        """触发告警"""
        self.alerts.append(alert)
        
        # 调用所有处理器
        for handler in self.handlers:
            try:
                handler(alert)
            except Exception as e:
                print(f"告警处理失败: {e}")
    
    def get_alerts(self, level: AlertLevel = None) -> List[Alert]:
        """获取告警"""
        if level:
            return [a for a in self.alerts if a.level == level]
        return self.alerts

# 告警处理器
class ConsoleAlertHandler:
    """控制台告警处理器"""
    
    def __call__(self, alert: Alert):
        print(f"\n[{alert.level.value.upper()}] {alert.title}")
        print(f"时间: {alert.timestamp}")
        print(f"消息: {alert.message}")

class EmailAlertHandler:
    """邮件告警处理器"""
    
    def __init__(self, smtp_host: str, smtp_port: int,
                 username: str, password: str, recipients: List[str]):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.recipients = recipients
    
    def __call__(self, alert: Alert):
        msg = MIMEText(f"""
告警标题: {alert.title}
告警级别: {alert.level.value}
告警时间: {alert.timestamp}
告警消息: {alert.message}
""")
        msg['Subject'] = f"[{alert.level.value.upper()}] {alert.title}"
        msg['From'] = self.username
        msg['To'] = ', '.join(self.recipients)
        
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
            print(f"告警邮件已发送")
        except Exception as e:
            print(f"邮件发送失败: {e}")

class DingTalkAlertHandler:
    """钉钉告警处理器"""
    
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
    
    def __call__(self, alert: Alert):
        import requests
        
        data = {
            "msgtype": "markdown",
            "markdown": {
                "title": alert.title,
                "text": f"""
## {alert.title}

- **级别**: {alert.level.value}
- **时间**: {alert.timestamp}
- **消息**: {alert.message}
"""
            }
        }
        
        try:
            response = requests.post(self.webhook_url, json=data)
            if response.status_code == 200:
                print(f"钉钉告警已发送")
        except Exception as e:
            print(f"钉钉告警发送失败: {e}")

def main():
    """主函数"""
    # 创建告警管理器
    manager = AlertManager()
    
    # 添加告警规则
    manager.add_rule(AlertRule(
        name="CPU使用率过高",
        metric="cpu_percent",
        threshold=80.0,
        level=AlertLevel.WARNING,
        condition="greater"
    ))
    
    manager.add_rule(AlertRule(
        name="内存使用率过高",
        metric="memory_percent",
        threshold=90.0,
        level=AlertLevel.ERROR,
        condition="greater"
    ))
    
    # 添加告警处理器
    manager.add_handler(ConsoleAlertHandler())
    
    # 模拟指标检查
    metrics = {
        'cpu_percent': 85.0,
        'memory_percent': 95.0,
        'disk_percent': 70.0
    }
    
    print("检查系统指标...")
    manager.check_metrics(metrics)
    
    # 显示告警
    alerts = manager.get_alerts()
    print(f"\n共触发 {len(alerts)} 条告警")

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：指标收集
1. 扩展指标收集器，添加更多指标
2. 实现指标数据持久化
3. 创建指标可视化界面

### 练习2：告警规则
1. 实现更复杂的告警规则
2. 支持组合条件
3. 实现告警抑制和静默

### 练习3：通知集成
1. 集成多种通知渠道
2. 实现告警升级机制
3. 创建告警统计报表

## 常见问题

### Q1: 如何避免告警风暴？
A: 实现告警抑制、合并和静默机制。

### Q2: 如何选择监控指标？
A: 根据业务需求选择关键指标，遵循USE方法。

### Q3: 如何存储监控数据？
A: 使用时序数据库如InfluxDB、Prometheus。

## 下一步学习

完成今天的学习后，建议你：
1. 构建自己的监控系统
2. 配置告警规则和通知
3. 将监控应用到实际项目
4. 准备进入Day 12的学习：日志分析自动化

明天我们将学习如何自动化分析日志数据。