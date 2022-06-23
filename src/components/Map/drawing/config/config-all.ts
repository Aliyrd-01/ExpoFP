import store from "../../../../store";
import { LayersMode } from "../../../../store/LayerStore";
import { DrawerContext } from "../Drawer1";
import configCanvas from "./config-canvas";
import configDim from "./config-dim";
import loadLayer from "./config-layer";
import configMatrix from "./config-matrix";
import configWf from "./config-wf";
import configYah from "./config-yah";

let _context: DrawerContext;
export let getContext = () => _context;

export default function configAll(context: DrawerContext = _context): void {
    _context = context;
    const { after: matrixAfter, animate: matrixAnimate } = configMatrix(context);
    configDim(context);
    configCanvas(context);

    let basePriority = 6;
    let { layers, mode } = store.layerStore;

    layers.forEach((layer, index) => {
        if (layer) {
            layer.basePriority = basePriority;
            basePriority += 20;
            loadLayer(
                layer,
                layer.visible,
                context,
                (mode === LayersMode.Single && layer.visible) || mode === LayersMode.Default || index === 0 ? matrixAnimate : null
            ).then((configured) => console.info(`Layer '${layer.name}' loaded. configured: ${configured}`));
        }
    });

    configWf(context, basePriority++, true);
    //configSizes(context, "Sizes", basePriority++, true);
    configYah(context);
    matrixAfter();
}
