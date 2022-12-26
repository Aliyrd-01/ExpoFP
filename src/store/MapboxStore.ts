import { uiState } from "./index";
import { computed, observable, action } from "mobx";
import RootStore from "./RootStore";
import data from "../data";

export default class MapboxStore {
    rootStore: RootStore;

    @observable mapBoxSelected = true;
    @observable showModeSwitch = data.showModeSwitch;
    @observable mapBoxActivated = data.show3dMap;
    @observable mapBoxEnabled = !!window["__fpGeo"] && data.mapboxEnabled && !uiState.kiosk;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action activateMapbox() {
        this.mapBoxSelected = !this.showMapbox;
        this.mapBoxActivated = true;
    }

    @computed({ keepAlive: true }) get showMapbox() {
        return this.mapBoxEnabled && this.mapBoxSelected && this.mapBoxActivated;
    }
}
