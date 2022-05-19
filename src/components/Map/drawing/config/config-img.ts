import { select } from "d3";
import svg from "../../../../data/svg";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { DrawerObject } from "./../painters/RectPainter";
import { CanvasDescriptor } from "./canvases";

export default function configImg(context: DrawerContext, painterOrderPriority: number, visible: boolean) {
    let painter: RectPainter = null;

    const images = select(svg).selectAll("[data-layer='FG'] image").nodes() as SVGImageElement[];

    images.forEach((image) => {
        const x = image.x.animVal.value;
        const y = image.y.animVal.value;
        const width = image.width.animVal.value;
        const height = image.height.animVal.value;

        var img = new Image();
        img.onload = () => {
            addObject(`${x}${y}${width}${height}`, {
                center: [x + width / 2, y + height / 2],
                deltaPts: [0, 0, 0, 0],
                deltas: [-width / 2, -height / 2, width / 2, height / 2],
                canvasTmp: createImageCanvas(width, height, img),
                visible: true,
                texPosition: "center",
                stretch: true,
            });
        };
        img.src = image.href.animVal;
    });

    function addObject(name: string, item: DrawerObject) {
        if (!painter) painter = context.requirePainter(`image${name}`, RectPainter, painterOrderPriority, visible);
        painter.addObject(item);
    }
}

function createImageCanvas(width: number, height: number, image: HTMLImageElement): CanvasDescriptor {
    return {
        width,
        height,
        draw(c: CanvasRenderingContext2D) {
            c.drawImage(image, 0, 0, width, height);
        },
    };
}
