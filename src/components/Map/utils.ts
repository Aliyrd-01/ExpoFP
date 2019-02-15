export function remsToPixels(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function sizeCanvasToParentElement(canvas: HTMLCanvasElement) {
    const bWidth = canvas.parentElement.clientWidth;
    const bHeight = canvas.parentElement.clientHeight;
    const cWidth = bWidth * devicePixelRatio;
    const cHeight = bHeight * devicePixelRatio;

    if (canvas.clientWidth !== bWidth || canvas.clientHeight !== bHeight) {
        console.log("Setting canvas style width/height");

        canvas.style.width = bWidth + "px";
        canvas.style.height = bHeight + "px";
    }

    if (cWidth !== canvas.width || cHeight !== canvas.height) {
        canvas.width = cWidth;
        canvas.height = cHeight;
    }
}

let isWebGlSupportedVal: boolean;
export function isWebGlSupported() {
    if (typeof isWebGlSupportedVal === "undefined") {
        const c = document.createElement("canvas");
        const gl = c.getContext("webgl") || (c.getContext("experimental-webgl") as any);
        isWebGlSupportedVal = !!gl;
        if (!isWebGlSupportedVal) {
            const d = document.createElement("div");
            d.innerHTML = "<!--no webgl-->";
            document.body.appendChild(d);
        }
    }
    return isWebGlSupportedVal;
}
