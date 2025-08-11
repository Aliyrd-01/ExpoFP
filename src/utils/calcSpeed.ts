const METERS_PER_SECOND = 1.4;
const FEET_PER_SECOND = 4.2;

export function calcSpeed(units: string): number {
    return units?.toLowerCase?.().trim() === "m" ? METERS_PER_SECOND : FEET_PER_SECOND;
}
