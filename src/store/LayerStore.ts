// import { observable } from 'mobx';
import { action, computed, observable } from "mobx";
import store from "../store";

export default class LayerStore {
    @observable layers: Layer[] = [];

    @observable singleVisible: boolean = true;

    @computed({ keepAlive: true }) get visible() {
        return this.layers.filter((l) => l.visible);
    }

    @action updateLayerVisibility(layer: string, visible: boolean): void {
        if (this.singleVisible && !visible) return;

        if (this.singleVisible) {
            this.layers.forEach((l) => {
                if (l.name !== layer) l.visible = false;
                else store.clickFloor(l.name);
            });
        }

        const l = this.layers.find((l) => l.name === layer);
        if (l) l.visible = visible;
    }
}

export class Layer {
    name: string;
    @observable visible: boolean;
}
