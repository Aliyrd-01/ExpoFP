// import { allDrawers, requireUpdate } from "./draw";
import { easeExpOut } from "d3-ease";
import { interpolateNumber } from "d3-interpolate";
import { uiState } from "../../../../store";
import { DrawerContext } from "../Drawer1";
import animate from "./animate";

export default function configMatrix(c: DrawerContext) {
    const minVisibleScale = 0;
    const maxVisibleScale = c.getVisibleScale();

    if (c.updatable) c.setVisibleScale(minVisibleScale);

    return {
        after: c.updateMatrixScale,
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
                        c.updateMatrixScale();
                    },
                    () => {
                        if (cb) cb();
                        c.subscribeMatrixChange(() => c.requireUpdate(c.updateMatrixScale));
                        uiState.canvasStarted = true;
                    }
                );
            }
        },
    };
}
