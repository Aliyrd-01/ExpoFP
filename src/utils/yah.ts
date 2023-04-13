import { Booth } from "../store/BoothStore";

export const yahKey = "__yah";

export function setYah(value: string): void {
    localStorage.setItem(yahKey, value);
}

export function removeYah() {
    localStorage.removeItem(yahKey);
}

export function isYahBooth(booth: Booth) {
    return /^yah/i.test(booth.name) || /You\s+are\s+here/gi.test(booth.title);
}

export function getYah(): [number, number, number] | string {
    if (localStorage.getItem(yahKey)) {
        const yahValues = localStorage.getItem(yahKey).split(",");
        if (yahValues.length === 3) return [parseFloat(yahValues[0]), parseFloat(yahValues[1]), parseFloat(yahValues[2])];
        if (yahValues.length === 1) return yahValues[0];
    }
}
