const browserSync = require("browser-sync");

let count = 0;
class Server {
    constructor(config){
        this.config = config;
    }
    getServerName() {
        if (this.serverName) {
            return this.serverName;
        }
        return (this.serverName = `Server ${++count}`);
    }
    async run(){
        // 启动服务器
        await new Promise(resolve => {
            const instance = browserSync.create(this.getServerName());
            instance.init(this.config, () => resolve(instance));
        });
    }
    reload(){}
}

module.exports = Server;