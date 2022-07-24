// import { observable } from 'mobx';
import { action, computed, observable } from "mobx";
import { uiState } from ".";
import loadLayer from "../components/Map/drawing/config/config-load-layer";

import Rect from "../core/Rect";

export enum LayersMode {
    Default,
    Separated,
    Radio,
    CheckBox,
}

export class Layer {
    basePriority: number;
    name: string;
    description: string;
    frozen: boolean;
    rect: Rect = null;
    configured: boolean;
    @observable loaded: boolean;
    @observable visible: boolean;
}

export default class LayerStore {
    @observable layers: Layer[] = [];
    @observable defaultLayer: Layer;
    @observable mode: LayersMode;

    @computed({ keepAlive: true }) get visible() {
        return this.layers.filter((l) => l.frozen || l.visible);
    }

    @computed({ keepAlive: true }) get loaded() {
        return this.layers.filter((l) => l.loaded);
    }

    @computed({ keepAlive: true }) get rectangle() {
        var l = this.visible.filter((l) => !l.frozen).map((l) => l.rect);      
        return this.mode === LayersMode.Default || !l.length ? null : Rect.fromMultiple(l) || null;
    }

    @action updateVisibility(layerName: string, visible: boolean): void {
        if (this.mode === LayersMode.Radio && !visible) return;

        const layer = this.layers.find((l) => l.name === layerName);

        loadLayer(layer).then(() => {
            if (this.mode === LayersMode.Radio) {
                this.layers.forEach((l) => {
                    if (l.name !== layerName && !l.frozen) l.visible = false;
                    else if (l.rect) uiState.moveToRect = l.rect;
                });
            }

            if (layer) layer.visible = visible;
        });
    }
}
