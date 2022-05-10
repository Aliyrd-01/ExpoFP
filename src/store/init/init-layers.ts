import { select } from "d3";
import svg from "../../data/svg";
import { Layer } from "../LayerStore";
import RootStore from "../RootStore";

export default function initLayers(store: RootStore) {
    const { layerStore } = store;

    select(svg)
        .selectAll<SVGAElement, unknown>("svg  [data-layer]")
        .nodes()
        .forEach((layer) => {
            if (layer.childNodes.length) {
                const layerID = layer.getAttribute("data-layer");

                let l = new Layer();
                l.name = layerID;
                l.visible = true;

                if (layerID !== "WF") layerStore.layers.push(l);
            }
        });
}
