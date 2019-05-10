import { allDrawers, requireUpdate } from "./draw";
import animate from './animate';


let dim = 0;

export default function configDim() {
    requireUpdate(update);
    store.watch(((s, g) => g.dimmed) as any, (v: boolean, oldV: boolean) => {
        // dim = v ? 1 : 0;
        // __logger.log('dim', dim);
        requireUpdate(update);
    });
}

let cancelAnimation: () => void;

function update() {
    const targetDim = store.getters.dimmed ? 1 : 0;
    if (targetDim === dim) return;
    if (cancelAnimation) cancelAnimation();
    if (targetDim == 1) {
        cancelAnimation = animate(0, 200, null, d3.interpolateNumber(0, targetDim), (v) => {
            dim = v;
            setAllDrawers();
        })
    } else {
        dim = targetDim;
        setAllDrawers();
    }
}

function setAllDrawers() {
    for (const d of allDrawers) {
        d.dim = dim;
    }
}

