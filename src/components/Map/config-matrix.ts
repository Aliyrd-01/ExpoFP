import { delayAnimations, allDrawers, requireUpdate } from "./draw";
import animate from './animate';
import * as m from './matrix';


const minVisibleScale = 0;
const maxVisibleScale = 0.96;

export default function configMatrix() {
    requireUpdate(update);
    m.subscribeMatrixChange(() => requireUpdate(update));
    m.setVisbleScale(minVisibleScale);
    m.start();

    animate(delayAnimations, 1000, d3.easeExpOut, d3.interpolateNumber(minVisibleScale, maxVisibleScale), v => {
        m.setVisbleScale(v);
        update()
    });
}

function update() {
    // __logger.log('matrix change', m.getZoomTransform())
    for (const d of allDrawers) {
        d.matrix = m.getMatrix();
        d.ptscale = m.getPtscale();
    }
}