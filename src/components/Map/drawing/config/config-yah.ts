import Color from "color";
import { getYah } from "../../../../utils/yah";
import { yahIcon, yahIconColor } from "../../../../utils/yah_icon";
import { DrawerContext } from "../Drawer1";
import TrianglePainter, { TrianglePainterObject } from "../painters/TrianglePainter";

export default function configYah(context: DrawerContext) {
    let drawer: TrianglePainter = null;
    let drawerSeq = 0;

    const yah = getYah();
    if (!!yah) {
        addYah(yah[0], yah[1], yah[2]);
    }

    function addYah(yahX: number, yahY: number, scale: number) {
        let yahmesh = yahIcon as any;
        const leftX = yahmesh.positions.reduce((cell, p) => (p[0] <= cell[0] ? p : cell), yahmesh.positions[0])[0];
        const topY = yahmesh.positions.reduce((cell, p) => (p[1] >= cell[1] ? p : cell), yahmesh.positions[0])[1];
        const basePoint = [leftX, topY];
        const yahcolor = Color(yahIconColor).vec4();

        const yahTriangles = meshToTrianglePainterObjects(yahmesh, yahcolor).map(
            (t) =>
                ({
                    p0: [scaleAndMove(t.p0[0], basePoint[0], yahX, scale), scaleAndMove(t.p0[1], basePoint[1], yahY, scale)],
                    p1: [scaleAndMove(t.p1[0], basePoint[0], yahX, scale), scaleAndMove(t.p1[1], basePoint[1], yahY, scale)],
                    p2: [scaleAndMove(t.p2[0], basePoint[0], yahX, scale), scaleAndMove(t.p2[1], basePoint[1], yahY, scale)],
                    color: t.color,
                } as TrianglePainterObject)
        );

        yahTriangles.forEach((x) => addObject(x));
    }

    function scaleAndMove(coord: number, basePoint: number, bias: number, scale: number): number {
        return (coord - basePoint) * scale + bias;
    }

    function addObject(item: TrianglePainterObject) {
        while (!drawer || !drawer.tryAddObject(item)) {
            drawer = context.requirePainter("YAH" + drawerSeq++, TrianglePainter, 160, true);
        }
    }

    function meshToTrianglePainterObjects(mesh: any, color?: Vec4): TrianglePainterObject[] {
        // if (!mesh.positions){
        //     debugger
        // }
        // TODO: remove in future versions
        for (const p of mesh.positions) {
            // a bug in svgMesh3d when normalize: false ?
            p[1] = Math.abs(p[1]);
            p.length = 2;
        }

        return mesh.cells.map((c) => ({
            p0: mesh.positions[c[0]],
            p1: mesh.positions[c[1]],
            p2: mesh.positions[c[2]],
            color,
        }));
    }

    return () => {};
}
