import { defineConfig } from 'vitepress'
import { createHash } from 'crypto'

// 用于跟踪已使用的slug，避免冲突
const usedSlugs = new Map<string, number>()

// 将中文路径转换为ASCII路径（Cloudflare Pages不支持中文文件名）
function slugify(path: string): string {
  // 特殊目录名替换
  let result = path
    .replace(/番外篇/g, 'extra')
    .replace(/公开课/g, 'open-course')
  
  // 分离目录和文件名
  const parts = result.split('/')
  const filename = parts[parts.length - 1]
  const dir = parts.slice(0, -1).join('/')
  
  // 提取扩展名
  const extMatch = filename.match(/\.[^.]+$/)
  const ext = extMatch ? extMatch[0] : ''
  const nameWithoutExt = filename.replace(ext, '')
  
  // 处理文件名（不含扩展名）
  let slug = nameWithoutExt
    // 将中文字符替换为空
    .replace(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/g, '')
    // 将空格替换为连字符
    .replace(/\s+/g, '-')
    // 将点号替换为连字符
    .replace(/\./g, '-')
    // 清理多余的连字符
    .replace(/[-]{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    // 转小写
    .toLowerCase()
  
  // 如果slug为空或太短，使用原文件名的hash
  if (!slug || slug.length < 2) {
    slug = createHash('md5').update(filename).digest('hex').substring(0, 8)
  }
  
  // 处理目录部分
  const dirParts = dir.split('/')
  const slugifiedDirParts = dirParts.map(part => {
    return part
      .replace(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/\./g, '-')
      .replace(/[-]{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
  })
  const slugifiedDir = slugifiedDirParts.join('/')
  
  // 检查slug是否已被使用，如果是则添加后缀
  const fullPath = slugifiedDir + '/' + slug + ext
  if (usedSlugs.has(fullPath)) {
    const count = usedSlugs.get(fullPath)! + 1
    usedSlugs.set(fullPath, count)
    slug = slug + '-' + count
  } else {
    usedSlugs.set(fullPath, 1)
  }
  
  return slugifiedDir + '/' + slug + ext
}

export default defineConfig({
  title: 'Python - 100天从新手到大师',
  description: 'Python学习课程，从基础到高级的100天学习计划',
  lang: 'zh-CN',

  // 忽略死链接
  ignoreDeadLinks: true,

  // 启用清洁URL
  cleanUrls: true,

  // 重写中文路径为ASCII路径
  rewrites: (page: string) => slugify(page),

  // Vite配置 - 禁用压缩以避免构建崩溃
  vite: {
    build: {
      minify: false,
      cssMinify: false,
    },
  },
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '学习路线', link: '/day01-20/01-python' },
      { text: '番外篇', link: '/extra/' }
    ],

    // 侧边栏
    sidebar: {
      '/day01-20/': [
        {
          text: 'Day01-20 - Python语言基础',
          items: [
            { text: '01. 初识Python', link: '/day01-20/01-python' },
            { text: '02. 第一个Python程序', link: '/day01-20/02-python' },
            { text: '03. Python语言中的变量', link: '/day01-20/03-python' },
            { text: '04. Python语言中的运算符', link: '/day01-20/04-python' },
            { text: '05. 分支结构', link: '/day01-20/05' },
            { text: '06. 循环结构', link: '/day01-20/06' },
            { text: '07. 分支和循环结构实战', link: '/day01-20/07' },
            { text: '08. 常用数据结构之列表-1', link: '/day01-20/08-1' },
            { text: '09. 常用数据结构之列表-2', link: '/day01-20/09-2' },
            { text: '10. 常用数据结构之元组', link: '/day01-20/10' },
            { text: '11. 常用数据结构之字符串', link: '/day01-20/11' },
            { text: '12. 常用数据结构之集合', link: '/day01-20/12' },
            { text: '13. 常用数据结构之字典', link: '/day01-20/13' },
            { text: '14. 函数和模块', link: '/day01-20/14' },
            { text: '15. 函数应用实战', link: '/day01-20/15' },
            { text: '16. 函数使用进阶', link: '/day01-20/16' },
            { text: '17. 函数高级应用', link: '/day01-20/17' },
            { text: '18. 面向对象编程入门', link: '/day01-20/18' },
            { text: '19. 面向对象编程进阶', link: '/day01-20/19' },
            { text: '20. 面向对象编程应用', link: '/day01-20/20' }
          ]
        }
      ],
      '/day21-30/': [
        {
          text: 'Day21-30 - Python语言应用',
          items: [
            { text: '21. 文件读写和异常处理', link: '/day21-30/21' },
            { text: '22. 对象的序列化和反序列化', link: '/day21-30/22' },
            { text: '23. Python读写CSV文件', link: '/day21-30/23-pythoncsv' },
            { text: '24. Python读写Excel文件-1', link: '/day21-30/24-pythonexcel-1' },
            { text: '25. Python读写Excel文件-2', link: '/day21-30/25-pythonexcel-2' },
            { text: '26. Python操作Word和PowerPoint文件', link: '/day21-30/26-pythonwordpowerpoint' },
            { text: '27. Python操作PDF文件', link: '/day21-30/27-pythonpdf' },
            { text: '28. Python处理图像', link: '/day21-30/28-python' },
            { text: '29. Python发送邮件和短信', link: '/day21-30/29-python' },
            { text: '30. 正则表达式的应用', link: '/day21-30/30' }
          ]
        }
      ],
      '/day31-35/': [
        {
          text: 'Day31-35 - 其他相关内容',
          items: [
            { text: '31. Python语言进阶', link: '/day31-35/31-python' },
            { text: '32-33. Web前端入门', link: '/day31-35/32-33-web' },
            { text: '34-35. 玩转Linux操作系统', link: '/day31-35/34-35-linux' }
          ]
        }
      ],
      '/day36-45/': [
        {
          text: 'Day36-45 - 数据库基础和进阶',
          items: [
            { text: '36. 关系型数据库和MySQL概述', link: '/day36-45/36-mysql' },
            { text: '37. SQL详解之DDL', link: '/day36-45/37-sql-ddl' },
            { text: '38. SQL详解之DML', link: '/day36-45/38-sql-dml' },
            { text: '39. SQL详解之DQL', link: '/day36-45/39-sql-dql' },
            { text: '40. SQL详解之DCL', link: '/day36-45/40-sql-dcl' },
            { text: '41. MySQL新特性', link: '/day36-45/41-mysql' },
            { text: '42. 视图、函数和过程', link: '/day36-45/42' },
            { text: '43. 索引', link: '/day36-45/43' },
            { text: '44. Python接入MySQL数据库', link: '/day36-45/44-pythonmysql' },
            { text: '45. Hive实战', link: '/day36-45/45-hive' }
          ]
        }
      ],
      '/day46-60/': [
        {
          text: 'Day46-60 - 实战Django',
          items: [
            { text: '46. Django快速上手', link: '/day46-60/46-django' },
            { text: '47. 深入模型', link: '/day46-60/47' },
            { text: '48. 静态资源和Ajax请求', link: '/day46-60/48-ajax' },
            { text: '49. Cookie和Session', link: '/day46-60/49-cookiesession' },
            { text: '50. 制作报表', link: '/day46-60/50' },
            { text: '51. 日志和调试工具栏', link: '/day46-60/51' },
            { text: '52. 中间件的应用', link: '/day46-60/52' },
            { text: '53. 前后端分离开发入门', link: '/day46-60/53' },
            { text: '54. RESTful架构和DRF入门', link: '/day46-60/54-restfuldrf' },
            { text: '55. RESTful架构和DRF进阶', link: '/day46-60/55-restfuldrf' },
            { text: '56. 使用缓存', link: '/day46-60/56' },
            { text: '57. 接入三方平台', link: '/day46-60/57' },
            { text: '58. 异步任务和定时任务', link: '/day46-60/58' },
            { text: '59. 单元测试', link: '/day46-60/59' },
            { text: '60. 项目上线', link: '/day46-60/60' }
          ]
        }
      ],
      '/day61-65/': [
        {
          text: 'Day61-65 - 网络数据采集',
          items: [
            { text: '61. 网络数据采集概述', link: '/day61-65/61' },
            { text: '62. 用Python获取网络资源-1', link: '/day61-65/62-python-1' },
            { text: '62. 用Python解析HTML页面-2', link: '/day61-65/62-pythonhtml-2' },
            { text: '63. Python中的并发编程-1', link: '/day61-65/63-python-1' },
            { text: '63. Python中的并发编程-2', link: '/day61-65/63-python-2' },
            { text: '63. Python中的并发编程-3', link: '/day61-65/63-python-3' },
            { text: '63. 并发编程在爬虫中的应用', link: '/day61-65/63' },
            { text: '64. 使用Selenium抓取网页动态内容', link: '/day61-65/64-selenium' },
            { text: '65. 爬虫框架Scrapy简介', link: '/day61-65/65-scrapy' }
          ]
        }
      ],
      '/day66-80/': [
        {
          text: 'Day66-80 - Python数据分析',
          items: [
            { text: '66. 数据分析概述', link: '/day66-80/66' },
            { text: '67. 环境准备', link: '/day66-80/67' },
            { text: '68. NumPy的应用-1', link: '/day66-80/68-numpy-1' },
            { text: '69. NumPy的应用-2', link: '/day66-80/69-numpy-2' },
            { text: '70. NumPy的应用-3', link: '/day66-80/70-numpy-3' },
            { text: '71. NumPy的应用-4', link: '/day66-80/71-numpy-4' },
            { text: '72. 深入浅出pandas-1', link: '/day66-80/72-pandas-1' },
            { text: '73. 深入浅出pandas-2', link: '/day66-80/73-pandas-2' },
            { text: '74. 深入浅出pandas-3', link: '/day66-80/74-pandas-3' },
            { text: '75. 深入浅出pandas-4', link: '/day66-80/75-pandas-4' },
            { text: '76. 深入浅出pandas-5', link: '/day66-80/76-pandas-5' },
            { text: '77. 深入浅出pandas-6', link: '/day66-80/77-pandas-6' },
            { text: '78. 数据可视化-1', link: '/day66-80/78-1' },
            { text: '79. 数据可视化-2', link: '/day66-80/79-2' },
            { text: '80. 数据可视化-3', link: '/day66-80/80-3' }
          ]
        }
      ],
      '/day81-90/': [
        {
          text: 'Day81-90 - 机器学习',
          items: [
            { text: '81. 浅谈机器学习', link: '/day81-90/81' },
            { text: '82. k最近邻算法', link: '/day81-90/82-k' },
            { text: '83. 决策树和随机森林', link: '/day81-90/83' },
            { text: '84. 朴素贝叶斯算法', link: '/day81-90/84' },
            { text: '85. 回归模型', link: '/day81-90/85' },
            { text: '86. K-Means聚类算法', link: '/day81-90/86-k-means' },
            { text: '87. 集成学习算法', link: '/day81-90/87' },
            { text: '88. 神经网络模型', link: '/day81-90/88' },
            { text: '89. 自然语言处理入门', link: '/day81-90/89' },
            { text: '90. 机器学习实战', link: '/day81-90/90' }
          ]
        }
      ],
      '/day91-100/': [
        {
          text: 'Day91-100 - 团队项目开发',
          items: [
            { text: '91. 团队项目开发的问题和解决方案', link: '/day91-100/91' },
            { text: '92. Docker容器技术详解', link: '/day91-100/92-docker' },
            { text: '93. MySQL性能优化', link: '/day91-100/93-mysql' },
            { text: '94. 网络API接口设计', link: '/day91-100/94-api' },
            { text: '95. 使用Django开发商业项目', link: '/day91-100/95-django' },
            { text: '96. 软件测试和自动化测试', link: '/day91-100/96' },
            { text: '97. 电商网站技术要点剖析', link: '/day91-100/97' },
            { text: '98. 项目部署上线和性能调优', link: '/day91-100/98' },
            { text: '99. 面试中的公共问题', link: '/day91-100/99' },
            { text: '100. 补充内容', link: '/day91-100/100' }
          ]
        }
      ],
      '/extra/': [
        {
          text: '番外篇',
          items: [
            { text: 'Canvas的使用场景', link: '/extra/canvas' },
            { text: 'PEP8风格指南', link: '/extra/pep8' },
            { text: 'Python编程惯例', link: '/extra/python' },
            { text: 'Python参考书籍', link: '/extra/python-2' },
            { text: 'Python容器使用小技巧', link: '/extra/python-3' },
            { text: 'Python之禅的最佳翻译', link: '/extra/python-4' },
            { text: '常见反爬策略及应对方案', link: '/extra/32a4a566' },
            { text: '分享几张学习路线图', link: '/extra/873faaa8' },
            { text: '接口文档参考示例', link: '/extra/715442ee' },
            { text: '那些年我们踩过的那些坑', link: '/extra/d4e2d8b2' },
            { text: '如何快速驾驭 pandas 库', link: '/extra/pandas' },
            { text: '使用Hexo搭建自己的博客', link: '/extra/hexo' },
            { text: '我为什么选择了Python', link: '/extra/python-5' },
            { text: '一个小例子助你彻底理解协程', link: '/extra/136ebce1' },
            { text: '用函数还是用复杂的表达式', link: '/extra/77627d0a' },
            { text: '知乎问题回答', link: '/extra/4b9176c2' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/qiuweikangdev/python-learn' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 骆昊'
    },

    // 搜索配置 - 本地搜索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },

    // 暗黑模式切换
    darkModeSwitchLabel: '主题',
    darkModeSwitchTitle: '切换到暗色模式',
    lightModeSwitchTitle: '切换到亮色模式',

    // 大纲标题
    outlineTitle: '页面导航',
    outline: [2, 3],

    // 文档页脚
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    // 最后更新时间
    lastUpdatedText: '最后更新时间',

    // 返回顶部
    returnToTopLabel: '返回顶部',

    // 菜单
    sidebarMenuLabel: '菜单'
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true
  },

  // 最后更新时间
  lastUpdated: true
})
