import PartComponent from "./PartComponent";
import AD from "../AD";
const throttle = require('throttle-debounce/throttle');

enum NanoScrollerOnUpdateValueDirection {
    UP = 'up',
    DOWN = 'down',
}

interface NanoScrollerOnUpdateValue {
    position: number,
    maximum: number,
    direction: NanoScrollerOnUpdateValueDirection,
}

enum NextLoadStatus {
    PENDING,
    LOADED,
}

class PartHistory extends PartComponent {
    private nextLoadStatus: NextLoadStatus = NextLoadStatus.LOADED;
    public async create(ids: number[]) {
        // 编译广告
        const { datahub, nanoscroller } = this;
        const renderAD = AD.mixin.compile(datahub.categoryID, nanoscroller);
        // 渲染新闻
        const result = await this.render(ids);
        if (!result) return;
        // 渲染
        const { element } = this;
        element.html(`
            <div class="tab-nf-content"></div>
            <div class="tab-nf-loading hidden"><div class="loading"><s></s><i></i><span>加载中...</span></div></div>
            <div class="tab-nf-nomore hidden"><i></i></div>
        `);
        element.find('.tab-nf-content').append(result);
        // 渲染广告
        renderAD(result);
        // 监听滚动
        const handle = throttle(50, (event: JQueryEventObject, values: NanoScrollerOnUpdateValue) => {
            const { position, maximum } = values;
            if (position > maximum - 50) {
                this.next();
            }
        });
        nanoscroller.on('update', handle);
    }
    public async update(ids: number[]) {
        // 编译广告
        const { datahub, nanoscroller } = this;
        const renderAD = AD.mixin.compile(datahub.categoryID, nanoscroller);
        // 渲染新闻
        const result = await this.render(ids);
        if (!result) return;
        // 渲染
        const { element } = this;
        element.find('.tab-nf-content').empty().append(result);
        // 渲染广告
        renderAD(result);
    }
    private async next() {
        if (this.nextLoadStatus === NextLoadStatus.PENDING) return;
        // 加锁
        this.nextLoadStatus = NextLoadStatus.PENDING;
        // 显示加载中动画
        this.showLoading();
        // 编译广告
        const { datahub, nanoscroller } = this;
        const renderAD = AD.mixin.compile(datahub.categoryID, nanoscroller);
        // 渲染新闻
        const ids = await datahub.getNewestIDs();
        const result = await this.render(ids);
        if (result) {
            // 渲染
            const { element } = this;
            element.find('.tab-nf-content').append(result);
            // 渲染广告
            renderAD(result);
        } else {
            this.element.find('.tab-nf-nomore').removeClass('hidden');
        }
        // 隐藏加载中动画
        this.hideLoading();
        // 解锁
        this.nextLoadStatus = NextLoadStatus.LOADED;
    }
}

export default PartHistory;