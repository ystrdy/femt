import TabComponent from "../TabComponent/TabComponent";
import { DiscountCouponServerData, ADServerData, CountType } from "../interfaces";
import { getContent, getADByID } from "../server";
import { generateHTMLAttribute } from "../Counter";
import placeholder, { generateImageAttribute } from "../ImagePlaceholder";
const QRCode = require('qrcodejs2');

class TabDiscountCoupon extends TabComponent {
    protected async render(): Promise<void> {
        const { element, categoryData } = this;
        // 获取数据
        const data: DiscountCouponServerData = await getContent(categoryData);
        if (!data || !data.coupons || !data.coupons.length) {
            throw new Error('服务器数据出错.');
        }
        const promises = [];
        for (let i = 0; i < data.coupons.length; i++) {
            const id = data.coupons[i];
            const promise = getADByID(id).catch(() => null);
            promises.push(promise);
        }
        const items: ADServerData[] = await Promise.all(promises);
        // 渲染
        let html = '';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;
            const clickcount = generateHTMLAttribute({
                type: CountType.DISCOUNT_COUPON,
                id: item.id,
                channelId: item.channelId,
                category: categoryData.id,
            });
            const price = +item.goods_price;
            const percent = Math.round(Math.random() * 60 + 20);
            html += `
                <a href="${item.linkURL}" ${clickcount}>
                    <img ${generateImageAttribute('98x98', item.image)}>
                    <div class="tab-dc-price"><b>￥</b><i>${price}</i>${item.denomination}</div>
                    <div class="tab-dc-intro">${item.title}</div>
                    <div class="tab-dc-progress">
                        <span>剩余${percent}%</span>
                        <i><span style="width:${percent}%"></span></i>
                    </div>
                </a>
            `;            
        }
        const wrap = $(`
            <div class="tab-discount-coupon">
                <div class="tab-dc-text1">↓ 这里有淘宝优惠券信息 ↓</div>
                <div class="tab-dc-text2">每日更新价格超实惠天猫优惠券等你来拿！</div>
                <div class="tab-dc-form">
                    <form action="/additional/coupon/index.html">
                        <label class="tab-dc-keyword"><input name="keyword" autocomplete="off"><p>搜索标题，关键字或者商品链接</p></label>
                        <label class="tab-dc-submit"><input type="submit"></label>
                    </form>
                </div>
                <div class="tab-dc-tit1">
                    <h2>今日特惠<i></i></h2>
                    <p>小编精挑细选为你奉上优惠券</p>
                </div>
                <div class="tab-dc-grids">${html}</div>
                <a href="/additional/coupon/index.html" class="tab-dc-more"></a>
                <div class="tab-dc-qrcode">
                    <div class="tab-dc-shop-qrcode">
                        <div class="tab-dc-sq-code"><div></div></div>
                        <div class="tab-dc-sq-text">手机淘宝扫码领券</div>
                    </div>
                </div>
            </div>
        `);
        element.append(wrap);
        // 二维码
        const qrElement = element.find('.tab-dc-qrcode');
        const qrcode = new QRCode(qrElement.find('.tab-dc-sq-code div').get(0), {
            width: 108,
            height: 108,
            correctLevel : QRCode.CorrectLevel.L,
        });
        let isCreated = false;
        qrElement.hover(
            () => {
                qrElement.addClass('cur');
                if (!isCreated) {
                    isCreated = true;
                    setTimeout(() => {
                        qrcode.makeCode('https://s.click.taobao.com/iZjeeLw');
                    }, 10);
                }
            },
            () => qrElement.removeClass('cur')
        );
        // 搜索
        $('.tab-dc-form', element).each(function () {
            const input = $('.tab-dc-keyword input', this);
            const p = $('.tab-dc-keyword p', this);
            const focus = () => {
                p.hide();
            };
            const blur = () => {
                const value = <string>(input.val() || '');
                if (value.length) {
                    p.hide();
                } else {
                    p.show();
                }
            };
            input.on('focus', focus);
            input.on('blur', blur);
        });
        // 图片占位
        placeholder(element.find('img'));
    }
}

export default TabDiscountCoupon;