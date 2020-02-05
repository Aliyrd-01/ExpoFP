import { TrianglePainterObject } from "../painters/TrianglePainter";

export function meshToTrianglePainterObjects(mesh: SvgMesh, color?: Vec4): TrianglePainterObject[] {
    // TODO: remove in future versions
    for (const p of mesh.positions) {
        // a bug in svgMesh3d when normalize: false ?
        p[1] = Math.abs(p[1]);
        p.length = 2;
    }

    return mesh.cells.map(c => ({
        p0: mesh.positions[c[0]],
        p1: mesh.positions[c[1]],
        p2: mesh.positions[c[2]],
        color
    }));
}
