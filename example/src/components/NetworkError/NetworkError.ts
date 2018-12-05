import { click } from "../Counter";
import { CountType } from "../interfaces";

function render(): JQuery {
    const element = $('<div class="network-error"><i></i><span></span></div>');
    
    // 点击刷新
    element.on('click', 'span', () => location.reload(true));

    // 统计错误
    click({
        type: CountType.RENDER_NETWORK_ERROR,
        id: -1,
        channelId: -1,
        category: -1,
    });
    
    return element;
}

export default render;