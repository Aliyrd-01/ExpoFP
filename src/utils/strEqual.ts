export function strEqual(a: string, b: string): boolean {
    return a?.localeCompare(b, undefined, { sensitivity: "base" }) === 0;
}
