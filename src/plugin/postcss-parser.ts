import postcss from "postcss";

function postcssParser(plugins?: postcss.AcceptedPlugin[], options?: postcss.ProcessOptions) {
    return function (content: string, file: IFile): Promise<string> {
        return postcss(plugins).process(content, {
            from: file.realpath,
            ...options,
        }).then(result => result.css);
    };
}

export default postcssParser;