import { DrawerUpdatables, DrawerWorkerMessage } from "../DrawerInterfaces";
import DrawerImpl from "./DrawerImpl";
import browser from "../../utils/browser";
import isWorker from "../../utils/is-worker";
// import {SvgJson} from '../../core/svg';

// eslint-disable-next-line
const ctx: DedicatedWorkerGlobalScope = (self as WorkerGlobalScope) as DedicatedWorkerGlobalScope;
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

ctx.onmessage = async function(e) {
    if (!e.data?.type) return;
    // console.log("Drawer worker", e.data?.type, e);
    const m = e.data as DrawerWorkerMessage;
    const type = m.type;
    const p = m.params;
    const id = m.id;

    switch (type) {
        case "create":
            // const url = p[4];
            // console.log("url", url);
            const fontPromisses = [
                loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-300.woff2", { weight: 300 }),
                loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-500.woff2", { weight: 500 })
            ];
            const mesh = await loadJsonCached<SvgMeshJson>(p[4]);
            await Promise.all(fontPromisses);
            const drawer = new DrawerImpl(p[0] as HTMLCanvasElement, p[1], p[2], p[3], mesh, p[5]);
            all.set(id, drawer);
            ctx.postMessage({ type: "created", id });
            break;
        case "setUpdatables":
            {
                const dr = all.get(id);
                dr.setUpdatables(p[0] as DrawerUpdatables);
                if (!drawnIds.has(id)) {
                    drawnIds.add(id);
                    ctx.postMessage({ type: "drawn", id });
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
};

async function loadJson<T>(url: string) {
    const response = await fetch(url);
    return (await response.json()) as T;
}

const mapJsonCache = new Map<string, any>();
async function loadJsonCached<T>(url: string) {
    let data = mapJsonCache.get(url);
    if (!data) {
        data = await loadJson(url);
        mapJsonCache.set(url, data);
    }
    return data;
}

declare const FontFace: any;
export async function loadFont(family: string, url: string, d?) {
    if (typeof FontFace === undefined) return;
    // url = goodUrl(url);
    d = { style: "normal", weight: "normal", ...(d || {}) };
    const src = `url("${url}")`;

    // if (!window["FontFace"]) {
    //     if (!family.startsWith("Font Awesome")) {
    //         injectFontFace(family, src, d);
    //     }
    //     return Promise.resolve();
    // }

    if (family.indexOf(" ") !== -1 && browser.getEngine()?.name === "Gecko") {
        family = `'${family}'`;
    }
    const ff = new FontFace(family, src, d);
    const documentFonts = isWorker ? ctx["fonts"] : (document["fonts"] as any);
    documentFonts.add(ff);
    return ff.load();
}
// interface CreateData {
//     type: "create";
//     params: {
//         canvas: OffscreenCanvas | HTMLCanvasElement;
//         pixelRatio: number;
//         config: DrawerConfig;
//         svg: SvgJson;
//         mesh: SvgMeshJson;
//         booths: Booth[];
//     };
// }

// interface SetUpdatablesData {
//     type: "setUpdatables";
//     params: DrawerUpdatables;
// }

// type Data = CreateData: SetUpdatablesData;

/*
Messages to worker
    create
    dispose
    setUpdatables

Message back:
    created
*/
