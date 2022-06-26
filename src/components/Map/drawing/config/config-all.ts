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
import { reaction } from "mobx";
import settings from "../../../../tools/settings";

let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;

let _context: DrawerContext;
export let getContext = () => _context;

export default function configAll(context: DrawerContext = _context): void {
    _context = context;
    const { animate } = configMatrix(context);
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

    var animated = false;
    layers
        //.filter((l) => store.layerStore.mode !== LayersMode.Radio || l.visible)
        .forEach((layer) => {
            loadLayer(layer, layer.visible, context).then((configured) => {
                if (!animated && configured) {
                    animated = true;
                    animate(cb, 0);
                }
            });
        });

    basePriority = 20 * (layers.length + 2);

    var cb = () => {
        if (context.updatable)
            if (store.layerStore.mode === LayersMode.Radio) uiState.moveToRect = layers.find((l) => l.visible)?.rect;
            else if (store.layerStore.mode === LayersMode.Separated) {
                if (store.layerStore.defaultLayer)
                    uiState.moveToRect = layers.find((l) => l.name === store.layerStore.defaultLayer)?.rect;
                else uiState.moveToRect = layers.find((l) => l.visible)?.rect;
            }
    };

    configWf(context, basePriority++, true);
    configYah(context);

    if (settings.EXPO !== "rodion2") return;

    var booths = false;
    reaction(
        () => context.ptscale,
        () => {
            let s = Math.max(context.ptscale < 1 ? Math.round(context.ptscale * 10) / 10 : Math.round(context.ptscale), 0.3);
            if (!booths && s < 2) {
                store.layerStore.updateVisibility("Booth", true);
                booths = true;
            } else if (booths && s >= 2) {
                store.layerStore.updateVisibility("Booth", false);
                booths = false;
            }
        }
    );
}
