// import { observable } from 'mobx';
import RootStore from "./RootStore";
import { computed } from "mobx";

export default class CategoryStore {
    private readonly rootStore: RootStore;

    //@observable.struct list: ListType = { type: "search", text: "", focused: false };
    readonly categories: Category[] = [];
    @computed get categoryById() {
        return new Map<number, Category>(this.categories.map(c => [c.id, c]));
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}


export class Category {
    private readonly store: CategoryStore;
    readonly id: number;
    readonly name: string;
    readonly slug: string;

    // populated
    // readonly exhibitors: Exhibitor[];
}
