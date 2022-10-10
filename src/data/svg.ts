import * as d3 from "d3-selection";
import data from ".";
import Rect from "../core/Rect";
import logger from "../tools/logger";
import settings from "../tools/settings";

const _svg = new Map<string, SVGElement>();

function parseSvg(text: string, suffix: string = ""): SVGElement {
    const parser = new DOMParser();
    const element = parser.parseFromString(text, "image/svg+xml").documentElement as any as SVGElement;

    if ((element.firstChild as Element).tagName === "parsererror") logger.error("Parsed svg with error: ", svg);

    // prepare map of fill colors per class
    const classFill = new Map<string, string>();
    d3.select(element)
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
    d3.select(element)
        .selectAll("*[class]")
        .each(function () {
            const el = this as SVGGraphicsElement;
            el.style.fill = classFill.get(el.className.baseVal);
        });

    _svg.set(suffix, element);
    return element;
}

let svg = parseSvg(window["__fp"]);

const viewboxRect = d3.select(svg).select("rect#VIEWBOX").node() as SVGRectElement;
const viewBoxBaseVal = (svg as any).viewBox.baseVal;
const svgViewBox = Rect.fromXywh(viewBoxBaseVal.x, viewBoxBaseVal.y, viewBoxBaseVal.width, viewBoxBaseVal.height);

let svgArea: Rect;
if (viewboxRect) {
    svgArea = Rect.fromSvgRectElement(viewboxRect);
    viewboxRect.remove();
} else {
    svgArea = svgViewBox.withPadding(-svgViewBox.w * 0.05, -svgViewBox.h * 0.05);
}

d3.select(svg).attr("width", svgViewBox.w);
d3.select(svg).attr("height", svgViewBox.h);

logger.log("svgArea", svgArea, "svgViewBox", svgViewBox);

settings.wayfinding = !data.hideDirections && window["__wfData"] ? true : false;

let floors = (d3.select(svg).selectAll("[data-floor]").nodes() as SVGRectElement[])
    .map((f) => {
        f.remove();
        return {
            name: f.dataset.floor,
            rect: Rect.fromSvgRectElement(f),
        };
    })
    .sort();

export { svgArea, svgViewBox, floors };

export let gtePathByIndex = (index: number, suffix: string = "") => {
    try {
        return window[`__fpPaths${suffix}`][index];
    } catch (e) {
        return window["__fpPaths"][index];
    }
};

export let getLayerSvg = (suffix: string = ""): SVGElement => {
    if (_svg.has(suffix)) return _svg.get(suffix);
    if (window[`__fp${suffix}`]) return parseSvg(window[`__fp${suffix}`], suffix);
    else return _svg.get("");
};
