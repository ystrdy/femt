import { CategoryServerData } from "../interfaces";
import renderLoading from "../Loading/Loading";
import renderError from "../NetworkError/NetworkError";
import { to, isdev } from "../utils";

abstract class TabComponent {
    protected element: JQuery;
    protected categoryData: CategoryServerData;
    constructor(element: JQuery, categoryData: CategoryServerData) {
        this.element = element;
        this.categoryData = categoryData;
    }
    public async create(): Promise<void> {
        // 创建loading动画
        const loading = renderLoading().appendTo(this.element);
        // 渲染内容
        const [ error ] = await to(this.render());
        // 渲染出错
        if (error) {
            this.element.empty().append(renderError());
            isdev() && console.error(error);
            return;
        }
        // 删除loading动画
        loading.remove();
    }
    /**
     * 渲染方法，渲染主要内容
     */
    protected abstract async render(): Promise<void>;
}

export default TabComponent;