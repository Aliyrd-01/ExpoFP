import { requireDrawer } from "./draw";
import Drawer from "./Drawer";
import { getBoothState } from "./config-booths";
import TriangleDrawer2 from "./TriangleDrawer2";

export abstract class BoothDrawerBase<T extends Drawer | TriangleDrawer2> {
    protected readonly booth: Booth;
    protected readonly drawer: T;
    public readonly updateBound: () => void;

    constructor(booth: Booth, drawerType: string, drawerClass: new (gl: WebGLRenderingContext) => T) {
        this.booth = booth;
        this.drawer = requireDrawer(drawerType, drawerClass);
        this.updateBound = this.update.bind(this);
    }

    protected getId(name: string) {
        return `b${this.booth.id}${name}`;
    }

    protected getBoothState() {
        return getBoothState(this.booth);
    }

    protected subscribeToBoothChange() {

    }

    update() { }
}




