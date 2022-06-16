import store from "../../../../store";
import { Layer } from "../../../../store/LayerStore";
import { loadJs } from "../../../../tools/loaders";
import settings from "../../../../tools/settings";
import { DrawerContext } from "./../Drawer1";
import configBg from "./config-bg";
import configBooths from "./config-booths";

let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;

export default async function configLayer(
    layer: Layer,
    context: DrawerContext,
    onlyLoading: boolean,
    matrixAnimate = null
): Promise<boolean> {
    if (layer.configured && layer.loaded) return Promise.resolve(true);

    return new Promise(async (resolve, reject) => {
        if (store.layerStore.separated && !layer.loaded) {
            await loadLayerData(layer.name);
        }
        layer.loaded = true;

        if (!onlyLoading) {
            layer.configured = true;

            configBg(context, layer.name, layer.basePriority, layer.visible);

            const boothsAnimations = [];
            const booths = store.boothStore.booths.filter((b) => b.layer.name === layer.name);
            if (booths.length)
                boothsAnimations.push(configBooths(context, layer.name, booths, layer.basePriority++, layer.visible));

            // to be running when all painters prepared
            if (context.updatable) {
                window.setTimeout(
                    () => boothsAnimations.forEach((ba) => (matrixAnimate ? matrixAnimate(ba) : ba())),
                    delayAnimations
                );
            }
            resolve(true);
        } else {
            resolve(false);
        }
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
