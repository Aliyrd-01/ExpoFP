import { select } from "d3";
import svg, { floors } from "../../data/svg";
import { Layer, LayersMode } from "../LayerStore";
import RootStore from "../RootStore";

export default function initLayers(store: RootStore) {
    const { layerStore } = store;

    const layers = [];

    select(svg)
        .selectAll<SVGAElement, unknown>("svg  [data-layer]")
        .nodes()
        .filter((n) => n.childNodes.length)
        .forEach((layer, index) => {
            const layerID = layer.getAttribute("data-layer");
            if (!layerID.startsWith("WF")) {
                let l = new Layer();
                l.name = layerID;
                l.description = layer.getAttribute("data-layer-description") || layerID;
                l.visible = store.layerStore.mode !== LayersMode.Single || index === 0;
                l.rect = floors.filter((f) => f.name === l.name || f.name === l.description)[0]?.rect;
                layers.push(l);
            }
        });

    layerStore.layers.push(...layers);
}
