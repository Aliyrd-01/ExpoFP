export function remsToPixels(rem: number): number {
    // TODO: touch store devicePixelRatio
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function sortByName<T extends { name: string }>(arr: T[]) {
    arr.sort(function (a: T, b: T) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
}