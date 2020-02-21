import { loadFont, loadJsonCached } from "../../tools/loaders";
import isWorker from "../../utils/in-worker";
import { DrawerConfig, DrawerUpdatables, DrawerWorkerMessage } from "../DrawerInterfaces";
import DrawerImpl from "./DrawerImpl";
// import {SvgJson} from '../../core/svg';

// export const D = new Drawer(null, null, null, null, null, null);

// async function createDrawerImpl(
//     canvas: HTMLCanvasElement,
//     pixelRatio: number,
//     config: DrawerConfig,
//     svg: SvgJson,
//     meshUrl: string,
//     booths: Booth[]
// ) {
//     // load meshes json
//     const mesh = await loadJson<SvgMeshJson>(meshUrl);
//     return new DrawerImpl(canvas, pixelRatio, config, svg, mesh, booths);
// }

const all = new Map<number, DrawerImpl>();
const drawnIds = new Set<number>();
const subscribers: ((message: any) => void)[] = [];

export function subscribeToMessages(postMessagBack: (message: DrawerWorkerMessage) => void) {
    subscribers.push(postMessagBack);
}
function postMessageBack(message: any) {
    subscribers.forEach(s => s(message));
}

export async function postMessage(e: MessageEvent) {
    if (!e.data?.type) return;
    // console.log("Drawer worker", e.data?.type, e);
    const m = e.data as DrawerWorkerMessage;
    const type = m.type;
    const p = m.params;
    const id = m.id;

    switch (type) {
        case "create":
            const config = p[0] as DrawerConfig;
            // debugger;
            self["__efpDebug"] = config.__efpDebug; // eslint-disable-line no-restricted-globals

            const fontPromisses = [
                loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-300.woff2", { weight: 300 }),
                loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-500.woff2", { weight: 500 })
            ];
            const mesh = await loadJsonCached<SvgMeshJson>(config.meshUrl);
            const implConfig = { ...config, mesh };

            delete implConfig.meshUrl;
            await Promise.all(fontPromisses);

            const drawer = new DrawerImpl(implConfig);
            all.set(id, drawer);
            postMessageBack({ type: "created", id });
            break;
        case "setUpdatables":
            {
                const dr = all.get(id);
                dr.setUpdatables(p[0] as DrawerUpdatables);
                if (!drawnIds.has(id)) {
                    drawnIds.add(id);
                    postMessageBack({ type: "drawn", id });
                }
            }
            break;
        case "dispose":
            {
                const dr = all.get(id);
                dr.dispose();
            }
            break;
    }
}

if (isWorker) {
    // eslint-disable-next-line
    const ctx: DedicatedWorkerGlobalScope = self as any;
    ctx.onmessage = postMessage;
    subscribeToMessages(m => ctx.postMessage(m));
}

///////////////////////////////////////////////////
// Helper functions
// async function loadJson<T>(url: string) {
//     const response = await fetch(url, { credentials: "same-origin" });
//     return (await response.json()) as T;
// }

// const mapJsonCache = new Map<string, any>();
// async function loadJsonCached<T>(url: string) {
//     let data = mapJsonCache.get(url);
//     if (!data) {
//         data = await loadJson(url);
//         mapJsonCache.set(url, data);
//     }
//     return data;
// }

// declare const FontFace: any;
// export async function loadFont(family: string, url: string, d?) {
//     if (typeof FontFace === "undefined") return;
//     // url = goodUrl(url);
//     d = { style: "normal", weight: "normal", ...(d || {}) };
//     const src = `url("${url}")`;

//     if (family.indexOf(" ") !== -1 && browser.isGecko) {
//         family = `'${family}'`;
//     }
//     const ff = new FontFace(family, src, d);
//     // eslint-disable-next-line
//     const documentFonts = isWorker ? self["fonts"] : (document["fonts"] as any);
//     documentFonts.add(ff);
//     return ff.load();
// }
