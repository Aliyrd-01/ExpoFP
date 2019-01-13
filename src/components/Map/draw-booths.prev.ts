import * as twgl from 'twgl.js'
import Color from 'color';
import Drawer from './Drawer'
import { createLabelCanvas, createCircleCanvas, createDetailsCanvas } from './canvases';
import settings from '@/settings';
// import Sprite, { createTextCanvas, SpriteItem } from './sprite'

let drawer: Drawer;

export default function getDrawerConfigurers():Drawer{

}

function initialize(gl: WebGLRenderingContext) {
    drawer = new Drawer(gl);

    const booths = store.getters.boothsArray as Booth[];
    const borderColor = [1, 1, 1, 1] as Vec4;

    const dotCanvas = createCircleCanvas(1.5 * devicePixelRatio);
    const dotW = dotCanvas.width / 2;
    const dotH = dotCanvas.width / 2;

    const rotateRadians = 0;//15 * Math.PI / 180;

    function addLabel(b: Booth, fontSize: number, sizeName: string) {
        const r = b.rect;

        const canvas = createLabelCanvas(b.name, fontSize);
        const w = canvas.width / 2;
        const h = canvas.height / 2;

        drawer.addObject({
            id: `bLab${sizeName}${b.id}`,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-w, -h, w, h],
            canvasTmp: canvas,
            texPosition: 'center',
            order: 20, rotateRadians
        });
    }

    for (const b of booths) {
        const r = b.rect;

        // booths themselves
        drawer.addObject({
            id: `b${b.id}`,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [.5, .5, -.5, -.5],
            color: getBoothColor(b),
            order: 10, rotateRadians
        });

        // labels
        {
            // dots
            drawer.addObject({
                id: `bLabDot${b.id}`,
                center: [r.cx, r.cy],
                deltas: [0, 0, 0, 0],
                deltaPts: [-dotW, -dotH, dotW, dotH],
                canvasTmp: dotCanvas,
                texPosition: 'center',
                order: 20, rotateRadians
            });

            addLabel(b, 9, 'XS');
            addLabel(b, 12, 'S');
            addLabel(b, 14, 'M');


            const detailsCanvas = createDetailsCanvas(b);

            drawer.addObject({
                id: `bLabDetails${b.id}`,
                center: [r.cx, r.cy],
                deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
                deltaPts: [5, 5, -1, -1],
                canvasTmp: detailsCanvas,
                texPosition: 'lefttop',
                order: 20, rotateRadians
            });
        }

        // borders
        drawer.addObject({
            id: `bBorderT${b.id}`,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, -r.h / 2],
            deltaPts: [-.5, -.5, .5, .5],
            scalePts: devicePixelRatio,
            color: borderColor,
            order: 40, rotateRadians
        });
        drawer.addObject({
            id: `bBorderL${b.id}`,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, -r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-.5, -.5, .5, .5],
            color: borderColor,
            order: 40, rotateRadians
        });
        drawer.addObject({
            id: `bBorderB${b.id}`,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, r.h / 2, r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-.5, -.5, .5, .5],
            color: borderColor,
            order: 40, rotateRadians
        });
        drawer.addObject({
            id: `bBorderR${b.id}`,
            center: [r.cx, r.cy],
            deltas: [r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-.5, -.5, .5, .5],
            color: borderColor,
            order: 40, rotateRadians
        });
    }
}

// Dot, XS, S, M, L

// id to factors
const mapBoothFactors = new Map<number, number[]>();
const prefixes = ['Dot', 'XS', 'S', 'M', 'Details'];//, ];//, 'L'

function prepareBoothDetailsFactors() {
    if (mapBoothFactors.size) return;
    const booths = store.getters.boothsArray as Booth[];
    // we can convert svg to px and see how px fits
    for (const b of booths) {
        const r = b.rect;
        const ar = [];
        let lastFactor: number;
        for (const p of prefixes.slice(0, prefixes.length - 1)) {
            const cr = drawer.getObject(`bLab${p}${b.id}`).canvasTmp;
            const xFactor = r.w / cr.width;
            const yFactor = r.h / cr.height;
            lastFactor = Math.min(xFactor, yFactor);
            ar.push(lastFactor);
        }

        ar.push(lastFactor / 1.5);

        mapBoothFactors.set(b.id, ar);
    }
}

let prevPtscale: number;

function updateVisibleDetails(ptscale: number) {
    if (prevPtscale === ptscale) return;
    prevPtscale = ptscale;
    const booths = store.getters.boothsArray as Booth[];
    for (const b of booths) {
        let visiblePrefix = '';
        const ff = mapBoothFactors.get(b.id);

        for (let i = 0; i < prefixes.length; i++) {
            const p = prefixes[i];
            const f = ff[i];
            if (ptscale < f) visiblePrefix = p;
        }

        for (const p of prefixes) {
            drawer.updateVisible(`bLab${p}${b.id}`, p === visiblePrefix);
        }
    }
}

const boothColorsToHandle = new Set<number>();
function updateBoothColors() {
    // avoid using TS downlevel iterations
    for (const id of Array.from(boothColorsToHandle)) {
        const color = getBoothColor(store.state.booths[id]);
        drawer.updateColor(`b${id}`, color);
    }
}

export function drawBooths(gl: WebGLRenderingContext, u_matrix: any, ptscale: number) {
    // draw booths there 
    if (!drawer || drawer.gl !== gl) initialize(gl);
    prepareBoothDetailsFactors();

    updateVisibleDetails(ptscale);
    updateBoothColors();

    drawer.draw(u_matrix, ptscale);
}

function getBoothState(b: Booth) {
    const g = store.getters;

    const hover = g.hoveredBoothIds.indexOf(b.id) !== -1;
    const selected = !!g.selectedBoothIdsSet.has(b.id);
    const inList = g.listBoothsIdsSet.has(b.id);
    const dimmedFp = g.dimmed;
    const dimmed = dimmedFp && !inList && !selected;

    const empty = b.exhibitors.length === 0;
    const error = !!b.error;
    const bookmarked = b.exhibitors.find(e => store.state.bookmarked[e])
    return { hover, selected, dimmed, dimmedFp, error, empty, bookmarked };
}

// todo: profile&cache getting 
function getBoothColor(b: Booth): Vec4 {
    const s = getBoothState(b);
    let color:Color;
     
    if (s.selected) color = Color(settings.colors.booths.selected);
    else color = Color(settings.colors.booths.default);
    
    if (s.hover){
        color = color.darken(0.2);
    }

    // if (s.selected){
    //     console.log('settings.colors.booths.selected', settings.colors.booths.selected, color.toString());
    //     debugger
    // }

    return ColorInfo.fromHex(color.hex()).toVec4();
}

store.watch(((s, g) => g.hoveredBoothIds) as any, (v: number[], oldV: number[]) => {
    handleBoothSetsDifference(new Set(v), new Set(oldV));
});


store.watch(((s, g) => g.selectedBoothIdsSet) as any, (v: Set<number>, oldV: Set<number>) => {
    handleBoothSetsDifference(v, oldV);
});


function handleBoothSetsDifference(v: Set<number>, oldV: Set<number>) {
    const newElements = Array.from(v).filter(x => !oldV.has(x));
    const missingElements = Array.from(oldV).filter(x => !v.has(x));

    newElements.forEach(x => boothColorsToHandle.add(x));
    missingElements.forEach(x => boothColorsToHandle.add(x));

    // may be later -> call require-redraw
}
