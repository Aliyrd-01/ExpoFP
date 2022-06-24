import { uiState } from "./../../../../store/index";
import store from "../../../../store";
import { DrawerContext } from "../Drawer1";
import configCanvas from "./config-canvas";
import configDim from "./config-dim";

import configMatrix from "./config-matrix";
import configWf from "./config-wf";
import configYah from "./config-yah";
import loadLayer from "./config-load-layer";
import { LayersMode } from "../../../../store/LayerStore";

let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;

let _context: DrawerContext;
export let getContext = () => _context;

export default function configAll(context: DrawerContext = _context): void {
    _context = context;
    const { after, animate } = configMatrix(context);
    configDim(context);
    configCanvas(context);

    let basePriority = 6;
    let { layers } = store.layerStore;

    if (store.layerStore.defaultLayer) {
        const lrs = [].concat(layers);

        const dl = layers.find((l) => l.name === store.layerStore.defaultLayer);
        const index = layers.indexOf(dl);
        lrs.splice(index, 1);
        layers = [dl].concat(lrs);
    }

    layers.forEach((layer) => {
        loadLayer(layer, layer.visible, context).then((configured) => {
            console.info(`Layer '${layer.name}' loaded. configured: ${configured}`);
            if (configured) {
                after();
                context.requireUpdate(null);
            }
        });
    });

    basePriority = 20 * (layers.length + 2);

    if (context.updatable)
        window.setTimeout(() => {
            animate(null);
            if (store.layerStore.mode === LayersMode.Single) uiState.moveToRect = layers.find((l) => l.visible).rect;
            else if (store.layerStore.mode === LayersMode.Lazy) {
                if (store.layerStore.defaultLayer)
                    uiState.moveToRect = layers.find((l) => l.name === store.layerStore.defaultLayer)?.rect;
                else uiState.moveToRect = layers[0].rect;
            }
        }, delayAnimations);

    configWf(context, basePriority++, true);
    //configSizes(context, "Sizes", basePriority++, true);
    configYah(context);
    after();
}
