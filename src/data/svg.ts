import * as d3 from "d3-selection";
import data from ".";
import Rect from "../core/Rect";
import logger from "../tools/logger";
import settings from "../tools/settings";

function parseSvg(text: string) {
    const parser = new DOMParser();
    return parser.parseFromString(text, "image/svg+xml").documentElement as any as SVGElement;
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
    .each(function () {
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
    .each(function () {
        const el = this as SVGGraphicsElement;
        el.style.fill = classFill.get(el.className.baseVal);
    });

const viewBoxBaseVal = (svg as any).viewBox.baseVal;
const svgViewBox = Rect.fromXywh(viewBoxBaseVal.x, viewBoxBaseVal.y, viewBoxBaseVal.width, viewBoxBaseVal.height);

settings.wayfinding = !data.hideDirections && d3.select(svg).select('[data-layer^="WF"]>path').node() ? true : false;

let svgArea: Rect;

let floors = (d3.select(svg).selectAll("[data-floor]").nodes() as SVGRectElement[])
    .map((f) => {
        f.remove();
        return {
            name: f.dataset.floor,
            rect: Rect.fromSvgRectElement(f),
        };
    })
    .sort();

if (settings.EXPO === "all-energy") floors.reverse();
if (settings.EXPO === "spoga-gafa") data.boothTerm = "";

const viewboxRect = d3.select(svg).select("rect#VIEWBOX").node() as SVGRectElement;

if (viewboxRect) {
    svgArea = Rect.fromSvgRectElement(viewboxRect);
    viewboxRect.remove();
} else if (settings.EXPO === "eventtechlive2019" || settings.EXPO === "eventtechlive2020" || settings.EXPO === "eventscase") {
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
    const center = [5120, 3270];
    const size = [1648, 888];
    // svgCenterX = center[0] * k;
    // svgCenterY = center[1] * ky;
    // svgVisibleHeight = size[0] * ky * 0.75;
    // svgVisibleWidth = size[1] * k;
    svgArea = Rect.fromCxcywh(center[0] * k, center[1] * ky, size[0] * ky, size[1] * k);
} else {
    svgArea = svgViewBox.withPadding(-svgViewBox.w * 0.05, -svgViewBox.h * 0.05);
}

logger.log("svgArea", svgArea, "svgViewBox", svgViewBox);

export { svgArea, svgViewBox, floors };
// export const svgSize = new Size(svgViewBox.w, svgViewBox.h);
// export let svgVisibleWidth;

d3.select(svg).attr("width", svgViewBox.w);
d3.select(svg).attr("height", svgViewBox.h);

window["__svg"] = svg;

export default svg;

declare const __fp: string;
declare const __fpPaths: { [id: string]: any };
