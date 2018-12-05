import { launch } from "../../components/Counter";
import { invoke, Names } from "../../components/Client";

// 启动统计，监听来自客户端的统计消息
launch();

// 通知客户端，页面准备好了
invoke(Names.NOTIFYCLIENTWEBLOADED);