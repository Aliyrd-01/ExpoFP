import logger from "./logger";

let loadedBytes = 0;

export function countTexture(width: number, height: number, bytesPerPixel: number) {
    const length = width * height * bytesPerPixel;
    loadedBytes += length;
    const loadedMbRounded = Math.floor(loadedBytes / 1024 / 1024);
    logger.log(`Textures: ${loadedMbRounded} MB`);
}
