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
  
# 如果你还想检查特定的Node.js版本是否通过nvm安装，可以添加以下逻辑  
# 例如，检查是否有'node v14.0.0'这个版本  
if ! nvm use v14.0.0 &> /dev/null; then  
    echo "Node.js v14.0.0未通过nvm安装，正在尝试安装..."  
    nvm install v14.0.0  
    nvm use v14.0.0  
    echo "Node.js v14.0.0已安装并通过nvm设置为默认版本"  
else  
    echo "Node.js v14.0.0已通过nvm安装"  
fi  