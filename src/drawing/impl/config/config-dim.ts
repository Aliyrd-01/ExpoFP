import { interpolateNumber } from "d3-interpolate";
import { reaction } from "mobx";
import DrawerImpl from "../DrawerImpl";
import animate from "../../../utils/animate";

export default function configDim(context: DrawerImpl) {
    let dim = 0;
    let cancelAnimation: () => void;

    // if (context.updatable) {
    const disposeReaction = reaction(
        () => context.dimmed,
        () => context.requireUpdate(update)
    );

    function update() {
        const targetDim = context.dimmed ? 1 : 0;
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

    setAllPainters();

    return () => {
        disposeReaction();
        if (cancelAnimation) cancelAnimation();
    };
}
