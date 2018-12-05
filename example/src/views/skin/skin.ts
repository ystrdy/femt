import { invoke, Names } from "../../components/Client";
import { launch, generateHTMLAttribute } from "../../components/Counter";
import { isdev, to, loadImage } from "../../components/utils";
import { getSkinAD, getADByID, ajax } from "../../components/Server";
import { ADServerData, CountType, SkinADServerData, SkinADType } from "../../components/interfaces";

interface Interface360ServerData {
    acttk: string,
    clktk: string[],
    color: string,
    curl: string,
    desc: string,
    flagv: number,
    img: string,
    imgh: number,
    imgw: number,
    imparg: string,
    imptk: string[],
    lcurl: string,
    limg: string,
    showid: string,
    slot: number,
    title: string,
    impurl: string,
}

class Interface360 {
    private element: JQuery;
    constructor(element: JQuery) {
        this.element = element;
    }
    public static async build(element: JQuery): Promise<Interface360> {
        const instance = new this(element);
        await instance.create();
        return instance;
    }
    private async create() {
        // 获取数据
        const [ error, data ] = await to(this.request());
        if (error || !data) return;
        // 渲染
        await this.render(data);
        // 打点曝光
        this.supervise(data);
    }
    private async render(data: Interface360ServerData) {
        // 预加载图片
        const [ imageError, imageElement ] = await to(<Promise<HTMLImageElement>>loadImage(data.img));
        if (imageError || !imageElement) return;
        // 渲染
        const { element } = this;
        const clickcount = generateHTMLAttribute({
            type: CountType.SKIN_AD,
            id: -1,
            channelId: -1,
            category: -1,
        });
        const wrap = $(`
            <div class="sc-body interface360">
                <a href="${data.curl}" ${clickcount}>
                    <img src="${data.img}">
                    <i></i>
                </a>
            </div>
        `);
        wrap.on('click', 'a', () => {
            // 留出200ms的时间给统计
            setTimeout(() => invoke(Names.QUIT), 200);
        });
        element.append(wrap);
    }
    private async request(): Promise<Interface360ServerData> {
        const showids = 'MVrbic';
        const { adspaces, impurl } = await ajax({
            url: '//show.g.mediav.com/s',
            data: {
                type: 1,
                of: 4,
                newf: 2,
                showids,
                uid: this.getUID(),
                scheme: location.protocol.slice(0, -1),
            },
            dataType: 'jsonp',
            cache: true,
            crossDomain: true,
            jsonp: 'jsonp',
        });
        if (adspaces && adspaces[showids] && adspaces[showids].ads && adspaces[showids].ads.length) {
            return { ...adspaces[showids].ads[0], impurl };
        }
        return null;
    }
    private getHash(str: string): number {
        let hash = 0;
        for(let idx = str.length - 1; idx >= 0; idx--){
            let charCode = str.charCodeAt(idx);
            hash = (hash << 6&268435455) + charCode+(charCode << 14);
            charCode = hash&266338304;
            hash = charCode != 0 ? hash ^ charCode>>21 : hash;
        }
        return hash;
    }
    private getUID(): string {
        return `${this.getHash(window.location.href)}${this.getHash(document.domain)}${new Date().getTime()}${Math.floor(Math.random()*1000)}`.substr(0, 32);
    }
    private supervise(data: Interface360ServerData) {
        // 曝光
        if (data.imptk) {
            for (let i = 0; i < data.imptk.length; i++) {
                this.log(data.imptk[i]);
            }
        }
        if (data.impurl && data.imparg) {
            this.log(data.impurl + data.imparg);
        }
        // 点击
        const { element } = this;
        const aTag = element.find('.sc-body.interface360 a');
        let mouseDownTimestamp;
        aTag.on('mousedown', (event: JQueryEventObject) => {
            // 左键点击
            if (event.which === 1) {
                mouseDownTimestamp = (new Date()).getTime();
            }
        }).on('click', (event: JQueryEventObject) => {
            if (mouseDownTimestamp) {
                const mouseUpTimestamp = (new Date()).getTime();
                if (mouseUpTimestamp >= mouseDownTimestamp) {
                    const origin = element.get(0).getBoundingClientRect()
                    const offsetX = Math.floor(event.clientX - origin.left) + '';
                    const offsetY = Math.floor(event.clientY - origin.top) + '';
                    const href = data.curl
                        .replace('__EVENT_TIME_START__', mouseDownTimestamp + '')
                        .replace('__EVENT_TIME_END__', mouseUpTimestamp + '')
                        .replace('__OFFSET_X__', offsetX)
                        .replace('__OFFSET_Y__', offsetY);
                    aTag.attr('href', href);
                    // 发送点击监测
                    if (data.clktk && data.clktk.length) {
                        const clktks = $.isArray(data.clktk) ? data.clktk : (<string>data.clktk).split(',');
                        for (let i = 0; i < clktks.length; i++) {
                            const clktk = clktks[i]
                                .replace('__EVENT_TIME_START__', mouseDownTimestamp + '')
                                .replace('__EVENT_TIME_END__', mouseUpTimestamp + '')
                                .replace('__OFFSET_X__', offsetX)
                                .replace('__OFFSET_Y__', offsetY);
                            this.log(clktk);
                        }
                    }
                }
            }
        });
    }
    private log(url: string) {
        let img = new Image();

        img.onload = img.onerror = img.onabort = function () {
            img.onload = img.onerror = img.onabort = null;

            img = null;
        };

        img.src = url;
    }
}

class SkinAD {
    private element: JQuery;
    constructor(element: JQuery) {
        this.element = element;
    }
    public static async build(element: JQuery): Promise<SkinAD> {
        const instance = new this(element);
        await instance.create();
        return instance;
    }
    private async create() {
        // 获取数据
        const [ error, data ] = await to(getSkinAD());
        if (error || !data) return;
        // 创建
        switch (data.dataType) {
            case SkinADType.RECOMMEND:
                await this.createOfRecommend(data);
                break;
            case SkinADType.INTERFACE360:
                await this.createOfInterface360();
                break;
        }
        // 隐藏loading
        this.element.children('.loading').remove();
    }
    private async createOfRecommend({ id }: SkinADServerData) {
        const [ error, data ] = await to(getADByID(id));
        if (error || !data) return;
        // 预加载图片
        const item = <ADServerData>data;
        const [ imageError, imageElement ] = await to(<Promise<HTMLImageElement>>loadImage(item.image));
        if (imageError || !imageElement) return;
        // 渲染
        const { element } = this;
        const clickcount = generateHTMLAttribute({
            type: CountType.SKIN_AD,
            id: item.id,
            channelId: item.channelId,
            category: -1,
        });
        const wrap = $(`
            <div class="sc-body">
                <a href="${item.linkURL}" ${clickcount}>
                    <img src="${item.image}">
                </a>
            </div>
        `);
        wrap.on('click', 'a', () => {
            // 留出200ms的时间给统计
            setTimeout(() => invoke(Names.QUIT), 200);
        });
        element.append(wrap);
    }
    private async createOfInterface360() {
        Interface360.build(this.element);
    }
}

const container = $('.skin-container');
if (container.length) {
    SkinAD.build(container.eq(0)).then(() => {
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