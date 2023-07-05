import { layersStore, uiState } from "./../../../../store/index";
import store from "../../../../store";
import { DrawerContext } from "../Drawer1";
import configCanvas from "./config-canvas";
import configDim from "./config-dim";
import configMatrix from "./config-matrix";
import configWf from "./config-wf";
import configYah from "./config-yah";
import configGPS from "./config-gps";
import loadLayer from "./config-load-layer";
import { LayersMode } from "../../../../store/LayerStore";

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

    if (defaultLayer) {
        const lrs = [].concat(layers);
        const dl = layers.find((l) => l === defaultLayer);
        const index = layers.indexOf(dl);
        lrs.splice(index, 1);
        layers = [dl].concat(lrs);
    }

    var duration = 10;
    var animated = false;

    const promises = layers.map((layer) => {
        return loadLayer(layer, layer.visible || layer === defaultLayer, context).then((configured) => {
            if (!animated && configured) {
                animated = true;
                an(() => setTimeout(() => cb(), 2 * duration), duration);
            }
        });
    });

    Promise.all(promises).then(() => {
        layersStore.layersLoaded = true;

        const l =
            [...uiState.selectedBooths][0]?.layer ||
            store.uiState.selectedExhibitor?.booths[0]?.layer ||
            uiState.selectedRoute?.from?.layer ||
            store.routeStore.defaultFrom?.layer;

        const name = l?.name;

        if (name) {
            store.layerStore.updateVisibility(name, true);
            store.routeStore.currentRouteLayer = l;

            const booths =
                store.uiState.selectedExhibitor?.booths.filter((b) => b.layer?.name === name) ||
                [...store.uiState.selectedBooths].filter((b) => b.layer?.name === name);
            if (booths.length) store.uiState.moveToBooths = booths;
        }
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
    configGPS();
}
