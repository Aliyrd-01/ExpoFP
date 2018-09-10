
export function getFpDestinationRectangle(svgWidth: number, svgHeight: number, canvasWidth: number, canvasHeight: number, visibleRect: Rect) {
    // debugger
    if (!visibleRect) visibleRect = Rect.fromXywh(0, 0, canvasWidth, canvasHeight);
    const visibleRatio = visibleRect.w / visibleRect.h;
    const svgRatio = svgWidth / svgHeight;

    // const canvasRatio = canvasWidth / canvasHeight;
    // const svgRatio = svgWidth / svgHeight;
    let svgW, svgH
    if (visibleRatio < svgRatio) {
        svgW = visibleRect.w;
        svgH = visibleRect.w / svgRatio;
    } else {
        svgH = visibleRect.h;
        svgW = visibleRect.h * svgRatio;
    }
    const svgDx = (visibleRect.w - svgW) / 2;
    const svgDy = (visibleRect.h - svgH) / 2;
    const scale = svgW / svgWidth;
    return { x: svgDx + visibleRect.x1, y: svgDy + visibleRect.y1, width: svgW, height: svgH, scale };
}

export function remsToPixels(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function getFont(px: number) {
    return px + 'px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
}



