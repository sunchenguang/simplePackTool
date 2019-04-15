### 实现一个简易版打包工具

#### 大致思路
1. 找出入口文件所有的依赖关系
    1. 读取并编译入口文件代码
    2. 依据入口文件代码广度遍历所有依赖文件（包括子级）
    3. 对外输出依赖关系
2. 通过构建CommonJS代码来获取exports导出的内容
    1. 构建modules对象字符串（key为文件id, 值为`[对应的函数, mapping]`）
    2. 构建result函数字符串，并传入modules参数，函数中构建require函数，用于获取获取并执行对应文件
    3. 执行`require(entry)`, 即执行对应的文件


![image](http://ww1.sinaimg.cn/large/005F15EAly1g23gkwlpwoj313w0demzq.jpg)

#### 参考链接
https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5c10c75af265da6135726f6c

https://zhuanlan.zhihu.com/p/60867670

https://zhuanlan.zhihu.com/p/58151131
