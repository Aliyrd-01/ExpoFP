import { DrawerContext } from "./../Drawer1";
import store from "../../../../store";
import initBooths from "../../../../store/init/init-booths";
import { Layer, LayersMode } from "../../../../store/LayerStore";
import { loadJs } from "../../../../tools/loaders";
import settings from "../../../../tools/settings";
import logosFromBooths from "../../../../utils/logosFromBooths";
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

        const booths = initBooths(store, layer.name);

        const drawIcons: boolean = settings.EXPO === "techcrunch";
        if (drawIcons)
            booths.filter((b: any) => b.exhibitors?.find((e) => e.featured && e.logo)).forEach((b) => (b.noLabels = true));

        if (booths.length) {
            configBooths(context, layer.name, booths, layer.basePriority + 3, layer.visible)();
            context.getLayersPainters([layer.name]).forEach((p) => p.preparePaint());
        }

        layer.loaded = true;

        // configSizes(context, layer.name, layer.basePriority + 10, layer.visible);

        if (!withConfiguration) return resolve(false);
        layer.configured = true;

        configBg(
            context,
            drawIcons ? logosFromBooths(booths) : Promise.resolve([]),
            layer.name,
            layer.basePriority,
            layer.visible
        ).then(() => {
            context.requireUpdate(null);
            context.getLayersPainters([layer.name]).forEach((p) => (p.visible = layer.visible));
        });

        context.requireUpdate(null);
        resolve(true);
    });
}
