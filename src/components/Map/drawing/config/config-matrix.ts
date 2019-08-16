// import { allDrawers, requireUpdate } from "./draw";
import animate from './animate';
import { DrawerContext } from "../Drawer";


export default function configMatrix(c: DrawerContext) {
    const minVisibleScale = 0;
    const maxVisibleScale = c.getVisibleScale();

    if (c.updatable) c.setVisibleScale(minVisibleScale);

    // m.start();

    return {
        after: update,
        animate: (cb) => {
            if (c.updatable) {
                animate(0, 1000, d3.easeExpOut, d3.interpolateNumber(minVisibleScale, maxVisibleScale),
                    c.requireUpdate.bind(c),
                    v => {
                        c.setVisibleScale(v);
                        update()
                    },
                    () => {
                        cb();
                        c.subscribeMatrixChange(() => c.requireUpdate(update));
                    });
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

