import { easeLinear } from "d3-ease";
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
import animate from "./animate";
import { interpolateNumber } from "d3-interpolate";
import RectPainter from "../painters/RectPainter";

//let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;

let _context: DrawerContext;
export let getContext = () => _context;

export default function configAll(context: DrawerContext = _context): void {
    _context = context;
    const { animate: an } = configMatrix(context);
    configDim(context);
    configCanvas(context);

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
    layers.forEach((layer) => {
        loadLayer(layer, layer.visible || layer === defaultLayer, context).then((configured) => {
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
    configYah(context);

    return;

    var booths = false;
    var edge = 10;
    reaction(
        () => uiState.zoomAfTransformK,
        () => {
            if (!booths && uiState.zoomAfTransformK > edge) {
                store.layerStore.updateVisibility("Booths", true);
                store.layerStore.updateVisibility("FG", true);
                booths = true;

                animate(0, 500, easeLinear, interpolateNumber(0, 1), context.requireUpdate.bind(context), (v) => {
                    context.getLayersPainters(["Booths", "FG"]).forEach((p) => ((p as RectPainter).alpha = v));
                });
            } else if (booths && uiState.zoomAfTransformK <= edge) {
                booths = false;
                animate(
                    0,
                    500,
                    easeLinear,
                    interpolateNumber(1, 0),
                    context.requireUpdate.bind(context),
                    (v) => context.getLayersPainters(["Booths", "FG"]).forEach((p) => ((p as RectPainter).alpha = v)),
                    () => {
                        store.layerStore.updateVisibility("Booths", false);
                        store.layerStore.updateVisibility("FG", false);
                    }
                );
            }
        }
    );
}
