import { observable } from 'mobx';
import RootStore from "./RootStore";

type ListType = { type: "search"; text: string; focused: boolean } | { type: "bookmarks" } | { type: "category"; id: number };

export default class UIState {
    private readonly rootStore: RootStore;

    @observable.struct list: ListType = { type: "search", text: "", focused: false };

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}