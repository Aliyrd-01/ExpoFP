import { boothStore, layersStore } from "./../../../../store/index";
import store from "../../../../store";
import { RegularBooth } from "../../../../store/BoothStore";
import initBooths from "../../../../store/init/init-booths";
import { Layer, LayerMode, LayersMode } from "../../../../store/LayerStore";
import { loadJs } from "../../../../tools/loaders";
import logosFromBooths from "../../../../utils/imageloader";
import ImagePainter from "../painters/ImagePainter";
import { DrawerContext } from "./../Drawer1";
import { getContext } from "./config-all";
import configBg from "./config-bg";
import configBooths from "./config-booths";
import configSizes from "./config-sizes";
import { select } from "d3-selection";
import { getLayerSvg } from "../../../../data/svg";
import { getChildLayers } from "../../../../store/init/init-layers";

function createChildLayers(layer: Layer) {
    if (layer.childLayers.length) return layer.childLayers;

    const childLayers = getChildLayers(layer, layer.basePriority).layers;
    if (childLayers.length) {
        layer.childLayers = childLayers;
    }

    return childLayers;
}

function configLayer(l: Layer, context: DrawerContext, withConfiguration: boolean): Promise<void> {
    return new Promise((resolve) => {
        const booths = initBooths(store, l);
        const logosBooths = boothStore.booths.filter(
            (b) => b.rect && (!b.layer || b.layer === l) && b.exhibitors.find((e) => !!e.logoInBooth && !!e.logo)
        ) as RegularBooth[];

        logosBooths.forEach((b) => (b.noLabels = true));

        if (booths.length) {
            configBooths(context, l.name, booths, l.basePriority + 3, l.visible)();
            context.getLayersPainters([l.name]).forEach((p) => p.preparePaint());
        }

        l.loaded = true;

        if (layersStore.mode === LayersMode.CheckBox) configSizes(context, l.name, l.basePriority + 10, l.visible);

        if (!withConfiguration) {
            resolve();
            return;
        }

        l.configured = true;

        configBg(context, logosFromBooths(logosBooths), l, l.basePriority, l.visible).then(() => {
            context.requireUpdate(null);
            var imagePainter = context.getLayersPainters([l.name]).find((p) => p instanceof ImagePainter) as ImagePainter;
            if (imagePainter) {
                imagePainter.visible = l.visible;
            }
            resolve();
        });
    });
}

export default async function loadLayer(
    layer: Layer,
    withConfiguration: boolean = true,
    context: DrawerContext = getContext()
): Promise<boolean> {
    if (layer.configured) return Promise.resolve(true);

    return new Promise(async (resolve, reject) => {
        if (store.layerStore.mode !== LayersMode.Default && !window[`__fpPaths${layer.name}`] && !layer.rootParent) {
            try {
                await loadJs(`${window["__dataUrlBase"]}fp.svg.${layer.name}.js`);
            } catch {
                return reject();
            }
        }

        const childLayers = createChildLayers(layer);

        if (childLayers.length) {
            layer.childLayers = childLayers;
        }

        let { layers } = store.layerStore;

        store.layerStore.layers = [
            ...layers,
            ...childLayers.filter((childLayer) => !layers.some((layer) => layer.name === childLayer.name)),
        ] as Layer[];

        await configLayer(layer, context, withConfiguration);
        await Promise.all(childLayers.map((l) => configLayer(l, context, withConfiguration)));

        context.requireUpdate(null);
        resolve(true);
    });
}
