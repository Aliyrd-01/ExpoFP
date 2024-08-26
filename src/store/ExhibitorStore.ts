import { ScheduleItem } from "./ScheduleStore";
// import { observable } from 'mobx';
import { action, computed, observable } from "mobx";
import { MarketMaterial, RawExhibitor } from "../data/Data";
import settings from "../tools/settings";
import isDebug from "../utils/is-debug";
import { Booth } from "./BoothStore";
import { Category } from "./CategoryStore";
import RootStore from "./RootStore";

export default class ExhibitorStore {
    private readonly rootStore: RootStore;
    readonly exhibitors: Exhibitor[] = [];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @computed({ keepAlive: true }) get exhibitorById() {
        return new Map<number, Exhibitor>(this.exhibitors.map((c) => [c.id, c]));
    }

    @computed get bookmarked() {
        return this.exhibitors.filter((x) => x.bookmarked);
    }

    @computed({ keepAlive: true }) get advertised() {
        return this.exhibitors.filter((x) => x.advertise && x.logo);
    }

    @action replaceBookmarked(ids: number[]) {
        //const current = new Set(this.bookmarked);
        const ar = ids.map((x) => this.exhibitorById.get(x)).filter((x) => x);
        const set = new Set(ar);
        const toRemove = this.bookmarked.filter((e) => !set.has(e));
        for (const e of toRemove) {
            e.bookmarked = false;
        }
        for (const e of ar) {
            e.bookmarked = true;
        }
    }

    @action setRebookingState(exhibitor: Exhibitor, state: number, rebookingNote: string) {
        exhibitor.rebookingState = state;
        exhibitor.rebookingNote = rebookingNote;

        fetch("https://app-show.expofp.com/api/v1/set-rebooking-state", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                expoKey: settings.EXPO,
                exhibitorId: exhibitor.id,
                rebookingState: state,
                rebookingNote,
            }),
        })
            .then((r) => {
                console.info("Rebooking state sent", r.ok);
                if (!r.ok && !isDebug) exhibitor.rebookingState = 0;
            })
            .catch((e) => {
                exhibitor.rebookingState = 0;
                alert("Error sending rebooking state");
            });
    }

    findExhibitor(str: string) {
        return this.exhibitors.find((e) => e.name === str || e.slug === str || e.externalId === str);
    }
}

export class Exhibitor implements Omit<RawExhibitor, "categories" | "booths"> {
    private readonly store: ExhibitorStore;
    readonly id: number;
    readonly name: string;
    readonly externalId: string;
    @observable featured: boolean; //new
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
    readonly customButtonTitle: string;
    readonly customButtonUrl: string;
    readonly customButton2Title: string;
    readonly customButton2Url: string;
    readonly customButton3Title: string;
    readonly customButton3Url: string;
    readonly leadingImageUrl: string;
    readonly leadingImageLinkUrl: string;
    readonly videoUrl: string;
    readonly order: number;

    //populated
    readonly logo: string;
    readonly logoInBooth: boolean;
    readonly gallery: string[];
    readonly marketMaterials: MarketMaterial[];
    readonly slug: string;
    @observable bookmarked: boolean;
    @observable rebookingState: number;
    @observable rebookingNote: string;

    readonly booths: Booth[];
    readonly categories: Category[];
    readonly schedule: ScheduleItem[];
}
