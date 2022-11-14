import { Booth } from "./../store/BoothStore";
export default function logosFromBooths(booths: Booth[], sources: string[]): Promise<SVGImageElement[]> {
    return Promise.all(
        booths.map(
            (booth: any, index) =>
                new Promise<SVGImageElement>((resolve) => {
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

                        image.setAttribute("transforn", `rotate(${booth.rotate || 0} ${rect.cx} ${rect.cy})`);

                        resolve(image);
                    };

                    img.crossOrigin = "Anonymous";
                    img.src = src;
                })
        )
    );
}
