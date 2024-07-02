#!/bin/bash  
  
# 检查Node.js是否已安装  
if ! command -v node &> /dev/null  
then  
    echo "Node.js未安装，正在尝试使用包管理器安装..."  
    # 这里假设你使用的是基于Debian的系统（如Ubuntu），使用yum  
    sudo yum update  
    sudo yum install -y nodejs npm  
else  
    echo "Node.js已安装"  
fi  
  
# 检查Git是否已安装  
if ! command -v git &> /dev/null  
then  
    echo "Git未安装，正在尝试使用包管理器安装..."  
    sudo yum update  
    sudo yum install -y git  
else  
    echo "Git已安装"  
fi  
  
# 检查nvm是否已安装（通过检查~/.nvm是否存在）  
if [ ! -d "$HOME/.nvm" ]; then  
    echo "nvm未安装，正在尝试安装..."  
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash  
    echo "请重启你的shell以使nvm生效"  
else  
    echo "nvm已安装"  
fi  

# 检查Node.js是否已通过nvm安装
if ! nvm use v14.5.0 &> /dev/null; then  
    echo "Node.js v14.5.0未通过nvm安装，正在尝试安装..."  
    nvm install v14.5.0 
    nvm use v14.5.0
    echo "Node.js v14.5.0已安装并通过nvm设置为默认版本"  
else  
    echo "Node.js v14.5.0已通过nvm安装"  
fi  

# 以上环境都装完了，执行依赖安装
npm install

# 检查PM2是否已安装  
if ! command -v pm2 &> /dev/null  
then  
    echo "PM2 未安装，正在安装..."  
    # 使用npm全局安装PM2  
    npm install pm2 -g  
    echo "PM2 安装完成。"  
else  
    echo "PM2 已安装。"  
fi  

# 启动文件地址
APP_PATH="./bin/www.js"  
  
# 检查应用文件是否存在  
if [ ! -f "$APP_PATH" ]; then  
    echo "应用文件 $APP_PATH 不存在。"  
    exit 1  
fi  
  
# 使用PM2启动应用  
echo "正在使用PM2启动 $APP_PATH..."  
# 这里使用pm2 start来启动应用，你可以根据需要添加更多的pm2选项  
pm2 start "$APP_PATH" --name "saio"  
  
# 检查PM2是否成功启动应用  
if pm2 list | grep -q "saio"; then  
    echo "应用 saio 已成功启动。访问地址是：:3000/public/index.html"  
else  
    echo "启动应用失败。"  
    exit 1  
fi

# 重新加载bash配置文件（如~/.bashrc或~/.bash_profile）