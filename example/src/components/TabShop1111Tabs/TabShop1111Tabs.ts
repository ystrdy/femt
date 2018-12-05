import TabComponent from "../TabComponent/TabComponent";
import { getContent, getADByID } from "../Server";
import { Shop1111TabsServerData, ADServerData, CountType } from "../interfaces";
import { generateHTMLAttribute } from "../Counter";

interface Item {
    name: string,
    data: number[],
    head: JQuery,
    body?: JQuery,
}

class TabShop1111Tabs extends TabComponent {
    protected items: Item[] = [];
    private current: Item;
    protected async render(): Promise<void> {
        const { element, categoryData } = this;
        // 获取数据
        const data: Shop1111TabsServerData = await getContent(categoryData);
        if (!data || !data.length) {
            throw new Error('服务器数据出错.');
        }
        // 渲染结构
        const tabNames = ['首页', '女装', '母婴', '数码', '必备', '美妆', '零食', '女鞋', '男装', '内衣'];
        let headers = $();
        for (let i = 0; i < data.length; i++) {
            const ids = data[i];
            const name = tabNames[i];
            if (ids && ids.length && name) {
                const head = $(`<span>${name}</span>`);
                headers = headers.add(head);
                this.items.push({ name, data: ids, head });
                // 鼠标划入，切换
                let tID;
                head.on('mouseenter', () => tID = setTimeout(() => this.select(i), 350));
                head.on('mouseleave', () => clearTimeout(tID));
            }
        }
        const wrap = $(`
            <div class="tab-shop-1111-tabs">
                <div class="tab-s1t-head">
                    <div class="tab-s1t-nav"></div>
                    <a href="//s.click.taobao.com/JurbMKw"></a>
                </div>
                <div class="tab-s1t-body"></div>
            </div>
        `);
        wrap.find('.tab-s1t-nav').append(headers);
        wrap.appendTo(element);
        // 显示第一个tab页
        this.select(0);
    }
    protected select(index: number) {
        const { element, items } = this;
        const selected = items[index];
        if (!selected) return;
        if (selected === this.current) return;
        this.current = selected;
        // 隐藏
        for (let i = 0; i < items.length; i++) {
            const { head, body } = items[i];
            head && head.removeClass('cur');
            body && body.removeClass('cur');
        }
        // 显示
        const { head, body } = selected;
        head && head.addClass('cur');
        if (body) {
            body.addClass('cur');
        } else {
            if (index === 0) {        // 首页
                selected.body = this.renderHome(selected);
            } else {
                selected.body = this.renderNormal(selected);
            }
            element.find('.tab-s1t-body').append(selected.body.addClass('cur'));
        }
    }
    private renderNormal({ data, name }: Item): JQuery {
        const element = $('<div class="tab-s1t-panel"></div>');
        // 获取数据
        const promises = [];
        for (let i = 0; i < data.length; i++) {
            const id = data[i];
            const promise = getADByID(id).catch(() => null);
            promises.push(promise);
        }
        // 渲染
        Promise.all(promises).then((items: ADServerData[]) => {
            const { categoryData } = this;
            let elements = $();
            // 第1个到第4个
            let temp = items.slice(0, 4);
            let html = '';
            for (let i = 0; i < temp.length; i++) {
                const item = temp[i];
                if (!item) continue;
                const clickcount = generateHTMLAttribute({
                    type: CountType.SHOP_1111_TBAS,
                    id: item.id,
                    channelId: item.channelId,
                    category: categoryData.id,
                });
                html += `
                    <a href="${item.linkURL}" ${clickcount}>
                        <img src="${item.image}">
                        <h3>${item.title}</h3>
                    </a>
                `;
            }
            elements = elements.add(`<div class="tab-s1t-grid">${html}</div>`);
            // 第5个和第6个
            let temp4 = items[4];
            let html4 = '';
            if (temp4) {
                const clickcount = generateHTMLAttribute({
                    type: CountType.SHOP_1111_TBAS,
                    id: temp4.id,
                    channelId: temp4.channelId,
                    category: categoryData.id,
                });
                html4 = `
                    <a class="tab-s1t-ad" href="${temp4.linkURL}" ${clickcount}>
                        <img src="${temp4.image}">
                    </a>
                `;
            }
            let temp5 = items[5];
            let html5 = '';
            if (temp5) {
                const content: string = temp5['extended1'];
                const parts = content.split(/\n/g);
                const hots = [];
                for (let i = 0; i < parts.length; i++) {
                    const min = 1E5;
                    const max = 5E5;
                    const hot = Math.floor(Math.random() * (max - min)) + min;
                    hots.push(hot);
                }
                hots.sort((a, b) => b - a);
                for (let i = 0; i < parts.length; i++) {
                    const [ title, link ] = parts[i].split('|');
                    const clickcount = generateHTMLAttribute({
                        type: CountType.SHOP_1111_TBAS,
                        id: temp5.id,
                        channelId: temp5.channelId,
                        category: categoryData.id,
                    });
                    html5 += `
                        <li><a href="${link}" ${clickcount}><i>${hots[i]}</i>${title}</a></li>
                    `;
                }
            }
            elements = elements.add(`
                <div class="tab-s1t-side">
                    <div class="tab-s1t-rank">
                        <h2>${name}热买榜</h2>
                        <ul>${html5}</ul>
                    </div>
                    ${html4}
                </div>
            `);
            // 插入DOM树
            element.append(elements);
        });
        return element;
    }
    private renderHome({ data }: Item): JQuery {
        const element = $(`
            <div class="tab-s1t-panel home">
                <a href="//s.click.taobao.com/JurbMKw" class="tab-s1t-home-to"></a>
                <a class="tab-s1t-home-go" href="//s.click.taobao.com/JurbMKw"></a>
            </div>
        `);
        // 获取数据
        const promises = [];
        for (let i = 0; i < data.length; i++) {
            const id = data[i];
            const promise = getADByID(id).catch(() => null);
            promises.push(promise);
        }
        // 渲染
        Promise.all(promises).then((items: ADServerData[]) => {
            const { categoryData } = this;
            let elements = $();
            // 第1个和第2个
            let temp = items.slice(0, 2);
            let html = '';
            for (let i = 0; i < temp.length; i++) {
                const item = temp[i];
                if (!item) continue;
                const clickcount = generateHTMLAttribute({
                    type: CountType.SHOP_1111_TBAS,
                    id: item.id,
                    channelId: item.channelId,
                    category: categoryData.id,
                });
                html += `
                    <a href="${item.linkURL}" ${clickcount}>
                        <img src="${item.image}">
                    </a>
                `;
            }
            elements = elements.add(`<div class="tab-s1t-home-rec">${html}</div>`);
            // 第3个和第4个
            temp = items.slice(2, 4);
            for (let i = 0; i < temp.length; i++) {
                const item = temp[i];
                if (!item) continue;
                const clickcount = generateHTMLAttribute({
                    type: CountType.SHOP_1111_TBAS,
                    id: item.id,
                    channelId: item.channelId,
                    category: categoryData.id,
                });
                const className = i ? 'tab-s1t-home-sale' : 'tab-s1t-home-hot';
                elements = elements.add(`
                    <a class="${className}" href="${item.linkURL}" ${clickcount}>
                        <img src="${item.image}">
                    </a>
                `);
            }
            // 第5个之后都是滚动图的
            temp = items.slice(4);
            html = '';
            for (let i = 0; i < temp.length; i++) {
                const item = temp[i];
                if (!item) continue;
                const clickcount = generateHTMLAttribute({
                    type: CountType.SHOP_1111_TBAS,
                    id: item.id,
                    channelId: item.channelId,
                    category: categoryData.id,
                });
                const hots = (Math.random() * (10 - 3) + 3).toFixed(1);    // 3-10万随机，保留1位小数
                html += `
                    <li><a href="${item.linkURL}" ${clickcount}>
                        <img src="${item.image}">
                        <h3>${hots}万人已<i>加入购物车</i></h3>
                    </a></li>
                `;
            }
            elements = elements.add(`
                <div class="tab-s1t-home-carousel">
                    <ul>${html}</ul>
                </div>
            `);
            // 插入DOM树
            element.append(elements);
            // 创建滚动图
            if (temp.length > 3) {      // 多于3个才创建
                const slider = element.find('.tab-s1t-home-carousel');
                slider.jcarousel({
                    wrap: 'circular',
                })
                .jcarouselAutoscroll({
                    interval:  3000,
                })
                .hover(() => {
                    slider.addClass('hover').jcarouselAutoscroll('stop');
                }, () => {
                    slider.removeClass('hover').jcarouselAutoscroll('start');
                });
            }
            // 创建倒计时
            const timer = $('<div class="tab-s1t-home-timer"></div>');
            const min = 2.5 * 3600      // 2.5-5小时
            const max = 5 * 3600;
            const from = Math.round(Math.random() * (max - min) + min);
            const start = new Date();
            let old;
            const format = (v: number) => (0..toFixed(2) + v).slice(-2);
            const fn = () => {
                const now = new Date();
                let remind = from - Math.floor((now.getTime() - start.getTime()) / 1000);
                if (remind <= 0) {
                    clearInterval(tID);
                    remind = 0;
                }
                if (old !== remind) {
                    old = remind;
                    // 显示
                    const h = Math.floor(remind / 3600);
                    const m = Math.floor((remind - h * 3600) / 60);
                    const s = Math.floor(remind - h * 3600 - m * 60);
                    timer.html(`
                        <span>${format(h)}</span>
                        <span>${format(m)}</span>
                        <span>${format(s)}</span>
                    `);
                }
            };
            setTimeout(fn, 10);     // IE下延迟一下
            const tID = setInterval(fn, 100);
            element.append(timer);
        });
        return element;
    }
}

export default TabShop1111Tabs;