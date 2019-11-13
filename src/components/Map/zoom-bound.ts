import { zoomIdentity, ZoomTransform } from "d3-zoom";
import { svgArea, svgSize } from "../../data/svg";
import { Drawer } from "./drawing/Drawer1";
// import { MatrixReadonly } from "./drawing/Matrix";

// function zoomBoundOld(drawer: Drawer, transform: ZoomTransform, forAutoMove: boolean) {
//     // cannot use ptscale here, it has previous transform.k in it
//     const svgPxMatrix = drawer.getSvgPxUnzoomedMatrix();
//     // const svgPxMatrix = m.getSvgPxUnzoomedMatrix();
//     // https://math.stackexchange.com/questions/237369/given-this-transformation-matrix-how-do-i-decompose-it-into-translation-rotati
//     const scale = svgPxMatrix[0];

//     const svgHeightUnscaled = svgSize.height * scale;
//     const svgWidthUnscaled = svgSize.width * scale;

//     const vRect = drawer.getVisibleRect().scale(1 / drawer.pixelRatio);

//     const svgHeightScaled = svgHeightUnscaled * transform.k;
//     const svgWidthScaled = svgWidthUnscaled * transform.k;

//     // calc center zoom tx/ty
//     const centerTy = -vRect.cy * (transform.k - 1);
//     const centerTx = -vRect.cx * (transform.k - 1);
//     // forAutoMove = true;
//     const extra = forAutoMove ? 0.1 : 0.5;

//     const allowShiftYBase = (svgHeightScaled - vRect.h) / 2;
//     const allowShiftY = forAutoMove ? Math.max(allowShiftYBase, 0) : Math.abs(allowShiftYBase);
//     const maxDeltaY = allowShiftY + Math.min(vRect.h, svgHeightScaled) * extra;
//     const maxTy = centerTy + maxDeltaY;
//     const minTy = centerTy - maxDeltaY;

//     const allowShiftXBase = (svgWidthScaled - vRect.w) / 2;
//     const allowShiftX = forAutoMove ? Math.max(allowShiftXBase, 0) : Math.abs(allowShiftXBase);
//     const maxDeltaX = allowShiftX + Math.min(vRect.w, svgWidthScaled) * extra;
//     const maxTx = centerTx + maxDeltaX;
//     const minTx = centerTx - maxDeltaX;

//     const y = Math.min(maxTy, Math.max(minTy, transform.y));
//     const x = Math.min(maxTx, Math.max(minTx, transform.x));
//     if (y !== transform.y || x !== transform.x) {
//         return zoomIdentity.translate(x, y).scale(transform.k); // { x, y, k: transform.k };
//     }
//     return transform;
// }

// minzoomlevel

export function getMinZoomLevel(drawer: Drawer) {
    let vRectPx = drawer.getVisibleRect().scale(1 / drawer.pixelRatio);
    const svgPxScale = drawer.getSvgPxUnzoomedScale(); // when transform.k == 1
    // const scale = svgPxMatrix[0];
    const svgSizePx = svgSize.scale(svgPxScale);
    const svgAreaPx = svgArea.scale(svgPxScale);
    // if svg area fits

    const ratioX = vRectPx.w / svgSizePx.width;
    const ratioY = vRectPx.h / svgSizePx.height;
    const minRatio = Math.max(ratioX, ratioY);

    const aratioX = vRectPx.w / svgAreaPx.w;
    const aratioY = vRectPx.h / svgAreaPx.h;
    const maxRatio = Math.min(aratioX, aratioY);

    return Math.min(maxRatio, minRatio);

    // const svgHeightUnscaled = svgHeight * scale;
    // const svgWidthUnscaled = svgWidth * scale;
}

function zoomBound(drawer: Drawer, transform: ZoomTransform, forAutoMove: boolean) {
    const limitToSvg = svgArea.w < svgSize.width;

    // https://math.stackexchange.com/questions/237369/given-this-transformation-matrix-how-do-i-decompose-it-into-translation-rotati
    const svgPxScale = drawer.getSvgPxUnzoomedScale();
    const minK = getMinZoomLevel(drawer);
    // console.log("kk", minK, transform.k);
    const k = limitToSvg ? Math.max(minK, transform.k) : transform.k;

    const svgSizePx = svgSize.scale(svgPxScale);

    // const svgHeightUnscaled = svgHeight * scale;
    // const svgWidthUnscaled = svgWidth * scale;

    let vRect = drawer.getVisibleRect().scale(1 / drawer.pixelRatio);
    // const screenSize = uiState.screenSize; //.scale(1 / drawer.pixelRatio);

    const cy = vRect.cy; // / 2;
    const cx = vRect.cx; // screenSize.width / 2;

    const svgHeightScaled = svgSizePx.height * k;
    const svgWidthScaled = svgSizePx.width * k;
    //const svgCenterYScaled = svgCenterY * k;
    const svgCenterYShiftScaled = (svgSize.height / 2 - svgArea.cy) * k * svgPxScale;
    const svgCenterXShiftScaled = (svgSize.width / 2 - svgArea.cx) * k * svgPxScale;

    // const maxDeltaYBot = vRect

    // const vRect = uiState.canvasVisibleRectPx.scale(1 / drawer.pixelRatio);

    //console.log("za", vRect1.h, vRect1.w, vRect.height, vRect.width, svgWidthUnscaled, svgHeightUnscaled, svgWidthScaled, svgHeightScaled);

    // calc center zoom tx/ty
    const centerTy = -cy * (k - 1);
    const centerTx = -cx * (k - 1);
    // forAutoMove = true;

    const allowShiftYBase = (svgHeightScaled - vRect.h) / 2;
    const allowShiftXBase = (svgWidthScaled - vRect.w) / 2;

    let maxTy, minTy, maxTx, minTx;

    if (!limitToSvg) {
        // old way
        const extra = forAutoMove ? 0.1 : 0.5;

        const allowShiftY = forAutoMove ? Math.max(allowShiftYBase, 0) : Math.abs(allowShiftYBase);
        const maxDeltaY = allowShiftY + Math.min(vRect.h, svgHeightScaled) * extra;
        maxTy = centerTy + maxDeltaY;
        minTy = centerTy - maxDeltaY;

        const allowShiftX = forAutoMove ? Math.max(allowShiftXBase, 0) : Math.abs(allowShiftXBase);
        const maxDeltaX = allowShiftX + Math.min(vRect.w, svgWidthScaled) * extra;
        maxTx = centerTx + maxDeltaX;
        minTx = centerTx - maxDeltaX;
    } else {
        // const allowShiftY = forAutoMove ? Math.max(allowShiftYBase, 0) : Math.abs(allowShiftYBase);
        const maxDeltaY = Math.max(allowShiftYBase, 0); //Math.max(allowShiftYBase, 0); //allowShiftY + Math.min(vRect.height, svgHeightScaled) * extra;
        maxTy = centerTy + maxDeltaY - svgCenterYShiftScaled;
        minTy = centerTy - maxDeltaY - svgCenterYShiftScaled;

        // const allowShiftY = forAutoMove ? Math.max(allowShiftYBase, 0) : Math.abs(allowShiftYBase);
        const maxDeltaX = Math.max(allowShiftXBase, 0); //Math.max(allowShiftYBase, 0); //allowShiftY + Math.min(vRect.height, svgHeightScaled) * extra;
        maxTx = centerTx + maxDeltaX - svgCenterXShiftScaled;
        minTx = centerTx - maxDeltaX - svgCenterXShiftScaled;
    }

    // logger.log("kk2", maxDeltaX, svgCenterXShiftScaled, centerTx);

    // console.log(
    //     "za",
    //     transform.x,
    //     transform.y,
    //     vRect1.y1,
    //     vRect1.y2,
    //     vRect1.h,
    //     svgHeightScaled,
    //     vRect1.h,
    //     vRect.height,
    //     allowShiftYBase,
    //     transform.y - centerTy,
    //     vRect.height / 2,
    //     svgHeightScaled / 2
    // );

    const y = Math.min(maxTy, Math.max(minTy, transform.y));
    const x = Math.min(maxTx, Math.max(minTx, transform.x));
    if (y !== transform.y || x !== transform.x || k !== transform.k) {
        return zoomIdentity.translate(x, y).scale(k); // { x, y, k: transform.k };
    }
    return transform;
}

export default zoomBound; // settings.EXPO === "eventtechlive20191" ? zoomBoundBg : zoomBound;
