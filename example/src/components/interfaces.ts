/**
 * tab页的类型
 */
export enum TabComponentType {
    NEWS_FEED,                  // 信息流
    SHOP_CAROUSEL,              // 购物tab页1，带滚动图的
    SHOP_GRID,                  // 购物tab页2，纯网格图片
    DISCOUNT_COUPON,            // 优惠券
    GAME_STYLE,                 // 游戏频道
    SHOP_1111_TBAS,             // 购物页，双11tabs样式
    NEWS_FEED_360_PROCESS,      // 基于处理后的360的数据的信息流
    NEWS_FEED_360_INTERFACE,    // 基于360接口的信息流
};

/**
 * 分类的服务器数据
 */
export interface CategoryServerData {
    id: number,
    name: string,
    dataType: TabComponentType,
}

export enum RightTopType {
    TITLE_IMAGE,    // 带标题
    PURE_IMAGE,     // 纯图片
}

export interface RightTopServerData {
    id: number,
    dataType: RightTopType,
}

export enum HotsType {
    ARTICLE,            // 文章
    AD_NORMAL,          // 推荐的广告
    AD_BAIDU,           // 百度JS广告
    AD_360,             // 360JS广告
}

export interface HotsServerData {
    dataType: HotsType,
    id?: number,
}

export interface NewsFeedServerData {
    newsfeed: number[],
    righttop: RightTopServerData,
    hots: HotsServerData[],             // 24小时热点
}

export interface ShopCarouselServerData {
    carousel: number[],         // 焦点图广告id
    tmall: number[],            // 天猫广告id
    righttop: number[],         // 右上角广告id
    hot: number[],              // 热卖广告id
}

export interface ShopGridServerData {
    ids: number[],
}

export interface DiscountCouponServerData {
    coupons: number[],
}

export interface GameStyleServerData {
    carousel: number[],
    newslist: number[],
    gamematch: number[],
    gamelist: number[],
}

export type Shop1111TabsServerData = number[][];

/**
 * 新闻数据的渠道
 */
export enum NewsChannel {
    DONGFANG = 1,           // 东方头条
    QIHOO = 7,              // 360新闻
}

/**
 * 新闻数据
 */
export interface NewsServerData {
    id: number,
    title: string,
    images: string[],
    linkURL: string,
    channelId: NewsChannel,
    from: string,
    updateAt: string,
    editedTitle: string,
    [propName: string]: any,
}

/**
 * 广告数据
 */
export interface ADServerData {
    id: number,
    title: string,
    image: string,
    linkURL: string,
    channelId: string,
    [propName: string]: any,
}

/**
 * 统计类型
 */
export enum CountType {
    TAB_CHANGE,                     // tab页切换
    NEWS_FEED_NEWS,                 // 瀑布流
    NEWS_FEED_RIGHT_TOP,            // 信息流右侧顶部广告
    NEWS_FEED_HOT,                  // 信息流24小时热点
    TIPS,                           // tips
    NEWS_FEED_AD360,                // 360广告
    SHOP_CAROUSEL,                  // 购物页，带滚动图的板式
    SHOP_GRID,                      // 购物页，图片列表板式
    DISCOUNT_COUPON,                // 购物券页
    GAME_CHANNEL,                   // 游戏频道
    SHOP_1111_TBAS,                 // 购物页，双11tabs样式
    NEWS_FEED_360_PROCESS,          // 基于处理后的360的数据的信息流
    NEWS_FEED_360_INTERFACE,        // 基于360接口的信息流
    TEXT_LINK_REDIRECT,             // 文字广告重定向打点
    // 特殊的位置从100开始
    RENDER_NETWORK_ERROR = 100,     // 渲染错误页面
    TIPS_FULLIMAGE_AD = 101,        // tips的全屏广告
    SKIN_AD = 102,                  // 迷你页皮肤广告
    SPLASH_AD = 103,                // 开屏广告
}

/**
 * 统计上报的类型
 */
export interface ReportCounterData {
    guid: number,                   // 用户guid
    type: CountType,                // 位置类型
    category: number | string,      // 分类id，未使用则默认为0
    id: number | string,            // 文章ID
    channelId: number | string,     // 渠道号
}

/**
 * 统计数据类型
 */
export interface CountData {
    type: CountType,                // 位置类型
    id: number | string,            // 文章ID
    channelId: number | string,     // 渠道号
    category?: number | string,      // 分类id，未使用则默认为0
}

/**
 * 自己实现的jsonp方法
 */
export interface JSONPSettings {
    url: string,
    data?: object,
    jsonp?: string,
    jsonpCallback?: string,
    timeout?: number,
    isStaticServer?: boolean,       // 是否是静态服务器，如果设置为true，那么请求时，会去掉所有的参数
}

export enum SplashType {
    NORMAL,         // 正常的开屏广告
    SMALL,          // 只有小图的开屏广告
    WIDGET360,      // 360小挂件
}

export interface SplashServerData {
    open: boolean,
    dataType: SplashType,
    large: number,
    small: number,
}

export enum TipsType {
    NEWS_LIST,          // 新闻列表
    FULLSCREEN_IMAGE,   // 全屏的大图
}

export interface TipsServerData {
    dataType: TipsType,
}

/**
 * tips的新闻列表数据
 */
export interface TipsNewsListServerData extends TipsServerData {
    news: number[],
}

/**
 * tips的全屏图片数据
 */
export interface TipsFullImageServerData extends TipsServerData {
    id: number,
}

export enum SkinADType {
    RECOMMEND,                 // 编辑后台推荐的
    INTERFACE360,               // 360接口
}

export interface SkinADServerData {
    dataType: SkinADType,
    id?: number,
}