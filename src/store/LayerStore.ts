// import { observable } from 'mobx';
import { computed, observable } from "mobx";
import RootStore from "./RootStore";

export default class LayerStore {
    private readonly rootStore: RootStore;

    @observable layers: Layer[] = [];

    @computed({ keepAlive: true }) get visible() {
        return this.layers.filter((l) => l.visible);
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}

export class Layer {
    name: string;
    @observable visible: boolean;
}
