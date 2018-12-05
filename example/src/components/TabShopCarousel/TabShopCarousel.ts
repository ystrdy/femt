import TabComponent from "../TabComponent/TabComponent";
import { ShopCarouselServerData, ADServerData, CountType } from "../interfaces";
import { getContent, getADByID } from "../Server";
import { generateHTMLAttribute } from "../Counter";
import ShopQRCode from "../ShopQRCode/ShopQRCode";
import placeholder, { generateImageAttribute } from "../ImagePlaceholder";

class TabShopCarousel extends TabComponent {
    protected async render(): Promise<void> {
        const { element, categoryData } = this;
        // 获取数据
        const data: ShopCarouselServerData = await getContent(categoryData);
        if (!data) {
            throw new Error('服务器数据出错.');
        }
        const keys = ['carousel', 'tmall', 'righttop', 'hot'];
        const promises = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const p = [];
            for (let i = 0; i < data[key].length; i++) {
                const id = data[key][i];
                const promise = getADByID(id).catch(() => null);
                p.push(promise);
            }
            promises.push(Promise.all(p));
        }
        let [carousel, tmall, righttop, hot] = await Promise.all(promises);
        // 渲染
        let carouselHTML = '';
        for (let i = 0; i < carousel.length; i++) {
            const item: ADServerData = carousel[i];
            if (!item) continue;
            const clickcount = generateHTMLAttribute({
                type: CountType.SHOP_CAROUSEL,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            carouselHTML += `
                <li><a href="${item.linkURL}" ${clickcount}>
                    <img ${generateImageAttribute('512x276', item.image)}>
                </a></li>
            `;
        }
        let tmallHTML = '';
        for (let i = 0; i < tmall.length; i++) {
            const item: ADServerData = tmall[i];
            if (!item) continue;
            const clickcount = generateHTMLAttribute({
                type: CountType.SHOP_CAROUSEL,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            tmallHTML += `
                <a href="${item.linkURL}" ${clickcount}><img ${generateImageAttribute('242x150', item.image)}></a>
            `;
        }
        let righttopHTML = '';
        for (let i = 0; i < righttop.length; i++) {
            const item: ADServerData = righttop[i];
            if (!item) continue;
            const clickcount = generateHTMLAttribute({
                type: CountType.SHOP_CAROUSEL,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            righttopHTML += `
                <a class="tab-spa-large" href="${item.linkURL}" ${clickcount}><img ${generateImageAttribute('158x276', item.image)}></a>
            `;
        }
        let hotHTML = '';
        for (let i = 0; i < hot.length; i++) {
            const item: ADServerData = hot[i];
            if (!item) continue;
            const clickcount = generateHTMLAttribute({
                type: CountType.SHOP_CAROUSEL,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            hotHTML += `
                <a class="tab-spa-small" href="${item.linkURL}" ${clickcount}><img ${generateImageAttribute('158x186', item.image)}></a>
            `;
        }
        const wrap = $(`
            <div class="tab-sp-main">
                <div class="tab-sp-carousel">
                    <div class="tab-sp-view">
                        <ul>${carouselHTML}</ul>
                    </div>
                    <div class="tab-sp-arrow">
                        <span class="tab-sp-prev"></span>
                        <span class="tab-sp-next"></span>
                    </div>
                    <div class="tab-sp-dots">
                        <div class="inner"></div>
                    </div>
                </div>
                <div>
                    <div class="tab-sp-hd">
                        <i>TMALL天猫</i>
                        <span>理想生活上天猫</span>
                    </div>
                    <div class="tab-sp-bd">${tmallHTML}</div>
                </div>
            </div>
            <div class="tab-sp-aside">
                ${righttopHTML}
                <h3 class="tab-spa-tit">今日热卖</h3>
                ${hotHTML}
            </div>
        `);
        element.append(wrap);
        // 创建焦点图
        setTimeout(() => this.createSlider());
        // 图片占位
        placeholder(element.find('img'));
    }
    private createSlider() {
        const { element } = this;
        const viewElement = element.find('.tab-sp-view');
        viewElement.jcarousel({
                wrap: 'circular',
            })
            .jcarouselAutoscroll({
                interval: 3000,
                target: '+=1',
                autostart: true,
            });
        element.hover(() => {
            viewElement.jcarouselAutoscroll('stop');
        }, () => {
            viewElement.jcarouselAutoscroll('start');
        });
        element.find('.tab-sp-prev').jcarouselControl({
            target: '-=1'
        });
        element.find('.tab-sp-next').jcarouselControl({
            target: '+=1'
        });
        element.find('.tab-sp-dots .inner')
            .on('jcarouselpagination:active', 'a', function() {
                $(this).addClass('cur');
            })
            .on('jcarouselpagination:inactive', 'a', function() {
                $(this).removeClass('cur');
            })
            .on('click', 'a', (event: JQueryEventObject) => event.preventDefault())
            .jcarouselPagination();
    }
}

export default TabShopCarousel;