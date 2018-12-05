import TabComponent from "../TabComponent/TabComponent";
import { NewsFeedServerData } from "../interfaces";
import { getContent } from "../Server";
import RightTop from "./RightTop";
import Hots from "./Hots";
import NewsFeed from "./NewsFeed/QihooProcess/NewsFeed";

class TabNewsFeed360Process extends TabComponent {
    protected async render(): Promise<void> {
        const { element, categoryData } = this;
        // 获取数据
        const data: NewsFeedServerData = await getContent(categoryData);
        if (!data) {
            throw new Error('服务器数据出错.');
        }
        // 渲染结构
        element.html(`
            <div class="tab-news-feed"></div>
            <div class="tab-nf-side">
                <div class="tab-nf-top"></div>
                <div class="tab-nf-hot"></div>
                <div class="tab-nf-declare"></div>
            </div>
        `);
        // 创建
        const { id } = categoryData;
        await Promise.all([
            // 创建信息流
            NewsFeed.build(element.find('.tab-news-feed'), id, data.newsfeed),
            // 创建右上角
            RightTop.build(element.find('.tab-nf-top'), id, data.righttop),
            // 创建24小时热点
            Hots.build(element.find('.tab-nf-hot'), id, data.hots),
        ]);
    }
}

export default TabNewsFeed360Process;