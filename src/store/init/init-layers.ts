import { getLayerSvg } from "./../../data/svg";
import { select } from "d3";
import { floors } from "../../data/svg";
import { Layer, LayersMode } from "../LayerStore";
import RootStore from "../RootStore";

export default function initLayers(store: RootStore) {
    const { layerStore } = store;
    let layers = [];

    const fpLayers = window["__fpLayers"] as Layer[];

    if (fpLayers) {
        layers = fpLayers.map((layer, index) => {
            let l = new Layer();
            l.name = layer.name;
            l.description = layer.description;
            l.visible = store.layerStore.mode !== LayersMode.Single || index === 0;
            l.rect = layer.rect;
            return l;
        });
    } else {
        select(getLayerSvg())
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
    }

    layerStore.layers.push(...layers);
}
