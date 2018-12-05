import TabComponent from "../TabComponent/TabComponent";
import { ShopGridServerData, ADServerData, CountType } from "../interfaces";
import { getContent, getADByID } from "../server";
import { generateHTMLAttribute } from "../Counter";
import placeholder, { generateImageAttribute } from "../ImagePlaceholder";
import { createScrollBar } from "../utils";

class TabShopGrid extends TabComponent {
    protected async render(): Promise<void> {
        const { element, categoryData } = this;
        // 获取数据
        const data: ShopGridServerData = await getContent(categoryData);
        if (!data || !data.ids || !data.ids.length) {
            throw new Error('服务器数据出错.');
        }
        const promises = [];
        for (let i = 0; i < data.ids.length; i++) {
            const id = data.ids[i];
            const promise = getADByID(id).catch(() => null);
            promises.push(promise);
        }
        const items: ADServerData[] = await Promise.all(promises);
        // 渲染
        let html = '';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;
            const clickcount = generateHTMLAttribute({
                type: CountType.SHOP_GRID,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            html += `
                <li><a href="${item.linkURL}" ${clickcount}><img ${generateImageAttribute('332x136', item.image)}></a></li>
            `;            
        }
        const wrap = $(`
            <div class="tab-shop-grid nano">
                <div class="nano-content">
                    <ul>${html}</ul>
                </div>
            </div>
        `);
        element.append(wrap);
        // 滚动条
        createScrollBar(wrap);
        setTimeout(() => wrap.nanoScroller(), 100);
        // 图片占位
        placeholder(wrap.find('img'));
    }
}

export default TabShopGrid;