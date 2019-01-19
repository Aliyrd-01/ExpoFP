import Color from 'color';
import settings from '@/settings';
import { BoothDrawerBase } from './config-booths-base';
import { createCircleCanvas, createLabelCanvas, createDetailsCanvas } from './canvases';
import { getCurrentMatrixAndScale, subscribePtscaleChange } from './config-matrix';
import { requireUpdate } from './draw';

const dotCanvas = createCircleCanvas(1.5 * devicePixelRatio);
const dotW = dotCanvas.width / 2;
const dotH = dotCanvas.width / 2;

const prefixes = ['Dot', 'XS', 'S', 'M', 'Details'];

// const allDrawers: BoothLabelDrawer[] = [];

export default class BoothLabelDrawer extends BoothDrawerBase {
    private readonly factors: number[] = [];

    constructor(booth: Booth) {
        super(booth, 'booth-label');

        const r = this.booth.rect;

        this.drawer.addObject({
            id: this.getId("Dot"),
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotW, -dotH, dotW, dotH],
            canvasTmp: dotCanvas,
            texPosition: 'center',
            z: 0.8
        });

        this.addLabel(9, 'XS');
        this.addLabel(12, 'S');
        this.addLabel(14, 'M');

        const detailsCanvas = createDetailsCanvas(this.booth);

        this.drawer.addObject({
            id: this.getId("Details"),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [5, 5, -1, -1],
            canvasTmp: detailsCanvas,
            texPosition: 'lefttop',
            z: 0.8
        });

        this.calcFactors();
        // allDrawers.push(this);

        subscribePtscaleChange(()=> requireUpdate(this.updateBound));
    }

    calcFactors() {
        let lastFactor: number;
        const r = this.booth.rect;

        for (const p of prefixes.slice(0, prefixes.length - 1)) {
            const cr = this.drawer.getObject(this.getId(p)).canvasTmp;
            const xFactor = r.w / cr.width;
            const yFactor = r.h / cr.height;
            lastFactor = Math.min(xFactor, yFactor);
            this.factors.push(lastFactor);
        }

        this.factors.push(lastFactor / 1.5);
    }

    update() {
        let visiblePrefix = '';
        const { ptscale } = getCurrentMatrixAndScale();

        for (let i = 0; i < prefixes.length; i++) {
            const p = prefixes[i];
            const f = this.factors[i];
            if (ptscale < f) visiblePrefix = p;
        }

        for (const p of prefixes) {
            var obj = this.drawer.getObject(this.getId(p));
            if (!obj) debugger;
            this.drawer.updateVisible(this.getId(p), p === visiblePrefix);
        }
    }

    addLabel(fontSize: number, sizeName: string) {
        const b = this.booth;
        const r = b.rect;

        const canvas = createLabelCanvas(b.name, fontSize);
        const w = canvas.width / 2;
        const h = canvas.height / 2;

        this.drawer.addObject({
            id: this.getId(sizeName),
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-w, -h, w, h],
            canvasTmp: canvas,
            visible: false,
            texPosition: 'center',
            z: 0.8
        });
    }
}


// subscribePtscaleChange(() => {
//     allDrawers.forEach(d => d.updateVisibleLabel());
// });
// subscribe to scale changes
