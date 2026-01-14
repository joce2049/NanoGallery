# 远程设备部署指南

本指南将帮助您在另一台设备上使用 Docker 部署 Nano Gallery。

## 前置要求

### 目标设备（运行 Docker 的设备）
- 已安装 Docker (20.10+)
- 已安装 Docker Compose (2.0+)
- 有足够的磁盘空间（建议至少 2GB）
- 能够通过 SSH 访问（如果是远程服务器）

### 本地设备（当前设备）
- 项目源代码
- 网络连接

## 部署方法

### 方法一：使用 Git（推荐）

这是最简单和最推荐的方法。

#### 1. 在本地创建 Git 仓库（如果还没有）

```bash
# 在项目目录下
cd "/Users/linx/Downloads/Nano Gallery"

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"
```

#### 2. 推送到远程仓库

**选项 A：使用 GitHub/GitLab**

```bash
# 创建远程仓库后，添加远程地址
git remote add origin https://github.com/your-username/nano-gallery.git

# 推送代码
git push -u origin main
```

**选项 B：使用私有 Git 服务器**

```bash
# 添加私有仓库地址
git remote add origin git@your-server.com:path/to/repo.git
git push -u origin main
```

#### 3. 在目标设备上克隆仓库

```bash
# SSH 登录到目标设备
ssh user@target-device-ip

# 克隆项目
git clone https://github.com/your-username/nano-gallery.git
cd nano-gallery

# 跳转到"开始部署"部分
```

---

### 方法二：使用 SCP/SFTP 传输

适用于可以通过 SSH 访问目标设备的情况。

#### 1. 打包项目文件

```bash
# 在项目目录下
cd "/Users/linx/Downloads/Nano Gallery"

# 创建压缩包（排除 node_modules 和其他不必要的文件）
tar -czf nano-gallery.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  --exclude='.git' \
  --exclude='*.log' \
  .
```

#### 2. 传输到目标设备

```bash
# 使用 SCP 传输文件
scp nano-gallery.tar.gz user@target-device-ip:/home/user/

# 或者使用 rsync（更高效，支持断点续传）
rsync -avz --progress nano-gallery.tar.gz user@target-device-ip:/home/user/
```

#### 3. 在目标设备上解压

```bash
# SSH 登录到目标设备
ssh user@target-device-ip

# 解压文件
mkdir -p nano-gallery
tar -xzf nano-gallery.tar.gz -C nano-gallery
cd nano-gallery

# 跳转到"开始部署"部分
```

---

### 方法三：使用 Docker Hub

直接构建镜像并推送到 Docker Hub，然后在目标设备拉取。

#### 1. 构建并推送镜像

```bash
# 在项目目录下
cd "/Users/linx/Downloads/Nano Gallery"

# 登录 Docker Hub
docker login

# 构建镜像
docker build -t your-dockerhub-username/nano-gallery:latest .

# 推送到 Docker Hub
docker push your-dockerhub-username/nano-gallery:latest
```

#### 2. 创建简化的部署文件

在目标设备上只需要 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  nano-gallery:
    image: your-dockerhub-username/nano-gallery:latest
    container_name: nano-gallery
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ADMIN_USER=${ADMIN_USER:-admin}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
    volumes:
      - ./data:/app/data
      - ./uploads:/app/public/uploads
    networks:
      - nano-network

networks:
  nano-network:
    driver: bridge
```

#### 3. 在目标设备上部署

```bash
# 创建项目目录
mkdir -p nano-gallery
cd nano-gallery

# 创建 docker-compose.yml（粘贴上面的内容）
nano docker-compose.yml

# 启动服务
docker-compose pull
docker-compose up -d
```

---

## 开始部署

无论使用哪种方法，在目标设备上准备好文件后，按以下步骤部署：

### 1. 配置环境变量（可选）

```bash
# 创建 .env 文件
cat > .env << EOF
ADMIN_USER=admin
ADMIN_PASSWORD=your_secure_password_here
NODE_ENV=production
EOF
```

### 2. 创建数据目录

```bash
# 创建数据和上传目录
mkdir -p data uploads

# 设置权限（如果需要）
chmod 755 data uploads
```

### 3. 启动服务

```bash
# 构建并启动容器（方法一、二）
docker-compose up -d --build

# 或者只拉取并启动（方法三）
docker-compose pull
docker-compose up -d
```

### 4. 验证部署

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 等待服务启动（通常需要 10-30 秒）
```

### 5. 访问应用

在浏览器中访问：
- 本地访问：`http://localhost:3000`
- 远程访问：`http://目标设备IP:3000`

## 网络配置

### 开放端口

如果目标设备有防火墙，需要开放端口：

```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# 或者开放给特定 IP
sudo ufw allow from 192.168.1.0/24 to any port 3000
```

### 使用 Nginx 反向代理（推荐生产环境）

#### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 2. 配置 Nginx

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/nano-gallery

# 添加以下内容：
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/nano-gallery /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 3. 配置 HTTPS（可选但推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# Certbot 会自动配置 HTTPS
```

## 常见问题

### 1. 容器无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查端口占用
sudo netstat -tlnp | grep 3000

# 重新构建
docker-compose down
docker-compose up -d --build
```

### 2. 无法访问应用

```bash
# 检查容器是否运行
docker ps

# 检查防火墙
sudo ufw status

# 检查 Docker 网络
docker network ls
docker network inspect nano-network
```

### 3. 权限错误

```bash
# 修改目录权限
sudo chown -R 1001:1001 data uploads

# 或者使用当前用户
sudo chown -R $USER:$USER data uploads
```

### 4. 内存不足

```bash
# 检查系统资源
free -h
df -h

# 限制 Docker 容器资源
# 编辑 docker-compose.yml，添加：
deploy:
  resources:
    limits:
      memory: 1G
```

## 更新应用

### 方法一：通过 Git

```bash
cd nano-gallery
git pull
docker-compose down
docker-compose up -d --build
```

### 方法二：通过 Docker Hub

```bash
cd nano-gallery
docker-compose pull
docker-compose down
docker-compose up -d
```

### 方法三：手动更新

```bash
# 传输新文件
scp new-files.tar.gz user@target-device-ip:/home/user/nano-gallery/

# 在目标设备上
tar -xzf new-files.tar.gz
docker-compose down
docker-compose up -d --build
```

## 备份和恢复

### 自动备份脚本

创建备份脚本 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/backups/nano-gallery"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR/$DATE
cp -r data $BACKUP_DIR/$DATE/
cp -r uploads $BACKUP_DIR/$DATE/
cp docker-compose.yml $BACKUP_DIR/$DATE/
cp .env $BACKUP_DIR/$DATE/

# 保留最近 7 天的备份
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/$DATE"
```

设置定时任务：

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

## 监控和维护

### 1. 查看资源使用

```bash
# 查看容器资源使用
docker stats nano-gallery

# 查看磁盘空间
du -sh data uploads
```

### 2. 日志管理

```bash
# 限制日志大小（编辑 docker-compose.yml）
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 3. 健康检查

```bash
# 添加健康检查（编辑 docker-compose.yml）
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 安全建议

1. **更改默认密码**：务必修改 `.env` 中的默认密码
2. **使用 HTTPS**：生产环境必须使用 SSL/TLS
3. **防火墙配置**：只开放必要的端口
4. **定期更新**：及时更新系统和 Docker
5. **备份数据**：定期备份重要数据
6. **监控日志**：定期检查应用日志

## 性能优化

### 1. 使用 CDN

将静态资源（图片）托管到 CDN 以减轻服务器负担。

### 2. 数据库优化

如果数据量大，考虑使用专门的数据库（如 PostgreSQL）。

### 3. 负载均衡

对于高流量场景，使用多个实例和负载均衡器。

---

需要帮助？请查看 `README-DOCKER.md` 或提交 Issue。
