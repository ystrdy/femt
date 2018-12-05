# 新鲜事弹窗服务器接口文档

## 获取分类

方法：GET

参数：无

返回值：
```json
{
    "data":[
        {
            "id": number,           // 分类ID
            "name": string,         // 分类名称
            "dataType": number,     // 分类的显示类型，有以下值
                        0,      // 信息流
                        1,      // 购物tab页1，带滚动图的
                        2,      // 购物tab页2，纯网格图片
                        3,      // 优惠券
                        4,      // 游戏频道
                        5，     // 双11购物
                        6,      // 基于360数据的热点
                        7,      // 纯360数据的信息流
        }
    ]
}
```

例子：

[http://192.168.23.17:3000/api/v3/getcategory](http://192.168.23.17:3000/api/v3/getcategory)

## 获取分类内容

方法：GET

参数：
| 名称 | 类型 | 描述 |
| -- | -- | -- |
| categoryID | number | 分类ID，获取分类接口中的分类ID |
| dataType | number | 分类显示类型，具体见获取分类接口 |

返回值：
```json
// 信息流
{
    "data": {
        "newsfeed": [number],               // 信息流的id数组
        "righttop": {                       // 右上角位置
            "id": number,
            "dataType": {                   // 显示的样式
                0,                          // 带标题
                1,                          // 纯图片
            },
        },
        "hots": [{                          // 24小时热点
            "dataType": {                   // 显示的样式
                0,                          // 文章
                1,                          // 推荐的广告
                2,                          // 百度JS广告
                3,                          // 360JS广告
            },
            "id": number,                   // 当dataType为0、1的时候
            // more...
        }],
    }
}

// 购物tab页1，带滚动图的
{
    "data": {
        "carousel": [number],               // 焦点图广告id
        "tmall": [number],                  // 天猫广告id
        "righttop": [number],               // 右上角广告id
        "hot": [number],                    // 热卖广告id
    }
}

// 购物tab页2，纯网格图片
{
    "data": {
        "ids": [number],
    }
}

// 优惠券
{
    "data": {
        "coupons": [number],
    }
}

// 游戏频道
{
    "data": {
        "carousel": [number],                // 左上焦点图
        "newslist": [number],                // 左下新闻列表
        "gamematch": [number],               // 右上游戏比赛
        "gamelist": [number],                // 右下游戏列表
    }
}

// 双11购物
{
    "data": [
        [number]
    ]
}

// 基于360数据的热点
{
    "data": {
        "newsfeed": [number],               // 信息流的id数组
        "righttop": {                       // 右上角位置
            "id": number,
            "dataType": {                   // 显示的样式
                0,                          // 带标题
                1,                          // 纯图片
            },
        },
        "hots": [{                          // 24小时热点
            "dataType": {                   // 显示的样式
                0,                          // 文章
                1,                          // 推荐的广告
                2,                          // 百度JS广告
                3,                          // 360JS广告
            },
            "id": number,                   // 当dataType为0、1的时候
            // more...
        }],
    }
}

// 纯360数据的信息流
{
    "data": {
        "righttop": {                       // 右上角位置
            "id": number,
            "dataType": {                   // 显示的样式
                0,                          // 带标题
                1,                          // 纯图片
            },
        },
        "hots": [{                          // 24小时热点
            "dataType": {                   // 显示的样式
                0,                          // 文章
                1,                          // 推荐的广告
                2,                          // 百度JS广告
                3,                          // 360JS广告
            },
            "id": number,                   // 当dataType为0、1的时候
            // more...
        }],
    }
}

```

例子：

[http://192.168.23.17:3000/api/v3/getcontent](http://192.168.23.17:3000/api/v3/getcontent)

## 获取指定ID的文章
方法：GET

参数：
| 名称 | 类型 | 描述 |
| -- | -- | -- |
| id | number | 文章ID |

返回值：
```json
{
    "data": {
        "id": number,
        "title": string,
        "images": [string],
        "linkURL": string,
        "channelId": string,
        "from": string,
        "updateAt": string,
        "editedTitle": string,
        // more...
    }
}
```

例子：

[http://192.168.23.17:3000/api/v3/getnewsbyid?id=107](http://192.168.23.17:3000/api/v3/getnewsbyid?id=107)

## 获取指定ID的广告
方法：GET

参数：
| 名称 | 类型 | 描述 |
| -- | -- | -- |
| id | number | 广告ID |

返回值：
```json
{
    "data": {
        "id": number,
        "title": string,
        "image": string,
        "linkURL": string,
        "channelId": string,
        // more...
    }
}
```

例子：

[http://192.168.23.17:3000/api/v3/getadbyid?id=107](http://192.168.23.17:3000/api/v3/getadbyid?id=107)

## 获取开屏广告的配置
方法：GET

参数：无

返回值：
```json
{
    "data": {
        "dataType": number,   // 广告类型
                              // 0 正常的开屏广告
                              // 1 只有小图的开屏广告
                              // 2 360JS弹窗挂件
        "open": boolean,      // 开关
        "large": number,      // 广告ID
        "small": number,      // 广告ID
    }
}
```

例子：

[http://192.168.23.17:3000/api/v3/getsplash](http://192.168.23.17:3000/api/v3/getsplash)

## 获取tips内容
方法：GET

参数：无

返回值：
```json
// dataType为0，tips为新闻列表
{
    "data": {
        "dataType": number,   // 新闻列表，为0
        "news": [number],     // 新闻ID
    }
}

// dataType为1，tips为大图广告
{
    "data": {
        "dataType": number,   // 大图广告，为1
        "id": number,         // 广告ID
    }
}
```

例子：

[http://192.168.23.17:3000/api/v3/gettips](http://192.168.23.17:3000/api/v3/gettips)

## 获取皮肤广告
方法：GET

参数：无

返回值：
```json
{
    "data": {
        "dataType": number,   // 皮肤广告的显示类型
                    0         // 编辑手动推荐的
                    1         // 360接口推送的
    }
}

// 编辑手动推荐的
{
    "data": {
        "dataType": 0,
        "id": number,         // 皮肤广告ID
    }
}

// 360接口推送的
{
    "data": {
        "dataType": 1
    }
}
```

例子：

[http://192.168.23.17:3000/api/v3/getskinad](http://192.168.23.17:3000/api/v3/getskinad)