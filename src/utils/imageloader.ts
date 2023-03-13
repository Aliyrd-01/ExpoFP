import { RegularBooth } from "../store/BoothStore";

export type Img = {
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

                    var img = await loadImage(src);
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
                    var img = await loadImage(image.href.animVal);
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
                              }
                            : null
                    );
                })
        )
    );
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        var img = new Image();
        img.onerror = () => resolve(null);
        img.onload = () => resolve(img);
        img.crossOrigin = "anonymous";
        img.src = src.replace(`nweventshow2023.expofp.com`, `efp-data.s3.amazonaws.com/expos/nweventshow2023`);
    });
}
