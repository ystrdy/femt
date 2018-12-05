const htmlentities = require('html-entities/lib/html4-entities');

export const SIZE = {
    _70x48: './images/placeholders/70x48.png',
    _94x58: './images/placeholders/94x58.png',
    _98x98: './images/placeholders/98x98.png',
    _120x68: './images/placeholders/120x68.png',
    _150x82: './images/placeholders/150x82.png',
    _158x186: './images/placeholders/158x186.png',
    _158x276: './images/placeholders/158x276.png',
    _166x82: './images/placeholders/166x82.png',
    _166x195: './images/placeholders/166x195.png',
    _166x200: './images/placeholders/166x200.png',
    _242x150: './images/placeholders/242x150.png',
    _320x358: './images/placeholders/320x358.png',
    _332x114: './images/placeholders/332x114.png',
    _332x136: './images/placeholders/332x136.png',
    _344x166: './images/placeholders/344x166.png',
    _498x142: './images/placeholders/498x142.png',
    _498x168: './images/placeholders/498x168.png',
    _512x276: './images/placeholders/512x276.png',
    _54x54: './images/placeholders/54x54.png',
    _82x82: './images/placeholders/82x82.png',
    _86x48: './images/placeholders/86x48.png',
    _404x186: './images/placeholders/404x186.png',
};

export const defaultRun = (image: HTMLImageElement) => {
    image.src = image.getAttribute('data-src');
    image.removeAttribute('data-src');
}

export const centerRun = (image: HTMLImageElement) => {
    const img = new Image();
    img.src = image.getAttribute('data-src');
    const { clientWidth: pw, clientHeight: ph } = <HTMLElement>image.parentNode;
    const { width: iw, height: ih } = img;
    let dw, dh, ml, mt;
    if (iw <= ih) {
        dh = ph;
        dw = dh * iw / ih;
        ml = (pw - dw) / 2;
        mt = 0;
    } else {
        dw = pw;
        dh = dw * ih / iw;
        ml = 0;
        mt = (ph - dh) / 2;
    }
    const { style } = image;
    style.width = `${dw}px`;
    style.height = `${dh}px`;
    style.marginLeft = `${ml}px`;
    style.marginTop = `${mt}px`;
    // 替换图片
    defaultRun(image);
};

/**
 * 生成用户懒加载的HTML属性
 * @param size 尺寸
 * @param real 真实的图片尺寸
 */
export function generateImageAttribute(size: string, real: string): string{
    return `src="${SIZE['_' + size]}" data-src="${htmlentities.encode(real)}"`;
}

const placeholder = async (images: JQuery, run = defaultRun) => {
    const promises = $.map(images, image => {
        return new Promise(resolve => {
            setTimeout(() => {
                const loader = new Image();
                loader.onload = () => {
                    run(image);
                    resolve();
                };
                loader.onerror = error => {
                    resolve(error);
                };
                loader.src = image.getAttribute('data-src');
            }, 100);
        });
    });
    return Promise.all(promises);
};

export default placeholder;