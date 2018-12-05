import PartComponent from "./PartComponent";
import AD from "../AD";

enum Events {
    CLICK_REFRESH = 'onClickRefresh',
}

class PartNewest extends PartComponent {
    public static readonly Events = Events;
    protected tips: JQuery;
    protected tipsHeight: number;
    protected tipsTimerID: number;
    public async create(ids: number[]) {
        // 编译广告
        const { datahub, nanoscroller } = this;
        const renderAD = AD.small.compile(datahub.categoryID, nanoscroller);
        // 渲染新闻
        const result = await this.render(ids);
        if (!result) return;
        // 渲染
        const { element } = this;
        element.html(`
            <div class="tab-nf-tips hidden"></div>
            <div class="tab-nf-loading hidden"><div class="loading"><s></s><i></i><span>推荐中...</span></div></div>
            <div class="tab-nf-content"></div>
            <div class="tab-nf-refresh"><span>刚刚看到这里，点击刷新</span><i></i><s class="lt"></s><s class="t"></s><s class="rt"></s><s class="r"></s><s class="rb"></s><s class="b"></s><s class="lb"></s><s class="l"></s></div>
        `);
        element.find('.tab-nf-content').append(result);
        // 渲染广告
        renderAD(result);
        // 点击按钮
        element.on('click', '.tab-nf-refresh', () => {
            this.emit(Events.CLICK_REFRESH);
        });
    }
    public async update(ids: number[]) {
        // 隐藏tips
        this.hideTips();
        // 显示加载中动画
        this.showLoading();
        // 编译广告
        const { datahub, nanoscroller } = this;
        const renderAD = AD.mixin.compile(datahub.categoryID, nanoscroller);
        // 渲染新闻
        const result = await this.render(ids);
        // 隐藏加载中动画
        this.hideLoading();
        if (result) {
            // 挂载到DOM
            this.element.find('.tab-nf-content').empty().append(result);
            // 渲染广告
            renderAD(result);
            // 显示提示
            const msg = `为您推荐了${result.children('li').length}篇文章`;
            setTimeout(() => this.showTips(msg), 200);
        } else {
            this.showTips('没有更多内容啦');
        }
    }
    protected showTips(text) {
        if (!this.tips) {
            this.tips = this.element.find('.tab-nf-tips');
            this.tipsHeight = this.tips.outerHeight();
        }
        this.hideTips();
        const { tips, tipsHeight } = this;
        const duration = 'fast';
        tips.html(text)
            .removeClass('hidden')
            .animate({ height: tipsHeight }, duration, () => {
                this.tipsTimerID = setTimeout(() => {
                    this.tipsTimerID = -1;
                    tips.animate({ height: 0 }, duration, () => {
                        this.hideTips();
                    });
                }, 1500);
            });
    }
    protected hideTips() {
        (this.tipsTimerID !== -1) && clearInterval(this.tipsTimerID);
        if (this.tips) {
            this.tips.html('')
                .stop()
                .css('height', 0)
                .addClass('hidden');
        }
    }
}

export default PartNewest;