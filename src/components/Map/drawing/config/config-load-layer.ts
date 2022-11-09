import store from "../../../../store";
import initBooths from "../../../../store/init/init-booths";
import { Layer, LayersMode } from "../../../../store/LayerStore";
import { loadJs } from "../../../../tools/loaders";
import settings from "../../../../tools/settings";
import logosFromBooths from "../../../../utils/logosFromBooths";
import { DrawerContext } from "../Drawer1";
import { getContext } from "./config-all";
import configBg from "./config-bg";
import configBooths from "./config-booths";
import configImg from "./config-img";

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

        // const drawIcons: boolean = settings.EXPO === "techcrunch";
        // if (drawIcons)
        //     booths.filter((b: any) => b.exhibitors?.find((e) => e.featured && e.logo)).forEach((b) => (b.noLabels = true));

        if (booths.length) {
            configBooths(context, layer.name, booths, layer.basePriority + 3, layer.visible)();
            context.getLayersPainters([layer.name]).forEach((p) => p.preparePaint());
        }

        layer.loaded = true;

        // configSizes(context, layer.name, layer.basePriority + 10, layer.visible);

        if (!withConfiguration) return resolve(false);
        layer.configured = true;

        await configBg(context, layer.name, layer.basePriority, layer.visible);
        
        // Exhibitors logos drawing
        // if (drawIcons) {
        //     await configImg(
        //         context,
        //         layer.name,
        //         (await logosFromBooths(booths)).filter((l) => !!l),
        //         layer.basePriority + 6,
        //         layer.visible
        //     );
        // }

        context.updateMatrixScale();
        context.requireUpdate(null);

        resolve(true);
    });
}
