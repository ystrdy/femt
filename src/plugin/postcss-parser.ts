import postcss from "postcss";

function postcssParser(plugins?: postcss.AcceptedPlugin[], options?: postcss.ProcessOptions) {
    return function (content: string) {
        const ret = postcss(plugins).process(content, options);
        console.log(ret.css);
        return content;
    };
}

export default postcssParser;