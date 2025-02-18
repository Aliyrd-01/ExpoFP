import { boothStore, layersStore, uiState } from "./../../../../store/index";
import store from "../../../../store";
import { RegularBooth } from "../../../../store/BoothStore";
import initBooths from "../../../../store/init/init-booths";
import { Layer, LayersMode } from "../../../../store/LayerStore";
import { addVersionToUrl, loadJs } from "../../../../tools/loaders";
import { DrawerContext } from "./../Drawer1";
import { getContext } from "./config-all";
import configBg from "./config-bg";
import configBooths from "./config-booths";
import configSizes from "./config-sizes";
import { getChildLayers } from "../../../../store/init/init-layers";
import { chunkArray } from "../../../../utils";
import { BOOTHS_PAINTER_MARKER, SEPARATOR } from "../../../../constants";

function createChildLayers(layer: Layer) {
    if (layer.childLayers.length) return layer.childLayers;

    const childLayers = getChildLayers(layer, layer.basePriority, 15).layers;
    if (childLayers.length) {
        layer.childLayers = childLayers;
    }

    return childLayers;
}

function configLayer(l: Layer, context: DrawerContext, withConfiguration: boolean): Promise<boolean> {
    return new Promise((resolve) => {
        const booths = initBooths(store, l);
        const logosBooths = boothStore.booths.filter(
            (b) => b.rect && (!b.layer || b.layer === l || b.layer.childLayers.includes(l)) && b.exhibitors.find((e) => !!e.logoInBooth && !!e.logo) && !store.uiState.hideLogoInBooth
        ) as RegularBooth[];

        logosBooths.forEach((b) => (b.noLabels = true));

        const boothChunks = chunkArray(booths, 500);

        if (booths.length) {
            boothChunks.forEach((chunk, i) => {
                configBooths(context, `${l.name}${SEPARATOR}${BOOTHS_PAINTER_MARKER}${SEPARATOR}${i}`, chunk, l.basePriority + 3, l.visible)();
                context.getLayersPainters([`${l.name}${SEPARATOR}${BOOTHS_PAINTER_MARKER}${SEPARATOR}${i}`]).forEach((p) => p.preparePaint());
            })
        }

        l.loaded = true;

        if (layersStore.mode === LayersMode.CheckBox) configSizes(context, l.name, l.basePriority + 10, l.visible);

        if (!withConfiguration) {
            return resolve(false);
        }

        l.configured = true;

        configBg(context, l, l.basePriority, l.visible).then(() => {
            context.getLayersPainters([l.name]).forEach(p => (p.dim = Number(uiState.dimmed)));
            resolve(true);
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
                await loadJs(addVersionToUrl(`${window["__dataUrlBase"]}fp.svg.${layer.name}.js`));
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
