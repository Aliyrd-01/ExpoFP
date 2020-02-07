import { Booth } from "../core/Booth";
import { Drawer, DrawerConfig, DrawerUpdatables, DrawerWorkerMessage } from "./DrawerInterfaces";
import { sleep } from "../utils";

let idSeq = 0;
const proxies = new Set<DrawerImplProxy>();
const allowWorker = typeof OffscreenCanvas != "undefined";
// alert(allowWorker);

export default class DrawerImplProxy implements Drawer {
    private id = idSeq++;
    private drawnResolve: () => void;
    private created: boolean;
    public readonly drawn: Promise<void>;
    public readonly updatablesQueue: DrawerUpdatables[] = [];
    constructor(
        canvas: HTMLCanvasElement,
        pixelRatio: number,
        config: DrawerConfig,
        svg: SvgJson,
        meshUrl: string,
        booths: Booth[]
    ) {
        this.drawn = new Promise(r => (this.drawnResolve = r));
        const workerCanvas = allowWorker ? canvas.transferControlToOffscreen() : canvas;
        postMessage(
            {
                type: "create",
                id: this.id,
                params: [workerCanvas, pixelRatio, config, svg, meshUrl, booths] as any
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
    // async postMessage(message: DrawerWorkerMessage, transfer?: Transferable[]) {
    //     ensureWorker();
    //     // if (!worker) {
    //     //     // const WorkerConstructor = PseudoWorker as any;
    //     //     worker = new Worker("drawer.js");
    //     //     worker.onmessage = ev => proxies.forEach(p => p.onmessage(ev));
    //     // }
    //     // console.log("posting message", message.type, message);
    //     worker.postMessage(message, transfer);
    // }
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
            // await sleep(90000);
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
