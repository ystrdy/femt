const proxy = require('http-proxy-middleware');
const url = require('url');
const qs = require('querystring');

const target = 'http://apimini.flash.2144.com';

const createProxy = function (options) {
    const onError = (error, req, res) => {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end(error.toString());
    }
    const result = proxy({
        onError,
        logLevel: 'silent',
        ...options,
    });
    return result;
}

module.exports = function(router){
    
    return;
    
    
    router.get('/api/v3/getcategory', createProxy({
        target,
        changeOrigin: true,
        pathRewrite: {
            '/api/v3/getcategory': '/api/v1/getcategory',
        },
        onProxyRes: (proxyRes, req, res) => {
            let body = new Buffer('');
            proxyRes.on('data', function (data) {
                body = Buffer.concat([body, data]);
            });
            proxyRes.on('end', function () {
                const regexp = /(callback.+?\()(.*?)(\))/i;
                const handle = function (_, h, b, f) {
                    let json;
                    try {
                        json = JSON.parse(b);
                    } catch (error) {}
                    if (json && json.data) {
                        const { data } = json;
                        json.data = data.map((item, index) => {
                            if (item.id === 0) {
                                // return {
                                //     ...item,
                                //     dataType: 6,
                                // };
                            } else if (item.id === 16) {
                                return {
                                    ...item,
                                    dataType: 3,
                                };
                            } else if (item.id === 17) {
                                return {
                                    ...item,
                                    dataType: 4,
                                };
                            }
                            return {
                                ...item,
                                dataType: 0,
                            };
                        });
                        // json.data = json.data.sort((a, b) => a.id === 3 ? -1 : 1);
                        return h + JSON.stringify(json) + f;
                    }
                    return h + b + f;
                };
                const result = body.toString().replace(regexp, handle);
                res.end(result);
            });
        },
        selfHandleResponse: true,           // 是否清空原来的响应内容
    }));
    router.get('/api/v3/getcontent', createProxy({
        target,
        changeOrigin: true,
        pathRewrite: {
            '/api/v3/getcontent': '/api/v3/getcontent',
        },
        /*
        onProxyRes: (proxyRes, req, res) => {
            let body = new Buffer('');
            proxyRes.on('data', function (data) {
                body = Buffer.concat([body, data]);
            });
            proxyRes.on('end', function () {
                const regexp = /(callback.+?\()(.*?)(\))/i;
                const handle = function (_, h, b, f) {
                    let json;
                    try {
                        json = JSON.parse(b);
                    } catch (error) {}
                    if (json && json.data) {
                        const { data } = json;
                        const urlObj = url.parse(req.originalUrl);
                        const query = qs.parse(urlObj.query);
                        if (query.categoryID == 15) {
                            // if (data.images) {
                            //     json.data = {
                            //         ids: data.images,
                            //     };
                            // }
                            // json.data = data.tabs;
                        } else if (query.categoryID == 16) {
                        } else if (query.categoryID == 17) {
                        } else {
                            json.data = {
                                righttop: {
                                    dataType: 0,
                                    id: 76,
                                },
                                hots: [{
                                    dataType: 0,
                                    id: 91655,
                                }, {
                                    dataType: 0,
                                    id: 86410,
                                }, {
                                    dataType: 0,
                                    id: 93995,
                                }, {
                                    dataType: 1,
                                    id: 76,
                                }],
                                newsfeed: [77703,99157,77701,59521,71027,88693,57471,59226,59982,60248,59229,60251,55632,60247,60249,58946,60492,60685,60682,5383,95996,95995,68864,90978,90527,90751,90982,90981,90980,90979,89831,89830,90271,90270,90750,90269,90749,90976,90977,90975,90973,89404,90526,80010,80570,80569,80568,79734,80009,80278,79736,80008,79735,80004,78746,79421,79420,78745,78744,78742,79419,78741,78740,79418,79417,80566,80275,81585,81938,82266,81937,82987,83864,83863,83862,83860,83858,82985,83851,85494,82564,82989,81942,81941,81940,82269,83869,82268,83868,83867,82267,82988,83866,81589,81588,81587,81939,82782,81586,83865,83342,82274,82788,82273,83191,82568,82787,82786,82271,82990,82785,83537,83536,82567,82270,82566,81945,81943,82783,84244,83854,85500,85499,84584,84583,84582,84581,85498,84580,85497,85219,84944,85493,84932,85492,77952,78039,78174,78301,78295,78509,78506,78505,78504,78512,78510,78511,78508,78603,78602,78599,78600,78410,78412,78411,78408,78409,78302,78300,78299,78298,78297,78296,78290,77955,77872,77871,77953,77790,77789,78041,77788,77787,77705,77704,77702,77786,78040,77870,77603,77602,77601,77510,77509,77508,77411,78177,77507,78176,77410,77600,78175,78173,77784,77599,78172,77506,77598,77505,77504],
                            };
                        }
                        return h + JSON.stringify(json) + f;
                    }
                    return h + b + f;
                };
                const result = body.toString().replace(regexp, handle);
                res.end(result);
            });
        },
        selfHandleResponse: true,           // 是否清空原来的响应内容
        */
    }));
    router.get('/api/v3/getadbyid', createProxy({
        target,
        changeOrigin: true,
        pathRewrite: {
            '/api/v3/getadbyid': '/api/v2/getadbyid',
        },
    }));
    router.get('/api/v3/getnewsbyid', createProxy({
        target,
        changeOrigin: true,
        pathRewrite: {
            '/api/v3/getnewsbyid': '/api/v1/getdatabyid',
        },
    }));
    router.get('/api/v3/getsplash', createProxy({
        target,
        changeOrigin: true,
        pathRewrite: {
            '/api/v3/getsplash': '/api/v2/getscreenad',
        },
        onProxyRes: (proxyRes, req, res) => {
            let body = new Buffer('');
            proxyRes.on('data', function (data) {
                body = Buffer.concat([body, data]);
            });
            proxyRes.on('end', function () {
                const regexp = /(callback.+?\()(.*?)(\))/i;
                const handle = function (_, h, b, f) {
                    let json;
                    try {
                        json = JSON.parse(b);
                    } catch (error) {}
                    if (json && json.data) {
                        json.data = {
                            dataType: json.data.dataType,
                            open: json.data.open,
                            small: json.data.small.id,
                            large: json.data.large.id,
                        };
                        return h + JSON.stringify(json) + f;
                    }
                    return h + b + f;
                };
                const result = body.toString().replace(regexp, handle);
                res.end(result);
            });
        },
        selfHandleResponse: true,           // 是否清空原来的响应内容
    }));
    router.get('/api/v3/gettips', createProxy({
        target,
        changeOrigin: true,
        pathRewrite: {
            '/api/v3/gettips': '/api/v1/gettipslist',
        },
        onProxyRes: (proxyRes, req, res) => {
            let body = new Buffer('');
            proxyRes.on('data', function (data) {
                body = Buffer.concat([body, data]);
            });
            proxyRes.on('end', function () {
                const regexp = /(callback.+?\()(.*?)(\))/i;
                const handle = function (_, h, b, f) {
                    let json;
                    try {
                        json = JSON.parse(b);
                    } catch (error) {}
                    if (json && json.data) {
                        json.data = {
                            dataType: 1,
                            news: json.data.map(({id}) => id),
                            id: 112,
                        };
                        return h + JSON.stringify(json) + f;
                    }
                    return h + b + f;
                };
                const result = body.toString().replace(regexp, handle);
                res.end(result);
            });
        },
        selfHandleResponse: true,           // 是否清空原来的响应内容
    }));
    router.get('/api/v3/getskinad', createProxy({
        target,
        changeOrigin: true,
        pathRewrite: {
            '/api/v3/getskinad': '/api/v2/getexternalad',
        },
        onProxyRes: (proxyRes, req, res) => {
            let body = new Buffer('');
            proxyRes.on('data', function (data) {
                body = Buffer.concat([body, data]);
            });
            proxyRes.on('end', function () {
                const regexp = /(callback.+?\()(.*?)(\))/i;
                const handle = function (_, h, b, f) {
                    let json;
                    try {
                        json = JSON.parse(b);
                    } catch (error) {}
                    if (json && json.data) {
                        json.data = {
                            id: 112,
                        };
                        return h + JSON.stringify(json) + f;
                    }
                    return h + b + f;
                };
                const result = body.toString().replace(regexp, handle);
                res.end(result);
            });
        },
        selfHandleResponse: true,           // 是否清空原来的响应内容
    }));
}