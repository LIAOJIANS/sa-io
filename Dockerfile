# 使用官方Node.js镜像作为基础镜像  
FROM node:14-alpine  
  
# 设置工作目录  
WORKDIR /usr/src/app  
  
# 这有助于缓存依赖项，减少构建时间  
COPY package*.json ./  

RUM sh ./init.sh
  
# 将项目文件复制到镜像中  
COPY . .  
  
# 暴露应用端口    
EXPOSE 3000  
  
# 设置容器启动时执行的命令  
CMD pm2 start ./bin/www.js --name "saio"