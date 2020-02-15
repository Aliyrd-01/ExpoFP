import { IReactionDisposer, reaction } from "mobx";
import logger from "../../../tools/logger";

type NestedMap<T> = Map<any, NestedMap<T> | T>;
const observerByFuncId: NestedMap<NumberObserver> = new Map();

function getOrCreateInNestedMap<T>(map: NestedMap<T>, keys: any[], create: () => T) {
    let curMap = map;
    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!curMap[k]) {
            curMap = curMap[k] = new Map();
        } else {
            curMap = curMap[k];
        }
    }
    const lastKey = keys[keys.length - 1];
    let obj = curMap.get(lastKey) as T;

    if (!obj) {
        obj = create();
        curMap.set(lastKey, obj);
    }
    return obj;
}

function cleanupNestedMaps(map: NestedMap<any>, keys: any[]) {
    let curMap = map;
    // if a map has size == 0, then remove it from parent
    const mapsToCheck: {
        parent: Map<any, any>;
        k: any;
        map: Map<any, any>;
    }[] = [];
    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        const parent = curMap;
        curMap = curMap[k];
        if (!curMap) break;
        else {
            mapsToCheck.push({
                parent,
                k,
                map: curMap
            });
        }
    }
    // go from end
    for (let i = mapsToCheck.length - 1; i >= 0; i--) {
        const z = mapsToCheck[i];
        if (z.map.size === 0) {
            logger.log("cleanupNestedMaps", z.k);
            z.parent.delete(z.k);
        }
    }
}

export default function observeNumbers(func: () => number, funcIds: any[], nn: number[], cb: () => void): () => void {
    cb();
    const disposers = nn.map(x => observeNumber(func, funcIds, x, cb));
    return () => {
        disposers.forEach(x => x());
    };
}

function observeNumber(func: () => number, funcIds: any[], n: number, cb: () => void): () => void {
    // see if we have number observer for this funcId

    const numberObserver = getOrCreateInNestedMap(observerByFuncId, funcIds, () => new NumberObserver(func));
    // let map: Map<any, NumberObserver>;
    // let curMap = observerByFuncId;
    // for (let i = 0; i < funcIds.length; i++) {
    //     const k = funcIds[i];
    //     if (k < funcIds.length - 1) {
    //         curMap = curMap[k];
    //         if (!curMap) {
    //             curMap = curMap[k] = new Map();
    //         }
    //     } else {
    //         let numberObserver = curMap.get(k);

    //         if (!numberObserver) {
    //             numberObserver = new NumberObserver(func);
    //             curMap.set(k, numberObserver);
    //         }
    //     }
    //     // const candidate = curMap[k];
    //     //
    // }

    // let numberObserver = observerByFuncId.get(funcId);

    // if (!numberObserver) {
    //     numberObserver = new NumberObserver(func);
    //     observerByFuncId.set(funcId, numberObserver);
    // }

    const disposer = numberObserver.observeValue(n, cb);

    return () => {
        disposer();
        // see if number observer is no longer needed and dipose it as well
        if (numberObserver.observers.size === 0) {
            numberObserver.dispose();
            cleanupNestedMaps(observerByFuncId, funcIds);
        }
    };
}

class NumberObserver {
    readonly observers = new Map<number, Set<() => void>>();
    private prevVals: number[];
    private observersKeys: number[];
    private readonly reactionDispose: IReactionDisposer;
    constructor(func: () => number) {
        // this.func = func;
        // run
        this.reactionDispose = reaction(
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
            ar = new Set<() => void>();
            this.observers.set(n, ar);
            this.prevVals = null;
            this.observersKeys = null;
        }
        ar.add(cb);
        // dispose function
        return () => {
            ar.delete(cb);
            if (ar.size === 0) {
                this.observers.delete(n);
                this.prevVals = null;
                this.observersKeys = null;
            }
        };
    }

    dispose() {
        this.reactionDispose();
    }
}

// export class NumberObserverOld {
//     // private readonly func: () => number;
//     private readonly observers = new Map<number, (() => void)[]>();
//     private prevVals: number[];
//     private observersKeys: number[];
//     constructor(func: () => number) {
//         // this.func = func;
//         // run
//         reaction(
//             () => func(),
//             () => {
//                 const val = func();
//                 if (!this.observersKeys) {
//                     this.observersKeys = Array.from(this.observers.keys()).sort((a, b) => a - b);
//                 }
//                 const newVals = this.observersKeys.map(n => (val < n ? -1 : val > n ? 1 : 0));
//                 for (let i = 0; i < this.observersKeys.length; i++) {
//                     const n = this.observersKeys[i];
//                     const newVal = newVals[i];
//                     if (!this.prevVals || this.prevVals[i] !== newVal) {
//                         for (const f of this.observers.get(n)) {
//                             f();
//                         }
//                     }
//                 }
//                 this.prevVals = newVals;
//             }
//         );
//     }
//     observeValue(n: number, cb: () => void) {
//         let ar = this.observers.get(n);
//         if (!ar) {
//             ar = [];
//             this.observers.set(n, ar);
//             this.prevVals = null;
//             this.observersKeys = null;
//         }
//         ar.push(cb);
//     }
//     private static readonly singletons = new Map<any, NumberObserver>();
//     static singletonForObject(object: any, func: () => number): NumberObserver {
//         let x = this.singletons.get(object);
//         if (!x) {
//             x = new NumberObserver(func);
//             this.singletons.set(object, x);
//         }
//         return x;
//     }
// }
