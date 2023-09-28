import { boothStore, layersStore } from "./../../../../store/index";
import store from "../../../../store";
import { RegularBooth } from "../../../../store/BoothStore";
import initBooths from "../../../../store/init/init-booths";
import { Layer, LayersMode } from "../../../../store/LayerStore";
import { loadJs } from "../../../../tools/loaders";
import logosFromBooths from "../../../../utils/imageloader";
import ImagePainter from "../painters/ImagePainter";
import { DrawerContext } from "./../Drawer1";
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
                await loadJs(`${window["__dataUrlBase"]}fp.svg.${layer.name}.js`);
            } catch {
                return reject();
            }
        }

        const booths = initBooths(store, layer.name);

        const logosBooths = boothStore.booths.filter(
            (b) => b.rect && (!b.layer || b.layer === layer) && b.exhibitors.find((e) => !!e.logoInBooth && !!e.logo)
        ) as RegularBooth[];

        logosBooths.forEach((b) => (b.noLabels = true));

        if (booths.length) {
            configBooths(context, layer.name, booths, layer.basePriority + 3, layer.visible)();
            context.getLayersPainters([layer.name]).forEach((p) => p.preparePaint());
        }

        layer.loaded = true;

        if (layersStore.mode === LayersMode.CheckBox) configSizes(context, layer.name, layer.basePriority + 10, layer.visible);

        if (!withConfiguration) return resolve(false);

        layer.configured = true;

        configBg(context, logosFromBooths(logosBooths), layer.name, layer.basePriority, layer.visible).then(() => {
            context.requireUpdate(null);
            var imagePainter = context.getLayersPainters([layer.name]).find((p) => p instanceof ImagePainter) as ImagePainter;
            if (!imagePainter) return;
            imagePainter.visible = layer.visible;
        });

        context.requireUpdate(null);
        resolve(true);
    });
}
