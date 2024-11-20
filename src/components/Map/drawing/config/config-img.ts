import { Img } from "../../../../utils/imageloader";
import { DrawerContext } from "../Drawer1";
import ImagePainter, { DrawerObjectEx as DrawerObject } from "../painters/ImagePainter";

export default function configImg(
    context: DrawerContext,
    layerID: string,
    images: Img[],
    painterOrderPriority: number,
    visible: boolean
): void {
    let painter: ImagePainter = null;
    if (!images.length) return;

    images
        .filter((img) => !!img)
        .forEach((boothImage: Img) => {
            const x = boothImage.bounds.x;
            const y = boothImage.bounds.y;
            const width = boothImage.bounds.width;
            const height = boothImage.bounds.height;
            const angle = boothImage.bounds.angle;

            var img = boothImage.htmlImage;

            addObject({
                // id: `${x}${y}${width}${height}`,
                id: boothImage.booth.id.toString(),
                center: [x + width / 2, y + height / 2],
                deltas: [-width / 2, -height / 2, width / 2, height / 2],
                deltaPts: [0, 0, 0, 0],
                img,
                imgWidth: width,
                imgHeight: height,
                texPosition: "center",
                stretch: true,
                rotateRadians: angle ? (-angle * Math.PI) / 180.0 : null,
            });
        });

    function addObject(item: Partial<DrawerObject>) {
        if (!painter) painter = context.requirePainter(layerID + ":IMAGES", ImagePainter, painterOrderPriority, visible);
        painter.addObject(item as DrawerObject);
    }
}
