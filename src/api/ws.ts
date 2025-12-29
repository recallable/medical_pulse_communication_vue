/**
 * WebSocket 服务模块
 * 封装了 WebSocket 的连接管理、心跳保活、断线重连、消息订阅与分发等核心功能。
 * 采用单例模式设计，确保全局只有一个 WebSocket 连接实例。
 */

/**
 * WebSocket 连接状态常量
 * 使用 as const + type 组合替代 enum，以兼容 erasableSyntaxOnly 编译选项
 */
export const WsStatus = {
    CLOSED: 'CLOSED',         // 连接已关闭
    CONNECTING: 'CONNECTING', // 正在连接中
    OPEN: 'OPEN',             // 连接已建立
} as const;

export type WsStatus = typeof WsStatus[keyof typeof WsStatus];

/**
 * WebSocket 消息处理回调函数类型定义
 * @param data 解析后的消息数据 (如果是 JSON 则为对象，否则为字符串)
 */
export type WsMessageHandler = (data: any) => void;

class WebSocketService {
    // 单例实例
    private static instance: WebSocketService;

    // WebSocket 原生对象
    private ws: WebSocket | null = null;

    // 连接地址
    private url: string = '';

    // 当前连接状态
    private status: WsStatus = WsStatus.CLOSED;

    // 消息订阅者集合
    private messageHandlers: Set<WsMessageHandler> = new Set();

    // --- 配置项 ---

    /** 心跳间隔时间 (毫秒)，默认 30秒 */
    private heartbeatInterval: number = 30000;

    /** 重连尝试间隔时间 (毫秒)，默认 5秒 */
    private reconnectInterval: number = 5000;

    /** 最大重连尝试次数，默认 10次 */
    private maxReconnectAttempts: number = 10;

    // --- 内部状态 ---

    /** 当前已重连次数 */
    private reconnectAttempts: number = 0;

    /** 心跳定时器引用 */
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    /** 重连定时器引用 */
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    /** 
     * 心跳消息生成工厂函数 
     * 默认发送 { type: 'heartbeat' }
     */
    private heartbeatMessageFactory: () => any = () => ({ type: 'heartbeat' });

    // 私有构造函数，防止外部直接 new
    private constructor() {
        // throw new Error('WebSocketService 不能直接实例化，请使用 getInstance() 方法获取单例实例');
    }

    /**
     * 获取 WebSocketService 单例
     * @returns WebSocketService 实例
     */
    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    /**
     * 初始化并建立 WebSocket 连接
     * @param url WebSocket 服务地址 (如 ws://localhost:8080/ws)
     */
    public connect(url: string) {
        this.url = url;
        this.reconnectAttempts = 0; // 重置重连次数
        this.initWebSocket();
    }

    /**
     * 内部初始化 WebSocket 对象
     * 处理旧连接清理与新连接创建
     */
    private initWebSocket() {
        // 如果存在旧连接，先关闭（但不清除 URL 等状态，以便重连）
        if (this.ws) {
            this.close(false);
        }

        try {
            console.log(`正在连接 WebSocket: ${this.url}`);
            this.status = WsStatus.CONNECTING;

            // 创建新的 WebSocket 实例
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            let wsUrl = this.url;
            if (wsUrl.includes('undefined')) {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}') || JSON.parse(sessionStorage.getItem('userInfo') || '{}');
                wsUrl = wsUrl.replace('undefined', userInfo.id);
            }
            if (token) {
                const separator = wsUrl.includes('?') ? '&' : '?';
                wsUrl = `${wsUrl}${separator}token=${token}`;
            }
            this.ws = new WebSocket(wsUrl);

            // 绑定相关事件监听
            this.bindEvents();
        } catch (error) {
            console.error('WebSocket 连接创建失败:', error);
            // 创建失败直接尝试重连
            this.handleReconnect();
        }
    }

    /**
     * 绑定 WebSocket 原生事件
     */
    private bindEvents() {
        if (!this.ws) return;

        // 连接成功回调
        this.ws.onopen = () => {
            console.log('WebSocket 连接成功');
            this.status = WsStatus.OPEN;
            this.reconnectAttempts = 0; // 连接成功，重置重连计数
            this.startHeartbeat();      // 开启心跳
        };

        // 收到消息回调
        this.ws.onmessage = (event: MessageEvent) => {
            try {
                // 尝试解析 JSON 格式
                const data = JSON.parse(event.data);
                this.notifyHandlers(data);
            } catch (error) {
                // 解析失败则返回原始数据
                this.notifyHandlers(event.data);
            }
        };

        // 连接关闭回调
        this.ws.onclose = (event) => {
            console.log(`WebSocket 连接关闭: Code ${event.code}, Reason: ${event.reason}`);
            this.status = WsStatus.CLOSED;
            this.stopHeartbeat(); // 停止心跳

            // 如果不是正常关闭 (1000)，则尝试重连
            if (event.code !== 1000) {
                this.handleReconnect();
            }
        };

        // 连接错误回调
        this.ws.onerror = (error) => {
            console.error('WebSocket 发生错误:', error);
            // 通常 onerror 之后会触发 onclose，所以重连逻辑主要在 onclose 中处理
        };
    }

    /**
     * 发送数据到服务器
     * @param data 要发送的数据 (支持对象或字符串，对象会自动 JSON.stringify)
     */
    public send(data: any) {
        if (this.ws && this.status === WsStatus.OPEN) {
            const payload = typeof data === 'string' ? data : JSON.stringify(data);
            this.ws.send(payload);
        } else {
            console.warn('WebSocket 未连接，无法发送消息:', data);
        }
    }

    /**
     * 订阅 WebSocket 消息
     * @param handler 消息处理函数
     */
    public onMessage(handler: WsMessageHandler) {
        this.messageHandlers.add(handler);
    }

    /**
     * 取消订阅 WebSocket 消息
     * @param handler 原消息处理函数引用
     */
    public offMessage(handler: WsMessageHandler) {
        this.messageHandlers.delete(handler);
    }

    /**
     * 分发消息给所有订阅者
     * @param data 消息数据
     */
    private notifyHandlers(data: any) {
        this.messageHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error('WebSocket 消息处理函数执行出错:', error);
            }
        });
    }

    /**
     * 手动关闭 WebSocket 连接
     * @param resetUrl 是否重置 URL (默认为 true)，如果为 false 则仅关闭连接但保留配置
     */
    public close(resetUrl: boolean = true) {
        this.stopHeartbeat();

        // 清除重连定时器
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            // 手动关闭时，移除 onclose 事件，防止触发自动重连逻辑
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }

        this.status = WsStatus.CLOSED;
        if (resetUrl) {
            this.url = '';
        }
    }

    /**
     * 处理断线重连逻辑
     */
    private handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('WebSocket 已达到最大重连次数，停止重连。');
            return;
        }

        if (this.reconnectTimer) return; // 如果已有重连任务在排队，则不重复添加

        const delay = this.reconnectInterval;
        console.log(`WebSocket 将在 ${delay}ms 后尝试重连... (第 ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} 次)`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnectAttempts++;
            this.initWebSocket();
        }, delay);
    }

    /**
     * 开启心跳保活
     */
    private startHeartbeat() {
        this.stopHeartbeat(); // 确保先清除旧的心跳定时器

        this.heartbeatTimer = setInterval(() => {
            if (this.status === WsStatus.OPEN) {
                // 发送心跳包
                this.send(this.heartbeatMessageFactory());
            }
        }, this.heartbeatInterval);
    }

    /**
     * 停止心跳保活
     */
    private stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 自定义心跳消息生成逻辑
     * @param factory 返回心跳消息数据的函数
     */
    public setHeartbeatMessage(factory: () => any) {
        this.heartbeatMessageFactory = factory;
    }
}

// 导出单例实例
export default WebSocketService.getInstance();
