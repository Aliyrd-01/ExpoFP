// import { observable } from 'mobx';
import RootStore from "./RootStore";
import { Category } from "./CategoryStore";
import { RegularBooth } from "./BoothStore";


export default class ExhibitorStore {
    private readonly rootStore: RootStore;
    readonly exhibitors: Exhibitor[] = [];

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

    readonly booths: RegularBooth[];
    readonly categories: Category[];
}