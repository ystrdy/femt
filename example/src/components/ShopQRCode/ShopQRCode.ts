const QRCode = require('qrcodejs2');

class ShopQRCode {
    private container: JQuery;
    private element: JQuery;
    private size: number;
    constructor(container: JQuery, size = 78) {
        this.container = container;
        this.size = size;

        this.init();
    }
    private init() {
        const { container } = this;
        container.hover(
            () => this.show(),
            () => this.hide()
        );
    }
    private create() {
        const { container } = this;
        const element = $(`
            <div class="shop-qrcode">
                <div class="sq-cover"></div>
                <div class="sq-code"><div></div></div>
                <div class="sq-text">手机淘宝扫码</div>
            </div>
        `);
        element.appendTo(container).hide();
        // 生成二维码
        const { size } = this;
        const qrcode = new QRCode(element.find('.sq-code div').get(0), {
            width: size,
            height: size,
            correctLevel : QRCode.CorrectLevel.L,
        });
        setTimeout(() => {
            qrcode.makeCode(container.attr('href'));
        });
        if (container.css('position') === 'static') {
            container.css('position', 'relative');
        }
        return element;
    }
    public show() {
        if (!this.element) {
            this.element = this.create();
        }
        this.element.show();
    }
    public hide() {
        const { element } = this;
        if (element) {
            element.hide();
        }
    }
}

export default ShopQRCode;