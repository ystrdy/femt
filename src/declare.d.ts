interface ISettings {
    // 基本属性
    release?: string;
    packTo?: string;
    packOrder?: number;
    query?: string;
    id?: string;
    moduleId?: string;
    url?: string;
    charset?: string;
    isHtmlLike?: boolean;
    isCssLike?: boolean;
    isJsLike?: boolean;
    useHash?: boolean;
    domain?: string;
    rExt?: string;
    useMap?: boolean;
    isMod?: boolean;
    extras?: object;
    requires?: string[];
    useSameNameRequire?: boolean;
    useCache?: boolean;
    useCompile?: boolean;
    // 插件属性
    lint?: PluginDefine;
    parser?: PluginDefine;
    preprocessor?: PluginDefine;
    standard?: PluginDefine;
    postprocessor?: PluginDefine;
    optimizer?: PluginDefine;
    // 打包属性
    prepackager?: PluginDefine;
    packager?: PluginDefine;
    spriter?: PluginDefine;
    postpackager?: PluginDefine;
    deploy?: PluginDefine;
}

type PluginPosition = 'prepend' | 'append';

interface IPluginOptions {
    __name: string;
    __pos: PluginPosition;
    __isPlugin: boolean;
}

interface IFile {
    ext: string;                // 文件名后缀。
    realpath: string;           // 文件物理地址。
    realpathNoExt: string;      // 文件物理地址，没有后缀。
    subpath: string;            // 文件基于项目 root 的绝对路径。
    subpathNoExt: string;       // 文件基于项目 root 的绝对路径，没有后缀。
    useCompile: boolean;        // 标记是否需要编译。
    useDomain: boolean;         // 标记是否使用带domain的地址。
    useCache: boolean;          // 编译过程中是否采用缓存。
    useMap: boolean;            // 编译后是否将资源信息写入 map.json 表。
    domain: string;             // 文件的 domain 信息，在 useDomain 为 true 时会被作用在链接上。
    release: false | string;    // 文件的发布路径，当值为  false 时，文件不会发布。
    url: string;                // 文件访问路径。
    id: string;                 // 文件 id 属性，默认为文件在项目中的绝对路径，不建议修改。
    requires: any[];            // 用来记录文件依赖。
    asyncs: any[];              // 用来记录异步依赖。
    links: any[];               // 用来记录此文件用到了哪些文件。
    derived: any[];             // 用来存放派生的文件，比如 sourcemap 文件。
    extras: any;                // 用来存放一些附属信息，注意：此属性将会添加到 map.json 里面。
    isHtmlLike: boolean;        // 标记此文件是否为 html 性质的文件。
    isCssLike: boolean;         // 标记此文件是否为 css 性质的文件。
    isJsLike: boolean;          // 标记此文件是否为 javascript 性质的文件。
    isJsonLike: boolean;        // 标记此文件是否为 json 性质的文件。
    [propName: string]: any;
}

type PluginProcessor = (content: string, file: IFile, settings: ISettings) => string;

type PluginDefine = IPluginOptions | IPluginOptions[] | PluginProcessor | PluginProcessor[];

interface IFIS {
    set: (key: string, value: any) => IFIS;
    get: (key: string) => any;
    media: (mode: string) => IFIS;
    match: (selector: string, settings: ISettings, important?: boolean) => IFIS;
    plugin: (name: string, settings: any, position?: PluginPosition) => IPluginOptions;
}