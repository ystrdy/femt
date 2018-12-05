import { TipsFullImageServerData, CountType } from "../interfaces";
import { getADByID } from "../Server";
import { loadImage } from "../utils";
import { generateHTMLAttribute } from "../Counter";
import { invoke, Names } from "../Client";

class TipsFullImage {
    private element: JQuery;
    private data: TipsFullImageServerData;
    constructor(element: JQuery, data: TipsFullImageServerData) {
        this.element = element;
        this.data = data;
    }
    public static async build(element: JQuery, data: TipsFullImageServerData): Promise<TipsFullImage> {
        const instance = new this(element, data);
        await instance.create();
        return instance;
    }
    private async create() {
        // 获取数据
        const data = await getADByID(this.data.id);
        // 预加载图片
        await loadImage(data.image);
        // 渲染
        const clickcount = generateHTMLAttribute({
            type: CountType.TIPS_FULLIMAGE_AD,
            id: data.id,
            channelId: data.channelId,
            category: -1,
        });
        const wrap = $(`
            <div class="full-image">
                <div class="fi-head">
                    <h2>FF新鲜事-Flash助手推荐</h2>
                    <span class="fi-close"></span>
                    <span class="fi-no-longer">不再弹出</span>
                </div>
                <div class="fi-body">
                    <a href="${data.linkURL}" ${clickcount}>
                        <img src="${data.image}">
                    </a>
                </div>
            </div>
        `);
        wrap.on('click', '.fi-no-longer', () => {
            invoke(Names.NOLONGERPOPUP);
        }).on('click', '.fi-close', () => {
            invoke(Names.QUIT);
        }).on('click', 'a', () => {
            invoke(Names.QUIT);
        });
        // 构建工具BUG
        wrap.find('.fi-no-longer').hover(function () {
            $(this).addClass('cur');
        }, function () {
            $(this).removeClass('cur');
        });
        this.element.append(wrap);
    }
}

export default TipsFullImage;