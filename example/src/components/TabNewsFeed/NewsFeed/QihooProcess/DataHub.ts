import { NewsServerData } from "../../../interfaces";
import { uid as uidGenerator } from "../../../utils";
import "script-loader!blueimp-md5";
const throttle = require('throttle-debounce/throttle');

declare global {
    interface Window {
        md5: (value: string) => string,
    }
}

class DataHub {
    public static singleton = new DataHub();
    private uid: string;
    constructor(){
        /**
         * 构造的时候就开始获取uid，之后就直接可用，
         * 之后需要用到uid的时候都在request之后，也就是说最少有几十ms的时间获取uid
         * 足够时间获取到uid了
         */
        uidGenerator().then(uid => this.uid = window.md5(uid));
    }
    /**
     * 是否广告完全出现在视野内
     * 0-1之间 比如0.5就是提条广告露出一半高度
     */
    private offsetExposeHeight: number = .1;
    private replaceUID(url: string): string {
        return url.replace(/uid=([0-9a-f]{32})/ig, `uid=${this.uid}`);
    }
    private log(url: string) {
        let img = new Image();

        img.onload = img.onerror = img.onabort = function () {
            img.onload = img.onerror = img.onabort = null;

            img = null;
        };

        img.src = this.replaceUID(url);
    }
    private getDOMRect(element: HTMLElement): ClientRect {
        const rect = element.getBoundingClientRect();
        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;
        const left = rect.left - (document.documentElement.clientLeft + document.documentElement.scrollLeft);
        const top = rect.top - (document.documentElement.clientTop + document.documentElement.scrollTop);
        const right = left + width;
        const bottom = top + height;
        return { left, top, right, bottom, width, height };
    }
    private isInSightAndWaitExposure(element: JQuery, data: NewsServerData, nanoscroller: JQuery) {
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
    private trackClick(element: JQuery, data: NewsServerData) {
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
                    this.href = me.replaceUID(data.linkURL)
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
    public supervise(element: JQuery, data: NewsServerData, nanoscroller: JQuery){
        // 曝光检测
        this.isInSightAndWaitExposure(element, data, nanoscroller);
        // 点击检测
        this.trackClick(element, data);
    }
}

export default DataHub;