import { localStorage, invoke, Names, isClient } from "../Client";
const uuidGenerator = require('uuid/v4');

export const URL = 'http://tongji.flash.2144.com/hm3.gif';

/**
 * 向广告服务器发送log
 */
export function log(url: string): void {
    let img = new Image();

    img.onload = img.onerror = img.onabort = function () {
        img.onload = img.onerror = img.onabort = null;

        img = null;
    };

    img.src = url;
};

export async function uuid(): Promise<string> {
    // 从客户端取UUID
    let data;
    if (isClient()) {
        data = await invoke(Names.GETCLIENTINFO);
    }
    let uuid;
    if (data && data.uuid) {
        uuid = data.uuid;
    }
    if (uuid) {
        return uuid;
    }
    // 客户端取不到，那么生成一个吧
    uuid = await localStorage.getItem('uuid');
    if (!uuid) {
        await localStorage.setItem('uuid', `web-{${uuid = uuidGenerator()}}`.toUpperCase());
    }
    return uuid;
}