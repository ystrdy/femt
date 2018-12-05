import { isdev } from "../../utils";
import { generateHTMLAttribute } from "../../Counter";
import { CountType } from "../../interfaces";
import placeholder, { generateImageAttribute } from "../../ImagePlaceholder";
import AD360, { ADData, ADType } from "../../AD360";

class AD extends AD360 {
    // 单图广告
    public static small = isdev() ? new AD('lqsYyv') : new AD('C1NFIy');
    // 混合广告
    public static mixin = isdev() ? new AD('dujNK0') : new AD('j9yRKV');
    private render(categoryID: number, data: ADData[]): JQuery {
        let html = '';
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const clickcount = generateHTMLAttribute({
                type: CountType.NEWS_FEED_AD360,
                id: -1,
                channelId: 3,
                category: categoryID,
            });
            if (item.type === ADType.SMALL) {
                html += `
                    <li class="tab-nf-sign">
                        <a href="${item.curl}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <div class="tab-nf-img"><img ${generateImageAttribute('120x68', item.img)}></div>
                            <div class="tab-nf-info"><i class="tab-nf-ad-tag">广告</i>${item.src}</div>
                        </a>
                    </li>
                `;
            } else if (item.type === ADType.GROUP) {
                let imageHTML = $.map(item.assets, ({ img }) => {
                    return `<li><img ${generateImageAttribute('120x68', img)}></li>`;
                }).join('');
                if (item.assets.length === 3) {
                    imageHTML += `<li><span class="tab-nf-more">查看更多</span></li>`;
                }
                html += `
                    <li class="tab-nf-multi">
                        <a href="${item.curl}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <ul class="tab-nf-imgs">${imageHTML}</ul>
                            <div class="tab-nf-info"><i class="tab-nf-ad-tag">广告</i>${item.src}</div>
                        </a>
                    </li>
                `;
            } else if (item.type === ADType.LARGE) {
                html += `
                    <li class="tab-nf-large">
                        <a href="${item.curl}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <div class="tab-nf-img"><img ${generateImageAttribute('498x168', item.img)}></div>
                            <div class="tab-nf-info"><i class="tab-nf-ad-tag">广告</i>${item.src}</div>
                        </a>
                    </li>
                `;
            } else if (item.type === ADType.VIDEO) {
                // TODO...
            }
        }
        return $(html).filter('li');
    }
    // 编译广告
    public compile(categoryID: number, nanoscroller: JQuery): (element: JQuery) => void {
        let cache: any = {};
        const render = (element, data) => {
            // 保存数据
            element && (cache.element = element);
            data && (cache.data = data);
            // 校验数据，只有满足下面3个条件，才能渲染
            if (!cache.data || !cache.data.length) return;      // 没有广告数据，不渲染
            if (!cache.element) return;     // 没有插入位置，不渲染
            if (!cache.element.parent().length) return; // 不在页面中，不渲染
            element = cache.element;
            data = cache.data;
            // 渲染
            const children = element.children('li');
            const elements = this.render(categoryID, data);
            // 添加到页面，在第4、8个后面或者最后插入广告
            const me = this;
            elements.each(function (index: number) {
                const position = index * 3 + 2;
                if (position < children.length) {
                    children.eq(position).after(this);
                } else {
                    element.append(this);
                }
                // 开启广告监测
                setTimeout(() => {
                    me.supervise($(this), data[index], nanoscroller);
                });
            });
            // 图片占位
            placeholder(elements.find('img[data-src]'));
        };
        this.requestAD().then(data => render(null, data)).catch(() => null);
        return (element: JQuery): void => render(element, null);
    }
}

export default AD;