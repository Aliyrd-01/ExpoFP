import { loadImage } from "./imageloader";

const BATCH_SIZE = 8;
const DELAY = 8;

export async function loadImagesInBatches(
    urls: string[],
    batchSize = BATCH_SIZE,
    delay = DELAY,
): Promise<HTMLImageElement[]> {
    if (!urls.length) return [];

    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize).map(loadImage);

        const results = await Promise.all(batch);
        loadedImages.push(...results.filter((img): img is HTMLImageElement => img !== null));

        await new Promise(resolve => setTimeout(resolve, delay));
    }

    return loadedImages;
}

export async function loadImagesInBatchesById(
    logosUrls: Map<number, string>,
    batchSize = BATCH_SIZE,
    delay = DELAY,
): Promise<Map<number, HTMLImageElement>> {
    if (!logosUrls.size) return new Map();

    const urlList = Array.from(logosUrls.values());
    const ids = Array.from(logosUrls.keys());

    const loadedImages = await loadImagesInBatches(urlList, batchSize, delay);

    const result = new Map<number, HTMLImageElement>();
    loadedImages.forEach((img, index) => {
        result.set(ids[index], img);
    });

    return result;
}
