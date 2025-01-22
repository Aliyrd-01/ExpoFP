// import { observable } from 'mobx';
import RootStore from "./RootStore";

export default class ScheduleStore {
    private readonly rootStore: RootStore;

    readonly scheduleItems: ScheduleItem[] = [];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}

export class ScheduleItem {
    public constructor(
        public readonly id: number,
        public readonly externalId: string,
        public readonly boothId: number,
        public readonly exhibitorId: number,
        public readonly name: string,
        public readonly description: string,
        public readonly startDate: string,
        public readonly endDate: string,
        public readonly link?: string
    ) {}

    public get isEnded(): boolean {
        return this.endDate && new Date(this.endDate).getTime() < new Date().getTime();
    }
}
