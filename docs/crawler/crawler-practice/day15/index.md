# Day 15: 综合项目实战

## 学习目标

- 掌握爬虫项目的完整开发流程
- 学会需求分析和架构设计
- 实现一个完整的爬虫项目
- 了解部署和运维知识

## 技术原理

### 15.1 项目开发流程

**完整流程：**
1. 需求分析
2. 技术选型
3. 架构设计
4. 代码实现
5. 测试验证
6. 部署上线
7. 运维监控

### 15.2 架构设计

**系统架构：**
- 爬虫层：负责数据采集
- 处理层：负责数据清洗和处理
- 存储层：负责数据存储
- 调度层：负责任务调度
- 监控层：负责系统监控

### 15.3 技术选型

**核心组件：**
- 爬虫框架：Scrapy
- 数据存储：MySQL/MongoDB
- 任务队列：Redis
- 部署工具：Docker

## 案例

### 案例1：需求分析模板

```python
"""
项目需求分析文档

1. 项目背景
   - 项目名称：电商价格监控系统
   - 项目目标：实时监控竞品价格变化
   - 目标用户：运营团队

2. 功能需求
   - 数据采集：定时爬取竞品价格
   - 数据分析：价格趋势分析
   - 预警通知：价格异常提醒
   - 数据展示：价格报表展示

3. 非功能需求
   - 性能：支持1000+商品监控
   - 可用性：7x24小时运行
   - 可扩展性：支持新增数据源
   - 安全性：数据加密存储

4. 数据需求
   - 数据源：京东、天猫、拼多多
   - 数据量：每天100万条
   - 数据格式：JSON
   - 数据保留：1年
"""
```

### 案例2：项目结构设计

```
crawler_project/
├── README.md
├── requirements.txt
├── scrapy.cfg
├── docker-compose.yml
├── config/
│   ├── __init__.py
│   ├── settings.py
│   └── logging.conf
├── crawler/
│   ├── __init__.py
│   ├── items.py
│   ├── middlewares.py
│   ├── pipelines.py
│   ├── spiders/
│   │   ├── __init__.py
│   │   ├── jd_spider.py
│   │   ├── tmall_spider.py
│   │   └── pdd_spider.py
│   └── utils/
│       ├── __init__.py
│       ├── proxy.py
│       ├── ua.py
│       └── redis.py
├── analyzer/
│   ├── __init__.py
│   ├── price_analyzer.py
│   └── report_generator.py
├── scheduler/
│   ├── __init__.py
│   └── task_scheduler.py
├── monitor/
│   ├── __init__.py
│   ├── health_check.py
│   └── alert.py
├── storage/
│   ├── __init__.py
│   ├── mysql_storage.py
│   └── mongodb_storage.py
└── tests/
    ├── __init__.py
    ├── test_spiders.py
    └── test_pipelines.py
```

## 应用场景

### 1. 电商监控
- 价格监控
- 库存监控
- 促销监控

### 2. 舆情监控
- 品牌舆情
- 行业动态
- 竞品分析

### 3. 数据聚合
- 多源数据聚合
- 数据清洗
- 数据分析

## 代码案例

### 案例3：配置管理

```python
# config/settings.py
import os
from pathlib import Path

class Config:
    """配置管理"""
    
    # 基础配置
    BASE_DIR = Path(__file__).parent.parent
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # 数据库配置
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'crawler')
    
    # Redis 配置
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    
    # 爬虫配置
    CRAWLER_CONCURRENT_REQUESTS = int(os.getenv('CRAWLER_CONCURRENT_REQUESTS', 16))
    CRAWLER_DOWNLOAD_DELAY = float(os.getenv('CRAWLER_DOWNLOAD_DELAY', 1))
    
    # 代理配置
    PROXY_ENABLED = os.getenv('PROXY_ENABLED', 'False').lower() == 'true'
    PROXY_API_URL = os.getenv('PROXY_API_URL', '')
    
    @classmethod
    def get_mysql_url(cls):
        """获取 MySQL 连接 URL"""
        return f'mysql+pymysql://{cls.MYSQL_USER}:{cls.MYSQL_PASSWORD}@{cls.MYSQL_HOST}:{cls.MYSQL_PORT}/{cls.MYSQL_DATABASE}'
    
    @classmethod
    def get_redis_url(cls):
        """获取 Redis 连接 URL"""
        return f'redis://{cls.REDIS_HOST}:{cls.REDIS_PORT}/{cls.REDIS_DB}'

# 使用示例
config = Config()
print(f'MySQL URL: {config.get_mysql_url()}')
print(f'Redis URL: {config.get_redis_url()}')
```

### 案例4：日志管理

```python
# config/logging.py
import logging
import logging.config
from datetime import datetime

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
        'detailed': {
            'format': '%(asctime)s [%(levelname)s] %(name)s:%(lineno)d: %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'standard',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'DEBUG',
            'formatter': 'detailed',
            'filename': f'logs/crawler_{datetime.now().strftime("%Y%m%d")}.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
        },
        'error_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'ERROR',
            'formatter': 'detailed',
            'filename': f'logs/error_{datetime.now().strftime("%Y%m%d")}.log',
            'maxBytes': 10485760,
            'backupCount': 5,
        },
    },
    'loggers': {
        '': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

def setup_logging():
    """配置日志"""
    import os
    os.makedirs('logs', exist_ok=True)
    logging.config.dictConfig(LOGGING_CONFIG)

# 使用示例
setup_logging()
logger = logging.getLogger(__name__)

logger.info('爬虫启动')
logger.error('发生错误', exc_info=True)
```

### 案例5：健康检查

```python
# monitor/health_check.py
import psutil
import redis
import pymysql
from datetime import datetime

class HealthChecker:
    """健康检查器"""
    
    def __init__(self, config):
        self.config = config
        self.checks = []
    
    def check_redis(self):
        """检查 Redis 连接"""
        try:
            r = redis.from_url(self.config.get_redis_url())
            r.ping()
            return {'status': 'ok', 'message': 'Redis 连接正常'}
        except Exception as e:
            return {'status': 'error', 'message': f'Redis 连接失败: {e}'}
    
    def check_mysql(self):
        """检查 MySQL 连接"""
        try:
            conn = pymysql.connect(
                host=self.config.MYSQL_HOST,
                port=self.config.MYSQL_PORT,
                user=self.config.MYSQL_USER,
                password=self.config.MYSQL_PASSWORD,
                database=self.config.MYSQL_DATABASE
            )
            conn.close()
            return {'status': 'ok', 'message': 'MySQL 连接正常'}
        except Exception as e:
            return {'status': 'error', 'message': f'MySQL 连接失败: {e}'}
    
    def check_disk(self):
        """检查磁盘空间"""
        disk = psutil.disk_usage('/')
        usage_percent = disk.percent
        
        if usage_percent > 90:
            return {'status': 'warning', 'message': f'磁盘使用率过高: {usage_percent}%'}
        elif usage_percent > 95:
            return {'status': 'error', 'message': f'磁盘空间不足: {usage_percent}%'}
        
        return {'status': 'ok', 'message': f'磁盘使用率: {usage_percent}%'}
    
    def check_memory(self):
        """检查内存使用"""
        memory = psutil.virtual_memory()
        usage_percent = memory.percent
        
        if usage_percent > 80:
            return {'status': 'warning', 'message': f'内存使用率过高: {usage_percent}%'}
        elif usage_percent > 90:
            return {'status': 'error', 'message': f'内存不足: {usage_percent}%'}
        
        return {'status': 'ok', 'message': f'内存使用率: {usage_percent}%'}
    
    def check_cpu(self):
        """检查 CPU 使用"""
        cpu_percent = psutil.cpu_percent(interval=1)
        
        if cpu_percent > 80:
            return {'status': 'warning', 'message': f'CPU 使用率过高: {cpu_percent}%'}
        
        return {'status': 'ok', 'message': f'CPU 使用率: {cpu_percent}%'}
    
    def run_all_checks(self):
        """运行所有检查"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'checks': {
                'redis': self.check_redis(),
                'mysql': self.check_mysql(),
                'disk': self.check_disk(),
                'memory': self.check_memory(),
                'cpu': self.check_cpu(),
            }
        }
        
        # 计算整体状态
        statuses = [check['status'] for check in results['checks'].values()]
        if 'error' in statuses:
            results['overall_status'] = 'error'
        elif 'warning' in statuses:
            results['overall_status'] = 'warning'
        else:
            results['overall_status'] = 'ok'
        
        return results

# 使用示例
from config.settings import Config

config = Config()
checker = HealthChecker(config)

results = checker.run_all_checks()
print(f'整体状态: {results["overall_status"]}')
for name, check in results['checks'].items():
    print(f'{name}: {check["status"]} - {check["message"]}')
```

### 案例6：告警通知

```python
# monitor/alert.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from datetime import datetime

class AlertNotifier:
    """告警通知器"""
    
    def __init__(self, config):
        self.config = config
    
    def send_email(self, subject, message, recipients):
        """发送邮件告警"""
        msg = MIMEMultipart()
        msg['From'] = self.config.EMAIL_FROM
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = subject
        
        body = f"""
        <html>
        <body>
            <h2>爬虫告警通知</h2>
            <p><strong>时间:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>告警:</strong> {subject}</p>
            <p><strong>详情:</strong></p>
            <pre>{message}</pre>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        try:
            server = smtplib.SMTP(self.config.SMTP_HOST, self.config.SMTP_PORT)
            server.starttls()
            server.login(self.config.SMTP_USER, self.config.SMTP_PASSWORD)
            server.sendmail(self.config.EMAIL_FROM, recipients, msg.as_string())
            server.quit()
            return True
        except Exception as e:
            print(f'发送邮件失败: {e}')
            return False
    
    def send_webhook(self, message, webhook_url):
        """发送 Webhook 告警"""
        payload = {
            'text': f'🚨 爬虫告警: {message}',
            'timestamp': datetime.now().isoformat(),
        }
        
        try:
            response = requests.post(webhook_url, json=payload)
            return response.status_code == 200
        except Exception as e:
            print(f'发送 Webhook 失败: {e}')
            return False
    
    def send_dingtalk(self, message, webhook_url):
        """发送钉钉告警"""
        payload = {
            'msgtype': 'text',
            'text': {
                'content': f'🚨 爬虫告警\n\n{message}'
            }
        }
        
        try:
            response = requests.post(webhook_url, json=payload)
            return response.status_code == 200
        except Exception as e:
            print(f'发送钉钉告警失败: {e}')
            return False
    
    def send_wechat(self, message, webhook_url):
        """发送企业微信告警"""
        payload = {
            'msgtype': 'text',
            'text': {
                'content': f'🚨 爬虫告警\n\n{message}'
            }
        }
        
        try:
            response = requests.post(webhook_url, json=payload)
            return response.status_code == 200
        except Exception as e:
            print(f'发送企业微信告警失败: {e}')
            return False

# 使用示例
notifier = AlertNotifier(config)

# 发送邮件
notifier.send_email(
    subject='爬虫异常',
    message='爬虫运行异常，请检查',
    recipients=['admin@example.com']
)

# 发送钉钉
notifier.send_dingtalk(
    message='爬虫运行异常',
    webhook_url='https://oapi.dingtalk.com/robot/send?access_token=xxx'
)
```

### 案例7：完整项目示例

```python
# main.py
import argparse
import logging
from config.settings import Config
from monitor.health_check import HealthChecker
from monitor.alert import AlertNotifier
from scheduler.task_scheduler import TaskScheduler

logger = logging.getLogger(__name__)

class CrawlerManager:
    """爬虫管理器"""
    
    def __init__(self):
        self.config = Config()
        self.health_checker = HealthChecker(self.config)
        self.alert_notifier = AlertNotifier(self.config)
        self.task_scheduler = TaskScheduler(self.config)
    
    def start(self):
        """启动爬虫"""
        logger.info('爬虫系统启动')
        
        # 健康检查
        health = self.health_checker.run_all_checks()
        if health['overall_status'] == 'error':
            logger.error('健康检查失败')
            self.alert_notifier.send_dingtalk(
                message='系统健康检查失败，请检查',
                webhook_url=self.config.DINGTALK_WEBHOOK
            )
            return
        
        # 启动任务调度
        self.task_scheduler.start()
    
    def stop(self):
        """停止爬虫"""
        logger.info('爬虫系统停止')
        self.task_scheduler.stop()
    
    def status(self):
        """查看状态"""
        health = self.health_checker.run_all_checks()
        stats = self.task_scheduler.get_stats()
        
        return {
            'health': health,
            'stats': stats,
        }

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='爬虫管理系统')
    parser.add_argument('command', choices=['start', 'stop', 'status', 'health'],
                       help='执行命令')
    
    args = parser.parse_args()
    
    manager = CrawlerManager()
    
    if args.command == 'start':
        manager.start()
    elif args.command == 'stop':
        manager.stop()
    elif args.command == 'status':
        status = manager.status()
        print(status)
    elif args.command == 'health':
        health = manager.health_checker.run_all_checks()
        print(health)

if __name__ == '__main__':
    main()
```

### 案例8：Docker 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  crawler:
    build: .
    container_name: crawler
    restart: always
    environment:
      - DEBUG=False
      - MYSQL_HOST=mysql
      - MYSQL_PORT=3306
      - MYSQL_USER=root
      - MYSQL_PASSWORD=password
      - MYSQL_DATABASE=crawler
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    depends_on:
      - mysql
      - redis
    networks:
      - crawler-network

  mysql:
    image: mysql:8.0
    container_name: crawler-mysql
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=crawler
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - crawler-network

  redis:
    image: redis:7-alpine
    container_name: crawler-redis
    restart: always
    ports:
      - "6379:6379"
    networks:
      - crawler-network

  scheduler:
    build: .
    container_name: crawler-scheduler
    restart: always
    command: python scheduler.py
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    networks:
      - crawler-network

volumes:
  mysql-data:

networks:
  crawler-network:
    driver: bridge
```

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 创建日志目录
RUN mkdir -p logs data

# 启动命令
CMD ["python", "main.py", "start"]
```

## 课后练习

### 练习1：完整项目实现
选择一个实际需求，实现一个完整的爬虫项目。

### 练习2：项目部署
将爬虫项目部署到服务器上。

### 练习3：性能优化
对爬虫项目进行性能优化。

## 常见问题

### Q1: 如何保证爬虫的稳定性？
A: 健康检查、错误处理、自动重试、告警通知。

### Q2: 如何扩展爬虫系统？
A: 分布式架构、微服务设计、容器化部署。

### Q3: 如何监控爬虫系统？
A: 日志监控、性能监控、业务监控、告警通知。

## 总结

恭喜你完成了 Python 爬虫开发系列课程的学习！

**你已经掌握：**
- 爬虫基础知识和 HTTP 协议
- HTML 解析和数据提取
- 反爬机制应对策略
- 动态页面爬取技术
- 多线程和异步爬虫
- 分布式爬虫架构
- 数据存储和清洗
- 爬虫中间件和管道
- 电商、社交媒体、新闻网站爬取
- API 数据抓取
- 完整项目开发流程

**继续学习建议：**
- 深入学习 Scrapy 高级特性
- 学习机器学习在爬虫中的应用
- 研究更复杂的反爬技术
- 参与开源爬虫项目
