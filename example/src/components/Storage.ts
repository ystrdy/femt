import { localStorage, NativeStorage, LocalStorage } from "./Client";

class Storage {
    private cache: object = {};
    private version: string = '3.0.0';
    private storage: NativeStorage | LocalStorage = localStorage;
    private field: string = 'IDs';
    public static async build(): Promise<Storage> {
        const instance = new this();
        await instance.init();
        return instance;
    }
    private async init() {
        // 清除老版本的历史数据
        const { storage, field } = this;
        const jsVersion = await storage.getItem('jsVersion');
        const currentJSVersion = this.version;
        if (jsVersion !== currentJSVersion) {
            await storage.clear();
            await storage.setItem('jsVersion', currentJSVersion)
        }
        // 读取数据到缓存
        let cache;
        try {
            cache = JSON.parse(await storage.getItem(field));
        } catch (error) {}
        if (cache) {
            this.cache = cache;
        }
    }
    public async get(): Promise<object>{
        return this.cache;
    }
    public async set(data: object){
        const { storage, field } = this;
        await storage.setItem(field, JSON.stringify(this.cache = data));
    }
}

export default Storage;

/**
 * 获取storage单例
 */
let instance: Storage;
const callbacks = [];
let running = false;
export function getInstance(): Promise<Storage> {
    if (instance) {
        return Promise.resolve(instance);
    } else {
        return new Promise<Storage>(async resolve => {
            callbacks.push(resolve);
            if (!running) {
                running = true;
                const inst = instance = await Storage.build();   
                for (let i = 0; i < callbacks.length; i++) {
                    callbacks[i](inst);
                }
            }
        });
    }
}