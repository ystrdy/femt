import { Environment, FileSystemLoader, Template } from "nunjucks";
import { parse, join } from "path";
import { Random } from "mockjs";
import { project } from "fis3";

export interface ISettings {
    searchPath?: string | string[];         // 搜索路径，默认值为当前项目目录下的src文件夹
    context?: object;                       // 注入到模板的值
}

function nunjucksParser(settings?: ISettings) {
    let searchPath = join(project.getProjectPath(), 'src');
    if (settings && settings.searchPath) {
        searchPath = <string>settings.searchPath;
    }
    const loader = new FileSystemLoader(searchPath, { noCache: true });
    const originGetSource = loader.getSource;
    const options = {
        autoescape: false,
    };
    const environment = new Environment(loader, options);

    return function (content: string, file: IFile) {
        // 给fis系统中的文件添加依赖
        loader.getSource = (name: string) => {
            if (file.cache) {
                file.cache.addDeps(name);
            }
            return originGetSource.call(loader, name);
        };
        // 编译
        const { realpath } = file;
        let context = { file: parse(realpath), Random };
        if (settings && settings.context) {
            context = { ...context, ...settings.context };
        }
        const template = new Template(content, environment, realpath);
        return template.render(context);
    };
}

export default nunjucksParser;