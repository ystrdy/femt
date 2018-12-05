import { isdev, isEmptyObject } from "./utils";
import { CategoryServerData, ADServerData, NewsServerData, JSONPSettings, SplashServerData, TipsServerData, SkinADServerData } from "./interfaces";

/**
 * 将jQuery的ajax包装成支持es6的promise
 * @param settings $.ajax的设置
 */
export const ajax = async (settings: JQueryAjaxSettings): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        $.ajax(settings).done(resolve).fail(reject);
    });
};

/**
 * 不使用jQuery的ajax方法做jsonp
 * 主要jQuery的jsonp在并行请求上面存在问题，并且不支持promise
 * 自己实现一个，定制一个jsonp方法
 * 1.支持promise
 * 2.缓存
 */
export const jsonp = function() {
    const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    const caches = window['__jsonp_cache__'] = window['__jsonp_cache__'] || {};
    const cbs = window['__jsonp_callbacks__'] = window['__jsonp_callbacks__'] || {};
    return (settings: JSONPSettings): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            // 构造URL
            const s: JSONPSettings = {
                data: {},
                jsonp: 'callback',
                jsonpCallback: `callback_${new Date().getTime()}_${String(Math.random()).slice(2)}`,
                timeout: 30000,
                isStaticServer: false,
                ...settings,
            };
            const data = {
                ...s.data,
                [s.jsonp]: `__jsonp_callbacks__.${s.jsonpCallback}`,
            };
            let url = s.url + (/\?/.test(s.url) ? '&' : '?') + $.param(data);
            // 静态服务器
            if (s.isStaticServer) {
                url = url.replace(/\?.*?$/, '');
            }
            // 从缓存中取
            const cache = caches[url] = caches[url] || {};
            if (cache && cache.data) {
                setTimeout(() => resolve(cache.data));
                return;
            }
            // 发起请求
            cache.url = url;
            if (!cache.callbacks) {
                cache.callbacks = [];
            }
            cache.callbacks.push({resolve, reject});
            if (!cache.running) {
                cache.running = true;
                var cleanup = () => {
                    cache.running = false;
                    cache.callbacks = null;
                    if (script.parentNode) {
                        setTimeout(() => script.parentNode.removeChild(script));
                    }
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                };
                // 超时
                let timer = setTimeout(() => {
                    const callbacks = cache.callbacks;
                    cleanup();
                    for (let i = 0; i < callbacks.length; i++) {
                        callbacks[i].reject(data);
                    }
                }, s.timeout);
                // 请求
                cbs[s.jsonpCallback] = data => {
                    // 存到缓存
                    cache.data = data;
                    const callbacks = cache.callbacks;
                    cleanup();
                    // 回调
                    if (callbacks) {
                        for (let i = 0; i < callbacks.length; i++) {
                            callbacks[i].resolve(data);
                        }
                    }
                };
                const script = document.createElement('script');
                script.src = url;
                head.appendChild(script);
            }
        });
    };
}();

// const host = isdev() ? '' : '//apimini.flash.2144.com';
const host = '//apimini.flash.2144.com';

/**
 * 构造一个callback，带有控制缓存的功能
 */
function getJsonpCallbackWithCache(callbackName: string): string {
    const date = new Date();
    if (!isdev()) {
        date.setSeconds(0, 0);
    }
    return `${callbackName}_${date.getTime()}`;
}

/**
 * 从服务器获取分类信息
 */
export const getCategory = async (): Promise<CategoryServerData[]> => {
    const response = await jsonp({
        url: `${host}/api/v3/getcategory`,
        jsonpCallback: getJsonpCallbackWithCache('callback_get_category'),
    });
    if (response && response.data && !isEmptyObject(response.data)) {
        return response.data;
    }
    return null;
};

/**
 * 通过分类ID，从服务器取分类数据
 */
export const getContent = async (data: CategoryServerData): Promise<any> => {
    let config: JSONPSettings;
    if (data.id === 0) {        // 热点频道走静态
        config = {
            url: `//apimini.ffnews.cn/api/v3/getcontent/categoryID_${data.id}/dataType_${data.dataType}`,
            jsonpCallback: 'callback_get_content',
            isStaticServer: true,
        };
    } else {
        config = {
            url: `${host}/api/v3/getcontent`,
            data: {
                categoryID: data.id,
                dataType: data.dataType,
            },
            jsonpCallback: getJsonpCallbackWithCache('callback_get_content'),
        };
    }
    const response = await jsonp(config);
    if (response && response.data && !isEmptyObject(response.data)) {
        return response.data;
    }
    return null;
};

/**
 * 通过id获取新闻数据
 * @param id 数据ID
 */
const getNewsByIDCache = window['__getNewsByID_Cache__'] = window['__getNewsByID_Cache__'] || {};
export const getNewsByID = async (id: number): Promise<NewsServerData> => {
    if (getNewsByIDCache[id]) {
        return getNewsByIDCache[id];
    } else {
        const response = await jsonp({
            url: `${host}/api/v3/getnewsbyid`,
            data: { id },
            jsonpCallback: getJsonpCallbackWithCache(`callback_get_news_by_id_${id}`),
        });
        if (response && response.data && !isEmptyObject(response.data)) {
            return getNewsByIDCache[id] = response.data;
        }
        return null;
    }
};

/**
 * 通过id获取广告数据
 * @param id 数据ID
 */
const getADByIDCache = window['__getADByID_Cache__'] = window['__getADByID_Cache__'] || {};
export const getADByID = async (id: number): Promise<ADServerData> => {
    if (getADByIDCache[id]) {
        return getADByIDCache[id];
    } else {
        const response = await jsonp({
            url: `${host}/api/v3/getadbyid`,
            data: { id },
            jsonpCallback: getJsonpCallbackWithCache(`callback_get_ad_by_id_${id}`),
        });
        if (response && response.data && !isEmptyObject(response.data)) {
            return getADByIDCache[id] = response.data;
        }
        return null;
    }
};

/**
 * 获取开屏广告
 */
export const getSplashAD = async (): Promise<SplashServerData> => {
    const response = await jsonp({
        url: `${host}/api/v3/getsplash`,
        jsonpCallback: getJsonpCallbackWithCache('callback_get_splash'),
    });
    if (response && response.data && !isEmptyObject(response.data)) {
        return response.data;
    }
    return null;
}

/**
 * 获取tips
 */
export const getTips = async (): Promise<TipsServerData> => {
    const response = await jsonp({
        url: `${host}/api/v3/gettips`,
        jsonpCallback: getJsonpCallbackWithCache('callback_get_tips'),
    });
    if (response && response.data && !isEmptyObject(response.data)) {
        return response.data;
    }
    return null;
}

/**
 * 获取皮肤广告
 */
export const getSkinAD = async (): Promise<SkinADServerData> => {
    const response = await jsonp({
        url: `${host}/api/v3/getskinad`,
        jsonpCallback: getJsonpCallbackWithCache('callback_get_skin_ad'),
    });
    if (response && response.data && !isEmptyObject(response.data)) {
        return response.data;
    }
    return null;
}

/**
 * 获取文字广告信息
 */
export const getTextLinkInfo = async (): Promise<ADServerData> => getADByID(676);