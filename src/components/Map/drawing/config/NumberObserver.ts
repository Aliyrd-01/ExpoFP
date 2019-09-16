import { reaction } from "mobx";
import { DrawerContext } from "../Drawer1";

export class NumberObserver {
    // private readonly func: () => number;
    private readonly observers = new Map<number, (() => void)[]>();
    private prevVals: boolean[];
    private observersKeys: number[];
    constructor(func: () => number) {
        // this.func = func;
        // run
        reaction(
            () => func(),
            () => {
                const val = func();
                if (!this.observersKeys) {
                    this.observersKeys = Array.from(this.observers.keys()).sort((a, b) => a - b);
                }
                const newVals = this.observersKeys.map(n => val < n);
                for (let i = 0; i < this.observersKeys.length; i++) {
                    const n = this.observersKeys[i];
                    const newVal = val < n;
                    if (!this.prevVals || this.prevVals[i] !== newVal) {
                        for (const f of this.observers.get(n)) {
                            f();
                        }
                    }
                }
                this.prevVals = newVals;
            }
        );
    }
    observeValue(n: number, cb: () => void) {
        let ar = this.observers.get(n);
        if (!ar) {
            ar = [];
            this.observers.set(n, ar);
            this.prevVals = null;
            this.observersKeys = null;
        }
        ar.push(cb);
    }
    private static readonly allFromContext = new Map<any, NumberObserver>();
    static fromContext(context: DrawerContext): NumberObserver {
        let x = this.allFromContext.get(context);
        if (!x) {
            x = new NumberObserver(() => context.ptscale);
            this.allFromContext.set(context, x);
        }
        return x;
    }
}
