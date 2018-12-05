import { createScrollBar } from "../../../utils";
import PartNewest from "./PartNewest";
import PartHistory from "./PartHistory";
import DataHub from "./DataHub";

enum UpdateStatus {
    PENDING,
    LOADED,
}

class NewsFeed {
    private element: JQuery;
    private categoryID: number;
    private data: number[];
    private datahub: DataHub;
    private partNewest: PartNewest;
    private partHistory: PartHistory;
    private updateStatus: UpdateStatus = UpdateStatus.LOADED;
    constructor(element: JQuery, categoryID: number, data: number[]) {
        this.element = element;
        this.categoryID = categoryID;
        this.data = data;
    }
    public static async build(element: JQuery, categoryID: number, data: number[]): Promise<NewsFeed> {
        const instance = new this(element, categoryID, data);
        await instance.create();
        return instance;
    }
    private async create() {
        const { element, categoryID, data } = this;
        if (!data || !data.length) {
            throw new Error('服务器数据出错.');
        }
        // 渲染结构
        element.html(`
            <div class="nano-content">
                <div class="tab-nf-news">
                    <div class="tab-nf-newest"></div>
                    <div class="tab-nf-history"></div>
                </div>
            </div>
        `).addClass('nano');
        // 创建滚动条
        createScrollBar(element);
        // 创建datahub
        this.datahub = await DataHub.build(categoryID, data);
        // 创建parts，分为两步
        // 1. newest必须在history之前获取ID，保持有序
        const [ partNewestIDs, partHistoryIDs ] = await this.datahub.getSortedIDs();
        // 2. 获取完ID后，为了加快渲染速度，两个模块可以同时渲染了
        const partNewest = this.partNewest = new PartNewest(element.find('.tab-nf-newest'), this.datahub, element);
        const partHistory = this.partHistory = new PartHistory(element.find('.tab-nf-history'), this.datahub, element);
        await Promise.all([
            partNewest.create(partNewestIDs),
            partHistory.create(partHistoryIDs),
        ]);
        // 监听点击刷新
        partNewest.on(PartNewest.Events.CLICK_REFRESH, () => this.update());
        // 更新滚动条
        setTimeout(() => element.nanoScroller());
    }
    private async update() {
        if (this.updateStatus === UpdateStatus.PENDING) return;
        // 加锁
        this.updateStatus = UpdateStatus.PENDING;

        const { element, partNewest, partHistory, datahub } = this;
        // 滚动到顶部
        element.find('.nano-content').animate({ scrollTop: 0 }, 'fast');
        // 获取有序ID
        const [ partNewestIDs, partHistoryIDs ] = await datahub.getSortedIDs();
        // 更新partNewest和partHistory
        await Promise.all([
            partNewest.update(partNewestIDs),
            partHistory.update(partHistoryIDs),
        ]);
        // 更新滚动条
        setTimeout(() => element.nanoScroller());

        // 解锁
        this.updateStatus = UpdateStatus.LOADED;   
    }
}

export default NewsFeed;