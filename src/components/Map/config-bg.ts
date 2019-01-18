import Color from 'color';
import { requireDrawer, requireUpdate } from "./draw";
import TriangleDrawer, { TriangleDrawerObject } from "./TriangleDrawer";
import settings from '@/settings';
import svg from '@/tools/svg'
// import svgMesh3d from 'svg-mesh-3d';

export default function configBg() {
    const drawer = requireDrawer('bg', TriangleDrawer);

    // const color1 = [0, 0, 0, 0.5] as Vec4;
    const paths = (d3.select(svg).select('#BG').selectAll('path').nodes() as SVGPathElement[]);

    for (const p of paths) {
        const d = parseInt(p.getAttribute('data-index'));
        const color = ColorInfo.fromHex(Color(p.style.fill).hex()).toVec4();

        const mesh = __fpPaths[d];
        //var mesh = svgMesh3d(d, { normalize: false, scale: 8 });
        for (const p of mesh.positions) {
            // a bug in svgMesh3d when normalize: false ?
            p[1] = -p[1];
            p.length = 2;
        }
        for (const c of mesh.cells) {

            drawer.addObject({
                p0: mesh.positions[c[0]],
                p1: mesh.positions[c[1]],
                p2: mesh.positions[c[2]],
                color
            });

        }
    }

    const rects = (d3.select(svg).select('#BG').selectAll('rect').nodes() as SVGRectElement[]);

    // const color = ColorInfo.fromHex(settings.colors.bg).toVec4();
    for (const ro of rects) {
        const r = Rect.fromSvgRectElement(ro);
        const color = ColorInfo.fromHex(Color(ro.style.fill).hex()).toVec4();


        drawer.addObject({
            p0: [r.x1, r.y1],
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            color
        });
        drawer.addObject({
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            p0: [r.x2, r.y2],
            color
        });
    }

    drawer.alpha = 0;

    function startAnimating() {
        const start = performance.now();
        const duration = 300;
        const i = d3.interpolateNumber(0, 1);
        function animationStep() {
            const part = (performance.now() - start) / duration;
            
            if (part >= 1) {
                drawer.alpha = 1;
            } else {
                drawer.alpha = i(part);
                requireUpdate(animationStep);
            }
            console.log('Bg animation', part, drawer.alpha);
        }
        requireUpdate(animationStep);

    }
    window.setTimeout(() => requireUpdate(startAnimating), 1);

};





