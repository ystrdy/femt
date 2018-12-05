import render from "../NetworkError/NetworkError";
import { invoke, Names } from "../Client";

class TipsNetworkError {
    private element: JQuery;
    constructor(element: JQuery) {
        this.element = element;

        this.create();
    }
    private create() {
        const wrap = $(`
            <div class="tips-network-error">
                <div class="tne-head">
                    <h2>FF新鲜事-Flash助手推荐</h2>
                    <span class="tne-close"></span>
                    <span class="tne-no-longer">不再弹出</span>
                </div>
                <div class="tne-body"></div>
            </div>
        `);
        wrap.on('click', '.tne-no-longer', () => {
            invoke(Names.NOLONGERPOPUP);
        }).on('click', '.tne-close', () => {
            invoke(Names.QUIT);
        });
        wrap.find('.tne-body').append(render());
        this.element.append(wrap);
    }
}

export default TipsNetworkError;