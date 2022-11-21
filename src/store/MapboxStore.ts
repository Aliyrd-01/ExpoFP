import { computed, observable } from "mobx";
import RootStore from "./RootStore";

export default class MapboxStore {
    rootStore: RootStore;

    @observable mapBoxSelected = true;
    @observable mapBoxEnabled = !!window["__fpGeo"];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @computed({ keepAlive: true }) get showMapbox() {
        return this.mapBoxEnabled && this.mapBoxSelected;
    }
}
