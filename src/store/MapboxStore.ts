import { action, computed, observable } from "mobx";
import data from "../data";
import { uiState } from "./index";
import RootStore from "./RootStore";

export default class MapboxStore {
    rootStore: RootStore;

    @observable mapBoxSelected = true;

    @observable mapBoxActivated = !data.hide3dMapDefault;
    @observable mapBoxEnabled = !!window["__fpGeo"] && data.allow3dView && !uiState.kiosk;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action activateMapbox() {
        this.mapBoxSelected = !this.showMapbox;
        this.mapBoxActivated = true;
    }

    @computed({ keepAlive: true }) get hideModeSwitchButton() {
        return this.mapBoxEnabled && data.hideModeSwitchButton;
    }

    @computed({ keepAlive: true }) get showMapbox() {
        return this.mapBoxEnabled && this.mapBoxSelected && this.mapBoxActivated;
    }
}
