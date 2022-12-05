import { Booth } from "./../store/BoothStore";

export type BoothImage = { image: SVGImageElement; booth: Booth };

export default function logosFromBooths(booths: Booth[], sources: string[]): Promise<BoothImage[]> {
    return Promise.all(
        booths.map(
            (booth: Booth, index) =>
                new Promise<BoothImage>((resolve) => {
                    const src = sources[index];
                    const rect = booth.rect;

                    var img = new Image();
                    img.onerror = () => resolve(null);
                    img.onload = () => {
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

                        var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
                        image.setAttribute("href", src);
                        image.setAttribute("width", w.toString());
                        image.setAttribute("height", h.toString());
                        image.setAttribute("x", x.toString());
                        image.setAttribute("y", y.toString());

                        image.setAttribute("transform", `rotate(${-booth.rotate * (180 / Math.PI) || 0} ${rect.cx} ${rect.cy})`);

                        resolve({ image, booth });
                    };

                    img.crossOrigin = "Anonymous";
                    img.src = src;
                })
        )
    );
}
