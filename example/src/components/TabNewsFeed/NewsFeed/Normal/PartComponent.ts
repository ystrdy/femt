import DataHub from "./DataHub";
import { generateHTMLAttribute } from "../../../Counter";
import { CountType } from "../../../interfaces";
import placeholder, { generateImageAttribute } from "../../../ImagePlaceholder";
const Emitter = require('tiny-emitter');

abstract class PartComponent extends Emitter {
    protected element: JQuery;
    protected datahub: DataHub;
    protected nanoscroller: JQuery;
    protected loading: JQuery;
    constructor(element: JQuery, datahub: DataHub, nanoscroller: JQuery) {
        super();
        this.element = element;
        this.datahub = datahub;
        this.nanoscroller = nanoscroller;
    }
    public abstract async create(ids: number[]);
    protected async render(ids: number[]): Promise<JQuery> {
        // 获取数据
        const { datahub } = this;
        const data = await datahub.getNewsByIDs(ids);
        // 没有最新的数据了，直接返回，不渲染
        if (!data.length) {
            return null;
        }
        // 渲染
        let html = '';
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const clickcount = generateHTMLAttribute({
                type: CountType.NEWS_FEED_NEWS,
                id: item.id,
                channelId: item.channelId,
                category: datahub.categoryID,
            });
            if (item.images.length <= 0) {
                html += `
                    <li class="tab-nf-none">
                        <a href="${item.linkURL}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <div class="tab-nf-info">${item.from}</div>
                        </a>
                    </li>
                `;
            } else if (item.images.length <= 2) {
                html += `
                    <li class="tab-nf-sign">
                        <a href="${item.linkURL}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <div class="tab-nf-img"><img ${generateImageAttribute('120x68', item.images[0])}></div>
                            <div class="tab-nf-info">${item.from}</div>
                        </a>
                    </li>
                `;
            } else {
                let imagesHTML = $.map(item.images, image => `
                    <li><img ${generateImageAttribute('120x68', image)}></li>
                `).join('');
                if (item.images.length === 3) {
                    imagesHTML += `<li><span class="tab-nf-more">查看更多</span></li>`;
                }
                html += `
                    <li class="tab-nf-multi">
                        <a href="${item.linkURL}" ${clickcount}>
                            <h3 class="tab-nf-title">${item.title}</h3>
                            <ul class="tab-nf-imgs">${imagesHTML}</ul>
                            <div class="tab-nf-info">${item.from}</div>
                        </a>
                    </li>
                `;
            }
        }
        const element = $(`<ul>${html}</ul>`);
        // 图片占位
        placeholder(element.find('img'));
        
        return element;
    }
    /**
     * 显示loading动画
     * @param position false => top, true => bottom
     */
    protected showLoading(){
        if (!this.loading) {
            this.loading = this.element.find('.tab-nf-loading');
        }
        this.loading.removeClass('hidden');
    }
    /**
     * 隐藏loading动画
     * @param position false => top, true => bottom
     */
    protected hideLoading() {
        const { loading } = this;
        loading && loading.addClass('hidden');
    }
}

export default PartComponent;