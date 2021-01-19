import { easeQuadInOut } from "d3-ease";
import { observable, reaction } from "mobx";
import { Booth, RegularBooth } from "../../../../store/BoothStore";

const map = new Map<Booth, BoothShape>();

// shared booth object with its lifecycle
export default class BoothShape {
    private readonly booth: Booth;
    @observable selectBgAnimationPart: number;

    constructor(booth: Booth) {
        this.booth = booth;
        var bgSelected = (t) => (this.selectBgAnimationPart = easeQuadInOut(t));
        animateProp(() => booth.selected, t => (this.selectBgAnimationPart = easeQuadInOut(t)), 750, 7, true, true, booth);
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

function animateProp(val: () => boolean, setter: (t: number) => void, duration: number, iterations: number, reversable: boolean, resetToStartPoint: boolean, booth: Booth) {
    const func = reversable ? reversableT : plainT;

    if (iterations % 2 === 0 && resetToStartPoint) {
        iterations++;
    }
    const b = booth as RegularBooth;
    const hasColoredPath = b?.paths?.length && !! b.paths[0].color;
    if (hasColoredPath) {
        iterations --;
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
                        if (!hasColoredPath) {
                            setter(1);
                        }
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
        // partN is -1000 to 999.(9)
        //  console.log(part);
        const tN = partN / 1000;
        // tN = [-1, 1)
        const val = Math.abs(Math.abs(tN) - .75) / .75;
        console.log(val);
        return val;
    }
}
