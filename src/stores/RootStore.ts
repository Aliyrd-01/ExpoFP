import { observable, computed, autorun, when, configure, runInAction, action } from 'mobx';
configure({ computedRequiresReaction: true, enforceActions: 'observed' });

export default class RootStore {
    readonly uiStore: UIStore;
    readonly boothStore: BoothStore;
    constructor() {
        this.uiStore = new UIStore(this);
        this.boothStore = new BoothStore(this);
    }
}

class UIStore {
    private readonly rootStore: RootStore;

    @observable resolution: number;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}




// autorun(() => {
//     console.log('store.uiStore.resolution', store.uiStore.resolution);
// });


addEventListener('resize', () => {
    runInAction(() => { store.uiStore.resolution = innerHeight; });
});

class BoothStore {
    private readonly rootStore: RootStore;

    // @observable readonly booths2: Booth[] = [];
    @observable readonly booths: Booth[] = [];//new Map<number, Booth1>();

    @computed get boothsById() {
        return new Map(this.booths.map(x => [x.id, x]));
    }

    @observable readonly hovered = new Map<Booth1, boolean>();

    @computed get hovered1() {
        console.log('Going into hovered1')
        return this.hovered.get("1");
    }

    @action addHovered(id: string) {
        this.hovered.set(id, true);
        // this.booths.set(booth.id, booth);
        // this.booths.push(booth);
    }


    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action addBooth(booth: Booth1) {
        this.booths.set(booth.id, booth);
        // this.booths.push(booth);
    }

    @computed get boothsArray() {
        return Array.from(this.booths.values());
    }

    //private heheBooths1: Booth[] = [];

    @computed get heheBooths() {
        return this.boothsArray.filter(b => b.name === "hehe");
        // this.heheBooths1.splice(0, this.heheBooths1.length, ...this.booths.filter(b => b.name === "hehe"));
        // return this.heheBooths1;
    }

    @computed get heheBoothsLength() {
        return this.boothsArray.filter(b => b.name === "hehe").length;
    }


    @computed get specialBooths() {
        return this.boothsArray.filter(b => b.constructor === SpecialBooth1);
    }
}

// class Booth {
//     private readonly store: BoothStore;
//     readonly name: string;
//     readonly id: number;

//     constructor(store: BoothStore, id: number, name: string) {
//         this.store = store;
//         this.id = id;
//         this.name = name;
//     }
// }


abstract class BoothBase {
    private readonly store: BoothStore;
    readonly id: number;
    readonly name: string;
    title: string;
    rect: Rect;
    noLabels: boolean;
    rotate: number;
    paths: PathInfo[];
    slug: string;
    error?: boolean;

    @computed get hover() {
        return this.store.hovered.get(this) === true;
    }


    protected constructor(id) {
        this.id = id;
    }
}

type Booth1 = BoothBase;


class SpecialBooth1 extends BoothBase {
    exhibitors1: number[];

    /**
     *
     */
    constructor() {
        super(1);
    }
}

class RegularBooth1 extends BoothBase {
    exhibitors: number[];

    /**
     *
     */
    constructor() {
        super(1);
    }
}


const store = new RootStore();

autorun(() => {
    console.log('store.boothStore.hovered1', store.boothStore.hovered1);
});


store.boothStore.addHovered("1");
store.boothStore.addHovered("2");
store.boothStore.addHovered("4");
store.boothStore.addHovered("3");
store.boothStore.addHovered("3");
store.boothStore.addHovered("3");
store.boothStore.addHovered("1");
store.boothStore.addHovered("9");
store.boothStore.addHovered("1");

// autorun(() => {
//     console.log('store.boothStore.booths.size', store.boothStore.booths.size);
// });

// autorun(() => {
//     console.log('store.boothStore.heheBooths.length', store.boothStore.heheBooths.length);
// });

// autorun(() => {
//     console.log('store.boothStore.specialBooths', store.boothStore.specialBooths    );
// });


// store.boothStore.addBooth(new Booth(store.boothStore, 1, "hehe"));
// store.boothStore.addBooth(new Booth(store.boothStore, 2, "hehea"));
// store.boothStore.addBooth(new Booth(store.boothStore, 3, "hehe"));