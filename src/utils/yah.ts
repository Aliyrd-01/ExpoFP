export const yahKey = "__yah";

export function setYah(x: number, y: number, scale: number): void {
    localStorage.setItem(yahKey, `${x},${y},${scale}`);
};

export function removeYah(){
    localStorage.removeItem(yahKey);
};

export function getYah(): [number, number, number]{
    if (localStorage.getItem(yahKey)){
        const yahValues = localStorage.getItem(yahKey).split(",");
        if (yahValues.length === 3) return [parseFloat(yahValues[0]), parseFloat(yahValues[1]), parseFloat(yahValues[2])];
    }
};