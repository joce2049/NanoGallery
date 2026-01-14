# Nano Gallery - Docker 部署指南

本指南将帮助您使用 Docker 部署 Nano Gallery 应用。

## 前置要求

- Docker (版本 20.10+)
- Docker Compose (版本 2.0+)

## 快速开始

### 1. 准备环境变量

创建 `.env` 文件（可选，如果不创建将使用默认值）：

```bash
ADMIN_USER=admin
ADMIN_PASSWORD=your_secure_password
```

### 2. 构建并启动容器

```bash
# 使用 docker-compose 一键启动
docker-compose up -d
```

### 3. 访问应用

打开浏览器访问：`http://localhost:3000`

管理员登录：
- 用户名：admin（或你设置的 ADMIN_USER）
- 密码：changeme（或你设置的 ADMIN_PASSWORD）

## 数据持久化

应用使用 Docker volumes 来持久化数据和图片：

- `./data` - 存储 JSON 数据库文件
- `./uploads` - 存储上传的图片文件

这些目录会在首次运行时自动创建。

### 自定义存储路径

如果您想使用自定义路径，可以修改 `docker-compose.yml` 中的 volumes 配置：

```yaml
volumes:
  - /your/custom/data/path:/app/data
  - /your/custom/uploads/path:/app/public/uploads
```

## 常用命令

### 查看日志

```bash
docker-compose logs -f nano-gallery
```

### 停止服务

```bash
docker-compose down
```

### 重启服务

```bash
docker-compose restart
```

### 重新构建镜像

```bash
docker-compose up -d --build
```

### 更新应用

```bash
# 1. 停止并删除容器
docker-compose down

# 2. 拉取最新代码（如果使用 git）
git pull

# 3. 重新构建并启动
docker-compose up -d --build
```

## 备份数据

### 备份所有数据

```bash
# 创建备份目录
mkdir -p backups/$(date +%Y%m%d)

# 备份数据文件
cp -r data backups/$(date +%Y%m%d)/
cp -r uploads backups/$(date +%Y%m%d)/
```

### 恢复数据

```bash
# 停止服务
docker-compose down

# 恢复数据
cp -r backups/YYYYMMDD/data ./
cp -r backups/YYYYMMDD/uploads ./

# 启动服务
docker-compose up -d
```

## 生产环境部署建议

### 1. 使用反向代理（Nginx）

创建 `nginx.conf`:

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
    }
}
```

### 2. 启用 HTTPS

建议使用 Let's Encrypt 配置 SSL 证书。

### 3. 配置防火墙

```bash
# 只开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. 定期备份

创建定时任务自动备份：

```bash
# 编辑 crontab
crontab -e

# 添加每日备份任务（每天凌晨2点）
0 2 * * * /path/to/backup-script.sh
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs nano-gallery

# 检查容器状态
docker ps -a
```

### 权限问题

```bash
# 确保数据目录有正确的权限
sudo chown -R 1001:1001 data uploads
```

### 端口冲突

如果端口 3000 已被占用，修改 `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # 使用 8080 端口
```

## 性能优化

### 限制资源使用

在 `docker-compose.yml` 中添加资源限制：

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 512M
```

## 安全建议

1. **修改默认密码**：务必在 `.env` 文件中设置强密码
2. **定期更新**：保持 Docker 镜像和依赖更新
3. **限制访问**：使用防火墙限制对容器的访问
4. **数据加密**：考虑对敏感数据进行加密存储

## 支持

如有问题，请查看日志或提交 Issue。
