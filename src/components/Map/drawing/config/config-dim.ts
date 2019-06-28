import animate from './animate';
import { DrawerContext } from "../drawer";


export default function configDim(context: DrawerContext) {

    let dim = 0;
    let cancelAnimation: () => void;

    // context.requireUpdate(update);
    store.watch(((s, g) => g.dimmed) as any, (v: boolean, oldV: boolean) => {
        // dim = v ? 1 : 0;
        // __logger.log('dim', dim);
        context.requireUpdate(update);
    });

    function update() {
        const targetDim = store.getters.dimmed ? 1 : 0;
        if (targetDim === dim) return;
        if (cancelAnimation) cancelAnimation();
        if (targetDim == 1) {
            cancelAnimation = animate(0, 200, null, d3.interpolateNumber(0, targetDim),
                context.requireUpdate.bind(context),
                (v) => {
                    dim = v;
                    setAllPainters();
                })
        } else {
            dim = targetDim;
            setAllPainters();
        }
    }

    function setAllPainters() {
        for (const d of context.allPainters) {
            d.dim = dim;
        }
    }

    return setAllPainters();
}



