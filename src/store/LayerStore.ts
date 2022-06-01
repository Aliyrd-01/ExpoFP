// import { observable } from 'mobx';
import { action, computed, observable } from "mobx";
import { uiState } from ".";
import Rect from "../core/Rect";

export default class LayerStore {
    @observable layers: Layer[] = [];
    @observable singleVisible: boolean = true;

    @computed({ keepAlive: true }) get visible() {
        return this.layers.filter((l) => l.visible);
    }

    @action init() {
        if (!this.singleVisible) return;
        var rect = this.layers.filter((f) => f.visible)[0]?.rect;
        if (rect) setTimeout(() => (uiState.moveToRect = rect), 400);
    }

    @computed({ keepAlive: true }) get rectangle() {
        return !this.singleVisible ? null : this.visible[0]?.rect || null;
    }

    @action updateLayerVisibility(layer: string, visible: boolean): void {
        if (this.singleVisible && !visible) return;

        if (this.singleVisible) {
            this.layers.forEach((l) => {
                if (l.name !== layer) l.visible = false;
                else if (l.rect) uiState.moveToRect = l.rect;
            });
        }

        const l = this.layers.find((l) => l.name === layer);
        if (l) l.visible = visible;
    }
}

export class Layer {
    name: string;
    description: string;
    rect: Rect = null;
    @observable visible: boolean;
}
