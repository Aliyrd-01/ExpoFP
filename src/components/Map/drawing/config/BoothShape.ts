import { easeQuadInOut } from "d3-ease";
import { observable, reaction } from "mobx";
import { Booth } from "../../../../store/BoothStore";

const map = new Map<Booth, BoothShape>();

// shared booth object with its lifecycle
export default class BoothShape {
    private readonly booth: Booth;
    @observable selectBgAnimationPart: number;

    constructor(booth: Booth) {
        this.booth = booth;
        var bgSelected = (t) => (this.selectBgAnimationPart = easeQuadInOut(t));
        animateProp(() => booth.selected, t => (this.selectBgAnimationPart = easeQuadInOut(t)), 1000, 8, true);
    }

    static get(b: Booth) {
        let p = map.get(b);
        if (!p) {
            p = new BoothShape(b);
            map.set(b, p);
        }
        return p;
    }
}

function animateProp(val: () => boolean, setter: (t: number) => void, duration: number, iterations: number, reversable: boolean) {
    const func = reversable ? reversableT : plainT;

    if (iterations % 2 === 1) {
        iterations++;
    }

    reaction(
        val,
        () => {
            if (val()) {
                const animationStart = performance.now();
                const maxTime = animationStart + iterations * duration;
                const drawFrame = () => {
                    if (!val()) return;
                    if (performance.now() >= maxTime) {
                        // explicitly complete with the final color, without this call-animation ends not exactly at final color( (~0.98.. or ~0.99..)
                        setter(0);
                        return;
                    }
                    setter(func(animationStart, duration));
                    window.requestAnimationFrame(drawFrame);
                };
                drawFrame();
            } else {
                setter(0);
            }
        },
        { fireImmediately: true }
    );

    function plainT(start: number, length: number): number {
        const now = performance.now();
        const part = (now - start) % length;
        // part will be 0 - duration(almost)
        return part / 1000;
    }

    function reversableT(start: number, length: number): number {
        const now = performance.now();
        const part = (now - start) % (length * 2);

        // part will be 0 - duration almost
        const partN = part - length;
        // partN is -duration to + duration (almost) in ms
        const tN = partN / 1000;
        // tN = [-duration, duration] in sec

        // length/1000 will be = 1 only then length is 1000 ms; if duration will have changes, this formula reflects it
        return Math.abs(Math.abs(tN) - length / 1000) / (length / 1000);
    }
}
