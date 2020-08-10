#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
// 实现询问交互
const inquirer = require('inquirer')
// 通过模板引擎渲染
const ejs = require('ejs')
inquirer.prompt([
    {
        type: 'input',
        name: 'name',
        message: 'Project name?'
    },
    {
        type: 'input',
        name: 'description',
        message: 'Project description?'
    },
    {
        type: 'input',
        name: 'author',
        message: 'Project author?'
    },
    {
        type: 'input',
        name: 'dependencies',
        message: 'Project dependencies?'
    },
    {
        type: 'input',
        name: 'url',
        message: 'Project url?'
    }
]).then(answers => {
    // 模板目录
    const templDir = path.join(__dirname, '../templates')
    // Node.js 进程的当前工作目录也就是要使用这个cli的项目工作目录
    const destDir = process.cwd()
    // 定义一个数组存放我们的模板下面的文件后期需要新建文件
    let dirArray = []
    // 读取我们的模板文件，定义成一个函数，因为我们的文件是多层嵌套需要递归调用
    const readAllDir = parameTempDir => {
        fs.readdir(parameTempDir, (err, files) => {
            files.forEach(file => {
                fs.stat(path.join(parameTempDir, file), (err, stats) => {
                    if (stats.isDirectory()) {
                        readAllDir(path.join(parameTempDir, file))
                        // 文件夹存在数组中
                        dirArray.push(path.join(parameTempDir, file).replace(path.join(__dirname, '../templates/\/'), ''))
                    } else {
                        let beforeHref = path.join(parameTempDir, file)
                        let nowHref = beforeHref.replace(path.join(__dirname, '../templates'), '')
                        // 渲染模板
                        ejs.renderFile(beforeHref, answers, (err, results) => {
                            if (err) throw err
                            // 遍历数组判断文件中存不存在这个文件夹不存在就创建
                            dirArray.forEach(arr => {
                                if (!fs.existsSync(arr)) {
                                    fs.mkdirSync(arr)
                                }
                            })
                            // 写入文件
                            fs.writeFileSync(path.join(destDir, nowHref), results)
                        })
                    }
                })
            })
        })
    }
    readAllDir(templDir)
})