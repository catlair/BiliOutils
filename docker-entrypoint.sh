#!/bin/sh
set -e

# 如果 config 目录不存在，则创建
if [ ! -d "./config" ]; then
    mkdir -p ./config
fi

node processConfig.js

bilioutils -v

bilioutils -c /usr/src/app/config/config.json $@
