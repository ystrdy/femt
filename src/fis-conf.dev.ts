import { config } from "dotenv";
import nunjucksParser from "./plugin/nunjucks-parser";
import postcssParser from "./plugin/postcss-parser";
import load from "postcss-import/lib/load-content";
import { resolve, dirname } from "path";


// 配置环境变量
config();

declare const fis: IFIS;

fis.set('project.files', 'src/**/*.*');
fis.set('project.fileType.text', 'njk');

fis.hook('relative');

// fis.match('src/**/*', {
//     release: false,
// });

// 处理模板
['src/views/(*).njk', 'src/views/**/(*).njk'].forEach(selector => {
    fis.match(selector, {
        release: '$1',
        rExt: '.html',
        parser: nunjucksParser(),
        // relative: true,
    })
});

// 处理css
['src/views/(*).scss', 'src/views/**/(*).scss'].forEach(selector => {
    fis.match(selector, {
        release: 'css/$1',
        rExt: '.css',
        parser: postcssParser([
            require('postcss-import')({
                load: async function(...args) {
                    const content = await load.apply(this, args);
                    // 替换url里面的路径
                    const [ filename ] = args;
                    return content.replace(/url\(['"]?(.+?)['"]?\)/g, (_, url) => {
                        return `url(${resolve(dirname(filename), url)})`;
                    });
                },
            }),
            require('postcss-automath'),
            require('precss'),
            require('cssgrace'),
            require('rucksack-css')(),
            require('autoprefixer'),
        ], {
            parser: require('postcss-scss'),
            map: { inline: true },
            // map: { inline: false, prev: false, annotation: false },            
        }),
        // relative: true,
    });
});