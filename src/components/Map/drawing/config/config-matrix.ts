// import { allDrawers, requireUpdate } from "./draw";
import animate from "./animate";
import { DrawerContext } from "../Drawer1";
import { easeExpOut } from "d3-ease";
import { interpolateNumber } from "d3-interpolate";

export default function configMatrix(c: DrawerContext) {
    const minVisibleScale = 0;
    const maxVisibleScale = c.getVisibleScale();

    if (c.updatable) c.setVisibleScale(minVisibleScale);

    // m.start();

    return {
        after: update,
        animate: cb => {
            if (c.updatable) {
                animate(
                    0,
                    1000,
                    easeExpOut,
                    interpolateNumber(minVisibleScale, maxVisibleScale),
                    c.requireUpdate.bind(c),
                    v => {
                        c.setVisibleScale(v);
                        update();
                    },
                    () => {
                        if (cb) cb();
                        c.subscribeMatrixChange(() => c.requireUpdate(update));
                    }
                );
            }
        }
    };

    function update() {
        // __logger.log('matrix change', m.getZoomTransform())
        for (const d of c.allPainters) {
            d.matrix = c.getMatrix();
            d.ptscale = c.getPtscale();
        }
    }
}
