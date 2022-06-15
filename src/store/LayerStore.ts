// import { observable } from 'mobx';
import { action, computed, observable } from "mobx";
import { uiState } from ".";
import { getContext } from "../components/Map/drawing/config/config-all";
import configLayer from "../components/Map/drawing/config/config-layer";
import Rect from "../core/Rect";

export default class LayerStore {
    @observable layers: Layer[] = [];
    @observable separated: boolean = __fpPaths === null;

    @computed({ keepAlive: true }) get visible() {
        return this.layers.filter((l) => l.visible);
    }

    @action init() {
        if (!this.separated) return;
        var rect = this.layers.filter((f) => f.visible)[0]?.rect;
        if (rect) setTimeout(() => (uiState.moveToRect = rect), 400);
    }

    @computed({ keepAlive: true }) get rectangle() {
        return !this.separated ? null : this.visible[0]?.rect || null;
    }

    @action updateLayerVisibility(layer: string, visible: boolean): void {
        if (this.separated && !visible) return;
        const l = this.layers.find((l) => l.name === layer);
        configLayer(l, getContext()).then(() => {
            if (this.separated) {
                this.layers.forEach((l) => {
                    if (l.name !== layer) l.visible = false;
                    else if (l.rect) uiState.moveToRect = l.rect;
                });
            }

            if (l) l.visible = visible;
        });
    }
}

export class Layer {
    configured: boolean;
    basePriority: number;
    name: string;
    description: string;
    rect: Rect = null;
    @observable visible: boolean;
}
