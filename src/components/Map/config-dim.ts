import { allDrawers, requireUpdate } from "./draw";
import animate from './animate';


// let dim = 0;

export default function configDim() {
    requireUpdate(update);
    store.watch(((s, g) => g.dimmed) as any, (v: boolean, oldV: boolean) => {
        // dim = v ? 1 : 0;
        // console.log('dim', dim);
        requireUpdate(update);
    });
}

function update() {
    for (const d of allDrawers) {
        d.dim = store.getters.dimmed ? 1 : 0;
    }
}

