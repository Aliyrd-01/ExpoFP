import { m4 } from 'twgl.js';
import { svgWidth, svgHeight } from '@/tools/svg';
import { delayAnimations, allDrawers, requireUpdate } from "./draw";
import animate from './animate';
import * as m from './matrix';


const maxVisibleScale = 0.95;

export default function configMatrix() {
    requireUpdate(update);
    m.subscribeMatrixChange(() => requireUpdate(update));

    animate(delayAnimations, 1000, d3.easeExpOut, d3.interpolateNumber(0, maxVisibleScale), v => {
        m.setVisbleScale(v);
        update();
    });
}

function update() {
    for (const d of allDrawers) {
        d.matrix = m.getMatrix();
        d.ptscale = m.getPtscale();
    }
}