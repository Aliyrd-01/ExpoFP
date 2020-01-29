import { interpolateNumber } from "d3-interpolate";
import { reaction } from "mobx";
// import { uiState } from "../../../../store";
import { DrawerContext } from "../Drawer1";
import animate from "./animate";

export default function configDim(context: DrawerContext) {
    let dim = 0;
    let cancelAnimation: () => void;
    const uiState = context.fp.store.uiState;

    if (context.updatable) {
        reaction(
            () => uiState.dimmed,
            () => context.requireUpdate(update)
        );
        // store.watch(((s, g) => g.dimmed) as any, (v: boolean, oldV: boolean) => {
        //     // dim = v ? 1 : 0;
        //     // __logger.log('dim', dim);

        // });
    }

    function update() {
        const targetDim = uiState.dimmed ? 1 : 0;
        if (targetDim === dim) return;
        if (cancelAnimation) cancelAnimation();
        if (targetDim === 1) {
            cancelAnimation = animate(0, 200, null, interpolateNumber(0, targetDim), context.requireUpdate.bind(context), v => {
                dim = v;
                setAllPainters();
            });
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
