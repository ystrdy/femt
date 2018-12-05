/**
 * 这个模块是关于网页统计的
 * 
 * 统计必须发送的字段
 * 
 */
import { URL, log, uuid } from "./utils";
import { CountData, ReportCounterData } from "../interfaces";
const htmlentities = require('html-entities/lib/html4-entities');

/**
 * 用于生成写入HTML中的统计数据
 * 实际没什么功能性的东西，主要是防止忘记写错统计字段
 */
export function generateHTMLAttribute(data: CountData): string {
    const report = <ReportCounterData>{ category: 0, ...data };
    const result =  JSON.stringify(report);
    return `data-count-click="${htmlentities.encode(result)}"`;
}

// 监听点击
export const click = async (data: CountData) => {
    const guid = await uuid();
    const result = JSON.stringify({ guid, ...data });
    const date = new Date();
    log(`${URL}?msgtype=web&action=click&data=${result}&tt=${date.getTime()}`);
}

export async function error(msg: string) {
    const guid = await uuid();
    const result = JSON.stringify({ guid, msg });
    const date = new Date();
    log(`${URL}?msgtype=web&action=error&data=${result}&tt=${date.getTime()}`);
}

export default () => {
    // 监听点击页面的链接统计
    $('body').on('click', 'a[data-count-click]', function () {
        let data;
        try {
            data = JSON.parse($(this).attr('data-count-click'));
        } catch (e) {}
        if (data) {
            click(data);
        }
    });
};