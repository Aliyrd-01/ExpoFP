import { loadImage } from "./imageloader";
import isMobile from "./is-mobile";
import isWebview from "./is-webview";

const isMobileDevice = isMobile || isWebview;

const BATCH_SIZE = isMobileDevice ? 8 : 512;
const DELAY = isMobileDevice ? 100 : 0;

export interface ImageUrls {
    preferred?: string;
    fallback: string;
}

export async function loadImagesInBatches(
    urls: ImageUrls[],
    batchSize = BATCH_SIZE,
    delay = DELAY,
): Promise<HTMLImageElement[]> {
    if (!urls.length) return [];

    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize).map(async ({ preferred, fallback }) => {
            let img;

            if (preferred) {
                img = await loadImage(preferred);
            }

            if (!img) {
                img = await loadImage(fallback);
            }
            return img;
        });

        const results = await Promise.all(batch);
        loadedImages.push(...results.filter((img): img is HTMLImageElement => img !== null));

        await new Promise(resolve => setTimeout(resolve, delay));
    }

    return loadedImages;
}

export async function loadImagesInBatchesById(
    logosUrls: Map<number, ImageUrls>,
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
