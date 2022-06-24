import { getLayerSvg } from "./../../data/svg";
import { select } from "d3";
import { floors } from "../../data/svg";
import { Layer, LayersMode } from "../LayerStore";
import RootStore from "../RootStore";

export default function initLayers(store: RootStore) {
    const { layerStore } = store;

    const fpLayers = window["__fpLayers"] as Layer[];
    layerStore.mode = fpLayers ? LayersMode.Lazy : LayersMode.Default;

    let layers: Layer[] = [];
    if (fpLayers) {
        layers = fpLayers.map((layer) => {
            let l = new Layer();
            l.name = layer.name;
            l.description = layer.description;
            l.rect = layer.rect;
            return l;
        });
    } else {
        select(getLayerSvg())
            .selectAll<SVGAElement, unknown>("svg  [data-layer]")
            .nodes()
            .filter((n) => n.childNodes.length)
            .forEach((layer) => {
                const layerID = layer.getAttribute("data-layer");
                if (!layerID.startsWith("WF")) {
                    let l = new Layer();
                    l.name = layerID;
                    l.description = layer.getAttribute("data-layer-description") || layerID;
                    l.rect = floors.filter((f) => f.name === l.name || f.name === l.description)[0]?.rect;
                    layers.push(l);
                }
            });
    }

    layerStore.defaultLayer = layers.find((l) => l.name === window["__fpDefaultLayer"])?.name;

    layers.forEach(
        (layer, index) =>
            (layer.visible =
                store.layerStore.mode !== LayersMode.Single ||
                layer.name === layerStore.defaultLayer ||
                (!layerStore.defaultLayer && index === 0))
    );

    layerStore.layers.push(...layers);
}
