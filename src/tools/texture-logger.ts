import logger from "./logger";

let loadedBytes = 0;
let loggedMb = 0;

export function logTexture(width: number, height: number, bytesPerPixel: number) {
    const length = width * height * bytesPerPixel;
    loadedBytes += length;
    const loadedMbRounded = Math.floor(loadedBytes / 1024 / 1024);
    // log every 10MB
    if (loadedMbRounded > loggedMb + 10) {
        loggedMb = loadedMbRounded;
        logger.log(`Textures: ${loadedMbRounded} MB`);
    }
}
