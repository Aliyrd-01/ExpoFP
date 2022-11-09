import { DrawerContext } from "../Drawer1";
import ImagePainter, { DrawerObjectEx as DrawerObject } from "../painters/ImagePainter";

export default async function configImg(
    context: DrawerContext,
    layerID: string,
    images: SVGImageElement[],
    painterOrderPriority: number,
    visible: boolean
): Promise<HTMLImageElement[]> {
    let painter: ImagePainter = null;

    if (!images.length) return Promise.resolve([]);

    var promises = images.map(
        (image) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
                const x = image.x.animVal.value;
                const y = image.y.animVal.value;
                const width = image.width.animVal.value;
                const height = image.height.animVal.value;
                const angle = image.transform?.animVal[0]?.angle;

                var img = new Image();
                img.onerror = () => resolve(null);
                img.onload = () => {
                    addObject({
                        id: `${x}${y}${width}${height}`,
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
                    resolve(img);
                };

                img.crossOrigin = "";
                img.src = image.href.animVal;
            })
    );

    function addObject(item: Partial<DrawerObject>) {
        if (!painter) painter = context.requirePainter(layerID + ":images", ImagePainter, painterOrderPriority, visible);
        painter.addObject(item as DrawerObject);
    }

    return Promise.all(promises);
}
