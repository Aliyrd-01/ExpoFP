import { requireDrawer } from "./draw";
import Drawer from "./Drawer";
import { getBoothState } from "./config-booths";

export abstract class BoothDrawerBase {
    protected readonly booth: Booth;
    protected readonly drawer: Drawer;
    public readonly updateBound: () => void;

    constructor(booth: Booth, drawerType: string) {
        this.booth = booth;
        this.drawer = requireDrawer(drawerType, Drawer);
        this.updateBound = this.update.bind(this);
    }

    protected getId(name: string) {
        return `b${this.booth.id}${name}`;
    }

    protected getBoothState(){
        return getBoothState(this.booth);
    }

    protected subscribeToBoothChange() {

    }

    update() { }
}




