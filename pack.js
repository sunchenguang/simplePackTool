const fs = require('fs')
const path = require('path')
const babylon = require('babylon')
const traverse = require('babel-traverse').default
const {transformFromAst} = require('babel-core')

/**
 * 读取文件，并经过babel编译代码，拿出文件所有依赖项
 * @param filePath
 * @returns {{code, filePath: *, dependencies: Array}}
 */
function readCode(filePath) {
    //读取文件内容
    const content = fs.readFileSync(filePath, 'utf-8')
    //将文件内容转为ast
    const ast = babylon.parse(content, {
        sourceType: 'module'
    })

    //遍历ast, 拿出文件所有依赖
    const dependencies = []
    traverse(ast, {
        // enter(path) {
        //     console.log(path)
        // }
        ImportDeclaration: ({node}) => {
            //依赖文件的相对路径
            dependencies.push(node.source.value)
        }
    })

    //根据ast生成代码
    const {code} = transformFromAst(ast, null, {
        presets: ['env']
    })

    return {
        filePath,
        dependencies,
        code
    }

}

/**
 * 从入口文件遍历，获取完整的依赖树
 * @param entry
 * @returns {*[]}
 */
function getDependencies(entry) {
    //取出入口文件对象
    const entryObject = readCode(entry)
    //构建依赖数组
    const dependencies = [entryObject]

    for (const asset of dependencies) {
        const dirname = path.dirname(asset.filePath)
        // 遍历asset的依赖，区分css和js
        asset.dependencies.forEach((relativePath) => {
            const absolutePath = path.join(dirname, relativePath)
            if (/\.css$/.test(absolutePath)) {
                const content = fs.readFileSync(absolutePath, 'utf-8')
                const code = `
                    const style = document.createElement('style')
                    style.innerText = ${JSON.stringify(content).replace(/\\r\\n/g, '')}
                    document.head.appendChild(style)
                `
                dependencies.push({
                    filePath: absolutePath,
                    relativePath,
                    dependencies: [],
                    code
                })

            } else {
                const child = readCode(absolutePath)
                child.relativePath = relativePath
                dependencies.push(child)
            }
        })
    }

    return dependencies
}

/**
 * 输出打包文件到./bundle.js
 * @param dependencies
 * @param entry
 */
function bundle(dependencies, entry) {
    //构建modules字符串（内容是对象）
    let modules = ''
    dependencies.forEach((dep) => {
        const filePath = dep.relativePath || entry
        modules += `
            '${filePath}': function (module, exports, require) {${dep.code}},
        `
    })
    //构建result字符串，内容是require(entry)
    const result = `
        (
            function(modules) {
                function require(id) {
                    const module = {exports: {}}
                    modules[id](module, module.exports, require)
                    return module.exports
                }
                require('${entry}')
            }
        
        )({${modules}})
    `
    fs.writeFileSync('./bundle.js', result)
}


let entry = './a.js'
bundle(getDependencies(entry), entry)

