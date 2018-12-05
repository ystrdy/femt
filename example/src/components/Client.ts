import { isdev } from "./utils";

declare global {
    interface Window {
        /**
         * 客户端调用JS，挂载在window上
         */
        ClientInvokeWeb: (name: string, data: string) => void,
    }
    interface External {
        /**
         * JS调用客户端，挂载在external上
         */
        WebInvokeClient: (name: string, data: string) => void,
    }
}

export function isClient(): boolean {
    const { external } = window;
    return !!(external && external.WebInvokeClient);
}

/**
 * 客户端调用JS接口
 */
interface HandleData {
    [propName: string]: any,
}
type Handle = (data: HandleData) => void;
const handles: {
    [propName: string]: Handle[],
} = window['__client_handles__'] = window['__client_handles__'] || {};
if (isClient() && window.ClientInvokeWeb == null) {
    window.ClientInvokeWeb = function (name: string, json: string): void {
        const fns = handles[name];
        if (fns) {
            let data;
            try {
                data = JSON.parse(json);
            } catch (error) {}
            if (!data) {
                data = {};
            }
            for (let i = 0; i < fns.length; i++) {
                fns[i](data);
            }
        }
    };
}
/**
 * 监听来自客户端的消息
 * @param name 消息名称
 * @param handle 回调
 */
function on(name: string, handle: Handle): void {
    if (!handles[name]) {
        handles[name] = [];
    }
    handles[name].push(handle);
}

/**
 * 取消监听来自客户端的消息
 * @param name 消息名称
 * @param handle 回调
 */
function off(name: string, handle: Handle): void {
    if (handles[name]) {
        const fns = [];
        for (let i = 0; i < handles[name].length; i++) {
            const fn = handles[name][i];
            if (fn !== handle) {
                fns.push(fn);
            }
        }
        handles[name] = fns;
    }
}

/**
 * JS调用客户端
 */
function invoke(name:string, data = {}): Promise<HandleData> {
    return new Promise<HandleData>(resolve => {
        let dataString;
        try {
            dataString = JSON.stringify(data);
        } catch (error) {}
        if (!dataString) {
            dataString = '{}';
        }
        if (isClient()) {
            const fn = data => {
                off(name, fn);
                resolve(data);
            };
            on(name, fn);
            window.external.WebInvokeClient(name, dataString);
        } else {
            if (isdev()) {
                console.log(`${name}(${dataString})`);
            }
        }
    });
}

export { on, off, invoke };

/**
 * 仿localStorage实现客户端保存
 */
export class NativeStorage {
    public async getItem(key: string): Promise<HandleData>{
        const data = await invoke(Names.READLOCAL);
        if (data) {
            return data[key];
        }
        return null;
    }
    public async setItem(key: string, value: string): Promise<void>{
        let data = await invoke(Names.READLOCAL);
        if (!data) {
            data = {};
        }
        data[key] = value;
        await Promise.race([
            invoke(Names.WRITELOCAL, data),
            // 超时
            new Promise<void>(resolve => {
                setTimeout(() => resolve(), 500);
            }),
        ]);
    }
    public async clear(): Promise<void>{
        await Promise.race([
            invoke(Names.WRITELOCAL, {}),
            // 超时
            new Promise<void>(resolve => {
                setTimeout(() => resolve(), 500);
            }),
        ]);
    }
}

/**
 * 包装localStorage成异步模式，用于测试
 */
export class LocalStorage {
    private storage = window.localStorage;
    public async getItem(key: string): Promise<any>{
        const { storage } = this;
        let result = null;
        if (storage) {
            result = storage.getItem(key);
        }
        return result;
    }
    public async setItem(key: string, value: string): Promise<any>{
        const { storage } = this;
        storage && storage.setItem(key, value);
    }
    public async clear(): Promise<void>{
        const { storage } = this;
        storage && storage.clear();
    }
}

export const localStorage = isClient() ? new NativeStorage() : new LocalStorage();

/**
 * 判断客户端是否支持指定任务
 * @param name 任务名称
 */
export async function support(name: string): Promise<boolean> {
    if (isClient()) {
        const { result } = await invoke(Names.SUPPORT, { name });
        return result;
    }
    return false;
}

/**
 * 导出所有支持的API名称
 */
export const Names = {
    SUPPORT: 'support',                 // 判断客户端是否支持指定方法
    GETCLIENTINFO: 'getClientInfo',     // 获取客户端信息
    WRITELOCAL: 'writeLocal',           // 将字符串写到本地
    READLOCAL: 'readLocal',             // 从本地读取字符串
    NOTIFYCLIENTWEBLOADED: 'notifyClientWebLoaded',     // 通知客户端页面已经加载完成
    NOLONGERPOPUP: 'noLongerPopup',     // 不再弹出
    REFRESH: 'refresh',                 // 调起客户端刷新页面
    QUIT: 'quit',                       // 退出
    ONCOUNT: 'onCount',                 // 来自客户端的统计消息
    ONSHOW: 'onShow',                   // 来自客户端的消息，当迷你页显示的时候触发
};