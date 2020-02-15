import { autorun } from "mobx";
import { Booth } from "../../../core/Booth";
import DrawerImpl from "../DrawerImpl";
import Painter from "../painters/Painter";
import TrianglePainter from "../painters/TrianglePainter";
import BoothShape from "./BoothShape";

export default abstract class BoothDrawerBase<T extends Painter | TrianglePainter> {
    protected readonly booth: Booth;
    protected readonly shape: BoothShape;
    protected readonly painter: T;
    protected readonly context: DrawerImpl;
    public readonly updateBound: () => void;
    private readonly getIdMap = new Map<string, string>();
    private autoupdateDispose: () => void;

    constructor(
        context: DrawerImpl,
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
            this.getIdMap.get(name) ||
            ((this.getIdMap.set(name, `b${this.booth.name}${name}`) || true) && this.getIdMap.get(name))
        );
    }

    // protected getBoothState() {
    //     return store.getBoothState(this.booth);
    // }

    // protected subscribeToBoothChange() {}

    update() {}

    dispose() {
        if (this.autoupdateDispose) this.autoupdateDispose();
        // logger.log("zzz dispsoed");
    }

    startAutoupdate() {
        let initial = true;

        // console.log("autorun1");
        this.autoupdateDispose = autorun(
            reaction => {
                this.update();
                //if (!this.context.updatable) reaction.dispose();
            },
            {
                scheduler: run => {
                    // console.log("zzz, startAutoupdate");
                    if (initial) {
                        run();
                        initial = false;
                    } else this.context.requireUpdate(run);
                }
            }
        );
    }
}
