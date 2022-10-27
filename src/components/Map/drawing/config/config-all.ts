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

//let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;

let _context: DrawerContext;
export let getContext = () => _context;

export default function configAll(context: DrawerContext = _context): void {
    _context = context;
    const { animate: an } = configMatrix(context);
    configDim(context);
    configCanvas(context);
    configYah(context);

    let basePriority = 6;
    let { layers, defaultLayer } = store.layerStore;

    //if (settings.EXPO === "rodion-test") configImg(context, 170, true);

    if (defaultLayer) {
        const lrs = [].concat(layers);
        const dl = layers.find((l) => l === defaultLayer);
        const index = layers.indexOf(dl);
        lrs.splice(index, 1);
        layers = [dl].concat(lrs);
    }

    var counter = layers.length;
    var loaded = 0;

    var duration = 10;
    var animated = false;
    layers.forEach((layer) => {
        loadLayer(layer, layer.visible || layer === defaultLayer, context).then((configured) => {
            loaded++;
            if (counter === loaded) {
                // TODO: money2020usa fix. Do no show booths for hidden floors.
                if (store.layerStore.mode !== LayersMode.Default)
                    store.boothStore.booths = store.boothStore.booths.filter((b) => !!b.layer);
                var l = [...uiState.selectedBooths][0]?.layer?.name || uiState.selectedRoute?.from?.layer.name;
                if (l) store.layerStore.updateVisibility(l, true);
            }

            if (!animated && configured) {
                animated = true;
                an(() => setTimeout(() => cb(), 2 * duration), duration);
            }
        });
    });

    basePriority = 20 * (layers.length + 2);

    var cb = () => {
        if (context.updatable)
            if (store.layerStore.mode === LayersMode.Radio) {
                uiState.moveToRect = layers.find((l) => l.visible)?.rect;
            } else if (store.layerStore.mode === LayersMode.Separated) {
                if (store.layerStore.defaultLayer && store.layerStore.defaultLayer.visible) {
                    uiState.moveToRect = layers.find((l) => l === store.layerStore.defaultLayer)?.rect;
                } else {
                    uiState.moveToRect = layers.find((l) => l.visible)?.rect;
                }
            }
    };

    configWf(context, basePriority++, true);
}
