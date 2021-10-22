# todolist - cli
> hduhelp frontend practice 1

一个用nodejs写的简单的todolist

```
node todo help                      显示程序帮助
node todo ls                        列出所有事项
node todo add <descrption> [tag]    新增事项，默认状态为"待办"
node todo rm <num>                  删除序号为num的事项
node todo set <num> <tag>           标记序号为num的事项的状态，可输入"todo""doing""done"，会自动转换为中文
node todo init                      测试用，快速创建四个事项
```