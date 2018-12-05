import { generateHTMLAttribute } from "../../../Counter";
import placeholder, { generateImageAttribute, centerRun } from "../../../ImagePlaceholder";
import { CountType, NewsServerData, NewsChannel } from "../../../interfaces";
import render from "../../../Loading/Loading";
import { getNewsByID } from "../../../Server";
import { createScrollBar } from "../../../utils";
import AD from "../AD";
import DataHub from "./DataHub";
const throttle = require('throttle-debounce/throttle');
const Emitter = require('tiny-emitter');

enum NanoScrollerOnUpdateValueDirection {
    UP = 'up',
    DOWN = 'down',
}

interface NanoScrollerOnUpdateValue {
    position: number,
    maximum: number,
    direction: NanoScrollerOnUpdateValueDirection,
}

enum ItemType {
    SMALL = 1,      // 表示单图小图样式
    GROUP = 2,      // 表示组图样式
    LARGE = 3,      // 表示单图大图样式
    VIDEO = 4,      // 表示视频样式
}

enum NextLoadStatus {
    INITIALIZE,
    PENDING,
    LOADED,
}

enum Events {
    AFTER_INSERT_DOM = 'on-after-insert-dom',
}

class NewsFeed extends Emitter {
    private element: JQuery;
    private categoryID: number;
    private data: number[];
    private nextLoadStatus: NextLoadStatus;
    private isFirstRenderAD: boolean;
    constructor(element: JQuery, categoryID: number, data: number[]) {
        super();
        this.element = element;
        this.categoryID = categoryID;
        this.data = data;
        this.nextLoadStatus = NextLoadStatus.INITIALIZE;
        this.isFirstRenderAD = true;
    }
    public static async build(element: JQuery, categoryID: number, data: number[]): Promise<NewsFeed> {
        const instance = new this(element, categoryID, data);
        await instance.create();
        return instance;
    }
    private async create() {
        const { element, data } = this;
        if (!data || !data.length) {
            throw new Error('服务器数据出错.');
        }
        // 渲染结构
        element.html(`
            <div class="nano-content">
                <div class="tab-nf-news">
                    <div class="tab-nf-content"></div>
                    <div class="tab-nf-loading hidden"><div class="loading"><s></s><i></i><span>加载中...</span></div></div>
                    <div class="tab-nf-nomore hidden"><i></i></div>
                </div>
            </div>
        `).addClass('nano');
        // 创建滚动条
        createScrollBar(element);
        // 创建loading
        const loading = render();
        loading.appendTo(element.find('.nano-content'));
        loading.css('width', element.find('.tab-nf-news').innerWidth());
        // 追加内容
        await this.next();
        // 删除loading
        loading.remove();
        // 监听滚动
        const handle = throttle(50, (event: JQueryEventObject, values: NanoScrollerOnUpdateValue) => {
            const { position, maximum } = values;
            if (position > maximum - 50) {
                this.next();
            }
        });
        element.on('update', handle);
        // 更新滚动条
        this.on(Events.AFTER_INSERT_DOM, () => {
            element.nanoScroller();
        });
    }
    private async next() {
        // 加锁
        if (this.nextLoadStatus === NextLoadStatus.PENDING) return;
        this.nextLoadStatus = NextLoadStatus.PENDING;

        const { element, categoryID, data } = this;
        element.find('.tab-nf-loading').removeClass('hidden');
        if (data.length) {
            // 编译广告
            let renderAD;
            if (this.isFirstRenderAD) {
                this.isFirstRenderAD = false;
                renderAD = AD.small.compile(categoryID, element);
            } else {
                renderAD = AD.mixin.compile(categoryID, element);
            }
            // 取前6个数据
            const ids = data.splice(0, 6);
            const promises = [];
            for (let i = 0; i < ids.length; i++) {
                promises.push(getNewsByID(ids[i]).catch(() => null));
            }
            const items = await Promise.all(promises);
            // 渲染
            const elements = this.render(items);
            if (elements.length) {
                const ul = $('<ul></ul>').append(elements);
                element.find('.tab-nf-content').append(ul);
                // 图片占位
                placeholder(elements.find('img'), centerRun);
                // 渲染广告
                renderAD && renderAD(ul);
                // 发送渲染完成消息
                setTimeout(() => this.emit(Events.AFTER_INSERT_DOM));
            }
            // 如果没有数据了，显示提示
            if (!data.length) {
                element.find('.tab-nf-nomore').removeClass('hidden');
            }
        }
        element.find('.tab-nf-loading').addClass('hidden');

        // 解锁
        this.nextLoadStatus = NextLoadStatus.LOADED;
    }
    private render(data: NewsServerData[]): JQuery {
        let elements = $();
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (!item || item.channelId !== NewsChannel.QIHOO) continue;
            const clickcount = generateHTMLAttribute({
                type: CountType.NEWS_FEED_360_PROCESS,
                id: item.id,
                channelId: item.channelId,
                category: this.categoryID,
            });
            let element;
            if (item.type === ItemType.SMALL) {
                element = $(`
                    <li class="tab-nf-sign">
                        <a href="${item.linkURL}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <div class="tab-nf-img"><img ${generateImageAttribute('120x68', item.images[0])}></div>
                            <div class="tab-nf-info">${item.from || ''}</div>
                        </a>
                    </li>
                `);
            } else if (item.type === ItemType.GROUP) {
                const { images } = item;
                let imageHTML = $.map(images, (img) => {
                    return `<li><img ${generateImageAttribute('120x68', img)}></li>`;
                }).join('');
                if (images.length === 3) {
                    imageHTML += `<li><span class="tab-nf-more">查看更多</span></li>`;
                }
                element = $(`
                    <li class="tab-nf-multi">
                        <a href="${item.linkURL}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <ul class="tab-nf-imgs">${imageHTML}</ul>
                            <div class="tab-nf-info">${item.from || ''}</div>
                        </a>
                    </li>
                `);
            } else if (item.type === ItemType.LARGE) {
                element = $(`
                    <li class="tab-nf-large">
                        <a href="${item.linkURL}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <div class="tab-nf-img"><img ${generateImageAttribute('498x168', item.images[0])}></div>
                            <div class="tab-nf-info">${item.from || ''}</div>
                        </a>
                    </li>
                `);
            } else if (item.type === ItemType.VIDEO) {
                // TODO...
            }
            if (element) {
                elements = elements.add(element);
                this.once(Events.AFTER_INSERT_DOM, () => {
                    // 打点曝光
                    DataHub.singleton.supervise(element, item, this.element);
                });
            }
        }
        return elements.filter('li');
    }
}

export default NewsFeed;