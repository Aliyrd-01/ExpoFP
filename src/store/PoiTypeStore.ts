// import { observable } from 'mobx';
import { RawPoiType } from "../data/Data";
import RootStore from "./RootStore";

export default class PoiTypeStore {
    private readonly rootStore: RootStore;

    readonly poiTypes: RawPoiType[] = [];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}
