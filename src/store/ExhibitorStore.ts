// import { observable } from 'mobx';
// import { RegularBooth } from "./BoothStore";
import { action, computed, observable } from "mobx";
import { RegularBooth } from "../core/Booth";
import { sortByName } from "../utils";
import { Category } from "./CategoryStore";
import RootStore from "./RootStore";

export default class ExhibitorStore {
    public readonly rootStore: RootStore;
    readonly exhibitors: Exhibitor[] = [];

    @observable bookmarkedIds = new Set<number>();
    @observable readonly exhibitorIdsByBoothNameMap = new Map<string, number[]>();

    @computed({ keepAlive: true }) get bookmarked() {
        return Array.from(this.bookmarkedIds).map(b => this.exhibitorByIdMap.get(b));
    }

    @computed({ keepAlive: true }) get bookmarkedBoothNames() {
        const bb = new Set<string>();

        this.bookmarked.forEach(ex => {
            for (const b of ex.booths) {
                bb.add(b.name);
            }
        });
        return bb;
    }

    @computed({ keepAlive: true }) get exhibitorByIdMap() {
        return new Map<number, Exhibitor>(this.exhibitors.map(c => [c.id, c]));
    }

    @computed({ keepAlive: true }) get boothNamesByExhibitorIdMap() {
        const res = new Map<number, string[]>();
        this.exhibitorIdsByBoothNameMap.forEach((v, k) => {
            v.forEach(exhibitorId => {
                let ar = res.get(exhibitorId);
                if (!ar) {
                    ar = [];
                    res.set(exhibitorId, ar);
                }
                ar.push(k);
            });
        });
        return res;
    }

    @computed({ keepAlive: true }) get advertised() {
        return this.exhibitors.filter(x => x.advertise && x.logo);
    }

    @action replaceBookmarked(ids: number[]) {
        //this.bookmarked.clear();
        this.bookmarkedIds = new Set(ids);
        // //const current = new Set(this.bookmarked);
        // const ar = ids.map(x => this.exhibitorById.get(x)).filter(x => x);
        // const set = new Set(ar);
        // const toRemove = this.bookmarked.filter(e => !set.has(e));
        // for (const e of toRemove) {
        //     e.bookmarked = false;
        // }
        // for (const e of ar) {
        //     e.bookmarked = true;
        // }
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

    @computed({ keepAlive: true }) get bookmarked() {
        return this.store.bookmarkedIds.has(this.id);
    }

    @computed({ keepAlive: true }) get booths() {
        const boothStore = this.store.rootStore.boothStore;

        const ar = (this.store.boothNamesByExhibitorIdMap.get(this.id) || []).map(
            name => boothStore.boothByNameMap.get(name) as RegularBooth
        );
        sortByName(ar);
        return ar;
    }

    // readonly booths: RegularBooth[];
    readonly categories: Category[];
}
