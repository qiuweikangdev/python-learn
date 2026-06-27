# Day 9: 部署自动化

## 学习目标

完成今天的学习后，你将能够：
- 实现服务器自动化部署
- 使用Docker容器化部署
- 管理部署配置
- 实现版本控制和回滚

## 技术原理

### 部署方式

1. **传统部署**：直接部署到服务器
2. **容器化部署**：使用Docker部署
3. **云部署**：部署到云平台
4. **Serverless**：无服务器部署

### Docker基础

```bash
# 构建镜像
docker build -t myapp .

# 运行容器
docker run -d -p 8000:8000 myapp

# 查看容器
docker ps

# 停止容器
docker stop <container_id>
```

### Dockerfile示例

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
```

## 案例：自动化部署脚本

创建一个自动化部署脚本，实现：
1. 代码拉取和更新
2. 依赖安装
3. 应用构建
4. 服务重启
5. 健康检查

## 应用场景

### 1. Web应用部署
- Flask/Django应用
- FastAPI服务
- 静态网站

### 2. 微服务部署
- 服务编排
- 负载均衡
- 服务发现

### 3. 批处理任务
- 定时任务部署
- 数据处理管道
- 批量作业

## 代码案例

### 案例1：服务器部署脚本

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
服务器部署脚本
功能：自动化部署Python应用到服务器
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
from datetime import datetime

class ServerDeployer:
    """服务器部署器"""
    
    def __init__(self, config):
        self.config = config
        self.project_dir = Path(config['project_dir'])
        self.deploy_dir = Path(config['deploy_dir'])
        self.backup_dir = Path(config.get('backup_dir', '/tmp/backups'))
    
    def run_command(self, cmd, cwd=None):
        """执行命令"""
        print(f"执行: {' '.join(cmd)}")
        result = subprocess.run(
            cmd,
            cwd=cwd or self.project_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"错误: {result.stderr}")
            raise RuntimeError(f"命令执行失败: {' '.join(cmd)}")
        
        return result.stdout
    
    def pull_code(self):
        """拉取最新代码"""
        print("\n[1/6] 拉取最新代码...")
        self.run_command(['git', 'pull', 'origin', 'main'])
    
    def backup_current(self):
        """备份当前版本"""
        print("\n[2/6] 备份当前版本...")
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = self.backup_dir / f"backup_{timestamp}"
        
        if self.deploy_dir.exists():
            shutil.copytree(self.deploy_dir, backup_path)
            print(f"备份完成: {backup_path}")
            return backup_path
        return None
    
    def install_dependencies(self):
        """安装依赖"""
        print("\n[3/6] 安装依赖...")
        
        # 创建虚拟环境
        venv_dir = self.deploy_dir / 'venv'
        if not venv_dir.exists():
            self.run_command([sys.executable, '-m', 'venv', str(venv_dir)])
        
        # 安装依赖
        pip_path = venv_dir / 'bin' / 'pip'
        requirements = self.project_dir / 'requirements.txt'
        
        if requirements.exists():
            self.run_command([str(pip_path), 'install', '-r', str(requirements)])
    
    def copy_files(self):
        """复制文件到部署目录"""
        print("\n[4/6] 复制文件...")
        
        # 创建部署目录
        self.deploy_dir.mkdir(parents=True, exist_ok=True)
        
        # 复制项目文件
        for item in self.project_dir.iterdir():
            if item.name in ['.git', '__pycache__', 'venv', '.env']:
                continue
            
            dest = self.deploy_dir / item.name
            if item.is_dir():
                if dest.exists():
                    shutil.rmtree(dest)
                shutil.copytree(item, dest)
            else:
                shutil.copy2(item, dest)
    
    def restart_service(self):
        """重启服务"""
        print("\n[5/6] 重启服务...")
        
        service_name = self.config.get('service_name', 'myapp')
        
        # 使用systemctl重启服务
        try:
            self.run_command(['sudo', 'systemctl', 'restart', service_name])
            print(f"服务 {service_name} 已重启")
        except RuntimeError:
            # 如果systemctl失败，尝试直接运行
            print("尝试直接启动服务...")
            self.start_service_directly()
    
    def start_service_directly(self):
        """直接启动服务"""
        venv_dir = self.deploy_dir / 'venv'
        python_path = venv_dir / 'bin' / 'python'
        app_path = self.deploy_dir / 'app.py'
        
        if app_path.exists():
            # 使用nohup在后台运行
            subprocess.Popen(
                [str(python_path), str(app_path)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True
            )
    
    def health_check(self):
        """健康检查"""
        print("\n[6/6] 执行健康检查...")
        
        import time
        import requests
        
        url = self.config.get('health_url', 'http://localhost:8000/health')
        max_retries = self.config.get('health_retries', 5)
        retry_interval = self.config.get('health_interval', 2)
        
        for i in range(max_retries):
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print("健康检查通过！")
                    return True
            except requests.RequestException:
                pass
            
            print(f"健康检查失败，{retry_interval}秒后重试 ({i+1}/{max_retries})...")
            time.sleep(retry_interval)
        
        raise RuntimeError("健康检查失败")
    
    def rollback(self, backup_path):
        """回滚到备份版本"""
        print(f"\n回滚到备份版本: {backup_path}")
        
        if backup_path and backup_path.exists():
            # 删除当前部署
            if self.deploy_dir.exists():
                shutil.rmtree(self.deploy_dir)
            
            # 恢复备份
            shutil.copytree(backup_path, self.deploy_dir)
            self.restart_service()
            print("回滚完成！")
        else:
            print("错误：备份不存在")
    
    def deploy(self):
        """执行完整部署"""
        print("=" * 50)
        print("开始部署")
        print("=" * 50)
        
        backup_path = None
        
        try:
            self.pull_code()
            backup_path = self.backup_current()
            self.copy_files()
            self.install_dependencies()
            self.restart_service()
            self.health_check()
            
            print("\n" + "=" * 50)
            print("部署成功！")
            print("=" * 50)
            
        except Exception as e:
            print(f"\n部署失败: {e}")
            
            if backup_path:
                confirm = input("是否回滚到备份版本？(y/n): ")
                if confirm.lower() == 'y':
                    self.rollback(backup_path)
            
            sys.exit(1)

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='服务器部署工具')
    parser.add_argument('--config', required=True, help='配置文件路径')
    parser.add_argument('--rollback', help='回滚到指定备份')
    
    args = parser.parse_args()
    
    # 加载配置
    import json
    with open(args.config) as f:
        config = json.load(f)
    
    deployer = ServerDeployer(config)
    
    if args.rollback:
        deployer.rollback(Path(args.rollback))
    else:
        deployer.deploy()

if __name__ == "__main__":
    main()
```

### 案例2：Docker部署

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Docker部署脚本
功能：使用Docker自动化部署应用
"""

import os
import subprocess
import sys
from pathlib import Path

class DockerDeployer:
    """Docker部署器"""
    
    def __init__(self, project_dir='.'):
        self.project_dir = Path(project_dir).resolve()
        self.image_name = None
        self.container_name = None
    
    def run_command(self, cmd, cwd=None):
        """执行命令"""
        print(f"执行: {' '.join(cmd)}")
        result = subprocess.run(
            cmd,
            cwd=cwd or self.project_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"错误: {result.stderr}")
            return False
        
        if result.stdout:
            print(result.stdout)
        return True
    
    def create_dockerfile(self):
        """创建Dockerfile"""
        dockerfile = self.project_dir / 'Dockerfile'
        
        if not dockerfile.exists():
            dockerfile.write_text("""FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["python", "app.py"]
""")
            print("Dockerfile创建完成")
    
    def create_dockerignore(self):
        """创建.dockerignore文件"""
        dockerignore = self.project_dir / '.dockerignore'
        
        if not dockerignore.exists():
            dockerignore.write_text("""__pycache__
*.pyc
*.pyo
.git
.gitignore
.env
venv
.venv
*.md
tests
""")
            print(".dockerignore创建完成")
    
    def build_image(self, tag='latest'):
        """构建Docker镜像"""
        self.image_name = f"{self.project_dir.name}:{tag}"
        print(f"\n构建镜像: {self.image_name}")
        
        return self.run_command([
            'docker', 'build',
            '-t', self.image_name,
            '.'
        ])
    
    def stop_container(self):
        """停止现有容器"""
        if self.container_name:
            print(f"\n停止容器: {self.container_name}")
            self.run_command(['docker', 'stop', self.container_name])
            self.run_command(['docker', 'rm', self.container_name])
    
    def run_container(self, port=8000, name=None):
        """运行容器"""
        self.container_name = name or f"{self.project_dir.name}_app"
        
        print(f"\n运行容器: {self.container_name}")
        
        return self.run_command([
            'docker', 'run', '-d',
            '--name', self.container_name,
            '-p', f'{port}:8000',
            self.image_name
        ])
    
    def check_health(self, port=8000):
        """检查容器健康状态"""
        import time
        import requests
        
        print("\n检查容器健康状态...")
        
        for i in range(10):
            try:
                response = requests.get(f'http://localhost:{port}/health', timeout=2)
                if response.status_code == 200:
                    print("容器运行正常！")
                    return True
            except:
                pass
            
            time.sleep(2)
        
        print("警告：健康检查超时")
        return False
    
    def show_logs(self):
        """显示容器日志"""
        if self.container_name:
            print(f"\n容器日志:")
            self.run_command(['docker', 'logs', self.container_name])
    
    def deploy(self, port=8000, tag='latest'):
        """执行完整部署"""
        print("=" * 50)
        print("开始Docker部署")
        print("=" * 50)
        
        # 创建配置文件
        self.create_dockerfile()
        self.create_dockerignore()
        
        # 构建镜像
        if not self.build_image(tag):
            print("镜像构建失败")
            return False
        
        # 停止现有容器
        self.stop_container()
        
        # 运行新容器
        if not self.run_container(port):
            print("容器启动失败")
            return False
        
        # 健康检查
        self.check_health(port)
        
        # 显示日志
        self.show_logs()
        
        print("\n" + "=" * 50)
        print("部署完成！")
        print(f"访问地址: http://localhost:{port}")
        print("=" * 50)
        
        return True

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Docker部署工具')
    parser.add_argument('project_dir', nargs='?', default='.', help='项目目录')
    parser.add_argument('--port', type=int, default=8000, help='映射端口')
    parser.add_argument('--tag', default='latest', help='镜像标签')
    parser.add_argument('--build-only', action='store_true', help='仅构建镜像')
    
    args = parser.parse_args()
    
    deployer = DockerDeployer(args.project_dir)
    
    if args.build_only:
        deployer.build_image(args.tag)
    else:
        deployer.deploy(args.port, args.tag)

if __name__ == "__main__":
    main()
```

## 课后练习

### 练习1：部署脚本
1. 编写一个简单的部署脚本
2. 支持代码更新和服务重启
3. 添加回滚功能

### 练习2：Docker部署
1. 为现有项目创建Dockerfile
2. 使用Docker Compose编排多个服务
3. 实现自动构建和部署

### 练习3：配置管理
1. 管理不同环境的配置
2. 实现配置热更新
3. 保护敏感配置信息

## 常见问题

### Q1: 如何选择部署方式？
A: 小型项目用传统部署，大型项目用Docker，微服务用Kubernetes。

### Q2: 如何实现零停机部署？
A: 使用蓝绿部署或滚动更新策略。

### Q3: 如何管理部署密钥？
A: 使用环境变量或密钥管理服务。

## 下一步学习

完成今天的学习后，建议你：
1. 为项目编写部署脚本
2. 尝试Docker容器化部署
3. 配置自动化部署流程
4. 准备进入Day 10的学习：CI/CD

明天我们将学习如何配置持续集成和持续部署。