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

        animateProp(
            () => booth.selected,
            (t, timeSinceStart) => {
                this.selectBgAnimationPart = easeQuadInOut(t);
                if (timeSinceStart > 750 * 4) return false;
            },
            750,
            true
        );
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

function animateProp(
    val: () => boolean,
    setter: (t: number, timeSinceStart: number) => boolean | undefined,
    duration: number,
    reversable: boolean
) {
    const func = reversable ? reversableT : plainT;

    reaction(
        val,
        () => {
            if (val()) {
                let animationStart = performance.now();
                const drawFrame = () => {
                    if (!val()) return;
                    const res = setter(func(animationStart, duration), performance.now() - animationStart);
                    if (res === false) setter(0, 0);
                    else window.requestAnimationFrame(drawFrame);
                };
                drawFrame();
            } else {
                setter(0, 0);
            }
        },
        { fireImmediately: true }
    );

    function plainT(start: number, length: number): number {
        const now = performance.now();
        const part = (now - start) % length;
        // part will be 0 - 999.(9)
        return part / 1000;
    }

    function reversableT(start: number, length: number): number {
        const now = performance.now();
        const part = (now - start) % (length * 2);
        // part will be 0 - 1999.(9)
        const partN = part - length;
        // partN is -1000 to 999.(9)
        const tN = partN / 1000;
        // tN = [-1, 1)
        return 1 - Math.abs(tN);
    }
}
