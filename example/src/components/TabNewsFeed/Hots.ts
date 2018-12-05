import { getADByID, getNewsByID } from "../Server";
import { HotsServerData, HotsType, CountType, NewsChannel } from "../interfaces";
import { to } from "../utils";
import { generateHTMLAttribute } from "../Counter";
import placeholder, { generateImageAttribute, defaultRun } from "../ImagePlaceholder";
import DataHub from "./NewsFeed/QihooProcess/DataHub";
const Emitter = require('tiny-emitter');
const $script = require('scriptjs');

interface ADBaiduConfig {
    id: string,
    container: string,
}

interface AD360Config {
    [propName: string]: any,
}

declare global {
    interface Window {
        slotbydup: ADBaiduConfig[],                 // 百度JS广告接口
        NEWS_FEED: (config: AD360Config) => void,   // 360JS广告接口
    }
}

enum Events {
    MOUNTED = 'mounted',
}

class Hots extends Emitter {
    private element: JQuery;
    private categoryID: number;
    private data: HotsServerData[];
    constructor(
        element: JQuery,
        categoryID: number,
        data: HotsServerData[],
    ) {
        super();
        this.element = element;
        this.categoryID = categoryID;
        this.data = data;
    }
    public static async build(
        element: JQuery,
        categoryID: number,
        data: HotsServerData[],
    ): Promise<Hots> {
        const instance = new this(element, categoryID, data);
        await instance.create();
        return instance;
    }
    private async create() {
        const { element, data } = this;
        if (!data || !data.length) return;
        // 渲染
        const promises = [];
        for (let i = 0; i < data.length; i++) {
            const { dataType, id } = data[i];
            let promise;
            switch (dataType) {
                case HotsType.ARTICLE:
                    promise = this.createArticle(id);
                    break;
                case HotsType.AD_NORMAL:
                    promise = this.createADNormal(id);
                    break;
                case HotsType.AD_BAIDU:
                    promise = this.createADBaidu();
                    break;
                case HotsType.AD_360:
                    promise = this.createAD360();
                    break;
            }
            promise && promises.push(promise);
        }
        const results = await Promise.all(promises);
        // 添加到DOM树
        element.html(`
            <h3><i></i>24小时推荐</h3>
            <ul></ul>
        `);
        let elements = $();
        for (let i = 0; i < results.length; i++) {
            if (results[i]) {
                elements = elements.add(results[i]);
            }
        }
        element.find('ul').append(elements);
        setTimeout(() => this.emit(Events.MOUNTED));
    }
    private async createArticle(id: number): Promise<JQuery> {
        const [ error, item ] = await to(getNewsByID(id));
        if (error || !item) return;
        const clickcount = generateHTMLAttribute({
            type: CountType.NEWS_FEED_HOT,
            id: item.id,
            channelId: item.channelId,
            category: this.categoryID,
        });
        const element = $(`
            <li><a href="${item.linkURL}" ${clickcount}>
                <h4>${item.title}</h4>
                <div class="tab-nf-pic">
                    <img ${generateImageAttribute('70x48', item.images[0])}>
                </div>
            </a></li>
        `);
        placeholder(element.find('img'));
        // 360广告，打点
        if (item.channelId === NewsChannel.QIHOO) {
            this.once(Events.MOUNTED, () => {
                DataHub.singleton.supervise(element, item, this.element);
            });
        }
        return element;
    }
    private placeholderRunCenter(image: HTMLImageElement) {
        const element = $(image);
        if (!element.parent().hasClass('sb-normal')) {
            image.onload = () => {
                const wrapper = <HTMLElement>image.parentNode;
                const marginLeft = (wrapper.clientWidth - image.clientWidth) / 2;
                image.style.marginLeft = `${marginLeft}px`;
            };
        }
        defaultRun(image);
    }
    private async createADNormal(id: number): Promise<JQuery> {
        const [ error, item ] = await to(getADByID(id));
        if (error || !item) return;
        const clickcount = generateHTMLAttribute({
            type: CountType.NEWS_FEED_HOT,
            id: item.id,
            channelId: item.channelId,
            category: this.categoryID,
        });
        const element = $(`
            <li><a href="${item.linkURL}" ${clickcount}>
                <h4>${item.title}</h4>
                <div class="tab-nf-pic">
                    <img ${generateImageAttribute('70x48', item.image)}>
                </div>
            </a></li>
        `);
        placeholder(element.find('img'), this.placeholderRunCenter);
        return element;
    }
    private async createADBaidu(): Promise<JQuery> {
        const id = '_' + Math.random().toString(36).slice(2);
        const element = $(`<li id="${id}"></li>`);
        (window.slotbydup = window.slotbydup || []).push({
            id: 'u3555459',
            container: id,
        });
        this.once(Events.MOUNTED, () => {
            $script('//cpro.baidustatic.com/cpro/ui/c.js');
        });
        return element;
    }
    private async createAD360(): Promise<JQuery> {
        const id = '_' + Math.random().toString(36).slice(2);
        const element = $(`<li id="${id}"></li>`);
        // 修改样式
        const node: HTMLStyleElement = document.createElement('style');
        node.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(node);
        const style = `
            .singleImage-title{
                height:36px;
                line-height:18px;
                margin-top:-4px;
                white-space:normal !important;
            }
            .singleImage-desc{
                display: none !important;
            }
            .singleImage .visited .singleImage-title,.singleImage-title:hover{
                color:#333 !important;
            }
        `;
        if (node['styleSheet']) {
            node['styleSheet'].cssText = style;
        } else {
            node.appendChild(document.createTextNode(style));
        }
        this.once(Events.MOUNTED, () => {
            $script('//static.mediav.com/js/mvf_news_feed.js', () => {
                const fn = window.NEWS_FEED;
                typeof fn === 'function' && fn({
                    placeholderId: id,
                    "w": "164",
                    "h": "62",
                    "inject": "define",
                    "showid": "tY9LMP",
                    "define": {
                        "displayImage": 1,
                        "imagePosition": "left",
                        "imageBorderRadius": 0,
                        "imageWidth": "66",
                        "imageHeight": "45",
                        "imageFill": "clip",
                        "displayTitle": 2,
                        "titleFontSize": "12",
                        "titleFontColor": "#333",
                        "titleFontFamily": "Microsoft Yahei",
                        "titleFontWeight": "normal",
                        "titlePaddingTop": "0",
                        "titlePaddingRight": 0,
                        "titlePaddingBottom": "0",
                        "titlePaddingLeft": "8",
                        "displayDesc": 1,
                        "descFontSize": "12",
                        "descFontColor": "#000",
                        "descFontFamily": "Microsoft Yahei",
                        "paddingTop": "8",
                        "paddingRight": 8,
                        "paddingBottom": "8",
                        "paddingLeft": "9",
                        "backgroundColor": "#FAFAFA",
                        "hoverColor": "#000"
                    }
                });
            });
        });
        return element;
    }
}

export default Hots;