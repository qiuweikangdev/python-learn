# Day 12: 社交媒体数据采集

## 学习目标

- 掌握社交媒体平台的数据采集方法
- 学会处理社交媒体的反爬机制
- 实现数据清洗和分析
- 了解数据可视化技术

## 技术原理

### 12.1 社交媒体特点

**数据特点：**
- 数据量大
- 更新频繁
- 格式多样
- 包含多媒体内容

**爬取难点：**
- 需要登录
- 动态加载
- 严格的反爬
- 数据加密

### 12.2 平台分析

**微博：**
- 移动端 API
- 需要登录
- 数据格式 JSON

**知乎：**
- GraphQL API
- 需要登录
- 反爬严格

**抖音：**
- 加密参数
- 需要签名
- 反爬最严格

### 12.3 爬取策略

**登录方式：**
- Cookie 登录
- 账号密码登录
- 第三方登录

**数据获取：**
- API 接口爬取
- 页面解析爬取
- 混合方式

## 案例

### 案例1：微博数据采集

```python
import scrapy
import json

class WeiboSpider(scrapy.Spider):
    """微博爬虫"""
    
    name = 'weibo'
    
    custom_settings = {
        'COOKIES_ENABLED': True,
        'DOWNLOAD_DELAY': 3,
    }
    
    def start_requests(self):
        """生成初始请求"""
        # 微博移动端 API
        url = 'https://m.weibo.cn/api/container/getIndex'
        
        # 热门话题
        params = {
            'containerid': '106003type=25&t=3&disable_hot=1&filter_type=realtimehot',
        }
        
        yield scrapy.FormRequest(
            url=url,
            formdata=params,
            callback=self.parse_hot_topics,
            headers={
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
                'Referer': 'https://m.weibo.cn/',
            }
        )
    
    def parse_hot_topics(self, response):
        """解析热门话题"""
        data = json.loads(response.text)
        
        cards = data.get('data', {}).get('cards', [])
        for card in cards:
            card_group = card.get('card_group', [])
            for item in card_group:
                desc = item.get('desc', '')
                link = item.get('scheme', '')
                
                yield {
                    'topic': desc,
                    'link': link,
                    'hot': item.get('desc_extr', ''),
                }
```

### 案例2：知乎数据采集

```python
import scrapy
import json

class ZhihuSpider(scrapy.Spider):
    """知乎爬虫"""
    
    name = 'zhihu'
    
    custom_settings = {
        'COOKIES_ENABLED': True,
        'DOWNLOAD_DELAY': 2,
    }
    
    def start_requests(self):
        """生成初始请求"""
        # 知乎热榜 API
        url = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total'
        
        params = {
            'limit': '50',
            'desktop': 'true',
        }
        
        yield scrapy.FormRequest(
            url=url,
            formdata=params,
            callback=self.parse_hot_list,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.zhihu.com/hot',
            }
        )
    
    def parse_hot_list(self, response):
        """解析热榜"""
        data = json.loads(response.text)
        
        for item in data.get('data', []):
            target = item.get('target', {})
            
            yield {
                'title': target.get('title', ''),
                'excerpt': target.get('excerpt', ''),
                'url': f'https://www.zhihu.com/question/{target.get("id", "")}',
                'heat': item.get('detail_text', ''),
                'answer_count': target.get('answer_count', 0),
            }
```

## 应用场景

### 1. 舆情监控
- 品牌舆情分析
- 危机预警
- 用户反馈收集

### 2. 内容分析
- 热门话题追踪
- 内容趋势分析
- 用户行为分析

### 3. 竞品分析
- 竞品动态监控
- 市场趋势分析
- 用户画像分析

## 代码案例

### 案例3：微博评论采集

```python
import scrapy
import json

class WeiboCommentSpider(scrapy.Spider):
    """微博评论爬虫"""
    
    name = 'weibo_comment'
    
    def __init__(self, post_id=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.post_id = post_id
    
    def start_requests(self):
        """生成初始请求"""
        # 微博评论 API
        url = 'https://m.weibo.cn/api/comments/show'
        
        params = {
            'id': self.post_id,
            'page': '1',
        }
        
        yield scrapy.FormRequest(
            url=url,
            formdata=params,
            callback=self.parse_comments,
            meta={'page': 1}
        )
    
    def parse_comments(self, response):
        """解析评论"""
        data = json.loads(response.text)
        page = response.meta['page']
        
        comments = data.get('data', {}).get('data', [])
        for comment in comments:
            user = comment.get('user', {})
            
            yield {
                'comment_id': comment.get('id'),
                'content': comment.get('text'),
                'user_name': user.get('screen_name'),
                'user_id': user.get('id'),
                'like_count': comment.get('like_count'),
                'created_at': comment.get('created_at'),
                'post_id': self.post_id,
            }
        
        # 处理分页
        max_page = data.get('data', {}).get('max', 1)
        if page < max_page:
            next_page = page + 1
            params = {
                'id': self.post_id,
                'page': str(next_page),
            }
            
            yield scrapy.FormRequest(
                url='https://m.weibo.cn/api/comments/show',
                formdata=params,
                callback=self.parse_comments,
                meta={'page': next_page}
            )
```

### 案例4：数据清洗与分析

```python
import re
from bs4 import BeautifulSoup
import jieba
from collections import Counter

class SocialMediaAnalyzer:
    """社交媒体数据分析器"""
    
    def __init__(self):
        self.data = []
    
    def add_data(self, items):
        """添加数据"""
        self.data.extend(items)
    
    def clean_text(self, text):
        """清洗文本"""
        if not text:
            return ''
        
        # 去除 HTML 标签
        text = BeautifulSoup(text, 'html.parser').get_text()
        
        # 去除 URL
        text = re.sub(r'http[s]?://\S+', '', text)
        
        # 去除 @用户名
        text = re.sub(r'@[\w]+', '', text)
        
        # 去除话题标签
        text = re.sub(r'#[^#]+#', '', text)
        
        # 去除多余空白
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def extract_keywords(self, text, top_k=10):
        """提取关键词"""
        # 分词
        words = jieba.cut(text)
        
        # 过滤停用词
        stop_words = {'的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'}
        
        filtered_words = [w for w in words if len(w) > 1 and w not in stop_words]
        
        # 统计词频
        word_counts = Counter(filtered_words)
        
        return word_counts.most_common(top_k)
    
    def analyze_sentiment(self, text):
        """情感分析（简化版）"""
        # 正面词汇
        positive_words = {'好', '棒', '赞', '喜欢', '优秀', '精彩', '不错', '支持', '厉害', '牛'}
        
        # 负面词汇
        negative_words = {'差', '烂', '垃圾', '讨厌', '恶心', '失望', '糟糕', '难看', '难吃', '坑'}
        
        words = set(jieba.cut(text))
        
        positive_count = len(words & positive_words)
        negative_count = len(words & negative_words)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def analyze(self):
        """分析数据"""
        results = {
            'total': len(self.data),
            'sentiment': {'positive': 0, 'negative': 0, 'neutral': 0},
            'keywords': [],
        }
        
        all_text = ''
        
        for item in self.data:
            content = item.get('content', '')
            cleaned = self.clean_text(content)
            
            # 情感分析
            sentiment = self.analyze_sentiment(cleaned)
            results['sentiment'][sentiment] += 1
            
            all_text += cleaned + ' '
        
        # 提取关键词
        results['keywords'] = self.extract_keywords(all_text)
        
        return results

# 使用示例
analyzer = SocialMediaAnalyzer()

# 添加数据
comments = [
    {'content': '这个产品真的很棒！'},
    {'content': '太失望了，质量很差'},
    {'content': '还不错，值得推荐'},
]

analyzer.add_data(comments)

# 分析
results = analyzer.analyze()
print(f'总数: {results["total"]}')
print(f'情感分布: {results["sentiment"]}')
print(f'关键词: {results["keywords"]}')
```

### 案例5：数据可视化

```python
import matplotlib.pyplot as plt
import matplotlib
from wordcloud import WordCloud
import numpy as np

matplotlib.rcParams['font.sans-serif'] = ['SimHei']
matplotlib.rcParams['axes.unicode_minus'] = False

class SocialMediaVisualizer:
    """社交媒体数据可视化"""
    
    def __init__(self):
        pass
    
    def plot_sentiment_pie(self, sentiment_data, title='情感分布'):
        """绘制情感分布饼图"""
        labels = ['正面', '负面', '中性']
        sizes = [
            sentiment_data.get('positive', 0),
            sentiment_data.get('negative', 0),
            sentiment_data.get('neutral', 0),
        ]
        colors = ['#66b3ff', '#ff9999', '#99ff99']
        
        plt.figure(figsize=(8, 6))
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        plt.title(title)
        plt.axis('equal')
        
        plt.savefig('sentiment_pie.png', dpi=150, bbox_inches='tight')
        plt.show()
    
    def plot_wordcloud(self, keywords, title='关键词词云'):
        """绘制词云图"""
        # 构建词频字典
        word_freq = {word: count for word, count in keywords}
        
        # 生成词云
        wc = WordCloud(
            font_path='simhei.ttf',
            width=800,
            height=400,
            background_color='white',
            max_words=100,
        )
        
        wc.generate_from_frequencies(word_freq)
        
        plt.figure(figsize=(12, 6))
        plt.imshow(wc, interpolation='bilinear')
        plt.title(title)
        plt.axis('off')
        
        plt.savefig('wordcloud.png', dpi=150, bbox_inches='tight')
        plt.show()
    
    def plot_time_series(self, dates, values, title='时间趋势', xlabel='日期', ylabel='数量'):
        """绘制时间序列图"""
        plt.figure(figsize=(12, 6))
        plt.plot(dates, values, marker='o', linewidth=2, markersize=6)
        plt.title(title)
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)
        
        plt.savefig('time_series.png', dpi=150, bbox_inches='tight')
        plt.show()

# 使用示例
visualizer = SocialMediaVisualizer()

# 情感分布
sentiment = {'positive': 60, 'negative': 20, 'neutral': 20}
visualizer.plot_sentiment_pie(sentiment)

# 词云
keywords = [('Python', 100), ('爬虫', 80), ('数据', 70), ('分析', 60), ('学习', 50)]
visualizer.plot_wordcloud(keywords)
```

### 案例6：完整社交媒体爬虫

```python
import scrapy
import json
from datetime import datetime

class SocialMediaSpider(scrapy.Spider):
    """社交媒体爬虫"""
    
    name = 'social_media'
    
    custom_settings = {
        'DOWNLOAD_DELAY': 3,
        'CONCURRENT_REQUESTS': 2,
        'COOKIES_ENABLED': True,
    }
    
    def __init__(self, platform='weibo', keyword=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.platform = platform
        self.keyword = keyword
    
    def start_requests(self):
        """生成初始请求"""
        if self.platform == 'weibo':
            yield from self.start_weibo()
        elif self.platform == 'zhihu':
            yield from self.start_zhihu()
    
    def start_weibo(self):
        """微博爬取"""
        url = 'https://m.weibo.cn/api/container/getIndex'
        
        params = {
            'containerid': f'100103type=1&q={self.keyword}',
            'page_type': 'searchall',
        }
        
        yield scrapy.FormRequest(
            url=url,
            formdata=params,
            callback=self.parse_weibo_search,
            meta={'page': 1}
        )
    
    def parse_weibo_search(self, response):
        """解析微博搜索结果"""
        data = json.loads(response.text)
        page = response.meta['page']
        
        cards = data.get('data', {}).get('cards', [])
        for card in cards:
            card_group = card.get('card_group', [])
            for item in card_group:
                mblog = item.get('mblog', {})
                if mblog:
                    yield {
                        'platform': 'weibo',
                        'id': mblog.get('id'),
                        'content': mblog.get('text'),
                        'user': mblog.get('user', {}).get('screen_name'),
                        'reposts': mblog.get('reposts_count'),
                        'comments': mblog.get('comments_count'),
                        'likes': mblog.get('attitudes_count'),
                        'created_at': mblog.get('created_at'),
                        'keyword': self.keyword,
                    }
        
        # 分页
        if page < 10:
            next_page = page + 1
            params = {
                'containerid': f'100103type=1&q={self.keyword}',
                'page_type': 'searchall',
                'page': str(next_page),
            }
            
            yield scrapy.FormRequest(
                url='https://m.weibo.cn/api/container/getIndex',
                formdata=params,
                callback=self.parse_weibo_search,
                meta={'page': next_page}
            )
    
    def start_zhihu(self):
        """知乎爬取"""
        url = f'https://www.zhihu.com/api/v4/search_v3'
        
        params = {
            't': 'general',
            'q': self.keyword,
            'correction': '1',
            'offset': '0',
            'limit': '20',
        }
        
        yield scrapy.FormRequest(
            url=url,
            formdata=params,
            callback=self.parse_zhihu_search,
            meta={'offset': 0}
        )
    
    def parse_zhihu_search(self, response):
        """解析知乎搜索结果"""
        data = json.loads(response.text)
        offset = response.meta['offset']
        
        for item in data.get('data', []):
            obj = item.get('object', {})
            
            if item.get('type') == 'search_result':
                yield {
                    'platform': 'zhihu',
                    'type': obj.get('type'),
                    'id': obj.get('id'),
                    'title': obj.get('title'),
                    'content': obj.get('excerpt'),
                    'url': obj.get('url'),
                    'voteup_count': obj.get('voteup_count'),
                    'comment_count': obj.get('comment_count'),
                    'keyword': self.keyword,
                }
        
        # 分页
        paging = data.get('paging', {})
        if not paging.get('is_end') and offset < 100:
            next_offset = offset + 20
            params = {
                't': 'general',
                'q': self.keyword,
                'correction': '1',
                'offset': str(next_offset),
                'limit': '20',
            }
            
            yield scrapy.FormRequest(
                url='https://www.zhihu.com/api/v4/search_v3',
                formdata=params,
                callback=self.parse_zhihu_search,
                meta={'offset': next_offset}
            )
```

## 课后练习

### 练习1：爬取微博热搜
实现一个爬取微博热搜榜的爬虫。

### 练习2：爬取知乎回答
实现一个爬取知乎问题下所有回答的爬虫。

### 练习3：舆情分析系统
实现一个简单的舆情分析系统。

## 常见问题

### Q1: 如何处理社交媒体的登录？
A: 使用 Cookie 登录，或使用 Selenium 模拟登录。

### Q2: 如何处理反爬？
A: 使用代理 IP、控制请求频率、伪装请求头。

### Q3: 如何处理大量数据？
A: 使用分布式爬虫、数据库存储、增量更新。

## 下一步学习

- [Day 13: 新闻网站爬取](/crawler/crawler-practice/day13/)
