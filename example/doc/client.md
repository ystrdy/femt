# JS调用客户端
`
WebInvokeClient(name, params)
`
# 客户端调用JS
`
ClientInvokeWeb(name, params)
`
| 字段   | 类型   | 描述                           |
| ------ | ------ | ------------------------------ |
| name   | string | 任务名称                       |
| params | string | 任务参数，一个JSON格式的字符串 |

## 任务列表
| 名称                  | 调用参数                               | 回调参数                     | 描述                                     |
| --------------------- | -------------------------------------- | ---------------------------- | ---------------------------------------- |
| support               | {name: 'ex'}                           | { result: true }             | 判断客户端是否支持ex方法                 |
| getClientInfo         | {}                                     | {version: '0.0.1', uuid: ''} | 获取客户端信息，版本、UUID               |
| writeLocal            | {content: 'abcdefg' }                  | {}                           | 将字符串写到本地                         |
| readLocal             | {}                                     | {content: 'abcdefg'}         | 从本地读取字符串                         |
| notifyClientWebLoaded | {}                                     | {}                           | 通知客户端页面已经加载完成               |
| openURL(废弃，PS1)    | {url: '', type: 'open or download'}    | {}                           | 使用默认浏览器打开指定URL                |
| createCanDragWndLayer | {left: 0, top: 0, width: 0, height: 0} | {}                           | 创建一个可以拖拽的原生窗口层             |
| refresh               | {}                                     | {}                           | 调起客户端刷新页面                       |
| quit                  | 无                                     | 无                           | 退出                                     |
| noLongerPopup         | {}                                     | {}                           | 不再弹出                                 |
| onCount               | 无                                     | { type, value, extra }       | 来自客户端的消息，统计                   |
| onShow                | 无                                     | {}                           | 来自客户端的消息，当迷你页显示的时候触发 |

PS: 以上所有任务，必须要实现回调

PS1：openURL从2018年8月版本开始废弃，打开URL工作全部交给客户端捕获打开窗口，客户端通过识别协议有不同的操作，如下：
- http、https：调用默认浏览器打开页面，例如，当识别为https://www.baidu.com，那么客户端就会调用默认浏览器直接在浏览器中打开https://www.baidu.com
- download：下载安装，例如，当识别为download://1，那么客户端就会开始下载安装download://1的资源

# 详细说明

## support
查询客户端是否支持指定的方法
- 参数：
  - `name` `<String>` 需要查询的方法名称
- 返回值：
  - `result` `<Boolean>` 是否存在
----------

## getClientInfo
查询客户端的信息
- 参数：无
- 返回值：
  - `version` `<String>` 客户端的版本号
  - `uuid` `<String>` UUID
---------

## writeLocal
将字符串写入本地，持久化存储
- 参数：
  - `content` `<String>` 写入的内容
- 返回值：无
--------

## readLocal
读取本地存储的内容
- 参数：无
- 返回值：
  - `content` `<String>` 读取的内容
-------

## notifyClientWebLoaded
当页面加载完成的时候，通知客户端页面已经加载好了，这时候，可以向客户端传递一些设置
- 参数：无
<!--
  - `setWndPos` `<Object>`  这个参数只在特定窗口下有效，具体询问客户端
    - `x` `<Number>` 相对主窗口左上角的在X轴上的位置
    - `y` `<Number>` 相对主窗口左上角的在Y轴上的位置
    - `width` `<Number>` 窗口宽度
    - `height` `<Number>` 窗口高度
-->
- 返回值：无
--------

## openURL
通知客户端打开指定链接，从2018年8月版本开始废弃，打开URL工作全部交给客户端捕获打开窗口
- 参数：
  - `url` `<String>`
  - `type` `<open|download>`
- 返回值：无
---------

## createCanDragWndLayer
创建一个可以拖拽的原生窗口层，只在特定窗口下有效，具体询问客户端
- 参数：
  - `let` `<Number>`
  - `top` `<Number>`
  - `width` `<Number>`
  - `height` `<Number>`
- 返回值：无
---------

## refresh
通知客户端，刷新页面
- 参数：无
- 返回值：无
---------

## quit
退出应用
- 参数：无
- 返回值：无
---------

## noLongerPopup
不再弹出
- 参数：无
- 返回值：无

## onCount
来自客户端的消息，用于统计，帮助客户端转发统计到的用户数据
- 参数：无
- 返回值：`<Object>` 不需要知道具体的数据类型，直接将数据转发给服务器
---------

## onShow
来自客户端的消息，当mini弹窗显示的时候触发
- 参数：无
- 返回值：`<Object>` 无
---------

PS：所有无参数的情况下，必须传递一个空对象

PS1: 客户端这边说JS往客户端传递参数的时候在XP下可能有问题，以前的接口不管，以后定义接口的时候不再定义传递参数的接口