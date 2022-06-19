// import { observable } from 'mobx';
import { action, computed, observable } from "mobx";
import { uiState } from ".";
import configLayer from "../components/Map/drawing/config/config-layer";
import Rect from "../core/Rect";

export default class LayerStore {
    @observable layers: Layer[] = [];
    @observable mode: LayersMode = window["__fpSeparated"] || LayersMode.Default;

    @computed({ keepAlive: true }) get visible() {
        return this.layers.filter((l) => l.visible);
    }

    @action init() {
        if (this.mode === LayersMode.Default) return;
        var rect = this.layers.filter((f) => f.visible)[0]?.rect;
        if (rect) setTimeout(() => (uiState.moveToRect = rect), 400);
    }

    @computed({ keepAlive: true }) get rectangle() {
        return this.mode !== LayersMode.Single ? null : this.visible[0]?.rect || null;
    }

    @action updateVisibility(layerName: string, visible: boolean): void {
        if (this.mode == LayersMode.Single && !visible) return;

        const layer = this.layers.find((l) => l.name === layerName);

        configLayer(layer).then(() => {
            if (this.mode === LayersMode.Single) {
                this.layers.forEach((l) => {
                    if (l.name !== layerName) l.visible = false;
                    else if (l.rect) uiState.moveToRect = l.rect;
                });
            }

            if (layer) layer.visible = visible;
        });
    }
}

export enum LayersMode {
    Default,
    Single,
    Lazy,
}

export class Layer {
    configured: boolean;
    basePriority: number;
    name: string;
    description: string;
    rect: Rect = null;
    @observable visible: boolean;
}
