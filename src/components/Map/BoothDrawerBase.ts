import { requireDrawer } from "./draw";
import Drawer from "./Drawer";
import TriangleDrawer from "./TriangleDrawer";

export default abstract class BoothDrawerBase<T extends Drawer | TriangleDrawer> {
    protected readonly booth: Booth;
    protected readonly drawer: T;
    public readonly updateBound: () => void;
    private readonly getIdMap = new Map<string, string>();

    constructor(booth: Booth, drawerType: string, drawerClass: new (gl: WebGLRenderingContext) => T, drawerOrderPriority: number) {
        this.booth = booth;
        this.drawer = requireDrawer(drawerType, drawerClass, drawerOrderPriority);
        this.updateBound = this.update.bind(this);
    }
    protected getId(name: string) {
        return this.getIdMap.get(name) || (this.getIdMap.set(name, `b${this.booth.id}${name}`) || true) && this.getIdMap.get(name);
    }

    protected getBoothState() {
        return store.getBoothState(this.booth);
    }

    protected subscribeToBoothChange() {

    }

    update() { }
}




