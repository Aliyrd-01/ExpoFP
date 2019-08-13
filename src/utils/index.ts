export function remsToPixels(rem: number): number {
    // TODO: touch store devicePixelRatio
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function sortByName<T extends { name: string }>(arr: T[]) {
    arr.sort(function(a: T, b: T) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
}

const c = document.createElement("canvas");
const gl = c.getContext("webgl") || (c.getContext("experimental-webgl") as any);
export const isWebGlSupported = !!gl;
if (!isWebGlSupported) {
    const d = document.createElement("div");
    d.innerHTML = "<!--no webgl-->";
    document.body.appendChild(d);
}

// let isWebGlSupportedVal: boolean;
// export function isWebGlSupported() {
//     if (typeof isWebGlSupportedVal === "undefined") {
//         const c = document.createElement("canvas");
//         const gl = c.getContext("webgl") || (c.getContext("experimental-webgl") as any);
//         isWebGlSupportedVal = !!gl;
//         if (!isWebGlSupportedVal) {
//             const d = document.createElement("div");
//             d.innerHTML = "<!--no webgl-->";
//             document.body.appendChild(d);
//         }
//     }
//     return isWebGlSupportedVal;
// }
