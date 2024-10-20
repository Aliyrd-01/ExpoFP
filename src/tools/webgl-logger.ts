import logger from "./logger";

let loadedBytes = 0;
let loggedMb = 0;
const loggedByCategory = new Map<string, number>();

export function logBuffer(bytes: number, category: string) {
    loadedBytes += bytes;
    let categoryBytes = loggedByCategory.get(category) || 0;
    loggedByCategory.set(category, categoryBytes + bytes);

    const loadedMbRounded = Math.floor(loadedBytes / 1024 / 1024);
    // log every 10MB
    if (loadedMbRounded > loggedMb + 10) {
        loggedMb = loadedMbRounded;

        const catLogMessage = Array.from(
            loggedByCategory.entries().map(([key, value]) => {
                const roundedMb = Math.floor(value / 1024 / 1024);
                return `${key}: ${roundedMb}MB`;
            })
        ).join(", ");

        logger.log(`GPU Allocated: ${loadedMbRounded}MB, ${catLogMessage}`);
    }
}

// export function logTexture(width: number, height: number, bytesPerPixel: number) {
//     const length = width * height * bytesPerPixel;
//     loadedBytes += length;
//     const loadedMbRounded = Math.floor(loadedBytes / 1024 / 1024);
//     // log every 10MB
//     if (loadedMbRounded > loggedMb + 10) {
//         loggedMb = loadedMbRounded;
//         logger.log(`Textures: ${loadedMbRounded} MB`);
//     }
// }
