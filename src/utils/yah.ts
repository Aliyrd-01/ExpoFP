import { Booth } from "../store/BoothStore";
import { isLocalStorageAvailable } from "./localStorage";

export const yahKey = "__yah";

export function setYah(value: string): void {
    isLocalStorageAvailable && localStorage.setItem(yahKey, value);
}

export function removeYah() {
    isLocalStorageAvailable && localStorage.removeItem(yahKey);
}

export function isYahBooth(booth: Booth) {
    return /^yah_/i.test(booth.name) || /^You\s+are\s+here$/i.test(booth.title?.trim());
}

export function getYah(): [number, number, number] | string {
    if (isLocalStorageAvailable && localStorage.getItem(yahKey)) {
        const yahValues = localStorage.getItem(yahKey).split(",");
        if (yahValues.length === 3) return [parseFloat(yahValues[0]), parseFloat(yahValues[1]), parseFloat(yahValues[2])];
        if (yahValues.length === 1) return yahValues[0];
    }
}
