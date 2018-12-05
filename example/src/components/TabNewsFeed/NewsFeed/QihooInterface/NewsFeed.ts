import { generateHTMLAttribute } from "../../../Counter";
import placeholder, { generateImageAttribute, centerRun } from "../../../ImagePlaceholder";
import { CategoryServerData, CountType } from "../../../interfaces";
import render from "../../../Loading/Loading";
import { createScrollBar, to, isdev } from "../../../utils";
import AD from "../AD";
import DataHub, { ItemData, ItemType } from "./DataHub";
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
    private categoryData: CategoryServerData;
    private dataHub: DataHub;
    private nextLoadStatus: NextLoadStatus;
    constructor(element: JQuery, categoryData: CategoryServerData) {
        super();
        this.element = element;
        this.categoryData = categoryData;
        this.dataHub = DataHub.singleton;
        this.nextLoadStatus = NextLoadStatus.INITIALIZE;
    }
    public static async build(element: JQuery, categoryData: CategoryServerData): Promise<NewsFeed> {
        const instance = new this(element, categoryData);
        await instance.create();
        return instance;
    }
    private async create() {
        const { element } = this;
        // 渲染结构
        element.html(`
            <div class="nano-content">
                <div class="tab-nf-news">
                    <div class="tab-nf-content"></div>
                    <div class="tab-nf-loading hidden"><div class="loading"><s></s><i></i><span>加载中...</span></div></div>
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

        const { element, categoryData, dataHub } = this;
        const { id } = categoryData;
        element.find('.tab-nf-loading').removeClass('hidden');
        // 编译广告
        const renderAD = AD.mixin.compile(id, element);
        // 渲染新闻
        const [ error, data ] = await to(dataHub.request(id));
        if (!error && data && data.length ) {
            // 渲染
            const elements = this.render(data);
            if (elements.length) {
                const ul = $('<ul></ul>').append(elements);
                element.find('.tab-nf-content').append(ul);
                // 图片占位
                placeholder(elements.find('img'), centerRun);
                // 渲染广告
                renderAD(ul);
                // 发送渲染完成消息
                setTimeout(() => this.emit(Events.AFTER_INSERT_DOM));
            }
        }
        element.find('.tab-nf-loading').addClass('hidden');

        // 解锁
        this.nextLoadStatus = NextLoadStatus.LOADED;
    }
    private render(data: ItemData[]): JQuery {
        const { categoryData, dataHub } = this;
        let elements = $();
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const clickcount = generateHTMLAttribute({
                type: CountType.NEWS_FEED_360_INTERFACE,
                id: -1,
                channelId: 3,
                category: categoryData.id,
            });
            let element;
            if (item.type === ItemType.SMALL) {
                element = $(`
                    <li class="tab-nf-sign">
                        <a href="${item.curl}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <div class="tab-nf-img"><img ${generateImageAttribute('120x68', item.img)}></div>
                            <div class="tab-nf-info">${item.src}</div>
                        </a>
                    </li>
                `);
            } else if (item.type === ItemType.GROUP) {
                const { assets } = item;
                if (!assets || !assets.length) continue;
                let imageHTML = $.map(assets, ({ img }) => {
                    return `<li><img ${generateImageAttribute('120x68', img)}></li>`;
                }).join('');
                if (item.assets.length === 3) {
                    imageHTML += `<li><span class="tab-nf-more">查看更多</span></li>`;
                }
                element = $(`
                    <li class="tab-nf-multi">
                        <a href="${item.curl}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <ul class="tab-nf-imgs">${imageHTML}</ul>
                            <div class="tab-nf-info">${item.src}</div>
                        </a>
                    </li>
                `);
            } else if (item.type === ItemType.LARGE) {
                const { assets } = item;
                if (!assets || !assets.length) continue;
                const image = assets[0];
                if (!image.curl || !image.img) continue;
                element = $(`
                    <li class="tab-nf-large">
                        <a href="${image.curl}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <div class="tab-nf-img"><img ${generateImageAttribute('498x168', image.img)}></div>
                            <div class="tab-nf-info">${item.src}</div>
                        </a>
                    </li>
                `);
            } else if (item.type === ItemType.VIDEO) {
                // TODO...
            }
            if (element) {
                elements = elements.add(element);
                // 打点曝光
                this.once(Events.AFTER_INSERT_DOM, () => {
                    dataHub.supervise(element, item, this.element);
                });
            }
        }
        return elements.filter('li');
    }
}

export default NewsFeed;