import { requireDrawer } from "./draw";
import Drawer from "./Drawer";
import { getBoothState } from "./config-booths";
import TriangleDrawer from "./TriangleDrawer";

export default abstract class BoothDrawerBase<T extends Drawer | TriangleDrawer> {
    protected readonly booth: Booth;
    protected readonly drawer: T;
    public readonly updateBound: () => void;

    constructor(booth: Booth, drawerType: string, drawerClass: new (gl: WebGLRenderingContext) => T, drawerOrderPriority: number) {
        this.booth = booth;
        this.drawer = requireDrawer(drawerType, drawerClass, drawerOrderPriority);
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




