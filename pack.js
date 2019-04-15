const fs = require('fs')
const path = require('path')
const babylon = require('babylon')
const traverse = require('babel-traverse').default
const {transformFromAst} = require('babel-core')

//唯一标识每个依赖项
let INIT_ID = 0
let ID = INIT_ID

/**
 * 读取文件，并经过babel编译代码，拿出文件所有依赖项, 每个file有唯一标识id
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
        code,
        id: ID++
    }

}

/**
 * 读取css代码
 */
function readCssCode(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const code = `
        const style = document.createElement('style')
        style.innerText = ${JSON.stringify(content).replace(/\\n/g, '')}
        document.head.appendChild(style)
    `
    return {
        filePath,
        dependencies: [],
        code,
        id: ID++
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
        asset.mapping = {}
        // 遍历asset的依赖，区分css和js
        asset.dependencies.forEach((relativePath) => {
            const absolutePath = path.join(dirname, relativePath)
            let child
            if (/\.css$/.test(absolutePath)) {
                child = readCssCode(absolutePath)
            } else {
                child = readCode(absolutePath)
            }
            dependencies.push(child)
            asset.mapping[relativePath] = child.id
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
        modules += `
            '${dep.id}': [function (module, exports, require) {${dep.code}}, ${JSON.stringify(dep.mapping)}],
        `
    })
    //构建result字符串，内容是require(entry)
    const result = `
        (
            function(modules) {
                function require(id) {
                    const [fn, mapping] = modules[id]
                    //从mapping中拿出path对应的id
                    function localRequire(path) {
                        return require(mapping[path])
                    }
                  
                    const module = {exports: {}}
                    fn(module, module.exports, localRequire)
                    
                    return module.exports
                }
                
                require(${INIT_ID})
            }
        
        )({${modules}})
    `
    fs.writeFileSync('./bundle.js', result)
}


let entry = './a.js'
bundle(getDependencies(entry), entry)

