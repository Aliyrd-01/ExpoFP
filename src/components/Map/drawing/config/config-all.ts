import { select } from "d3-selection";
import svg from "../../../../data/svg";
import store from "../../../../store";
import { LayersMode } from "../../../../store/LayerStore";
import { DrawerContext } from "../Drawer1";
import configCanvas from "./config-canvas";
import configDim from "./config-dim";
import configLayer from "./config-layer";
import configMatrix from "./config-matrix";
import configSizes from "./config-sizes";
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
    let { layers, mode: mode } = store.layerStore;

    select(svg)
        .selectAll<SVGAElement, unknown>("svg  [data-layer]")
        .nodes()
        .map((n) => n.getAttribute("data-layer"))
        .forEach((layerID, index) => {
            var layer = layers.filter((l) => l.name == layerID)[0];

            if (layer) {
                layer.basePriority = basePriority;
                basePriority += 20;
                configLayer(
                    layer,
                    context,
                    mode == LayersMode.Single && index !== 0,
                    index == 0 ? matrixAnimate : null
                ).then((configured) => console.info(`Layer '${layer.name}' loaded. configured: ${configured}`));
            }
        });

    configWf(context, basePriority++, true);
    configSizes(context, "Sizes", basePriority++, true);
    configYah(context);
    matrixAfter();
}
