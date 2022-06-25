// import { allDrawers, requireUpdate } from "./draw";
import animate from "./animate";
import { DrawerContext } from "../Drawer1";
import { easeExpOut } from "d3-ease";
import { interpolateNumber } from "d3-interpolate";
import { uiState } from "../../../../store";

export default function configMatrix(c: DrawerContext) {
    const minVisibleScale = 0;
    const maxVisibleScale = c.getVisibleScale();

    if (c.updatable) c.setVisibleScale(minVisibleScale);

    // m.start();

    return {
        after: update,
        animate: (cb, duration = 1000) => {
            if (c.updatable) {
                animate(
                    0,
                    duration,
                    easeExpOut,
                    interpolateNumber(minVisibleScale, maxVisibleScale),
                    c.requireUpdate.bind(c),
                    (v) => {
                        c.setVisibleScale(v);
                        update();
                    },
                    () => {
                        if (cb) cb();
                        c.subscribeMatrixChange(() => c.requireUpdate(update));
                        uiState.canvasStarted = true;
                    }
                );
            }
        },
    };

    function update() {
        // __logger.log('matrix change', m.getZoomTransform())
        for (const d of c.allPainters) {
            d.matrix = c.getMatrix();
            d.ptscale = c.ptscale;
        }
    }
}
