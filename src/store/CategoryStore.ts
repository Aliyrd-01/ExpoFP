import { observable } from 'mobx';
import RootStore from "./RootStore";

export default class CategoryStore {
    private readonly rootStore: RootStore;

    //@observable.struct list: ListType = { type: "search", text: "", focused: false };
    readonly categories: Category[] = [];

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

// class ExhibitorStore {
//     private readonly rootStore: RootStore;
//     readonly exhibitors: Exhibitor[] = [];

//     constructor(rootStore: RootStore) {
//         this.rootStore = rootStore;
//     }
// }

// class Exhibitor {
//     readonly id: number;
//     readonly name: string;
//     readonly featured: boolean; //new
//     readonly advertise: boolean;
//     readonly description: string;
//     readonly address: string;
//     readonly address2: string;
//     readonly city: string;
//     readonly state: string;
//     readonly zip: string;
//     readonly country: string;
//     readonly phone1: string;
//     readonly website: string;
//     readonly facebook: string;
//     readonly instagram: string;
//     readonly linkedin: string;
//     readonly twitter: string;
//     readonly googlePlus: string;
//     readonly xing: string;
//     readonly youtube: string;
//     readonly email: string;
//     readonly privateEmail: string;

//     //populated
//     readonly logo: string;
//     readonly slug: string;

//     readonly booths: Booth[];
//     readonly categories: Category[];
// }


// class BoothStore {
//     private readonly rootStore: RootStore;
//     readonly booths: Booth[] = [];

//     constructor(rootStore: RootStore) {
//         this.rootStore = rootStore;
//     }
// }

// abstract class Booth {
//     readonly id: number;
//     readonly name: string;
//     readonly title: string;
//     readonly rect: Rect;
//     readonly noLabels: boolean;
//     readonly rotate: number;
//     readonly paths: PathInfo[];
//     readonly slug: string;
//     readonly error: boolean;
// }

// class RegularBooth extends Booth {
//     readonly buyUrl: string;
//     readonly reserveUrl: string;
//     readonly type: string; 
//     readonly onHold: boolean; 

//     // populated
//     readonly size: string; // comes from svg or data.js
//     readonly price: string; // comes from svg or data.js
//     readonly availColor: string; // comes from svg or data.js
//     readonly soldColor: string; // comes from svg or data.js
    
//     readonly exhibitors: Exhibitor[];
// }

// class SpecialBooth extends Booth {
//     readonly title: string;
//     readonly description: string;
//     readonly color: string; // comes from svg or data.js
//     readonly special: true;
// }