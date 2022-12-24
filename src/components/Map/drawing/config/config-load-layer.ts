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
import { RegularBooth } from "../../../../store/BoothStore";
import animate from "./animate";
import { easeLinear, interpolateNumber } from "d3";
import ImagePainter from "../painters/ImagePainter";

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

        const logosBooths = booths.filter(
            (b) => b instanceof RegularBooth && b.exhibitors.find((e) => !!e.logoInBooth && !!e.logo)
        ) as RegularBooth[];

        logosBooths.forEach((b) => (b.noLabels = true));

        if (booths.length) {
            configBooths(context, layer.name, booths, layer.basePriority + 3, layer.visible)();
            context.getLayersPainters([layer.name]).forEach((p) => p.preparePaint());
        }

        layer.loaded = true;

        // configSizes(context, layer.name, layer.basePriority + 10, layer.visible);

        if (!withConfiguration) return resolve(false);

        layer.configured = true;

        var logosSources = logosBooths.map((b) => b.exhibitors.find((e) => !!e.logoInBooth).logo);
        configBg(context, logosFromBooths(logosBooths, logosSources), layer.name, layer.basePriority, layer.visible).then(() => {
            context.requireUpdate(null);
            var imagePainter = context.getLayersPainters([layer.name]).find((p) => p instanceof ImagePainter) as ImagePainter;
            if (!imagePainter) return;

            //imagePainter.alpha = 0;
            imagePainter.visible = true;
            // animate(
            //     0,
            //     500,
            //     easeLinear,
            //     interpolateNumber(0, 1),
            //     context.requireUpdate.bind(context),
            //     (v) => (imagePainter.alpha = v)
            // );
        });

        context.requireUpdate(null);
        resolve(true);
    });
}
