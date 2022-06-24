// import { observable } from 'mobx';
import { action, computed, observable } from "mobx";
import { uiState } from ".";
import loadLayer from "../components/Map/drawing/config/config-load-layer";

import Rect from "../core/Rect";

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

export default class LayerStore {
    @observable layers: Layer[] = [];
    @observable defaultLayer: string;
    @observable mode: LayersMode;

    @computed({ keepAlive: true }) get visible() {
        return this.layers.filter((l) => l.visible);
    }

    @computed({ keepAlive: true }) get rectangle() {
        return this.mode !== LayersMode.Single ? null : this.visible[0]?.rect || null;
    }

    @action updateVisibility(layerName: string, visible: boolean): void {
        if (this.mode === LayersMode.Single && !visible) return;

        const layer = this.layers.find((l) => l.name === layerName);

        loadLayer(layer).then(() => {
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
