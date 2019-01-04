import { Environment, FileSystemLoader, Template } from "nunjucks";
import { parse, join } from "path";
import { Random } from "mockjs";
import { project } from "fis3";

const searchPath = join(project.getProjectPath(), 'src');
const loader = new FileSystemLoader(searchPath, { noCache: true });
const originGetSource = loader.getSource;
const options = {
    autoescape: false,
};
const environment = new Environment(loader, options);

function nunjucksParser(content: string, file: IFile) {
    // 给fis系统中的文件添加依赖
    loader.getSource = (name: string) => {
        if (file.cache) {
            file.cache.addDeps(name);
        }
        return originGetSource.call(loader, name);
    };
    // 编译
    const { realpath } = file;
    const context = { file: parse(realpath), Random };
    const template = new Template(content, environment, realpath);
    return template.render(context);
}

export default nunjucksParser;