export function remsToPixels(rem: number): number {
    // TODO: touch store devicePixelRatio
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}