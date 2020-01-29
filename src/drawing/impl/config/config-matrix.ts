// import { allDrawers, requireUpdate } from "./draw";
import { reaction } from "mobx";
import DrawerImpl from "../DrawerImpl";
// import { uiState } from "../../../../store";

export default function configMatrix(c: DrawerImpl) {
    return reaction(
        () => [c.matrix, c.ptscale],
        () => {
            // console.log("Starting autorun for configMatrix");
            c.requireUpdate(() => {
                for (const d of c.allPainters) {
                    d.matrix = c.matrix;
                    d.ptscale = c.ptscale;
                }
            });
        },
        { fireImmediately: true }
    );
    // const uiState = c.fp.store.uiState;
    // const minVisibleScale = 0;
    // const maxVisibleScale = c.getVisibleScale();

    // if (c.updatable) c.setVisibleScale(minVisibleScale);

    // // m.start();

    // return {
    //     after: update,
    //     animate: cb => {
    //         if (c.updatable) {
    //             animate(
    //                 0,
    //                 1000,
    //                 easeExpOut,
    //                 interpolateNumber(minVisibleScale, maxVisibleScale),
    //                 c.requireUpdate.bind(c),
    //                 v => {
    //                     c.setVisibleScale(v);
    //                     update();
    //                 },
    //                 () => {
    //                     if (cb) cb();
    //                     c.subscribeMatrixChange(() => c.requireUpdate(update));
    //                     uiState.canvasStarted = true;
    //                 }
    //             );
    //         }
    //     }
    // };

    // function update() {
    //     // __logger.log('matrix change', m.getZoomTransform())
    //     for (const d of c.allPainters) {
    //         d.matrix = c.getMatrix();
    //         d.ptscale = c.ptscale;
    //     }
    // }
}
