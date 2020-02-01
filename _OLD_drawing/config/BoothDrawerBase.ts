import { Booth } from "../../../../store/BoothStore";
import { DrawerContext } from "../Drawer1";
import TrianglePainter from "../painters/TrianglePainter";
import Painter from "../painters/Painter";
import { autorun } from "mobx";
import BoothShape from "./BoothShape";

export default abstract class BoothDrawerBase<T extends Painter | TrianglePainter> {
    protected readonly booth: Booth;
    protected readonly shape: BoothShape;
    protected readonly painter: T;
    protected readonly context: DrawerContext;
    public readonly updateBound: () => void;
    private readonly getIdMap = new Map<string, string>();

    constructor(
        context: DrawerContext,
        booth: Booth,
        painterType: string,
        painterClass: new (gl: WebGLRenderingContext) => T,
        painterOrderPriority: number
    ) {
        this.booth = booth;
        this.shape = BoothShape.get(booth);
        this.painter = context.requirePainter(painterType, painterClass, painterOrderPriority);
        this.context = context;
        this.updateBound = this.update.bind(this);
    }
    protected getId(name: string) {
        return (
            this.getIdMap.get(name) || ((this.getIdMap.set(name, `b${this.booth.id}${name}`) || true) && this.getIdMap.get(name))
        );
    }

    // protected getBoothState() {
    //     return store.getBoothState(this.booth);
    // }

    protected subscribeToBoothChange() {}

    update() {}

    startAutoupdate() {
        let initial = true;

        // console.log("autorun1");
        autorun(
            reaction => {
                this.update();
                if (!this.context.updatable) reaction.dispose();
            },
            {
                scheduler: run => {
                    if (initial) {
                        run();
                        initial = false;
                    } else this.context.requireUpdate(run);
                }
            }
        );
    }
}
