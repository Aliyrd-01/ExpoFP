import { getLayerSvg } from "./../../data/svg";
import { select } from "d3";
import { Layer, LayerMode, LayersMode } from "../LayerStore";
import RootStore from "../RootStore";

export default function initLayers(store: RootStore) {
    const { layerStore } = store;

    const fpLayers = window["__fpLayers"] as Layer[];
    layerStore.mode = window["__fpLayersMode"] || LayersMode.Default;

    let layers: Layer[] = [];
    if (fpLayers) {
        layers = fpLayers.map((layer) => {
            let l = new Layer();
            l.name = layer.name;
            l.description = layer.description;
            l.frozen = layer.frozen;
            l.visible = layer.visible;
            l.rect = layer.rect;
            l.mode = layer.mode || LayerMode.Unset;
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
                    l.visible = true;
                    l.description = layer.getAttribute("data-layer-description") || layerID;
                    l.frozen = layer.getAttribute("data-layer-isfrozen") === "true" ? true : false;
                    l.mode = LayerMode.Unset;
                    layers.push(l);
                }
            });
    }

    // Backward compatibilitty. Remove for future
    if (layerStore.mode === LayersMode.Radio) {
        layers.forEach((l) => {
            if (l.mode === LayerMode.AlwaysHidden) {
                l.frozen = true;
                l.visible = false;
            } else if (l.mode === LayerMode.AlwaysVisible) {
                l.frozen = l.visible = true;
            } else if (l.mode === LayerMode.TurnedOn || l.mode === LayerMode.TurnedOff) {
                l.frozen = false;
                l.visible = l.mode === LayerMode.TurnedOn;
            }
        });
    }

    layers = layers.filter((l) => !l.frozen || (l.frozen && l.visible));

    layerStore.defaultLayer = layers.find((l) => l.name === window["__fpDefaultLayer"]);

    layers.forEach((layer, index) => (layer.basePriority = 15 * (index + 1)));

    layerStore.layers.push(...layers);
}
