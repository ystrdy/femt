import nunjucksParser from "./plugin/nunjucks-parser";
import postcssParser from "./plugin/postcss-parser";

declare const fis: IFIS;

fis.set('project.files', 'src/**/*.*');
fis.set('project.fileType.text', 'njk');

// 处理模板
fis.match('src/views/**/(*).njk', {
    release: '$1',
    rExt: '.html',
    parser: nunjucksParser(),
    deploy: fis.plugin('local-deliver', {
        to: 'build'
    }),
});

// 处理css
fis.match('src/views/**/(*).scss', {
    release: '$1',
    rExt: '.css',
    parser: postcssParser([
        require('precss'),
    ], {
        parser: require('postcss-scss'),
    }),
    deploy: fis.plugin('local-deliver', {
        to: 'build/css'
    }),
});