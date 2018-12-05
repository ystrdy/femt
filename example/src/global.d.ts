declare function require(path: string): any;

// 声明jQuery插件
interface JQuery {
    jcarousel(options?: any): JQuery;
    jcarouselAutoscroll(options?: any): JQuery;
    jcarouselControl(options?: any): JQuery;
    jcarouselPagination(options?: any): JQuery;
}