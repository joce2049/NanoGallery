# Docker Hub 部署完整指南

## 快速开始

本指南将指导您使用 Docker Hub 方式部署 Nano Gallery 到远程设备。

## 第一步：准备工作

### 1. 注册 Docker Hub 账号

访问 [https://hub.docker.com/](https://hub.docker.com/) 注册账号（如果还没有）。

### 2. 确认本地环境

```bash
# 确认 Docker 已安装
docker --version

# 确认在项目目录
cd "/Users/linx/Downloads/Nano Gallery"
```

## 第二步：构建并推送镜像

### 1. 登录 Docker Hub

```bash
docker login
```

输入您的 Docker Hub 用户名和密码。

### 2. 构建 Docker 镜像

```bash
# 替换 your-dockerhub-username 为您的 Docker Hub 用户名
docker build -t your-dockerhub-username/nano-gallery:latest .

# 示例：
# docker build -t johndoe/nano-gallery:latest .
```

> **提示**：首次构建可能需要 5-10 分钟，请耐心等待。

### 3. 推送镜像到 Docker Hub

```bash
docker push your-dockerhub-username/nano-gallery:latest
```

> **提示**：推送时间取决于网络速度，通常需要几分钟。

### 4. 验证推送成功

访问 `https://hub.docker.com/r/your-dockerhub-username/nano-gallery` 确认镜像已上传。

## 第三步：在目标设备部署

### 1. 准备部署文件

在目标设备上创建部署目录和必要文件：

```bash
# SSH 登录到目标设备
ssh user@target-ip

# 创建项目目录
mkdir -p ~/nano-gallery
cd ~/nano-gallery

# 创建数据目录
mkdir -p data uploads
```

### 2. 创建 docker-compose.yml

```bash
nano docker-compose.yml
```

粘贴以下内容（**记得替换用户名**）：

```yaml
version: '3.8'

services:
  nano-gallery:
    image: your-dockerhub-username/nano-gallery:latest  # 替换为你的镜像名
    container_name: nano-gallery
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ADMIN_USER=${ADMIN_USER:-admin}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme123}
    volumes:
      - ./data:/app/data
      - ./uploads:/app/public/uploads
    networks:
      - nano-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  nano-network:
    driver: bridge
```

保存并退出（Ctrl+X, Y, Enter）。

### 3. 创建环境变量文件（推荐）

```bash
nano .env
```

粘贴以下内容：

```bash
# 管理员账号配置
ADMIN_USER=admin
ADMIN_PASSWORD=your_super_secure_password_here_123456

# 环境配置
NODE_ENV=production
```

> **⚠️ 重要**：务必将 `ADMIN_PASSWORD` 改为强密码！

保存并退出。

### 4. 启动服务

```bash
# 拉取最新镜像
docker-compose pull

# 启动服务
docker-compose up -d
```

### 5. 查看启动状态

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 等待出现类似这样的输出：
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3000
# ✓ Ready in XXXms
```

按 Ctrl+C 退出日志查看。

### 6. 验证部署

在浏览器中访问：
- `http://目标设备IP:3000`

## 环境变量详细说明

### 核心环境变量

| 变量名 | 默认值 | 说明 | 是否必需 |
|--------|--------|------|----------|
| `ADMIN_USER` | `admin` | 管理后台登录用户名 | ✅ 推荐修改 |
| `ADMIN_PASSWORD` | `changeme123` | 管理后台登录密码 | ⚠️ **必须修改** |
| `NODE_ENV` | `production` | 运行环境 | ✅ 保持默认 |

### 如何修改环境变量

**方法一：修改 .env 文件**（推荐）

```bash
nano .env

# 修改后重启服务
docker-compose down
docker-compose up -d
```

**方法二：直接在 docker-compose.yml 中修改**

```yaml
environment:
  - NODE_ENV=production
  - ADMIN_USER=myadmin
  - ADMIN_PASSWORD=MySecurePass2024!
```

### 密码安全建议

- 长度至少 12 位
- 包含大小写字母、数字、特殊字符
- 不使用常见词汇
- 示例：`P@ssw0rd2024!Nano`

## 防火墙配置

### Ubuntu/Debian

```bash
# 开放 3000 端口
sudo ufw allow 3000/tcp
sudo ufw reload

# 验证
sudo ufw status
```

### CentOS/RHEL

```bash
# 开放端口
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# 验证
sudo firewall-cmd --list-ports
```

## 更新应用

### 方法一：快速更新

```bash
cd ~/nano-gallery
docker-compose pull
docker-compose down
docker-compose up -d
```

### 方法二：更新到特定版本

```bash
# 在本地构建新版本并打标签
docker build -t your-dockerhub-username/nano-gallery:v2.0 .
docker push your-dockerhub-username/nano-gallery:v2.0

# 在目标设备修改 docker-compose.yml 中的镜像标签
# image: your-dockerhub-username/nano-gallery:v2.0

# 更新
docker-compose pull
docker-compose down
docker-compose up -d
```

## 常见问题

### 1. 无法访问应用

**检查清单：**
```bash
# 1. 容器是否运行
docker ps | grep nano-gallery

# 2. 端口是否开放
sudo netstat -tlnp | grep 3000

# 3. 防火墙状态
sudo ufw status

# 4. 查看日志
docker-compose logs --tail=50
```

### 2. 忘记管理员密码

```bash
# 停止服务
docker-compose down

# 修改 .env 文件
nano .env
# 更改 ADMIN_PASSWORD

# 重启服务
docker-compose up -d
```

### 3. 镜像拉取失败

```bash
# 检查网络连接
ping hub.docker.com

# 登录 Docker Hub（需要）
docker login

# 重试拉取
docker-compose pull
```

### 4. 数据持久化问题

```bash
# 确保数据目录存在
ls -la data uploads

# 检查权限
ls -ld data uploads

# 如果需要，修改权限
sudo chown -R $USER:$USER data uploads
```

## 性能优化建议

### 1. 使用 Nginx 反向代理（推荐）

```bash
# 安装 Nginx
sudo apt update && sudo apt install nginx

# 创建配置
sudo nano /etc/nginx/sites-available/nano-gallery
```

配置内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 增加超时时间
        proxy_read_timeout 90;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/nano-gallery /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. 限制容器资源

编辑 `docker-compose.yml`，添加：

```yaml
services:
  nano-gallery:
    # ... 其他配置 ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          memory: 512M
```

## 备份和恢复

### 备份数据

```bash
# 创建备份
tar -czf backup-$(date +%Y%m%d).tar.gz data uploads .env

# 下载到本地
scp user@target-ip:~/nano-gallery/backup-*.tar.gz ./
```

### 恢复数据

```bash
# 上传备份文件
scp backup-20260114.tar.gz user@target-ip:~/nano-gallery/

# 在目标设备解压
cd ~/nano-gallery
docker-compose down
tar -xzf backup-20260114.tar.gz
docker-compose up -d
```

## 监控命令

```bash
# 实时查看资源使用
docker stats nano-gallery

# 查看最近 100 行日志
docker-compose logs --tail=100

# 持续监控日志
docker-compose logs -f --tail=50

# 检查磁盘使用
du -sh data uploads
```

## 高级配置：使用 HTTPS

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 总结

通过 Docker Hub 部署的优势：
- ✅ 不需要在目标设备安装 Node.js
- ✅ 更新非常简单（pull + restart）
- ✅ 可以同时部署到多台设备
- ✅ 版本管理更清晰

关键步骤回顾：
1. 本地构建镜像 → `docker build`
2. 推送到 Docker Hub → `docker push`
3. 目标设备拉取镜像 → `docker-compose pull`
4. 启动服务 → `docker-compose up -d`

**需要帮助？**查看 [README-DOCKER.md](README-DOCKER.md) 或提交 Issue。
