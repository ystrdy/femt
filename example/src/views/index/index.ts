import { isdev, to } from "../../components/utils";
import { getCategory } from "../../components/Server";
import render from "../../components/NetworkError/NetworkError";
import IndexTabs from "../../components/IndexTabs/IndexTabs";
import { click, launch } from "../../components/Counter";
import { CountType } from "../../components/interfaces";
import { invoke, Names } from "../../components/Client";
import SplashAD from "../../components/SplashAD/SplashAD";
import 'script-loader!nanoscroller';    // jquery滚动条插件
import 'script-loader!jcarousel';       // jquery焦点图插件

class Index {
    private element: JQuery;
    constructor(element: JQuery) {
        this.element = element;
    }
    public static async build(element: JQuery): Promise<Index> {
        const instance = new this(element);
        await instance.create();
        return instance;
    }
    private async create(): Promise<void> {
        await Promise.all([
            // 创建tab切换
            this.createTabs(),
            // 创建开屏广告
            this.createSplashAD(),
        ]);
        // 删除loading
        this.element.children('.loading').remove();
    }
    private async createTabs(): Promise<void> {
        // 从服务器获取分类
        const [ error, categories ] = await to(getCategory());
        if (error || !categories) {
            // 渲染错误页
            this.element.empty().append(render());
            return;
        }
        // 创建tabs
        const tabs = new IndexTabs(this.element, categories);
        tabs.select(0);
        // 在切换后监听，不监听第一次切换
        tabs.on(IndexTabs.Events.CHANGE, data => click({
            type: CountType.TAB_CHANGE,
            category: -1,
            id: data.data.id,
            channelId: -1,
        }));
    }
    private async createSplashAD(): Promise<void> {
        await SplashAD.build(this.element);
    }
}

const container = $('.index-container');
if (container.length) {
    Index.build(container.eq(0)).then(() => {
        // tab创建好后通知客户端，页面准备好了
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