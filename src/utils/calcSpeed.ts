export function calcSpeed(units: string): number {
    return units?.toLowerCase?.().trim() === "m" ? 1.4 : 4.2;
}
