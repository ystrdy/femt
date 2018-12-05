import TabComponent from "../TabComponent/TabComponent";
import { GameStyleServerData, ADServerData, CountType } from "../interfaces";
import { getContent, getADByID } from "../server";
import { generateHTMLAttribute } from "../Counter";
import placeholder, { generateImageAttribute } from "../ImagePlaceholder";

class TabGameStyle extends TabComponent {
    protected async render(): Promise<void> {
        const { element, categoryData } = this;
        // 获取数据
        const data: GameStyleServerData = await getContent(categoryData);
        if (!data) {
            throw new Error('服务器数据出错.');
        }
        const keys = ['carousel', 'newslist', 'gamematch', 'gamelist'];
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
        let [carousel, newslist, gamematch, gamelist] = await Promise.all(promises);
        // 渲染
        let carouselHTML = '';
        for (let i = 0; i < carousel.length; i++) {
            const item: ADServerData = carousel[i];
            if (!item) continue;
            const clickcount = generateHTMLAttribute({
                type: CountType.GAME_CHANNEL,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            carouselHTML += `
                <li><a href="${item.linkURL}" ${clickcount}>
                    <img ${generateImageAttribute('404x186', item.image)}>
                    <h3>${item.title}</h3>
                </a></li>
            `;
        }
        let newslistHTML = '';
        newslist = newslist.slice(0, 4);
        for (let i = 0; i < newslist.length; i++) {
            const item: ADServerData = newslist[i];
            const clickcount = generateHTMLAttribute({
                type: CountType.GAME_CHANNEL,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            newslistHTML += `
                <li><a href="${item.linkURL}" ${clickcount}>
                    <img ${generateImageAttribute('86x48', item.image)}>
                    <p>${item.title}</p>
                </a></li>
            `;
        }
        let gamematchHTML = '';
        gamematch = gamematch.slice(0, 1);
        for (let i = 0; i < gamematch.length; i++) {
            const item: ADServerData = gamematch[i];
            const clickcount = generateHTMLAttribute({
                type: CountType.GAME_CHANNEL,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            const participants = Math.round(Math.random() * (item.max_participants - item.min_participants) +  item.min_participants);
            gamematchHTML += `
                <div class="tab-gs-fg-match"><a href="${item.linkURL}" ${clickcount}>
                    <div class="tab-gs-fg-m-pic">
                        <img ${generateImageAttribute('82x82', item.image)}>
                        <i></i>
                    </div>
                    <h3>${item.title}</h3>
                    <div class="tab-gs-fg-m-status">
                        <span>${item.propaganda}<i></i></span>
                    </div>
                    <p>${participants}万人已参加</p>
                </a></div>
            `;
        }
        let gamelistHTML = '';
        gamelist = gamelist.slice(0, 5);
        for (let i = 0; i < gamelist.length; i++) {
            const item: ADServerData = gamelist[i];
            const clickcount = generateHTMLAttribute({
                type: CountType.GAME_CHANNEL,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            const popularity = Math.round(Math.random() * (item.max_popularity - item.min_popularity) +  item.min_popularity);
            gamelistHTML += `
                <li><a href="${item.linkURL}" ${clickcount}>
                    <div class="tab-gs-fg-l-pic">
                        <img ${generateImageAttribute('54x54', item.image)}>
                        <i></i>
                    </div>
                    <div class="tab-gs-fg-l-con">
                        <h3><span>${item.title}</span>${item.heat ? '<i></i>' : ''}</h3>
                        <p>${item.propaganda}</p>
                        <div class="tab-gs-fg-l-hots">人气：${popularity}</div>
                    </div>
                </a></li>
            `;
        }
        const wrap = $(`
            <div class="tab-game-style">
                <div class="tab-gs-atlas-news">
                    <div class="tab-gs-title">
                        <h3>游戏新鲜事<i></i></h3>
                    </div>
                    <div class="tab-gs-an-carousel">
                        <div class="tab-gs-an-view">
                            <ul>${carouselHTML}</ul>
                            <span class="tab-gs-an-prev"></span>
                            <span class="tab-gs-an-next"></span>
                        </div>
                        <div class="tab-gs-an-anchor"></div>
                    </div>
                    <div class="tab-gs-an-list">
                        <ul>${newslistHTML}</ul>
                    </div>
                </div>
                <div class="tab-gs-flash-game">
                    <div class="tab-gs-title">
                        <h3>Flash游戏推荐<i></i></h3>
                    </div>
                    <div class="tab-gs-fg-container">
                        ${gamematchHTML}
                        <div class="tab-gs-fg-list">
                            <ul>${gamelistHTML}</ul>
                        </div>
                    </div>
                </div>
            </div>
        `);
        element.append(wrap);
        // 创建焦点图
        this.createSlider();
        // 图片占位
        placeholder(wrap.find('img'));
    }
    private createSlider() {
        const { element } = this;
        // 配置：https://sorgalla.com/jcarousel/docs/reference/configuration.html
        const slider = element.find('.tab-gs-an-view');
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
        // 创建箭头
        element.find('.tab-gs-an-prev').jcarouselControl({ target: '-=1' });
        element.find('.tab-gs-an-next').jcarouselControl({ target: '+=1' });
        // 创建锚点
        element.find('.tab-gs-an-anchor')
            .on('jcarouselpagination:active', 'span', function() {
                $(this).addClass('cur');
            })
            .on('jcarouselpagination:inactive', 'span', function() {
                $(this).removeClass('cur');
            })
            .jcarouselPagination({
                item: function(page) {
                    const length = this._carouselItems.length;
                    const current = +page;
                    const w = this._element.width();
                    let width = Math.floor(w / length);
                    if (current >= length) {
                        width = w - width * (length - 1);
                    }
                    return `<span style="width:${width}px"></span>`;
                },
            });
    }
}

export default TabGameStyle;