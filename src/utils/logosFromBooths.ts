import { Booth, RegularBooth } from "./../store/BoothStore";
export default function logosFromBooths(booths: Booth[]): SVGImageElement[] {
    return booths
        .filter((b) => b instanceof RegularBooth && b.exhibitors.find((e) => e.featured && e.logo))
        .map((b: any) => {
            const  booth = b as RegularBooth;
            const rect = booth.rect;
            
            var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
            image.setAttribute("href", booth.exhibitors.find((e) => e.featured && e.logo).logo);
            image.setAttribute("height", rect.h.toString());
            image.setAttribute("width", rect.w.toString());
            image.setAttribute("x", rect.x1.toString());
            image.setAttribute("y", rect.y1.toString());
            image.setAttribute("transforn", `rotate(${booth.rotate} ${rect.cx} ${rect.cy})`);

            return image;
        });
}
