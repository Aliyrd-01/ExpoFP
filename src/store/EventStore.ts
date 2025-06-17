// import { observable } from 'mobx';
import RootStore from "./RootStore";

export default class EventStore {
    private readonly rootStore: RootStore;

    readonly eventItems: EventItem[] = [];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    findByNameOrSlug(str: string): EventItem | undefined {
        return this.eventItems.find((e) => e.name === str || e.slug === str || e.externalId === str);
    }
}

export class EventItem {
    public readonly slug: string;

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
        this.slug = externalId || `event-${id}`;
    }

    public get isEnded(): boolean {
        return this.endDate && new Date(this.endDate).getTime() < new Date().getTime();
    }
}
