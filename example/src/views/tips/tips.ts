import { loadImage, to, compareVersion } from "../../components/utils";
import { invoke, Names } from "../../components/Client";
import { launch } from "../../components/Counter";

class Application {
    private element: JQuery;
    constructor(element: JQuery) {
        this.element = element;
    }
    public static async build(element: JQuery): Promise<Application> {
        const instance = new this(element);
        await instance.init();
        return instance;
    }
    private async init() {
        // 创建
        const [ error, flag ] = await to(this.create());
        if (!error && flag) {     // 创建成功，通知客户端
            invoke(Names.NOTIFYCLIENTWEBLOADED);
        } else {        // 创建失败
            invoke(Names.QUIT);
        }
    }
    private async create(): Promise<boolean> {
        // 1.获取版本号
        const { version } = await invoke(Names.GETCLIENTINFO);
        if (!version) return false;
        
        // 2.检查版本，当不在2.0.2.36-2.0.2.38区间的时候，直接退出
        if (compareVersion(version, '2.0.2.36') === -1 || compareVersion(version, '2.0.2.38') === 1) return false;

        // 3.渲染
        if (!await this.render()) return false;

        // 4.检测图片资源是否加载成功
        if (!await this.preload()) return false;

        return true
    }
    /**
     * 预加载资源
     */
    private async preload(): Promise<boolean> {
        const resources = [
            './images/sprite.tips.png',      // 背景图片
        ];
        const promises = [];
        for (let i = 0; i < resources.length; i++) {
            promises.push(loadImage(resources[i]).catch(() => null));
        }
        const results = await Promise.all(promises);
        for (let i = 0; i < results.length; i++) {
            if (!results[i]) {
                return false;
            }
        }
        return true;
    }
    private async render(): Promise<boolean> {
        const { element } = this;
        const delayInvoke = (name: string) => setTimeout(() => invoke(name), 1000);
        // 点击关闭按钮
        element.on('click', '.sn-close', () => {
            delayInvoke(Names.QUIT);
        });
        // 点击不在弹出
        element.on('click', '.sn-no-longer', () => {
            delayInvoke(Names.NOLONGERPOPUP);
        });
        // 点击新闻
        element.on('click', '.sn-body', () => {
            delayInvoke(Names.QUIT);
        });
        
        return true;
    }
}

// 启动
$('.single-news').each((_, element) => {
    Application.build($(element));
});

// 启动统计，监听来自客户端和页面的点击统计
launch();
/*
import { invoke, Names } from "../../components/Client";
import { launch } from "../../components/Counter";
import { isdev, to } from "../../components/utils";
import { getTips } from "../../components/Server";
import { TipsType, TipsNewsListServerData, TipsFullImageServerData } from "../../components/interfaces";
import TipsNewsList from "../../components/TipsNewsList/TipsNewsList";
import TipsFullImage from "../../components/TipsFullImage/TipsFullImage";
import TipsNetworkError from "../../components/TipsNetworkError/TipsNetworkError";

class Tips {
    private element: JQuery;
    constructor(element: JQuery) {
        this.element = element;
    }
    public static async build(element: JQuery): Promise<Tips> {
        const instance = new this(element);
        await instance.create();
        return instance;
    }
    private async create(): Promise<void> {
        // 获取数据
        const [ error, data ] = await to(getTips());
        if (error || !data) {
            // 渲染错误页
            this.renderNetworkError();
            return;
        }
        // 创建tips
        const { element } = this;
        try {
            switch (data.dataType) {
                case TipsType.NEWS_LIST:
                    await TipsNewsList.build(element, <TipsNewsListServerData>data);
                    break;
                case TipsType.FULLSCREEN_IMAGE:
                    await TipsFullImage.build(element, <TipsFullImageServerData>data);
                    break;
            }
        } catch (error) {
            this.renderNetworkError();
        }
        // 隐藏loading
        element.children('.loading').remove();
    }
    private renderNetworkError() {
        const { element } = this;
        element.empty();
        new TipsNetworkError(element);
    }
}

const container = $('.tips-container');
if (container.length) {
    Tips.build(container.eq(0)).then(() => {
        // tips创建好后通知客户端，页面准备好了
        invoke(Names.NOTIFYCLIENTWEBLOADED);
    });
}

// 启动统计，监听来自客户端和页面的点击统计
launch();

// 添加调试代码
if (isdev()) {
    const script = document.createElement('script');
    script.src = 'js/debug.js';
    document.getElementsByTagName('head')[0].appendChild(script);
}
*/