import * as qs from 'querystringify';
import * as hash from "string-hash";
import { localStorage } from "./Client";
import * as uuidGenerator from "uuid/v4";

export function isdev(): boolean {
    return qs.parse(location.search.toLowerCase()).dev !== undefined;  
}

/**
 * https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
 * https://www.npmjs.com/package/await-to-js
 */
export function to<T>(promise:Promise<T>): Promise<[Error, T]> {
    return promise
        .then<[null, T]>((data: T) => [null, data])
        .catch<[Error, undefined]>((error: Error) => [error, undefined]);
}

/**
 * 预加载图片
 * @param url 图片URL
 */
export async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image: HTMLImageElement = new Image();
        image.onerror = reject;
        image.onload = () => {
            resolve(image);
        };
        image.src = url;
    });
}

/**
 * 判断对象是否为空
 */
const has = Object.prototype.hasOwnProperty
export function isEmptyObject(val: Object): boolean {
    for (const key in val) {
        if (has.call(val, key)) return false;
    }
    return true;
}

/**
 * 创建默认的滚动条
 * 配置：https://www.npmjs.com/package/nanoscroller
 */
export function createScrollBar(element: JQuery, options?: JQueryNanoScroller.NanoScrollerOptions) {
    const opts = {
        tabIndex: -1,
        alwaysVisible: true,
        ...options,
    };
    element.nanoScroller(opts);
    // 创建圆角
    element.find('.nano-slider').html(`
        <div class="u"></div>
        <div class="d"></div>
    `);
}

/**
 * 比较版本号，返回-1，0，1
 */
export function compareVersion(a: string, b: string): number {
    if (a === b) return 0;
    
    const pa = a.split('.');
    const pb = b.split('.');
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        let na = Number(pa[i]);
        if (isNaN(na)) na = 0;
        let nb = Number(pb[i]);
        if (isNaN(nb)) nb = 0;

        if (na > nb) return 1;
        if (nb > na) return -1;
    }
    return 0;
}

let uidCache;
export async function uid(): Promise<string> {
    if (uidCache != null) return uidCache;
    const key = '360interfaceuid';
    let uid = await localStorage.getItem(key);
    if (!uid) {
        await localStorage.setItem(key, uid = hash(uuidGenerator()));
    }
    if (!uid) {     // 保底
        uid = '3291900852';
    }
    return uidCache = uid;
}