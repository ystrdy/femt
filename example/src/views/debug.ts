// 添加样式
const style: HTMLStyleElement = document.createElement('style');
style.type = 'text/css';
document.getElementsByTagName('head')[0].appendChild(style);
const css = `
    html, body{
        background: #000;
    }
    .index-container-dev-head{
        height: 40px;
        background: url(dev/dev-head.png) no-repeat 0 0;
    }
`;
if (style['styleSheet']) {
    style['styleSheet'].cssText = css;
} else {
    style.appendChild(document.createTextNode(css));
}

// 添加一个头部
if ($('.index-container').length) {
    $('body').prepend('<div class="index-container-dev-head"></div>')
}