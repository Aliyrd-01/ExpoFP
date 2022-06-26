import store from "../../../../store";
import initBooths from "../../../../store/init/init-booths";
import { Layer, LayersMode } from "../../../../store/LayerStore";
import { loadJs } from "../../../../tools/loaders";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import { getContext } from "./config-all";
import configBg from "./config-bg";
import configBooths from "./config-booths";

export default async function loadLayer(
    layer: Layer,
    withConfiguration: boolean = true,
    context: DrawerContext = getContext()
): Promise<boolean> {
    if (layer.configured) return Promise.resolve(true);

    return new Promise(async (resolve, reject) => {
        if (store.layerStore.mode !== LayersMode.Default && !window[`__fpPaths${layer.name}`]) {
            try {
                await loadJs(`https://${settings.EXPO}.expofp.com/data/fp.svg.${layer.name}.js`);
            } catch {
                return reject();
            }
        }

        initBooths(store, layer.name);

        if (!withConfiguration) return resolve(false);

        configBg(context, layer.name, layer.basePriority, layer.visible);

        const booths = store.boothStore.booths.filter((b) => b.layer.name === layer.name);
        if (booths.length) configBooths(context, layer.name, booths, layer.basePriority++, layer.visible)();

        layer.configured = true;

        context.updateMatrixScale();
        context.requireUpdate(null);

        resolve(true);
    });
}
