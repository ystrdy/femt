import { CategoryServerData, TabComponentType } from "../interfaces";
import TabComponent from "../TabComponent/TabComponent";
import TabShopCarousel from "../TabShopCarousel/TabShopCarousel";
import TabNewsFeed from "../TabNewsFeed/TabNewsFeed";
import TabShopGrid from "../TabShopGrid/TabShopGrid";
import TabDiscountCoupon from "../TabDiscountCoupon/TabDiscountCoupon";
import TabGameStyle from "../TabGameStyle/TabGameStyle";
import TabShop1111Tabs from "../TabShop1111Tabs/TabShop1111Tabs";
import TabNewsFeed360Interface from "../TabNewsFeed/TabNewsFeed360Interface";
import TabNewsFeed360Process from "../TabNewsFeed/TabNewsFeed360Process";
import render from "../NetworkError/NetworkError";

const Emitter = require('tiny-emitter');

interface Item {
    data: CategoryServerData,
    head: JQuery,
    body: JQuery,
    tabComponent?: TabComponent,
}

enum Events {
    CHANGE = 'onchange',
}

class IndexTabs extends Emitter {
    private element: JQuery;
    private data: CategoryServerData[];
    private items: Item[];
    public static Events = Events;
    constructor(element: JQuery, data: CategoryServerData[]) {
        super();
        
        this.element = element;
        this.data = data;
        this.items = [];

        this.create();
    }
    private create() {
        const { element, data, items } = this;
        // 渲染
        let headHTML = '';
        let bodyHTML = '';
        for (let i = 0; i < data.length; i++) {
            const { name } = data[i];
            headHTML += `<li><span>${name.split(/-/g)[0]}</span></li>`;
            bodyHTML += `<div class="it-panel"></div>`;
        }
        element.append(`
            <div class="index-tabs">
                <ul class="it-head">${headHTML}</ul>
                <div class="it-body">${bodyHTML}</div>
            </div>
        `);
        // 保存数据
        const head = element.find('.it-head li');
        const body = element.find('.it-panel');
        for (let i = 0; i < data.length; i++) {
            items.push({
                data: data[i],
                head: head.eq(i),
                body: body.eq(i),
            });
            // 鼠标移入350ms后，切换tab页
            let tID;
            head.eq(i)
                .on('mouseenter', () => tID = setTimeout(() => this.select(i), 350))
                .on('mouseleave', () => clearTimeout(tID));
            // 点击切换
            // head.eq(i).on('click', () => this.select(i));
        }
    }
    private createTabComponent(container: JQuery, data: CategoryServerData): TabComponent {
        const { dataType } = data;
        let instance: TabComponent;
        switch (dataType) {
            case TabComponentType.NEWS_FEED:
                instance = new TabNewsFeed(container, data);
                break;
            case TabComponentType.SHOP_CAROUSEL:
                instance = new TabShopCarousel(container, data);
                break;
            case TabComponentType.SHOP_GRID:
                instance = new TabShopGrid(container, data);
                break;
            case TabComponentType.DISCOUNT_COUPON:
                instance = new TabDiscountCoupon(container, data);
                break;
            case TabComponentType.GAME_STYLE:
                instance = new TabGameStyle(container, data);
                break;
            case TabComponentType.SHOP_1111_TBAS:
                instance = new TabShop1111Tabs(container, data);
                break;
            case TabComponentType.NEWS_FEED_360_PROCESS:
                instance = new TabNewsFeed360Process(container, data);
                break;
            case TabComponentType.NEWS_FEED_360_INTERFACE:
                instance = new TabNewsFeed360Interface(container, data);
                break;
        }
        if (instance) {
            instance.create && instance.create().then(() => {
                // 创建完成
            });
        } else {
            // 渲染错误页
            container.append(render());
            console.error(`"${data.name}"分类无效,无效的dataType值.`);
        }
        return instance;
    }
    /**
     * 切换显示的tab页
     * @param index tab页索引
     */
    public select(index: number) {
        const { items } = this;
        const item = items[index];
        if (!item) return;
        for (let i = 0; i < items.length; i++) {
            const { head, body, tabComponent, data } = items[i];
            if (index === i) {
                head.addClass('cur');
                body.addClass('cur');
                if (!tabComponent) {
                    items[i].tabComponent = this.createTabComponent(body, data);
                }
                this.emit(Events.CHANGE, items[i], i);
            } else {
                head.removeClass('cur');
                body.removeClass('cur');
            }
        }
    }
}

export default IndexTabs;