const fs = require('fs')
const yaml = require('js-yaml')
const cliTable = require('cli-table2')
const minimist = require('minimist')

const allStatus = {
    'todo': '待办',
    'doing': '进行中',
    'done': '完成',
}
const src = './todo.yml';

function readFile(){
    let raw = fs.readFileSync(src);
    try{
        let data = yaml.load(raw);
        return data;
    }
    catch(err){
        console.log('无法解析yaml文件，需要手动修复')
        console.log(err);
        process.exit(1);
    }
}
function saveFile(){
    fs.writeFile(src, yaml.dump(data), function(err){
        if(err){
            console.error(err);     //也不知道能有什么错误，可能没权限？
            process.exit(1);
        }
    })
}
function showHelp(){
    let table = new cliTable({
        head: ['命令', '描述'],
    })
    table.push(
        ['node todo help', '显示程序帮助'],
        ['node todo ls', '列出所有事项'],
        ['node todo add <descrption> [status]', '新增事项，默认状态为"待办"'],
        ['node todo rm <num>', '删除序号为num的事项'],
        ['node xxx.js ls [--status=<status>]','列出所有指定状态的事项'],
        ['node todo set <num> <status>', '标记序号为num的事项的状态，可输入"todo""doing""done"，会自动转换为中文'],
        ['node todo init', '测试用，快速创建四个事项'],
    )
    console.log(table.toString());
}
function executeCMD(cmds,status=''){
    switch(cmds[0]){
        case 'ls':{
            let table = new cliTable({
                head: ['编号', '内容', '状态'],
            })
            if(status){
                if(status in allStatus){
                    let count = 0;
                    for(let i in data['list']){
                        if(data['list'][i]['status'] == allStatus[status]){
                            count++;
                            table.push({[i]: [data['list'][i]['des'], data['list'][i]['status']]})
                        }
                    }
                    if(count == 0){
                        table.push({'0': ['没有事项', allStatus[status]]});
                    }
                }
                else{
                    console.error('未知状态');
                    process.exit(1);
                }
            }
            else{
                isNull = true;                  //首先认为字典是空的
                for(let i in data['list']){     //如果字典非空，就会更改这个值，否则还是true
                    isNull = false;
                }
                if(isNull){
                    table.push({0: ["没有事项", allStatus['done']]})
                }
                else{
                    for(var i in data['list']){
                        table.push({[i]: [data['list'][i]['des'], data['list'][i]['status']]})
                                //如果i不加中括号，将不会被当成变量
                    }
                }
            }
            console.log(table.toString())
            break;
        }
        case 'add':{
            if(cmds[1]){
                let index = 0;                      //默认下标是0，因为字典可能为空
                for(var i in data['list']){         //如果字典里有内容，将会寻找最大下标
                    index = index > parseInt(i)? index: parseInt(i);
                }
                index = (index + 1).toString();     //新插入的事项下标再+1
                data['list'][index] = {};
                data['list'][index]['des'] = cmds[1];
                data['list'][index]['status'] = allStatus[cmds[2]]?allStatus[cmds[2]]:allStatus['todo'];
                saveFile();
                executeCMD(['ls']);
            }
            else{
                console.error("请输入事项");
                process.exit(1);
            }
            break;
        }
        case 'rm':{
            if(cmds[1] in data['list']){
                delete data['list'][cmds[1]];
                executeCMD(['sort']);               //删除后需要重新排序
            }
            else{
                console.log('序号不存在');
            }
            break;

        }
        case 'sort':{
            let count = 0;
            let tmp = [];
            for(let i in data['list']){
                tmp[count] = data['list'][i];
                count++;
            }
            data['list'] = {}
            for(let i = 0; i < count; i++){
                data['list'][i + 1] = tmp[i]
            }
            saveFile();
            executeCMD(['ls']);                 //排序后立刻展示
            break;
        }
        case 'init':{                           //测试用，快速创建一点东西
            data = {
                list: {
                    '1': {
                        'des': '要做的事1',
                        'status': allStatus['done'],
                    },
                    '2': {
                        'des': '还有很多2',
                        'status': allStatus['todo'],
                    },
                    '3': {
                        'des': '头发3',
                        'status': allStatus['doing'],
                    },
                    '4': {
                        'des': '拒绝了我4',
                        'status': allStatus['doing'],
                    },
                
                }
            };
            saveFile();
            executeCMD(['ls']);
            break;
        }
        case 'set':{
            if(cmds[1] && cmds[2]){             //要求两个参数都给
                if(cmds[1] in data['list']){
                    if(cmds[2] in allStatus){
                        data['list'][cmds[1]]['status'] = allStatus[cmds[2]];
                        saveFile();
                        executeCMD(['ls']);
                    }
                    else{
                        console.error('未知状态');
                        process.exit(1);
                    }
                }
                else{
                    console.error('序号不存在');
                    process.exit(1);
                }
            }
            else{
                console.error('参数不足');
                process.exit(1);
            }
            break;
        }
        case 'help':{
            showHelp();
            break;
        }
        default:{
            console.error('未知命令');
            showHelp();
            break;
        }
    }
}
function main(){
    try{ 
        fs.accessSync(src, fs.constants.F_OK);                              //文件存在
        try{
            fs.accessSync(src, fs.constants.R_OK | fs.constants.W_OK);      //文件可读写
            data = readFile()
        }
        catch(err){
            console.error('文件不可读或写，请检查权限');        //无能为力
            process.exit(1)                                   //退出
        }
    }
    catch(err){             //说明文件不存在
        data = {
            list: {},       //初始化一个字典
        };
    }
    let args = minimist(process.argv.slice(2))
    if(!args['_'].length){      //没有提供命令
        showHelp();
    }
    else{
        executeCMD(args['_'],args['status'])   //执行命令
    }
}
main();                         //我比较喜欢把所有东西写在函数里