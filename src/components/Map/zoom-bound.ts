import * as m from './matrix';
import { svgWidth, svgHeight } from '@/tools/svg';

export default function zoomBound(transform: ZoomTransform): ZoomTransform {
    // cannot use ptscale here, it has previous transform.k in it
    // const pxSvgScale = m.getPxSvgScale();
    const svgPxMatrix = m.getSvgPxUnzoomedMatrix();
    // https://math.stackexchange.com/questions/237369/given-this-transformation-matrix-how-do-i-decompose-it-into-translation-rotati
    const scale = svgPxMatrix[0];

    const svgHeightUnscaled = svgHeight * scale;
    const svgWidthUnscaled = svgWidth * scale;

    const vRect = m.getVisibleRect();

    const svgHeightScaled = svgHeightUnscaled * transform.k;
    const svgWidthScaled = svgWidthUnscaled * transform.k;

    // calc center zoom tx/ty
    const centerTy = -vRect.cy * (transform.k - 1);
    const centerTx = -vRect.cx * (transform.k - 1);

    const extra = 0.5;

    const maxDeltaY =
        Math.abs((svgHeightScaled - vRect.h) / 2) +
        Math.min(vRect.h, svgHeightScaled) * extra;
    const maxTy = centerTy + maxDeltaY;
    const minTy = centerTy - maxDeltaY;

    const maxDeltaX =
        Math.abs((svgWidthScaled - vRect.w) / 2) +
        Math.min(vRect.w, svgWidthScaled) * extra;
    const maxTx = centerTx + maxDeltaX;
    const minTx = centerTx - maxDeltaX;

    const y = Math.min(maxTy, Math.max(minTy, transform.y));
    const x = Math.min(maxTx, Math.max(minTx, transform.x));
    if (y !== transform.y || x !== transform.x) {
        return { x, y, k: transform.k };
    }
    return transform;
}