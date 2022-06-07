import store from "../../../../store";
import { Layer } from "../../../../store/LayerStore";
import { loadJs } from "../../../../tools/loaders";
import settings from "../../../../tools/settings";
import { DrawerContext } from "./../Drawer1";
import configBg from "./config-bg";
import configBooths from "./config-booths";

var _boothsAnimations = null;

export default async function configLayer(
    layer: Layer,
    context: DrawerContext,
    boothsAnimations: any[] = _boothsAnimations
): Promise<void> {
    _boothsAnimations = _boothsAnimations || boothsAnimations;

    if (layer.configured) return Promise.resolve();

    return new Promise(async (resolve, reject) => {
        if (store.layerStore.separated) await loadLayerData(layer.name);
        layer.configured = true;

        configBg(context, layer.name, layer.basePriority, layer.visible);

        const booths = store.boothStore.booths.filter((b) => b.layer.name === layer.name);
        if (booths.length) _boothsAnimations.push(configBooths(context, layer.name, booths, layer.basePriority++, layer.visible));

        resolve();
    });
}

function loadLayerData(layerId: string): Promise<void> {
    return new Promise((accept) => {
        const url = `https://${settings.EXPO}.expofp.com/data/fp.svg.${layerId}.js`;
        loadJs(url).then(() => {
            accept();
        });
    });
}
