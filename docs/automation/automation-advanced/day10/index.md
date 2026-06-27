# Day 10: CI/CD持续集成与持续部署

## 学习目标

完成今天的学习后，你将能够：
- 理解CI/CD的概念和流程
- 配置GitHub Actions
- 配置GitLab CI
- 实现自动化测试和部署

## 技术原理

### CI/CD概念

**持续集成(CI)**：频繁地将代码集成到主分支，每次集成都通过自动化测试验证。

**持续部署(CD)**：自动将通过测试的代码部署到生产环境。

### CI/CD流程

```
代码提交 → 代码检查 → 单元测试 → 构建 → 部署到测试环境 → 集成测试 → 部署到生产环境
```

### 常用CI/CD工具

1. **GitHub Actions**：GitHub内置的CI/CD
2. **GitLab CI**：GitLab内置的CI/CD
3. **Jenkins**：开源自动化服务器
4. **Travis CI**：云端CI服务
5. **CircleCI**：云端CI/CD平台

## 案例：完整的CI/CD流水线

配置一个完整的CI/CD流水线，实现：
1. 代码提交触发
2. 代码质量检查
3. 自动化测试
4. 构建Docker镜像
5. 自动部署

## 应用场景

### 1. 开发流程
- 代码审查自动化
- 测试自动化
- 构建自动化

### 2. 发布管理
- 版本管理
- 发布自动化
- 回滚管理

### 3. 质量保证
- 代码规范检查
- 安全扫描
- 性能测试

## 代码案例

### 案例1：GitHub Actions配置

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # 代码检查
  lint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install flake8 black isort mypy
    
    - name: Run linters
      run: |
        flake8 . --max-line-length=88
        black --check .
        isort --check-only --profile black .
        mypy . --ignore-missing-imports

  # 单元测试
  test:
    runs-on: ubuntu-latest
    needs: lint
    
    strategy:
      matrix:
        python-version: ['3.8', '3.9', '3.10', '3.11']
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest pytest-cov
    
    - name: Run tests
      run: |
        pytest --cov=. --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  # 构建Docker镜像
  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
          ${{ secrets.DOCKERHUB_USERNAME }}/myapp:${{ github.sha }}

  # 部署到测试环境
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    environment: staging
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to staging
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.SSH_USERNAME }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /opt/myapp
          docker pull ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
          docker-compose down
          docker-compose up -d
    
    - name: Health check
      run: |
        sleep 30
        curl -f http://${{ secrets.STAGING_HOST }}:8000/health || exit 1

  # 部署到生产环境
  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.SSH_USERNAME }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /opt/myapp
          docker pull ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
          docker-compose down
          docker-compose up -d
    
    - name: Health check
      run: |
        sleep 30
        curl -f http://${{ secrets.PRODUCTION_HOST }}:8000/health || exit 1
```

### 案例2：GitLab CI配置

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.pip-cache"

cache:
  paths:
    - .pip-cache/
    - venv/

# 代码检查
lint:
  stage: lint
  image: python:3.9
  
  before_script:
    - python -m pip install --upgrade pip
    - pip install flake8 black isort mypy
  
  script:
    - flake8 . --max-line-length=88
    - black --check .
    - isort --check-only --profile black .
    - mypy . --ignore-missing-imports
  
  only:
    - merge_requests
    - main
    - develop

# 单元测试
test:
  stage: test
  image: python:3.9
  
  services:
    - postgres:13
  
  variables:
    POSTGRES_DB: test_db
    POSTGRES_USER: test_user
    POSTGRES_PASSWORD: test_password
    DATABASE_URL: "postgresql://test_user:test_password@postgres/test_db"
  
  before_script:
    - python -m pip install --upgrade pip
    - pip install -r requirements.txt
    - pip install pytest pytest-cov
  
  script:
    - pytest --cov=. --cov-report=xml
  
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
  
  coverage: '/(?i)total.*? (100(?:\.0+)?\%|[1-9]?\d(?:\.\d+)?\%)$/'
  
  only:
    - merge_requests
    - main
    - develop

# 构建Docker镜像
build:
  stage: build
  image: docker:20.10
  
  services:
    - docker:20.10-dind
  
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker build -t $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  
  only:
    - main

# 部署到测试环境
deploy_staging:
  stage: deploy
  image: alpine
  
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
  
  script:
    - ssh -o StrictHostKeyChecking=no $STAGING_USER@$STAGING_HOST "
        cd /opt/myapp &&
        docker pull $CI_REGISTRY_IMAGE:latest &&
        docker-compose down &&
        docker-compose up -d
      "
  
  environment:
    name: staging
    url: http://$STAGING_HOST:8000
  
  only:
    - main

# 部署到生产环境
deploy_production:
  stage: deploy
  image: alpine
  
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
  
  script:
    - ssh -o StrictHostKeyChecking=no $PRODUCTION_USER@$PRODUCTION_HOST "
        cd /opt/myapp &&
        docker pull $CI_REGISTRY_IMAGE:latest &&
        docker-compose down &&
        docker-compose up -d
      "
  
  environment:
    name: production
    url: http://$PRODUCTION_HOST:8000
  
  when: manual
  
  only:
    - main
```

### 案例3：本地CI/CD脚本

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地CI/CD脚本
功能：在本地模拟CI/CD流程
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
from datetime import datetime

class CICDRunner:
    """CI/CD运行器"""
    
    def __init__(self, project_dir='.'):
        self.project_dir = Path(project_dir).resolve()
        self.results = []
    
    def run_step(self, name, cmd, cwd=None):
        """执行步骤"""
        print(f"\n{'='*50}")
        print(f"步骤: {name}")
        print('='*50)
        
        start_time = datetime.now()
        
        try:
            result = subprocess.run(
                cmd,
                cwd=cwd or self.project_dir,
                capture_output=True,
                text=True
            )
            
            duration = (datetime.now() - start_time).total_seconds()
            
            if result.returncode == 0:
                status = "✓ 通过"
                print(result.stdout)
            else:
                status = "✗ 失败"
                print(result.stderr)
            
            self.results.append({
                'name': name,
                'status': status,
                'duration': duration
            })
            
            return result.returncode == 0
            
        except Exception as e:
            self.results.append({
                'name': name,
                'status': '✗ 错误',
                'duration': 0
            })
            print(f"错误: {e}")
            return False
    
    def lint(self):
        """代码检查"""
        return self.run_step("代码检查", [
            'flake8', '--max-line-length=88', '.'
        ])
    
    def format_check(self):
        """格式检查"""
        return self.run_step("格式检查", [
            'black', '--check', '.'
        ])
    
    def type_check(self):
        """类型检查"""
        return self.run_step("类型检查", [
            'mypy', '--ignore-missing-imports', '.'
        ])
    
    def test(self):
        """运行测试"""
        return self.run_step("单元测试", [
            'pytest', '-v', '--cov=.', '--cov-report=term-missing'
        ])
    
    def build(self):
        """构建"""
        return self.run_step("构建", [
            'python', '-m', 'build'
        ])
    
    def run_all(self, skip_on_failure=True):
        """运行所有步骤"""
        print("\n" + "="*50)
        print("开始CI/CD流程")
        print("="*50)
        
        steps = [
            self.lint,
            self.format_check,
            self.type_check,
            self.test,
            self.build,
        ]
        
        for step in steps:
            if not step():
                if skip_on_failure:
                    print(f"\n步骤失败，停止执行")
                    break
        
        self.print_report()
    
    def print_report(self):
        """打印报告"""
        print("\n" + "="*50)
        print("CI/CD执行报告")
        print("="*50)
        
        for result in self.results:
            print(f"{result['name']}: {result['status']} ({result['duration']:.1f}秒)")
        
        total_time = sum(r['duration'] for r in self.results)
        passed = sum(1 for r in self.results if '通过' in r['status'])
        total = len(self.results)
        
        print(f"\n总计: {passed}/{total} 通过")
        print(f"总耗时: {total_time:.1f}秒")

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='本地CI/CD工具')
    parser.add_argument('project_dir', nargs='?', default='.', help='项目目录')
    parser.add_argument('--step', choices=['lint', 'format', 'type', 'test', 'build', 'all'],
                       default='all', help='执行步骤')
    parser.add_argument('--no-fail-fast', action='store_true', help='失败时继续执行')
    
    args = parser.parse_args()
    
    runner = CICDRunner(args.project_dir)
    
    if args.step == 'all':
        runner.run_all(not args.no_fail_fast)
    elif args.step == 'lint':
        runner.lint()
    elif args.step == 'format':
        runner.format_check()
    elif args.step == 'type':
        runner.type_check()
    elif args.step == 'test':
        runner.test()
    elif args.step == 'build':
        runner.build()

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：GitHub Actions
1. 为项目配置GitHub Actions
2. 实现自动测试和代码检查
3. 配置自动部署

### 练习2：GitLab CI
1. 为项目配置GitLab CI
2. 实现多阶段流水线
3. 配置环境变量和密钥

### 练习3：本地CI/CD
1. 编写本地CI/CD脚本
2. 集成到Git钩子
3. 生成CI/CD报告

## 常见问题

### Q1: 如何选择CI/CD工具？
A: GitHub项目用GitHub Actions，GitLab项目用GitLab CI，需要高度自定义用Jenkins。

### Q2: 如何管理CI/CD密钥？
A: 使用平台提供的密钥管理功能，不要将密钥提交到代码仓库。

### Q3: 如何优化CI/CD速度？
A: 使用缓存、并行执行、增量构建、选择合适的运行环境。

## 下一步学习

完成今天的学习后，建议你：
1. 为项目配置CI/CD流水线
2. 实现自动化测试和部署
3. 优化CI/CD流程
4. 准备进入实战篇的学习

明天我们将进入实战篇，学习系统监控与告警自动化。