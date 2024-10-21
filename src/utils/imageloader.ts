import { Booth, RegularBooth } from "../store/BoothStore";

export type Img = {
    booth: Booth;
    name?: string;
    htmlImage: HTMLImageElement;
    bounds: { x: number; y: number; width: number; height: number; angle: number };
};

export default function logosFromBooths(booths: RegularBooth[]): Promise<Img[]> {
    return Promise.all(
        booths.map(
            (booth: RegularBooth) =>
                new Promise<Img>(async (resolve) => {
                    const src = booth.exhibitors?.find((e) => e.logoInBooth && e.logo)?.logo;

                    if (!src) return resolve(null);
                    const rect = booth.rect;

                    var img = await loadImage(src, true);
                    if (!img) return resolve(null);

                    const ratioBooth = rect.w / rect.h;
                    const ratio = img.width / img.height;
                    let w = 0;
                    let h = 0;
                    let angle: number;

                    if (ratioBooth > ratio) {
                        h = rect.h * 0.9;
                        w = h * ratio;
                    } else {
                        w = rect.w * 0.9;
                        h = w / ratio;
                    }

                    if (ratio >= 2 && !booth.rotate && booth.rect.h >= booth.rect.w * 2.0) {
                        let newH = rect.w * 0.9;
                        let newW = newH * ratio;

                        while (newW > rect.h - 2) {
                            newH--;
                            newW = newH * ratio;
                        }

                        h = newH;
                        w = newW;
                        angle = -90;
                    } else {
                        angle = (-booth.rotate * 180) / Math.PI;
                    }

                    const x = rect.cx - w / 2;
                    const y = rect.cy - h / 2;

                    resolve({
                        name: booth.slug,
                        bounds: { x, y, width: w, height: h, angle: angle },
                        htmlImage: img,
                        booth,
                    });
                })
        )
    );
}

export function loadIcons(svgImages: SVGImageElement[]): Promise<Img[]> {
    return Promise.all(
        svgImages.map(
            (image) =>
                new Promise<Img>(async (resolve, reject) => {
                    var img = await loadImage(image.href.animVal, false);
                    resolve(
                        img
                            ? {
                                  bounds: {
                                      x: image.x.animVal.value,
                                      y: image.y.animVal.value,
                                      width: image.width.animVal.value,
                                      height: image.height.animVal.value,
                                      angle: image.transform?.animVal[0]?.angle ?? 0,
                                  },
                                  htmlImage: img,
                                  booth: null,
                              }
                            : null
                    );
                })
        )
    );
}

function loadImage(src: string, withResize: boolean): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        var img = new Image();
        img.onerror = () => resolve(null);
        img.onload = () => resolve(withResize ? resizeImage(img, 150, 150) : img);
        img.crossOrigin = "anonymous";
        img.src = src; //.replace(`${settings.EXPO}.expofp.com`, `efp-data.s3.amazonaws.com/expos/${settings.EXPO}`);
    });
}

async function resizeImage(image: HTMLImageElement, maxWidth: number, maxHeight: number): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let width = image.width;
        let height = image.height;

        if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const resizeRatio = Math.min(widthRatio, heightRatio);

            width = width * resizeRatio;
            height = height * resizeRatio;
        } else {
            return resolve(image);
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(image, 0, 0, width, height);

        var dataURL = canvas.toDataURL("image/png");
        var newImage = new Image();
        newImage.onload = () => resolve(newImage);
        newImage.src = dataURL;
    });
}
