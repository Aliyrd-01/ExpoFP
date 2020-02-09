import { Drawer, DrawerConfig, DrawerUpdatables, DrawerWorkerMessage } from "./DrawerInterfaces";

let idSeq = 0;
const proxies = new Set<DrawerImplProxy>();
const allowWorker = typeof OffscreenCanvas != "undefined" && localStorage.getItem("disable-worker") !== "1";

export default class DrawerImplProxy implements Drawer {
    private id = idSeq++;
    private drawnResolve: () => void;
    private created: boolean;
    public readonly drawn: Promise<void>;
    public readonly updatablesQueue: DrawerUpdatables[] = [];
    constructor(public config: DrawerConfig) {
        this.drawn = new Promise(r => (this.drawnResolve = r));
        const workerCanvas = allowWorker ? this.config.canvas.transferControlToOffscreen() : this.config.canvas;
        const creatConfig = { ...config, canvas: workerCanvas };
        postMessage(
            {
                type: "create",
                id: this.id,
                params: [creatConfig] as any
            },
            [(workerCanvas as any) as Transferable]
        );
        proxies.add(this);
    }
    onmessage(ev: MessageEvent) {
        if (ev.data.id !== this.id) return;
        if (ev.data.type === "created") {
            this.created = true;
            this.setUpdatables();
        }
        if (ev.data.type === "drawn") this.drawnResolve();
    }
    setUpdatables(u?: DrawerUpdatables) {
        if (u) this.updatablesQueue.push(u);
        if (!this.created) return;
        for (const u2 of this.updatablesQueue) {
            postMessage({
                type: "setUpdatables",
                id: this.id,
                params: [u2]
            });
        }
        this.updatablesQueue.length = 0;
    }
    dispose() {
        postMessage({
            type: "dispose",
            id: this.id
        });
        proxies.delete(this);
    }
}

let postMessageImpl: (message: any, transfer?: Transferable[]) => Promise<void> | void;
async function postMessage(message: DrawerWorkerMessage, transfer?: Transferable[]) {
    if (!postMessageImpl) {
        if (allowWorker) {
            const ww = new Worker("drawer-worker.js");
            ww.onmessage = ev => proxies.forEach(p => p.onmessage(ev));
            postMessageImpl = ww.postMessage.bind(ww);
        } else {
            const { subscribeToMessages, postMessage } = await import(/* webpackChunkName: "drawer" */ "./impl/drawer");
            postMessageImpl = data => postMessage({ data } as MessageEvent);
            subscribeToMessages((data: DrawerWorkerMessage) => proxies.forEach(p => p.onmessage({ data } as MessageEvent)));
        }
    }

    postMessageImpl(message, transfer);
}
