import nunjucksParser from "./plugin/nunjucks-parser";

declare const fis: IFIS;

fis.set('project.files', 'src/**/*.*');
fis.set('project.fileType.text', 'njk');

fis.match('src/views/**/(*).njk', {
    release: '$1',
    rExt: '.html',
    parser: nunjucksParser(),
    deploy: fis.plugin('local-deliver', {
        to: 'build'
    }),
});