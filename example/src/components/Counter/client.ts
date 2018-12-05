import { on } from "../Client";
import { uuid, log, URL } from "./utils";

export default () => {
    // 监听来自客户端的统计
    on('onCount', async data => {
        const guid = await uuid();
        const result = JSON.stringify({ data, guid });
        const date = new Date();
        log(`${URL}?msgtype=client&action=mini&data=${result}&tt=${date.getTime()}`);
    });
};