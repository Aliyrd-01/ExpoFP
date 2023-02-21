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

                    if (ratioBooth > ratio) {
                        h = rect.h * 0.9;
                        w = h * ratio;
                    } else {
                        w = rect.w * 0.9;
                        h = w / ratio;
                    }

                    const x = rect.cx - w / 2;
                    const y = rect.cy - h / 2;

                    resolve({
                        name: booth.slug,
                        bounds: { x, y, width: w, height: h, angle: (-booth.rotate * 180) / Math.PI },
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
        img.src = src;
    });
}
