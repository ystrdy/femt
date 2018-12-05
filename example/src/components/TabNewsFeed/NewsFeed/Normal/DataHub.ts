import Storage, { getInstance } from "../../../Storage";
import { NewsServerData } from "../../../interfaces";
import { getNewsByID } from "../../../Server";

class DataHub {
    public categoryID: number;
    private data: number[];
    private storage: Storage;
    constructor(categoryID: number, data: number[]) {
        this.categoryID = categoryID;
        this.data = data;
    }
    public static async build(categoryID: number, data: number[]): Promise<DataHub> {
        const instance = new this(categoryID, data);
        await instance.init();
        return instance;
    }
    private async init(){
        // 创建storage
        this.storage = await getInstance();
    }
    /**
     * 获取指定分类下的历史文章ID
     */
    private async getAllHistoryID(): Promise<number[][]> {
        const { storage, categoryID } = this;
        const all = await storage.get();
        if (all) {
            const history = all[categoryID];
            if (history instanceof Array) {
                return [ ...history ];
            }
        }
        return [];
    }
    /**
     * 将看过的新闻记录到历史
     */
    private async recordToHistory(ids: number[]): Promise<void> {
        const { storage, categoryID } = this;
        const all = await storage.get();
        const history = all[categoryID] || [];
        history.unshift(ids);
        await storage.set({
            ...all,
            [categoryID]: history,
        });
    }
    /**
     * 获取未使用的ID
     */
    private async getUnusedID(): Promise<number[]> {
        // 获取ID
        const history = await this.getAllHistoryID();
        // 去重
        const o = {};
        for (let i = 0; i < history.length; i++) {
            for (let j = 0; j < history[i].length; j++) {
                const id = history[i][j];
                o[id] = true;
            }
        }
        const { data } = this;
        const unused = [];
        for (let i = 0; i < data.length; i++) {
            const id = data[i];
            if (typeof o[id] === 'undefined') {
                unused.push(id);
            }
        }
        return unused;
    }
    /**
     * 获取指定ID的数据
     * @param ids 文章id数组
     */
    public async getNewsByIDs(ids: number[]): Promise<NewsServerData[]> {
        // 获取
        const promises = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            promises.push(getNewsByID(id).catch(() => null));
        }
        const data = await Promise.all(promises);
        // 过滤
        const items: NewsServerData[] = [];
        for (let i = 0; i < data.length; i++) {
            data[i] && items.push(data[i]);
        }
        return items;
    }
    public async getNewestIDs(): Promise<number[]> {
        const all = await this.getUnusedID();
        const ids = all.slice(0, 6);
        if (ids && ids.length) {
            await this.recordToHistory(ids);
        }
        return ids;
    }
    public async getHistoryIDs(): Promise<number[]> {
        const history = await this.getAllHistoryID();
        if (history.length) {
            return history.shift();
        }
        return null;
    }
    /**
     * 获取创建或者点击刷新按钮后的ID
     * PartNewest和PartHistory之间的ID，必须存在一个顺序，
     * 这个方法就是获取ID，并将它们排序
     */
    public async getSortedIDs(): Promise<number[][]> {
        const history = await this.getHistoryIDs();
        const newest = await this.getNewestIDs();
        if (history) {
            return [newest, history];
        } else {
            return [newest, await this.getNewestIDs()];                        
        }
    }
}

export default DataHub;