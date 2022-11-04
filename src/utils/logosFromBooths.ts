import { Booth, RegularBooth } from "./../store/BoothStore";
export default function logosFromBooths(booths: Booth[]): Promise<SVGImageElement[]> {
    return Promise.all(
        booths
            .filter((b) => b instanceof RegularBooth && b.exhibitors.find((e) => e.featured && e.logo))
            .map(
                (b: any) =>
                    new Promise<SVGImageElement>((resolve) => {
                        const booth = b as RegularBooth;
                        const src = booth.exhibitors.find((e) => e.featured && e.logo).logo;
                        const rect = booth.rect;

                        var img = new Image();
                        img.onerror = () => resolve(null);
                        img.onload = () => {
                            const ratio = img.height / img.width;
                            const w = rect.w * 0.9;
                            const h = w * ratio;
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
