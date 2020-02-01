import { reaction } from "mobx";

export class NumberObserver {
    // private readonly func: () => number;
    private readonly observers = new Map<number, (() => void)[]>();
    private prevVals: number[];
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
                const newVals = this.observersKeys.map(n => (val < n ? -1 : val > n ? 1 : 0));
                for (let i = 0; i < this.observersKeys.length; i++) {
                    const n = this.observersKeys[i];
                    const newVal = newVals[i];
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
    private static readonly singletons = new Map<any, NumberObserver>();
    static singletonForObject(object: any, func: () => number): NumberObserver {
        let x = this.singletons.get(object);
        if (!x) {
            x = new NumberObserver(func);
            this.singletons.set(object, x);
        }
        return x;
    }
}
