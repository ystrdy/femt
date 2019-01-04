const chalk = require('chalk');
const Template = require('./template');
const Style = require('./style');
const Script = require('./script');
const Static = require('./static');
const Server = require('./server');
const config = require('./config.dev');

async function start() {
    // 首次编译
    await Promise.all([
        /**
         * 编译html
         */
        Template.build(config.template),
        /**
         * 编译style
         */
        Style.build(config.style),
        /**
         * 编译script
         */
        Script.build(config.script),
        /**
         * 编译静态资源
         */
        Static.build(config.static),
    ]);
    // 启动服务器
    const server = new Server(config.browserSync);
    await server.run();
    // 启动监听
    console.log(chalk.dim(chalk`\n{green Waiting for file changes...}`));
}

start();