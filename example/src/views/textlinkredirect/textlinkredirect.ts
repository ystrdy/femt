import { getTextLinkInfo } from "../../components/Server";
import { to } from "../../components/utils";
import { click } from "../../components/Counter";
import { CountType } from "../../components/interfaces";

async function redirect() {
    // 获取数据
    const [error, data] = await to(getTextLinkInfo());
    if (error) return;
    // 打点
    click({
        type: CountType.TEXT_LINK_REDIRECT,
        id: data.id,
        channelId: data.channelId,
        category: -1,
    });
    // 跳转
    location.href = data.linkURL;
}

redirect();