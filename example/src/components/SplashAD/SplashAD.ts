import { getSplashAD, getADByID } from "../Server";
import { to, loadImage } from "../utils";
import { SplashType, SplashServerData, CountType } from "../interfaces";
import { generateHTMLAttribute } from "../Counter";
import * as $script from 'scriptjs';

declare global {
    interface InteractivePluginRenderConfig {
        [propName: string]: any,
    }
    interface InteractivePlugin {
        render: (config: InteractivePluginRenderConfig) => void,
    }
    const INTERACTIVE_PLUGIN: InteractivePlugin;
}

class NormalSplash {
    private element: JQuery;
    private largeElement: JQuery;
    private data: SplashServerData;
    constructor(element: JQuery, data: SplashServerData) {
        this.element = element;
        this.data = data;
    }
    public static async build(element: JQuery, data: SplashServerData): Promise<NormalSplash> {
        const instance = new this(element, data);
        await instance.createLarge();
        return instance;
    }
    // 关闭splash
    private async close() {
        // 清除大图
        this.clearLarge();
        // 创建小图
        await this.createSmall();
    }
    // 创建大图
    private async createLarge() {
        // 从服务器获取数据
        const { large } = this.data;
        const [ error, data ] = await to(getADByID(large));
        // 获取数据失败
        if (error || !data) return;

        const { id, channelId, image, linkURL } = data;
        // 预加载图片
        const [ imageError, imageElement ] = await to(<Promise<HTMLImageElement>>loadImage(image));
        if (imageError || !imageElement) return;

        // 创建
        const clickcount = generateHTMLAttribute({
            type: CountType.SPLASH_AD,
            id, channelId,
        });
        const largeElement = this.largeElement = $(`
            <div class="sa-large">
                <div class="sa-close"></div>
                <a href="${linkURL}" ${clickcount}><img src="${image}"></a>
            </div>
        `);
        this.element.append(largeElement);
        // 点击关闭
        largeElement.on('click', () => this.close());
    }
    // 清理大图
    private async clearLarge() {
        return new Promise(resolve => {
            const { largeElement } = this;
            // 关闭动画
            $('img', largeElement).css({
                position: 'absolute',
                left: 0,
                bottom: 0,
            }).animate({
                width: 88,
                height: 105,
            }, 'fast', () => {
                largeElement.remove();
                resolve();
            });
        });
    }
    // 创建小图
    private async createSmall() {
        const { element, data } = this;
        await SmallSplash.build(element, data);
    }
}

class SmallSplash {
    private element: JQuery;
    private data: SplashServerData;
    constructor(element: JQuery, data: SplashServerData) {
        this.element = element;
        this.data = data;
    }
    public static async build(element: JQuery, data: SplashServerData): Promise<SmallSplash> {
        const instance = new this(element, data);
        await instance.create();
        return instance;
    }
    private async create() {
        // 从服务器获取数据
        const { small } = this.data;
        const [ error, data ] = await to(getADByID(small));
        // 获取数据失败
        if (error || !data) return;
        // 开始渲染
        const { id, channelId, linkURL, image } = data;
        // 创建
        const clickcount = generateHTMLAttribute({
            type: CountType.SPLASH_AD,
            id, channelId,
        });
        const smallElement = $(`
            <div class="sa-small">
                <span></span>
                <a href="${linkURL}" ${clickcount}><img src="${image}"></a>
            </div>
        `);
        this.element.append(smallElement);
        // 点击关闭
        smallElement.on('click', 'span', () => smallElement.remove());
    }
}

class SplashAD {
    private element: JQuery;
    constructor(element: JQuery) {
        this.element = element;
    }
    public static async build(element: JQuery): Promise<SplashAD> {
        const instance = new this(element);
        await instance.create();
        return instance;
    }
    private async create() {
        // 先获取服务器配置
        const [ error, data ] = await to(getSplashAD());
        // 获取服务器数据出错
        if (error || !data) return;
        // 未开启
        if (!data.open) return;
        // 开始创建
        const wrapElement = $(`
            <div class="splash-ad"></div>
        `);
        this.element.append(wrapElement);
        switch (data.dataType) {
            case SplashType.NORMAL:
                NormalSplash.build(wrapElement, data);
                break;
            case SplashType.SMALL:
                SmallSplash.build(wrapElement, data);
                break;
            case SplashType.WIDGET360:
                this.createWidget360(wrapElement);
                break;
        }
    }
    private createWidget360(element: JQuery) {
        $script('//cjhd.mediav.com/js/interactive_plugin.js', () => {
            const id = '_' + Math.random().toString(36).slice(2);
            const widgetElement = $(`<div id="${id}" class="sa-widget360"></div>`);
            element.append(widgetElement);
            // 创建挂件
            INTERACTIVE_PLUGIN.render({
                placeholderId: id,
                showid : 'OtVWwu',
                w: 80,
                h: 80, 
                type: 'hover',
                hoverDefine: {
                    zIndex: 100,
                },
            });
        });
    }
}

export default SplashAD;