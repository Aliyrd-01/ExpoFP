import { observable, computed } from 'mobx';
import RootStore from "./RootStore";

type ListType = { type: "search"; text: string; focused: boolean } | { type: "bookmarks" } | { type: "category"; id: number };
export type ScreenSize = { width: number, height: number };


export default class UIState {
    private readonly rootStore: RootStore;

    @observable.struct list: ListType;// = { type: "search", text: "", focused: false };
    @observable.struct screenSize: ScreenSize;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    ///////////////////////////////////////////////////////////////////////////
    // positions
    @computed get overlayPosition() {
        if (!this.screenSize || this.screenSize.width > 550) return "left";
        return "bottom";
    }


    ///////////////////////////////////////////////////////////////////////////
}



