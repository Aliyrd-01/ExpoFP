import { select } from "d3";
import { getLayerSvg } from "../../../../data/svg";
import { DrawerContext } from "../Drawer1";
import ImagePainter, { DrawerObjectEx as DrawerObject } from "../painters/ImagePainter";

export default function configImg(context: DrawerContext, layerID: string, painterOrderPriority: number, visible: boolean) {
    let painter: ImagePainter = null;

    const images = select(getLayerSvg(layerID)).selectAll("[data-layer='FG'] image").nodes() as SVGImageElement[];

    images.forEach((image) => {
        const x = image.x.animVal.value;
        const y = image.y.animVal.value;
        const width = image.width.animVal.value;
        const height = image.height.animVal.value;
        const angle = image.transform?.animVal[0]?.angle;

        var img = new Image();
        img.onload = () => {
            addObject(`${x}${y}${width}${height}`, {
                center: [x, y],
                deltaPts: [0, 0, 0, 0],
                deltas: [0, 0, width, height],
                img, imgWidth: width, imgHeight: height,
                visible: true,
                texPosition: "center",
                stretch: true,
                rotateRadians: angle ? (angle * Math.PI / 180.0) : null
            });
        };
        img.crossOrigin = "";
        img.src = image.href.animVal;
    });

    function addObject(name: string, item: Partial<DrawerObject>) {
        if (!painter) painter = context.requirePainter(`image${name}`, ImagePainter, painterOrderPriority, visible);
        painter.addObject(item as DrawerObject);
    }
}

