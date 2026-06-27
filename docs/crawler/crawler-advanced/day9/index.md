# Day 9: 数据存储与清洗

## 学习目标

- 掌握常见数据存储方案
- 学会使用 MySQL 和 MongoDB 存储数据
- 掌握数据清洗技术
- 了解数据验证方法

## 技术原理

### 9.1 数据存储方案

**文件存储：**
- CSV: 简单表格数据
- JSON: 结构化数据
- XML: 标记语言数据

**数据库存储：**
- MySQL: 关系型数据库
- MongoDB: 文档数据库
- Redis: 缓存数据库

### 9.2 数据清洗

数据清洗是将原始数据转换为可用格式的过程：

**常见清洗任务：**
- 去除空值和无效数据
- 统一数据格式
- 处理异常值
- 数据类型转换

### 9.3 数据验证

数据验证确保数据符合预期格式：

**验证方法：**
- 类型检查
- 范围验证
- 格式验证
- 完整性检查

## 案例

### 案例1：CSV 文件存储

```python
import csv
from typing import List, Dict

class CSVStorage:
    """CSV 存储器"""
    
    def __init__(self, filename, encoding='utf-8-sig'):
        self.filename = filename
        self.encoding = encoding
    
    def save(self, data: List[Dict]):
        """保存数据"""
        if not data:
            return
        
        # 获取字段名
        fields = data[0].keys()
        
        with open(self.filename, 'w', newline='', encoding=self.encoding) as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(data)
    
    def append(self, item: Dict):
        """追加数据"""
        with open(self.filename, 'a', newline='', encoding=self.encoding) as f:
            writer = csv.DictWriter(f, fieldnames=item.keys())
            writer.writerow(item)
    
    def load(self) -> List[Dict]:
        """加载数据"""
        data = []
        with open(self.filename, 'r', encoding=self.encoding) as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
        return data

# 使用示例
storage = CSVStorage('products.csv')

# 保存数据
products = [
    {'name': '商品1', 'price': '99.00', 'stock': '100'},
    {'name': '商品2', 'price': '199.00', 'stock': '50'},
]
storage.save(products)

# 加载数据
loaded = storage.load()
print(f'加载 {len(loaded)} 条数据')
```

### 案例2：JSON 文件存储

```python
import json
from typing import List, Dict

class JSONStorage:
    """JSON 存储器"""
    
    def __init__(self, filename, encoding='utf-8'):
        self.filename = filename
        self.encoding = encoding
    
    def save(self, data):
        """保存数据"""
        with open(self.filename, 'w', encoding=self.encoding) as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def load(self):
        """加载数据"""
        with open(self.filename, 'r', encoding=self.encoding) as f:
            return json.load(f)
    
    def append(self, item):
        """追加数据"""
        try:
            data = self.load()
        except (FileNotFoundError, json.JSONDecodeError):
            data = []
        
        data.append(item)
        self.save(data)

# 使用示例
storage = JSONStorage('data.json')

# 保存数据
data = {
    'name': '爬虫项目',
    'version': '1.0',
    'items': [{'id': 1, 'name': 'item1'}]
}
storage.save(data)

# 加载数据
loaded = storage.load()
print(f'项目名: {loaded["name"]}')
```

## 应用场景

### 1. 结构化数据存储
- 商品信息
- 用户数据
- 订单数据

### 2. 非结构化数据存储
- 网页内容
- 图片文件
- 日志数据

### 3. 缓存和队列
- URL 去重
- 任务队列
- 会话管理

## 代码案例

### 案例3：MySQL 存储

```python
import pymysql
from typing import List, Dict

class MySQLStorage:
    """MySQL 存储器"""
    
    def __init__(self, host='localhost', port=3306, user='root', 
                 password='', database='crawler'):
        self.connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            charset='utf8mb4'
        )
        self.cursor = self.connection.cursor()
    
    def create_table(self, table_name, columns):
        """创建表"""
        cols = ', '.join([f'{col} {dtype}' for col, dtype in columns.items()])
        sql = f'CREATE TABLE IF NOT EXISTS {table_name} ({cols})'
        self.cursor.execute(sql)
        self.connection.commit()
    
    def insert(self, table_name, data: Dict):
        """插入数据"""
        fields = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        sql = f'INSERT INTO {table_name} ({fields}) VALUES ({placeholders})'
        
        self.cursor.execute(sql, list(data.values()))
        self.connection.commit()
        
        return self.cursor.lastrowid
    
    def insert_many(self, table_name, data_list: List[Dict]):
        """批量插入"""
        if not data_list:
            return
        
        fields = ', '.join(data_list[0].keys())
        placeholders = ', '.join(['%s'] * len(data_list[0]))
        sql = f'INSERT INTO {table_name} ({fields}) VALUES ({placeholders})'
        
        values = [list(item.values()) for item in data_list]
        self.cursor.executemany(sql, values)
        self.connection.commit()
    
    def query(self, sql, params=None):
        """查询数据"""
        self.cursor.execute(sql, params)
        return self.cursor.fetchall()
    
    def close(self):
        """关闭连接"""
        self.cursor.close()
        self.connection.close()

# 使用示例
storage = MySQLStorage(
    host='localhost',
    user='root',
    password='password',
    database='crawler'
)

# 创建表
storage.create_table('products', {
    'id': 'INT AUTO_INCREMENT PRIMARY KEY',
    'name': 'VARCHAR(255)',
    'price': 'DECIMAL(10,2)',
    'created_at': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
})

# 插入数据
product_id = storage.insert('products', {
    'name': '商品1',
    'price': 99.00
})
print(f'插入成功，ID: {product_id}')

# 查询数据
results = storage.query('SELECT * FROM products')
for row in results:
    print(row)

storage.close()
```

### 案例4：MongoDB 存储

```python
from pymongo import MongoClient
from typing import List, Dict

class MongoDBStorage:
    """MongoDB 存储器"""
    
    def __init__(self, host='localhost', port=27017, database='crawler'):
        self.client = MongoClient(host, port)
        self.db = self.client[database]
    
    def get_collection(self, collection_name):
        """获取集合"""
        return self.db[collection_name]
    
    def insert(self, collection_name, data: Dict):
        """插入数据"""
        collection = self.get_collection(collection_name)
        result = collection.insert_one(data)
        return result.inserted_id
    
    def insert_many(self, collection_name, data_list: List[Dict]):
        """批量插入"""
        collection = self.get_collection(collection_name)
        result = collection.insert_many(data_list)
        return result.inserted_ids
    
    def find(self, collection_name, query=None, projection=None):
        """查询数据"""
        collection = self.get_collection(collection_name)
        return list(collection.find(query or {}, projection))
    
    def find_one(self, collection_name, query=None):
        """查询单条数据"""
        collection = self.get_collection(collection_name)
        return collection.find_one(query or {})
    
    def update(self, collection_name, query, update_data):
        """更新数据"""
        collection = self.get_collection(collection_name)
        result = collection.update_many(query, {'$set': update_data})
        return result.modified_count
    
    def delete(self, collection_name, query):
        """删除数据"""
        collection = self.get_collection(collection_name)
        result = collection.delete_many(query)
        return result.deleted_count
    
    def count(self, collection_name, query=None):
        """统计数量"""
        collection = self.get_collection(collection_name)
        return collection.count_documents(query or {})
    
    def close(self):
        """关闭连接"""
        self.client.close()

# 使用示例
storage = MongoDBStorage(database='crawler')

# 插入数据
product = {
    'name': '商品1',
    'price': 99.00,
    'tags': ['热销', '新品'],
    'specs': {
        'color': '红色',
        'size': 'L'
    }
}
product_id = storage.insert('products', product)
print(f'插入成功，ID: {product_id}')

# 查询数据
results = storage.find('products', {'price': {'$gt': 50}})
for item in results:
    print(item)

storage.close()
```

### 案例5：数据清洗工具

```python
import re
from typing import Any, Dict

class DataCleaner:
    """数据清洗器"""
    
    @staticmethod
    def clean_string(value):
        """清洗字符串"""
        if not isinstance(value, str):
            return str(value)
        
        # 去除首尾空白
        value = value.strip()
        
        # 去除多余空格
        value = re.sub(r'\s+', ' ', value)
        
        # 去除特殊字符
        value = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', value)
        
        return value
    
    @staticmethod
    def clean_number(value):
        """清洗数字"""
        if isinstance(value, (int, float)):
            return value
        
        if isinstance(value, str):
            # 去除非数字字符
            value = re.sub(r'[^\d.-]', '', value)
            
            try:
                if '.' in value:
                    return float(value)
                return int(value)
            except ValueError:
                return None
        
        return None
    
    @staticmethod
    def clean_price(value):
        """清洗价格"""
        if isinstance(value, (int, float)):
            return float(value)
        
        if isinstance(value, str):
            # 去除货币符号
            value = re.sub(r'[¥$€£]', '', value)
            # 去除千位分隔符
            value = value.replace(',', '')
            
            try:
                return float(value)
            except ValueError:
                return None
        
        return None
    
    @staticmethod
    def clean_url(url, base_url=''):
        """清洗URL"""
        if not url:
            return None
        
        url = url.strip()
        
        # 处理相对URL
        if url.startswith('//'):
            url = 'https:' + url
        elif url.startswith('/'):
            from urllib.parse import urlparse
            parsed = urlparse(base_url)
            url = f'{parsed.scheme}://{parsed.netloc}{url}'
        
        return url
    
    @staticmethod
    def clean_date(date_str):
        """清洗日期"""
        from datetime import datetime
        
        if isinstance(date_str, datetime):
            return date_str
        
        if isinstance(date_str, str):
            # 尝试多种日期格式
            formats = [
                '%Y-%m-%d',
                '%Y/%m/%d',
                '%Y年%m月%d日',
                '%Y-%m-%d %H:%M:%S',
                '%Y/%m/%d %H:%M:%S',
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_str.strip(), fmt)
                except ValueError:
                    continue
        
        return None
    
    def clean_item(self, item: Dict, rules: Dict) -> Dict:
        """清洗数据项"""
        cleaned = {}
        
        for key, value in item.items():
            if key in rules:
                rule = rules[key]
                if rule == 'string':
                    cleaned[key] = self.clean_string(value)
                elif rule == 'number':
                    cleaned[key] = self.clean_number(value)
                elif rule == 'price':
                    cleaned[key] = self.clean_price(value)
                elif rule == 'url':
                    cleaned[key] = self.clean_url(value)
                elif rule == 'date':
                    cleaned[key] = self.clean_date(value)
                else:
                    cleaned[key] = value
            else:
                cleaned[key] = value
        
        return cleaned

# 使用示例
cleaner = DataCleaner()

# 清洗价格
price = cleaner.clean_price('¥1,234.56')
print(f'清洗后价格: {price}')  # 1234.56

# 清洗数据项
item = {
    'name': '  商品名称  ',
    'price': '¥99.00',
    'stock': '100件',
    'url': '/product/123'
}

rules = {
    'name': 'string',
    'price': 'price',
    'stock': 'number',
    'url': 'url'
}

cleaned = cleaner.clean_item(item, rules)
print(f'清洗后: {cleaned}')
```

### 案例6：数据验证器

```python
from typing import Any, Dict, List
import re

class DataValidator:
    """数据验证器"""
    
    @staticmethod
    def validate_type(value, expected_type):
        """验证类型"""
        if expected_type == 'str':
            return isinstance(value, str)
        elif expected_type == 'int':
            return isinstance(value, int)
        elif expected_type == 'float':
            return isinstance(value, (int, float))
        elif expected_type == 'list':
            return isinstance(value, list)
        elif expected_type == 'dict':
            return isinstance(value, dict)
        return False
    
    @staticmethod
    def validate_range(value, min_val=None, max_val=None):
        """验证范围"""
        if not isinstance(value, (int, float)):
            return False
        
        if min_val is not None and value < min_val:
            return False
        
        if max_val is not None and value > max_val:
            return False
        
        return True
    
    @staticmethod
    def validate_pattern(value, pattern):
        """验证正则表达式"""
        if not isinstance(value, str):
            return False
        return bool(re.match(pattern, value))
    
    @staticmethod
    def validate_email(email):
        """验证邮箱"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone):
        """验证手机号"""
        pattern = r'^1[3-9]\d{9}$'
        return bool(re.match(pattern, phone))
    
    def validate_item(self, item: Dict, schema: Dict) -> List[str]:
        """验证数据项"""
        errors = []
        
        for field, rules in schema.items():
            value = item.get(field)
            
            # 检查必填字段
            if rules.get('required') and value is None:
                errors.append(f'{field} 是必填字段')
                continue
            
            if value is None:
                continue
            
            # 验证类型
            if 'type' in rules:
                if not self.validate_type(value, rules['type']):
                    errors.append(f'{field} 类型错误，期望 {rules["type"]}')
            
            # 验证范围
            if 'min' in rules or 'max' in rules:
                if not self.validate_range(value, rules.get('min'), rules.get('max')):
                    errors.append(f'{field} 超出范围')
            
            # 验证正则
            if 'pattern' in rules:
                if not self.validate_pattern(value, rules['pattern']):
                    errors.append(f'{field} 格式不正确')
        
        return errors

# 使用示例
validator = DataValidator()

# 验证数据
schema = {
    'name': {'type': 'str', 'required': True},
    'price': {'type': 'float', 'required': True, 'min': 0},
    'email': {'type': 'str', 'pattern': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'},
}

item = {
    'name': '商品1',
    'price': 99.00,
    'email': 'test@example.com'
}

errors = validator.validate_item(item, schema)
if errors:
    print(f'验证失败: {errors}')
else:
    print('验证通过')
```

### 案例7：完整的数据处理管道

```python
import json
from typing import List, Dict

class DataPipeline:
    """数据处理管道"""
    
    def __init__(self):
        self.cleaner = DataCleaner()
        self.validator = DataValidator()
        self.storage = None
    
    def set_storage(self, storage):
        """设置存储器"""
        self.storage = storage
    
    def process(self, items: List[Dict], clean_rules: Dict, 
                validation_schema: Dict) -> Dict:
        """处理数据"""
        results = {
            'total': len(items),
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        valid_items = []
        
        for i, item in enumerate(items):
            try:
                # 清洗数据
                cleaned = self.cleaner.clean_item(item, clean_rules)
                
                # 验证数据
                errors = self.validator.validate_item(cleaned, validation_schema)
                
                if errors:
                    results['failed'] += 1
                    results['errors'].append({
                        'index': i,
                        'item': item,
                        'errors': errors
                    })
                else:
                    valid_items.append(cleaned)
                    results['success'] += 1
            
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'index': i,
                    'item': item,
                    'errors': [str(e)]
                })
        
        # 存储有效数据
        if self.storage and valid_items:
            self.storage.save(valid_items)
        
        return results

# 使用示例
pipeline = DataPipeline()

# 设置存储
storage = JSONStorage('cleaned_data.json')
pipeline.set_storage(storage)

# 定义规则
clean_rules = {
    'name': 'string',
    'price': 'price',
    'url': 'url'
}

validation_schema = {
    'name': {'type': 'str', 'required': True},
    'price': {'type': 'float', 'required': True, 'min': 0},
}

# 处理数据
items = [
    {'name': '  商品1  ', 'price': '¥99.00', 'url': '/product/1'},
    {'name': '商品2', 'price': '¥-10.00', 'url': '/product/2'},  # 价格错误
    {'name': '商品3', 'price': '¥199.00', 'url': '/product/3'},
]

results = pipeline.process(items, clean_rules, validation_schema)
print(f'处理结果: {results}')
```

## 课后练习

### 练习1：实现 Redis 存储器
实现一个支持多种数据类型的 Redis 存储器。

### 练习2：实现数据去重
实现一个基于 URL 和标题的数据去重功能。

### 练习3：实现数据导出
实现一个支持导出为 Excel 格式的数据导出器。

## 常见问题

### Q1: 如何选择数据库？
A: 结构化数据用 MySQL，非结构化数据用 MongoDB，缓存和队列用 Redis。

### Q2: 如何处理大量数据？
A: 使用批量插入，分页查询，索引优化。

### Q3: 如何保证数据质量？
A: 数据清洗、数据验证、异常处理、日志记录。

## 下一步学习

- [Day 10: 爬虫中间件与管道](/crawler/crawler-advanced/day10/)
