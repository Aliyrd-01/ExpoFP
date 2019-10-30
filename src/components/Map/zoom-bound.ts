import { Drawer } from "./drawing/Drawer1";
import { ZoomTransform, zoomIdentity } from "d3-zoom";
import { svgHeight, svgWidth } from "../../data/svg";
import settings from "../../tools/settings";
import { uiState } from "../../store";
// import { MatrixReadonly } from "./drawing/Matrix";

function zoomBound(drawer: Drawer, transform: ZoomTransform, forAutoMove: boolean) {
    // cannot use ptscale here, it has previous transform.k in it
    const svgPxMatrix = drawer.getSvgPxUnzoomedMatrix();
    // const svgPxMatrix = m.getSvgPxUnzoomedMatrix();
    // https://math.stackexchange.com/questions/237369/given-this-transformation-matrix-how-do-i-decompose-it-into-translation-rotati
    const scale = svgPxMatrix[0];

    const svgHeightUnscaled = svgHeight * scale;
    const svgWidthUnscaled = svgWidth * scale;

    const vRect = drawer.getVisibleRect().scale(1 / drawer.pixelRatio);

    const svgHeightScaled = svgHeightUnscaled * transform.k;
    const svgWidthScaled = svgWidthUnscaled * transform.k;

    // calc center zoom tx/ty
    const centerTy = -vRect.cy * (transform.k - 1);
    const centerTx = -vRect.cx * (transform.k - 1);
    // forAutoMove = true;
    const extra = forAutoMove ? 0.1 : 0.5;

    const allowShiftYBase = (svgHeightScaled - vRect.h) / 2;
    const allowShiftY = forAutoMove ? Math.max(allowShiftYBase, 0) : Math.abs(allowShiftYBase);
    const maxDeltaY = allowShiftY + Math.min(vRect.h, svgHeightScaled) * extra;
    const maxTy = centerTy + maxDeltaY;
    const minTy = centerTy - maxDeltaY;

    const allowShiftXBase = (svgWidthScaled - vRect.w) / 2;
    const allowShiftX = forAutoMove ? Math.max(allowShiftXBase, 0) : Math.abs(allowShiftXBase);
    const maxDeltaX = allowShiftX + Math.min(vRect.w, svgWidthScaled) * extra;
    const maxTx = centerTx + maxDeltaX;
    const minTx = centerTx - maxDeltaX;

    const y = Math.min(maxTy, Math.max(minTy, transform.y));
    const x = Math.min(maxTx, Math.max(minTx, transform.x));
    if (y !== transform.y || x !== transform.x) {
        return zoomIdentity.translate(x, y).scale(transform.k); // { x, y, k: transform.k };
    }
    return transform;
}

// TODO: finish
function zoomBoundBg(drawer: Drawer, transform: ZoomTransform, forAutoMove: boolean) {
    // cannot use ptscale here, it has previous transform.k in it
    const svgPxMatrix = drawer.getSvgPxUnzoomedMatrix();
    // const svgPxMatrix = m.getSvgPxUnzoomedMatrix();
    // https://math.stackexchange.com/questions/237369/given-this-transformation-matrix-how-do-i-decompose-it-into-translation-rotati
    const scale = svgPxMatrix[0];

    const svgHeightUnscaled = svgHeight * scale;
    const svgWidthUnscaled = svgWidth * scale;

    let vRect1 = drawer.getVisibleRect().scale(1 / drawer.pixelRatio);
    const vRect = uiState.screenSize;//.scale(1 / drawer.pixelRatio);
    const cy = vRect.height / 2;
    const cx = vRect.width / 2;

    const svgHeightScaled = svgHeightUnscaled * transform.k;
    const svgWidthScaled = svgWidthUnscaled * transform.k;

    // const vRect = uiState.canvasVisibleRectPx.scale(1 / drawer.pixelRatio);

    //console.log("za", vRect1.h, vRect1.w, vRect.height, vRect.width, svgWidthUnscaled, svgHeightUnscaled, svgWidthScaled, svgHeightScaled);

    // calc center zoom tx/ty
    const centerTy = -cy * (transform.k - 1);
    const centerTx = -cx * (transform.k - 1);
    forAutoMove = true;

    const extra = 0; //forAutoMove ? 0.1 : 0.5;

    const allowShiftYBase = (svgHeightScaled - vRect.height) / 2;
    const allowShiftY = forAutoMove ? Math.max(allowShiftYBase, 0) : Math.abs(allowShiftYBase);
    const maxDeltaY = Math.max(allowShiftYBase, 0); //allowShiftY + Math.min(vRect.height, svgHeightScaled) * extra;
    const maxTy = centerTy + maxDeltaY;
    const minTy = centerTy - maxDeltaY;

    console.log("za", svgHeightScaled, vRect.height, allowShiftYBase, transform.y - centerTy, vRect.height / 2, svgHeightScaled / 2);

    const allowShiftXBase = (svgWidthScaled - vRect.width) / 2;
    const allowShiftX = forAutoMove ? Math.max(allowShiftXBase, 0) : Math.abs(allowShiftXBase);
    const maxDeltaX = allowShiftX + Math.min(vRect.width, svgWidthScaled) * extra;
    const maxTx = centerTx + maxDeltaX;
    const minTx = centerTx - maxDeltaX;

    const y = Math.min(maxTy, Math.max(minTy, transform.y));
    const x = Math.min(maxTx, Math.max(minTx, transform.x));
    if (y !== transform.y || x !== transform.x) {
        return zoomIdentity.translate(x, y).scale(transform.k); // { x, y, k: transform.k };
    }
    return transform;
}

export default settings.EXPO === "eventtechlive2019" ? zoomBoundBg : zoomBound;
