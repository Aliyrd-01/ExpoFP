import { action, computed, observable } from "mobx";
import RootStore from "./RootStore";
import { generateUniqueSlug } from "../tools/slug";

export default class EventStore {
    private readonly rootStore: RootStore;

    readonly eventItems: EventItem[] = [];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    findByNameOrSlug(str: string): EventItem | undefined {
        return this.eventItems.find((e) => e.name === str || e.slug === str || e.externalId === str);
    }

    @computed get bookmarked() {
        return this.eventItems.filter((x) => x.bookmarked);
    }

    @action replaceBookmarked(ids: number[]) {
        const ar = ids.map((x) => this.eventItems.find((e) => e.id === x)).filter((x) => x);
        const set = new Set(ar);
        const toRemove = this.bookmarked.filter((e) => !set.has(e));
        for (const e of toRemove) {
            e.bookmarked = false;
        }
        for (const e of ar) {
            e.bookmarked = true;
        }
    }
}

export class EventItem {
    public readonly slug: string;
    @observable bookmarked: boolean = false;

    public constructor(
        public readonly id: number,
        public readonly externalId: string,
        public readonly boothId: number,
        public readonly exhibitorId: number,
        public readonly name: string,
        public readonly description: string,
        public readonly startDate: string,
        public readonly endDate: string,
        public readonly link?: string,
        public readonly entity = { type: "event" } as const
    ) {
        this.slug = generateUniqueSlug(name);
    }

    public get isEnded(): boolean {
        return this.endDate && new Date(this.endDate).getTime() < new Date().getTime();
    }
}
