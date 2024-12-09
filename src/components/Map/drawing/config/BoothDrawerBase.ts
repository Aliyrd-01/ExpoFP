import { autorun } from "mobx";
import { Booth } from "../../../../store/BoothStore";
import { DrawerContext } from "../Drawer1";
import Painter, { PainterConstructor } from "../painters/Painter";
import TrianglePainter from "../painters/TrianglePainter";
import BoothShape from "./BoothShape";

export abstract class BoothDrawerBaseWithoutPainter {
    protected readonly booth: Booth;
    protected readonly shape: BoothShape;
    protected readonly context: DrawerContext;
    public readonly updateBound: () => void;
    protected readonly getIdMap = new Map<string, string>();

    constructor(context: DrawerContext, booth: Booth) {
        this.booth = booth;
        this.shape = BoothShape.get(booth);
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
            (reaction) => {
                this.update();
                if (!this.context.updatable) reaction.dispose();
            },
            {
                scheduler: (run) => {
                    if (initial) {
                        run();
                        initial = false;
                    } else this.context.requireUpdate(run);
                },
            }
        );
    }
}

export default abstract class BoothDrawerBase<T extends Painter | TrianglePainter, U = Record<string, unknown>> extends BoothDrawerBaseWithoutPainter {
    protected readonly painter: T;

    constructor(
        context: DrawerContext,
        booth: Booth,
        layerId: string,
        painterClass: PainterConstructor<T, U>,
        painterOrderPriority: number,
        visible: boolean,
        options?: U,
    ) {
        super(context, booth);
        this.painter = context.requirePainter(layerId, painterClass, painterOrderPriority, visible, options);
    }
    protected getId(name: string) {
        return (
            this.getIdMap.get(name) || ((this.getIdMap.set(name, `b${this.booth.id}${name}`) || true) && this.getIdMap.get(name))
        );
    }
}
