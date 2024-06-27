import { getLayerSvg } from "./../../data/svg";
import { select } from "d3";
import { floors } from "../../data/svg";
import { Layer, LayerMode, LayersMode } from "../LayerStore";
import RootStore from "../RootStore";

const STEP_PRIORITY = 1000;

export function getChildLayers(layer: Layer, currentPriority: number, priorityStep: number): { layers: Layer[]; priority: number } {
    const childLayers: Layer[] = [];
    let priority = currentPriority;

    const children = select(getLayerSvg(layer))
        .selectAll<SVGAElement, unknown>(`svg [data-layer="${layer.name}"] > [data-layer]`)
        .nodes()
        .filter((n) => n.childNodes.length);

    children.forEach((childLayer) => {
        const layerID = childLayer.getAttribute("data-layer");

        let child = new Layer();
        child.name = childLayer.getAttribute("data-layer");
        child.visible = layer.visible;
        child.description = childLayer.getAttribute("data-layer-description") || layerID;
        child.frozen = childLayer.getAttribute("data-layer-isfrozen") === "true" ? true : false;
        child.rect = layer.rect;
        child.mode = LayerMode.Unset;
        child.rootParent = layer.rootParent ? layer.rootParent : layer;

        const grandChildResult = getChildLayers(child, priority, priorityStep);
        priority = grandChildResult.priority + priorityStep;
        child.basePriority = priority;

        if (grandChildResult.layers.length) {
            child.childLayers = grandChildResult.layers;
            childLayers.push(...grandChildResult.layers);
        }

        childLayers.push(child);
    });

    return { layers: childLayers, priority };
}

export default function initLayers(store: RootStore) {
    const { layerStore } = store;

    const fpLayers = window["__fpLayers"] as Layer[];
    layerStore.mode = window["__fpLayersMode"] || LayersMode.Default;

    const initLayer = new URLSearchParams(window.location.search).get("layer");

    const isvisible = (layer: Layer, shortName: string): boolean => {
        if (initLayer) return shortName.toLowerCase() === initLayer.toLowerCase();
        if (layerStore.mode !== LayersMode.Default) return layer.mode == LayerMode.TurnedOn;
        return layer.visible;
    };

    let layers: Layer[] = [];
    let priority = 0;
    if (fpLayers) {
        fpLayers.forEach(layer => {
            priority += STEP_PRIORITY;
            let l = new Layer();
            l.name = layer.name;
            l.description = layer.description;
            l.frozen = layer.frozen;
            l.visible = isvisible(layer, l.shortName);
            l.rect = layer.rect;
            l.mode = layer.mode || LayerMode.Unset;
            l.basePriority = priority;

            layers.push(l);
        });
    } else {
        select(getLayerSvg())
            .selectAll<SVGAElement, unknown>("svg > [data-layer]")
            .nodes()
            .filter((n) => n.childNodes.length)
            .forEach((layer) => {
                const layerID = layer.getAttribute("data-layer");
                if (!layerID.startsWith("WF")) {
                    priority += STEP_PRIORITY;
                    let l = new Layer();
                    l.name = layerID;
                    l.visible = true;
                    l.description = layer.getAttribute("data-layer-description") || layerID;
                    l.frozen = layer.getAttribute("data-layer-isfrozen") === "true" ? true : false;
                    l.rect = floors.filter((f) => f.name === l.name || f.name === l.description)[0]?.rect;
                    l.mode = LayerMode.Unset;
                    l.basePriority = priority;
                    layers.push(l);
                }
            });
    }

    // Backward compatibilitty. Remove for future
    if (layerStore.mode !== LayersMode.Default) {
        layers.forEach((l) => {
            if (l.mode === LayerMode.AlwaysHidden) {
                l.frozen = true;
                l.visible = false;
            } else if (l.mode === LayerMode.AlwaysVisible) {
                l.frozen = l.visible = true;
            } else if (l.mode === LayerMode.TurnedOff) {
                l.frozen = false;
                l.visible = false;
            } else if (l.mode === LayerMode.TurnedOn) {
                l.frozen = false;
                l.visible = true;
            }
        });
    }

    layers = layers.filter((l) => !l.frozen || (l.frozen && l.visible));

    layerStore.defaultLayer = layers.find((l) => l.name === window["__fpDefaultLayer"]);

    layerStore.layers.push(...layers);
}