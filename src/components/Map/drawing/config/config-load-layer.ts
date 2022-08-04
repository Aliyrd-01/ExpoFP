import store from "../../../../store";
import initBooths from "../../../../store/init/init-booths";
import { Layer, LayersMode } from "../../../../store/LayerStore";
import { loadJs } from "../../../../tools/loaders";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import { getContext } from "./config-all";
import configBg from "./config-bg";
import configBooths from "./config-booths";
import configSizes from "./config-sizes";

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
                layer.loaded = true;
            } catch {
                return reject();
            }
        } else if (store.layerStore.mode === LayersMode.Default) layer.loaded = true;

        const booths = initBooths(store, layer.name);
        if (booths.length) {
            configBooths(context, layer.name, booths, layer.basePriority + 3, layer.visible)();
            context.getLayersPainters([layer.name]).forEach((p) => p.preparePaint());
        }

       // configSizes(context, layer.name, layer.basePriority + 10, layer.visible);

        if (!withConfiguration) return resolve(false);
        layer.configured = true;

        configBg(context, layer.name, layer.basePriority, layer.visible);

        context.updateMatrixScale();
        context.requireUpdate(null);

        resolve(true);
    });
}
