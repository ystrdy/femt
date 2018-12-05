import { RightTopServerData, CountType, RightTopType } from "../interfaces";
import { generateHTMLAttribute } from "../Counter";
import { to, isEmptyObject } from "../utils";
import { getADByID } from "../Server";
import placeholder, { generateImageAttribute } from "../ImagePlaceholder";

class RightTop {
    private element: JQuery;
    private categoryID: number;
    private data: RightTopServerData;
    constructor(element: JQuery, categoryID: number, data: RightTopServerData) {
        this.element = element;
        this.categoryID = categoryID;
        this.data = data;
    }
    public static async build(element: JQuery, categoryID: number, data: RightTopServerData): Promise<RightTop> {
        const instance = new this(element, categoryID, data);
        await instance.create();
        return instance;
    }
    private async create() {
        const { data } = this;
        if (!data || isEmptyObject(data)) return;
        const { dataType } = data;
        switch (dataType) {
            case RightTopType.TITLE_IMAGE:
                await this.createTitleImage();
                break;
            case RightTopType.PURE_IMAGE:
                await this.createPureImage();
                break;
        }
    }
    private async createTitleImage() {
        const { element, categoryID, data } = this;
        const [ error, item ] = await to(getADByID(data.id));
        if (error || !item || isEmptyObject(item)) return;
        const clickcount = generateHTMLAttribute({
            type: CountType.NEWS_FEED_RIGHT_TOP,
            id: item.id,
            channelId: item.channelId,
            category: categoryID,
        });
        element.html(`
            <a class="tab-nf-title-image" href="${item.linkURL}" ${clickcount}>
                <img ${generateImageAttribute('166x195', item.image)} alt="${item.title}">
                <h4>${item.title}</h4>
                <i></i>
            </a>
        `);
        placeholder(element.find('img'));
    }
    private async createPureImage() {
        const { element, categoryID, data } = this;
        const [ error, item ] = await to(getADByID(data.id));
        if (error || !item || isEmptyObject(item)) return;
        const clickcount = generateHTMLAttribute({
            type: CountType.NEWS_FEED_RIGHT_TOP,
            id: item.id,
            channelId: item.channelId,
            category: categoryID,
        });
        element.html(`
            <a class="tab-nf-pure-image" href="${item.linkURL}" ${clickcount}>
                <img ${generateImageAttribute('166x195', item.image)} alt="${item.title}">
            </a>
        `);
        placeholder(element.find('img'));
    }
}

export default RightTop;