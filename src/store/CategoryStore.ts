// import { observable } from 'mobx';
import RootStore from "./RootStore";
import { computed } from "mobx";

export default class CategoryStore {
    private readonly rootStore: RootStore;

    readonly categories: Category[] = [];
    @computed({keepAlive: true}) get categoryById() {
        console.log('categoryById');
        return new Map<number, Category>(this.categories.map(c => [c.id, c]));
    }

    @computed get seminarsCategory() {
        return this.categories.find(c => c.slug === 'seminars');
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
