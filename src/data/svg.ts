import logger from "../tools/logger";
import * as d3 from "d3-selection";
import settings from "../tools/settings";
import Rect from "../core/Rect";
import Size from "../core/Size";

function parseSvg(text: string) {
    const parser = new DOMParser();
    return (parser.parseFromString(text, "image/svg+xml").documentElement as any) as SVGElement;
}

//if (typeof __fpBorderWidth === "undefined") window["__fpBorderWidth"] = 2;
// TODO: make it a conta
// window["__fpBorderWidth"] = 2

//const overrideSvg = localStorage.getItem('overrideSvg');

let svg = parseSvg(window["__fp"]); //overrideSvg ||
if ((svg.firstChild as Element).tagName === "parsererror") {
    logger.error("Parsed svg with error: ", svg);
    // if (overrideSvg) {
    //     alert('FP SVG error, see console');
    //     svg = parseSvg(__fp);
    // }
}

// prepare map of fill colors per class
const classFill = new Map<string, string>();
d3.select(svg)
    .selectAll("style")
    .each(function() {
        const css = (this as any).textContent as string;
        const r = /\.([a-z0-9.]+)\s*{[^}]*fill\s*:\s*([^};]+);[^}]*}/gi;
        let m: string[];
        while ((m = r.exec(css)) !== null) {
            const cls = m[1],
                fill = m[2];
            classFill.set(cls, fill);
        }
    });

// set fill attrs for elements having class attrs
d3.select(svg)
    .selectAll("*[class]")
    .each(function() {
        const el = this as SVGGraphicsElement;
        el.style.fill = classFill.get(el.className.baseVal);
    });

const viewBox = (svg as any).viewBox;
const svgWidth = viewBox.baseVal.width as number;
const svgHeight = viewBox.baseVal.height as number;

let svgArea: Rect;

// let svgVisibleWidth = svgWidth;
// let svgVisibleHeight = svgHeight;
// let svgCenterX = svgWidth / 2;
// let svgCenterY = svgHeight / 2;

if (settings.EXPO === "eventtechlive2019") {
    const center = [3173, 1987];
    const size = [1024, 873];
    svgArea = Rect.fromCxcywh(center[0], center[1], size[0], size[1]);
    // svgCenterX = center[0];
    // svgCenterY = center[1];
    // svgVisibleHeight = size[0] * 0.75;
    // svgVisibleWidth = size[1];
} else if (settings.EXPO === "latintyrepartsexpo") {
    const k = 12000 / 8192;
    const ky = 8920 / 6296;
    const center = [5123, 3220];
    const size = [1348, 888];
    // svgCenterX = center[0] * k;
    // svgCenterY = center[1] * ky;
    // svgVisibleHeight = size[0] * ky * 0.75;
    // svgVisibleWidth = size[1] * k;
    svgArea = Rect.fromCxcywh(center[0] * k, center[1] * ky, size[0] * ky, size[1] * k);
} else {
    svgArea = Rect.fromXywh(0, 0, svgWidth, svgHeight).withPadding(-svgWidth * 0.05, -svgHeight * 0.05);
}

export { svgArea };
export const svgSize = new Size(svgWidth, svgHeight);
// export let svgVisibleWidth;

d3.select(svg).attr("width", svgWidth);
d3.select(svg).attr("height", svgHeight);

window["__svg"] = svg;

export default svg;

declare const __fp: string;
declare const __fpPaths: { [id: string]: any };
