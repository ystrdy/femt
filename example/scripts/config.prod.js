const path = require('path');
const { getProjectPath } = require('./utils');
const load = require('postcss-import/lib/load-content');
const fs = require('fs-extra');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    // HTML配置
    template: {
        searchPath: 'src',                  // 搜索的根目录
        patterns: ['views/**/*.njk'],         // 搜索规则
        outputPath: 'build/[name].html',    // 文件输出规则
        nunjucks: {
            autoescape: false,
        },
    },
    // css配置
    style: {
        searchPath: 'src',
        patterns: ['views/**/*.scss'],
        outputPath: 'build/css/[name].css',
        postcss: {
            parser: require('postcss-scss'),
            map: { inline: false },
            plugins: [
                require('stylelint')(),
                require('postcss-import')({
                    load: async function(...args) {
                        const content = await load.apply(this, args);
                        // 替换url里面的路径
                        const [ filename ] = args;
                        return content.replace(/url\(['"]?(.+?)['"]?\)/g, (_, url) => {
                            return `url(${path.resolve(path.dirname(filename), url)})`;
                        });
                    },
                }),
                require('precss'),
                require('postcss-automath'),
                require('cssgrace'),
                require('rucksack-css')(),
                require('postcss-sprites')({
                    stylesheetPath: './build/css',
                    spritePath: './build/images/',
                    filterBy: image => {
                        const relative = path.relative(
                            path.resolve(getProjectPath(), 'src'),
                            image.path
                        );
                        if (relative.startsWith('sprites')) {
                            return Promise.resolve();
                        }
                        return Promise.reject();
                    },
                    groupBy: image => {
                        const pathObj = path.parse(image.styleFilePath);
                        if (pathObj.name) {
                            return Promise.resolve(pathObj.name);
                        }
                        return Promise.reject(new Error('Not grouped.'));                        
                        /*
                        const relative = path.relative(
                            path.resolve(getProjectPath(), 'src/sprites'),
                            image.path
                        );
                        const { dir } = path.parse(relative);
                        if (!dir || !dir.length) {
                            return Promise.reject(new Error('Not grouped.'));
                        }
                        return Promise.resolve(dir);
                        */
                    },
                }),
                require('postcss-assets')(),
                require("postcss-url")({
                    url: function (asset) {
                        // 雪碧图
                        const { url } = asset;
                        if (/^\.\.\/images\/sprite.*\.png$/.test(url)) return url;
                        if (/^(http|https|data):/.test(url)) return url;
                        // 复制图片
                        const absolutePath = path.isAbsolute(url) ? url : asset.absolutePath;
                        const basename = path.basename(absolutePath);
                        const copyPath = path.resolve(getProjectPath(), 'build/images', basename);
                        if (fs.existsSync(absolutePath)) {
                            fs.ensureDirSync(path.dirname(copyPath));
                            fs.copyFileSync(absolutePath, copyPath);
                        }
                        // 返回路径
                        return `../images/${basename}`;
                    }
                }),
                require('autoprefixer'),
                require('cssnano')(),
                require('postcss-reporter')(),
            ],
        },
    },
    // js配置
    script: {
        searchPath: 'src',
        patterns: ['views/**/*.ts'],
        webpack: {
            mode: 'none',
            output: {
                filename: '[name].js',
                path: path.resolve(getProjectPath(), 'build/js'),
            },
            devtool: 'source-map',
            resolve: {
                extensions: ['.ts', '.js', '.json'],
            },
            module: {
                rules: [{
                    test: /\.ts$/,
                    enforce: 'pre',
                    use: [ 'tslint-loader' ]
                }, {
                    test: /\.ts$/,
                    use: [ 'ts-loader' ]
                }],
            },
            plugins: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: 4,
                    uglifyOptions: {
                        ie8: true,
                    },
                }),
            ],
        },
    },
    // 静态资源配置
    static: {
        rootDirectory: 'src/statics',
        outputPath: 'build',
        watchGlob: ['src/statics/**'],
    },
};