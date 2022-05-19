import { select } from "d3";
import svg from "../../data/svg";
import { Layer } from "../LayerStore";
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
                l.visible = !store.layerStore.singleVisible || index === 0;
                layers.push(l);
            }
        });

    layerStore.layers.push(...layers);
}
