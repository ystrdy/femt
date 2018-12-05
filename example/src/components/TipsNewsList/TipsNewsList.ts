import { TipsNewsListServerData, CountType } from "../interfaces";
import { getNewsByID } from "../Server";
import AD360 from "../AD360";
import { isdev, to } from "../utils";
import { generateHTMLAttribute } from "../Counter";
import placeholder, { SIZE, generateImageAttribute } from "../ImagePlaceholder";
import { invoke, Names } from "../Client";
const shuffle = require('knuth-shuffle').knuthShuffle;

class AD extends AD360 {
    public static small = isdev() ? new AD('lqsYyv') : new AD('toEGhL');
    public async render(): Promise<JQuery> {
        const [ error, data ] = await to(this.requestAD(1));
        if (error || !data) return null;
        let elements = $();
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const clickcount = generateHTMLAttribute({
                type: CountType.NEWS_FEED_AD360,
                id: -1,
                channelId: 3,
                category: -1,
            });
            const element = $(`
                <li class="nl-single"><a href="${item.curl}" ${clickcount}>
                    <h3 class="nl-title">${item.title}</h3>
                    <div class="nl-pics">
                        <img src="${SIZE._94x58}" ${generateImageAttribute('94x58', item.img)}>
                    </div>
                    <div class="nl-info">${item.src}</div>
                </a></li>
            `);
            element.data('data', item);
            elements = elements.add(element);
        }
        return elements.filter('li');
    }
}

class TipsNewsList {
    private element: JQuery;
    private data: TipsNewsListServerData;
    constructor(element: JQuery, data: TipsNewsListServerData) {
        this.element = element;
        this.data = data;
    }
    public static async build(element: JQuery, data: TipsNewsListServerData): Promise<TipsNewsList> {
        const instance = new this(element, data);
        await instance.create();
        return instance;
    }
    private async create() {
        // 渲染
        const [ list, ad ] = await Promise.all([
            // 渲染新闻
            this.render(),
            // 渲染广告
            AD.small.render(),
        ]);
        // 排序
        const result = this.sort(list, ad);
        // 创建
        const wrap = $(`
            <div class="news-list">
                <div class="nl-head">
                    <h2>FF新鲜事-Flash助手推荐</h2>
                    <span class="nl-close"></span>
                    <span class="nl-no-longer">不再弹出</span>
                </div>
                <div class="nl-body">
                    <ul class="nl-list"></ul>
                </div>
            </div>
        `);
        wrap.on('click', '.nl-no-longer', () => {
            invoke(Names.NOLONGERPOPUP);
        }).on('click', '.nl-close', () => {
            invoke(Names.QUIT);
        });
        const { element } = this;
        wrap.find('.nl-list').append(result);
        element.append(wrap);
        // 图片占位
        placeholder(wrap.find('img'));
        // 开启广告监测
        ad.each(function () {
            AD.small.supervise($(this), $(this).data('data'), element);
        });
    }
    private sort(list: JQuery, ad: JQuery): JQuery {
        // 乱序，确保多图和广告必须在前4个
        const singles = shuffle(list.filter('.nl-single').get());
        const last = singles.pop();
        const doms = [
            ...list.filter(':not(.nl-single)').get(),
            ...singles,
            ...ad.get(),
        ];
        return $([ ...shuffle(doms), last ]);   
    }
    private async render(): Promise<JQuery> {
        const { data } = this;
        // 获取数据
        const promises = [];
        for (let i = 0; i < data.news.length; i++) {
            promises.push(getNewsByID(data.news[i]).catch(v => null));
        }
        const items = await Promise.all(promises);
        // 渲染
        let html = '';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;
            const clickcount = generateHTMLAttribute({
                type: CountType.TIPS,
                id: item.id,
                channelId: item.channelId,
                category: -1,
            });
            const { images } = item;
            if (images.length <= 1) {
                html += `
                    <li class="nl-single"><a href="${item.linkURL}" ${clickcount}>
                        <h3 class="nl-title">${item.title}</h3>
                        <div class="nl-pics">
                            <img src="${SIZE._94x58}" ${generateImageAttribute('94x58', item.images[0])}>
                        </div>
                        <div class="nl-info">${item.from}</div>
                    </a></li>
                `;
            } else {
                let imageHTML = $.map(images, image => {
                    return `<img src="${SIZE._94x58}" ${generateImageAttribute('94x58', image)}>`;
                }).join('');
                html += `
                    <li class="nl-group"><a href="${item.linkURL}" ${clickcount}>
                        <h3 class="nl-title">${item.title}</h3>
                        <div class="nl-pics">${imageHTML}</div>
                        <div class="nl-info">${item.from}</div>
                    </a></li>
                `;
            }
        }
        return $(html).filter('li');
    }
}

export default TipsNewsList;