import { select } from "d3";
import svg from "../../../../data/svg";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { DrawerObject } from "./../painters/RectPainter";
import { CanvasDescriptor } from "./canvases";

export default function configImg(context: DrawerContext) {
    let painter: RectPainter = null;

    const images = select(svg).selectAll("image").nodes() as SVGImageElement[];

    images.forEach((image) => {
        const x = image.x.animVal.value;
        const y = image.y.animVal.value;
        const width = image.width.animVal.value;
        const height = image.height.animVal.value;

        var img = new Image();
        img.onload = () => {
            addObject({
                center: [x + width / 2, y + height / 2],
                deltas: [-width / 2, -height / 2, width / 2, height / 2],
                canvasTmp: createImageCanvas(width, height, img),
                visible: true,
                texPosition: "center",
            });
        };
        img.src = image.href.animVal;
    });

    function addObject(item: DrawerObject) {
        if (!painter) painter = context.requirePainter("image", RectPainter, 120);
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
