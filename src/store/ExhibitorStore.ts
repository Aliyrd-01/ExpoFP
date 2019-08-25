// import { observable } from 'mobx';
import RootStore from "./RootStore";
import { Category } from "./CategoryStore";
import { RegularBooth } from "./BoothStore";
import { computed, observable, action } from "mobx";

export default class ExhibitorStore {
    private readonly rootStore: RootStore;
    readonly exhibitors: Exhibitor[] = [];
    @computed({ keepAlive: true }) get exhibitorById() {
        return new Map<number, Exhibitor>(this.exhibitors.map(c => [c.id, c]));
    }

    @computed get bookmarked() {
        return this.exhibitors.filter(x => x.bookmarked);
    }

    @computed get advertised() {
        return this.exhibitors.filter(x => x.advertise && x.logo);
    }

    @action replaceBookmarked(ids: number[]) {
        //const current = new Set(this.bookmarked);
        const ar = ids.map(x => this.exhibitorById.get(x));
        const set = new Set(ar);
        const toRemove = this.bookmarked.filter(e => !set.has(e));
        for (const e of toRemove) {
            e.bookmarked = false;
        }
        for (const e of ar) {
            e.bookmarked = true;
        }
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}

export class Exhibitor implements Omit<RawExhibitor, "categories" | "booths"> {
    private readonly store: ExhibitorStore;
    readonly id: number;
    readonly name: string;
    readonly featured: boolean; //new
    readonly advertise: boolean;
    readonly description: string;
    readonly address: string;
    readonly address2: string;
    readonly city: string;
    readonly state: string;
    readonly zip: string;
    readonly country: string;
    readonly phone1: string;
    readonly website: string;
    readonly facebook: string;
    readonly instagram: string;
    readonly linkedin: string;
    readonly twitter: string;
    readonly googlePlus: string;
    readonly xing: string;
    readonly youtube: string;
    readonly email: string;
    readonly privateEmail: string;

    //populated
    readonly logo: string;
    readonly slug: string;
    @observable bookmarked: boolean;

    readonly booths: RegularBooth[];
    readonly categories: Category[];
}
