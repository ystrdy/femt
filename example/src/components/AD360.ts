import { ajax } from "./Server";
import { isEmptyObject, uid as uidGenerator } from "./utils";
const throttle = require('throttle-debounce/throttle');

interface AssetData {
    curl: string,
    img: string,
}

export enum ADType {
    SMALL = 1,      // 表示单图小图样式
    GROUP = 2,      // 表示组图样式
    LARGE = 3,      // 表示单图大图样式
    VIDEO = 4,      // 表示视频样式
}

export interface ADData {
    slot: number,       // 位置id（从1开始编号），返回数据中的广告序号
    type: ADType,       // 需要渲染的广告样式
    title: string,      // 广告标题
    desc: string,       // 广告描述
    src: string,        // 广告来源
    curl: string,       // 创意点击落地页，用户点击创意时最终落地的页面
    imptk: string[],    // 每个广告的曝光监测打点的url所组成的数组
    clktk: string[],    // 每个广告的点击监测打点的url所组成的数组
    // 广告素材为单图或大图（type=1 or 3）时, 有以下字段
    img?: string,       // 图片地址
    // 广告素材为多图（type=2）时, 有以下字段
    assets?: AssetData[],// 组图素材，其内容为4张图片以及每张对应的点击跳转地址
    // curl?: string,       // 创意点击落地页，用户点击创意时最终落地的页面
    // img?: string,       // 图片地址
    // 广告素材为视频（type=4）时，有以下字段
    video?: string,     // 视频链接地址
    duration?: number,  // 视频时长（单位：秒）
}

class AD360 {
    /**
     * 是否广告完全出现在视野内
     * 0-1之间 比如0.5就是提条广告露出一半高度
     */
    protected offsetExposeHeight: number = .1;
    protected uniqueNextTimes: number = 0;
    protected id: string;
    constructor(id: string){
        this.id = id;
    }
    protected nextTimes(): number {
        return ++this.uniqueNextTimes;
    }
    /**
     * 请求广告
     * @param showid 广告位所在的区域唯一标识showid
     * @param count 返回的广告数量
     */
    protected async requestAD(count = 2): Promise<ADData[]>{
        const showid = this.id;
        const reqtimes = this.nextTimes();
        const uid = await uidGenerator();
        const response = await ajax({
            url: 'http://show.g.mediav.com/s',
            data: {
                type: 1,
                of: 4,
                newf: 1,
                showid,
                impct: count,
                uid,
                reqtimes,
            },
            dataType: 'jsonp',
            jsonp: 'jsonp',
            jsonpCallback: `callback_get_ad_360_${showid}_${reqtimes}`,
            crossDomain: true,
            cache: true,
        });
        if (response && response.ads && !isEmptyObject(response.ads)) {
            return response.ads;
        }
        return null;
    }
    protected log(url: string) {
        let img = new Image();

        img.onload = img.onerror = img.onabort = function () {
            img.onload = img.onerror = img.onabort = null;

            img = null;
        };

        img.src = url;
    }
    protected getDOMRect(element: HTMLElement): ClientRect {
        const rect = element.getBoundingClientRect();
        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;
        const left = rect.left - (document.documentElement.clientLeft + document.documentElement.scrollLeft);
        const top = rect.top - (document.documentElement.clientTop + document.documentElement.scrollTop);
        const right = left + width;
        const bottom = top + height;
        return { left, top, right, bottom, width, height };
    }
    protected isInSightAndWaitExposure(element: JQuery, data: ADData, nanoscroller: JQuery) {
        const DOMItem = element.get(0);
        const DOMScroller = nanoscroller.get(0);
        const fn = throttle(100, () => {
            const rect = this.getDOMRect(DOMItem);
            const top = rect.top + (rect.bottom - rect.top) * this.offsetExposeHeight;
            const viewport = this.getDOMRect(DOMScroller);
            if (top < viewport.bottom && rect.bottom >= viewport.top) {
                nanoscroller.off('update', fn);
                // 曝光
                const imptk = data.imptk || [];
                for (let i = 0; i < imptk.length; i++) {
                    this.log(imptk[i]);
                }
            }
        });
        nanoscroller.on('update', fn);
        fn();
    }
    protected trackClick(element: JQuery, data: ADData) {
        const me = this;
        let mouseDownTimestamp;
        element.find('a').on('mousedown', function(event) {
            // 左键点击
            if (event.which === 1) {
                mouseDownTimestamp = (new Date()).getTime();
            }
        }).on('click', function(event) {
            if (mouseDownTimestamp) {
                const mouseUpTimestamp = (new Date()).getTime();
                if (mouseUpTimestamp >= mouseDownTimestamp) {
                    const origin = element.get(0).getBoundingClientRect()
                    const offsetX = Math.floor(event.clientX - origin.left) + '';
                    const offsetY = Math.floor(event.clientY - origin.top) + '';
                    this.href = data.curl
                        .replace('__EVENT_TIME_START__', mouseDownTimestamp + '')
                        .replace('__EVENT_TIME_END__', mouseUpTimestamp + '')
                        .replace('__OFFSET_X__', offsetX)
                        .replace('__OFFSET_Y__', offsetY);
                    // 发送点击监测
                    if (data.clktk && data.clktk.length) {
                        const clktks = $.isArray(data.clktk) ? data.clktk : (<string>data.clktk).split(',');
                        for (let i = 0; i < clktks.length; i++) {
                            const clktk = clktks[i]
                                .replace('__EVENT_TIME_START__', mouseDownTimestamp + '')
                                .replace('__EVENT_TIME_END__', mouseUpTimestamp + '')
                                .replace('__OFFSET_X__', offsetX)
                                .replace('__OFFSET_Y__', offsetY);
                            me.log(clktk);
                        }
                    }
                }
            }
        });
    }
    /**
     * 开启广告的监测
     * @param element 渲染后的节点
     * @param data 渲染数据
     * @param container 滚动容器
     */
    public supervise(element: JQuery, data: ADData, nanoscroller: JQuery){
        // 曝光检测
        this.isInSightAndWaitExposure(element, data, nanoscroller);
        // 点击检测
        this.trackClick(element, data);
    }
}

export default AD360;